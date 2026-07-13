/* ============================================================
   1. ANALİZ MANTIĞI
   Bu bölümdeki fonksiyonlar DOM'a dokunmaz, sadece veri işler.
   İleride .NET Web API tarafına taşınacak asıl mantık burada.
   ============================================================ */

function analizEt(icerik) {
  let riskPuani = 0;
  const bulunanRiskler = [];
  const metin = icerik.toLowerCase();

  // Aciliyet / baskı dili
  const aciliyetKelimeleri = [
    "hemen", "acil", "şimdi tıklayın", "son gün",
    "24 saat", "hesabınız kapatılacak", "son uyarı",
  ];
  if (aciliyetKelimeleri.some((k) => metin.includes(k))) {
    riskPuani += 2;
    bulunanRiskler.push("Aciliyet veya baskı dili tespit edildi");
  }

  // Kişisel veri / şifre / ödeme bilgisi talebi
  const veriKelimeleri = [
    "şifrenizi", "şifre", "kart numarası", "tc kimlik",
    "hesap bilgileriniz", "cvv",
  ];
  if (veriKelimeleri.some((k) => metin.includes(k))) {
    riskPuani += 3;
    bulunanRiskler.push("Kişisel veri veya ödeme bilgisi talebi tespit edildi");
  }

  // Link kontrolleri
  const linkRegex = /(https?:\/\/[^\s]+)|(\bwww\.[^\s]+)/i;
  const linkEslesme = icerik.match(linkRegex);

  if (linkEslesme) {
    const link = linkEslesme[0];

    if (!link.toLowerCase().startsWith("https://")) {
      riskPuani += 1;
      bulunanRiskler.push("Link HTTPS kullanmıyor");
    }

    if (link.length > 60) {
      riskPuani += 1;
      bulunanRiskler.push("Link uzunluğu şüpheli derecede fazla");
    }

    const kisalticilar = ["bit.ly", "tinyurl", "t.co", "cutt.ly", "shorturl"];
    if (kisalticilar.some((k) => link.toLowerCase().includes(k))) {
      riskPuani += 2;
      bulunanRiskler.push("Link kısaltıcı servis kullanılmış");
    }

    const tireVeSayi = (link.match(/[-0-9]/g) || []).length;
    if (tireVeSayi > 6) {
      riskPuani += 1;
      bulunanRiskler.push("Domain içinde fazla sayıda tire/rakam var");
    }
  }

  // Bilinen marka taklidi
  const markalar = ["paypal", "garanti", "ziraat", "apple", "microsoft", "trendyol"];
  const gecenMarka = markalar.find((m) => metin.includes(m));
  if (gecenMarka && !metin.includes(gecenMarka + ".com")) {
    riskPuani += 2;
    bulunanRiskler.push(`"${gecenMarka}" markası geçiyor, resmi domain ile eşleşmiyor olabilir`);
  }

  // Risk seviyesine çevir
  let seviye = "Düşük";
  if (riskPuani >= 5) seviye = "Yüksek";
  else if (riskPuani >= 2) seviye = "Orta";

  if (bulunanRiskler.length === 0) {
    bulunanRiskler.push("Belirgin bir risk unsuru tespit edilmedi");
  }

  return { seviye, riskPuani, bulunanRiskler, tarih: new Date().toLocaleString("tr-TR") };
}


/* ============================================================
   2. DEPOLAMA (localStorage)
   Şimdilik geçici çözüm — ileride PostgreSQL'e taşınacak.
   ============================================================ */

function gecmiseKaydet(icerik, sonuc) {
  const gecmis = JSON.parse(localStorage.getItem("analizGecmisi") || "[]");
  gecmis.unshift({ icerik, ...sonuc });
  localStorage.setItem("analizGecmisi", JSON.stringify(gecmis.slice(0, 20)));
}

function gecmisiGetir() {
  return JSON.parse(localStorage.getItem("analizGecmisi") || "[]");
}


/* ============================================================
   3. EKRANA BASMA (DOM güncellemeleri)
   ============================================================ */

function sonucuGoster(sonuc) {
  const card = document.getElementById("resultCard");
  const badge = document.getElementById("resultBadge");
  const score = document.getElementById("resultScore");
  const list = document.getElementById("resultList");

  badge.textContent = sonuc.seviye;
  badge.className = "result-badge risk-" + sonuc.seviye.toLowerCase();
  score.textContent = `Risk puanı: ${sonuc.riskPuani}`;

  list.innerHTML = "";
  sonuc.bulunanRiskler.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = r;
    list.appendChild(li);
  });

  card.style.display = "block";
  card.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function gecmisiListele() {
  const gecmis = gecmisiGetir();
  const list = document.getElementById("historyList");
  list.innerHTML = "";

  if (gecmis.length === 0) {
    list.innerHTML = "<p>Henüz bir analiz geçmişiniz bulunmuyor.</p>";
    return;
  }

  gecmis.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const kisaIcerik = item.icerik.length > 120
      ? item.icerik.substring(0, 120) + "..."
      : item.icerik;

    li.innerHTML = `
      <div class="result-header" style="margin-bottom: 10px;">
        <span class="result-badge risk-${item.seviye.toLowerCase()}">${item.seviye} Risk</span>
        <span class="result-score">${item.tarih}</span>
      </div>
      <p><strong>İncelenen:</strong> ${kisaIcerik}</p>
      <p style="margin-top: 8px; font-size: 0.85rem;"><strong>Tespit Edilenler:</strong> ${item.bulunanRiskler.join(', ')}</p>
    `;
    list.appendChild(li);
  });
}


