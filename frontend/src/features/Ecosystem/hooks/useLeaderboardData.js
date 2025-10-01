import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getLeaderboard, getUserRank, transformLeaderboardData, transformUserRankData } from '../api/leaderboardApi';
import { MOCK_LEADERBOARD_DATA, MOCK_CURRENT_USER } from '../mockData';

/**
 * 리더보드 데이터를 관리하는 훅
 * @param {string} timePeriod - 리더보드 데이터의 시간 범위 ('today', 'week', 'month')
 * @return {Object} 리더보드 데이터와 관련된 함수들
 */
const useLeaderboardData = (timePeriod = 'today') => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    // 기간 매핑 (UI용 -> API용)
    const mapTimePeriod = (period) => {
        const periodMap = {
            'today': 'today',    // 오늘
            'week': 'week',      // 이번 주  
            'month': 'month'     // 이번 달
        };
        return periodMap[period] || 'today';
    };

    /**
     * 리더보드 데이터 로드
     */
    const loadLeaderboardData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiPeriod = mapTimePeriod(timePeriod);
            
            // 리더보드 데이터 조회
            const leaderboardResponse = await getLeaderboard(apiPeriod, 10).catch(err => {
                console.warn('리더보드 API 호출 실패, 목업 데이터 사용:', err);
                return null;
            });
            
            if (leaderboardResponse && leaderboardResponse.success) {
                const transformedData = transformLeaderboardData(leaderboardResponse);
                setLeaderboardData(transformedData);
            } else {
                // API 실패시 목업 데이터 사용
                console.warn('리더보드 API 응답 실패, 목업 데이터 사용');
                const mockPeriod = timePeriod === 'today' ? 'realtime' : timePeriod; // today -> realtime 매핑
                const mockData = MOCK_LEADERBOARD_DATA[mockPeriod] || MOCK_LEADERBOARD_DATA.realtime;
                setLeaderboardData(mockData.map((user, index) => ({ ...user, rank: index + 1 })));
            }

            // 현재 사용자 순위 조회 (로그인된 경우)
            if (isAuthenticated && user && user.nickname) {
                const userRankResponse = await getUserRank(user.nickname, apiPeriod).catch(err => {
                    console.warn('사용자 순위 API 호출 실패, 목업 데이터 사용:', err);
                    return null;
                });
                
                if (userRankResponse && userRankResponse.success) {
                    const transformedUserData = transformUserRankData(userRankResponse);
                    setCurrentUser(transformedUserData);
                } else {
                    // API 실패시 목업 데이터 사용 (로그인된 상태에서만)
                    console.warn('사용자 순위 API 응답 실패, 목업 데이터 사용');
                    setCurrentUser(MOCK_CURRENT_USER);
                }
            } else {
                // 로그인하지 않은 경우 currentUser를 null로 설정
                setCurrentUser(null);
            }
            
        } catch (err) {
            console.error('리더보드 데이터 로드 중 오류:', err);
            setError('리더보드 데이터를 불러오는데 실패했습니다.');
            
            // 에러 발생시 목업 데이터로 fallback
            const mockPeriod = timePeriod === 'today' ? 'realtime' : timePeriod; // today -> realtime 매핑
            const mockData = MOCK_LEADERBOARD_DATA[mockPeriod] || MOCK_LEADERBOARD_DATA.realtime;
            setLeaderboardData(mockData.map((user, index) => ({ ...user, rank: index + 1 })));
            
            // 로그인된 경우에만 목업 사용자 데이터 설정
            if (isAuthenticated && user) {
                setCurrentUser(MOCK_CURRENT_USER);
            } else {
                setCurrentUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    /**
     * 리더보드 데이터 새로고침
     */
    const refreshLeaderboard = async () => {
        await loadLeaderboardData();
    };

    // timePeriod 변경시 또는 인증 상태 확인 완료 후 데이터 새로 로드
    useEffect(() => {
        // 인증 상태 로딩이 완료된 후에만 리더보드 데이터 로드
        if (!authLoading) {
            loadLeaderboardData();
        }
    }, [timePeriod, isAuthenticated, user?.nickname, authLoading]);

    return {
        leaderboardData,
        currentUser,
        loading,
        error,
        refreshLeaderboard
    };
};

export default useLeaderboardData;

