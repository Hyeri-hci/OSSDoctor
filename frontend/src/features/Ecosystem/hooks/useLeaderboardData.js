import { useState, useMemo } from 'react';
import { MOCK_LEADERBOARD_DATA, MOCK_CURRENT_USER } from '../mockData';

/**
 * 리더보드 데이터를 관리하는 훅
 * @param {string} timePeriod - 리더보드 데이터의 시간 범위 ('realtime', 'week', 'month')
 * @return {Object} 리더보드 데이터와 관련된 함수들
 */

const useLeaderboardData = (timePeriod = 'realtime') => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    /**
     * 기간별 리더보드 데이터 계산 (메모이제이션)
     */
    const filteredLeaderboardData = useMemo(() => {
        const data = MOCK_LEADERBOARD_DATA[timePeriod] || MOCK_LEADERBOARD_DATA.realtime;
        
        // 순위 재계산
        return data.map((user, index) => ({
            ...user,
            rank: index + 1
        }));
    }, [timePeriod]);

    /**
     * 현재 사용자 정보
     */
    const currentUser = useMemo(() => {
        return MOCK_CURRENT_USER;
    }, []);

    /**
     * 리더보드 데이터 새로고침 (실제로는 API 호출)
     */
    const refreshLeaderboard = async () => {
        setLoading(true);
        setError('');
        
        try {
            // 실제 환경에서는 API 호출
            await new Promise(resolve => setTimeout(resolve, 1000));
            setLoading(false);
        } catch (error) {
            setError('리더보드 데이터를 불러오는데 실패했습니다.');
            setLoading(false);
            console.error('리더보드 새로고침 에러:', error);
        }
    };

    return {
        leaderboardData: filteredLeaderboardData,
        currentUser,
        loading,
        error,
        refreshLeaderboard
    };
};

export default useLeaderboardData;

