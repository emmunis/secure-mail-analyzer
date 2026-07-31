using RubyApi.Models;

namespace RubyApi.Services;

public interface ILlmAnalizServisi
{
    Task<LlmAnalizSonucu?> YorumlaAsync(
        string icerik,
        AnalizKaydi kuralSonucu,
        CancellationToken cancellationToken);
}

public sealed record LlmAnalizSonucu(string Aciklama, IReadOnlyList<string> Oneriler);
