import React, { useState } from 'react';
import { Layout } from '../../../components/layout';
import ProjectInfo from '../components/ProjectInfo';
import DiagnoseSearchSection from '../components/DiagnoseSearchSection';
import DiagnoseTabContent from '../components/DiagnoseTabContent';
import { ScoreCards } from '../../../components/common';

const Diagnose = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [fullProjectName, setFullProjectName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = (inputValue) => {
        if(!inputValue || inputValue.trim() === '') {
            setError('GitHub Repository URL 또는 owner/name 형식으로 입력해주세요.');
            return;
        }

        setError('');
        setIsLoading(true);

        const trimmedValue = inputValue.trim();
        const githubUrlMatch = trimmedValue.match(/github\.com\/([^/]+)\/([^/\s]+)/);

        let owner, name, fullProjectName;

        if(githubUrlMatch) {
            [, owner, name] = githubUrlMatch;
            const cleanName = name.replace(/\.git$/, ''); // .git 제거
            fullProjectName = `${owner}/${cleanName}`;
        } else {
            // owner/name 형식 직접 입력 처리
            const directMatch = trimmedValue.match(/^([^/]+)\/([^/\s]+)$/);
            if(directMatch) {
                [, owner, name] = directMatch;
                const cleanName = name.replace(/\.git$/, ''); // .git 제거
                fullProjectName = `${owner}/${cleanName}`;
            } else {
                setError('유효한 GitHub Repository URL 또는 owner/name 형식으로 입력해주세요.');
                setIsLoading(false);
                return;
            }
        }

        // 프로젝트 정보 설정
        setFullProjectName(fullProjectName);
        
        // TODO: 실제 API 호출로 대체
        // 임시 데이터로 테스트
        setTimeout(() => {
            setProjectData({
                owner,
                name: name.replace(/\.git$/, ''),
                fullName: fullProjectName,
                description: `${fullProjectName} 프로젝트 분석 결과`,
                language: 'JavaScript',
                stars: 1000,
                forks: 500
            });
            setIsLoading(false);
        }, 1000);
    };

        

    return (
        <Layout>
            <div className="min-h-screen">
                {/* Header */}
                <DiagnoseSearchSection onSearch={handleSearch} error={error} />

                {/* Main */}
                <div className="bg-white">
                    <div className="container mx-auto px-6 xl:px-8 2xl:px-12 py-6">
                        <div className="max-w-7xl mx-auto space-y-6">
                            <ProjectInfo projectData={projectData} />
                            <ScoreCards scores={{}} activeTab={activeTab} onTabChange={setActiveTab} variant='diagnose' />
                            <DiagnoseTabContent 
                                activeTab={activeTab} 
                                loading={isLoading} 
                                projectData={projectData} 
                                fullProjectName={fullProjectName} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Diagnose;