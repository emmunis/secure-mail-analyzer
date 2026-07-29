import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

function Gecmis() {
  const [kayitlar, setKayitlar] = useState([]);
  const [filtre, setFiltre] = useState("All");
  const [yukleniyor, setYukleniyor] = useState(true);
  const [acikId, setAcikId] = useState(null); // hangi kayıt genişletilmiş

  // Component ekrana ilk geldiğinde geçmişi çek
  useEffect(() => {
    async function kayitlariGetir() {
      try {
        const response = await apiFetch("/analiz");
        if (!response.ok) throw new Error("Geçmiş alınamadı: " + response.status);
        const veriler = await response.json();
        setKayitlar(veriler);
      } catch (hata) {
        console.error("Geçmiş yüklenirken hata:", hata);
      } finally {
        setYukleniyor(false);
      }
    }

    kayitlariGetir();
  }, []);

  async function kayitSil(id) {
    if (!confirm("Bu analizi geçmişten silmek istediğinize emin misiniz?")) return;

    try {
      const response = await apiFetch(`/analiz/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Silme başarısız: " + response.status);

      // Silinen kaydı ekrandan da kaldır (backend'e tekrar sormaya gerek yok)
      setKayitlar((onceki) => onceki.filter((k) => k.id !== id));
    } catch (hata) {
      console.error("Silme sırasında hata:", hata);
      alert("Kayıt silinirken bir hata oluştu.");
    }
  }

  async function tumunuTemizle() {
    if (kayitlar.length === 0) return alert("Silinecek geçmiş bulunmuyor.");
    if (!confirm("Tüm analiz geçmişini kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) return;

    try {
      const response = await apiFetch("/analiz/tumunu-sil", { method: "DELETE" });
      if (!response.ok) throw new Error("Toplu silme başarısız: " + response.status);

      setKayitlar([]);
    } catch (hata) {
      console.error("Toplu silme sırasında hata:", hata);
      alert("Geçmiş silinirken bir hata oluştu.");
    }
  }

  const filtrelenmis = filtre === "All"
    ? kayitlar
    : kayitlar.filter((k) => k.seviye === filtre);

  return (
    <section className="container">
      <div className="form-card" style={{ marginTop: "40px", maxWidth: "800px" }}>
        <div className="history-header-wrap">
          <div>
            <h1>Analiz Geçmişi</h1>
            <p>Daha önce yaptığınız analizlerin listesi aşağıdadır.</p>
          </div>
          <div className="history-controls">
            <select
              className="history-filter"
              value={filtre}
              onChange={(e) => setFiltre(e.target.value)}
            >
              <option value="All">Tümü</option>
              <option value="Yüksek">Yüksek Risk</option>
              <option value="Orta">Orta Risk</option>
              <option value="Düşük">Düşük Risk</option>
            </select>
            <button className="btn-danger" onClick={tumunuTemizle}>
              Tümünü Temizle
            </button>
          </div>
        </div>

        <ul className="history-list">
          {yukleniyor && <p>Yükleniyor...</p>}

          {!yukleniyor && filtrelenmis.length === 0 && (
            <p>Bu kritere uygun geçmiş kaydı bulunmuyor.</p>
          )}

          {!yukleniyor && filtrelenmis.map((kayit) => {
            const bulunanRisklerDizi = kayit.bulunanRiskler.split(" | ");
            const tarihMetni = new Date(kayit.tarih).toLocaleString("tr-TR");
            const skor = Math.min(kayit.riskPuani, 10);
            const kisaIcerik = kayit.icerik.length > 80
              ? kayit.icerik.substring(0, 80) + "..."
              : kayit.icerik;
            const acikMi = acikId === kayit.id;

            return (
              <li
                key={kayit.id}
                className="history-item accordion-item"
                onClick={(e) => {
                  if (e.target.closest(".delete-history-btn")) return;
                  if (e.target.closest(".history-details")) return;
                  if (window.getSelection().toString() !== "") return;
                  setAcikId(acikMi ? null : kayit.id);
                }}
              >
                <div className="history-item-header">
                  <div className="header-left">
                    <span className={`result-badge risk-${kayit.seviye.toLowerCase()}`}>
                      {kayit.seviye} Risk ({skor}/10)
                    </span>
                    <span className="result-score" style={{ marginLeft: "10px" }}>
                      {tarihMetni}
                    </span>
                  </div>
                  <button
                    className="delete-history-btn"
                    title="Bu kaydı sil"
                    onClick={(e) => {
                      e.stopPropagation();
                      kayitSil(kayit.id);
                    }}
                  >
                    ✕
                  </button>
                </div>

                <div className="history-summary">
                  <p><strong>İncelenen:</strong> {kisaIcerik}</p>
                  <span className="expand-hint">
                    {acikMi ? "Detayları gizle ▲" : "Detayları görmek için tıklayın ▼"}
                  </span>
                </div>

                {acikMi && (
                  <div className="history-details">
                    <p><strong>Tam İçerik:</strong><br />{kayit.icerik}</p>
                    <p style={{ marginTop: "10px" }}><strong>Tespit Edilen Riskler:</strong></p>
                    <ul style={{ marginTop: "5px", paddingLeft: "20px" }}>
                      {bulunanRisklerDizi.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Gecmis;
