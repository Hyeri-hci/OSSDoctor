import { apiClient } from '../../../utils/api-client';

/**
 * 사용자 기여 통계 조회
 * @param {string} nickname - GitHub 사용자명
 * @returns {Promise<Object>} 기여 통계 데이터
 */
export const getUserStats = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/stats/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 통계 조회 실패:', error);
        throw error;
    }
};

/**
 * 사용자 기여 이력 조회
 * @param {string} nickname - GitHub 사용자명  
 * @returns {Promise<Object>} 기여 이력 데이터
 */
export const getUserHistory = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/history/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 기여 이력 조회 실패:', error);
        throw error;
    }
};

/**
 * 사용자 레벨 및 경험치 조회
 * @param {string} nickname - GitHub 사용자명
 * @returns {Promise<Object>} 레벨 및 경험치 데이터
 */
export const getUserLevel = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/my-activity/level/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 레벨 조회 실패:', error);
        throw error;
    }
};

// 백엔드 데이터를 프론트엔드 형식으로 변환하는 유틸리티 함수들
/**
 * 백엔드 기여 통계를 프론트엔드 포맷으로 변환
 * @param {Object} backendStats - 백엔드에서 받은 통계 데이터
 * @returns {Object} 프론트엔드 형식의 통계 데이터
 */
export const transformStatsData = (backendStats) => {
    return {
        monthlyPR: backendStats.monthlyPR || 0,
        monthlyIssue: backendStats.monthlyIssue || 0,
        monthlyCommit: backendStats.monthlyCommit || 0,
        totalScore: backendStats.totalScore || 0
    };
};

/**
 * 백엔드 기여 이력을 프론트엔드 포맷으로 변환
 * @param {Object} backendHistory - 백엔드에서 받은 이력 데이터
 * @returns {Array} 프론트엔드 형식의 이력 데이터
 */
export const transformHistoryData = (backendHistory) => {
    const transformedData = [];

    // 백엔드 데이터가 비어있으면 빈 배열 반환
    if (!backendHistory || typeof backendHistory !== 'object' || Object.keys(backendHistory).length === 0) {
        return transformedData;
    }

    // 백엔드 데이터가 Map 형태로 올 것으로 예상 (날짜별 그룹화)
    try {
        for (const [dateString, contributions] of Object.entries(backendHistory)) {
            if (Array.isArray(contributions) && contributions.length > 0) {
                const activities = contributions.map(contribution => ({
                    type: mapContributionTypeToActivityType(contribution.referenceType, contribution.state),
                    title: contribution.title || `${contribution.referenceType} activity`,
                    author: contribution.author || 'Unknown',
                    time: formatActivityTime(contribution.contributedAt),
                    repository: contribution.repositoryName,
                    number: contribution.number || null
                }));

                transformedData.push({
                    date: formatDateForDisplay(dateString),
                    activities: activities
                });
            }
        }
    } catch (error) {
        console.warn('기여 이력 데이터 변환 중 오류:', error);
    }

    return transformedData;
};

/**
 * 백엔드 contribution type을 프론트엔드 activity type으로 매핑
 * @param {string} referenceType - 백엔드 참조 타입
 * @param {string} state - 백엔드 상태
 * @returns {string} 프론트엔드 activity type
 */
const mapContributionTypeToActivityType = (referenceType, state) => {
    if (referenceType === 'PR') {
        if (state === 'MERGED') return 'pr_merged';
        if (state === 'OPEN') return 'pr_opened';
        if (state === 'CLOSED') return 'pr_closed';
    }
    
    if (referenceType === 'ISSUE') {
        if (state === 'OPEN') return 'issue_opened';
        if (state === 'CLOSED') return 'issue_closed';
    }

    if (referenceType === 'REVIEW') {
        return 'review';
    }

    return 'commit'; // 기본값
};

/**
 * 날짜를 화면 표시용으로 포맷
 * @param {string} dateString - 날짜 문자열
 * @returns {string} 포맷된 날짜 문자열
 */
const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * 활동 시간을 상대적 시간으로 포맷
 * @param {string} dateTimeString - 날짜시간 문자열
 * @returns {string} 상대적 시간 문자열
 */
const formatActivityTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
};

/**
 * 기여 유형별 차트 데이터 생성 (목업 데이터 기반)
 * @param {Object} stats - 통계 데이터
 * @returns {Array} 차트 데이터
 */
export const generateContributionTypeChart = (stats) => {
    const total = stats.monthlyPR + stats.monthlyIssue + stats.monthlyCommit;
    
    if (total === 0) {
        return [
            { label: 'No Data', value: 100, color: '#E5E7EB' }
        ];
    }

    return [
        { 
            label: 'Commits', 
            value: Math.round((stats.monthlyCommit / total) * 100), 
            color: '#3B82F6' 
        },
        { 
            label: 'Pull Requests', 
            value: Math.round((stats.monthlyPR / total) * 100), 
            color: '#10B981' 
        },
        { 
            label: 'Issues', 
            value: Math.round((stats.monthlyIssue / total) * 100), 
            color: '#F59E0B' 
        }
    ];
};

/**
 * 활동 추이 차트 데이터 생성 (DB의 실제 contributed_at 기반 월별 집계)
 * @param {Object} stats - 통계 데이터  
 * @param {Array} historyData - 기여 이력 데이터 (transformHistoryData로 변환된 데이터)
 * @returns {Array} 차트 데이터
 */
