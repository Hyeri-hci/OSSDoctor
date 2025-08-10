import React, { useState, useEffect } from 'react';
import { Layout } from '../../../components/layout';
import useEcosystemView from '../hooks/useEcosystemView';
import useLeaderboardData from '../hooks/useLeaderboardData';
import ActivityLeaderboard from '../components/ActivityLeaderboard';
import ProjectExplorer from '../components/ProjectExplorer';
import { getRecommendedProjectsService } from '../api/project-service';
import { getTechColor } from '../utils/ecosystemUtils';

const EcosystemPage = () => {

    // 기간 설정 상태 (메인 페이지용)
    const [timePeriod, setTimePeriod] = useState('realtime');

    // 랜덤 프로젝트 선택을 위한 상태
    const [currentProjectPage, setCurrentProjectPage] = useState(0); // 현재 보여주는 페이지 (0부터 시작)
    const [allRecommendedProjects, setAllRecommendedProjects] = useState([]); // 전체 프로젝트
    const [projectsLoading, setProjectsLoading] = useState(false);

    const PROJECTS_PER_PAGE = 6; // 한 번에 보여줄 프로젝트 수

    // 동적으로 계산되는 페이지 정보
    const totalAvailablePages = Math.ceil(allRecommendedProjects.length / PROJECTS_PER_PAGE);
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
        navigateToMain
    } = useEcosystemView();

    // 리더보드 데이터 (메인 페이지용)
    const {
        leaderboardData,
        loading: leaderboardLoading,
        error: leaderboardError
    } = useLeaderboardData(timePeriod);

    // 추천 프로젝트 로딩 (초보자 친화적인 기준으로 30개 조회)
    useEffect(() => {
        const loadRecommendedProjects = async () => {
            setProjectsLoading(true);
            try {
                // 다양한 초보자 친화적인 기준으로 프로젝트 검색
                const searchQueries = [
                    'good-first-issues stars:>1000', // good-first-issues가 있고 인기있는 프로젝트
                    'is:public stars:>5000 forks:>100', // 높은 stars와 forks를 가진 인기 프로젝트
                    'topic:beginner-friendly stars:>500', // 초보자 친화적인 프로젝트
                    'topic:first-timers-only', // 처음 기여자만을 위한 프로젝트
                    'topic:documentation stars:>800', // 문서 작업이 필요한 프로젝트
                    'topic:open-source stars:>2000', // 오픈소스 친화적 프로젝트
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
                const uniqueProjects = allProjects
                    .filter((project, index, self) => 
                        index === self.findIndex(p => p.id === project.id)
                    );

                setAllRecommendedProjects(uniqueProjects);
                setCurrentProjectPage(0); // 첫 페이지로 리셋
            } catch (error) {
                console.error('추천 프로젝트 로딩 실패:', error);
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
            setCurrentProjectPage(prev => prev + 1);
        } else {
            // 마지막 페이지면 처음으로 돌아가기
            setCurrentProjectPage(0);
        }
    };

    // 이전 페이지로 이동하는 핸들러
    const handleGetPrevProjects = () => {
        if (hasPrevPage) {
            setCurrentProjectPage(prev => prev - 1);
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
                {/* 에코시스템 헤더 섹션 */}
                <section className="bg-gray-50 py-16">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <div className="max-w-4xl mx-auto text-center">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                                OSS 에코시스템 탐색기
                            </h1>
                            <p className="text-base text-gray-600 mb-8 leading-relaxed">
                                오픈 소스에 기여하고, 리더보드에서 나의 순위를 확인해 보세요!
                            </p>

                            {/* 액션 버튼들 */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <button
                                    onClick={navigateToEcosystem}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    프로젝트 탐색하기
                                </button>
                                <button
                                    onClick={navigateToLeaderboard}
                                    className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium border-2 border-blue-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    활동 현황판 보기
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 오늘의 OSS 업사이클링 프로젝트 제안 섹션 */}
                <section className="bg-white py-16">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <div className="max-w-7xl mx-auto">

                            {/* 섹션 헤더 */}
                            <div className="text-center mb-12">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    OSS 업사이클링 프로젝트 제안
                                </h2>
                                <p className="text-base text-gray-600 max-w-3xl mx-auto mb-6">
                                    커뮤니티에서 선별한 업사이클링하기 좋은 오픈소스 프로젝트들을 만나보세요
                                </p>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    {/* 네비게이션 버튼들 */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleGetPrevProjects}
                                            disabled={!hasPrevPage || projectsLoading}
                                            className="bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-1"
                                        >
                                            ← 이전
                                        </button>
                                        
                                        <button
                                            onClick={handleGetNextProjects}
                                            disabled={allRecommendedProjects.length === 0 || projectsLoading}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                                        >
                                            {hasNextPage ? '다른 프로젝트 보기' : '처음으로'}
                                            {hasNextPage ? '→' : ''}
                                        </button>
                                    </div>
                                    
                                    {/* 페이지 정보 */}
                                    {totalAvailablePages > 1 && (
                                        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                                            {currentProjectPage + 1} / {totalAvailablePages} 페이지
                                        </div>
                                    )}
                                    
                                    
                                </div>
                            </div>

                            {/* 프로젝트 그리드 */}
                            {projectsLoading ? (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">추천 프로젝트를 준비하고 있어요</h3>
                                    <p className="text-gray-600 text-sm max-w-md mx-auto">
                                        초보자도 쉽게 참여할 수 있는 오픈소스 프로젝트들을 찾고 있습니다.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {getCurrentPageProjects().map((project) => (
                                        <a 
                                            key={project.id}
                                            href={
                                                project.html_url || 
                                                (project.owner && project.name ? `https://github.com/${project.owner}/${project.name}` :
                                                `https://github.com/search?q=${encodeURIComponent(project.name)}&type=repositories`)
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group"
                                        >
                                            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                                                {/* 프로젝트 헤더 */}
                                                <div className="flex items-start justify-between gap-2 mb-3">
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-bold text-base text-gray-900 group-hover:text-blue-600 transition-colors break-words leading-tight">
                                                            {project.name}
                                                        </h3>
                                                        {project.goodFirstIssues > 0 && (
                                                            <span className="inline-block mt-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                🌟 초보자 환영
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* 프로젝트 설명 */}
                                                <div className="flex-grow mb-4">
                                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                                                        {project.description}
                                                    </p>
                                                </div>

                                                {/* 프로젝트 메타 정보 */}
                                                <div className="text-xs text-gray-500 mb-4 space-y-1">
                                                    <div>
                                                        최근 업데이트: {new Date(project.lastCommit || project.updatedAt).toLocaleDateString()}
                                                    </div>
                                                    {project.goodFirstIssues > 0 && (
                                                        <div className="text-green-600 font-medium">
                                                            Good First Issues: {project.goodFirstIssues}개
                                                        </div>
                                                    )}
                                                </div>

                                                {/* 프로젝트 통계 */}
                                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                    {/* 언어 */}
                                                    <div className="flex items-center gap-1">
                                                        <span 
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: project.languageColor || '#586069' }}
                                                        ></span>
                                                        <span className="text-xs text-gray-700 font-medium">
                                                            {project.language || project.tech}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Stars & Forks */}
                                                    <div className="flex items-center gap-3 text-xs">
                                                        <div className="flex items-center gap-1 text-yellow-600">
                                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {typeof project.stars === 'number' ? project.stars.toLocaleString() : project.stars}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-gray-600">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium">
                                                                {typeof project.forks === 'number' ? project.forks.toLocaleString() : project.forks}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            )}

                            {/* 프로젝트가 없을 때 */}
                            {!projectsLoading && getCurrentPageProjects().length === 0 && allRecommendedProjects.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">추천 프로젝트를 불러올 수 없습니다</h3>
                                    <p className="text-gray-600 text-sm mb-6">
                                        네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.
                                    </p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                                    >
                                        다시 시도
                                    </button>
                                </div>
                            )}

                            {/* 더 많은 프로젝트 보기 버튼 */}
                            <div className="text-center">
                                <button
                                    onClick={navigateToEcosystem}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    더 많은 프로젝트 탐색하기 →
                                </button>
                            </div>

                        </div>
                    </div>
                </section>

                {/* 활동 리더보드 섹션 */}
                <section className="bg-gray-50 py-16">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <div className="max-w-7xl mx-auto">

                            {/* 헤더와 기간 설정 */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold mb-4">활동 리더보드</h2>
                                <p className="text-base text-gray-600 mb-6">프로젝트에 적극적으로 기여한 멤버들을 소개합니다</p>

                                {/* 기간 설정 */}
                                <div className="flex justify-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 whitespace-nowrap">기간 설정:</span>
                                        <div className="flex bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => handleTimePeriodChange('realtime')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'realtime'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                실시간
                                            </button>
                                            <button
                                                onClick={() => handleTimePeriodChange('week')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'week'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                이번 주
                                            </button>
                                            <button
                                                onClick={() => handleTimePeriodChange('month')}
                                                className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'month'
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                                    }`}
                                            >
                                                이번 달
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {leaderboardLoading ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">리더보드 데이터를 불러오고 있습니다...</div>
                                </div>
                            ) : leaderboardError ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500">{leaderboardError}</div>
                                </div>
                            ) : (
                                <>
                                    {/* 상위 3명 시상대 */}
                                    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                                        <h3 className="text-lg font-bold text-center mb-8">TOP 3 순위</h3>
                                        <div className="flex justify-center items-end gap-6 sm:gap-10 mb-8">
                                            {/* 2위 */}
                                            {leaderboardData[1] && (
                                                <div className="text-center flex-shrink-0 w-24 sm:w-28">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                                        <span className="text-xl sm:text-2xl">🥈</span>
                                                    </div>
                                                    <div className="font-semibold text-base sm:text-lg mb-2" title={leaderboardData[1].username}>{leaderboardData[1].username}</div>
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-3">{leaderboardData[1].totalScore.toLocaleString()}점</div>
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-t-lg mx-auto"></div>
                                                </div>
                                            )}

                                            {/* 1위 */}
                                            {leaderboardData[0] && (
                                                <div className="text-center flex-shrink-0 w-28 sm:w-32">
                                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto border-4 border-yellow-300">
                                                        <span className="text-2xl sm:text-3xl">🥇</span>
                                                    </div>
                                                    <div className="font-bold text-lg sm:text-xl mb-2" title={leaderboardData[0].username}>{leaderboardData[0].username}</div>
                                                    <div className="text-sm sm:text-base text-gray-600 mb-3">{leaderboardData[0].totalScore.toLocaleString()}점</div>
                                                    <div className="w-24 h-32 sm:w-28 sm:h-36 bg-yellow-400 rounded-t-lg mx-auto shadow-lg"></div>
                                                </div>
                                            )}

                                            {/* 3위 */}
                                            {leaderboardData[2] && (
                                                <div className="text-center flex-shrink-0 w-24 sm:w-28">
                                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                                        <span className="text-xl sm:text-2xl">🥉</span>
                                                    </div>
                                                    <div className="font-semibold text-base sm:text-lg mb-2" title={leaderboardData[2].username}>{leaderboardData[2].username}</div>
                                                    <div className="text-xs sm:text-sm text-gray-500 mb-3">{leaderboardData[2].totalScore.toLocaleString()}점</div>
                                                    <div className="w-20 h-12 sm:w-24 sm:h-16 bg-amber-400 rounded-t-lg mx-auto"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 전체 순위 보기 버튼 */}
                                    <div className="text-center">
                                        <button
                                            onClick={navigateToLeaderboard}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                                        >
                                            전체 순위 보기 →
                                        </button>
                                        <p className="text-sm text-gray-500 mt-3">
                                            자세한 활동 통계와 전체 순위를 확인해보세요
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
            case 'ecosystem':
                return (
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <ProjectExplorer onBack={navigateToMain} />
                    </div>
                );
            case 'leaderboard':
                return (
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <ActivityLeaderboard onBack={navigateToMain} />
                    </div>
                );
            // return <ActivityLeaderboard onBack={navigateToMain} />;
            default:
                return renderMainEcosystem();
        }
    }; return (
        <Layout>
            {renderContent()}
        </Layout>
    );
}

export default EcosystemPage;
