# Ruby — Mail ve Link Güvenlik Analiz Platformu

Kullanıcıların girdiği e-posta içeriğini veya bağlantıyı analiz ederek oltalama (phishing) ve sosyal mühendislik risklerini tespit etmeyi amaçlayan, eğitim ve farkındalık odaklı bir güvenlik analiz platformu.

> Bu proje bir staj kapsamında geliştirilmektedir. Gerçek kullanıcı verisi kullanılmamaktadır; testler yapay/örnek içeriklerle yapılmaktadır.

## Durum

Frontend React ile geliştirilmektedir ve backend .NET Web API üzerinden çalışan
bir sistemle tam entegre çalışmaktadır. Analiz işlemleri backend'de
gerçekleştirilmekte, sonuçlar Supabase (PostgreSQL) veritabanında kalıcı olarak
saklanmaktadır. Son kullanıcı hesabı gerektirmeyen anonim geçmiş, JWT ile
korunan admin paneli ve otomatik analiz testleri çalışır durumdadır. Uygulama;
frontend, backend ve PostgreSQL servisleriyle Docker Compose üzerinden de tek
komutla çalıştırılabilir.

## Tamamlanan Özellikler

<details>
<summary><strong>Analiz motoru</strong></summary>

- Aciliyet/baskı dili tespiti (örn. "hemen", "24 saat içinde", "hesabınız kapatılacak")
- Kişisel veri veya ödeme bilgisi talebi tespiti (şifre, kart numarası, TC kimlik vb.)
- Link kontrolleri: HTTPS eksikliği, aşırı uzun bağlantılar, link kısaltıcı kullanımı, domain içinde fazla sayıda tire/rakam, IP adresine doğrudan yönlendirme
- İçerikteki tüm bağlantıların ayrı ayrı incelenmesi
- HTML ve Markdown bağlantılarında görünen adres ile gerçek hedefin karşılaştırılması
- Punycode/benzer karakter içerebilen ve olağandışı karmaşık domain uyarıları
- Şüpheli ek dosya ifadelerinin tespiti (.exe, .zip, "eki inceleyin" vb.)
- Kişiselleştirilmemiş, genel hitap tespiti (örn. "Sayın kullanıcı")
- Bilinen marka taklidi tespiti (örn. marka adı geçip resmi domain ile eşleşmiyorsa)
- Toplanan puana göre düşük / orta / yüksek risk seviyesi belirleme
</details>

<details>
<summary><strong>Sonuç ekranı</strong></summary>

- Risk seviyesini renkli bir rozetle gösterme
- Hesaplanan risk puanını görüntüleme
- Tespit edilen risk unsurlarını liste halinde sunma
- Analiz sırasında kısa süreli "Analiz ediliyor..." yükleme durumu simülasyonu
</details>

<details>
<summary><strong>Geçmiş sekmesi</strong></summary>

