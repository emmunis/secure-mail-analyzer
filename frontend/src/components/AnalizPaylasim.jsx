import { useRef, useState } from 'react';
import { toBlob } from 'html-to-image';

function diziyeCevir(deger, donustur = (x) => x) {
  if (Array.isArray(deger)) return deger.map(donustur);
  if (!deger) return [];
  return deger.split(" | ").map(donustur);
}

function analizVerisiniHazirla(analiz) {
  return {
    ...analiz,
    bulunanRiskler: diziyeCevir(analiz.bulunanRiskler),
    riskPuanDetaylari: diziyeCevir(analiz.riskPuanDetaylari, Number),
    llmOnerileri: diziyeCevir(analiz.llmOnerileri),
  };
}

function kopyalanacakMetniOlustur(analiz) {
  const veri = analizVerisiniHazirla(analiz);
  const riskler = veri.bulunanRiskler.map((risk, index) => {
    const puan = veri.riskPuanDetaylari[index] ?? 0;
    return `• ${risk}${puan > 0 ? ` (+${puan})` : ""}`;
  }).join("\n");
  const llmBolumu = veri.llmBasarili
    ? `\n\nOLLAMA EK DEĞERLENDİRMESİ\n${veri.llmAciklama}\n\nGüvenlik önerileri:\n${veri.llmOnerileri.map((oneri) => `• ${oneri}`).join("\n")}`
    : "";

  return `RUBY GÜVENLİK ANALİZİ\nRisk seviyesi: ${veri.seviye}\nRisk puanı: ${veri.riskPuani}/40\n\nİNCELENEN İÇERİK\n${veri.icerik}\n\nTESPİT EDİLEN RİSKLER\n${riskler}${llmBolumu}\n\nRisk puanı güvenlik kurallarıyla hesaplanmıştır.`;
}

function PaylasimIkonu({ tur }) {
  if (tur === "kopyala") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="8" y="8" width="11" height="11" rx="2" />
        <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
      </svg>
    );
  }

  if (tur === "gorsel") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9" r="1.5" />
        <path d="m5 17 4.5-4.5 3 3 2-2L19 18" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 16V4" />
      <path d="m7.5 8.5 4.5-4.5 4.5 4.5" />
      <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  );
}

function IndirmeKarti({ analiz, kartRef }) {
  const veri = analizVerisiniHazirla(analiz);
  const tarih = veri.tarih ? new Date(veri.tarih).toLocaleString("tr-TR") : null;

  return (
    <div className="export-stage" aria-hidden="true">
      <article className="export-card" ref={kartRef}>
        <header className="export-window-bar">
          <div className="export-window-dots">
            <span className="dot-red" />
            <span className="dot-yellow" />
            <span className="dot-green" />
          </div>
          <span className="export-window-title">Ruby · Güvenlik Analiz Raporu</span>
        </header>

        <div className="export-card-body">
          <div className="export-report-header">
            <div>
              <span className="export-eyebrow">MAIL VE LİNK GÜVENLİK ANALİZİ</span>
              <h2>Analiz sonucu</h2>
              {tarih && <time>{tarih}</time>}
            </div>
            <div className={`export-risk export-risk-${veri.seviye.toLowerCase()}`}>
              <strong>{veri.seviye}</strong>
              <span>{veri.riskPuani}/40 risk puanı</span>
            </div>
          </div>

          <section className="export-section export-content">
            <h3>İncelenen içerik</h3>
            <p>{veri.icerik}</p>
          </section>

          <section className="export-section">
            <h3>Tespit edilen riskler</h3>
            <ul className="export-risk-list">
              {veri.bulunanRiskler.map((risk, index) => {
                const puan = veri.riskPuanDetaylari[index] ?? 0;
                return (
                  <li key={index}>
                    <span>{risk}</span>
                    {puan > 0 && <strong>+{puan}</strong>}
                  </li>
                );
              })}
            </ul>
          </section>

          {veri.llmBasarili && (
            <section className="export-llm">
              <div className="export-llm-heading">
                <strong>✦ Ollama yorumu</strong>
                <span>Ek değerlendirme</span>
              </div>
              <p>{veri.llmAciklama}</p>
              <small>Risk puanı güvenlik kurallarıyla hesaplanmıştır.</small>
              <h3>Güvenlik önerileri</h3>
              <ul>
                {veri.llmOnerileri.map((oneri, index) => <li key={index}>{oneri}</li>)}
              </ul>
            </section>
          )}

          <footer className="export-footer">
            <span>RUBY</span>
            <span>Farkındalık amaçlı güvenlik değerlendirmesi</span>
          </footer>
        </div>
      </article>
    </div>
  );
}

