import React from "react";
import HeaderSection from "../../../components/HeaderSection";
import FooterSection from "../../../components/FooterSection";
import SearchBar from "../components/SearchBar";
import { BarChart3, Users, Star, Calendar, GitFork } from "lucide-react";
// import { GitBranch, Search } from "lucide-react";
export default function MainPage(onAnalyze, onDiagnosisClick, onContributionClick, onEcosystemClick) {

  const features = [
    {
      title: "프로젝트 상태 점검",
      subtitle: "프로젝트 진단",
      description: "저장소의 건강도 및 보안 상태를 진단하세요.",
      icon: <BarChart3 className="w-12 -12 text-blue-500" />,
      onClick: onDiagnosisClick,
    },
    {
      title: "기여 활동 분석",
      subtitle: "기여도 분석",
      description: "기여 현황과 성장 과정을 한눈에 살펴보세요.",
      icon: <Users className="w-12 -12 text-green-500" />,
      onClick: onContributionClick,
    },
    {
      title: "에코시스템 익스플로러",
      subtitle: "생태계 탐색",
      description: "업사이클할 오픈소스를 찾고, 인기 순위를 확인해 보세요.",
      icon: <Star className="w-12 -12 text-purple-500" />,
      onClick: onEcosystemClick,
    }
  ];

  const recommendedProjects = [
    {
      name: "React",
      description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
      lastCommit: "2023-10-01",
      language: "JavaScript",
      stars: "210k",
      forks: "45k",
      issues: "1.2k",
    },
    {
      name: "Vue.js",
      description: "The Progressive JavaScript Framework for building user interfaces.",
      lastCommit: "2023-09-28",
      language: "TypeScript",
      stars: "200k",
      forks: "40k",
      issues: "800",
    },
    {
      name: "TensorFlow",
      description: "An end-to-end open source platform for machine learning.",
      lastCommit: "2023-09-30",
      language: "Python",
      stars: "170k",
      forks: "90k",
      issues: "5k",
    }
  ];

  return (
    <div className="max-w-screen-2xl mx-auto flex flex-col items-center justify-center">
      <HeaderSection />
      <main className="w-full min-h-screen">
        {/* Hero Section */}
        <section className="bg-[#666666] text-white py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center justify-center">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold mb-3">
                  OSS를 탐색하고, 되살려보세요!
                </h1>
                <p className="text-gray-300 text-xs lg:text-sm mb-8">
                  원하는 프로젝트를 모니터링하고, 자신의 기여도를 추적하고, EcoSystem을 통해 프로젝트 되살리기에 동참하세요.
                </p>
                <SearchBar onAnalyze={onAnalyze} />
              </div>
              <div className="bg-[#9F9F9F] rounded-lg hidden md:flex items-center justify-center aspect-[13/8] max-w-[520px]">
                {/* 나중에 이미지 들어갈 자리 */}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-xl md:text-2xl font-bold mb-3">주요 기능</h2>
              <p className="text-sm md:text-base">
                오픈소스 활동을 더 풍부하게 만들어 줄 주요 기능들을 살펴보세요.
              </p>
              <button className="mt-6 bg-black text-white text-sm hover:bg-gray-800 px-6 py-2 rounded">
                더 알아보기
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8 border-b-gray-50">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className="hidden md:block rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="bg-[#EBEBEB] aspect-[1/0.8] max-w-[400px] rounded-t-lg items-center justify-center">
                    {/* 나중에 이미지 들어올 자리 */}
                  </div>
                  <div className="flex-col px-3 items-center">
                    <h3 className="text-xs lg:text-sm mt-2 mb-2">{feature.title}</h3>
                    <p className="font-semibold text-xs lg:text-sm mb-2">{feature.description}</p>
                  </div>
                </div>
              ))}
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={feature.onClick}
                  className="md:hidden bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center mb-4">
                    {feature.icon}
                    <h3 className="font-semibold ml-3">{feature.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Projects Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-rows-1 items-center gap-8">
              {/* 왼쪽: 텍스트 + 버튼 */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2">추천 프로젝트</h2>
                  <p className="text-sm md:text-base">지금 활발한 오픈소스 프로젝트를 탐색해 보세요.</p>
                </div>
                <button className="w-full max-w-25 md:max-w-40 bg-black text-white text-sm hover:bg-gray-800 px-6 py-2 rounded">
                  더 보기
                </button>
              </div>

              {/* 오른쪽: 프로젝트 리스트 */}
              <div className="grid grid-row-3 gap-6 flex-1">
                {recommendedProjects.map((project, index) => (
                  <div key={index} className="cursor-pointer hover:shadow-md transition-shadow bg-white rounded-md">
                    <div className="">
                      <div className="flex justify-between items-start border border-gray-200 p-6 rounded-lg">
                        <div className="hidden md:block bg-gray-200 w-24 h-24 rounded items-center justify-center mr-4">
                          {/* 나중에 이미지 들어갈 자리 */}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-md sm:text-lg mb-1">{project.name}</h3>
                          <p className="text-gray-600 text-xs mb-3 sm:text-sm">{project.description}</p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{project.lastCommit}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>{project.stars}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <GitFork className="w-4 h-4" />
                              <span>{project.forks}</span>
                            </div>
                            <div className="badge badge-secondary">{project.language}</div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </main>
      <FooterSection />
    </div >
  );
}

MainPage.displayName = "MainPage";