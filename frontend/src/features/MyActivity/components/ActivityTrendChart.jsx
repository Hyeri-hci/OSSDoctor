import React from "react";
import PropTypes from "prop-types";
import { BarChart } from "../../../components/common/charts";

const ActivityTrendChart = ({ data }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Chart title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Contribution Activity Trend
      </h3>
      {/* Chart Description */}
      <p className="text-sm text-gray-600 mb-6">
        A bar chart showing monthly trends of recent contribution activity.
      </p>

      {/* Chart Container */}
      <div className="w-full overflow-hidden">
        <BarChart data={data} width="100%" height={300} />
      </div>

      {/* Chart Legend */}
      <div className="text-center text-sm text-gray-600 mt-2">Month</div>
    </div>
  );
};

ActivityTrendChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired, // X축 레이블 (예: "2025-08")
      value: PropTypes.number.isRequired, // Y축 값 (예: 기여 횟수)
    }),
  ).isRequired,
};

export default ActivityTrendChart;
