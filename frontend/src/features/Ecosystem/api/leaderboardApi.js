import { apiClient } from '../../../utils/api-client';

/**
 * 리더보드 데이터 조회
 * @param {string} period - 기간 (today, week, month)
 * @param {number} limit - 조회할 사용자 수
 * @param {boolean} forceRefresh - 강제 새로고침 여부
 * @returns {Promise<Object>} 리더보드 데이터
 */
export const getLeaderboard = async (period = 'today', limit = 10, forceRefresh = false) => {
    try {
        const timestamp = Date.now();
        const refreshParam = forceRefresh ? '&refresh=true' : '';
        const response = await apiClient(`/api/leaderboard/${period}?limit=${limit}&t=${timestamp}${refreshParam}`);
        return response;
    } catch (error) {
        console.error('리더보드 조회 실패:', error);
        throw error;
    }
};

/**
 * 사용자 기여 상태 업데이트 요청
 * @param {string} username - GitHub 사용자명
 * @returns {Promise<Object>} 업데이트 결과
 */
export const updateUserContributions = async (username) => {
    try {
        const response = await apiClient(`/api/contributions/update/${username}`, {
            method: 'POST'
        });
        return response;
    } catch (error) {
        console.error('기여 상태 업데이트 실패:', error);
        throw error;
    }
};

/**
 * 미완료 기여 상태 일괄 업데이트
 * @param {string} username - GitHub 사용자명
 * @returns {Promise<Object>} 업데이트 결과
 */
export const updateIncompleteContributions = async (username) => {
    try {
        const response = await apiClient(`/api/contributions/update-incomplete/${username}`, {
            method: 'POST'
        });
        return response;
    } catch (error) {
        console.error('미완료 기여 업데이트 실패:', error);
        throw error;
    }
};

/**
 * 특정 사용자의 기여 통계 조회
 * @param {string} username - GitHub 사용자명
 * @param {string} period - 기간 (today, week, month)
 * @returns {Promise<Object>} 사용자 기여 통계
 */
export const getUserContributionStats = async (username, period = 'today') => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/contributions/stats/${username}?period=${period}&t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 기여 통계 조회 실패:', error);
        throw error;
    }
};

/**
 * 특정 사용자의 순위 조회
 * @param {string} nickname - 사용자 닉네임
 * @param {string} period - 기간 (today, week, month)
 * @returns {Promise<Object>} 사용자 순위 정보
 */
export const getUserRank = async (nickname, period = 'today') => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/leaderboard/rank/${nickname}?period=${period}&t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 순위 조회 실패:', error);
        throw error;
    }
};

/**
 * 백엔드 리더보드 데이터를 프론트엔드 형식으로 변환
 * @param {Object} backendData - 백엔드에서 받은 리더보드 데이터
 * @returns {Array} 프론트엔드 형식의 리더보드 데이터
 */
export const transformLeaderboardData = (backendData) => {
    if (!backendData || !backendData.success || !backendData.data) {
        return [];
    }

    return backendData.data.map(user => ({
        rank: user.rank,
        username: user.username || user.nickname,
        avatar: user.avatar,
        avatarUrl: user.avatar, // avatar 필드를 avatarUrl로도 매핑
        // 기간별 점수 - 백엔드에서 period에 맞는 점수를 보내줄 것
        totalScore: user.periodScore || user.totalScore, // periodScore 우선, 없으면 totalScore
        periodScore: user.periodScore, // 기간별 점수 필드 추가
        prCount: user.prCount,
        issueCount: user.issueCount,
        commitsCount: user.commitsCount,
        reviewCount: user.reviewCount || 0, // 리뷰 수 추가
        contributionStreak: user.contributionStreak,
        joinDate: user.joinDate,
        // 실시간 업데이트 관련 필드 추가
        lastUpdated: user.lastUpdated,
        incompleteContributions: user.incompleteContributions || 0,
        recentActivity: user.recentActivity || []
    }));
};

/**
 * 백엔드 사용자 순위 데이터를 프론트엔드 형식으로 변환
 * @param {Object} backendData - 백엔드에서 받은 사용자 순위 데이터
 * @returns {Object} 프론트엔드 형식의 사용자 순위 데이터
 */
export const transformUserRankData = (backendData) => {
    if (!backendData || !backendData.success || !backendData.data) {
        return null;
    }

    const user = backendData.data;
    return {
        rank: user.rank,
        username: user.username || user.nickname,
        avatar: user.avatar,
        avatarUrl: user.avatar, // avatar 필드를 avatarUrl로도 매핑
        // 기간별 점수 - 백엔드에서 period에 맞는 점수를 보내줄 것
        totalScore: user.periodScore || user.totalScore, // periodScore 우선, 없으면 totalScore
        periodScore: user.periodScore, // 기간별 점수 필드 추가
        prCount: user.prCount,
        issueCount: user.issueCount,
        commitsCount: user.commitsCount,
        reviewCount: user.reviewCount || 0, // 리뷰 수 추가
        contributionStreak: user.contributionStreak,
        joinDate: user.joinDate,
        // 실시간 업데이트 관련 필드 추가
        lastUpdated: user.lastUpdated,
        incompleteContributions: user.incompleteContributions || 0,
        recentActivity: user.recentActivity || []
    };
};

/**
 * 기여 통계 데이터 변환
 * @param {Object} backendData - 백엔드에서 받은 기여 통계 데이터
 * @returns {Object} 프론트엔드 형식의 기여 통계 데이터
 */
export const transformContributionStats = (backendData) => {
    if (!backendData || !backendData.success || !backendData.data) {
        return null;
    }

    const stats = backendData.data;
    return {
        totalContributions: stats.totalContributions || 0,
        completedContributions: stats.completedContributions || 0,
        incompleteContributions: stats.incompleteContributions || 0,
        contributionsByType: {
            pullRequests: stats.prCount || 0,
            issues: stats.issueCount || 0,
            reviews: stats.reviewCount || 0
        },
        contributionsByStatus: {
            open: stats.openContributions || 0,
            closed: stats.closedContributions || 0,
            merged: stats.mergedContributions || 0
        },
        streak: stats.contributionStreak || 0,
        lastContributionDate: stats.lastContributionDate,
        period: stats.period
    };
};