/* ============================================================
   4. EVENT BAĞLAMA (uygulama başladığında bir kez çalışır)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* --- 4.1 Sekme (Tab) Yönlendirmeleri --- */
  const navRuby = document.getElementById("nav-ruby");
  const navHistory = document.getElementById("nav-history");
  const tabMain = document.getElementById("tab-main");
  const tabHistory = document.getElementById("tab-history");

  function sekmeyeGec(aktifNav, digerNav, gosterilecek, gizlenecek) {
    gosterilecek.style.display = "block";
    gizlenecek.style.display = "none";
    aktifNav.classList.add("active");
    digerNav.classList.remove("active");
  }

  navRuby.classList.add("active"); // sayfa ilk açıldığında ana sekme aktif

  navRuby.addEventListener("click", (e) => {
    e.preventDefault();
    sekmeyeGec(navRuby, navHistory, tabMain, tabHistory);
  });

  navHistory.addEventListener("click", (e) => {
    e.preventDefault();
    sekmeyeGec(navHistory, navRuby, tabHistory, tabMain);
    gecmisiListele();
  });


  /* --- 4.2 Analiz ve Temizle Butonları --- */
  const analizBtn = document.getElementById("analizBtn");
  const temizleBtn = document.getElementById("temizleBtn");
  const btnOrijinalMetin = analizBtn.textContent;
  const input = document.getElementById("linkoremail");

  input.addEventListener("input", () => {
    if (input.value.trim().length > 0) {
      temizleBtn.style.display = "flex";
    } else {
      temizleBtn.style.display = "none";
      document.getElementById("resultCard").style.display = "none";
    }
  });

  analizBtn.addEventListener("click", () => {
    const icerik = input.value.trim();

    if (!icerik) {
      alert("Lütfen analiz edilecek bir mail içeriği veya link girin.");
      return;
    }

    analizBtn.disabled = true;
    analizBtn.textContent = "Analiz ediliyor...";
    document.getElementById("resultCard").style.display = "none";
    temizleBtn.style.display = "none";

    // Not: Gerçek analiz anlık; bu gecikme kullanıcıya "sistem gerçekten
    // inceliyor" hissi vermek için eklendi. İleride API/LLM çağrısının
    // gerçek bekleme süresiyle değişecek.
    setTimeout(() => {
      const sonuc = analizEt(icerik);
      sonucuGoster(sonuc);
      gecmiseKaydet(icerik, sonuc);

      analizBtn.disabled = false;
      analizBtn.textContent = btnOrijinalMetin;
      temizleBtn.style.display = "flex";
    }, 1200);
  });

  temizleBtn.addEventListener("click", () => {
    input.value = "";
    document.getElementById("resultCard").style.display = "none";
    temizleBtn.style.display = "none";
    input.focus();
  });


  /* --- 4.3 Özellikler Slider'ı (otomatik geçişli) --- */
  const track = document.getElementById("featuresTrack");
  const indicators = document.querySelectorAll(".slider-indicators .indicator");
  const toplamSlide = indicators.length;
  const OTOMATIK_GECIS_SURESI = 6000; // ms

  let currentStep = 0;
  let otomatikTimer = null;

  function updateSlider() {
    track.style.transform = `translateX(-${currentStep * 100}%)`;
    indicators.forEach((ind, index) => {
      ind.classList.toggle("active", index === currentStep);
    });
  }

  function otomatikGeciriBaslat() {
    otomatikTimer = setInterval(() => {
      currentStep = (currentStep + 1) % toplamSlide;
      updateSlider();
    }, OTOMATIK_GECIS_SURESI);
  }

  function otomatikGeciriDurdur() {
    clearInterval(otomatikTimer);
  }

  indicators.forEach((ind) => {
    ind.addEventListener("click", (e) => {
      otomatikGeciriDurdur();
      currentStep = parseInt(e.target.getAttribute("data-slide"));
      updateSlider();
      otomatikGeciriBaslat();
    });
  });

  const sliderViewport = document.querySelector(".slider-viewport");
  if (sliderViewport) {
    sliderViewport.addEventListener("mouseenter", otomatikGeciriDurdur);
    sliderViewport.addEventListener("mouseleave", otomatikGeciriBaslat);
  }

  otomatikGeciriBaslat();

});