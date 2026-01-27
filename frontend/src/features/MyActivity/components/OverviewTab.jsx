import React from "react";
import PropTypes from "prop-types";
import { LoadingSpinner, Button } from "../../../components/common";
import useMyActivityData from "../hooks/useMyActivityData";
import ContributionStatsCard from "./ContributionStatsCard";
import ContributionTypeChart from "./ContributionTypeChart";
import ActivityTrendChart from "./ActivityTrendChart";
import BadgesSection from "./BadgesSection";

const OverviewTab = ({ onTabChange }) => {
  const { data, loading, error } = useMyActivityData();

  if (loading) {
    return (
      <LoadingSpinner
        message="Loading activity data..."
        size="md"
        color="blue"
      />
    );
  } else if (error) {
    return (
      <div className="text-center text-red-500 p-8">
        <p>{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4"
          variant="primary"
        >
          Try Again
        </Button>
      </div>
    );
  }

  // 데이터가 없는 경우 기본값 사용
  const safeData = {
    stats: data?.stats || {
      monthlyPR: 0,
      monthlyIssue: 0,
      monthlyCommit: 0,
      totalScore: 0,
    },
    contributionTypes: data?.contributionTypes || [
      { label: "No Data", value: 100, color: "#E5E7EB" },
    ],
    activities: data?.activities || [],
    recentBadges: data?.recentBadges || [],
  };

  return (
    <div className="space-y-8">
      {/* 기여 통계 요약 카드 */}
      <ContributionStatsCard stats={safeData.stats} />

      {/* 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 기여별 활동 비율 (Pie) */}
        <ContributionTypeChart data={safeData.contributionTypes} />
        {/* 기여 활동 추이 (Bar) */}
        <ActivityTrendChart data={safeData.activities} />
      </div>

      {/* 최근 획득 뱃지 */}
      <BadgesSection
        badges={safeData.recentBadges}
        onShowAllBadges={() => onTabChange("badges")}
      />
    </div>
  );
};

OverviewTab.propTypes = {
  onTabChange: PropTypes.func,
};

export default OverviewTab;
