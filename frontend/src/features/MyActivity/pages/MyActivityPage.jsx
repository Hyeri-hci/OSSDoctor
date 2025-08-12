import React, { useEffect, useState } from "react";
import { Layout } from "../../../components/layout";
import OverviewTab from "../components/OverviewTab";
import ContributionHistoryTab from "../components/ContributionHistoryTab";
import BadgesTab from "../components/BadgesTab";
import useMyActivityData from "../hooks/UseMyActivityData";

const MyActivityPage = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data } = useMyActivityData();

    useEffect(() => {
        // 여기에 활동 데이터를 가져오는 API 호출 로직을 추가하세요.
        // 예시: setActivityData(fetchedData);
    }, []);

    // 탭 변경 핸들러
    const handleTabChange = (newTab) => {
        setActiveTab(newTab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Mock Data
    const userData = {
        name: "User Name",
        level: 3,
        description: "활동에 대한 설명이 여기에 들어갑니다.",
        githubUrl: "https://github.com/user/repo",
        email: "user@example.com",
        scores: {
            overall: 85,
            activity: 90,
            popularity: 78,
            contribution: 82,
        }
    }

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
                <section className="bg-[#f3f3f3] py-8">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12">
                        <div className="max-w-6xl mx-auto">

                            {/* 사용자 프로필 */}
                            <div className="flex items-start gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 bg-gray-300 rounded-full">
                                        {/* 프로필 이미지가 여기에 들어갑니다. */}
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