import React, { useState, useEffect, useRef } from "react";
import { Layout } from "../../../components/layout";
import ProjectInfo from "../components/ProjectInfo";
import DiagnoseSearchSection from "../components/DiagnoseSearchSection";
import DiagnoseTabContent from "../components/DiagnoseTabContent";
import WelcomeGuide from "../components/WelcomeGuide";
import {
  ScoreCards,
  LoadingSpinner,
  EmptyState,
  Button,
} from "../../../components/common";
import { useDiagnose } from "../hooks/useDiagnose";

const Diagnose = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const searchSectionRef = useRef(null);

  // 진단 관련 상태와 로직을 커스텀 훅으로 분리
  const {
    isLoading,
    error,
    projectData,
    fullProjectName,
    handleSearch,
    resetState,
  } = useDiagnose();

  // URL 파라미터에서 repo 정보 확인하여 자동 검색
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const repoParam = urlParams.get("repo");

    if (repoParam) {
      // URL 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname);
      // 자동으로 검색 실행
      handleSearch(repoParam);
    }
  }, [handleSearch]);

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <DiagnoseSearchSection ref={searchSectionRef} onSearch={handleSearch} />

        {/* Main */}
        <div className="bg-white">
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="w-full space-y-6">
                {isLoading ? (
                  <LoadingSpinner
                    message={`Analyzing project ${fullProjectName}. Please wait...`}
                    size="large"
                    color="blue"
                  />
                ) : error ? (
                  <div className="space-y-6">
                    <EmptyState
                      title={
                        error.includes("활동이 없습니다") ||
                        error.includes("no activity")
                          ? "📭 Repository with no activity"
                          : "🔍 Project not found"
                      }
                      message={error}
                      action={
                        <Button
                          onClick={() => {
                            resetState();
                            // Focus on search input
                            if (searchSectionRef.current) {
                              searchSectionRef.current.focusSearchInput();
                            }
                          }}
                          variant="primary"
                        >
                          Search Again
                        </Button>
                      }
                    />

                    {/* Additional guide for repositories with no activity */}
                    {(error.includes("활동이 없습니다") ||
                      error.includes("no activity")) && (
                      <div className="max-w-2xl mx-auto">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <h4 className="text-sm font-semibold text-blue-900 mb-3">
                            What is a repository with no activity?
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>
                                An empty repository with no code uploaded yet
                              </span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>A repository with no commit history</span>
                            </li>
                            <li className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>
                                A repository that was initialized but
                                development hasn't started
                              </span>
                            </li>
                          </ul>
                          <div className="mt-4 pt-4 border-t border-blue-200">
                            <p className="text-sm text-blue-800">
                              Please upload code and create commits, then try
                              diagnosing again.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : projectData ? (
                  <>
                    <ProjectInfo projectData={projectData} />
                    <ScoreCards
                      scores={projectData?.scores || {}}
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      variant="diagnose"
                    />
                    <DiagnoseTabContent
                      activeTab={activeTab}
                      loading={isLoading}
                      projectData={projectData}
                      fullProjectName={fullProjectName}
                    />
                  </>
                ) : (
                  <WelcomeGuide />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Diagnose;
