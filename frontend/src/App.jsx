import React from "react";
import AppRouter from "./router/index";
import { MyActivityProvider } from "./contexts/MyActivityContext";
import './index.css'

export default function App() {
  return (
    <MyActivityProvider>
      <div>
        <AppRouter />
      </div>
    </MyActivityProvider>
  );
}