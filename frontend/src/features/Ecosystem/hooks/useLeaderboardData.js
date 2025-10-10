import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
    getLeaderboard, 
    getUserRank, 
    transformLeaderboardData, 
    transformUserRankData,
    updateUserContributions
} from '../api/leaderboardApi';

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
    const [isEmpty, setIsEmpty] = useState(false); // 데이터가 비어있는지 추적

    // 기간 매핑 (UI용 -> API용)
    const mapTimePeriod = useCallback((period) => {
        const periodMap = {
            'today': 'today',    // 오늘
            'week': 'week',      // 이번 주  
            'month': 'month'     // 이번 달
        };
        return periodMap[period] || 'today';
    }, []);

    /**
     * 리더보드 데이터 로드
     * @param {boolean} forceRefresh - 캐시 무시하고 강제 새로고침
     */
    const loadLeaderboardData = useCallback(async (forceRefresh = false) => {
        try {
            setLoading(true);
            setError('');
            setIsEmpty(false);
            
            const apiPeriod = mapTimePeriod(timePeriod);
            
            // 리더보드 데이터 조회
            const leaderboardResponse = await getLeaderboard(apiPeriod, 10, forceRefresh).catch(err => {
                console.warn('리더보드 API 호출 실패:', err);
                throw err; // 에러를 다시 throw하여 catch 블록에서 처리
            });
            
            if (leaderboardResponse && leaderboardResponse.success) {
                const transformedData = transformLeaderboardData(leaderboardResponse);
                setLeaderboardData(transformedData);
                setIsEmpty(transformedData.length === 0); // 데이터가 비어있는지 확인
            } else {
                // API 응답은 성공했지만 데이터가 없는 경우
                console.warn('리더보드 API 응답에 데이터가 없음');
                setLeaderboardData([]);
                setIsEmpty(true);
            }

            // 현재 사용자 순위 조회 (로그인된 경우)
            if (isAuthenticated && user && user.nickname) {
                const userRankResponse = await getUserRank(user.nickname, apiPeriod).catch(err => {
                    console.warn('사용자 순위 API 호출 실패:', err);
                    return null; // 사용자 순위는 실패해도 메인 데이터에는 영향 없음
                });
                
                if (userRankResponse && userRankResponse.success) {
                    const transformedUserData = transformUserRankData(userRankResponse);
                    setCurrentUser(transformedUserData);
                } else {
                    // 사용자 순위 조회 실패시 null로 설정
                    setCurrentUser(null);
                }
            } else {
                // 로그인하지 않은 경우 currentUser를 null로 설정
                setCurrentUser(null);
            }
            
        } catch (err) {
            console.error('리더보드 데이터 로드 중 오류:', err);
            setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.');
            setLeaderboardData([]);
            setCurrentUser(null);
            setIsEmpty(false); // 오류 상태에서는 isEmpty를 false로 설정
        } finally {
            setLoading(false);
        }
    }, [timePeriod, isAuthenticated, user, mapTimePeriod]);

    /**
     * 리더보드 데이터 새로고침
     * @param {boolean} forceRefresh - 캐시 무시하고 강제 새로고침
     */
    const refreshLeaderboard = useCallback(async (forceRefresh = false) => {
        await loadLeaderboardData(forceRefresh);
    }, [loadLeaderboardData]);

    // timePeriod 변경시 또는 인증 상태 확인 완료 후 데이터 새로 로드
    useEffect(() => {
        // 인증 상태 로딩이 완료된 후에만 리더보드 데이터 로드
        if (!authLoading) {
            loadLeaderboardData();
        }
    }, [timePeriod, isAuthenticated, user?.nickname, authLoading, loadLeaderboardData]);

    return {
        leaderboardData,
        currentUser,
        loading,
        error,
        isEmpty,
        refreshData: refreshLeaderboard // refreshLeaderboard -> refreshData로 명명 통일
    };
};

export default useLeaderboardData;

