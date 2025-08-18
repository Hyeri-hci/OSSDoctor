import React, { useEffect, useState } from "react";
import { Layout } from "../../../components/layout";
import OverviewTab from "../components/OverviewTab";
import ContributionHistoryTab from "../components/ContributionHistoryTab";
import BadgesTab from "../components/BadgesTab";
import useMyActivityData from "../hooks/useMyActivityData";
import { useAuth } from "../../../hooks/useAuth";

const MyActivityPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data, loading, error } = useMyActivityData();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // 디버깅을 위해 현재 사용자 정보 로그 출력
        console.log('MyActivityPage - 현재 사용자:', user);
        console.log('MyActivityPage - 인증 상태:', isAuthenticated);
    }, [user, isAuthenticated]);

    // 탭 변경 핸들러
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 로딩 상태
    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center">
                            <div className="animate-pulse">데이터를 불러오는 중...</div>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <Layout>
                <div className="min-h-screen bg-gray-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center text-red-600">
                            {error}
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    // 사용자 데이터 (실제 API에서 받은 데이터 + 기본값)
    const userData = {
        name: data.userLevel?.nickname || "User Name",
        level: data.userLevel?.level || 1,
        totalScore: data.userLevel?.totalScore || 0,
        avatarUrl: data.userLevel?.avatarUrl || null,
        description: "GitHub를 통해 다양한 오픈소스 프로젝트에 기여하고 있습니다.",
        githubUrl: `https://github.com/${data.userLevel?.nickname || 'user'}`,
        email: `${data.userLevel?.nickname || 'user'}@github.local`,
        scores: {
            overall: Math.min(85, data.userLevel?.totalScore || 0),
            activity: Math.min(90, data.stats?.monthlyPR * 5 + data.stats?.monthlyIssue * 3 + data.stats?.monthlyCommit * 2 || 0),
            popularity: 78, // 임시값 (향후 stars, forks 등으로 계산 가능)
            contribution: Math.min(82, data.stats?.totalScore || 0),
        }
    };

    // 탭 콘텐츠 렌더링 함수
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab onTabChange={handleTabChange} />;
            case 'contribution':
                return <ContributionHistoryTab />;
            case 'badges':
                return <BadgesTab badges={data?.badges || []} />;
            default:
                return <OverviewTab onTabChange={handleTabChange} />;
        }
    };

    return (
        <Layout>
            <div>
                <section className="bg-gray-50 py-8">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <div className="max-w-6xl mx-auto">

                            {/* 사용자 프로필 */}
                            <div className="flex items-start gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full overflow-hidden">
                                        {userData.avatarUrl ? (
                                            <img 
                                                src={userData.avatarUrl} 
                                                alt={userData.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                                                {userData.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 사용자 정보 */}
                                <div className="flex-1 min-w-0">
                                    {/* 이름 & 레벨 */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900 truncate">{userData.name}</h1>
                                        <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded font-medium flex-shrink-0">{`Level ${userData.level}`}</span>
                                    </div>
                                    {/* 설명 */}
                                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">{userData.description}</p>
                                    {/* GitHub URL & e-mail */}
                                    <div className="text-xs text-gray-500 break-all sm:break-normal">
                                        <div className="flex flex-col sm:flex-row sm:gap-1">
                                            <span>GitHub URL: {userData.githubUrl}</span>
                                            <span className="hidden sm:inline">|</span>
                                            <span className="sm:ml-1">e-mail: {userData.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Main Content */}
                <div className="bg-white">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-6">
                        <div className="max-w-6xl mx-auto space-y-6">
                            
                            {/* 탭 네비게이션 */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                                    <button
                                        onClick={() => handleTabChange('overview')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'overview'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        개요
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('contribution')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'contribution'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        기여 이력
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('badges')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'badges'
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        뱃지
                                    </button>
                                </nav>
                            </div>

                            {/* 탭 콘텐츠 */}
                            <div className="bg-white">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}

export default MyActivityPage;