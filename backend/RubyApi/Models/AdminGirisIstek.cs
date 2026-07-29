using System.ComponentModel.DataAnnotations;

namespace RubyApi.Models;

public class AdminGirisIstek
{
    [Required(ErrorMessage = "Yönetici parolası boş olamaz.")]
    [StringLength(256, ErrorMessage = "Yönetici parolası çok uzun.")]
    public string Sifre { get; set; } = string.Empty;
}
