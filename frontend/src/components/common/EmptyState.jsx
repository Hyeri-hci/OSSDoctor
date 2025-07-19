import React from "react";
import PropTypes from "prop-types";

const EmptyState = ({
    title = "검색 결과가 없습니다.",
    message = "다른 검색어를 사용해 보세요.",
    action = null,
}) => {
    return (
        <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6 max-w-sm max-auto">{message}</p>
                {action && <div className="mt-4">{action}</div>}
            </div>
        </div>
    );
};

EmptyState.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    action: PropTypes.node,
    className: PropTypes.string
};

export default EmptyState;
