import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import PlayerFeatures from "./pages/PlayerFeatures";
import WorldCup2026Korea from "./pages/WorldCup2026Korea";
import KoreaWorldCupHistory from "./pages/KoreaWorldCupHistory";
import WorldCup2026Guide from "./pages/WorldCup2026Guide";
import MexicoTeam from "./pages/MexicoTeam";
import SouthAfricaTeam from "./pages/SouthAfricaTeam";
import CzechTeam from "./pages/CzechTeam";
import KoreaAiPlayground from "./pages/KoreaAiPlayground";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="history/worldcup" element={<KoreaWorldCupHistory />} />
          <Route path="2026/korea" element={<WorldCup2026Korea />} />
          <Route path="2026/korea/players" element={<PlayerFeatures />} />
          <Route path="2026/korea/playground" element={<KoreaAiPlayground />} />
          <Route path="2026/core-squads" element={<Navigate to="/2026/korea/players" replace />} />
          <Route path="2026/czech-republic" element={<CzechTeam />} />
          <Route path="2026/mexico" element={<MexicoTeam />} />
          <Route path="2026/south-africa" element={<SouthAfricaTeam />} />
          <Route path="2026/worldcup" element={<WorldCup2026Guide />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
