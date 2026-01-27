import React, { useState, useEffect } from "react";
import { Layout } from "../../../components/layout";
import { ProjectCard } from "../../../components/common";
import useEcosystemView from "../hooks/useEcosystemView";
import useLeaderboardData from "../hooks/useLeaderboardData";
import ActivityLeaderboard from "../components/ActivityLeaderboard";
import ProjectExplorer from "../components/ProjectExplorer";
import { getRecommendedProjectsService } from "../api/index.js";

const EcosystemPage = () => {
  // 기간 설정 상태 (메인 페이지용)
  const [timePeriod, setTimePeriod] = useState("today");

  // 랜덤 프로젝트 선택을 위한 상태
  const [currentProjectPage, setCurrentProjectPage] = useState(0); // 현재 보여주는 페이지 (0부터 시작)
  const [allRecommendedProjects, setAllRecommendedProjects] = useState([]); // 전체 프로젝트
  const [projectsLoading, setProjectsLoading] = useState(false);

  // HeaderSection에서 검색어가 전달된 경우 처리
  const [initialSearchQuery, setInitialSearchQuery] = useState("");

  const PROJECTS_PER_PAGE = 6; // 한 번에 보여줄 프로젝트 수

  // 동적으로 계산되는 페이지 정보
  const totalAvailablePages = Math.ceil(
    allRecommendedProjects.length / PROJECTS_PER_PAGE,
  );
  const hasNextPage = currentProjectPage < totalAvailablePages - 1;
  const hasPrevPage = currentProjectPage > 0;

  // 현재 페이지에 표시할 프로젝트들
  const getCurrentPageProjects = () => {
    const startIndex = currentProjectPage * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    return allRecommendedProjects.slice(startIndex, endIndex);
  };

  // 커스텀 훅을 사용한 뷰 상태 관리
  const {
    currentView,
    navigateToEcosystem,
    navigateToLeaderboard,
    navigateToMain,
  } = useEcosystemView();

  // 리더보드 데이터 (메인 페이지용)
  const {
    leaderboardData,
    loading: leaderboardLoading,
    error: leaderboardError,
  } = useLeaderboardData(timePeriod);

  // URL 파라미터에서 검색어 확인 및 초기화
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get("search");

    if (searchParam) {
      setInitialSearchQuery(decodeURIComponent(searchParam));
      // URL 파라미터 제거 (깔끔한 URL 유지)
      window.history.replaceState({}, document.title, window.location.pathname);

      // ProjectExplorer 뷰로 이동하고 검색어 전달
      if (currentView !== "ecosystem") {
        navigateToEcosystem();
      }
    }
  }, [currentView, navigateToEcosystem]);

  // 추천 프로젝트 로딩 (초보자 친화적인 기준으로 30개 조회)
  useEffect(() => {
    const loadRecommendedProjects = async () => {
      setProjectsLoading(true);
      try {
        // 다양한 초보자 친화적인 기준으로 프로젝트 검색
        const searchQueries = [
          "good-first-issues stars:>1000", // good-first-issues가 있고 인기있는 프로젝트
          "is:public stars:>5000 forks:>100", // 높은 stars와 forks를 가진 인기 프로젝트
          "topic:beginner-friendly stars:>500", // 초보자 친화적인 프로젝트
          "topic:first-timers-only", // 처음 기여자만을 위한 프로젝트
          "topic:documentation stars:>800", // 문서 작업이 필요한 프로젝트
          "topic:open-source stars:>2000", // 오픈소스 친화적 프로젝트
        ];

        const allProjects = [];

        for (const query of searchQueries) {
          try {
            const result = await getRecommendedProjectsService(query, 4);
            if (result.projects && result.projects.length > 0) {
              allProjects.push(...result.projects);
            }
          } catch (queryError) {
            console.warn(`검색 쿼리 "${query}" 실패:`, queryError);
          }

          // 30개 이상 수집되면 중단
          if (allProjects.length >= 30) break;
        }

        // 중복 제거 및 실제 데이터 개수로 제한
        const uniqueProjects = allProjects.filter(
          (project, index, self) =>
            index === self.findIndex((p) => p.id === project.id),
        );

        setAllRecommendedProjects(uniqueProjects);
        setCurrentProjectPage(0); // 첫 페이지로 리셋
      } catch (error) {
        console.error("추천 프로젝트 로딩 실패:", error);
        setAllRecommendedProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };

    loadRecommendedProjects();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 다른 프로젝트 추천받기 핸들러 (다음 페이지로 이동)
  const handleGetNextProjects = () => {
    if (hasNextPage) {
      setCurrentProjectPage((prev) => prev + 1);
    } else {
      // 마지막 페이지면 처음으로 돌아가기
      setCurrentProjectPage(0);
    }
  };

  // 이전 페이지로 이동하는 핸들러
  const handleGetPrevProjects = () => {
    if (hasPrevPage) {
      setCurrentProjectPage((prev) => prev - 1);
    }
  };

  /**
   * 기간 설정 변경 핸들러 (메인 페이지용)
   */
  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
  };

  const renderMainEcosystem = () => {
    return (
      <div className="min-h-screen">
        {/* Ecosystem Header Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                OSS Ecosystem Explorer
              </h1>
              <p className="text-base text-gray-600 mb-8 leading-relaxed">
                Contribute to open source and check your ranking on the
                leaderboard!
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={navigateToEcosystem}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Explore Projects
                </button>
                <button
                  onClick={navigateToLeaderboard}
                  className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium border-2 border-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  View Activity Leaderboard
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* OSS Upcycling Project Suggestions Section */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
            <div className="max-w-7xl mx-auto">
              {/* Section Header */}
              <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  OSS Upcycling Project Suggestions
                </h2>
                <p className="text-base text-gray-600 max-w-3xl mx-auto mb-6">
                  Discover open source projects curated by the community for
                  upcycling
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleGetPrevProjects}
                      disabled={!hasPrevPage || projectsLoading}
                      className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
                    >
                      ← Previous
                    </button>

                    <button
                      onClick={handleGetNextProjects}
                      disabled={
                        allRecommendedProjects.length === 0 || projectsLoading
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                    >
                      {hasNextPage ? "View More Projects" : "Back to Start"}
                      {hasNextPage ? "→" : ""}
                    </button>
                  </div>

                  {/* Page Info */}
                  {totalAvailablePages > 1 && (
                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                      Page {currentProjectPage + 1} / {totalAvailablePages}
                    </div>
                  )}
                </div>
              </div>

              {/* Project Grid */}
              {projectsLoading ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Preparing recommended projects
                  </h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Finding open source projects that are beginner-friendly.
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {getCurrentPageProjects().map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      layout="vertical"
                    />
                  ))}
                </div>
              )}

              {/* When there are no projects */}
              {!projectsLoading &&
                getCurrentPageProjects().length === 0 &&
                allRecommendedProjects.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Unable to load recommended projects
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                      Please check your network connection or try again later.
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                )}

              {/* Explore More Projects Button */}
              <div className="text-center">
                <button
                  onClick={navigateToEcosystem}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Explore More Projects →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Activity Leaderboard Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
            <div className="max-w-7xl mx-auto">
              {/* Header and Period Settings */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-4">
                  Activity Leaderboard
                </h2>
                <p className="text-base text-gray-600 mb-6">
                  Introducing members who actively contributed to projects
                </p>

                {/* Period Settings */}
                <div className="flex justify-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">
                      Period:
                    </span>
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => handleTimePeriodChange("today")}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          timePeriod === "today"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Today
                      </button>
                      <button
                        onClick={() => handleTimePeriodChange("week")}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          timePeriod === "week"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        This Week
                      </button>
                      <button
                        onClick={() => handleTimePeriodChange("month")}
                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                          timePeriod === "month"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        This Month
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {leaderboardLoading ? (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    Loading leaderboard data...
                  </div>
                </div>
              ) : leaderboardError ? (
                <div className="text-center py-8">
                  <div className="text-red-500">{leaderboardError}</div>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No activity{" "}
                    {timePeriod === "today"
                      ? "today"
                      : timePeriod === "week"
                        ? "this week"
                        : "this month"}{" "}
                    yet
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Try selecting a different period.
                  </p>
                  <button
                    onClick={navigateToLeaderboard}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    View Full Leaderboard
                  </button>
                </div>
              ) : (
                <>
                  {/* 상위 3명 시상대 */}
                  <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                    <h3 className="text-lg font-bold text-center mb-8">
                      TOP 3 Rankings
                    </h3>
                    <div className="flex justify-center items-end gap-6 sm:gap-10 mb-8">
                      {/* 2nd Place */}
                      {leaderboardData[1] && (
                        <div className="text-center flex-shrink-0 w-24 sm:w-28">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl sm:text-2xl">🥈</span>
                          </div>
                          <div
                            className="font-semibold text-base sm:text-lg mb-2"
                            title={leaderboardData[1].username}
                          >
                            {leaderboardData[1].username}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-3">
                            {timePeriod === "today"
                              ? "Today"
                              : timePeriod === "week"
                                ? "This Week"
                                : "This Month"}
                            :{" "}
                            {leaderboardData[1].periodScore
                              ? leaderboardData[1].periodScore.toLocaleString()
                              : leaderboardData[1].totalScore.toLocaleString()}{" "}
                            pts
                          </div>
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-t-lg mx-auto"></div>
                        </div>
                      )}

                      {/* 1st Place */}
                      {leaderboardData[0] && (
                        <div className="text-center flex-shrink-0 w-28 sm:w-32">
                          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto border-4 border-yellow-300">
                            <span className="text-2xl sm:text-3xl">🥇</span>
                          </div>
                          <div
                            className="font-bold text-lg sm:text-xl mb-2"
                            title={leaderboardData[0].username}
                          >
                            {leaderboardData[0].username}
                          </div>
                          <div className="text-sm sm:text-base text-gray-600 mb-3">
                            {timePeriod === "today"
                              ? "Today"
                              : timePeriod === "week"
                                ? "This Week"
                                : "This Month"}
                            :{" "}
                            {leaderboardData[0].periodScore
                              ? leaderboardData[0].periodScore.toLocaleString()
                              : leaderboardData[0].totalScore.toLocaleString()}{" "}
                            pts
                          </div>
                          <div className="w-24 h-32 sm:w-28 sm:h-36 bg-yellow-400 rounded-t-lg mx-auto shadow-lg"></div>
                        </div>
                      )}

                      {/* 3rd Place */}
                      {leaderboardData[2] && (
                        <div className="text-center flex-shrink-0 w-24 sm:w-28">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                            <span className="text-xl sm:text-2xl">🥉</span>
                          </div>
                          <div
                            className="font-semibold text-base sm:text-lg mb-2"
                            title={leaderboardData[2].username}
                          >
                            {leaderboardData[2].username}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 mb-3">
                            {timePeriod === "today"
                              ? "Today"
                              : timePeriod === "week"
                                ? "This Week"
                                : "This Month"}
                            :{" "}
                            {leaderboardData[2].periodScore
                              ? leaderboardData[2].periodScore.toLocaleString()
                              : leaderboardData[2].totalScore.toLocaleString()}{" "}
                            pts
                          </div>
                          <div className="w-20 h-12 sm:w-24 sm:h-16 bg-amber-400 rounded-t-lg mx-auto"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Full Rankings Button */}
                  <div className="text-center">
                    <button
                      onClick={navigateToLeaderboard}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                      View Full Rankings →
                    </button>
                    <p className="text-sm text-gray-500 mt-3">
                      Check detailed activity statistics and full rankings
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "ecosystem":
        return (
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
            <ProjectExplorer
              onBack={() => {
                // Reset initial search query when going back
                setInitialSearchQuery("");
                navigateToMain();
              }}
              initialSearchQuery={initialSearchQuery}
            />
          </div>
        );
      case "leaderboard":
        return (
          <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
            <ActivityLeaderboard onBack={navigateToMain} />
          </div>
        );
      // return <ActivityLeaderboard onBack={navigateToMain} />;
      default:
        return renderMainEcosystem();
    }
  };
  return <Layout>{renderContent()}</Layout>;
};

export default EcosystemPage;
