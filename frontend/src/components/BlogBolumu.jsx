function BlogBolumu() {
  return (
    <section className="blog-container">
      <div className="section-header">
        <h2>Gözünüzden Kaçabilecek Bazı Dikkatsizlikler</h2>
        <p>
          Siber saldırganların sizi tuzağa düşürmek için kullandığı yaygın
          ve gizli taktikleri keşfedin.
        </p>
      </div>

      <div className="blog-item">
        <div className="blog-text">
          <div className="blog-title-wrap">
            <span className="blog-icon">🏛️</span>
            <h3>Otorite Kullanımı</h3>
          </div>
          <p>
            Mail, yönetici veya avukat gibi üst düzey bir kurum tarafından
            gönderilmiş gibi mi davranıyor?
          </p>
        </div>
        <div className="blog-visual">
          <div className="mockup-window">
            <div className="mockup-header">
              <span className="mockup-avatar">CEO</span>
              <div className="mockup-sender">
                <strong>Genel Müdürlük</strong>
                <span>ceo@sirket-mail.com</span>
              </div>
            </div>
            <div className="mockup-line long"></div>
            <div className="mockup-line medium"></div>
          </div>
        </div>
      </div>

      <div className="blog-item">
        <div className="blog-text">
          <div className="blog-title-wrap">
            <span className="blog-icon">🎁</span>
            <h3>Merak Uyandırma</h3>
          </div>
          <p>
            "Sizinle ilgili sızdırılan fotoğraflar" veya "Ödül kazandınız"
            gibi manipülatif içerikler var mı?
          </p>
        </div>
        <div className="blog-visual">
          <div className="mockup-alert">
            <div className="alert-icon">⚠️</div>
            <div className="alert-content">
              <strong>Hesabınız Kısıtlandı!</strong>
              <span>Kısıtlamayı kaldırmak için tıklayın.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-item">
        <div className="blog-text">
          <div className="blog-title-wrap">
            <span className="blog-icon">🔤</span>
            <h3>Görünmez Karakterler</h3>
          </div>
          <p>
            Domain isminde Latin alfabesi dışında, görsel olarak benzer
            (Kiril/Yunan harfleri) karakterler var mı?
          </p>
        </div>
        <div className="blog-visual">
          <div className="mockup-url-box">
            <span className="safe-text">https://www.</span>g
            <span className="danger-text">о</span>
            ogle.com
            <div className="tooltip">Kiril alfabesinden "o" harfi (U+043E)</div>
          </div>
        </div>
      </div>

      <div className="blog-item">
        <div className="blog-text">
          <div className="blog-title-wrap">
            <span className="blog-icon">🕵️</span>
            <h3>Header Tutarsızlığı</h3>
          </div>
          <p>
            Görünen isim ile gerçek gönderici e-posta adresi
            (Return-Path/Envelope-From) eşleşiyor mu?
          </p>
        </div>
        <div className="blog-visual">
          <div className="mockup-window">
            <div className="code-line">
              Görünen Ad: <span className="safe-text">Apple Destek</span>
            </div>
            <div className="code-line">
              Gerçek Adres: <span className="danger-text">hacker99@mail.ru</span>
            </div>
          </div>
        </div>
      </div>

      <div className="blog-item">
        <div className="blog-text">
          <div className="blog-title-wrap">
            <span className="blog-icon">🔗</span>
            <h3>Görsel Linkleri</h3>
          </div>
          <p>
            Mail içindeki logolar veya butonlar, kurumsal adres yerine başka
            bir dış siteye mi yönlendiriyor?
          </p>
        </div>
        <div className="blog-visual">
          <div className="mockup-button-wrap">
            <div className="mockup-btn">Şifremi Sıfırla</div>
            <div className="cursor-pointer">👆</div>
            <div className="mockup-tooltip">
              Yönlendirme: http://bit.ly/xyz-scam
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogBolumu;