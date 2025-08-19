import React from 'react';
import PropTypes from 'prop-types';
import { getBadgeLevelColor } from '../utils';

const BadgeCard = ({ badge }) => {
    const { name, description, earned, icon, level, requirement } = badge;

    return (
        <div
            className={`p-3 rounded-lg border text-center transition-all hover:shadow-md ${earned
                    ? getBadgeLevelColor(level)     // 레벨별 색상 적용
                    : 'border-gray-200 bg-gray-50 text-gray-400'
                }`}
        >
            {/* Badge Level (Earned) */}
            {earned && level && (
                <div className="text-xs font-bold mb-1 opacity-75">
                    Level {level}
                </div>
            )}

            {/* Badge Icon */}
            <div className={`text-xl mb-2 ${earned ? '' : 'grayscale opacity-50'}`}>
                {icon}
            </div>

            {/* Badge Name */}
            <div className={`text-xs font-semibold mb-1 leading-tight ${earned ? '' : 'text-gray-400'
                }`}>
                {name}
            </div>

            {/* Badge Description */}
            <div className={`text-xs mb-2 leading-tight ${earned ? 'opacity-75' : 'text-gray-400'
                }`}>
                {description}
            </div>

            {/* Badge Requirement (for unearned badges only) */}
            {!earned && requirement && (
                <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
                    <div className="font-medium mb-1">획득 조건:</div>
                    <div className="leading-tight">{requirement}</div>
                </div>
            )}
        </div>
    );
};

BadgeCard.propTypes = {
    badge: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        earned: PropTypes.bool.isRequired,
        icon: PropTypes.string.isRequired,
        category: PropTypes.string,
        level: PropTypes.number,
        requirement: PropTypes.string
    }).isRequired
};

export default BadgeCard;