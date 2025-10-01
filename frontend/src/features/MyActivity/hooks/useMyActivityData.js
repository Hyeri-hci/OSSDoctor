import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { 
    getUserStats, 
    getUserHistory, 
    getUserLevel,
    getUserRecentBadges,
    transformStatsData,
    transformHistoryData,
    transformRecentBadgesData,
    generateContributionTypeChart,
    generateActivityTrendChart
} from "../api/myActivityApi";
import {
    badgesData // 뱃지 백엔드 API 실패시 fallback으로 사용
} from "../data/mockData";

const useMyActivityData = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    // Data state
    const [data, setData] = useState({
        stats: null,                // 기여 통계 요약
        contributionTypes: [],      // 기여 유형별 데이터
        activities: [],             // 기여 활동 추이 데이터
        recentBadges: [],           // 최근 뱃지 데이터 (개요 탭용)
        history: []                 // 기여 이력 데이터
    });

    useEffect(() => {
        // 인증이 로딩 중이면 대기
        if (authLoading) {
            return;
        }

        // 로그인하지 않은 경우
        if (!isAuthenticated || !user) {
            setError("로그인이 필요합니다. 먼저 GitHub 계정으로 로그인해주세요.");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                const currentUser = user.nickname || user.login; // GitHub 사용자명 사용

                // 1단계: 기여 이력 먼저 불러오기
                console.log('🔄 1단계: 기여 이력 로딩 시작');
                const historyResponse = await getUserHistory(currentUser).catch(err => {
                    console.warn('기여 이력 로딩 실패, 기본값 사용:', err);
                    return { success: false, data: {} };
                });

                const history = historyResponse.success ? 
                    transformHistoryData(historyResponse.data) : 
                    [];

                // 2단계: 레벨 정보 불러오기
                console.log('🔄 2단계: 레벨 정보 로딩 시작');
                const levelResponse = await getUserLevel(currentUser).catch(err => {
                    console.warn('레벨 정보 로딩 실패, 기본값 사용:', err);
                    return { success: false, data: { level: 1, totalScore: 0 } };
                });

                // 3단계: 통계와 최근 뱃지 병렬로 불러오기
                console.log('🔄 3단계: 통계 및 최근 뱃지 로딩 시작');
                const [statsResponse, recentBadgesResponse] = await Promise.all([
                    getUserStats(currentUser).catch(err => {
                        console.warn('통계 데이터 로딩 실패, 기본값 사용:', err);
                        return { success: false, data: { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 } };
                    }),
                    getUserRecentBadges(currentUser).catch(err => {
                        console.warn('최근 뱃지 데이터 로딩 실패, 목업 데이터 사용:', err);
                        return { success: false, data: null };
                    })
                ]);

                // 데이터 변환 및 설정
                const stats = statsResponse.success ? 
                    transformStatsData(statsResponse.data) : 
                    { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 };

                // 최근 뱃지 데이터 변환 (개요 탭용)
                const recentBadges = recentBadgesResponse.success ? 
                    transformRecentBadgesData(recentBadgesResponse) : 
                    badgesData.filter(badge => badge.earned).slice(0, 12);

                // 차트 데이터 생성 (history 데이터도 함께 전달)
                const contributionTypes = generateContributionTypeChart(stats);
                const activities = generateActivityTrendChart(stats, history);

                setData({
                    stats: stats,
                    contributionTypes: contributionTypes,
                    activities: activities,
                    recentBadges: recentBadges, // 개요 탭용 최근 뱃지
                    history: history,
                    userLevel: levelResponse.success ? levelResponse.data : { level: 1, totalScore: 0 }
                });

            } catch (err) {
                setError("활동 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
                console.error("MyActivityData fetch error:", err);
                
                // 에러 발생시 기본값으로 설정
                setData({
                    stats: { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 },
                    contributionTypes: [{ label: 'No Data', value: 100, color: '#E5E7EB' }],
                    activities: [],
                    recentBadges: badgesData.filter(badge => badge.earned).slice(0, 12),
                    history: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [authLoading, isAuthenticated, user?.login]); // user.login을 사용하여 사용자 변경 시에도 새로운 요청

    return { data, loading, error };
};

export const useBadgeFiltersNew = (badges = badgesData) => {
    const [filter, setFilter] = useState("all");

    // badges가 배열이 아닌 경우 빈 배열로 처리
    const safeBadges = Array.isArray(badges) ? badges : [];

    const filteredBadges = safeBadges.filter(badge => {
        switch (filter) {
            case "earned":
                return badge.earned;    // 획득한 뱃지
            case "unearned":
                return !badge.earned;   // 획득하지 않은 뱃지
            default:
                return true;            // 모든 뱃지
        }
    });

    const earnedCount = safeBadges.filter(badge => badge.earned).length;
    const totalCount = safeBadges.length;

    return {
        filteredBadges,     // 필터링된 뱃지 목록
        filter,             // 현재 필터
        setFilter,         // 필터 설정 함수
        earnedCount,       // 획득한 뱃지 수
        totalCount         // 전체 뱃지 수
    };
};

// Default export
export default useMyActivityData;
