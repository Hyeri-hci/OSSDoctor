import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/common";
import BadgeCard from "./BadgeCard";
import { calculateBadgeStats } from '../utils';

const BadgesSection = ({ badges = [], onShowAllBadges }) => {
    const badgeStats = calculateBadgeStats(badges);
    
    // 최근에 획득한 뱃지만 필터링 (이미 획득한 순서대로 정렬되어 있음)
    const recentEarnedBadges = badges.slice(0, 12); // 최대 12개까지 표시

    return (
        <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recently Earned Badges</h3>
                <div className="text-sm text-gray-600">
                    {badgeStats.earnedCount}/{badgeStats.totalCount} earned ({badgeStats.percentage}%)
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Badges you have recently earned.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {recentEarnedBadges.length === 0 ? (
                    <div className="col-span-full text-center py-4 text-gray-500">
                        No badges earned yet.
                    </div>
                ) : (
                    recentEarnedBadges.map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))
                )}
            </div>

            {/* View All Badges Button */}
            <div className="text-center">
                <Button
                    onClick={onShowAllBadges}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    View All Badges →
                </Button>
            </div>
        </div>
    );
};

BadgesSection.propTypes = {
    badges: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        earned: PropTypes.bool.isRequired,
        icon: PropTypes.string.isRequired,
        category: PropTypes.string,
        level: PropTypes.number,
        requirement: PropTypes.string
    })).isRequired,
    onShowAllBadges: PropTypes.func
};

export default BadgesSection;