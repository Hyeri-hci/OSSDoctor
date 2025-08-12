// React 라이브러리 import
import React from 'react';

// 공통 차트 컴포넌트를 import - 데이터 시각화용
import { BarChart } from '../../../components/common/charts';

// 공통 컴포넌트 import
import { TimelineContainer } from '../../../components/common';

// Heroicons import - 활동 타입별 아이콘용
import { 
    CodeBracketIcon, 
    ArrowPathIcon, 
    DocumentTextIcon, 
    CheckCircleIcon,
    ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

// 공통 유틸리티와 타입 import
import { ProjectDataType } from '../types/proTypes';
import { getMockHealthData } from '../mockData';


const HealthOverview = ({ projectData }) => {
    const displayData = projectData || getMockHealthData();

    // 실제 데이터 또는 기본값 사용
    if (!displayData) {
        return (
            <div className="p-4 flex items-center justify-center h-64">
                <div className="text-gray-500">데이터를 불러오는 중...</div>
            </div>
        );
    }

    // 공통 유틸리티 함수로 통계 데이터 계산 (필요시 사용)
    // const repositoryStats = calculateRepositoryStats(displayData);

    // 활동 타입별 아이콘 반환 함수
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

    // 활동 타입별 색상 반환 함수 - 배경색 없이 기본 스타일
    const getActivityColor = () => {
        return "bg-gray-50 border-gray-200"; // 모든 활동에 동일한 회색 배경 적용
    };

    // 활동 타입별 라벨 반환 함수
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

    // PR 통계 계산
    const prStats = {
        activePullRequests: displayData.pullRequests?.open || 0,
        merged: displayData.pullRequests?.merged || 0,
        open: displayData.pullRequests?.open || 0,
        activeIssues: displayData.issues?.open || 0,
        closed: displayData.issues?.closed || 0,
        new: Math.floor((displayData.issues?.open || 0) * 0.3) // 전체 오픈 이슈의 30%를 신규로 가정
    };

    // 커밋 활동 데이터를 BarChart 형식으로 변환
    const chartData = (displayData.commitActivity || []).map(item => ({
        label: item.day,           // X축 라벨 (월, 화, 수, ...)
        value: item.commits        // Y축 값 (커밋 수)
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {/* 전체 컨테이너: 패딩과 세로 간격 설정 */}
            <div className="p-6 space-y-8">
                {/* PR 및 Issue 활동 이력 섹션 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        PR 및 Issue 활동 이력
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        최근 Pull Request와 Issue 처리 현황을 보여줍니다.
                    </p>

                    {/* PR/Issue 통계를 좌우로 나눈 그리드 레이아웃 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* 왼쪽: PR 통계 */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">{prStats.activePullRequests} Active Pull Request</div>
                            {/* PR 상태 진행률 바 */}
                            <div className="flex mb-4">
                                <div
                                    className="bg-purple-500 h-3 rounded-l"
                                    style={{ width: `${(prStats.merged / (prStats.merged + prStats.open)) * 100}%` }}
                                ></div>
                                <div
                                    className="bg-green-500 h-3 rounded-r"
                                    style={{ width: `${(prStats.open / (prStats.merged + prStats.open)) * 100}%` }}
                                ></div>
                            </div>

                            {/* PR 상태별 상세 통계 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Merged PR 통계 */}
                                <div className="flex items-center space-x-2">
                                    {/* 색상 인디케이터 - 위 진행률 바와 동일한 색상 사용 */}
                                    <div className="w-3 h-3 bg-purple-500 rounded"></div>
                                    <span className="font-semibold">{prStats.merged.toLocaleString()}</span>
                                    <span className="text-gray-600">Merged PR</span>
                                </div>

                                {/* Open PR 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="font-semibold">{prStats.open}</span>
                                    <span className="text-gray-600">Open PR</span>
                                </div>
                            </div>
                        </div>

                        {/* 오른쪽: Issue 통계 */}
                        <div>
                            <div className="text-sm text-gray-600 mb-2">{prStats.activeIssues} Active Issues</div>
                            <div className="flex mb-4">
                                <div
                                    className="bg-red-500 h-3 rounded-l"
                                    style={{ width: `${(prStats.closed / (prStats.closed + prStats.new)) * 100}%` }}
                                ></div>
                                <div
                                    className="bg-green-500 h-3 rounded-r"
                                    style={{ width: `${(prStats.new / (prStats.closed + prStats.new)) * 100}%` }}
                                ></div>
                            </div>

                            {/* Issue 상태별 상세 통계 */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                {/* Closed Issue 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                                    <span className="font-semibold">{prStats.closed.toLocaleString()}</span>
                                    <span className="text-gray-600">Closed Issues</span>
                                </div>

                                {/* New Issue 통계 */}
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                                    <span className="font-semibold">{prStats.new}</span>
                                    <span className="text-gray-600">New Issues</span>
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
                        최근 7일간 커밋 활동
                    </div>

                    {/* 차트 컨테이너 - overflow 처리로 반응형 대응 */}
                    <div className="w-full overflow-hidden">
                        <div className="min-w-0 w-full">
                            {/* BarChart 컴포넌트 사용 - chartData를 시각화 */}
                            <BarChart
                                data={chartData}
                                width="100%"
                                height={250}
                            />
                        </div>
                    </div>

                    {/* 차트 하단 라벨 */}
                    <div className="text-right text-xs text-gray-600 mt-2">
                        Days
                    </div>
                </div>

                {/* Repository 활동 이력 섹션 */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Repository 활동 이력
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                        프로젝트의 최근 활동 내역을 확인할 수 있습니다.
                    </p>

                    {/* TimelineContainer 사용 */}
                    <TimelineContainer
                        data={displayData.recentActivities || []}
                        maxHeight="32rem"
                        renderItem={(activity) => (
                            <div className={`p-3 rounded-lg border ${getActivityColor()}`}>
                                <div className="flex items-start">
                                    {/* 활동 내용 */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center">
                                            {getActivityIcon(activity.type)}
                                            <h5 className="text-sm font-bold text-gray-900 truncate">
                                                {getActivityTypeLabel(activity.type)} {activity.title}
                                            </h5>
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1 ml-6">
                                            {activity.author} • {activity.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>
        </div>
    );
};

/**
 * PropTypes 정의
 */
HealthOverview.propTypes = {
    projectData: ProjectDataType
};

export default HealthOverview;
