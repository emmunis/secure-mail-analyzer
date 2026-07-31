using RubyApi.Services;
using RubyApi.Models;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

var servis = new AnalizServisi();
var testler = new (string Ad, Action Calistir)[]
{
    ("Güvenli içerik düşük risk döndürür", () =>
    {
        var sonuc = servis.AnalizEt("Toplantı notları https://www.microsoft.com");
        Esit("Düşük", sonuc.Seviye);
        Esit(0, sonuc.RiskPuani);
    }),
    ("Aciliyet ve parola talebi yüksek risk üretir", () =>
    {
        var sonuc = servis.AnalizEt("ACİL: Şifrenizi hemen doğrulayın.");
        Esit("Yüksek", sonuc.Seviye);
        Icerir(sonuc.BulunanRiskler, "Aciliyet");
        Icerir(sonuc.BulunanRiskler, "Kişisel veri");
    }),
    ("İçerikteki bütün bağlantılar incelenir", () =>
    {
        var sonuc = servis.AnalizEt(
            "Önce https://example.com ardından http://guvenli-degil.example bağlantısını açın.");
        Icerir(sonuc.BulunanRiskler, "HTTPS kullanmıyor");
    }),
    ("Link kısaltıcı tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt("Detaylar: https://bit.ly/ornek");
        Icerir(sonuc.BulunanRiskler, "Link kısaltıcı");
    }),
    ("IP adresine giden bağlantı tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt("http://192.168.10.25/giris");
        Icerir(sonuc.BulunanRiskler, "IP adresine");
        Icermez(sonuc.BulunanRiskler, "Domain yapısı");
        Esit(10, sonuc.RiskPuani);
    }),
    ("HTML link metni ve hedef uyuşmazlığı tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt(
            """<a href="https://saldirgan.example/giris">https://www.paypal.com</a>""");
        Icerir(sonuc.BulunanRiskler, "gerçek hedef adresiyle eşleşmiyor");
    }),
    ("Markdown link metni ve hedef uyuşmazlığı tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt(
            "[https://www.microsoft.com](https://microsoft-login.example)");
        Icerir(sonuc.BulunanRiskler, "gerçek hedef adresiyle eşleşmiyor");
    }),
    ("Resmi marka domaini taklit olarak işaretlenmez", () =>
    {
        var sonuc = servis.AnalizEt("Microsoft duyurusu: https://support.microsoft.com/help");
        Icermez(sonuc.BulunanRiskler, "resmi domainle eşleşmiyor");
    }),
    ("Sahte marka domaini tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt("PayPal hesabınız: https://paypal-login.example");
        Icerir(sonuc.BulunanRiskler, "resmi domainle eşleşmiyor");
    }),
    ("Aynı risk açıklaması tekrarlanmaz", () =>
    {
        var sonuc = servis.AnalizEt("http://example.com ve http://example.org");
        Esit(1, KacKezGeciyor(sonuc.BulunanRiskler, "Link HTTPS kullanmıyor"));
    }),
    ("Risk puanı maksimum kırk ile sınırlıdır", () =>
    {
        var sonuc = servis.AnalizEt(
            "ACİL PayPal şifrenizi ve CVV kodunu hemen gönderin. Sayın kullanıcı, " +
            "ekli .exe dosyasını açın: http://192.168.1.1/a-1234567890123456789012345678901234567890");
        Esit(40, sonuc.RiskPuani);
    }),
    ("Şüpheli ek dosya tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt("Fatura ektedir: odeme.iso");
        Icerir(sonuc.BulunanRiskler, "Şüpheli ek dosya");
    }),
    ("Tek başına genel hitap düşük riskte kalır", () =>
    {
        var sonuc = servis.AnalizEt("Sayın kullanıcı, aylık bilgilendirme metniniz hazırlanmıştır.");
        Esit(2, sonuc.RiskPuani);
        Esit("Düşük", sonuc.Seviye);
    }),
    ("Link kısaltıcı orta risk üretir", () =>
    {
        var sonuc = servis.AnalizEt("Belge bağlantısı: https://bit.ly/ornek");
        Esit(6, sonuc.RiskPuani);
        Esit("Orta", sonuc.Seviye);

        sonuc = servis.AnalizEt("Sayın kullanıcı, belge bağlantısı: https://bit.ly/ornek");
        Esit(8, sonuc.RiskPuani);
        Esit("Orta", sonuc.Seviye);
    }),
    ("Kimlik bilgisi isteyen IP bağlantısı yüksek risk üretir", () =>
    {
        var sonuc = servis.AnalizEt(
            "ACİL: Sayın kullanıcı, parolanızı http://192.168.1.45/login adresinde doğrulayın.");
        Esit("Yüksek", sonuc.Seviye);
        Esit(true, sonuc.RiskPuani >= 15);
        Icerir(sonuc.BulunanRiskler, "Kişisel veri");
        Icerir(sonuc.BulunanRiskler, "IP adresine");
    }),
    ("Risk puanı detaylarının toplamı genel puanla eşleşir", () =>
    {
        var sonuc = servis.AnalizEt(
            "ACİL PayPal şifrenizi ve CVV kodunu hemen gönderin. Sayın kullanıcı, " +
            "ekli .exe dosyasını açın: http://192.168.1.1/a-1234567890123456789012345678901234567890");
        var detayToplami = sonuc.RiskPuanDetaylari.Split(" | ").Sum(int.Parse);
        Esit(sonuc.RiskPuani, detayToplami);
    }),
    ("Sahte banka mesajı finansal dolandırıcılık olarak yorumlanır", () =>
    {
        var kuralSonucu = servis.AnalizEt(
            "Sayın kullanıcı, kredi kartınızdan 24.750 TL ödeme yapılmıştır. Hemen " +
            "https://ziraat-bankasi-guvenlik.xyz/iptal adresinde kart numaranızı ve SMS kodunuzu doğrulayın.");
        Esit("Yüksek", kuralSonucu.Seviye);

        const string responseBody = """
            {"message":{"content":"{\"senaryo\":\"Kimlik bilgisi avı\",\"etki\":\"Hesap ele geçirme\"}"}}
            """;
        var handler = new SahteHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
        });
        var sonuc = LlmServisiOlustur(handler).YorumlaAsync(
            kuralSonucu.Icerik,
            kuralSonucu,
            CancellationToken.None).GetAwaiter().GetResult();

        Icerir(sonuc?.Aciklama ?? "", "finansal dolandırıcılık");
        Icerir(sonuc?.Aciklama ?? "", "maddi kayıp");
    }),
    ("Parola isteyen IP bağlantısı LLM hatasına rağmen kimlik avı olarak yorumlanır", () =>
    {
        var kuralSonucu = servis.AnalizEt(
            "ACİL: Sayın kullanıcı, parolanızı http://192.168.1.45/login adresinde hemen doğrulayın.");
        Esit(27, kuralSonucu.RiskPuani);

        const string responseBody = """
            {"message":{"content":"{\"senaryo\":\"Finansal dolandırıcılık\",\"etki\":\"Maddi kayıp\"}"}}
            """;
        var handler = new SahteHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
        });
        var sonuc = LlmServisiOlustur(handler).YorumlaAsync(
            kuralSonucu.Icerik,
            kuralSonucu,
            CancellationToken.None).GetAwaiter().GetResult();

        Icerir(sonuc?.Aciklama ?? "", "kimlik bilgisi avı");
        Icerir(sonuc?.Aciklama ?? "", "hesap ele geçirme");
        Icermez(sonuc?.Aciklama ?? "", "finansal dolandırıcılık");
    }),
    ("İcra baskısı ve çalıştırılabilir ek yüksek risk üretir", () =>
    {
        var sonuc = servis.AnalizEt(
            "Sayın kullanıcı, hakkınızda icra işlemi başlatıldı. Ekteki fatura.exe dosyasını hemen çalıştırın: https://bit.ly/belge");
        Esit("Yüksek", sonuc.Seviye);
        Icerir(sonuc.BulunanRiskler, "Şüpheli ek dosya");
        Icerir(sonuc.BulunanRiskler, "Link kısaltıcı");
    }),
    ("Boş analiz isteği doğrulamadan geçmez", () =>
    {
        Gecersiz(new AnalizIstek { Icerik = "" });
    }),
    ("Yirmi bin karakteri aşan analiz isteği reddedilir", () =>
    {
        Gecersiz(new AnalizIstek { Icerik = new string('a', 20_001) });
    }),
    ("Geçerli analiz isteği doğrulamadan geçer", () =>
    {
        Gecerli(new AnalizIstek { Icerik = "Örnek analiz içeriği" });
    }),
    ("LLM seçeneği varsayılan olarak açıktır", () =>
    {
        Esit(true, new AnalizIstek().LlmIleYorumla);
    }),
    ("Ollama yapılandırmadan kapatıldığında çağrı yapılmaz", () =>
    {
        var handler = new SahteHttpHandler(_ => throw new InvalidOperationException("HTTP çağrısı beklenmiyordu."));
        var llmServisi = LlmServisiOlustur(handler, enabled: false);
        var sonuc = llmServisi.YorumlaAsync(
            "örnek içerik",
            KuralSonucu(),
            CancellationToken.None).GetAwaiter().GetResult();

        Esit<LlmAnalizSonucu?>(null, sonuc);
        Esit(0, handler.CagriSayisi);
    }),
    ("Ollama yapılandırılmış JSON yanıtını ayrıştırır", () =>
    {
        const string responseBody = """
            {"message":{"content":"{\"senaryo\":\"Kimlik bilgisi avı\",\"etki\":\"Hesap ele geçirme\"}"}}
            """;
        var handler = new SahteHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(responseBody, Encoding.UTF8, "application/json")
        });
        var llmServisi = LlmServisiOlustur(handler);
        var sonuc = llmServisi.YorumlaAsync(
            "örnek içerik",
            KuralSonucu(),
            CancellationToken.None).GetAwaiter().GetResult();

        Icerir(sonuc?.Aciklama ?? "", "kimlik bilgisi avı");
        Icerir(sonuc?.Aciklama ?? "", "hesap ele geçirme");
        Esit(2, sonuc?.Oneriler.Count);
    }),
    ("Ollama HTTP hatasında kural sonucuna geri döner", () =>
    {
        var handler = new SahteHttpHandler(_ => new HttpResponseMessage(HttpStatusCode.ServiceUnavailable));
        var llmServisi = LlmServisiOlustur(handler);
        var sonuc = llmServisi.YorumlaAsync(
            "örnek içerik",
            KuralSonucu(),
            CancellationToken.None).GetAwaiter().GetResult();

        Esit<LlmAnalizSonucu?>(null, sonuc);
    }),
    ("Boş admin parolası doğrulamadan geçmez", () =>
    {
        Gecersiz(new AdminGirisIstek { Sifre = "" });
    })
};

