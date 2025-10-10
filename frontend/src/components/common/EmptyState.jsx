import React from "react";
import PropTypes from "prop-types";

const EmptyState = ({
    title = "검색 결과가 없습니다.",
    message = "다른 검색어를 사용해 보세요.",
    description = null, // message와 동일한 역할
    icon = null,
    action = null,
    className = ""
}) => {
    const displayMessage = description || message;
    
    return (
        <div className={`min-h-[400px] flex items-center justify-center ${className}`}>
            <div className="text-center">
                {/* 아이콘 표시 */}
                {icon && (
                    <div className="text-6xl mb-4">
                        {typeof icon === 'string' ? icon : icon}
                    </div>
                )}
                
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">{displayMessage}</p>
                {action && <div className="mt-4">{action}</div>}
            </div>
        </div>
    );
};

EmptyState.propTypes = {
    title: PropTypes.string,
    message: PropTypes.string,
    description: PropTypes.string,
    icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    action: PropTypes.node,
    className: PropTypes.string
};

export default EmptyState;
