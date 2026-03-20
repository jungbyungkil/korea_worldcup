import { NavLink, Outlet } from "react-router-dom";

function navClass({ isActive }: { isActive: boolean }) {
  return "nav-link" + (isActive ? " nav-link--active" : "");
}

export default function App() {
  return (
    <div className="app-root">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink to="/" className="site-brand" end>
            ⚽ 2026 북중미 월드컵
          </NavLink>
          <nav className="site-nav" aria-label="주요 메뉴">
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
              국대 선수 데이터
            </NavLink>
          </nav>
        </div>
      </header>
      <div className="app-main">
        <Outlet />
      </div>
    </div>
  );
}
