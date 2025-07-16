import React from "react";
import HeaderSection from "../../../components/common/HeaderSection";
import FooterSection from "../../../components/common/FooterSection";
export default function MainPage() {
  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col items-center justify-center">
          <HeaderSection />
          <FooterSection />
    </div>
  );
}

MainPage.displayName = "MainPage";