export const generateActivityTrendChart = (stats, historyData = []) => {
    const months = [];
    const currentDate = new Date();
    
    console.log('📊 활동 추이 차트 데이터 생성 시작');
    console.log('📊 전달받은 historyData:', historyData);
    console.log('📊 historyData 길이:', historyData.length);
    
    // DB에서 가져온 실제 기여 데이터를 월별로 집계
    const monthlyContributionCounts = {};
    
    // historyData는 transformHistoryData로 변환된 형태:
    // [{ date: "2024년 9월 15일", activities: [...] }, ...]
    if (historyData && historyData.length > 0) {
        historyData.forEach(dayData => {
            if (dayData.activities && dayData.activities.length > 0) {
                // dayData.date는 "2024년 9월 15일" 형태로 formatDateForDisplay에 의해 변환됨
                // 이를 다시 Date 객체로 파싱해야 함
                const dateStr = dayData.date;
                let date;
                
                try {
                    // "2024년 9월 15일" 형태를 파싱
                    const matches = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
                    if (matches) {
                        const [, year, month, day] = matches;
                        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                    } else {
                        // 파싱에 실패하면 현재 날짜 사용
                        date = new Date();
                    }
                } catch (error) {
                    console.warn('📊 날짜 파싱 실패:', dateStr, error);
                    date = new Date();
                }
                
                const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                
                if (!monthlyContributionCounts[monthKey]) {
                    monthlyContributionCounts[monthKey] = 0;
                }
                
                // 해당 날짜의 기여 개수를 월별 카운트에 추가
                monthlyContributionCounts[monthKey] += dayData.activities.length;
                
                console.log(`📊 ${dateStr} (${monthKey}): ${dayData.activities.length}개 기여`);
            }
        });
    }
    
    console.log('📊 월별 집계 결과:', monthlyContributionCounts);
    
    // 최근 7개월 데이터 생성 (실제 DB 데이터만 사용)
    for (let i = 6; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('ko-KR', { month: 'short' });
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        
        // DB에서 집계된 실제 기여 개수 사용 (없으면 0)
        const value = monthlyContributionCounts[monthKey] || 0;
        months.push({
            label: monthName,
            value: value
        });
    }
    return months;
};

/**
 * 사용자 뱃지 정보 조회 (실제 백엔드 API)
 * @param {string} nickname - GitHub 사용자명
 * @returns {Promise<Object>} 뱃지 데이터
 */
export const getUserBadges = async (nickname) => {
    try {
        const timestamp = Date.now();
        const response = await apiClient(`/api/badge/all-badges/${nickname}?t=${timestamp}`);
        return response;
    } catch (error) {
        console.error('사용자 뱃지 조회 실패:', error);
        throw error;
    }
};

/**
 * 백엔드 뱃지 데이터를 프론트엔드 포맷으로 변환
 * @param {Object} backendBadges - 백엔드에서 받은 뱃지 데이터
 * @returns {Array} 프론트엔드 형식의 뱃지 데이터
 */
export const transformBadgesData = (backendBadges) => {
    if (!backendBadges || !backendBadges.success || !backendBadges.data) {
        return [];
    }

    // Controller에서 data 필드에 List<BadgeDTO>가 직접 들어있음
    const badgesList = backendBadges.data;
    
    if (!Array.isArray(badgesList)) {
        console.warn('Expected badges data to be an array, received:', typeof badgesList);
        return [];
    }

    // 각 BadgeDTO를 프론트엔드 형식으로 변환
    return badgesList.map(badge => {
        return {
            id: badge.idx,
            name: badge.name,
            description: badge.description,
            category: badge.category?.toLowerCase().replace('_', '_'), // COMMIT_STREAK -> commit_streak
            level: badge.level,
            earned: badge.earned, // 백엔드에서 earned 필드를 직접 제공
            icon: getBadgeIcon(badge.category, badge.level),
            requirement: badge.requirement
        };
    });
};

/**
 * 뱃지 카테고리와 레벨에 따른 아이콘 반환
 * @param {string} category - 뱃지 카테고리
 * @param {number} level - 뱃지 레벨
 * @returns {string} 이모지 아이콘
 */
const getBadgeIcon = (category, level) => {
    const iconMap = {
        COMMIT: ['🎯', '⚡', '🔥', '💎'],
        COMMIT_STREAK: ['🌟', '⭐', '⚙️', '⛓️'],
        PR_EXTERNAL: ['🚪', '🧭', '🎬', '🕸️'],
        PR_MERGE: ['🔧', '⚛️', '🚀', '🎵'],
        ISSUE_CREATE: ['📡', '📊', '🗺️', '🔮'],
        ISSUE_SOLVE: ['🔧', '🕵️', '⚕️', '🧘'],
        CODE_REVIEW: ['🚪', '🔍', '👂', '🔮'],
        STAR: ['⭐', '📈', '🧲', '🗼'],
        FORK: ['🌿', '🗂️', '🌱', '🏗️'],
        WATCH: ['👁️', '👀', '💓', '🛡️'],
        UPCYCLE: ['♻️', '🌱', '🏗️', '🔄']
    };

    const icons = iconMap[category] || ['🏆', '🥉', '🥈', '🥇'];
    return icons[level - 1] || '🏆';
};
