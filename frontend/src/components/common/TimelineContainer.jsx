import React from "react";
import PropTypes from "prop-types";

const TimelineContainer = ({ 
    data, 
    maxHeight = "32rem", 
    renderItem, 
    className = "" 
}) => {
    return (
        <div className={`max-h-[${maxHeight}] overflow-y-auto border border-gray-200 rounded-lg p-4 ${className}`}>
            <div className="space-y-6">
                {(data || []).map((dayItem, dayIndex) => (
                    <div key={dayIndex} className="border-l-2 border-gray-200 pl-4 relative">
                        {/* 날짜별 구분선의 동그라미 표시 */}
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>

                        {/* 날짜 헤더 */}
                        <div className="mb-3">
                            <h4 className="text-sm font-semibold text-gray-900">{dayItem.date}</h4>
                        </div>

                        {/* 해당 날짜의 항목 목록 */}
                        <div className="space-y-3">
                            {(dayItem.activities || dayItem.items || []).map((item, itemIndex) => 
                                renderItem(item, itemIndex, dayIndex)
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

TimelineContainer.propTypes = {
    // 날짜별로 그룹화된 데이터 배열
    data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string.isRequired,
        activities: PropTypes.array, // Repository 활동, 기여 이력용
        items: PropTypes.array       // 보안 이력 등 다른 용도
    })).isRequired,
    
    // 최대 높이 (Tailwind CSS 클래스)
    maxHeight: PropTypes.string,
    
    // 각 항목을 렌더링하는 함수
    renderItem: PropTypes.func.isRequired,
    
    // 추가 CSS 클래스
    className: PropTypes.string
};

export default TimelineContainer;
