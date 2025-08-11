import React from "react";
import PropTypes from "prop-types";
import { PieChart } from "../../../components/common/charts";


const ContributionTypeChart = ({ data }) => {
    return (
        <div>
            {/* Chart title */}
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                기여 유형별 활동 비율
            </h3>
            {/* Chart Description */}
            <p className="text-sm text-gray-600 mb-4">
                기여 유형별 활동 비율을 나타내는 원형 차트입니다.
            </p>

            {/* Chart Container */}
            <div className="flex justify-center">
                <PieChart
                    data={data}
                    width={300}
                    height={300}
                />
            </div>

            {/* Chart Legend */}
            <div className="text-center text-sm text-gray-600 mt-2">
                Contributions Type
            </div>

        </div>
    );
};

ContributionTypeChart.propTypes = {
    data: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,     // 기여 유형 이름
            value: PropTypes.number.isRequired,     // 기여 횟수
            color: PropTypes.string.isRequired,     // 세그먼트 색상
        })
    ).isRequired
};

export default ContributionTypeChart;
