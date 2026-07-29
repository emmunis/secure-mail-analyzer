using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace RubyApi.Services;

public class AdminTokenServisi
{
    private readonly IConfiguration _config;

    public AdminTokenServisi(IConfiguration config)
    {
        _config = config;
    }

    public bool YapilandirmaHazir =>
        !string.IsNullOrWhiteSpace(_config["Admin:Password"])
        && !string.IsNullOrWhiteSpace(_config["Jwt:Key"])
        && !string.IsNullOrWhiteSpace(_config["Jwt:Issuer"]);

    public bool SifreDogruMu(string sifre)
    {
        var beklenen = _config["Admin:Password"];
        if (string.IsNullOrEmpty(beklenen) || string.IsNullOrEmpty(sifre))
            return false;

        var beklenenBytes = Encoding.UTF8.GetBytes(beklenen);
        var gelenBytes = Encoding.UTF8.GetBytes(sifre);

        return beklenenBytes.Length == gelenBytes.Length
            && CryptographicOperations.FixedTimeEquals(beklenenBytes, gelenBytes);
    }

    public string TokenUret()
    {
        if (!YapilandirmaHazir)
            throw new InvalidOperationException("Admin/JWT yapılandırması eksik.");

        var anahtar = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var credentials = new SigningCredentials(anahtar, SecurityAlgorithms.HmacSha256);
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, "Admin"),
            new Claim(ClaimTypes.Role, "Admin")
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Issuer"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
