import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, EmptyState, LoadingSpinner } from '../../../components/common';
import useLeaderboardData from '../hooks/useLeaderboardData';

const ActivityLeaderboard = ({ onBack }) => {
    const [timePeriod, setTimePeriod] = useState('realtime');

    const {
        leaderboardData,
        currentUser,
        loading,
        error
    } = useLeaderboardData(timePeriod);

    const handleTimePeriodChange = (period) => {
        setTimePeriod(period);
    }

    // 로딩 상태 처리 - 로딩 중일 때 스피너 표시
    if (loading && !leaderboardData.length) {
        return (
            <div className='py-8'>
                <LoadingSpinner
                    message='리더보드 데이터를 불러오고 있습니다...'
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
                    title='리더보드 데이터를 불러오는 데 실패했습니다.'
                    description={error.message}
                    action={
                        <Button onClick={() => window.location.reload()} variant='primary'>
                            다시 시도
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
                    뒤로가기
                </Button>

                {/* 페이지 제목 */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">활동 리더보드</h1>
                    <p className="text-gray-600">프로젝트에 활발히 기여하고 있는 사용자들을 확인해 보세요.</p>
                </div>

                {/* 기간 설정 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end items-start sm:items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 whitespace-nowrap">기간 설정:</span>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                <button
                                    onClick={() => handleTimePeriodChange('realtime')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'realtime'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    실시간
                                </button>
                                <button
                                    onClick={() => handleTimePeriodChange('week')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'week'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    이번 주
                                </button>
                                <button
                                    onClick={() => handleTimePeriodChange('month')}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${timePeriod === 'month'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    이번 달
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 리더보드 목록 */}
                <div className="mb-12">
                    {/* 상위 3명 시상대 */}
                    <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
                        <h2 className="text-2xl font-bold text-center mb-8">TOP 3 순위</h2>
                        <div className="flex justify-center items-end gap-6 sm:gap-10 mb-8">
                            {/* 2위 */}
                            {leaderboardData[1] && (
                                <div className="text-center flex-shrink-0 w-24 sm:w-28">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mb-3 mx-auto">
                                        <span className="text-xl sm:text-2xl">🥈</span>
                                    </div>
                                    <div className="font-semibold text-base sm:text-lg mb-2" title={leaderboardData[1].username}>{leaderboardData[1].username}</div>
                                    <div className="text-xs sm:text-sm text-gray-500 mb-3">{leaderboardData[1].totalScore.toLocaleString()}점</div>
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
                                    <div className="text-sm sm:text-base text-gray-600 mb-3">{leaderboardData[0].totalScore.toLocaleString()}점</div>
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
                                    <div className="text-xs sm:text-sm text-gray-500 mb-3">{leaderboardData[2].totalScore.toLocaleString()}점</div>
                                    <div className="w-20 h-12 sm:w-24 sm:h-16 bg-amber-400 rounded-t-lg mx-auto"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 전체 순위 */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold mb-4">전체 순위</h3>
                        {leaderboardData.map((user) => (
                            <div key={user.username} className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center space-x-4">
                                    {/* 순위 아이콘 */}
                                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                        <span className="text-2xl">
                                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : '�'}
                                        </span>
                                    </div>

                                    {/* 사용자 정보 */}
                                    <div>
                                        <div className="font-semibold text-lg">{user.username}</div>
                                        <div className="text-gray-500 text-sm">GitHub Username</div>
                                    </div>
                                </div>

                                {/* 활동 통계 */}
                                <div className="text-right">
                                    <div className="font-bold text-lg mb-1">Score: {user.totalScore.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">
                                        Commits: {user.commitsCount} | PRs: {user.prCount} | Issues: {user.issueCount}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* 나의 랭킹 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-800">나의 랭킹은?</h3>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            {/* 아바타 */}
                            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center overflow-hidden">
                                <span className="text-2xl">😊</span>
                            </div>

                            {/* 사용자 정보 */}
                            <div>
                                <div className="font-semibold text-lg">{currentUser.username}</div>
                                <div className="text-gray-500 text-sm">GitHub Username</div>
                            </div>
                        </div>

                        {/* 랭킹과 점수 */}
                        <div className="text-right">
                            <div className="font-bold text-lg mb-1">Score: {currentUser.totalScore.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">
                                Commits: {currentUser.commitsCount} | PRs: {currentUser.prCount} | Issues: {currentUser.issueCount}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

ActivityLeaderboard.propTypes = {
    onBack: PropTypes.func.isRequired
};

export default ActivityLeaderboard;