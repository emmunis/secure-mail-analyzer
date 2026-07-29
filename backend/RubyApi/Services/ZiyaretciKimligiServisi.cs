namespace RubyApi.Services;

public class ZiyaretciKimligiServisi
{
    private const string CookieAdi = "ruby_ziyaretci";
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ZiyaretciKimligiServisi(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid GetirVeyaOlustur()
    {
        var context = _httpContextAccessor.HttpContext
            ?? throw new InvalidOperationException("HTTP isteği bulunamadı.");

        if (context.Request.Cookies.TryGetValue(CookieAdi, out var cookieDegeri)
            && Guid.TryParse(cookieDegeri, out var ziyaretciId))
        {
            return ziyaretciId;
        }

        ziyaretciId = Guid.NewGuid();
        context.Response.Cookies.Append(CookieAdi, ziyaretciId.ToString(), new CookieOptions
        {
            HttpOnly = true,
            IsEssential = true,
            SameSite = SameSiteMode.Lax,
            Secure = context.Request.IsHttps,
            MaxAge = TimeSpan.FromDays(365)
        });

        return ziyaretciId;
    }
}
