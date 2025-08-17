import React from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner, EmptyState, Button } from '../../../components/common';
import OverallOverview from './OverallOverview';
import HealthOverview from './HealthOverview';
import SecurityHistory from './SecurityHistory';


const DiagnoseTabContent = ({ activeTab, loading, projectData, fullProjectName }) => {
    // 로딩 중일 때
    if (loading) {
        return (
            <LoadingSpinner
                message={`${fullProjectName} 프로젝트를 분석 중입니다. 잠시만 기다려 주세요...`}
                size="large"
                color="blue"
            />
        );
    }

    // 프로젝트 데이터 없을 때
    if (!projectData) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <EmptyState
                    title="프로젝트를 찾을 수 없습니다"
                    message="입력하신 레포지토리 주소가 올바르지 않거나 존재하지 않습니다. 다른 주소로 다시 시도해 주세요."
                    action={
                        <Button
                            onClick={() => window.location.reload()}
                            variant="primary"
                        >
                            다시 시도하기
                        </Button>
                    }
                />
            </div>
        );
    }

    // 활성화된 탭에 따라 다른 컴포넌트 렌더링
    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverallOverview projectData={projectData} />;
            case 'health':
                return <HealthOverview projectData={projectData} />;
            case 'security':
                return <SecurityHistory projectData={projectData} />;
            default:
                return <OverallOverview projectData={projectData} />;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {renderTabContent()}
        </div>
    );
};

DiagnoseTabContent.propTypes = {
    activeTab: PropTypes.string.isRequired,
    loading: PropTypes.bool.isRequired,
    projectData: PropTypes.object,
    fullProjectName: PropTypes.string.isRequired
};

export default DiagnoseTabContent;
