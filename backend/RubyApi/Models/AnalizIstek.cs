using System.ComponentModel.DataAnnotations;

namespace RubyApi.Models;

public class AnalizIstek
{
    [Required(ErrorMessage = "İçerik boş olamaz.")]
    [StringLength(20_000, MinimumLength = 1, ErrorMessage = "İçerik en fazla 20.000 karakter olabilir.")]
    public string Icerik { get; set; } = string.Empty;

    public bool LlmIleYorumla { get; set; } = true;
}
