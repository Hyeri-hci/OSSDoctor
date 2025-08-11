import { useState, useEffect } from "react";
import {
    contributionStats,
    contributionTypeData,
    activityData,
    badgesData,
    contributionHistory
} from "../data/mockData";

const useMyActivityData = () => {
    // Loading state
    const [loading, setLoading] = useState(true);

    // Error state
    const [error, setError] = useState(null);

    // Data state
    const [data, setData] = useState({
        stats: null,                // 기여 통계 요약
        contributionTypes: [],      // 기여 유형별 데이터
        activities: [],             // 기여 활동 추이 데이터
        badges: [],                 // 뱃지 데이터
        history: []                 // 기여 이력 데이터
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 500))

                // Mock API calls
                setData({
                    stats: contributionStats,
                    contributionTypes: contributionTypeData,
                    activities: activityData,
                    badges: badgesData,
                    history: contributionHistory
                });

                setError(null);
            } catch (err) {
                setError("활동 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.");
                console.error("MyActivityData fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { data, loading, error };
};

export const useBadgeFilters = (badges = badgesData) => {
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