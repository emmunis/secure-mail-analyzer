/* ============================================================
   1. VERİ ADRESİ
   Analiz mantığı artık .NET Web API tarafında (AnalizServisi).
   Bu dosya sadece backend'e istek atıp sonucu ekrana basıyor.
   ============================================================ */
const API_BASE_URL = "http://localhost:5108/api/analiz";


/* ============================================================
   2. EKRANA BASMA (DOM güncellemeleri)
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

async function gecmisiListele(filtre = "All") {
  const list = document.getElementById("historyList");
  list.innerHTML = "<p>Yükleniyor...</p>";

  try {
    const response = await fetch(API_BASE_URL);
    const veriler = await response.json();

    const filtrelenmis = filtre === "All"
      ? veriler
      : veriler.filter((item) => item.seviye === filtre);

    list.innerHTML = "";

    if (filtrelenmis.length === 0) {
      list.innerHTML = "<p>Bu kritere uygun geçmiş kaydı bulunmuyor.</p>";
      return;
    }

    filtrelenmis.forEach((item) => {
      const bulunanRisklerDizi = item.bulunanRiskler.split(", ");
      const tarihMetni = new Date(item.tarih).toLocaleString("tr-TR");
      const skor = Math.min(item.riskPuani, 10);

      const li = document.createElement("li");
      li.className = "history-item accordion-item";

      const kisaIcerik = item.icerik.length > 80
        ? item.icerik.substring(0, 80) + "..."
        : item.icerik;

      li.innerHTML = `
        <div class="history-item-header">
          <div class="header-left">
            <span class="result-badge risk-${item.seviye.toLowerCase()}">${item.seviye} Risk (${skor}/10)</span>
            <span class="result-score" style="margin-left: 10px;">${tarihMetni}</span>
          </div>
          <button class="delete-history-btn" title="Bu kaydı sil">✕</button>
        </div>
        <div class="history-summary">
          <p><strong>İncelenen:</strong> ${kisaIcerik}</p>
          <span class="expand-hint">Detayları görmek için tıklayın ▼</span>
        </div>
        <div class="history-details" style="display: none;">
          <p><strong>Tam İçerik:</strong><br>${item.icerik}</p>
          <p style="margin-top: 10px;"><strong>Tespit Edilen Riskler:</strong></p>
          <ul style="margin-top: 5px; padding-left: 20px;">
            ${bulunanRisklerDizi.map((r) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
      `;

      // Genişletme/daraltma: kutuya tıklanınca detaylar açılır/kapanır
      li.addEventListener("click", function (e) {
        if (e.target.classList.contains("delete-history-btn")) return;
        if (e.target.closest(".history-details")) return;
        if (window.getSelection().toString() !== "") return;

        const details = this.querySelector(".history-details");
        const hint = this.querySelector(".expand-hint");
        const acikMi = details.style.display !== "none";

        details.style.display = acikMi ? "none" : "block";
        hint.textContent = acikMi ? "Detayları görmek için tıklayın ▼" : "Detayları gizle ▲";
      });

      // Sil butonu
      const deleteBtn = li.querySelector(".delete-history-btn");
      deleteBtn.addEventListener("click", async function (e) {
        e.stopPropagation();

        if (!confirm("Bu analizi geçmişten silmek istediğinize emin misiniz?")) return;

        try {
          const response = await fetch(`${API_BASE_URL}/${item.id}`, { method: "DELETE" });

          if (!response.ok) throw new Error("Silme başarısız: " + response.status);

          // Listeyi yenile
          const aktifFiltre = document.getElementById("historyFilter").value || "All";
          gecmisiListele(aktifFiltre);
          profilIstatistikGuncelle();
        } catch (hata) {
          console.error("Silme sırasında hata:", hata);
          alert("Kayıt silinirken bir hata oluştu.");
        }
      });

      list.appendChild(li);
    });
  } catch (hata) {
    console.error("Geçmiş yüklenirken hata:", hata);
    list.innerHTML = "<p>Geçmiş yüklenirken hata oluştu. Backend çalışıyor mu?</p>";
  }
}






async function profilIstatistikGuncelle() {
  const toplamEl = document.getElementById("toplamAnalizSayisi");
  const yuksekEl = document.getElementById("yuksekRiskSayisi");

  try {
    const response = await fetch(API_BASE_URL);
    const gecmis = await response.json();

    toplamEl.textContent = gecmis.length;
    yuksekEl.textContent = gecmis.filter((item) => item.seviye === "Yüksek").length;
  } catch (hata) {
    console.error("İstatistikler yüklenirken hata:", hata);
    toplamEl.textContent = "-";
    yuksekEl.textContent = "-";
  }
}


/* ============================================================
   3. EVENT BAĞLAMA (uygulama başladığında bir kez çalışır)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* --- 4.1 Sekme (Tab) Yönlendirmeleri --- */
  const navRuby = document.getElementById("nav-ruby");
  const navHistory = document.getElementById("nav-history");
  const navProfil = document.getElementById("nav-profil");

  const tabMain = document.getElementById("tab-main");
  const tabHistory = document.getElementById("tab-history");
  const tabProfil = document.getElementById("tab-profil");

  const tumNavlar = [navRuby, navHistory, navProfil];
  const tumTablar = [tabMain, tabHistory, tabProfil];

  function sekmeyeGec(aktifNav, aktifTab) {
    tumTablar.forEach((tab) => (tab.style.display = tab === aktifTab ? "block" : "none"));
    tumNavlar.forEach((nav) => nav.classList.toggle("active", nav === aktifNav));
  }

  navRuby.classList.add("active"); // sayfa ilk açıldığında ana sekme aktif

  navRuby.addEventListener("click", (e) => {
    e.preventDefault();
    sekmeyeGec(navRuby, tabMain);
  });

  navHistory.addEventListener("click", (e) => {
    e.preventDefault();
    sekmeyeGec(navHistory, tabHistory);
    gecmisiListele();
  });

  navProfil.addEventListener("click", (e) => {
    e.preventDefault();
    sekmeyeGec(navProfil, tabProfil);
    profilIstatistikGuncelle();
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


  /* Analiz button */
  analizBtn.addEventListener("click", async () => {
  const icerik = input.value.trim();

  if (!icerik) {
    alert("Lütfen analiz edilecek bir mail içeriği veya link girin.");
    return;
  }

  analizBtn.disabled = true;
  analizBtn.textContent = "Analiz ediliyor...";
  document.getElementById("resultCard").style.display = "none";
  temizleBtn.style.display = "none";

  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icerik }),
    });

    if (!response.ok) throw new Error("Sunucu hatası: " + response.status);

    const veri = await response.json();

    // Backend'den gelen bulunanRiskler bir metin, diziye çeviriyoruz
    const sonuc = {
      ...veri,
      bulunanRiskler: veri.bulunanRiskler.split(", "),
    };

    sonucuGoster(sonuc);
  } catch (hata) {
    console.error("Analiz sırasında hata:", hata);
    alert("Sunucuya bağlanılamadı. Backend'in çalıştığından emin olun (dotnet run).");
  } finally {
    analizBtn.disabled = false;
    analizBtn.textContent = btnOrijinalMetin;
    temizleBtn.style.display = "flex";
  }
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


/* --- 4.4 Geçmiş Filtreleme ve Tümünü Temizleme --- */
  const historyFilter = document.getElementById("historyFilter");
  if (historyFilter) {
    historyFilter.addEventListener("change", (e) => {
      gecmisiListele(e.target.value);
    });
  }

  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", async () => {
      if (!confirm("Tüm analiz geçmişini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

      try {
        const response = await fetch(`${API_BASE_URL}/tumunu-sil`, { method: "DELETE" });

        if (!response.ok) throw new Error("Toplu silme başarısız: " + response.status);

        gecmisiListele("All");
        profilIstatistikGuncelle();
      } catch (hata) {
        console.error("Toplu silme sırasında hata:", hata);
        alert("Geçmiş silinirken bir hata oluştu.");
      }
    });
  }


/* --- 4.5 FAQ Akordeon Yapısı (Animasyonlu) --- */
  const faqQuestions = document.querySelectorAll(".faq-question");
  
  faqQuestions.forEach(btn => {
    btn.addEventListener("click", function() {
      this.classList.toggle("active");
      
      const wrapper = this.nextElementSibling;
      wrapper.classList.toggle("open");
    });
  });