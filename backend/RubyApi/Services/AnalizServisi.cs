using System.Net;
using System.Text.RegularExpressions;
using RubyApi.Models;

namespace RubyApi.Services;

public class AnalizServisi
{
    private const int MaksimumRiskPuani = 10;

    private static readonly Regex UrlRegex = new(
        @"(?:https?://|www\.)[^\s<>'""]+",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly Regex HtmlLinkRegex = new(
        @"<a\b[^>]*\bhref\s*=\s*[""'](?<hedef>[^""']+)[""'][^>]*>(?<metin>.*?)</a>",
        RegexOptions.IgnoreCase | RegexOptions.Singleline | RegexOptions.Compiled);

    private static readonly Regex MarkdownLinkRegex = new(
        @"\[(?<metin>[^\]]+)\]\((?<hedef>https?://[^)\s]+)\)",
        RegexOptions.IgnoreCase | RegexOptions.Compiled);

    private static readonly IReadOnlyDictionary<string, string[]> MarkaDomainleri =
        new Dictionary<string, string[]>
        {
            ["paypal"] = ["paypal.com"],
            ["garanti"] = ["garanti.com.tr"],
            ["ziraat"] = ["ziraatbank.com.tr"],
            ["apple"] = ["apple.com"],
            ["microsoft"] = ["microsoft.com"],
            ["trendyol"] = ["trendyol.com"],
            ["google"] = ["google.com"],
            ["amazon"] = ["amazon.com", "amazon.com.tr"],
            ["netflix"] = ["netflix.com"]
        };

    private static readonly HashSet<string> LinkKisalticilar =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "bit.ly", "tinyurl.com", "t.co", "cutt.ly", "shorturl.at",
            "is.gd", "buff.ly", "ow.ly", "rebrand.ly"
        };

    public AnalizKaydi AnalizEt(string icerik)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(icerik);

        var riskPuani = 0;
        var bulunanRiskler = new List<string>();
        var eklenenRiskler = new HashSet<string>(StringComparer.Ordinal);
        var metin = icerik.ToLowerInvariant();

        void RiskEkle(string aciklama, int puan)
        {
            if (!eklenenRiskler.Add(aciklama))
                return;

            bulunanRiskler.Add(aciklama);
            riskPuani = Math.Min(MaksimumRiskPuani, riskPuani + puan);
        }

        var aciliyetKelimeleri = new[]
        {
            "hemen", "acil", "şimdi tıklayın", "son gün", "24 saat",
            "hesabınız kapatılacak", "son uyarı", "derhal", "askıya alınacak"
        };
        if (aciliyetKelimeleri.Any(metin.Contains))
            RiskEkle("Aciliyet veya baskı dili tespit edildi", 2);

        var veriKelimeleri = new[]
        {
            "şifrenizi", "şifre", "kart numarası", "tc kimlik",
            "hesap bilgileriniz", "cvv", "doğrulama kodu", "tek kullanımlık kod"
        };
        if (veriKelimeleri.Any(metin.Contains))
            RiskEkle("Kişisel veri veya ödeme bilgisi talebi tespit edildi", 3);

        var uriler = UrlRegex.Matches(icerik)
            .Select(match => LinkiTemizle(match.Value))
            .Select(UriOlustur)
            .Where(uri => uri is not null)
            .Cast<Uri>()
            .DistinctBy(uri => uri.AbsoluteUri, StringComparer.OrdinalIgnoreCase)
            .ToList();

        foreach (var uri in uriler)
        {
            var host = uri.IdnHost.TrimEnd('.').ToLowerInvariant();

            if (!uri.Scheme.Equals(Uri.UriSchemeHttps, StringComparison.OrdinalIgnoreCase))
                RiskEkle("Link HTTPS kullanmıyor", 1);

            if (uri.AbsoluteUri.Length > 100)
                RiskEkle("Link uzunluğu şüpheli derecede fazla", 1);

            if (LinkKisalticilar.Any(k => DomainEslesiyor(host, k)))
                RiskEkle("Link kısaltıcı servis kullanılmış", 2);

            if (IPAddress.TryParse(host, out _))
                RiskEkle("Bağlantı bir domain yerine doğrudan IP adresine yönlendiriyor", 3);

            var karmasikKarakterSayisi = host.Count(c => c == '-' || char.IsDigit(c));
            var uzunEtiketVar = host.Split('.').Any(label => label.Length > 30);
            if (karmasikKarakterSayisi >= 5 || host.Length > 45 || uzunEtiketVar)
                RiskEkle("Domain yapısı olağandışı uzun veya karmaşık", 1);

            if (host.Contains("xn--", StringComparison.OrdinalIgnoreCase))
                RiskEkle("Domain benzer görünümlü uluslararası karakterler içeriyor olabilir", 2);
        }