function AnalizPaylasim({ analiz }) {
  const [acik, setAcik] = useState(false);
  const [durum, setDurum] = useState("");
  const [indiriliyor, setIndiriliyor] = useState(false);
  const kartRef = useRef(null);

  async function metniKopyala() {
    try {
      await navigator.clipboard.writeText(kopyalanacakMetniOlustur(analiz));
      setDurum("Kopyalandı");
      setTimeout(() => setDurum(""), 1800);
    } catch (hata) {
      console.error("Sonuç kopyalanamadı:", hata);
      setDurum("Kopyalanamadı");
    }
  }

  async function gorselIndir() {
    if (!kartRef.current || indiriliyor) return;

    setIndiriliyor(true);
    setDurum("Görsel hazırlanıyor");
    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const blob = await toBlob(kartRef.current, {
        pixelRatio: 2,
        cacheBust: false,
        backgroundColor: "#edf1f5",
      });
      if (!blob) throw new Error("PNG verisi oluşturulamadı.");

      const gorselUrl = URL.createObjectURL(blob);
      const baglanti = document.createElement("a");
      baglanti.download = `ruby-analiz-${analiz.id ?? Date.now()}.png`;
      baglanti.href = gorselUrl;
      baglanti.style.display = "none";
      document.body.appendChild(baglanti);
      baglanti.click();
      baglanti.remove();
      setTimeout(() => URL.revokeObjectURL(gorselUrl), 1000);
      setDurum("PNG indirildi");
      setTimeout(() => setDurum(""), 1800);
    } catch (hata) {
      console.error("Rapor görseli oluşturulamadı:", hata);
      setDurum("Görsel oluşturulamadı");
    } finally {
      setIndiriliyor(false);
    }
  }

  return (
    <div className="share-wrap">
      <button
        className="share-trigger"
        type="button"
        aria-expanded={acik}
        onClick={() => setAcik((deger) => !deger)}
      >
        <span className="share-trigger-icon"><PaylasimIkonu tur="paylas" /></span>
        <span className="share-trigger-copy">
          <strong>Sonuç işlemleri</strong>
          <small>Raporu kopyalayın veya görsel olarak kaydedin</small>
        </span>
        <span className="share-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20"><path d={acik ? "m5 12.5 5-5 5 5" : "m5 7.5 5 5 5-5"} /></svg>
        </span>
      </button>

      {acik && (
        <div className="share-panel" role="group" aria-label="Analiz sonucu işlemleri">
          <button type="button" onClick={metniKopyala}>
            <span className="share-action-icon"><PaylasimIkonu tur="kopyala" /></span>
            <span><strong>Metni kopyala</strong><small>İçerik ve sonucu düzenli metin olarak al</small></span>
          </button>
          <button type="button" onClick={gorselIndir} disabled={indiriliyor}>
            <span className="share-action-icon"><PaylasimIkonu tur="gorsel" /></span>
            <span><strong>Görsel olarak indir</strong><small>Özel tasarımlı rapor kartını PNG olarak kaydet</small></span>
          </button>
          {durum && <p className="share-status" role="status" aria-live="polite">{durum}</p>}
        </div>
      )}

      <IndirmeKarti analiz={analiz} kartRef={kartRef} />
    </div>
  );
}

export default AnalizPaylasim;
