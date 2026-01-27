import React from "react";
import { PieChart } from '../../../components/common/charts';
import { EmptyState, Button } from '../../../components/common';
import { UserGroupIcon } from "@heroicons/react/24/solid";
import { calculateRepositoryStats, transformLanguageData } from "../utils/diagnoseUtils";
import { ProjectDataType } from '../types/proTypes';

// Activity status message generator
const getActivityStatus = (data) => {
    const openPRs = data.pullRequests?.open || 0;
    const openIssues = data.issues?.open || 0;
    const lastCommitDate = data.pushedAt || data.lastPush;

    // Calculate days since last commit
    const daysSinceLastCommit = lastCommitDate ?
        Math.floor((new Date() - new Date(lastCommitDate)) / (1000 * 60 * 60 * 24)) : null;

    let activityLevel = '';
    if (daysSinceLastCommit === null) {
        activityLevel = 'Activity information is not available';
    } else if (daysSinceLastCommit <= 7) {
        activityLevel = 'Very active development is in progress';
    } else if (daysSinceLastCommit <= 30) {
        activityLevel = 'Steady development activity is ongoing';
    } else if (daysSinceLastCommit <= 90) {
        activityLevel = 'Occasional updates are being made';
    } else {
        activityLevel = 'Recent activity is limited';
    }

    return `${activityLevel}. Currently has ${openPRs} active PRs and ${openIssues} open issues.`;
};

// Health status message generator
const getHealthStatus = (data, healthScore) => {
    const totalIssues = (data.issues?.open || 0) + (data.issues?.closed || 0);
    const issueResolutionRate = totalIssues > 0 ?
        Math.round(((data.issues?.closed || 0) / totalIssues) * 100) : 0;

    let healthMessage = '';
    if (healthScore >= 80) {
        healthMessage = 'Maintaining a very healthy status';
    } else if (healthScore >= 60) {
        healthMessage = 'Overall in good condition';
    } else if (healthScore >= 40) {
        healthMessage = 'There are areas that need improvement';
    } else {
        healthMessage = 'Careful management is required';
    }

    return `${healthMessage}. Issue resolution rate is ${issueResolutionRate}%, with ongoing community participation.`;
};

