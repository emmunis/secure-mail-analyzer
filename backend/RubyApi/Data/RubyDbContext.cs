using Microsoft.EntityFrameworkCore;
using RubyApi.Models;

namespace RubyApi.Data;

public class RubyDbContext : DbContext
{
    public RubyDbContext(DbContextOptions<RubyDbContext> options) : base(options) { }

    public DbSet<AnalizKaydi> AnalizKayitlari => Set<AnalizKaydi>();
}