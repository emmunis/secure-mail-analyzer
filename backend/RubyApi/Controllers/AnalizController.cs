using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using RubyApi.Data;
using RubyApi.Models;
using RubyApi.Services;

namespace RubyApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalizController : ControllerBase
{
    private readonly RubyDbContext _context;
    private readonly AnalizServisi _analizServisi;
    private readonly ILlmAnalizServisi _llmAnalizServisi;
    private readonly ZiyaretciKimligiServisi _ziyaretciKimligi;

    public AnalizController(
        RubyDbContext context,
        AnalizServisi analizServisi,
        ILlmAnalizServisi llmAnalizServisi,
        ZiyaretciKimligiServisi ziyaretciKimligi)
    {
        _context = context;
        _analizServisi = analizServisi;
        _llmAnalizServisi = llmAnalizServisi;
        _ziyaretciKimligi = ziyaretciKimligi;
    }

    [EnableRateLimiting("analiz")]
    [HttpPost]
    public async Task<ActionResult<AnalizKaydi>> Analiz(AnalizIstek istek)
    {
        if (string.IsNullOrWhiteSpace(istek.Icerik))
            return BadRequest("İçerik boş olamaz.");

        var sonuc = _analizServisi.AnalizEt(istek.Icerik);
        sonuc.LlmIstendi = istek.LlmIleYorumla;

        if (istek.LlmIleYorumla)
        {
            var llmSonucu = await _llmAnalizServisi.YorumlaAsync(
                istek.Icerik,
                sonuc,
                HttpContext.RequestAborted);

            if (llmSonucu is not null)
            {
                sonuc.LlmBasarili = true;
                sonuc.LlmAciklama = llmSonucu.Aciklama;
                sonuc.LlmOnerileri = string.Join(" | ", llmSonucu.Oneriler);
            }
        }

        sonuc.ZiyaretciId = _ziyaretciKimligi.GetirVeyaOlustur();

        _context.AnalizKayitlari.Add(sonuc);
        await _context.SaveChangesAsync();

        return Ok(sonuc);
    }

    [HttpGet]
    public async Task<ActionResult<List<AnalizKaydi>>> GecmisiGetir()
    {
        var ziyaretciId = _ziyaretciKimligi.GetirVeyaOlustur();
        var gecmis = await _context.AnalizKayitlari
            .AsNoTracking()
            .Where(k => k.ZiyaretciId == ziyaretciId)
            .OrderByDescending(k => k.Tarih)
            .ToListAsync();

        return Ok(gecmis);
    }

    [HttpGet("istatistik")]
    public async Task<ActionResult> Istatistik()
    {
        var ziyaretciId = _ziyaretciKimligi.GetirVeyaOlustur();
        var ziyaretciKayitlari = await _context.AnalizKayitlari
            .AsNoTracking()
            .Where(k => k.ZiyaretciId == ziyaretciId)
            .ToListAsync();

        var riskDagilimi = ziyaretciKayitlari
            .GroupBy(k => k.Seviye)
            .ToDictionary(g => g.Key, g => g.Count());

        var enSikRiskTipleri = ziyaretciKayitlari
            .SelectMany(k => k.BulunanRiskler.Split(" | "))
            .GroupBy(r => r)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new { risk = g.Key, sayi = g.Count() });

        return Ok(new
        {
            toplamAnalizSayisi = ziyaretciKayitlari.Count,
            riskDagilimi,
            enSikRiskTipleri
        });
    }

    [HttpDelete("tumunu-sil")]
    public async Task<IActionResult> TumunuSil()
    {
        var ziyaretciId = _ziyaretciKimligi.GetirVeyaOlustur();
        var kendiKayitlari = _context.AnalizKayitlari
            .Where(k => k.ZiyaretciId == ziyaretciId);

        _context.AnalizKayitlari.RemoveRange(kendiKayitlari);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Sil(int id)
    {
        var ziyaretciId = _ziyaretciKimligi.GetirVeyaOlustur();
        var kayit = await _context.AnalizKayitlari.FindAsync(id);

        if (kayit == null || kayit.ZiyaretciId != ziyaretciId)
            return NotFound($"{id} numaralı kayıt bulunamadı.");

        _context.AnalizKayitlari.Remove(kayit);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
