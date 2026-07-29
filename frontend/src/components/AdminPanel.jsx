import { useState } from "react";
import { apiFetch } from "../api";

function AdminPanel() {
  const [sifre, setSifre] = useState("");
  const [token, setToken] = useState(() => sessionStorage.getItem("ruby_admin_token"));
  const [istatistik, setIstatistik] = useState(null);
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function istatistikleriGetir(guncelToken) {
    const response = await apiFetch("/admin/istatistik", {
      headers: { Authorization: `Bearer ${guncelToken}` },
    });

    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem("ruby_admin_token");
      setToken(null);
      throw new Error("Oturumun süresi doldu. Lütfen tekrar giriş yapın.");
    }
    if (!response.ok) throw new Error("Admin istatistikleri alınamadı.");
    setIstatistik(await response.json());
  }

  async function girisYap(event) {
    event.preventDefault();
    setYukleniyor(true);
    setHata("");
    try {
      const response = await apiFetch("/admin/giris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sifre }),
      });
      if (!response.ok) {
        throw new Error(response.status === 503
          ? "Admin erişimi backend üzerinde henüz yapılandırılmamış."
          : "Yönetici parolası hatalı.");
      }

      const veri = await response.json();
      sessionStorage.setItem("ruby_admin_token", veri.token);
      setToken(veri.token);
      setSifre("");
      await istatistikleriGetir(veri.token);
    } catch (error) {
      setHata(error.message);
    } finally {
      setYukleniyor(false);
    }
  }

  async function paneliYukle() {
    if (!token) return;
    setYukleniyor(true);
    setHata("");
    try {
      await istatistikleriGetir(token);
    } catch (error) {
      setHata(error.message);
    } finally {
      setYukleniyor(false);
    }
  }

  function cikisYap() {
    sessionStorage.removeItem("ruby_admin_token");
    setToken(null);
    setIstatistik(null);
    setHata("");
  }

  if (!token) {
    return (
      <section className="container">
        <form className="form-card admin-login-card" onSubmit={girisYap}>
          <h1>Yönetici Girişi</h1>
          <p>Genel platform istatistiklerine erişmek için yönetici parolasını girin.</p>
          <label className="admin-label" htmlFor="admin-sifre">Parola</label>
          <input
            id="admin-sifre"
            className="admin-input"
            type="password"
            value={sifre}
            onChange={(event) => setSifre(event.target.value)}
            autoComplete="current-password"
            required
          />
          {hata && <p className="status-error">{hata}</p>}
          <button className="btn" disabled={yukleniyor}>
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="container">
      <div className="form-card admin-card">
        <div className="admin-heading">
          <div>
            <h1>Admin Paneli</h1>
            <p>Tüm ziyaretçilere ait anonim, toplu analiz istatistikleri.</p>
          </div>
          <button className="btn-secondary" onClick={cikisYap}>Çıkış</button>
        </div>

        {!istatistik && (
          <button className="btn" disabled={yukleniyor} onClick={paneliYukle}>
            {yukleniyor ? "Yükleniyor..." : "İstatistikleri Göster"}
          </button>
        )}
        {hata && <p className="status-error">{hata}</p>}

        {istatistik && (
          <>
            <div className="admin-stats-grid">
              <div className="istatistik-kutu">
                <span className="istatistik-sayi">{istatistik.toplamAnalizSayisi}</span>
                <span className="istatistik-etiket">Toplam Analiz</span>
              </div>
              <div className="istatistik-kutu">
                <span className="istatistik-sayi">{istatistik.benzersizZiyaretciSayisi}</span>
                <span className="istatistik-etiket">Anonim Ziyaretçi</span>
              </div>
              {Object.entries(istatistik.riskDagilimi).map(([seviye, sayi]) => (
                <div className="istatistik-kutu" key={seviye}>
                  <span className="istatistik-sayi">{sayi}</span>
                  <span className="istatistik-etiket">{seviye} Risk</span>
                </div>
              ))}
            </div>

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
          </>
        )}
      </div>
    </section>
  );
}

export default AdminPanel;
