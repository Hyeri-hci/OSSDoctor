export const calculateBadgeStats = (badges) => {
  // badges가 배열이 아닌 경우 빈 배열로 처리
  const safeBadges = Array.isArray(badges) ? badges : [];
  
  const earnedCount = safeBadges.filter(badge => badge.earned).length;
  const totalCount = safeBadges.length;
  const percentage = totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  return {
    earnedCount,
    totalCount,
    percentage,
    remaining: totalCount - earnedCount
  };
};

/**
 * 기여 활동 총합 계산
 * @param {Object} stats - 기여 통계
 * @returns {number} - 총 기여 수
 */
export const calculateTotalContributions = (stats) => {
  return stats.monthlyPR + stats.monthlyIssue + stats.monthlyCommit;
};

/**
 * 차트 데이터 정규화
 * @param {Array} data - 원본 데이터
 * @returns {Array} - 정규화된 데이터
 */
export const normalizeChartData = (data) => {
  return data.map(item => ({
    ...item,
    value: Math.max(0, item.value) // 음수 값 방지
  }));
};

/**
 * 상대적 날짜 형식화 (예: "2 days ago", "yesterday")
 * @param {string} timestamp - 타임스탬프
 * @returns {string} - 형식화된 날짜
 */
export const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  
  const timeMap = {
    'yesterday': '어제',
    'last week': '지난주',
    'last month': '지난달',
    '2 days ago': '2일 전',
    '3 days ago': '3일 전'
  };

  return timeMap[timestamp] || timestamp;
};

/**
 * 기여 타입별 색상 매핑
 * @param {string} type - 기여 타입
 * @returns {string} - 색상 코드
 */
export const getContributionTypeColor = (type) => {
  const colorMap = {
    commit: '#3B82F6',
    pull_request: '#6B7280', 
    issue: '#9CA3AF',
    review: '#D1D5DB'
  };

  return colorMap[type] || '#9CA3AF';
};

/**
 * 뱃지를 카테고리별로 그룹화
 * @param {Array} badges - 뱃지 배열
 * @returns {Object} - 카테고리별 그룹화된 뱃지
 */
export const groupBadgesByCategory = (badges) => {
  // badges가 undefined이거나 null인 경우 빈 배열로 처리
  if (!badges || !Array.isArray(badges)) {
    badges = [];
  }

  const categories = {
    commit: [],
    commit_streak: [],
    pr_external: [],
    pr_merge: [],
    issue_create: [],
    issue_solve: [],
    code_review: [],
    star: [],
    fork: [],
    watch: [],
    upcycle: []
  };

  badges.forEach(badge => {
    // 새로운 뱃지 데이터는 category 속성을 직접 가지고 있음
    if (badge.category && categories[badge.category]) {
      categories[badge.category].push(badge);
    } else {
      // 기존 뱃지와의 호환성을 위한 fallback
      const name = badge.name.toLowerCase();
      const description = badge.description.toLowerCase();

      if (name.includes('commit') || description.includes('커밋')) {
        categories.commit.push(badge);
      } else if (name.includes('pr') || name.includes('pull') || description.includes('PR')) {
        categories.pr_external.push(badge);
      } else if (name.includes('issue') || description.includes('이슈')) {
        categories.issue_create.push(badge);
      } else if (name.includes('review') || description.includes('리뷰')) {
        categories.code_review.push(badge);
      } else if (name.includes('star') || description.includes('별')) {
        categories.star.push(badge);
      } else if (name.includes('fork') || description.includes('포크')) {
        categories.fork.push(badge);
      } else if (name.includes('watch') || description.includes('관찰')) {
        categories.watch.push(badge);
      } else if (name.includes('upcycle') || description.includes('업사이클')) {
        categories.upcycle.push(badge);
      }
    }
  });

  return categories;
};

/**
 * 뱃지 카테고리의 한국어 이름 매핑
 * @param {string} category - 카테고리 키
 * @returns {string} - 한국어 카테고리 이름
 */
export const getCategoryDisplayName = (category) => {
  const categoryNames = {
    commit: '커밋 (횟수)',
    commit_streak: '커밋 (연속)',
    pr_external: 'PR (외부/협업)',
    pr_merge: 'PR Merge',
    issue_create: 'Issue 등록',
    issue_solve: 'Issue 해결',
    code_review: '코드리뷰',
    star: 'Star',
    fork: 'Fork',
    watch: 'Watch',
    upcycle: '업사이클링 참여'
  };

  return categoryNames[category] || category;
};

/**
 * 뱃지 레벨별 색상 가져오기
 * @param {number} level - 뱃지 레벨 (1-4)
 * @returns {string} - TailwindCSS 색상 클래스
 */
export const getBadgeLevelColor = (level) => {
  const levelColors = {
    1: 'bg-gray-100 text-gray-800 border-gray-300',     // 브론즈
    2: 'bg-blue-100 text-blue-800 border-blue-300',     // 실버
    3: 'bg-yellow-100 text-yellow-800 border-yellow-300', // 골드
    4: 'bg-purple-100 text-purple-800 border-purple-300'  // 플래티넘
  };

  return levelColors[level] || levelColors[1];
};
