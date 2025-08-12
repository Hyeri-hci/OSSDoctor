import React from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/common";
import BadgeCard from "./BadgeCard";
import { calculateBadgeStats } from '../utils';

const BadgesSection = ({ badges = [], onShowAllBadges }) => {
    const badgeStats = calculateBadgeStats(badges);
    
    // 최근에 획득한 뱃지만 필터링 (earned가 true인 뱃지 중 최대 6개)
    const recentEarnedBadges = badges
        .filter(badge => badge.earned)
        .slice(0, 6); // 최대 6개만 표시

    return (
        <div className="border-t border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 획득 뱃지</h3>
                <div className="text-sm text-gray-600">
                    {badgeStats.earnedCount}/{badgeStats.totalCount} 획득 ({badgeStats.percentage}%)
                </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                최근에 획득한 뱃지들입니다.
            </p>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
                {recentEarnedBadges.length === 0 ? (
                    <div className="col-span-full text-center py-4 text-gray-500">
                        아직 획득한 뱃지가 없습니다.
                    </div>
                ) : (
                    recentEarnedBadges.map((badge) => (
                        <BadgeCard key={badge.id} badge={badge} />
                    ))
                )}
            </div>

            {/* 전체 뱃지 보기 버튼 */}
            <div className="text-center">
                <Button
                    onClick={onShowAllBadges}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                    전체 뱃지 보기 →
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