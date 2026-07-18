import heroImg from '../assets/ruby-icon.png';

function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Dijital Dünyadaki<br />Kalkanınız.
        </h1>
        <p className="hero-subtitle">
          Ruby, yeni nesil yapay zeka mimarisi ile şüpheli bağlantıları ve
          e-postaları anında analiz eder. Phishing saldırılarına karşı
          korunmak için özelliklerimizi keşfedin.
        </p>
        <a href="#analiz-alani" className="hero-btn">Hemen Analiz Et</a>
      </div>
      <div className="hero-visual">
        <img src={heroImg} alt="Güvenlik Analizi" className="hero-image" />
      </div>
    </section>
  );
}

export default Hero;