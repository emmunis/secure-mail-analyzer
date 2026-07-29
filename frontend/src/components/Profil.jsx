import { useEffect, useState } from "react";
import { apiFetch } from "../api";

function Profil() {
  const [istatistik, setIstatistik] = useState(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function verileriGetir() {
      try {
        const response = await apiFetch("/analiz/istatistik");
        if (!response.ok) throw new Error("İstatistikler alınamadı.");
        setIstatistik(await response.json());
      } catch (error) {
        console.error("İstatistikler yüklenirken hata:", error);
        setHata("İstatistikler şu anda yüklenemiyor.");
      }
    }
    verileriGetir();
  }, []);

  const riskDagilimi = istatistik?.riskDagilimi || {};

  return (
    <section className="container">
      <div className="form-card profil-card" style={{ marginTop: "40px" }}>
        <div className="profil-ust">
          <div className="profil-avatar">İS</div>
          <div className="profil-bilgi">
            <h1>İstatistiklerim</h1>
            <p className="profil-mail">Bu tarayıcıda yaptığınız analizlerin özeti</p>
          </div>
        </div>

        {hata && <p className="status-error">{hata}</p>}
        <div className="profil-istatistik">
          <div className="istatistik-kutu">
            <span className="istatistik-sayi">{istatistik?.toplamAnalizSayisi ?? "-"}</span>
            <span className="istatistik-etiket">Toplam Analiz</span>
          </div>
          <div className="istatistik-kutu">
            <span className="istatistik-sayi">{riskDagilimi["Yüksek"] ?? 0}</span>
            <span className="istatistik-etiket">Yüksek Risk</span>
          </div>
        </div>

        {istatistik?.enSikRiskTipleri?.length > 0 && (
          <div className="en-sik-riskler">
            <h3>En Sık Görülen Risk Tipleri</h3>
            <ul>
              {istatistik.enSikRiskTipleri.map((item) => (
                <li key={item.risk}>
                  <span>{item.risk}</span>
                  <span className="risk-sayac">{item.sayi}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="profil-not">
          Hesap açmanız gerekmez. Geçmişiniz bu tarayıcıya özel anonim bir kimlikle saklanır.
        </p>
      </div>
    </section>
  );
}

export default Profil;
