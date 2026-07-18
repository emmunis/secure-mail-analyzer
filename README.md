# Ruby — Mail ve Link Güvenlik Analiz Platformu

Kullanıcıların girdiği e-posta içeriğini veya bağlantıyı analiz ederek oltalama (phishing) ve sosyal mühendislik risklerini tespit etmeyi amaçlayan, eğitim ve farkındalık odaklı bir güvenlik analiz platformu.

> Bu proje bir staj kapsamında geliştirilmektedir. Gerçek kullanıcı verisi kullanılmamaktadır; testler yapay/örnek içeriklerle yapılmaktadır.

## Durum

Frontend React ile geliştirilmektedir ve backend .NET Web API üzerinden çalışan bir sistemle tam entegre çalışmaktadır. Analiz işlemleri backend'de gerçekleştirilmekte, sonuçlar Supabase (PostgreSQL) veritabanında kalıcı olarak saklanmaktadır.

## Tamamlanan Özellikler

<details>
<summary><strong>Analiz motoru</strong></summary>

- Aciliyet/baskı dili tespiti (örn. "hemen", "24 saat içinde", "hesabınız kapatılacak")
- Kişisel veri veya ödeme bilgisi talebi tespiti (şifre, kart numarası, TC kimlik vb.)
- Link kontrolleri: HTTPS eksikliği, aşırı uzun bağlantılar, link kısaltıcı kullanımı, domain içinde fazla sayıda tire/rakam, IP adresine doğrudan yönlendirme
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
<summary><strong>Profil sekmesi</strong></summary>

- Toplam analiz sayısı ve yüksek risk sayısını gösteren istatistik kartı (Supabase'ten canlı veriyle hesaplanıyor)
- En sık görülen risk tiplerinin listelendiği bölüm
- Kullanıcı hesabı/giriş sistemi henüz yok, kullanıcı bilgileri örnek veridir
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

- Arayüz, Header, Hero, AnalizFormu, Slider, BlogBolumu, Gecmis, Profil, Faq ve Footer olmak üzere bağımsız React bileşenlerine ayrıldı
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
- CORS yapılandırması ile frontend'in API'ye tarayıcı üzerinden erişimi sağlandı
- Bağlantı bilgileri `user-secrets` ile güvenli şekilde saklanıyor (koda veya Git'e yazılmıyor)
</details>

## Kullanılan Teknolojiler (Mevcut)

- **Frontend:** React, Vite, CSS3
- **Backend:** .NET Web API
- **Veri Erişim:** Entity Framework Core + Npgsql (veritabanı erişimi)
- **Veritabanı:** PostgreSQL (Supabase üzerinden)

## Planlanan Teknolojiler

- **Container:** Docker, Docker Compose
- **Orkestrasyon:** Kubernetes (Minikube / Docker Desktop)
- **Opsiyonel:** LLM entegrasyonu (analiz kalitesini artırmak için)

## Klasör Yapısı

```
secure-mail-analyzer/
├── frontend/    # React (Vite) frontend projesi
├── backend/
│   └── RubyApi/       # .NET Web API projesi
├── database/          # Veritabanı yapılandırması (Supabase üzerinden yönetiliyor)
├── k8s/               # Kubernetes YAML dosyaları (henüz başlanmadı)
├── docs/              # Ekran görüntüleri ve dokümantasyon
├── docker-compose.yml # (henüz eklenmedi)
└── README.md
```

## Kurulum ve Çalıştırma

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
4. Veritabanı migration'larını uygulayın: `dotnet ef database update`
5. API'yi çalıştırın: `dotnet run` (varsayılan olarak `http://localhost:5108` üzerinden yayınlanır)

> Not: Bağlantı bilgileri hiçbir zaman koda veya Git'e yazılmaz, yalnızca yerel `user-secrets` deposunda tutulur.

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



## Yol Haritası

- [x] Statik prototip (form, analiz, sonuç, geçmiş, profil, SSS)
- [x] .NET Web API kurulumu ve Supabase (PostgreSQL) bağlantısı
- [x] Analiz mantığının backend'e taşınması
- [x] Geçmiş kayıtları silme (tekil ve toplu) endpoint'leri
- [x] React'e geçiş
- [x] Analiz motorunda ek kontroller (ek dosya, IP linki, kişiselleştirme eksikliği)
- [ ] Docker ve docker-compose yapılandırması
- [ ] Kubernetes deployment dosyaları
- [ ] Admin paneli (toplam analiz sayısı, risk dağılımı, en sık görülen risk tipleri — Profil sayfasında kısmen mevcut)
- [ ] LLM entegrasyonu (opsiyonel)