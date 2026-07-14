# Ruby — Mail ve Link Güvenlik Analiz Platformu

Kullanıcıların girdiği e-posta içeriğini veya bağlantıyı analiz ederek oltalama (phishing) ve sosyal mühendislik risklerini tespit etmeyi amaçlayan, eğitim ve farkındalık odaklı bir güvenlik analiz platformu.

> Bu proje bir staj kapsamında geliştirilmektedir. Gerçek kullanıcı verisi kullanılmamaktadır; testler yapay/örnek içeriklerle yapılmaktadır.

## Durum

Şu anda **statik prototip** aşamasındadır (HTML / CSS / JavaScript). Backend ve veritabanı entegrasyonu henüz başlanmamıştır.

## Tamamlanan Özellikler

<details>
<summary><strong>Analiz motoru</strong></summary>

- Aciliyet/baskı dili tespiti (örn. "hemen", "24 saat içinde", "hesabınız kapatılacak")
- Kişisel veri veya ödeme bilgisi talebi tespiti (şifre, kart numarası, TC kimlik vb.)
- Link kontrolleri: HTTPS eksikliği, aşırı uzun bağlantılar, link kısaltıcı kullanımı, domain içinde fazla sayıda tire/rakam
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

- Önceki analizlerin listelenmesi (şu an tarayıcı `localStorage`'ında saklanıyor)
- Risk seviyesine göre filtreleme (düşük / orta / yüksek / tümü)
- Tekil kayıt silme (onay istemiyle)
- Tüm geçmişi toplu temizleme (onay istemiyle)
- Kayıt üzerine tıklayınca tam içerik ve tespit edilen risklerin genişleyerek görüntülenmesi
</details>

<details>
<summary><strong>Profil sekmesi</strong></summary>

- Toplam analiz sayısı ve yüksek risk sayısını gösteren istatistik kartı
- Kullanıcı hesabı/giriş sistemi henüz yok, örnek verilerle çalışıyor
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

## Kullanılan Teknolojiler (Mevcut)

- HTML5
- CSS3
- JavaScript

## Planlanan Teknolojiler

- **Backend:** .NET Web API
- **Veritabanı:** PostgreSQL (Supabase üzerinden)
- **Frontend:** React'e geçiş
- **Container:** Docker, Docker Compose
- **Orkestrasyon:** Kubernetes (Minikube / Docker Desktop)
- **Opsiyonel:** LLM entegrasyonu (analiz kalitesini artırmak için)

## Klasör Yapısı

```
secure-mail-analyzer/
├── frontend/          # Statik prototip (HTML/CSS/JS)
├── backend/           # .NET Web API (henüz başlanmadı)
├── database/          # Veritabanı yapılandırması (henüz başlanmadı)
├── k8s/               # Kubernetes YAML dosyaları (henüz başlanmadı)
├── docs/              # Ekran görüntüleri ve dokümantasyon
├── docker-compose.yml # (henüz eklenmedi)
└── README.md
```

## Kurulum ve Çalıştırma (Mevcut Prototip)

Şu an için ekstra bir kurulum gerekmiyor:

1. Repoyu klonlayın: `git clone <repo-linki>`
2. `frontend/index.html` dosyasını bir tarayıcıda açın.

## Geliştirme Geçmişi (Fazlar)

Her faz tamamlandığında ilgili Git etiketiyle (tag) o anki koda kolayca dönülebilir.

<details>
<summary><strong>Faz 1 — Statik Prototip</strong> <code>v0.1-prototip</code></summary>

HTML, CSS ve vanilla JavaScript ile geliştirilen ilk prototip. Analiz formu, kural tabanlı analiz motoru, sonuç ekranı, geçmiş sekmesi (filtreleme/silme dahil), profil sekmesi, bilgilendirme kartları ve SSS bölümünü içerir. Veriler henüz `localStorage`'da tutulmaktadır, backend bağlantısı yoktur.
</details>

<details>
<summary><strong>Faz 2 — Backend ve Veritabanı</strong> <em>(devam ediyor)</em></summary>

.NET Web API ile Supabase (PostgreSQL) bağlantısı kurulacak, analiz mantığı backend'e taşınacaktır.
</details>


## Yol Haritası

- [x] Statik prototip (form, analiz, sonuç, geçmiş, profil, SSS)
- [ ] .NET Web API kurulumu ve Supabase (PostgreSQL) bağlantısı
- [ ] Analiz mantığının backend'e taşınması
- [ ] React'e geçiş
- [ ] Docker ve docker-compose yapılandırması
- [ ] Kubernetes deployment dosyaları
- [ ] Admin paneli (toplam analiz sayısı, risk dağılımı, en sık görülen risk tipleri)
- [ ] LLM entegrasyonu (opsiyonel)