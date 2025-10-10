import { useState } from "react";
import { useMyActivityContext } from "../../../contexts/MyActivityContext";
import { badgesData } from "../data/mockData";

/**
 * MyActivity 데이터를 사용하는 Hook
 * Context에서 캐싱된 데이터를 가져옴 (로그인 시 자동 로드됨)
 */
const useMyActivityData = () => {
    // Context에서 전역 데이터 가져오기
    const { data, loading, error, isDataLoaded, refreshData } = useMyActivityContext();

    // Context 데이터를 그대로 반환 (추가 API 호출 없음)
    return { 
        data, 
        loading, 
        error,
        isDataLoaded,
        refreshData // 수동 새로고침이 필요한 경우 사용
    };
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
