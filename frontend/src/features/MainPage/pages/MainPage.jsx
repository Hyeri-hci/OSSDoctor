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
            const trimmedUrl = url.trim();
            const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

            if(githubUrlPattern.test(trimmedUrl)) { 
                // github url에서 owner/name 추출하여 진단 페이지로 이동
                const githubUrlMatch = trimmedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                if(githubUrlMatch) {
                    const [, owner, name] = githubUrlMatch;
                    const cleanName = name.replace(/\.git$/, ""); // .git 제거
                    window.location.href = `/diagnose?owner=${encodeURIComponent(owner)}&name=${encodeURIComponent(cleanName)}`;
                }
            } else {
                alert('유효한 GitHub URL을 입력해주세요.\n예: https://github.com/user/repo');
            }
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