const OverallOverview = ({ projectData }) => {
    const displayData = projectData

    if (!displayData) {
        return (
            <EmptyState
                title="Cannot load project data"
                message="No project data to analyze. Please search for a repository again."
                action={
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                    >
                        Try Again
                    </Button>
                }
            />
        );
    }

    const repositoryStats = calculateRepositoryStats(displayData);
    const languageData = transformLanguageData(displayData.languages);
    const contributors = Array.isArray(displayData.contributors)
        ? displayData.contributors
        : [];

    // 주 언어 찾기
    const primaryLanguage = languageData && languageData.length > 0
        ? languageData[0].label
        : displayData.language || 'Unknown';
    const primaryLanguagePercentage = languageData && languageData.length > 0
        ? (languageData[0].value || 0)
        : 0;

    // 점수 데이터 (백엔드에서 온 점수 정보)
    const scores = displayData.scores || {};
    const totalScore = scores.totalScore || 0;
    const healthScore = scores.healthScore || 0;
    const socialScore = scores.socialScore || 0;
    const securityScore = scores.securityScore || 0; // 아직 미구현

    // 소셜 점수 상세 정보 (백엔드에서 제공)
    const socialDetails = displayData.scores?.socialDetails || {};
    const starScore = socialDetails.starScore || 0;
    const forkScore = socialDetails.forkScore || 0;
    const watcherScore = socialDetails.watcherScore || 0;
    const contributorScore = socialDetails.contributorScore || 0;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="p-6 space-y-8">
                {/* Summary Statistics Section */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Commits */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-blue-600 mb-2">
                            {repositoryStats.totalCommits.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Commits</div>
                    </div>

                    {/* Total Pull Requests */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-green-600 mb-2">
                            {repositoryStats.totalPullRequests.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total PRs</div>
                    </div>

                    {/* Total Issues */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-yellow-600 mb-2">
                            {repositoryStats.totalIssues.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Issues</div>
                    </div>

                    {/* Last Commit Date */}
                    <div className="text-center">
                        <div className="text-2xl lg:text-3xl font-bold text-purple-600 mb-2">
                            {repositoryStats.lastCommit}
                        </div>
                        <div className="text-sm text-gray-600">Last Commit</div>
                    </div>
                </div>

                {/* 차트 및 상세 정보 섹션 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Main Statistics */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            Repository Info
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg min-h-[60px]">
                                <span className="text-sm text-gray-600">Active PRs</span>
                                <span className="font-semibold text-blue-600">
                                    {displayData.pullRequests?.open || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg min-h-[60px]">
                                <span className="text-sm text-gray-600">Open Issues</span>
                                <span className="font-semibold text-red-600">
                                    {displayData.issues?.open || 0}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg min-h-[60px]">
                                <span className="text-sm text-gray-600">Issue Resolution Rate</span>
                                <span className="font-semibold text-green-600">
                                    {Math.round(((displayData.issues?.closed || 0) / ((displayData.issues?.open || 0) + (displayData.issues?.closed || 0)) * 100)) || 0}%
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg min-h-[60px]">
                                <span className="text-sm text-gray-600">Total Contributors</span>
                                <span className="font-semibold text-purple-600">
                                    {displayData.totalContributors || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* 중간: 소셜 점수 세부 정보 */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-4">
                            소셜 점수 상세
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 min-h-[60px]">
                                <span className="text-sm text-blue-700">⭐ 스타 점수</span>
                                <span className="font-semibold text-blue-600">
                                    {starScore}점
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 min-h-[60px]">
                                <span className="text-sm text-blue-700">🍴 포크 점수</span>
                                <span className="font-semibold text-blue-600">
                                    {forkScore}점
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 min-h-[60px]">
                                <span className="text-sm text-blue-700">👀 워처 점수</span>
                                <span className="font-semibold text-blue-600">
                                    {watcherScore}점
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200 min-h-[60px]">
                                <span className="text-sm text-blue-700">👥 기여자 점수</span>
                                <span className="font-semibold text-blue-600">
                                    {contributorScore}점
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Language Distribution and Contributor Info */}
                <div className="grid gap-8">
                    {/* Left: Language Distribution Chart */}
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 mb-3">
                            Language Distribution
                        </h3>
                        <div className="text-xs text-gray-600 mb-2">
                            Programming languages used in the project
                        </div>

                        {/* Primary Language Display */}
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-sm font-medium text-blue-800">
                                Primary Language: <span className="font-bold">{primaryLanguage}</span>
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                                Accounts for {(primaryLanguagePercentage || 0).toFixed(1)}% of total
                            </div>
                        </div>

                        {/* PieChart를 중앙에 배치 */}
                        <div className="flex justify-center">
                            <PieChart data={languageData} />
                        </div>

                        {/* 언어별 상세 정보 */}
                        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            {languageData && languageData.slice(0, 6).map((lang, index) => (
                                <div key={lang.label} className="flex items-center space-x-2">
                                    <div className={`w-3 h-3 rounded`} style={{
                                        backgroundColor: lang.color || ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6366F1'][index]
                                    }}></div>
                                    <span className="font-semibold">{lang.label}</span>
                                    <span className="text-gray-600">{(lang.value || 0).toFixed(1)}%</span>
                                </div>
                            ))}
                        </div>

                        {/* Chart Bottom Label */}
                        <div className="text-center text-xs text-gray-600 mt-2">
                            Usage Ratio by Language
                        </div>
                    </div>
                </div>

                {/* Contributor Info Section */}
                <div>
                    <div className="flex items-center mb-4">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-900">
                            Top Contributors
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {contributors.length > 0 ? (
                            contributors.slice(0, 9).map((contributor, index) => (
                                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                                    {/* 실제 GitHub 아바타 사용 */}
                                    <img
                                        src={contributor.avatarUrl || contributor.avatar_url || `https://github.com/${contributor.name || contributor.login}.png`}
                                        alt={contributor.name || contributor.login}
                                        className="w-10 h-10 rounded-full mr-3"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/40x40/cccccc/666666?text=?';
                                        }}
                                    />
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm text-gray-900">
                                            {contributor.name || contributor.login}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {contributor.contributions} contributions
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-8">
                                Loading contributor information...
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Activity Summary */}
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                        Project Summary
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Activity Status</h4>
                            <p className="text-sm text-gray-600">
                                {getActivityStatus(displayData)}
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Project Health</h4>
                            <p className="text-sm text-gray-600">
                                {getHealthStatus(displayData, healthScore)}
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