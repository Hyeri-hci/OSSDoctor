import React, { useEffect } from "react";
import { Layout } from "../../../components/layout";
import { useAuth } from "../../../hooks/useAuth";
import { initiateGitHubLogin } from "../../../utils/github-auth";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import RecommendedProjectsSection from "../components/RecommendedProjectsSection";
import useMainRecommendedProjects from "../hooks/useMainRecommendedProjects";

export default function MainPage() {
  const { isAuthenticated, checkAuthStatus, handleLogin } = useAuth();
  const {
    projects: recommendedProjects,
    loading: projectsLoading,
    error: projectsError,
  } = useMainRecommendedProjects();

  // OAuth 콜백 처리 - 백엔드에서 리다이렉트된 결과 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");
    const user = urlParams.get("user");
    const message = urlParams.get("message");

    if (authStatus === "success" && user) {
      handleLogin(); // 로그인 상태 업데이트

      // 저장된 리다이렉션 페이지가 있는지 확인
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin");
      if (redirectAfterLogin) {
        // 저장된 페이지로 리다이렉션
        sessionStorage.removeItem("redirectAfterLogin"); // 사용 후 제거
        window.location.href = redirectAfterLogin;
        return;
      }

      // URL에서 파라미터 제거 (기본 동작)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "session_expired") {
      // Session expired - automatic logout
      console.log("Session expired, automatically logged out");
      alert("Your login session has expired. Please log in again.");

      // Remove parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "server_restarted") {
      // Server restarted - automatic logout
      console.log("Server restarted, automatically logged out");
      alert(
        "The server was restarted and your session has expired. Please log in again.",
      );

      // Remove parameters from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "cancelled") {
      // GitHub OAuth cancelled - normal user behavior
      console.log("GitHub login was cancelled");

      // Clean up stored redirection info
      sessionStorage.removeItem("redirectAfterLogin");

      // Remove parameters from URL (handle silently without alert)
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (authStatus === "error") {
      console.error("OAuth login failed:", message);

      const errorMessage = message
        ? decodeURIComponent(message)
        : "An unknown error occurred";
      alert(`Login failed: ${errorMessage}\nPlease try again.`);

      // 저장된 리다이렉션 정보 정리
      sessionStorage.removeItem("redirectAfterLogin");

      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [handleLogin]);

  // 진단 기능 클릭 핸들러
  const handleDiagnosisClick = () => {
    window.location.href = "/diagnose";
  };

  const handleAnalyze = (url) => {
    if (url && url.trim() !== "") {
      const trimmedUrl = url.trim();

      // GitHub URL 패턴 (full URL)
      const githubUrlPattern =
        /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
      // owner/repo 패턴
      const ownerRepoPattern = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;

      if (githubUrlPattern.test(trimmedUrl)) {
        // GitHub URL에서 owner/name 추출
        const githubUrlMatch = trimmedUrl.match(
          /github\.com\/([^/]+)\/([^/]+)/,
        );
        if (githubUrlMatch) {
          const [, owner, name] = githubUrlMatch;
          const cleanName = name.replace(/\.git$/, ""); // .git 제거
          window.location.href = `/diagnose?repo=${encodeURIComponent(owner)}/${encodeURIComponent(cleanName)}`;
        }
      } else if (ownerRepoPattern.test(trimmedUrl)) {
        // owner/repo 형식 직접 사용
        window.location.href = `/diagnose?repo=${encodeURIComponent(trimmedUrl)}`;
      } else {
        alert(
          "Please enter a valid GitHub address.\nExample: microsoft/vscode or https://github.com/microsoft/vscode",
        );
      }
    } else {
      alert("Please enter a GitHub repository address.");
    }
  };

  // Contribution feature click handler
  const handleContributionClick = async () => {
    // Login check
    if (!isAuthenticated) {
      await checkAuthStatus();

      if (!isAuthenticated) {
        alert("GitHub login is required to use this service.");
        try {
          initiateGitHubLogin({
            scope: "read:user,user:email,public_repo",
            redirectAfterLogin: "/myactivity",
          });
        } catch (error) {
          console.error("Failed to start GitHub login:", error);
          alert(
            "There was a problem with the login feature. Please try again later.",
          );
        }
        return;
      }
    }

    window.location.href = "/myactivity";
  };

  // Ecosystem navigation click handler
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
        <RecommendedProjectsSection
          projects={recommendedProjects}
          loading={projectsLoading}
          error={projectsError}
        />
      </div>
    </Layout>
  );
}

MainPage.displayName = "MainPage";
