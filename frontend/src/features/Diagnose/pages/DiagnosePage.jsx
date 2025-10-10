import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '../../../components/layout';
import ProjectInfo from '../components/ProjectInfo';
import DiagnoseSearchSection from '../components/DiagnoseSearchSection';
import DiagnoseTabContent from '../components/DiagnoseTabContent';
import WelcomeGuide from '../components/WelcomeGuide';
import { ScoreCards, LoadingSpinner, EmptyState, Button } from '../../../components/common';
import { useDiagnose } from '../hooks/useDiagnose';

const Diagnose = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const searchSectionRef = useRef(null);

    // 진단 관련 상태와 로직을 커스텀 훅으로 분리
    const {
        isLoading,
        error,
        projectData,
        fullProjectName,
        handleSearch,
        resetState
    } = useDiagnose();

    // URL 파라미터에서 repo 정보 확인하여 자동 검색
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const repoParam = urlParams.get('repo');

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
                                        message={`${fullProjectName} 프로젝트를 분석 중입니다. 잠시만 기다려 주세요...`}
                                        size="large"
                                        color="blue"
                                    />
                                ) : error ? (
                                    <div className="space-y-6">
                                        <EmptyState
                                            title={error.includes('활동이 없습니다') ? '📭 활동이 없는 저장소입니다' : '🔍 프로젝트를 찾을 수 없습니다'}
                                            message={error}
                                            action={
                                                <Button
                                                    onClick={() => {
                                                        resetState();
                                                        // 검색창으로 포커스 이동
                                                        if (searchSectionRef.current) {
                                                            searchSectionRef.current.focusSearchInput();
                                                        }
                                                    }}
                                                    variant="primary"
                                                >
                                                    다시 검색하기
                                                </Button>
                                            }
                                        />
                                        
                                        {/* 활동이 없는 저장소일 때 추가 안내 */}
                                        {error.includes('활동이 없습니다') && (
                                            <div className="max-w-2xl mx-auto">
                                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                                    <h4 className="text-sm font-semibold text-blue-900 mb-3">
                                                        활동이 없는 저장소란?
                                                    </h4>
                                                    <ul className="text-sm text-blue-800 space-y-2">
                                                        <li className="flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>아직 코드가 업로드되지 않은 빈 저장소</span>
                                                        </li>
                                                        <li className="flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>커밋 기록이 없는 저장소</span>
                                                        </li>
                                                        <li className="flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>초기화만 되고 개발이 시작되지 않은 저장소</span>
                                                        </li>
                                                    </ul>
                                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                                        <p className="text-sm text-blue-800">
                                                            저장소에 코드를 업로드하고 커밋을 생성한 후 다시 진단해 주세요.
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
                                            variant='diagnose'
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
}

export default Diagnose;