using RubyApi.Services;
using RubyApi.Models;
using System.ComponentModel.DataAnnotations;

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
    ("Risk puanı maksimum on ile sınırlıdır", () =>
    {
        var sonuc = servis.AnalizEt(
            "ACİL şifrenizi ve CVV kodunu hemen gönderin. Sayın kullanıcı, " +
            "ekli .exe dosyasını açın: http://192.168.1.1/a-1234567890123456789012345678901234567890");
        Esit(10, sonuc.RiskPuani);
    }),
    ("Şüpheli ek dosya tespit edilir", () =>
    {
        var sonuc = servis.AnalizEt("Fatura ektedir: odeme.iso");
        Icerir(sonuc.BulunanRiskler, "Şüpheli ek dosya");
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
