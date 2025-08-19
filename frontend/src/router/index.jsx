import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing the page components
import MainPage from "../features/MainPage/pages/MainPage";
import DiagnosePage from "../features/Diagnose/pages/DiagnosePage";
import MyActivityPage from "../features/MyActivity/pages/MyActivityPage";
import EcosystemPage from "../features/Ecosystem/pages/EcosystemPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Page Route Path */}
        <Route path="/" element={<MainPage />} />

        {/* Diagnose Page Route Path */}
        <Route path="/diagnose" element={<DiagnosePage />} />

        {/* My Activity Page Route Path */}
        <Route path="/myactivity" element={<MyActivityPage />} />

        {/* Ecosystem Page Route Path */}
        <Route path="/ecosystem" element={<EcosystemPage />} />
        
        
      </Routes>
    </BrowserRouter>
  );
}