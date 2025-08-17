import React from 'react';
import { BarChart } from '../../../components/common/charts';
import { TimelineContainer } from '../../../components/common';
import {
    ArrowPathIcon,
    DocumentTextIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { ProjectDataType } from '../types/proTypes';

const HealthOverview = ({ projectData }) => {
    const displayData = projectData

    if (!displayData) {
        return (
            <div className="p-4 flex items-center justify-center h-64">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        );
    }

    // 활동 타입별 아이콘 반환 함수
    const getActivityIcon = (type) => {
        const iconProps = "w-4 h-4 mr-2 flex-shrink-0";
        switch (type) {
            case "pr_merged":
                return <ArrowPathIcon className={`${iconProps} text-purple-600`} />;
            case "pr_opened":
                return <DocumentTextIcon className={`${iconProps} text-green-600`} />;
            case "pr_closed":
                return <CheckCircleIcon className={`${iconProps} text-blue-600`} />;
            case "issue_closed":
                return <CheckCircleIcon className={`${iconProps} text-red-600`} />;
            case "issue_opened":
                return <ExclamationTriangleIcon className={`${iconProps} text-orange-600`} />;
            default:
                return <DocumentTextIcon className={`${iconProps} text-gray-600`} />;
        }
    };

    // 활동 배경색 반환 함수
    const getActivityColor = () => {
        return "bg-gray-50 border-gray-200"; // 모든 활동에 동일한 회색 배경 적용
    };

    // 활동 타입 라벨 반환 함수
    const getActivityTypeLabel = (type) => {
        const labels = {
            pr_merged: "[PR merged]",
            pr_opened: "[PR opened]",
            pr_closed: "[PR closed]",
            issue_closed: "[issue closed]",
            issue_opened: "[issue opened]"
        };
        return labels[type] || "[activity]";
    };

    // PR 통계 계산
    const prStats = {
        merged: displayData.pullRequests?.merged || 0,
        open: displayData.pullRequests?.open || 0,
        total: displayData.pullRequests?.total || displayData.pullRequests?.merged + displayData.pullRequests?.open || 0
    };

    const prMergedPercentage = prStats.total > 0 ? (prStats.merged / prStats.total * 100) : 0;
    const prOpenPercentage = prStats.total > 0 ? (prStats.open / prStats.total * 100) : 0;

    // Issue 통계 계산
    const issueStats = {
        closed: displayData.issues?.closed || 0,
        open: displayData.issues?.open || 0,
        total: displayData.issues?.total || displayData.issues?.closed + displayData.issues?.open || 0
    };

    const issueClosedPercentage = issueStats.total > 0 ? (issueStats.closed / issueStats.total * 100) : 0;
    const issueOpenPercentage = issueStats.total > 0 ? (issueStats.open / issueStats.total * 100) : 0;

    // 커밋 활동 데이터 준비 (BarChart) - 요일별로 처리
    const prepareCommitData = () => {
        // 요일 순서 정의
        const dayOrder = ['월', '화', '수', '목', '금', '토', '일'];

        if (!displayData.commitActivities || !Array.isArray(displayData.commitActivities)) {
            // 기본 데이터 - 모든 요일을 0으로 초기화
            return dayOrder.map(day => ({
                label: day,
                value: 0
            }));
        }

        // 백엔드 데이터를 요일별로 변환
        const commitMap = {};
        displayData.commitActivities.forEach(activity => {
            // activity.day 영어 요일이면 한국어로 변환
            let koreanDay = activity.day;
            if (typeof activity.day === 'string') {
                const dayMap = {
                    'Monday': '월', 'Tuesday': '화', 'Wednesday': '수',
                    'Thursday': '목', 'Friday': '금', 'Saturday': '토', 'Sunday': '일',
                    'Mon': '월', 'Tue': '화', 'Wed': '수', 'Thu': '목',
                    'Fri': '금', 'Sat': '토', 'Sun': '일'
                };
                koreanDay = dayMap[activity.day] || activity.day;
            }
            commitMap[koreanDay] = activity.commits || 0;
        });

        // 요일 순서대로 정렬하여 반환
        return dayOrder.map(day => ({
            label: day,
            value: commitMap[day] || 0
        }));
    };

    // 실제 커밋 활동 데이터 사용
    const chartData = prepareCommitData();

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="p-6 space-y-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        PR 및 Issue 활동 이력
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        최근 Pull Request와 Issue 처리 현황을 보여줍니다.
                    </p>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 왼쪽: PR 통계 */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">{prStats.open} Active Pull Request</div>
                            {/* PR 상태 진행률 바 */}
                            <div className="flex mb-4">
                                <div
                                    className="bg-purple-500 h-3 rounded-l"
                                    style={{ width: prStats.total > 0 ? `${(prStats.merged / prStats.total) * 100}%` : '100%' }}
                                ></div>
                                <div
                                    className="bg-green-500 h-3 rounded-r"
                                    style={{ width: prStats.total > 0 ? `${(prStats.open / prStats.total) * 100}%` : '0%' }}
                                ></div>
                            </div>

                            {/* PR 상태별 상세 통계 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Merged PR 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                    <span className="font-semibold">{prStats.merged.toLocaleString()}</span>
                                    <span className="text-gray-600">Merged</span>
                                </div>

                                {/* Open PR 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="font-semibold">{prStats.open}</span>
                                    <span className="text-gray-600">Open</span>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: Issue 통계 */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">{issueStats.open} Active Issues</div>
                            <div className="flex mb-4">
                                <div
                                    className="bg-red-500 h-3 rounded-l"
                                    style={{ width: issueStats.total > 0 ? `${(issueStats.closed / issueStats.total) * 100}%` : '100%' }}
                                ></div>
                                <div
                                    className="bg-green-500 h-3 rounded-r"
                                    style={{ width: issueStats.total > 0 ? `${(issueStats.open / issueStats.total) * 100}%` : '0%' }}
                                ></div>
                            </div>

                            {/* Issue 상태별 상세 통계 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Closed Issue 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span className="font-semibold">{issueStats.closed.toLocaleString()}</span>
                                    <span className="text-gray-600">Closed Issues</span>
                                </div>

                                {/* Open Issues 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="font-semibold">{issueStats.open}</span>
                                    <span className="text-gray-600">Open Issues</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 커밋 활동 분포 섹션 */}
                <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                        커밋 활동 분포
                    </h3>
                    <div className="text-xs text-gray-600 mb-4">
                        요일별 커밋 활동 패턴
                    </div>
                    <div className="w-full overflow-hidden">
                        <div className="min-w-0 w-full">
                            <div className="w-full">
                                <BarChart
                                    data={chartData}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="text-center text-xs text-gray-600 mt-2">
                        요일별 커밋 수
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Repository 활동 이력
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        프로젝트의 최근 활동 내역을 확인할 수 있습니다.
                    </p>

                    {/* recentActivities 날짜별로 그룹화하여 TimelineContainer 넘김 */}
                    {(() => {
                        const activities = Array.isArray(displayData.recentActivities) ? displayData.recentActivities : [];
                        if (activities.length === 0) {
                            return <div className="p-4 text-center text-gray-400">최근 활동 내역이 없습니다.</div>;
                        }
                        // YYYY-MM-DD 기준으로 그룹화
                        const groupByDate = {};
                        activities.forEach(act => {
                            const rawDate = act.startDate || act.startdate || act.date;
                            if (!rawDate) return;
                            const dateObj = new Date(rawDate);
                            if (isNaN(dateObj)) return;
                            const dateStr = dateObj.toISOString().slice(0, 10); // YYYY-MM-DD
                            if (!groupByDate[dateStr]) groupByDate[dateStr] = [];
                            groupByDate[dateStr].push(act);
                        });
                        // [{date, activities: [...]}, ...] 형태로 변환
                        const timelineData = Object.entries(groupByDate)
                            .sort((a, b) => b[0].localeCompare(a[0])) // 최신순
                            .map(([date, acts]) => ({ date, activities: acts }));
                        return (
                            <TimelineContainer
                                data={timelineData}
                                maxHeight="32rem"
                                renderItem={(activity) => {
                                    if (!activity || typeof activity !== 'object') {
                                        return <div className="p-3 text-gray-400">잘못된 활동 데이터</div>;
                                    }
                                    const type = activity.type || activity.activityType || '';
                                    const title = activity.title || activity.message || activity.activityTitle || '';
                                    const author = activity.author || activity.user || activity.actor || '';
                                    const date = activity.startDate || activity.startdate || activity.date || '';
                                    return (
                                        <div className={`p-3 rounded-lg border ${getActivityColor()}`}>
                                            <div className="flex items-start">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center">
                                                        {getActivityIcon(type)}
                                                        <h5 className="text-sm font-bold text-gray-900 truncate">
                                                            {getActivityTypeLabel(type)} {title}
                                                        </h5>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mt-1 ml-6">
                                                        {author} {date ? `• ${new Date(date).toLocaleDateString('ko-KR')}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            />
                        );
                    })()}
                </div>
            </div>
        </div>
    );
};

HealthOverview.propTypes = {
    projectData: ProjectDataType
};

export default HealthOverview;
