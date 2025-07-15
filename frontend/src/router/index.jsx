import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "../features/MainPage/pages/MainPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
}
