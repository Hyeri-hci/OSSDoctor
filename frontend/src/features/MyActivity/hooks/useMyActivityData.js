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

export default useMyActivityData;