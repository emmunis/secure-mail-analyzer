using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RubyApi.Data;
using RubyApi.Models;
using RubyApi.Services;

namespace RubyApi.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly RubyDbContext _context;
    private readonly AdminTokenServisi _tokenServisi;

    public AdminController(RubyDbContext context, AdminTokenServisi tokenServisi)
    {
        _context = context;
        _tokenServisi = tokenServisi;
    }

    [AllowAnonymous]
    [HttpPost("giris")]
    public ActionResult Giris(AdminGirisIstek istek)
    {
        if (!_tokenServisi.YapilandirmaHazir)
            return Problem(
                "Admin erişimi sunucuda henüz yapılandırılmamış.",
                statusCode: StatusCodes.Status503ServiceUnavailable);

        if (!_tokenServisi.SifreDogruMu(istek.Sifre))
            return Unauthorized("Yönetici parolası hatalı.");

        return Ok(new { token = _tokenServisi.TokenUret() });
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("istatistik")]
    public async Task<ActionResult> Istatistik()
    {
        var tumKayitlar = await _context.AnalizKayitlari
            .AsNoTracking()
            .ToListAsync();

        var riskDagilimi = tumKayitlar
            .GroupBy(k => k.Seviye)
            .ToDictionary(g => g.Key, g => g.Count());

        var enSikRiskTipleri = tumKayitlar
            .SelectMany(k => k.BulunanRiskler.Split(" | "))
            .GroupBy(r => r)
            .OrderByDescending(g => g.Count())
            .Take(5)
            .Select(g => new { risk = g.Key, sayi = g.Count() })
            .ToList();

        return Ok(new
        {
            toplamAnalizSayisi = tumKayitlar.Count,
            benzersizZiyaretciSayisi = tumKayitlar
                .Where(k => k.ZiyaretciId.HasValue)
                .Select(k => k.ZiyaretciId)
                .Distinct()
                .Count(),
            riskDagilimi,
            enSikRiskTipleri
        });
    }
}
