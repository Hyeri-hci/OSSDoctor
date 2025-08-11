import React, { useState, useEffect } from "react";
import { Layout } from "../../../components/layout";
import { ScoreCards } from "../../../components/common";

const MyActivityPage = () => {
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        // 여기에 활동 데이터를 가져오는 API 호출 로직을 추가하세요.
        // 예시: setActivityData(fetchedData);
    }, []);

    // Mock Data
    const userData = {
        name: "User Name",
        level: 3,
        description: "활동에 대한 설명이 여기에 들어갑니다.",
        githubUrl: "https://github.com/user/repo",
        email: "user@example.com",
        scores: {
            overall: 85,
            contributions: 90,
            projects: 80,
            community: 75,
        }
    }

    // Tab Content Rendering Logic
    // const renderTabContent = () => {
    //     switch (activeTab) {
    //         case "overview":
    //             return <OverviewTab />;
    //         case "contributions-history":
    //             return <ContributionsHistoryTab />;
    //         case 'badges-earned':
    //             return <BadgesEarnedTab />;
    //         default:
    //             return <OverviewTab userData={userData} />;
    //     }
    // };

    return (
        <Layout>
            <div className="min-h-screen">
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
                                <div className="flex-1">
                                    {/* 이름 & 레벨 */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">{userData.name}</h1>
                                        <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded font-medium">{`Level ${userData.level}`}</span>
                                    </div>
                                    {/* 설명 */}
                                    <p className="text-gray-600 text-sm mb-3">{userData.description}</p>
                                    {/* GitHub URL & e-mail */}
                                    <div className="text-xs text-gray-500">
                                        GitHub URL: {userData.githubUrl} | e-mail: {userData.email}
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
                            {/* 점수 카드 */}
                            <ScoreCards
                                scores={userData.scores}
                                activeTab={activeTab}
                                onTabChange={setActiveTab}
                                variant="myactivity"
                            />

                            {/* 탭 콘텐츠 */}
                            <div className="bg-white">
                                {/* {renderTabContent()} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}

export default MyActivityPage;