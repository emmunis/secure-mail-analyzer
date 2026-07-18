import { useState } from 'react';

const SORULAR = [
  {
    soru: "Ruby tam olarak ne işe yarar?",
    cevap: "Ruby, size gelen şüpheli e-posta, SMS veya bağlantıları (linkleri) gelişmiş yapay zeka algoritmalarıyla analiz ederek oltalama (phishing) saldırılarına karşı sizi koruyan dijital bir güvenlik asistanıdır.",
  },
  {
    soru: "Analiz işlemi ne kadar sürer?",
    cevap: "Gelişmiş mimarimiz sayesinde analiz işlemi genellikle saniyeler içinde tamamlanır. Sistem, metni ve bağlantıları tarayarak size anında detaylı bir risk skoru ve raporu sunar.",
  },
  {
    soru: "Kişisel verilerim analiz sırasında kaydediliyor mu?",
    cevap: "Gizliliğiniz bizim için ön plandadır. Analiz için yapıştırdığınız içerikler yalnızca o anki güvenlik taraması için işlenir ve analiz bittikten sonra sizin kendi \"Geçmiş\" sekmeniz dışında hiçbir veritabanında açık metin olarak saklanmaz.",
  },
  {
    soru: "Hangi tür tehditleri tespit edebilir?",
    cevap: "Ruby; sahte ve manipüle edilmiş domainleri, Kiril/Yunan alfabesiyle gizlenmiş görünmez karakterleri, sahte gönderici adreslerini ve kurbanı paniğe sürükleyen psikolojik baskı dillerini başarıyla tespit eder.",
  },
  {
    soru: "Sisteminiz %100 doğru sonuç verir mi?",
    cevap: "Yapay zeka modellerimiz sürekli öğrenip gelişse de, siber saldırı yöntemleri sürekli değiştiği için hiçbir güvenlik aracı %100 garanti veremez. Ruby size çok yüksek doğrulukta bir rehberlik sunar, ancak bağlantılara tıklarken son kontrol her zaman sizin inisiyatifinizdedir.",
  },
];

function Faq() {
  const [acikSorular, setAcikSorular] = useState(new Set());

  function sorularAcKapat(index) {
    setAcikSorular((onceki) => {
      const yeni = new Set(onceki);
      if (yeni.has(index)) {
        yeni.delete(index);
      } else {
        yeni.add(index);
      }
      return yeni;
    });
  }

  return (
    <section className="faq-section">
      <div className="section-header">
        <h2>Sıkça Sorulan Sorular</h2>
        <p>Ruby ve dijital güvenlik asistanınız hakkında en çok merak edilenler.</p>
      </div>

      <div className="faq-container">
        {SORULAR.map((s, index) => {
          const acikMi = acikSorular.has(index);
          return (
            <div className="faq-item" key={index}>
              <button
                className={`faq-question ${acikMi ? "active" : ""}`}
                onClick={() => sorularAcKapat(index)}
              >
                {s.soru} <span className="faq-icon">+</span>
              </button>
              <div className={`faq-answer-wrapper ${acikMi ? "open" : ""}`}>
                <div className="faq-answer">
                  <p>{s.cevap}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Faq;