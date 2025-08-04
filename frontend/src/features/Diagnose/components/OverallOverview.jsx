import React from "react";
import { PieChart } from '../../../components/common/charts';
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { calculateRepositoryStats, transformLanguageData } from "../utils/diagnoseUtils";
import { ProjectDataType } from '../types/proTypes';
import { getMockProjectData } from '../mockData';

const OverallOverview = ({ projectData }) => {
    // 실제 데이터가 없으면 목업 데이터 사용
    const displayData = projectData || getMockProjectData();

    if (!displayData) {
        return <div className="p-4 flex items-center justify-center h-64">
            <div className="text-gray-500">프로젝트 데이터가 없습니다.</div>
        </div>;
    }

    const repositoryStats = calculateRepositoryStats(displayData);
    const languageData = transformLanguageData(displayData.languages);
    const contributors = Array.isArray(displayData.contributors)
        ? displayData.contributors
        : [];

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="p-6 space-y-8">
                {/* 상단 요약 통계 섹션 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* 총 커밋 수 */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                            {repositoryStats.totalCommits.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">총 커밋</div>
                    </div>

                    {/* 총 Pull Request 수 */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">
                            {repositoryStats.totalPullRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">총 PR</div>
                    </div>

                    {/* 총 Issue 수 */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-2">
                            {repositoryStats.totalIssues.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">총 이슈</div>
                    </div>

                    {/* 마지막 커밋 날짜 */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
                            {repositoryStats.lastCommit}
                        </div>
                        <div className="text-sm text-gray-600">마지막 커밋</div>
                    </div>
                </div>

                {/* 차트 및 상세 정보 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* 왼쪽: 주요 통계 정보 */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            저장소 정보
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">활성 PR</span>
                                <span className="font-semibold text-blue-600">
                                    {displayData.pullRequests?.open || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">미해결 이슈</span>
                                <span className="font-semibold text-red-600">
                                    {displayData.issues?.open || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">이슈 해결률</span>
                                <span className="font-semibold text-green-600">
                                    {Math.round(((displayData.issues?.closed || 0) / ((displayData.issues?.open || 0) + (displayData.issues?.closed || 0)) * 100)) || 0}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm text-gray-600">기여자 수</span>
                                <span className="font-semibold text-purple-600">
                                    {Array.isArray(displayData.contributors) ? displayData.contributors.length : 0}명
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 오른쪽: 언어 분포 차트 */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            언어 분포
                        </h3>
                        <div className="text-xs text-gray-600 mb-4">
                            프로젝트에서 사용된 프로그래밍 언어
                        </div>

                        {/* PieChart를 중앙에 배치 */}
                        <div className="flex justify-center">
                            <PieChart data={languageData} width={200} height={200} />
                        </div>

                        {/* 차트 하단 라벨 */}
                        <div className="text-center text-xs text-gray-600 mt-2">
                            주요 언어들
                        </div>
                    </div>
                </div>

                {/* 기여자 정보 섹션 */}
                <div>
                    <div className="flex items-center mb-4">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">
                            주요 기여자
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contributors.length > 0 ? (
                            contributors.map((contributor, index) => (
                                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    {/* 실제 GitHub 아바타 사용 */}
                                    <img
                                        src={contributor.avatar_url || `https://github.com/${contributor.login}.png`}
                                        alt={contributor.login}
                                        className="w-10 h-10 rounded-full mr-3"
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/40/40';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm text-gray-900">
                                            {contributor.login}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {contributor.contributions} 기여
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-8">
                                기여자 정보를 불러오는 중입니다...
                            </div>
                        )}
                    </div>
                </div>

                {/* 최근 활동 요약 */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        프로젝트 요약
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">활동 상태</h4>
                            <p className="text-sm text-gray-600">
                                최근 30일간 활발한 개발 활동이 진행되고 있으며,
                                {displayData.pullRequests?.open || 0}개의 활성 PR과
                                {displayData.issues?.open || 0}개의 미해결 이슈가 있습니다.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">프로젝트 건강도</h4>
                            <p className="text-sm text-gray-600">
                                전체적으로 건강한 상태를 유지하고 있으며,
                                정기적인 업데이트와 커뮤니티 참여가 이루어지고 있습니다.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

OverallOverview.propTypes = {
    projectData: ProjectDataType
};

export default OverallOverview;