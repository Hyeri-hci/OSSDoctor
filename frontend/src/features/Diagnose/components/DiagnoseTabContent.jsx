import React from 'react';
import PropTypes from 'prop-types';
import { LoadingSpinner } from '../../../components/common';
import OverallOverview from './OverallOverview';
import HealthOverview from './HealthOverview';
import SecurityHistory from './SecurityHistory';


const DiagnoseTabContent = ({ activeTab, loading, projectData, fullProjectName }) => {
    // Loading state
    if (loading) {
        return (
            <LoadingSpinner
                message={`Analyzing ${fullProjectName} project. Please wait...`}
                size="large"
                color="blue"
            />
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
