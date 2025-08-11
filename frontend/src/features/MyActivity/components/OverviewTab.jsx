import React from "react";
import { LoadingSpinner, Button } from "../../../components/common";
import useMyActivityData from "../hooks/UseMyActivityData";
import ContributionStatsCard from "./ContributionStatsCard";
import ContributionTypeChart from "./ContributionTypeChart";
import ActivityTrendChart from "./ActivityTrendChart";
import BadgesSection from "./BadgesSection";

const OverviewTab = () => {
    const { data, loading, error } = useMyActivityData();

    if (loading) {
        return (
            <LoadingSpinner
                message="활동 데이터를 불러오는 중입니다..."
                size="md"
                color="blue"
            />
        );
    }
    else if (error) {
        return (
            <div className="text-center text-red-500 p-8">
                <p>{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="mt-4"
                    variant="primary"
                >
                    다시 시도
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* 기여 통계 요약 카드 */}
            <ContributionStatsCard stats={data.stats} />

            {/* 차트 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 기여별 활동 비율 (Pie) */}
                <ContributionTypeChart data={data.contributionTypes} />
                {/* 기여 활동 추이 (Bar) */}
                <ActivityTrendChart data={data.activities} />
            </div>

            {/* 최근 획득 뱃지 */}
            <BadgesSection badges={data.badges} />
        </div>
    )
}

export default OverviewTab;