# Veritabanı Yapılandırması

Bu proje veritabanı olarak PostgreSQL kullanır. Geliştirme ortamındaki veritabanı
Supabase üzerinde barındırılmaktadır; uygulama standart PostgreSQL kullandığı
için farklı bir PostgreSQL sunucusuyla da çalıştırılabilir.

## Şema yönetimi

Veritabanı şeması Entity Framework Core migration'larıyla yönetilir. Şemanın
tek doğruluk kaynağı:

```text
backend/RubyApi/Migrations/
```

Bu nedenle `database` klasöründe ayrıca elle güncellenmesi gereken bir
`schema.sql` dosyası tutulmaz. Yeni bir veritabanını hazırlamak için migration
komutunu çalıştırmak yeterlidir.

## Mevcut tablo

### `AnalizKayitlari`

| Sütun | PostgreSQL tipi | Açıklama |
|---|---|---|
| `Id` | `integer` | Otomatik artan birincil anahtar |
| `Icerik` | `text` | Analiz edilen e-posta veya bağlantı |
| `Seviye` | `text` | Düşük, orta veya yüksek risk seviyesi |
| `RiskPuani` | `integer` | Analiz sonucunda hesaplanan risk puanı |
| `BulunanRiskler` | `text` | Tespit edilen risk açıklamaları |
| `Tarih` | `timestamp with time zone` | Analizin UTC oluşturulma zamanı |
| `ZiyaretciId` | `uuid`, nullable | Tarayıcıya özel anonim geçmiş kimliği |

Uygulamada son kullanıcı hesabı bulunmaz. `ZiyaretciId`, kullanıcının geçmişini
başka ziyaretçilerin geçmişinden ayırmak için oluşturulan anonim kimliktir.
Değer istemciye JSON alanı olarak gönderilmez ve tarayıcıda `HttpOnly` cookie
ile saklanır.

## Bağlantı ayarı

Bağlantı bilgisi güvenlik nedeniyle repository içinde tutulmaz. Backend
klasöründe .NET user-secrets kullanılarak tanımlanmalıdır:

```powershell
cd backend/RubyApi
dotnet user-secrets set "ConnectionStrings:RubyDb" "Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

Supabase kullanılıyorsa bağlantı dizesi Supabase projesinin bağlantı
ayarlarından alınabilir.

## Veritabanını oluşturma veya güncelleme

Backend klasöründe:

```powershell
dotnet ef database update
```

Bu komut mevcut migration'ları sırasıyla uygular. Güncel projede tek, temiz bir
`Baslangic` migration'ı bulunur.

## Yeni bir şema değişikliği ekleme

Model sınıflarında değişiklik yapıldıktan sonra:

```powershell
dotnet ef migrations add AciklayiciMigrationAdi
dotnet ef database update
```

Üretilen migration ve `.Designer.cs` dosyaları ile
`RubyDbContextModelSnapshot.cs` Git repository'sine eklenmelidir.

## Önemli notlar

- Bağlantı dizesi, parola veya Supabase anahtarı Git'e eklenmemelidir.
- Gerçek kullanıcılara ait özel e-posta içerikleri veritabanına kaydedilmemelidir.
- Migration dosyaları uygulanma sırası ve şema geçmişi için gereklidir;
  rastgele silinmemelidir.
- `dotnet ef database drop` tüm tabloları ve kayıtları siler; yalnızca test
  veritabanlarında ve bilinçli olarak kullanılmalıdır.
