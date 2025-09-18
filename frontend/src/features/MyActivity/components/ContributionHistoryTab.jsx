import React from "react";
import { useNavigate } from "react-router-dom";
import useMyActivityData from "../hooks/useMyActivityData";
import { TimelineContainer } from "../../../components/common";
import { 
    CodeBracketIcon, 
    ArrowPathIcon, 
    DocumentTextIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const ContributionHistoryTab = () => {
    const { data, loading, error } = useMyActivityData();
    const navigate = useNavigate();

    if (loading) {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기여 이력</h3>
                <div className="text-center py-8">
                    <div className="animate-pulse">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기여 이력</h3>
                <div className="text-center py-8 text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    const displayData = { recentActivities: data.history };

    const getActivityIcon = (activityType) => {
        const iconProps = "w-4 h-4 mr-2 flex-shrink-0";
        
        switch (activityType) {
            case "pr_merged":
                return <ArrowPathIcon className={`${iconProps} text-purple-600`} />;
            case "pr_opened":
                return <DocumentTextIcon className={`${iconProps} text-green-600`} />;
            case "issue_closed":
                return <CheckCircleIcon className={`${iconProps} text-red-600`} />;
            case "issue_opened":
                return <ExclamationTriangleIcon className={`${iconProps} text-orange-600`} />;
            case "review":
                return <CodeBracketIcon className={`${iconProps} text-blue-600`} />;
            default:
                return <DocumentTextIcon className={`${iconProps} text-gray-600`} />;
        }
    };

    const getActivityColor = () => {
        return "bg-gray-50 border-gray-200";
    };

    const getActivityTypeLabel = (activityType) => {
        const labels = {
            pr_merged: "[PR merged]",
            pr_opened: "[PR opened]",
            issue_closed: "[issue closed]",
            issue_opened: "[issue opened]",
            review: "[review]"
        };
        return labels[activityType] || "[activity]";
    };

    // 각 활동 항목을 렌더링하는 함수
    const renderActivityItem = (activity, activityIndex) => (
        <div
            key={activityIndex}
            className={`p-3 rounded-lg border ${getActivityColor()}`}
        >
            <div className="flex items-start">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center">
                        {getActivityIcon(activity.type)}
                        <h5 className="text-sm font-bold text-gray-900 truncate">
                            {getActivityTypeLabel(activity.type)} {activity.title}
                        </h5>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 ml-6">
                        {activity.repository} • {activity.time}
                        {activity.number && ` • #${activity.number}`}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">기여 이력</h3>
            <p className="text-sm text-gray-600 mb-6">프로젝트 기여 내역을 확인하세요.</p>

            {displayData.recentActivities && displayData.recentActivities.length > 0 ? (
                <TimelineContainer
                    data={displayData.recentActivities}
                    maxHeight="48rem"
                    renderItem={renderActivityItem}
                />
            ) : (
                <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">기여 이력이 없습니다</h3>
                    <p className="text-sm text-gray-500 mb-4">
                        아직 등록된 기여 이력이 없습니다.<br />
                        GitHub에서 프로젝트에 기여하면 여기에 표시됩니다.
                    </p>
                    <button 
                        onClick={() => navigate('/ecosystem')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                    >
                        업사이클링 오픈소스 프로젝트 찾아보기
                    </button>
                </div>
            )}
        </div>
    );
};

export default ContributionHistoryTab;