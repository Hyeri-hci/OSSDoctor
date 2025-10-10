import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { 
    getUserBadges,
    transformBadgesData
} from "../api/myActivityApi";
import {
    badgesData // 뱃지 백엔드 API 실패시 fallback으로 사용
} from "../data/mockData";

/**
 * Badge 탭 전용 훅 - 전체 뱃지 데이터를 관리
 */
const useBadgeData = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    // Badge data state
    const [badges, setBadges] = useState([]);

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

        const fetchBadgeData = async () => {
            try {
                setLoading(true);
                setError(null);

                const currentUser = user.nickname || user.login;

                console.log('🏆 Badge 탭: 전체 뱃지 데이터 로딩 시작');
                const badgesResponse = await getUserBadges(currentUser).catch(err => {
                    console.warn('전체 뱃지 데이터 로딩 실패, 목업 데이터 사용:', err);
                    return { success: false, data: null };
                });

                // 전체 뱃지 데이터 변환
                const allBadges = badgesResponse.success ? 
                    transformBadgesData(badgesResponse) : 
                    badgesData;

                setBadges(allBadges);

            } catch (err) {
                setError("뱃지 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
                console.error("BadgeData fetch error:", err);
                
                // 에러 발생시 목업 데이터 사용
                setBadges(badgesData);
            } finally {
                setLoading(false);
            }
        };

        fetchBadgeData();
    }, [authLoading, isAuthenticated, user?.login]);

    return { badges, loading, error };
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

export default useBadgeData;