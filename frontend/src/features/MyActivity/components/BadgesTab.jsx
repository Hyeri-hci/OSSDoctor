import React, { useState } from "react";
import { Button, LoadingSpinner } from "../../../components/common";
import BadgeCard from "./BadgeCard";
import useBadgeData, { useBadgeFiltersNew } from "../hooks/useBadgeData";
import { calculateBadgeStats, groupBadgesByCategory, getCategoryDisplayName } from '../utils';

const BadgesTab = () => {
    const { badges, loading, error } = useBadgeData();
    const { filteredBadges, filter, setFilter, earnedCount, totalCount } = useBadgeFiltersNew(badges);
    const [showByCategory, setShowByCategory] = useState(false);
    const badgeStats = calculateBadgeStats(badges);
    const categorizedBadges = groupBadgesByCategory(filteredBadges);

    if (loading) {
        return (
            <LoadingSpinner
                message="Loading badge data..."
                size="md"
                color="blue"
            />
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-8">
                <p>{error}</p>
                <Button
                    onClick={() => window.location.reload()}
                    className="mt-4"
                    variant="primary"
                >
                    Try Again
                </Button>
            </div>
        );
    }

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
                            {categoryBadges.filter(badge => badge.earned).length} / {categoryBadges.length} badges earned
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
                <h3 className="text-lg font-semibold text-gray-900">All Badges</h3>
                <div className="text-sm text-gray-600">
                    {earnedCount}/{totalCount} earned ({badgeStats.percentage}%)
                </div>
            </div>

            <p className="text-sm text-gray-600">
                View badges earned for your project contributions and activities. Filter by category or earned status.
            </p>

            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setFilter('all')}
                        variant={filter === 'all' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        All ({totalCount})
                    </Button>

                    <Button
                        onClick={() => setFilter('earned')}
                        variant={filter === 'earned' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Earned ({earnedCount})
                    </Button>

                    <Button
                        onClick={() => setFilter('unearned')}
                        variant={filter === 'unearned' ? 'primary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Not Earned ({totalCount - earnedCount})
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => setShowByCategory(false)}
                        variant={!showByCategory ? 'secondary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        All List
                    </Button>

                    <Button
                        onClick={() => setShowByCategory(true)}
                        variant={showByCategory ? 'secondary' : 'outline'}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        By Category
                    </Button>
                </div>
            </div>

            <div className="max-h-[32rem] overflow-y-auto border border-gray-200 rounded-lg p-4">
                {showByCategory ? (
                    <div>
                        {filteredBadges.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No badges match the selected criteria.
                            </div>
                        ) : (
                            renderCategorizedBadges()
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredBadges.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No badges match the selected criteria.
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

export default BadgesTab;