- Önceki analizlerin listelenmesi (Supabase veritabanından çekiliyor)
- Risk seviyesine göre filtreleme (düşük / orta / yüksek / tümü)
- Tekil kayıt silme (onay istemiyle, backend'den kalıcı olarak siliniyor)
- Tüm geçmişi toplu temizleme (onay istemiyle)
- Kayıt üzerine tıklayınca tam içerik ve tespit edilen risklerin genişleyerek görüntülenmesi
</details>

<details>
<summary><strong>İstatistiklerim sekmesi</strong></summary>

- Kullanıcı hesabı gerektirmeden, tarayıcıya özel anonim geçmiş
- Toplam analiz sayısı ve yüksek risk sayısını gösteren “İstatistiklerim” kartı
- En sık görülen risk tiplerinin listelendiği bölüm
</details>

<details>
<summary><strong>Admin paneli</strong></summary>

- Son kullanıcı kayıt/giriş sistemi olmadan ayrı yönetici girişi
- İki saat geçerli, rol tabanlı JWT ile korunan admin istatistik endpoint'i
- Toplam analiz ve anonim ziyaretçi sayısı
- Risk seviyelerine göre dağılım ve en sık görülen risk tipleri
- Yönetici parolası ve JWT anahtarı yalnızca user-secrets/ortam değişkenlerinde tutulur
</details>

<details>
<summary><strong>Bilgilendirme ve SSS</strong></summary>

- Oltalama tekniklerini örnek arayüz mockup'larıyla anlatan kartlar (marka taklidi, görünmez karakter, header tutarsızlığı vb.)
- "Daha fazla ayrıntı" açılır paneli ile ek güvenlik ipuçları
- Sık Sorulan Sorular (SSS) bölümü, akordeon yapısında
</details>

<details>
<summary><strong>Tasarım</strong></summary>

- Marka kimliğine uygun hero (giriş) bölümü, yapay zeka ile üretilmiş 3D görsel
- Otomatik geçişli özellik slider'ı
- Mobil görünüm (600px ve altı) için özel düzenlemeler
</details>

<details>
<summary><strong>React Bileşen Yapısı</strong></summary>

- Arayüz; Header, Hero, AnalizFormu, Slider, BlogBolumu, Gecmis, Profil,
  AdminPanel, Faq ve Footer olmak üzere bağımsız React bileşenlerine ayrıldı
- Sekme yönlendirmesi, önceki doğrudan DOM manipülasyonu yerine React'in durum yönetimi (`useState`) ile yeniden kurgulandı
- Sayfa başlığı ve favicon yapılandırması güncellendi, sekmeler arası geçiş animasyonu React bileşen yaşam döngüsüne uygun şekilde sağlandı
</details>

<details>
<summary><strong>Backend ve Veritabanı</strong></summary>

- .NET Web API projesi (`RubyApi`) oluşturuldu ve Supabase (PostgreSQL) veritabanına Entity Framework Core ile bağlandı
- Analiz mantığı JavaScript'ten C#'a taşındı (`AnalizServisi`)
- `POST /api/analiz` — içerik gönderip analiz sonucu alma ve veritabanına kaydetme
- `GET /api/analiz` — geçmiş analizleri listeleme
- `GET /api/analiz/istatistik` — toplam analiz sayısı, risk dağılımı ve en sık görülen risk tiplerini döndürme
- `DELETE /api/analiz/{id}` — tekil kayıt silme
- `DELETE /api/analiz/tumunu-sil` — tüm geçmişi toplu silme
- `POST /api/admin/giris` — yönetici parolası karşılığında kısa süreli JWT üretme
- `GET /api/admin/istatistik` — yalnızca admin rolüne açık toplu istatistikler
- `GET /health` — uygulama sağlık kontrolü
- CORS yapılandırması ile frontend'in API'ye tarayıcı üzerinden erişimi sağlandı
- Analiz endpoint'i için istek sınırlandırması ve `/health` sağlık kontrolü
- Boş ve 20.000 karakteri aşan analiz istekleri için API doğrulaması
- Bağlantı bilgileri `user-secrets` ile güvenli şekilde saklanıyor (koda veya Git'e yazılmıyor)
</details>

<details>
<summary><strong>Docker</strong></summary>

- React uygulaması Nginx üzerinden sunulan çok aşamalı bir Docker imajına dönüştürüldü
- .NET API için ayrı, çok aşamalı ve yetkisiz kullanıcıyla çalışan Docker imajı oluşturuldu
- PostgreSQL, backend ve frontend servisleri Docker Compose ile birlikte yapılandırıldı
- Nginx ters proxy ile tarayıcıdaki `/api` istekleri backend servisine yönlendirildi
- Servis sağlık kontrolleri ve backend başlarken otomatik migration uygulaması eklendi
- Parola ve JWT anahtarı gibi gizli değerler Git'e eklenmeyen `.env` dosyasına taşındı
</details>

## Kullanılan Teknolojiler (Mevcut)

- **Frontend:** React, Vite, CSS3
- **Backend:** .NET Web API
- **Veri Erişim:** Entity Framework Core + Npgsql (veritabanı erişimi)
- **Veritabanı:** PostgreSQL (Supabase üzerinden)
- **Container:** Docker, Docker Compose, Nginx

## Planlanan Teknolojiler

- **Orkestrasyon:** Kubernetes (Minikube / Docker Desktop)
- **Opsiyonel:** LLM entegrasyonu (analiz kalitesini artırmak için)

## Klasör Yapısı

```
secure-mail-analyzer/
├── frontend/          # React (Vite), Nginx yapılandırması ve Dockerfile
├── backend/
│   ├── RubyApi/       # .NET Web API projesi ve Dockerfile
│   └── RubyApi.Tests/ # Analiz motoru ve istek doğrulama testleri
├── database/          # Veritabanı yapılandırması ve açıklamaları
├── k8s/               # Kubernetes YAML dosyaları (henüz başlanmadı)
├── docs/              # Ekran görüntüleri ve dokümantasyon
├── .env.example       # Docker ortam değişkenleri şablonu
├── docker-compose.yml # Frontend, backend ve PostgreSQL servisleri
└── README.md
```

## Kurulum ve Çalıştırma

### Docker Compose ile önerilen kurulum

Bu yöntem için yalnızca Docker Desktop veya Docker Engine ile Docker Compose
gereklidir; Node.js, .NET SDK ya da yerel PostgreSQL kurulmasına gerek yoktur.

1. Örnek ortam dosyasını kopyalayın:
   ```powershell
   Copy-Item .env.example .env
   ```
2. `.env` içindeki `POSTGRES_PASSWORD`, `ADMIN_PASSWORD` ve en az 32 karakterlik
   `JWT_KEY` değerlerini güçlü, size özel değerlerle değiştirin.
3. İmajları oluşturup servisleri arka planda başlatın:
   ```powershell
   docker compose up --build -d
   ```
4. Uygulamayı `http://localhost:8080` adresinden açın. `FRONTEND_PORT` değeri
   değiştirilirse yeni portu kullanın.

Servislerin durumunu ve kayıtlarını görüntülemek veya servisleri durdurmak için:

```powershell
docker compose ps
docker compose logs -f
docker compose down
```

PostgreSQL verileri `postgres_data` adlı Docker volume'ünde korunur.
`docker compose down --volumes` komutu bu volume'ü ve içindeki yerel verileri
kalıcı olarak siler. Backend ilk açılışta Entity Framework migration'larını
otomatik uygular; ayrıca SQL komutu çalıştırılması gerekmez.

Docker kurulumu kendi yerel PostgreSQL servisini kullanır. Aşağıdaki manuel
backend kurulumu ise Supabase veya başka bir PostgreSQL sunucusuyla geliştirme
yapmak isteyenler içindir.

### Frontend

1. `Node.js` (LTS sürüm) kurulu olmalıdır.
2. `frontend` klasörüne girin.
3. Bağımlılıkları kurun: `npm install`
4. Geliştirme sunucusunu başlatın: `npm run dev` (varsayılan olarak `http://localhost:5173` üzerinden yayınlanır)

### Backend

1. `.NET 10 SDK` kurulu olmalıdır.
2. `backend/RubyApi` klasörüne girin.
3. Supabase (PostgreSQL) bağlantı bilgisini `user-secrets` ile tanımlayın:
   ```
   dotnet user-secrets set "ConnectionStrings:RubyDb" "Host=...;Port=5432;Database=postgres;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
   ```
4. Admin erişim bilgilerini tanımlayın:
   ```
   dotnet user-secrets set "Admin:Password" "guclu-bir-yonetici-parolasi"
   dotnet user-secrets set "Jwt:Issuer" "RubyApi"
   dotnet user-secrets set "Jwt:Key" "en-az-32-karakterlik-rastgele-bir-gizli-anahtar"
   ```
5. Veritabanı migration'larını uygulayın:
   ```
   dotnet ef database update
   ```
   Bu komut `backend/RubyApi/Migrations/` klasöründeki migration'ları sırasıyla
   uygular ve gerekli tablo/sütunları otomatik oluşturur veya günceller.
6. API'yi çalıştırın: `dotnet run` (varsayılan olarak `http://localhost:5108` üzerinden yayınlanır)

> Not: Bağlantı bilgileri hiçbir zaman koda veya Git'e yazılmaz, yalnızca yerel `user-secrets` deposunda tutulur.

### Backend testleri

Analiz motoru ve istek doğrulamalarını kontrol etmek için:

```powershell
cd backend
dotnet run --project RubyApi.Tests/RubyApi.Tests.csproj
```

Test çalıştırıcısı dış test paketi gerektirmez ve herhangi bir test başarısız
olduğunda sıfırdan farklı çıkış kodu döndürür.

### Migration dosyaları hakkında

- `backend/RubyApi/Migrations/` altındaki `.cs` ve `.Designer.cs` dosyaları ile
  `RubyDbContextModelSnapshot.cs` Entity Framework migration geçmişinin
  parçalarıdır. Veritabanının sıfırdan doğru kurulabilmesi için repoda
  bulunmaları gerekir; silinmemelidir.
- Projede tek bir temiz `Baslangic` migration'ı bulunur. Yeni bir veritabanında
  `dotnet ef database update` komutunu çalıştırmak yeterlidir; ayrıca SQL
  dosyası çalıştırılması gerekmez.

## Geliştirme Geçmişi (Fazlar)

<details>
<summary><strong>Faz 1 — Statik Prototip</strong> <code>v0.1-prototip</code></summary>

HTML, CSS ve vanilla JavaScript ile geliştirilen ilk prototip. Analiz formu, kural tabanlı analiz motoru, sonuç ekranı, geçmiş sekmesi (filtreleme/silme dahil), profil sekmesi, bilgilendirme kartları ve SSS bölümünü içerir. Veriler henüz `localStorage`'da tutulmaktadır, backend bağlantısı yoktur.
</details>

<details>
<summary><strong>Faz 2 — Backend ve Veritabanı</strong> <code>v0.2-backend</code></summary>

.NET Web API projesi oluşturuldu, Supabase (PostgreSQL) veritabanına Entity Framework Core ile bağlanıldı. Analiz mantığı C#'a taşındı; analiz yapma, geçmişi listeleme, tekil/toplu silme endpoint'leri geliştirildi. CORS yapılandırması ile frontend gerçek API'ye bağlandı, veriler artık `localStorage` yerine veritabanında kalıcı olarak tutuluyor.
</details>

<details>
<summary><strong>Faz 3 — React'e Geçiş ve Analiz Motoru Geliştirmeleri</strong> <code>v0.3-react</code></summary>

Statik HTML/CSS/JavaScript yapısı, işlevsel bölümlere karşılık gelen bağımsız React bileşenlerine ayrıldı; sekme yönetimi React'in durum yönetimiyle yeniden kuruldu. Eski statik dosyalar temizlendi. Ardından backend'deki analiz motoruna yeni kontroller (ek dosya uyarısı, IP adresi şeklinde link, kişiselleştirme eksikliği) eklendi ve daha önce hazırlanan istatistik uç noktası, Profil sayfasındaki "En Sık Görülen Risk Tipleri" bölümüyle işlevsel hale getirildi. Süreçte tespit edilen bir veri formatı hatası (risk açıklamalarının ayraç karakteriyle yanlış bölünmesi) giderildi.
</details>

<details>
<summary><strong>Faz 4 — Anonim Geçmiş, Admin ve Güvenlik İyileştirmeleri</strong> <code>v0.4-new-features</code></summary>

Son kullanıcı kayıt/giriş zorunluluğu kaldırılarak tarayıcıya özel anonim geçmiş
sistemi geliştirildi. Kullanıcılar yalnızca kendi analizlerini görebilir ve
silebilir hâle getirildi. Ayrı yönetici girişi, rol tabanlı JWT ve tüm
ziyaretçilerin anonim toplu istatistiklerini gösteren admin paneli eklendi.

Veritabanı migration geçmişi tek ve temiz bir `Baslangic` migration'ında
birleştirildi. Analiz motoru; çoklu bağlantı inceleme, görünen adres ile gerçek
hedef uyuşmazlığı, IP/kısaltılmış bağlantı, Punycode ve karmaşık domain
kontrolleriyle geliştirildi. API istek doğrulamaları, analiz rate limit'i ve
sağlık kontrolü eklendi. Analiz motoru ile istek modellerini kapsayan 16
otomatik test hazırlandı.
</details>

<details>
<summary><strong>Faz 5 — Docker ve Docker Compose</strong></summary>

Frontend için Nginx tabanlı, backend için .NET runtime tabanlı çok aşamalı Docker
imajları oluşturuldu. PostgreSQL, backend ve frontend servisleri Docker Compose
ile birleştirildi; sağlık kontrolleri, kalıcı veritabanı volume'ü, otomatik
migration ve Nginx üzerinden API yönlendirmesi yapılandırıldı. Gizli değerlerin
`.env` ile yönetildiği kurulum akışı dokümante edildi ve sistem container
ortamında uçtan uca doğrulandı.
</details>


## Yol Haritası

- [x] Statik prototip (form, analiz, sonuç, geçmiş, profil, SSS)
- [x] .NET Web API kurulumu ve Supabase (PostgreSQL) bağlantısı
- [x] Analiz mantığının backend'e taşınması
- [x] Geçmiş kayıtları silme (tekil ve toplu) endpoint'leri
- [x] React'e geçiş
- [x] Analiz motorunda ek kontroller (ek dosya, IP linki, kişiselleştirme eksikliği)
- [x] Çoklu link, hedef uyuşmazlığı ve karmaşık domain kontrolleri
- [x] Analiz motoru ve istek doğrulama testleri
- [x] Docker ve Docker Compose yapılandırması
- [ ] Kubernetes deployment dosyaları
- [x] Anonim, tarayıcıya özel analiz geçmişi
- [x] Admin paneli (toplam analiz sayısı, risk dağılımı ve en sık görülen risk tipleri)
- [ ] LLM entegrasyonu (opsiyonel)
