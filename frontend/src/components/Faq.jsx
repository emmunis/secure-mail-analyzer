import { useState } from 'react';

const SORULAR = [
  {
    soru: "Ruby tam olarak ne işe yarar?",
    cevap: "Ruby; şüpheli e-posta, SMS ve bağlantıları güvenlik kurallarıyla tarar, 40 üzerinden bir risk puanı hesaplar ve tespit ettiği göstergeleri açıklar. İsterseniz Ollama desteğiyle sonuca ek bir senaryo değerlendirmesi ve güvenlik önerileri de eklenir.",
  },
  {
    soru: "Analiz işlemi ne kadar sürer?",
    cevap: "Kural tabanlı tarama genellikle birkaç saniye içinde tamamlanır. LLM ile yorumlama açıksa süre; kullanılan cihaza, Ollama modelinin hazır olup olmadığına ve içerik uzunluğuna göre biraz artabilir.",
  },
  {
    soru: "Kişisel verilerim analiz sırasında kaydediliyor mu?",
    cevap: "Analiz içeriği ve sonucu, yalnızca aynı ziyaretçiye ait Geçmiş ekranının çalışabilmesi için kaydedilir. Ayrıca hangi risk türlerinin daha sık görüldüğünü toplu olarak ölçerek farkındalık çalışmalarımızı geliştirmek için anonim istatistiklerden yararlanırız; yönetim ekranında mesaj içeriği yerine bu toplulaştırılmış risk verileri gösterilir. Bu kullanımı size açıkça bildiriyor, analiz alanına gereksiz kişisel bilgi eklememenizi öneriyoruz.",
  },
  {
    soru: "Hangi tür tehditleri tespit edebilir?",
    cevap: "Ruby; aciliyet ve baskı dili, parola veya ödeme bilgisi talepleri, güvensiz HTTP bağlantıları, doğrudan IP adresleri, link kısaltıcılar, şüpheli dosya ekleri, genel hitaplar, olağandışı domainler ve marka-domain uyuşmazlıkları gibi yaygın oltalama göstergelerini denetler.",
  },
  {
    soru: "Sisteminiz %100 doğru sonuç verir mi?",
    cevap: "Hayır. Siber saldırı yöntemleri sürekli değiştiği için hiçbir güvenlik aracı %100 doğruluk garanti edemez. Ruby karar vermenize yardımcı olan bir farkındalık aracıdır; göndereni ve bağlantıyı resmî kanallardan ayrıca doğrulamanız gerekir.",
  },
  {
    soru: "Ollama yorumu risk puanını değiştirir mi?",
    cevap: "Hayır. Risk puanı yalnızca açıklanabilir güvenlik kurallarıyla hesaplanır. Ollama; bu puanı değiştirmeden, tespit edilen göstergeleri olası saldırı senaryosuyla ilişkilendirir ve duruma uygun güvenlik önerileri sunar.",
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
