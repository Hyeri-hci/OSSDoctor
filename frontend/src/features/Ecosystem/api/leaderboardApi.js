import { apiClient } from '../../../utils/api-client';

/**
 * 리더보드 데이터 조회
 * @param {string} period - 기간 (today, week, month)
 * @param {number} limit - 조회할 사용자 수
 * @returns {Promise<Object>} 리더보드 데이터
 */
export const getLeaderboard = async (period = 'today', limit = 10) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/leaderboard/${period}?limit=${limit}&t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('리더보드 조회 실패:', error);
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
        totalScore: user.totalScore,
        prCount: user.prCount,
        issueCount: user.issueCount,
        commitsCount: user.commitsCount,
        contributionStreak: user.contributionStreak,
        joinDate: user.joinDate
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
        totalScore: user.totalScore,
        prCount: user.prCount,
        issueCount: user.issueCount,
        commitsCount: user.commitsCount,
        contributionStreak: user.contributionStreak,
        joinDate: user.joinDate
    };
};