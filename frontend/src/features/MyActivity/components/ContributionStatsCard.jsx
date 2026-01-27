import React from "react";
import PropTypes from "prop-types";

const ContributionStatsCard = ({ stats }) => {
  // stats가 null이거나 undefined인 경우 기본값 사용
  const {
    monthlyPR = 0,
    monthlyIssue = 0,
    monthlyCommit = 0,
    totalScore = 0,
  } = stats || {};

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Section Title */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contribution Statistics Summary
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        * Based on total contributions
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* PR */}
        <div className="text-center bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Last Month PRs</div>
          <div className="text-2xl font-bold text-gray-900">{monthlyPR}</div>
        </div>

        {/* Issue */}
        <div className="text-center bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Last Month Issues</div>
          <div className="text-2xl font-bold text-gray-900">{monthlyIssue}</div>
        </div>

        {/* Commit */}
        <div className="text-center bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Last Month Commits</div>
          <div className="text-2xl font-bold text-gray-900">
            {monthlyCommit}
          </div>
        </div>

        {/* Total Experience */}
        <div className="text-center bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-1">Total XP</div>
          <div className="text-2xl font-bold text-gray-900">{totalScore}</div>
        </div>
      </div>
    </div>
  );
};

ContributionStatsCard.propTypes = {
  stats: PropTypes.shape({
    monthlyPR: PropTypes.number,
    monthlyIssue: PropTypes.number,
    monthlyCommit: PropTypes.number,
    totalScore: PropTypes.number,
  }), // stats가 null일 수 있으므로 optional
};

export default ContributionStatsCard;
