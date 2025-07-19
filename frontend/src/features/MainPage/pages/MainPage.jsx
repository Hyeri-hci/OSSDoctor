import React from "react";
import { Layout } from "../../../components/layout";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import RecommendedProjectsSection from "../components/RecommendedProjectsSection";

export default function MainPage() {

    // 진단 기능 클릭 핸들러
    const handleDiagnosisClick = () => {
        window.location.href = "/diagnose";
    };

    const handleAnalyze = (url) => {
        if(url && url.trim() !== "") {
            console.log("Analyzing URL:", url);
            // URL 분석 로직 추가
        } else {
            alert('유효한 URL을 입력해주세요.');
        }
    };

    // 기여도 분석 기능 클릭 핸들러
    const handleContributionClick = () => {
        window.location.href = "/myactivity";
    };

    // 에코시스템 탐색 기능 클릭 핸들러
    const handleEcosystemClick = () => {
        window.location.href = "/ecosystem";
    };

    return (
        <Layout>
            <div className="w-full min-h-screen">
                <HeroSection onAnalyze={handleAnalyze} />
                <FeaturesSection
                    onDiagnosisClick={handleDiagnosisClick}
                    onContributionClick={handleContributionClick}
                    onEcosystemClick={handleEcosystemClick}
                />
                <RecommendedProjectsSection />
            </div>
        </Layout>
    );
}

MainPage.displayName = "MainPage";