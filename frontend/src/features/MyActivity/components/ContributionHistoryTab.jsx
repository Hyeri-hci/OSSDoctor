import React from "react";
import { recentActivitiesData } from "../data/mockData";
import { TimelineContainer } from "../../../components/common";
import { 
    CodeBracketIcon, 
    ArrowPathIcon, 
    DocumentTextIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

const ContributionHistoryTab = () => {
    const displayData = { recentActivities: recentActivitiesData };

    // 활동 타입별 아이콘 반환 함수 - HealthOverview와 동일
    const getActivityIcon = (activityType) => {
        const iconProps = "w-4 h-4 mr-2 flex-shrink-0";
        
        switch (activityType) {
            case "commit":
                return <CodeBracketIcon className={`${iconProps} text-blue-600`} />;
            case "pr_merged":
                return <ArrowPathIcon className={`${iconProps} text-purple-600`} />;
            case "pr_opened":
                return <DocumentTextIcon className={`${iconProps} text-green-600`} />;
            case "issue_closed":
                return <CheckCircleIcon className={`${iconProps} text-red-600`} />;
            case "issue_opened":
                return <ExclamationTriangleIcon className={`${iconProps} text-orange-600`} />;
            default:
                return <DocumentTextIcon className={`${iconProps} text-gray-600`} />;
        }
    };

    // 활동 타입별 색상 반환 함수 - HealthOverview와 동일
    const getActivityColor = () => {
        return "bg-gray-50 border-gray-200";
    };

    // 활동 타입별 라벨 반환 함수 - HealthOverview와 동일
    const getActivityTypeLabel = (activityType) => {
        const labels = {
            commit: "[commit]",
            pr_merged: "[PR merged]",
            pr_opened: "[PR opened]",
            issue_closed: "[issue closed]",
            issue_opened: "[issue opened]"
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contribution History</h3>
            <p className="text-sm text-gray-600 mb-6">프로젝트 기여 내역을 확인하세요.</p>

            <TimelineContainer
                data={displayData.recentActivities}
                maxHeight="48rem"
                renderItem={renderActivityItem}
            />
        </div>
    );
};

export default ContributionHistoryTab;