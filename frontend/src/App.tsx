import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return "nav-link" + (isActive ? " nav-link--active" : "");
}

const NAV_BREAKPOINT = 900;

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${NAV_BREAKPOINT}px)`);
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const links = (
    <>
      <NavLink to="/" className={navClass} end>
        홈
      </NavLink>
      <NavLink to="/history/worldcup" className={navClass}>
        한국 월드컵 이력
      </NavLink>
      <NavLink to="/2026/worldcup" className={navClass}>
        2026 월드컵 개요
      </NavLink>
      <NavLink to="/2026/korea" className={navClass}>
        2026 한국 대시보드
      </NavLink>
      <NavLink to="/2026/korea/players" className={navClass}>
        한국 대표팀 데이터
      </NavLink>
      <NavLink to="/2026/playoff-d" className={navClass}>
        A조 1차전 상대
      </NavLink>
      <NavLink to="/2026/mexico" className={navClass}>
        멕시코 대표팀
      </NavLink>
      <NavLink to="/2026/south-africa" className={navClass}>
        남아공 대표팀
      </NavLink>
    </>
  );

  return (
    <div className="app-root">
      <header className="site-header">
        <div className="site-header__inner">
          <div className="site-header__bar">
            <NavLink to="/" className="site-brand" end>
              ⚽ 2026 북중미 월드컵
            </NavLink>
            <button
              type="button"
              className="site-nav__toggle"
              aria-expanded={menuOpen}
              aria-controls="site-nav-drawer"
              aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="site-nav__toggle-bars" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            </button>
          </div>
          <nav className="site-nav site-nav--desktop" aria-label="주요 메뉴">
            {links}
          </nav>
        </div>
      </header>

      {menuOpen ? (
        <button
          type="button"
          className="site-nav__backdrop"
          aria-label="메뉴 닫기"
          onClick={() => setMenuOpen(false)}
        />
      ) : null}

      <nav
        id="site-nav-drawer"
        className={"site-nav site-nav--drawer" + (menuOpen ? " site-nav--drawer-open" : "")}
        aria-hidden={!menuOpen}
        aria-label="주요 메뉴"
      >
        {links}
      </nav>

      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