var basarili = 0;
var hatalar = new List<string>();

foreach (var (ad, calistir) in testler)
{
    try
    {
        calistir();
        basarili++;
        Console.WriteLine($"[GEÇTİ] {ad}");
    }
    catch (Exception exception)
    {
        hatalar.Add($"{ad}: {exception.Message}");
        Console.WriteLine($"[HATA] {ad}");
    }
}

Console.WriteLine();
Console.WriteLine($"Sonuç: {basarili}/{testler.Length} test geçti.");

if (hatalar.Count > 0)
{
    foreach (var hata in hatalar)
        Console.Error.WriteLine(hata);

    return 1;
}

return 0;

static void Esit<T>(T beklenen, T gercek)
{
    if (!EqualityComparer<T>.Default.Equals(beklenen, gercek))
        throw new InvalidOperationException($"Beklenen: {beklenen}; gerçek: {gercek}");
}

static void Icerir(string metin, string aranan)
{
    if (!metin.Contains(aranan, StringComparison.Ordinal))
        throw new InvalidOperationException($"\"{aranan}\" bulunamadı. Gerçek: {metin}");
}

static void Icermez(string metin, string aranan)
{
    if (metin.Contains(aranan, StringComparison.Ordinal))
        throw new InvalidOperationException($"\"{aranan}\" beklenmiyordu. Gerçek: {metin}");
}

