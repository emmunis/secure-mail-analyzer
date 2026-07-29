import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AnalizFormu from './components/AnalizFormu';
import Slider from './components/Slider';
import BlogBolumu from './components/BlogBolumu';
import Gecmis from './components/Gecmis';
import Profil from './components/Profil';
import AdminPanel from './components/AdminPanel';
import Faq from './components/Faq';
import Footer from './components/Footer';
import './style.css';

function App() {
  const [aktifSekme, setAktifSekme] = useState("ana");

  return (
    <>
      <Header aktifSekme={aktifSekme} setAktifSekme={setAktifSekme} />
      <main className="main-wrapper">
        {aktifSekme === "ana" && (
          <div className="sekme-icerik">
            <Hero />
            <AnalizFormu />
            <Slider />
            <BlogBolumu />
          </div>
        )}
        {aktifSekme === "gecmis" && (
          <div className="sekme-icerik">
            <Gecmis />
          </div>
        )}
        {aktifSekme === "profil" && (
          <div className="sekme-icerik">
            <Profil />
          </div>
        )}
        {aktifSekme === "admin" && (
          <div className="sekme-icerik">
            <AdminPanel />
          </div>
        )}
      </main>

      <Faq />
      <Footer />
    </>
  );
}

export default App;
