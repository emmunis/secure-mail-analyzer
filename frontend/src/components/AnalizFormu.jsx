import { useState } from 'react';

const API_BASE_URL = "http://localhost:5108/api/analiz";

function AnalizFormu() {
  const [icerik, setIcerik] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sonuc, setSonuc] = useState(null); // null = henüz analiz yapılmadı

  async function analizEt() {
    const temizIcerik = icerik.trim();

    if (!temizIcerik) {
      alert("Lütfen analiz edilecek bir mail içeriği veya link girin.");
      return;
    }

    setYukleniyor(true);
    setSonuc(null);

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ icerik: temizIcerik }),
      });

      if (!response.ok) throw new Error("Sunucu hatası: " + response.status);

      const veri = await response.json();

      setSonuc({
        ...veri,
        bulunanRiskler: veri.bulunanRiskler.split(" | "),
      });
    } catch (hata) {
      console.error("Analiz sırasında hata:", hata);
      alert("Sunucuya bağlanılamadı. Backend'in çalıştığından emin olun (dotnet run).");
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

        <div className="content-footer">
          <button className="btn" disabled={yukleniyor} onClick={analizEt}>
            {yukleniyor ? "Analiz ediliyor..." : "Analiz Et"}
          </button>
        </div>

        {sonuc && (
          <div className="result-card" style={{ display: "block" }}>
            <div className="result-header">
              <span className={`result-badge risk-${sonuc.seviye.toLowerCase()}`}>
                {sonuc.seviye}
              </span>
              <span className="result-score">Risk puanı: {sonuc.riskPuani}</span>
            </div>
            <ul className="result-list">
              {sonuc.bulunanRiskler.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default AnalizFormu;