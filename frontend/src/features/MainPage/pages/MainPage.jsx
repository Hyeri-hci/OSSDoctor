import React, { useEffect } from "react";
import { Layout } from "../../../components/layout";
import { useAuth } from "../../../hooks/useAuth";
import { initiateGitHubLogin } from "../../../utils/github-auth";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import RecommendedProjectsSection from "../components/RecommendedProjectsSection";

export default function MainPage() {
    const { isAuthenticated, checkAuthStatus, handleLogin } = useAuth();

    // OAuth 콜백 처리 - 백엔드에서 리다이렉트된 결과 처리
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authStatus = urlParams.get('auth');
        const user = urlParams.get('user');

        if (authStatus === 'success' && user) {
            handleLogin(); // 로그인 상태 업데이트

            // 저장된 리다이렉션 페이지가 있는지 확인
            const redirectAfterLogin = sessionStorage.getItem('redirectAfterLogin');
            if (redirectAfterLogin) {
                // 저장된 페이지로 리다이렉션
                sessionStorage.removeItem('redirectAfterLogin'); // 사용 후 제거
                window.location.href = redirectAfterLogin;
                return;
            }

            // URL에서 파라미터 제거 (기본 동작)
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (authStatus === 'error') {
            console.error('OAuth 로그인 실패');
            alert('로그인에 실패했습니다. 다시 시도해주세요.');

            // 저장된 리다이렉션 정보 정리
            sessionStorage.removeItem('redirectAfterLogin');

            // URL에서 파라미터 제거
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [handleLogin]);

    // 진단 기능 클릭 핸들러
    const handleDiagnosisClick = () => {
        window.location.href = "/diagnose";
    };

    const handleAnalyze = (url) => {
        if(url && url.trim() !== "") {
            const trimmedUrl = url.trim();

            // GitHub URL 패턴 (full URL)
            const githubUrlPattern = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
            // owner/repo 패턴
            const ownerRepoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

            if(githubUrlPattern.test(trimmedUrl)) {
                // GitHub URL에서 owner/name 추출
                const githubUrlMatch = trimmedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
                if(githubUrlMatch) {
                    const [, owner, name] = githubUrlMatch;
                    const cleanName = name.replace(/\.git$/, ""); // .git 제거
                    window.location.href = `/diagnose?repo=${encodeURIComponent(owner)}/${encodeURIComponent(cleanName)}`;
                }
            } else if(ownerRepoPattern.test(trimmedUrl)) {
                // owner/repo 형식 직접 사용
                window.location.href = `/diagnose?repo=${encodeURIComponent(trimmedUrl)}`;
            } else {
                alert('올바른 GitHub 주소를 입력해 주세요.\n예: microsoft/vscode 또는 https://github.com/microsoft/vscode');
            }
        } else {
            alert('GitHub 레포지토리 주소를 입력해주세요.');
        }
    };

    // 기여 기능 클릭 핸들러
    const handleContributionClick = async () => {
        // 로그인 체크
        if (!isAuthenticated) {
            await checkAuthStatus();

            if (!isAuthenticated) {
                alert('GitHub 로그인이 필요한 서비스입니다.');
                try {
                    initiateGitHubLogin({
                        scope: "read:user,user:email,public_repo",
                        redirectAfterLogin: "/myactivity"
                    });
                } catch (error) {
                    console.error('GitHub 로그인 시작 실패:', error);
                    alert('로그인 기능에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
                }
                return;
            }
        }

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