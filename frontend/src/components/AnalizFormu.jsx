import { useState } from 'react';
import { apiFetch } from '../api';
import AnalizPaylasim from './AnalizPaylasim';

function AnalizFormu() {
  const [icerik, setIcerik] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null); // null = henüz analiz yapılmadı
  const [llmIleYorumla, setLlmIleYorumla] = useState(true);

  async function analizEt() {
    const temizIcerik = icerik.trim();

    if (!temizIcerik) {
      alert("Lütfen analiz edilecek bir mail içeriği veya link girin.");
      return;
    }

    setYukleniyor(true);
    setSonuc(null);

    try {
      const response = await apiFetch("/analiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icerik: temizIcerik, llmIleYorumla }),
      });

      if (!response.ok) {
        if (response.status === 429)
          throw new Error("Çok fazla analiz isteği gönderdiniz. Lütfen bir dakika bekleyin.");

        const hataGovdesi = await response.json().catch(() => null);
        const dogrulamaMesaji = hataGovdesi?.errors
          ? Object.values(hataGovdesi.errors).flat()[0]
          : null;

        throw new Error(dogrulamaMesaji || hataGovdesi?.detail || `Sunucu hatası: ${response.status}`);
      }

      const veri = await response.json();

      setSonuc({
        ...veri,
        bulunanRiskler: veri.bulunanRiskler.split(" | "),
        riskPuanDetaylari: veri.riskPuanDetaylari?.split(" | ").map(Number) || [],
        llmOnerileri: veri.llmOnerileri?.split(" | ") || [],
      });
    } catch (hata) {
      console.error("Analiz sırasında hata:", hata);
      alert(hata.message || "Sunucuya bağlanılamadı. Backend'in çalıştığından emin olun.");
    } finally {
      setYukleniyor(false);
    }
  }

  function temizle() {
    setIcerik("");
    setSonuc(null);
  }

  return (
    <section className="container" id="analiz-alani">
      <div className="form-card">
        <h1>Kontrol et, güven kazan</h1>
        <p>
          Dijital dünyada şüphelerinize kulak verin. Şüpheli bulduğunuz
          e-postaları veya bağlantıları analiz edin; gelişmiş yapay zeka
          desteğimizle oltalama (phishing) girişimlerini anında tespit edin
          ve kişisel verilerinizi koruma altına alın.
        </p>

        <div className="content-body">
          <label htmlFor="linkoremail">İçerik</label>
          <div className="textarea-wrapper">
            <textarea
              id="linkoremail"
              rows="5"
              placeholder="Lütfen analiz edilecek bağlantıyı veya e-posta içeriğini buraya yapıştırın..."
              maxLength={20000}
              value={icerik}
              onChange={(e) => setIcerik(e.target.value)}
            />
            {icerik.length > 0 && !yukleniyor && (
              <button
                className="minimal-clear-btn"
                title="İçeriği Temizle"
                onClick={temizle}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <label className="llm-option">
          <input
            type="checkbox"
            checked={llmIleYorumla}
            disabled={yukleniyor}
            onChange={(e) => setLlmIleYorumla(e.target.checked)}
          />
          <span>
            <strong>LLM ile yorumla</strong>
            <small>Ollama, kural tabanlı sonuca ek açıklama ve güvenlik önerileri üretir.</small>
          </span>
        </label>

        <div className="content-footer">
          <span className="character-counter">{icerik.length}/20.000</span>
          <button className="btn" disabled={yukleniyor} onClick={analizEt}>
            {yukleniyor
              ? (llmIleYorumla ? "Analiz ediliyor ve yorumlanıyor..." : "Analiz ediliyor...")
              : "Analiz Et"}
          </button>
        </div>

        {sonuc && (
          <div className="result-card" style={{ display: "block" }}>
            <div className="result-header">
              <span className={`result-badge risk-${sonuc.seviye.toLowerCase()}`}>
                {sonuc.seviye}
              </span>
              <span className="result-score">Risk puanı: {sonuc.riskPuani}/40</span>
            </div>

            <div className="result-content-block">
              <h3>İncelenen içerik</h3>
              <p>{sonuc.icerik || icerik.trim()}</p>
            </div>

            <h3 className="result-section-title">Tespit edilen riskler</h3>
            <ul className="result-list">
              {sonuc.bulunanRiskler.map((risk, index) => (
                <li key={index}>
                  <span>{risk}</span>
                  {(sonuc.riskPuanDetaylari[index] ?? 0) > 0 && (
                    <strong className="risk-point">+{sonuc.riskPuanDetaylari[index]}</strong>
                  )}
                </li>
              ))}
            </ul>

            {sonuc.llmBasarili && (
              <div className="llm-result">
                <div className="llm-result-title">
                  <span>✦ Ollama yorumu</span>
                  <span className="llm-result-note">Ek değerlendirme</span>
                </div>
                <p>{sonuc.llmAciklama}</p>
                <p className="llm-score-info">Risk puanı güvenlik kurallarıyla hesaplanmıştır.</p>
                <strong>Güvenlik önerileri</strong>
                <ul>
                  {sonuc.llmOnerileri.map((oneri, index) => (
                    <li key={index}>{oneri}</li>
                  ))}
                </ul>
              </div>
            )}

            {sonuc.llmIstendi && !sonuc.llmBasarili && (
              <p className="llm-unavailable">
                LLM yorumuna ulaşılamadı. Yukarıdaki kural tabanlı analiz sonucu geçerlidir.
              </p>
            )}

            <AnalizPaylasim analiz={sonuc} />
          </div>
        )}
      </div>
    </section>
  );
}

export default AnalizFormu;
