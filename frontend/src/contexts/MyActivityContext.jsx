import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../hooks/useAuth';
import { 
    getUserStats, 
    getUserHistory, 
    getUserLevel,
    getUserRecentBadges,
    transformStatsData,
    transformHistoryData,
    transformRecentBadgesData,
    generateContributionTypeChart,
    generateActivityTrendChart
} from '../features/MyActivity/api/myActivityApi';
import { badgesData } from '../features/MyActivity/data/mockData';

const MyActivityContext = createContext(null);

/**
 * MyActivity 데이터를 전역적으로 관리하는 Context Provider
 * 로그인 시 자동으로 데이터를 로드하고 캐싱
 */
export const MyActivityProvider = ({ children }) => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // 로컬 스토리지에서 캐시된 레벨 정보 로드
    const getCachedUserLevel = () => {
        try {
            const cached = localStorage.getItem('myActivityUserLevel');
            if (cached) {
                const parsed = JSON.parse(cached);
                // 캐시 유효 시간 체크 (24시간)
                if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                    console.log('✅ 캐시된 레벨 정보 로드:', parsed.data);
                    return parsed.data;
                }
            }
        } catch (error) {
            console.warn('캐시된 레벨 정보 로드 실패:', error);
        }
        return { level: 1, totalScore: 0 };
    };
    
    // 기본값 정의 (null 에러 방지) - 캐시된 레벨 사용
    const defaultData = {
        stats: { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 },
        contributionTypes: [{ label: 'No Data', value: 100, color: '#E5E7EB' }],
        activities: [],
        recentBadges: [],
        history: [],
        userLevel: getCachedUserLevel() // 캐시된 레벨 사용
    };
    
    const [data, setData] = useState(defaultData);
    
    // 데이터 로드 여부 추적
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    /**
     * 사용자 활동 데이터를 로드하는 함수
     */
    const loadActivityData = useCallback(async (forceRefresh = false) => {
        // 이미 로드된 데이터가 있고 강제 새로고침이 아니면 skip
        if (isDataLoaded && !forceRefresh) {
            console.log('✅ MyActivity 데이터가 이미 로드됨, 캐시 사용');
            return;
        }

        // 인증이 로딩 중이면 대기
        if (authLoading) {
            return;
        }

        // 로그인하지 않은 경우
        if (!isAuthenticated || !user) {
            console.log('❌ 로그인되지 않음, MyActivity 데이터 로드 건너뜀');
            setIsDataLoaded(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            console.log('🔄 MyActivity 데이터 로드 시작 (로그인 시 자동 로드)');

            const currentUser = user.nickname || user.login;

            // 1단계: 기여 이력 먼저 불러오기
            console.log('🔄 1단계: 기여 이력 로딩 시작');
            const historyResponse = await getUserHistory(currentUser).catch(err => {
                console.warn('기여 이력 로딩 실패, 기본값 사용:', err);
                return { success: false, data: {} };
            });

            const history = historyResponse.success ? 
                transformHistoryData(historyResponse.data) : 
                [];

            // 2단계: 레벨 정보 불러오기
            console.log('🔄 2단계: 레벨 정보 로딩 시작');
            const levelResponse = await getUserLevel(currentUser).catch(err => {
                console.warn('레벨 정보 로딩 실패, 기본값 사용:', err);
                return { success: false, data: { level: 1, totalScore: 0 } };
            });

            // 3단계: 통계와 최근 뱃지 병렬로 불러오기
            console.log('🔄 3단계: 통계 및 최근 뱃지 로딩 시작');
            const [statsResponse, recentBadgesResponse] = await Promise.all([
                getUserStats(currentUser).catch(err => {
                    console.warn('통계 데이터 로딩 실패, 기본값 사용:', err);
                    return { success: false, data: { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 } };
                }),
                getUserRecentBadges(currentUser).catch(err => {
                    console.warn('최근 뱃지 데이터 로딩 실패, 목업 데이터 사용:', err);
                    return { success: false, data: null };
                })
            ]);

            // 데이터 변환 및 설정
            const stats = statsResponse.success ? 
                transformStatsData(statsResponse.data) : 
                { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 };

            const recentBadges = recentBadgesResponse.success ? 
                transformRecentBadgesData(recentBadgesResponse) : 
                badgesData.filter(badge => badge.earned).slice(0, 12);

            const contributionTypes = generateContributionTypeChart(stats);
            const activities = generateActivityTrendChart(stats, history);

            const userLevel = levelResponse.success ? levelResponse.data : { level: 1, totalScore: 0 };
            
            // 레벨 정보를 로컬 스토리지에 캐싱
            try {
                localStorage.setItem('myActivityUserLevel', JSON.stringify({
                    data: userLevel,
                    timestamp: Date.now()
                }));
                console.log('💾 레벨 정보 캐싱 완료:', userLevel);
            } catch (error) {
                console.warn('레벨 정보 캐싱 실패:', error);
            }

            const newData = {
                stats: stats,
                contributionTypes: contributionTypes,
                activities: activities,
                recentBadges: recentBadges,
                history: history,
                userLevel: userLevel
            };

            setData(newData);
            setIsDataLoaded(true);
            console.log('✅ MyActivity 데이터 로드 완료:', newData);

        } catch (err) {
            setError("활동 데이터를 불러오는 데 실패했습니다.");
            console.error("MyActivityContext fetch error:", err);
            
            // 에러 발생시 기본값으로 설정
            setData(defaultData);
            setIsDataLoaded(false);
        } finally {
            setLoading(false);
        }
    }, [authLoading, isAuthenticated, user, isDataLoaded]);

    /**
     * 데이터 강제 새로고침
     */
    const refreshData = useCallback(() => {
        console.log('🔄 MyActivity 데이터 강제 새로고침 요청');
        setIsDataLoaded(false);
        return loadActivityData(true);
    }, [loadActivityData]);

    /**
     * 사용자가 로그인하면 자동으로 데이터 로드
     */
    useEffect(() => {
        if (isAuthenticated && user && !authLoading && !isDataLoaded) {
            console.log('🚀 로그인 감지, MyActivity 데이터 자동 로드 시작');
            loadActivityData();
        }
    }, [isAuthenticated, user, authLoading, isDataLoaded, loadActivityData]);

    /**
     * 로그아웃 시 데이터 초기화
     */
    useEffect(() => {
        if (!isAuthenticated) {
            console.log('🔒 로그아웃 감지, MyActivity 데이터 초기화');
            
            // 로컬 스토리지 캐시 삭제
            try {
                localStorage.removeItem('myActivityUserLevel');
                console.log('🗑️ 레벨 캐시 삭제 완료');
            } catch (error) {
                console.warn('레벨 캐시 삭제 실패:', error);
            }
            
            // 기본값으로 초기화 (캐시 없이)
            setData({
                stats: { monthlyPR: 0, monthlyIssue: 0, monthlyCommit: 0, totalScore: 0 },
                contributionTypes: [{ label: 'No Data', value: 100, color: '#E5E7EB' }],
                activities: [],
                recentBadges: [],
                history: [],
                userLevel: { level: 1, totalScore: 0 }
            });
            setIsDataLoaded(false);
            setError(null);
        }
    }, [isAuthenticated]);

    const value = {
        data,
        loading,
        error,
        isDataLoaded,
        refreshData,
        loadActivityData
    };

    return (
        <MyActivityContext.Provider value={value}>
            {children}
        </MyActivityContext.Provider>
    );
};

MyActivityProvider.propTypes = {
    children: PropTypes.node.isRequired
};

/**
 * MyActivity Context를 사용하는 Hook
 */
export const useMyActivityContext = () => {
    const context = useContext(MyActivityContext);
    if (!context) {
        throw new Error('useMyActivityContext must be used within MyActivityProvider');
    }
    return context;
};
