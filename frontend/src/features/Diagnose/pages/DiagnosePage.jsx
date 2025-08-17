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
                                    <EmptyState
                                        title="프로젝트를 찾을 수 없습니다"
                                        message={error}
                                        action={
                                            <Button
                                                onClick={() => {
                                                    setError('');
                                                    setProjectData(null);
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