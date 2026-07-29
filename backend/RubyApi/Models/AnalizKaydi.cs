using System.Text.Json.Serialization;

namespace RubyApi.Models;

public class AnalizKaydi
{
    public int Id { get; set; }
    public string Icerik { get; set; } = string.Empty;
    public string Seviye { get; set; } = string.Empty;   // Düşük / Orta / Yüksek
    public int RiskPuani { get; set; }
    public string BulunanRiskler { get; set; } = string.Empty; // şimdilik virgülle ayrılmış metin
    public DateTime Tarih { get; set; } = DateTime.UtcNow;

    [JsonIgnore]
    public Guid? ZiyaretciId { get; set; }
}