        if (GorunenAdresHedefleUyusmuyor(icerik))
            RiskEkle("Görünen link metni gerçek hedef adresiyle eşleşmiyor", 3);

        var ekDosyaKelimeleri = new[]
        {
            "ekli dosya", "eki inceleyin", ".exe", ".zip", ".scr",
            ".js", ".vbs", ".iso", "makro"
        };
        if (ekDosyaKelimeleri.Any(metin.Contains))
            RiskEkle("Şüpheli ek dosya ifadesi tespit edildi", 2);

        var genelHitaplar = new[]
        {
            "değerli müşterimiz", "sayın kullanıcı", "değerli üyemiz", "dear customer"
        };
        if (genelHitaplar.Any(metin.Contains))
            RiskEkle("Kişiselleştirilmemiş, genel bir hitap kullanılmış", 1);

        foreach (var (marka, resmiDomainler) in MarkaDomainleri)
        {
            if (!metin.Contains(marka) || uriler.Count == 0)
                continue;

            var markaResmiAdreseYonleniyor = uriler.Any(uri =>
                resmiDomainler.Any(domain => DomainEslesiyor(uri.IdnHost, domain)));

            if (!markaResmiAdreseYonleniyor)
                RiskEkle($"\"{marka}\" markası geçiyor ancak bağlantı resmi domainle eşleşmiyor", 2);
        }

        if (bulunanRiskler.Count == 0)
            bulunanRiskler.Add("Belirgin bir risk unsuru tespit edilmedi");

        var seviye = riskPuani switch
        {
            >= 5 => "Yüksek",
            >= 2 => "Orta",
            _ => "Düşük"
        };

        return new AnalizKaydi
        {
            Icerik = icerik,
            Seviye = seviye,
            RiskPuani = riskPuani,
            BulunanRiskler = string.Join(" | ", bulunanRiskler),
            Tarih = DateTime.UtcNow
        };
    }

    private static string LinkiTemizle(string link) =>
        link.TrimEnd('.', ',', ';', ':', '!', '?', ')', ']', '}', '"', '\'');

    private static Uri? UriOlustur(string? adres)
    {
        if (string.IsNullOrWhiteSpace(adres))
            return null;

        var aday = adres.Trim();
        if (aday.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            aday = $"http://{aday}";

        return Uri.TryCreate(aday, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps)
                ? uri
                : null;
    }

    private static bool DomainEslesiyor(string host, string domain) =>
        host.Equals(domain, StringComparison.OrdinalIgnoreCase)
        || host.EndsWith($".{domain}", StringComparison.OrdinalIgnoreCase);

    private static bool GorunenAdresHedefleUyusmuyor(string icerik)
    {
        var linkler = HtmlLinkRegex.Matches(icerik)
            .Select(match => (
                Metin: Regex.Replace(match.Groups["metin"].Value, "<.*?>", string.Empty),
                Hedef: match.Groups["hedef"].Value))
            .Concat(MarkdownLinkRegex.Matches(icerik).Select(match => (
                Metin: match.Groups["metin"].Value,
                Hedef: match.Groups["hedef"].Value)));

        foreach (var (metin, hedef) in linkler)
        {
            var gorunenUri = UriOlustur(LinkiTemizle(metin.Trim()));
            var hedefUri = UriOlustur(LinkiTemizle(hedef.Trim()));

            if (gorunenUri is not null
                && hedefUri is not null
                && !gorunenUri.IdnHost.Equals(hedefUri.IdnHost, StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }
        }

        return false;
    }
}
