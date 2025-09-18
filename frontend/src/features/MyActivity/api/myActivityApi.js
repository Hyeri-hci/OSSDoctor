import { apiClient } from '../../../utils/api-client';

/**
 * 사용자 기여 통계 조회
 * @param {string} nickname - GitHub 사용자명
 * @returns {Promise<Object>} 기여 통계 데이터
 */
export const getUserStats = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/stats/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 통계 조회 실패:', error);
        throw error;
    }
};

/**
 * 사용자 기여 이력 조회
 * @param {string} nickname - GitHub 사용자명  
 * @returns {Promise<Object>} 기여 이력 데이터
 */
export const getUserHistory = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/history/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 기여 이력 조회 실패:', error);
        throw error;
    }
};

/**
 * 사용자 레벨 및 경험치 조회
 * @param {string} nickname - GitHub 사용자명
 * @returns {Promise<Object>} 레벨 및 경험치 데이터
 */
export const getUserLevel = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/level/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 레벨 조회 실패:', error);
        throw error;
    }
};

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 유틸리티 함수들
/**
 * 백엔드 기여 통계를 프론트엔드 포맷으로 변환
 * @param {Object} backendStats - 백엔드에서 받은 통계 데이터
 * @returns {Object} 프론트엔드 형식의 통계 데이터
 */
export const transformStatsData = (backendStats) => {
    return {
        monthlyPR: backendStats.monthlyPR || 0,
        monthlyIssue: backendStats.monthlyIssue || 0,
        monthlyCommit: backendStats.monthlyCommit || 0,
        totalScore: backendStats.totalScore || 0
    };
};

/**
 * 백엔드 기여 이력을 프론트엔드 포맷으로 변환
 * @param {Object} backendHistory - 백엔드에서 받은 이력 데이터
 * @returns {Array} 프론트엔드 형식의 이력 데이터
 */
export const transformHistoryData = (backendHistory) => {
    const transformedData = [];

    // 백엔드 데이터가 비어있으면 빈 배열 반환
    if (!backendHistory || typeof backendHistory !== 'object' || Object.keys(backendHistory).length === 0) {
        return transformedData;
    }

    // 백엔드 데이터가 Map 형태로 올 것으로 예상 (날짜별 그룹화)
    try {
        for (const [dateString, contributions] of Object.entries(backendHistory)) {
            if (Array.isArray(contributions) && contributions.length > 0) {
                const activities = contributions.map(contribution => ({
                    type: mapContributionTypeToActivityType(contribution.referenceType, contribution.state),
                    title: contribution.title || `${contribution.referenceType} activity`,
                    author: contribution.author || 'Unknown',
                    time: formatActivityTime(contribution.contributedAt),
                    repository: contribution.repositoryName,
                    number: contribution.number || null
                }));

                transformedData.push({
                    date: formatDateForDisplay(dateString),
                    activities: activities
                });
            }
        }
    } catch (error) {
        console.warn('기여 이력 데이터 변환 중 오류:', error);
    }

    return transformedData;
};

/**
 * 백엔드 contribution type을 프론트엔드 activity type으로 매핑
 * @param {string} referenceType - 백엔드 참조 타입
 * @param {string} state - 백엔드 상태
 * @returns {string} 프론트엔드 activity type
 */
const mapContributionTypeToActivityType = (referenceType, state) => {
    if (referenceType === 'PR') {
        if (state === 'MERGED') return 'pr_merged';
        if (state === 'OPEN') return 'pr_opened';
        if (state === 'CLOSED') return 'pr_closed';
    }
    
    if (referenceType === 'ISSUE') {
        if (state === 'OPEN') return 'issue_opened';
        if (state === 'CLOSED') return 'issue_closed';
    }

    if (referenceType === 'REVIEW') {
        return 'review';
    }

    return 'commit'; // 기본값
};

/**
 * 날짜를 화면 표시용으로 포맷
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * 활동 시간을 상대적 시간으로 포맷
 * @param {string} dateTimeString - 날짜시간 문자열
 * @returns {string} 상대적 시간 문자열
 */
const formatActivityTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * 기여 유형별 차트 데이터 생성 (목업 데이터 기반)
 * @param {Object} stats - 통계 데이터
 * @returns {Array} 차트 데이터
 */
export const generateContributionTypeChart = (stats) => {
    const total = stats.monthlyPR + stats.monthlyIssue + stats.monthlyCommit;
    
    if (total === 0) {
        return [
            { label: 'No Data', value: 100, color: '#E5E7EB' }
        ];
    }

    return [
        { 
            label: 'Commits', 
            value: Math.round((stats.monthlyCommit / total) * 100), 
            color: '#3B82F6' 
        },
        { 
            label: 'Pull Requests', 
            value: Math.round((stats.monthlyPR / total) * 100), 
            color: '#10B981' 
        },
        { 
            label: 'Issues', 
            value: Math.round((stats.monthlyIssue / total) * 100), 
            color: '#F59E0B' 
        }
    ];
};

/**
 * 활동 추이 차트 데이터 생성 (월별 실제 기여 개수 기반)
 * @param {Object} stats - 통계 데이터
 * @param {Array} historyData - 기여 이력 데이터
 * @returns {Array} 차트 데이터
 */
export const generateActivityTrendChart = (stats, historyData = []) => {
    const months = [];
    const currentDate = new Date();
    
    // 월별 실제 기여 개수 집계
    const monthlyContributionCounts = {};
    
    // historyData에서 실제 기여 이력을 월별로 집계
    if (historyData && historyData.length > 0) {
        historyData.forEach(dayData => {
            if (dayData.activities && dayData.activities.length > 0) {
                dayData.activities.forEach(() => {
                    // 활동 날짜를 파싱 (dayData.date 사용)
                    const date = new Date(dayData.date);
                    const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                    
                    if (!monthlyContributionCounts[monthKey]) {
                        monthlyContributionCounts[monthKey] = 0;
                    }
                    
                    // 각 기여는 1개로 카운트 (개수 기반)
                    monthlyContributionCounts[monthKey] += 1;
                });
            }
        });
    }
    
    // 현재 월의 총 기여 개수 (stats에서 가져온 월별 데이터)
    const currentMonthTotal = (stats?.monthlyPR || 0) + 
                             (stats?.monthlyIssue || 0) + 
                             (stats?.monthlyCommit || 0);
    
    // 최근 7개월 데이터 생성 (실제 데이터만 사용)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('ko-KR', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        let value;
        if (i === 0) {
            // 현재 월: stats 데이터 사용 (가장 신뢰할 수 있는 데이터)
            value = currentMonthTotal;
        } else {
            // 이전 월들: 실제 이력 데이터에서 집계된 값 사용, 없으면 0
            value = monthlyContributionCounts[monthKey] || 0;
        }
        
        months.push({
            label: monthName,
            value: value
        });
    }
    
    return months;
};
