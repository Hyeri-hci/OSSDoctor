import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeftIcon, ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Button, EmptyState, LoadingSpinner } from '../../../components/common';
import useLeaderboardData from '../hooks/useLeaderboardData';
import { useAuth } from '../../../hooks/useAuth';
import { initiateGitHubLogin } from '../../../utils/github-auth';
import { updateIncompleteContributions } from '../api/leaderboardApi';

const ActivityLeaderboard = ({ onBack }) => {
    const [timePeriod, setTimePeriod] = useState('today'); // 'realtime' -> 'today'로 변경
    const [isUpdating, setIsUpdating] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const { isAuthenticated, isLoading: authLoading, user } = useAuth();

    const {
        leaderboardData,
        currentUser,
        loading,
        error,
        refreshData
    } = useLeaderboardData(timePeriod);

    // 자동 새로고침 (5분마다)
    useEffect(() => {
        const interval = setInterval(() => {
            refreshData();
            setLastUpdateTime(new Date());
        }, 5 * 60 * 1000); // 5분

        return () => clearInterval(interval);
    }, [refreshData]);

    const handleTimePeriodChange = (period) => {
        setTimePeriod(period);
    };

    const handleManualUpdate = async () => {
        if (!isAuthenticated || !user?.username) {
            return;
        }

        setIsUpdating(true);
        try {
            // 사용자의 기여 상태 업데이트
            await updateIncompleteContributions(user.username);
            
            // 리더보드 데이터 새로고침
            await refreshData(true); // forceRefresh = true
            
            setLastUpdateTime(new Date());
        } catch (error) {
            console.error('수동 업데이트 실패:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLoginClick = () => {
        initiateGitHubLogin({
            redirectAfterLogin: '/ecosystem' // 로그인 후 생태계 페이지로 리디렉션
        });
    };

    // 로딩 상태 처리 - 인증 로딩 중이거나 리더보드 로딩 중일 때 스피너 표시
    if ((authLoading || loading) && !leaderboardData.length) {
        return (
            <div className='py-8'>
                <LoadingSpinner
                    message={authLoading ? 'Checking authentication status...' : 'Loading leaderboard data...'}
                    size='large'
                    color='blue'
                />
            </div>
        );
    }

    // 에러 처리
    if (error) {
        return (
            <div className='py-8'>
                <EmptyState
                    title='Failed to load leaderboard data.'
                    description={error.message}
                    action={
                        <Button onClick={() => window.location.reload()} variant='primary'>
                            Try Again
                        </Button>
                    }
                />
            </div>
        );
    }

    return (
        <div className="py-8">
            <div className="max-w-7xl mx-auto">
                {/* 뒤로가기 버튼 */}
                <Button
                    onClick={onBack}
                    variant="ghost"
                    className="mb-6"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Go Back
                </Button>

                {/* 페이지 제목 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Activity Leaderboard</h1>
                    <p className="text-gray-600">See the users who are actively contributing to projects.</p>
                </div>

                {/* 기간 설정 및 업데이트 버튼 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
                    {/* 실시간 업데이트 정보 */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ClockIcon className="h-4 w-4" />
                            <span>
                                {lastUpdateTime 
                                    ? `Last updated: ${lastUpdateTime.toLocaleTimeString()}`
                                    : 'Auto-updating...'}
                            </span>
                        </div>
                        {isAuthenticated && (
                            <Button
                                onClick={handleManualUpdate}
                                disabled={isUpdating}
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 p-1"
                            >
                                <ArrowPathIcon className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
                                <span className="ml-1">{isUpdating ? 'Updating...' : 'Update'}</span>
                            </Button>
                        )}
                    </div>

                    {/* 기간 설정 */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">Time Period:</span>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => handleTimePeriodChange('today')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'today'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => handleTimePeriodChange('week')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'week'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    This Week
                                </button>
                                <button
                                    onClick={() => handleTimePeriodChange('month')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'month'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    This Month
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 리더보드 목록 */}
                <div className="mb-12">
                    {/* 데이터가 없는 경우 Empty State 표시 */}
                    {!loading && !error && leaderboardData.length === 0 ? (
                        <div className="text-center py-12">
                            <EmptyState
                                title={`No activity ${timePeriod === 'today' ? 'today' : timePeriod === 'week' ? 'this week' : 'this month'} yet`}
                                description="Try selecting a different time period."
                                icon="📊"
                                action={
                                    <Button 
                                        onClick={refreshData} 
                                        variant="primary"
                                        disabled={loading}
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </Button>
                                }
                            />
                        </div>
                    ) : (
                        <>
                            {/* 상위 3명 시상대 */}
                            <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                                <h2 className="text-2xl font-bold text-center mb-8">TOP 3 Rankings</h2>
                                <div className="flex justify-center items-end gap-6 sm:gap-10 mb-8">
                                    {/* 2위 */}
                                    {leaderboardData[1] && (
                                        <div className="text-center flex-shrink-0 w-24 sm:w-28">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                                <span className="text-xl sm:text-2xl">🥈</span>
                                            </div>
                                            <div className="font-semibold text-base sm:text-lg mb-2" title={leaderboardData[1].username}>{leaderboardData[1].username}</div>
                                            <div className="text-xs sm:text-sm text-gray-500 mb-3">
                                                {timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month'}: {leaderboardData[1].periodScore ? leaderboardData[1].periodScore.toLocaleString() : leaderboardData[1].totalScore.toLocaleString()} pts
                                            </div>
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-t-lg mx-auto"></div>
                                        </div>
                                    )}

                                    {/* 1위 */}
                                    {leaderboardData[0] && (
                                        <div className="text-center flex-shrink-0 w-28 sm:w-32">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-yellow-100 rounded-full flex items-center justify-center mb-3 mx-auto border-4 border-yellow-300">
                                                <span className="text-2xl sm:text-3xl">🥇</span>
                                            </div>
                                            <div className="font-bold text-lg sm:text-xl mb-2" title={leaderboardData[0].username}>{leaderboardData[0].username}</div>
                                            <div className="text-sm sm:text-base text-gray-600 mb-3">
                                                {timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month'}: {leaderboardData[0].periodScore ? leaderboardData[0].periodScore.toLocaleString() : leaderboardData[0].totalScore.toLocaleString()} pts
                                            </div>
                                            <div className="w-24 h-32 sm:w-28 sm:h-36 bg-yellow-400 rounded-t-lg mx-auto shadow-lg"></div>
                                        </div>
                                    )}

                                    {/* 3위 */}
                                    {leaderboardData[2] && (
                                        <div className="text-center flex-shrink-0 w-24 sm:w-28">
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                                <span className="text-xl sm:text-2xl">🥉</span>
                                            </div>
                                            <div className="font-semibold text-base sm:text-lg mb-2" title={leaderboardData[2].username}>{leaderboardData[2].username}</div>
                                            <div className="text-xs sm:text-sm text-gray-500 mb-3">
                                                {timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month'}: {leaderboardData[2].periodScore ? leaderboardData[2].periodScore.toLocaleString() : leaderboardData[2].totalScore.toLocaleString()} pts
                                            </div>
                                            <div className="w-20 h-12 sm:w-24 sm:h-16 bg-amber-400 rounded-t-lg mx-auto"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 전체 순위 */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold mb-4">Full Rankings</h3>
                                {leaderboardData.map((user) => (
                                    <div key={user.username} className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                                        <div className="flex items-center space-x-4">
                                            {/* 순위 아이콘 */}
                                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <span className="text-2xl">
                                                    {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '📊'}
                                                </span>
                                            </div>

                                            {/* 사용자 정보 */}
                                            <div className="flex-1">
                                                <div className="font-semibold text-lg">{user.username}</div>
                                                <div className="text-gray-500 text-sm">
                                                    GitHub Username
                                                    {user.lastUpdated && (
                                                        <span className="ml-2 text-xs text-blue-600">
                                                            • Last updated: {new Date(user.lastUpdated).toLocaleString()}
                                                        </span>
                                                    )}
                                                </div>
                                                {user.incompleteContributions > 0 && (
                                                    <div className="text-xs text-amber-600 mt-1">
                                                        In-progress contributions: {user.incompleteContributions}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* 활동 통계 */}
                                        <div className="text-right">
                                            <div className="font-bold text-lg mb-1">
                                                {timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month'}: {user.periodScore ? user.periodScore.toLocaleString() : user.totalScore.toLocaleString()} pts
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                PRs: {user.prCount} | Issues: {user.issueCount} | Reviews: {user.reviewCount || 0}
                                                {user.contributionStreak > 0 && (
                                                    <span className="ml-2 text-orange-600">🔥 {user.contributionStreak} day streak</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>


                {/* 나의 랭킹 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">My Ranking</h3>
                    
                    {authLoading ? (
                        /* 인증 상태 확인 중 */
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                            <p className="text-gray-500 text-sm">
                                Checking authentication status...
                            </p>
                        </div>
                    ) : isAuthenticated && currentUser ? (
                        /* 로그인된 상태 - 사용자 랭킹 정보 표시 */
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                {/* 아바타 */}
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden">
                                    {currentUser.avatarUrl ? (
                                        <img 
                                            src={currentUser.avatarUrl} 
                                            alt={currentUser.username}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl">😊</span>
                                    )}
                                </div>

                                {/* 사용자 정보 */}
                                <div>
                                    <div className="font-semibold text-lg">{currentUser.username}</div>
                                    <div className="text-gray-500 text-sm">GitHub Username</div>
                                    {currentUser.rank && (
                                        <div className="text-blue-600 text-sm font-medium">
                                            Overall Rank: #{currentUser.rank}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 랭킹과 점수 */}
                            <div className="text-right">
                                <div className="font-bold text-lg mb-1">
                                    {timePeriod === 'today' ? 'Today' : timePeriod === 'week' ? 'This Week' : 'This Month'}: {currentUser.periodScore ? currentUser.periodScore.toLocaleString() : (currentUser.totalScore?.toLocaleString() || 0)} pts
                                </div>
                                <div className="text-sm text-gray-600">
                                    PRs: {currentUser.prCount || 0} | Issues: {currentUser.issueCount || 0} | Reviews: {currentUser.reviewCount || 0}
                                    {currentUser.contributionStreak > 0 && (
                                        <span className="ml-2 text-orange-600">🔥 {currentUser.contributionStreak} day streak</span>
                                    )}
                                </div>
                                {(currentUser.periodScore === 0 || (!currentUser.periodScore && currentUser.totalScore === 0)) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        No activity {timePeriod === 'today' ? 'today' : timePeriod === 'week' ? 'this week' : 'this month'} yet
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* 로그인하지 않은 상태 - 로그인 유도 */
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <span className="text-2xl">🔒</span>
                                </div>
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                    Want to see your ranking?
                                </h4>
                                <p className="text-gray-500 text-sm mb-6">
                                    Log in to check your activity score and ranking.
                                </p>
                            </div>
                            <Button 
                                onClick={handleLoginClick}
                                variant="primary"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                            >
                                Log in with GitHub
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

ActivityLeaderboard.propTypes = {
    onBack: PropTypes.func.isRequired
};

export default ActivityLeaderboard;