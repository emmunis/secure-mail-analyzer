function Header({ aktifSekme, setAktifSekme }) {
  return (
    <header className="main-header">
      <a
        href="#"
        className={`title ${aktifSekme === "ana" ? "active" : ""}`}
        onClick={(e) => {
          e.preventDefault();
          setAktifSekme("ana");
        }}
      >
        Ruby
      </a>
      <nav className="main-nav">
        <ul className="main-nav_ul">
          <li className="main-nav_li">
            <a
              href="#"
              className={aktifSekme === "gecmis" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAktifSekme("gecmis");
              }}
            >
              Geçmiş
            </a>
          </li>
          <li className="main-nav_li">
            <a
              href="#"
              className={aktifSekme === "profil" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAktifSekme("profil");
              }}
            >
              İstatistiklerim
            </a>
          </li>
          <li className="main-nav_li">
            <a
              href="#"
              className={aktifSekme === "admin" ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setAktifSekme("admin");
              }}
            >
              Admin
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
