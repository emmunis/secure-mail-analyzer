import { useState, useEffect } from 'react';

const API_BASE_URL = "http://localhost:5108/api/analiz";

function Profil() {
  const [toplam, setToplam] = useState("-");
  const [yuksekRisk, setYuksekRisk] = useState("-");
  const [enSikRiskler, setEnSikRiskler] = useState([]);

  useEffect(() => {
    async function verileriGetir() {
      try {
        const [gecmisRes, istatistikRes] = await Promise.all([
          fetch(API_BASE_URL),
          fetch(`${API_BASE_URL}/istatistik`),
        ]);

        const gecmis = await gecmisRes.json();
        const istatistik = await istatistikRes.json();

        setToplam(gecmis.length);
        setYuksekRisk(gecmis.filter((k) => k.seviye === "Yüksek").length);
        setEnSikRiskler(istatistik.enSikRiskTipleri || []);
      } catch (hata) {
        console.error("İstatistikler yüklenirken hata:", hata);
        setToplam("-");
        setYuksekRisk("-");
      }
    }

    verileriGetir();
  }, []);

  return (
    <section className="container">
      <div className="form-card profil-card" style={{ marginTop: "40px" }}>
        <div className="profil-ust">
          <div className="profil-avatar">RB</div>
          <div className="profil-bilgi">
            <h1>Kullanıcı</h1>
            <p className="profil-mail">kullanici@ornek.com</p>
          </div>
        </div>

        <div className="profil-istatistik">
          <div className="istatistik-kutu">
            <span className="istatistik-sayi">{toplam}</span>
            <span className="istatistik-etiket">Toplam Analiz</span>
          </div>
          <div className="istatistik-kutu">
            <span className="istatistik-sayi">{yuksekRisk}</span>
            <span className="istatistik-etiket">Yüksek Risk</span>
          </div>
        </div>

        {enSikRiskler.length > 0 && (
          <div className="en-sik-riskler">
            <h3>En Sık Görülen Risk Tipleri</h3>
            <ul>
              {enSikRiskler.map((item, index) => (
                <li key={index}>
                  <span>{item.risk}</span>
                  <span className="risk-sayac">{item.sayi}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="profil-not">
          Not: Kullanıcı hesabı ve giriş sistemi henüz eklenmedi, bu
          bilgiler şu an örnektir.
        </p>
      </div>
    </section>
  );
}

export default Profil;