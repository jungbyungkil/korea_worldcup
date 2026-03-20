import { StrictMode } from "react";
import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import PlayerFeatures from "./pages/PlayerFeatures";
import WorldCup2026Korea from "./pages/WorldCup2026Korea";
import KoreaWorldCupHistory from "./pages/KoreaWorldCupHistory";
import WorldCup2026Guide from "./pages/WorldCup2026Guide";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="history/worldcup" element={<KoreaWorldCupHistory />} />
          <Route path="2026/korea" element={<WorldCup2026Korea />} />
          <Route path="2026/korea/players" element={<PlayerFeatures />} />
          <Route path="2026/worldcup" element={<WorldCup2026Guide />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
