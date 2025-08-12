import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "../../../components/common";
import BadgeCard from "./BadgeCard";
import { useBadgeFilters } from "../hooks/UseMyActivityData";
import { calculateBadgeStats, groupBadgesByCategory, getCategoryDisplayName } from '../utils';

const BadgesTab = ({ badges = [] }) => {
    const { filteredBadges, filter, setFilter, earnedCount, totalCount } = useBadgeFilters(badges);
    const [showByCategory, setShowByCategory] = useState(false);
    const badgeStats = calculateBadgeStats(badges);
    const categorizedBadges = groupBadgesByCategory(filteredBadges);

    const renderCategorizedBadges = () => {
        return Object.entries(categorizedBadges).map(([category, categoryBadges]) => {
            if (categoryBadges.length === 0) return null;

            return (
                <div key={category} className="mb-8">
                    <div className="mb-4">
                        <h4 className="text-md font-semibold text-gray-900 mb-1">
                            {getCategoryDisplayName(category)}
                        </h4>
                        <p className="text-sm text-gray-600">
                            {categoryBadges.filter(badge => badge.earned).length} / {categoryBadges.length} 뱃지 획득
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categoryBadges.map((badges) => (
                            <BadgeCard
                                key={badges.id}
                                badge={badges} />
                        ))}
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">뱃지 전체 이력</h3>
                <div className="text-sm text-gray-600">
                    {earnedCount}/{totalCount} 획득 ({badgeStats.percentage}%)
                </div>
            </div>

            <p className="text-sm text-gray-600">
                기여한 프로젝트와 활동을 인정받은 뱃지를 확인하세요. 카테고리별로 보거나 획득 상태로 필터링할 수 있습니다.
            </p>

            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setFilter('all')}
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        전체 ({totalCount})
                    </Button>

                    <Button
                        onClick={() => setFilter('earned')}
                        variant={filter === 'earned' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        획득 ({earnedCount})
                    </Button>

                    <Button
                        onClick={() => setFilter('unearned')}
                        variant={filter === 'unearned' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        미획득 ({totalCount - earnedCount})
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setShowByCategory(false)}
                        variant={!showByCategory ? 'secondary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        전체 목록
                    </Button>

                    <Button
                        onClick={() => setShowByCategory(true)}
                        variant={showByCategory ? 'secondary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        카테고리별
                    </Button>
                </div>
            </div>

            <div className="max-h-[32rem] overflow-y-auto border border-gray-200 rounded-lg p-4">
                {showByCategory ? (
                    <div>
                        {filteredBadges.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                해당 조건에 맞는 뱃지가 없습니다.
                            </div>
                        ) : (
                            renderCategorizedBadges()
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredBadges.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                해당 조건에 맞는 뱃지가 없습니다.
                            </div>
                        ) : (
                            filteredBadges.map((badge) => (
                                <BadgeCard key={badge.id} badge={badge} />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

BadgesTab.propTypes = {
    badges: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        description: PropTypes.string.isRequired,
        earned: PropTypes.bool.isRequired,
        icon: PropTypes.string.isRequired,
        category: PropTypes.string,
        level: PropTypes.number,
        requirement: PropTypes.string
    })).isRequired
};

export default BadgesTab;
