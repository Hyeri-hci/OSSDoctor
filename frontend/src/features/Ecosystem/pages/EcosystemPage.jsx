import React, { useState, useMemo } from "react";
import { Layout } from "../../../components/Layout";
import useEcosystemView from '../hooks/useEcosystemView';
import useLeaderboardData from '../hooks/useLeaderboardData';
import ActivityLeaderboard from '../components/ActivityLeaderboard';

const ALL_PROJECTS = [
    {
        id: 1,
        name: 'React UI Kit',
        description: '모던한 React 컴포넌트 라이브러리입니다. TypeScript 지원과 접근성 개선이 필요합니다.',
        lastCommit: '2024-07-20',
        stars: 892,
        forks: 156,
        tech: 'React'
    },
    {
        id: 2,
        name: 'DevTools CLI',
        description: '개발자를 위한 유용한 CLI 도구입니다. 새로운 기능 추가와 문서화가 필요한 상태입니다.',
        lastCommit: '2024-07-18',
        stars: 1200,
        forks: 89,
        tech: 'Python'
    },
    {
        id: 3,
        name: 'Analytics Dashboard',
        description: 'Vue.js로 만든 분석 대시보드입니다. 차트 라이브러리 업데이트와 반응형 개선이 필요합니다.',
        lastCommit: '2024-07-15',
        stars: 567,
        forks: 234,
        tech: 'Vue.js'
    },
    {
        id: 4,
        name: 'REST API Framework',
        description: 'Express.js 기반의 REST API 프레임워크입니다. 성능 최적화와 보안 강화가 필요합니다.',
        lastCommit: '2024-07-25',
        stars: 1800,
        forks: 321,
        tech: 'Node.js'
    },
    {
        id: 5,
        name: 'Budget Tracker',
        description: 'React Native로 개발된 가계부 앱입니다. UI/UX 개선과 새로운 기능 개발이 진행 중입니다.',
        lastCommit: '2024-07-22',
        stars: 445,
        forks: 78,
        tech: 'React Native'
    },
    {
        id: 6,
        name: 'ML Data Processor',
        description: '머신러닝 데이터 전처리 라이브러리입니다. 새로운 알고리즘 추가와 성능 최적화가 필요합니다.',
        lastCommit: '2024-07-28',
        stars: 723,
        forks: 142,
        tech: 'Python'
    },
    {
        id: 7,
        name: 'Design System',
        description: '통합 디자인 시스템 라이브러리입니다. 새로운 컴포넌트 추가와 테마 확장이 필요합니다.',
        lastCommit: '2024-07-30',
        stars: 1340,
        forks: 287,
        tech: 'CSS'
    },
    {
        id: 8,
        name: 'Security Scanner',
        description: '코드 보안 취약점 스캐너입니다. 새로운 규칙 추가와 성능 개선이 진행 중입니다.',
        lastCommit: '2024-07-29',
        stars: 965,
        forks: 178,
        tech: 'Go'
    },
    {
        id: 9,
        name: 'Documentation Builder',
        description: '자동 문서 생성 도구입니다. 다양한 언어 지원과 템플릿 확장이 필요합니다.',
        lastCommit: '2024-07-26',
        stars: 612,
        forks: 95,
        tech: 'TypeScript'
    },
    {
        id: 10,
        name: 'Multi-language Support',
        description: '다국어 지원 라이브러리입니다. 새로운 언어 추가와 번역 관리 개선이 필요합니다.',
        lastCommit: '2024-07-24',
        stars: 834,
        forks: 203,
        tech: 'JavaScript'
    },
    {
        id: 11,
        name: 'Performance Monitor',
        description: '웹 성능 모니터링 도구입니다. 실시간 분석 기능과 알림 시스템 개선이 필요합니다.',
        lastCommit: '2024-07-27',
        stars: 1156,
        forks: 267,
        tech: 'JavaScript'
    },
    {
        id: 12,
        name: 'Build Optimizer',
        description: '빌드 최적화 도구입니다. 새로운 플러그인 지원과 캐싱 시스템 개선이 진행 중입니다.',
        lastCommit: '2024-07-23',
        stars: 789,
        forks: 134,
        tech: 'Rust'
    }
];

// 기술 스택별 색상 매핑
const getTechColor = (tech) => {
    const colorMap = {
        'React': 'bg-blue-100 text-blue-700',
        'Python': 'bg-green-100 text-green-700',
        'Vue.js': 'bg-green-100 text-green-700',
        'Node.js': 'bg-yellow-100 text-yellow-700',
        'React Native': 'bg-purple-100 text-purple-700',
        'CSS': 'bg-pink-100 text-pink-700',
        'Go': 'bg-indigo-100 text-indigo-700',
        'TypeScript': 'bg-blue-100 text-blue-700',
        'JavaScript': 'bg-orange-100 text-orange-700',
        'Rust': 'bg-red-100 text-red-700'
    };
    return colorMap[tech] || 'bg-gray-100 text-gray-700';
};



const EcosystemPage = () => {

    // 기간 설정 상태 (메인 페이지용)
    const [timePeriod, setTimePeriod] = useState('realtime');

    // 랜덤 프로젝트 선택을 위한 상태
    const [refreshKey, setRefreshKey] = useState(0);

    // 커스텀 훅을 사용한 뷰 상태 관리
    const {
        currentView,
        navigateToProjects,
        navigateToLeaderboard,
        navigateToMain
    } = useEcosystemView();

    // 리더보드 데이터 (메인 페이지용)
    const {
        leaderboardData,
        loading: leaderboardLoading,
        error: leaderboardError
    } = useLeaderboardData(timePeriod);

    // 랜덤으로 6개 프로젝트 선택
    const recommendedProjects = useMemo(() => {
        const shuffled = [...ALL_PROJECTS].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 6);
    }, [refreshKey]);

    // 프로젝트 추천 새로고침 핸들러
    const handleRefreshProjects = () => {
        setRefreshKey(prev => prev + 1);
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
                                    onClick={navigateToProjects}
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
                                <button
                                    onClick={handleRefreshProjects}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                                >
                                    🔄 다른 프로젝트 추천받기
                                </button>
                            </div>

                            {/* 프로젝트 그리드 */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {recommendedProjects.map((project) => (
                                    <div key={project.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <h3 className="font-bold text-base">{project.name}</h3>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                            {project.description}
                                        </p>

                                        <div className="text-xs text-gray-500 mb-4">
                                            Last Commit: {project.lastCommit} | Stars: {project.stars.toLocaleString()} | Forks: {project.forks}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                                    ⭐ {project.stars.toLocaleString()}
                                                </span>
                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                    🍴 {project.forks}
                                                </span>
                                                <span className={`text-xs px-2 py-1 rounded ${getTechColor(project.tech)}`}>
                                                    {project.tech}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 더 많은 프로젝트 보기 버튼 */}
                            <div className="text-center">
                                <button
                                    onClick={navigateToProjects}
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
                                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
            case 'projects':
                return (
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <h2 className="text-2xl font-bold mb-6">프로젝트 탐색</h2>
                        {/* 여기에 프로젝트 탐색 컴포넌트 추가 */}
                        {/* 예시: <ProjectExplorer /> */}
                    </div>
                );
                // return <ProjectExplorer onBack={navigateToMain} />;
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
