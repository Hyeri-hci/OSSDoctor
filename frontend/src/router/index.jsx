import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Importing the page components
import MainPage from "../features/MainPage/pages/MainPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main Page Route Path */}
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}