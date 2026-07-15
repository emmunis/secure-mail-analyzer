using RubyApi.Models;

namespace RubyApi.Services;

public class AnalizServisi
{
    public AnalizKaydi AnalizEt(string icerik)
    {
        var riskPuani = 0;
        var bulunanRiskler = new List<string>();
        var metin = icerik.ToLower();

        // Aciliyet / baskı dili
        var aciliyetKelimeleri = new[] { "hemen", "acil", "şimdi tıklayın", "son gün", "24 saat", "hesabınız kapatılacak", "son uyarı" };
        if (aciliyetKelimeleri.Any(k => metin.Contains(k)))
        {
            riskPuani += 2;
            bulunanRiskler.Add("Aciliyet veya baskı dili tespit edildi");
        }

        // Kişisel veri / şifre / ödeme bilgisi talebi
        var veriKelimeleri = new[] { "şifrenizi", "şifre", "kart numarası", "tc kimlik", "hesap bilgileriniz", "cvv" };
        if (veriKelimeleri.Any(k => metin.Contains(k)))
        {
            riskPuani += 3;
            bulunanRiskler.Add("Kişisel veri veya ödeme bilgisi talebi tespit edildi");
        }

        // Link kontrolleri
        var linkMatch = System.Text.RegularExpressions.Regex.Match(icerik, @"(https?:\/\/[^\s]+)|(\bwww\.[^\s]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        if (linkMatch.Success)
        {
            var link = linkMatch.Value;

            if (!link.ToLower().StartsWith("https://"))
            {
                riskPuani += 1;
                bulunanRiskler.Add("Link HTTPS kullanmıyor");
            }

            if (link.Length > 60)
            {
                riskPuani += 1;
                bulunanRiskler.Add("Link uzunluğu şüpheli derecede fazla");
            }

            var kisalticilar = new[] { "bit.ly", "tinyurl", "t.co", "cutt.ly", "shorturl" };
            if (kisalticilar.Any(k => link.ToLower().Contains(k)))
            {
                riskPuani += 2;
                bulunanRiskler.Add("Link kısaltıcı servis kullanılmış");
            }

            var tireVeSayi = link.Count(c => c == '-' || char.IsDigit(c));
            if (tireVeSayi > 6)
            {
                riskPuani += 1;
                bulunanRiskler.Add("Domain içinde fazla sayıda tire/rakam var");
            }
        }

        // Bilinen marka taklidi
        var markalar = new[] { "paypal", "garanti", "ziraat", "apple", "microsoft", "trendyol" };
        var gecenMarka = markalar.FirstOrDefault(m => metin.Contains(m));
        if (gecenMarka != null && !metin.Contains(gecenMarka + ".com"))
        {
            riskPuani += 2;
            bulunanRiskler.Add($"\"{gecenMarka}\" markası geçiyor, resmi domain ile eşleşmiyor olabilir");
        }

        // Risk seviyesine çevir
        var seviye = "Düşük";
        if (riskPuani >= 5) seviye = "Yüksek";
        else if (riskPuani >= 2) seviye = "Orta";

        if (bulunanRiskler.Count == 0)
            bulunanRiskler.Add("Belirgin bir risk unsuru tespit edilmedi");

        return new AnalizKaydi
        {
            Icerik = icerik,
            Seviye = seviye,
            RiskPuani = riskPuani,
            BulunanRiskler = string.Join(", ", bulunanRiskler),
            Tarih = DateTime.UtcNow
        };
    }
}