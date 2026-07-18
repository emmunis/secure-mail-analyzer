import { useState, useEffect, useRef } from 'react';

const OZELLIKLER = [
  {
    icon: "📋",
    baslik: "Kopyala ve Yapıştır",
    aciklama: "Şüphelendiğiniz e-posta metnini, SMS içeriğini veya size gönderilen bağlantıyı saniyeler içinde analiz kutusuna aktarın.",
  },
  {
    icon: "🔍",
    baslik: "Derinlemesine Analiz",
    aciklama: "Ruby, gelişmiş algoritmalarıyla görünmez karakterleri, sahte domainleri ve manipülatif dil baskılarını anında tarar.",
  },
  {
    icon: "🛡️",
    baslik: "Güvenlik Raporu",
    aciklama: "Detaylı risk puanını inceleyin, arka planda yatan gizli tehditleri keşfedin ve dijital dünyada güvende kalın.",
  },
];

const OTOMATIK_GECIS_SURESI = 6000; // ms

function Slider() {
  const [aktifAdim, setAktifAdim] = useState(0);
  const zamanlayiciRef = useRef(null);

  function otomatikBaslat() {
    zamanlayiciRef.current = setInterval(() => {
      setAktifAdim((onceki) => (onceki + 1) % OZELLIKLER.length);
    }, OTOMATIK_GECIS_SURESI);
  }

  function otomatikDurdur() {
    clearInterval(zamanlayiciRef.current);
  }

  // Component ekrana ilk geldiğinde otomatik geçişi başlat,
  // component kaldırıldığında (unmount) zamanlayıcıyı temizle
  useEffect(() => {
    otomatikBaslat();
    return () => otomatikDurdur();
  }, []);

  function indicatorTiklandi(index) {
    otomatikDurdur();
    setAktifAdim(index);
    otomatikBaslat();
  }

  return (
    <section className="features-slider-section">
      <div
        className="slider-viewport"
        onMouseEnter={otomatikDurdur}
        onMouseLeave={otomatikBaslat}
      >
        <div
          className="slider-track"
          style={{ transform: `translateX(-${aktifAdim * 100}%)` }}
        >
          {OZELLIKLER.map((ozellik, index) => (
            <div className="slider-item" key={index}>
              <div className="icon-circle">{ozellik.icon}</div>
              <h3>{ozellik.baslik}</h3>
              <p>{ozellik.aciklama}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="slider-header">
        <div className="slider-indicators">
          {OZELLIKLER.map((_, index) => (
            <span
              key={index}
              className={`indicator ${index === aktifAdim ? "active" : ""}`}
              onClick={() => indicatorTiklandi(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Slider;