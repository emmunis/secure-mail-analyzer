using Microsoft.AspNetCore.Mvc;
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

    public AnalizController(RubyDbContext context, AnalizServisi analizServisi)
    {
        _context = context;
        _analizServisi = analizServisi;
    }

    // POST /api/analiz
    [HttpPost]
    public async Task<ActionResult<AnalizKaydi>> Analiz(AnalizIstek istek)
    {
        if (string.IsNullOrWhiteSpace(istek.Icerik))
            return BadRequest("İçerik boş olamaz.");

        var sonuc = _analizServisi.AnalizEt(istek.Icerik);

        _context.AnalizKayitlari.Add(sonuc);
        await _context.SaveChangesAsync();

        return Ok(sonuc);
    }

    // GET /api/analiz
    [HttpGet]
    public async Task<ActionResult<List<AnalizKaydi>>> GecmisiGetir()
    {
        var gecmis = await _context.AnalizKayitlari
            .OrderByDescending(k => k.Tarih)
            .ToListAsync();

        return Ok(gecmis);
    }



    // GET /api/analiz/istatistik
    [HttpGet("istatistik")]
    public async Task<ActionResult> Istatistik()
    {
        var tumKayitlar = await _context.AnalizKayitlari.ToListAsync();

        var riskDagilimi = tumKayitlar
            .GroupBy(k => k.Seviye)
            .ToDictionary(g => g.Key, g => g.Count());

        var enSikRiskTipleri = tumKayitlar
            .SelectMany(k => k.BulunanRiskler.Split(" | "))
            .GroupBy(r => r)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new { risk = g.Key, sayi = g.Count() });

        return Ok(new
        {
            toplamAnalizSayisi = tumKayitlar.Count,
            riskDagilimi,
            enSikRiskTipleri
        });
    }


    // DELETE /api/analiz/tumunu-sil
    [HttpDelete("tumunu-sil")]
    public async Task<IActionResult> TumunuSil()
    {
        _context.AnalizKayitlari.RemoveRange(_context.AnalizKayitlari);
        await _context.SaveChangesAsync();

        return NoContent();
    }


    // DELETE /api/analiz/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Sil(int id)
    {
        var kayit = await _context.AnalizKayitlari.FindAsync(id);

        if (kayit == null)
            return NotFound($"{id} numaralı kayıt bulunamadı.");

        _context.AnalizKayitlari.Remove(kayit);
        await _context.SaveChangesAsync();

        return NoContent(); // 204 - başarılı, dönecek içerik yok
    }




}