static int KacKezGeciyor(string metin, string aranan)
{
    var sayi = 0;
    var baslangic = 0;

    while ((baslangic = metin.IndexOf(aranan, baslangic, StringComparison.Ordinal)) >= 0)
    {
        sayi++;
        baslangic += aranan.Length;
    }

    return sayi;
}

static void Gecersiz(object model)
{
    var sonuclar = new List<ValidationResult>();
    var gecerli = Validator.TryValidateObject(
        model,
        new ValidationContext(model),
        sonuclar,
        validateAllProperties: true);

    if (gecerli)
        throw new InvalidOperationException("Modelin geçersiz olması bekleniyordu.");
}

static void Gecerli(object model)
{
    var sonuclar = new List<ValidationResult>();
    var gecerli = Validator.TryValidateObject(
        model,
        new ValidationContext(model),
        sonuclar,
        validateAllProperties: true);

    if (!gecerli)
        throw new InvalidOperationException(string.Join(", ", sonuclar.Select(x => x.ErrorMessage)));
}

static OllamaAnalizServisi LlmServisiOlustur(SahteHttpHandler handler, bool enabled = true)
{
    var configuration = new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Ollama:Enabled"] = enabled.ToString(),
            ["Ollama:Model"] = "qwen3:1.7b"
        })
        .Build();
    var httpClient = new HttpClient(handler)
    {
        BaseAddress = new Uri("http://ollama.test/")
    };

    return new OllamaAnalizServisi(
        httpClient,
        configuration,
        NullLogger<OllamaAnalizServisi>.Instance);
}

static AnalizKaydi KuralSonucu() => new()
{
    Seviye = "Orta",
    RiskPuani = 5,
    BulunanRiskler = "Şüpheli bağlantı"
};

sealed class SahteHttpHandler(Func<HttpRequestMessage, HttpResponseMessage> cevapla) : HttpMessageHandler
{
    public int CagriSayisi { get; private set; }

    protected override Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        CagriSayisi++;
        return Task.FromResult(cevapla(request));
    }
}
