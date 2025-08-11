// 기여 통계 목업 데이터
export const contributionStats = {
  monthlyPR: 85,
  monthlyIssue: 85,
  monthlyCommit: 85,
  totalScore: 85
};

// 기여 유형별 비율 데이터
export const contributionTypeData = [
  { label: 'Commits', value: 45, color: '#3B82F6' },
  { label: 'Pull Requests', value: 30, color: '#6B7280' },
  { label: 'Issues', value: 15, color: '#9CA3AF' },
  { label: 'Reviews', value: 10, color: '#D1D5DB' }
];

// 기여 활동 추이 데이터
export const activityData = [
  { label: '1월', value: 20 },
  { label: '2월', value: 15 },
  { label: '3월', value: 8 },
  { label: '4월', value: 18 },
  { label: '5월', value: 12 },
  { label: '6월', value: 25 },
  { label: '7월', value: 22 }
];

// 뱃지 데이터 - 실제 GitHub 활동 기반 뱃지 시스템
export const badgesData = [
  // 커밋(횟수) 뱃지
  { 
    id: 1, 
    name: 'Initiator', 
    description: '첫 커밋을 시작했습니다', 
    category: 'commit',
    level: 1,
    earned: true, 
    icon: '🎯',
    requirement: '첫 커밋, 20/50/100/200회'
  },
  { 
    id: 2, 
    name: 'Routine Loader', 
    description: '꾸준한 커밋 활동을 보여줍니다', 
    category: 'commit',
    level: 2,
    earned: true, 
    icon: '⚡',
    requirement: '첫 커밋, 20/50/100/200회'
  },
  { 
    id: 3, 
    name: 'Backbone Coder', 
    description: '프로젝트의 핵심 개발자입니다', 
    category: 'commit',
    level: 3,
    earned: false, 
    icon: '🔥',
    requirement: '첫 커밋, 20/50/100/200회'
  },
  { 
    id: 4, 
    name: 'Mainline Pulse', 
    description: '프로젝트의 메인 동력원입니다', 
    category: 'commit',
    level: 4,
    earned: false, 
    icon: '💎',
    requirement: '첫 커밋, 20/50/100/200회'
  },

  // 커밋(연속) 뱃지
  { 
    id: 5, 
    name: 'Daily Spark', 
    description: '매일 커밋하는 습관을 만들었습니다', 
    category: 'commit_streak',
    level: 1,
    earned: true, 
    icon: '🌟',
    requirement: '3/7/14/30일 연속 커밋'
  },
  { 
    id: 6, 
    name: 'Habitualist', 
    description: '일주일 연속 커밋을 달성했습니다', 
    category: 'commit_streak',
    level: 2,
    earned: true, 
    icon: '�',
    requirement: '3/7/14/30일 연속 커밋'
  },
  { 
    id: 7, 
    name: 'Consistency Engineer', 
    description: '2주 연속 커밋의 일관성을 보여줍니다', 
    category: 'commit_streak',
    level: 3,
    earned: false, 
    icon: '⚙️',
    requirement: '3/7/14/30일 연속 커밋'
  },
  { 
    id: 8, 
    name: 'Unbroken Chain', 
    description: '한 달 연속 커밋의 끊이지 않는 체인', 
    category: 'commit_streak',
    level: 4,
    earned: false, 
    icon: '⛓️',
    requirement: '3/7/14/30일 연속 커밋'
  },

  // PR(외부/협업) 뱃지
  { 
    id: 9, 
    name: 'Door Opener', 
    description: '첫 번째 PR을 열었습니다', 
    category: 'pr_external',
    level: 1,
    earned: true, 
    icon: '�',
    requirement: '첫 PR, 5/10/30/50회'
  },
  { 
    id: 10, 
    name: 'Merge Navigator', 
    description: '여러 PR을 성공적으로 병합했습니다', 
    category: 'pr_external',
    level: 2,
    earned: false, 
    icon: '🧭',
    requirement: '첫 PR, 5/10/30/50회'
  },
  { 
    id: 11, 
    name: 'Collaboration Director', 
    description: '협업의 방향을 제시하는 리더입니다', 
    category: 'pr_external',
    level: 3,
    earned: false, 
    icon: '🎬',
    requirement: '첫 PR, 5/10/30/50회'
  },
  { 
    id: 12, 
    name: 'Network Weaver', 
    description: '오픈소스 네트워크를 엮어가는 전문가', 
    category: 'pr_external',
    level: 4,
    earned: false, 
    icon: '🕸️',
    requirement: '첫 PR, 5/10/30/50회'
  },

  // PR Merge 뱃지
  { 
    id: 13, 
    name: 'Integration Pioneer', 
    description: '첫 번째 PR 병합을 달성했습니다', 
    category: 'pr_merge',
    level: 1,
    earned: true, 
    icon: '�',
    requirement: '첫/5/10/20회 merge'
  },
  { 
    id: 14, 
    name: 'Fusion Operator', 
    description: '여러 기능을 융합하는 전문가', 
    category: 'pr_merge',
    level: 2,
    earned: false, 
    icon: '⚛️',
    requirement: '첫/5/10/20회 merge'
  },
  { 
    id: 15, 
    name: 'Release Catalyst', 
    description: '릴리즈의 촉매 역할을 합니다', 
    category: 'pr_merge',
    level: 3,
    earned: false, 
    icon: '🚀',
    requirement: '첫/5/10/20회 merge'
  },
  { 
    id: 16, 
    name: 'Harmony Maker', 
    description: '프로젝트에 조화를 만들어내는 마스터', 
    category: 'pr_merge',
    level: 4,
    earned: false, 
    icon: '🎵',
    requirement: '첫/5/10/20회 merge'
  },

  // Issue 등록 뱃지
  { 
    id: 17, 
    name: 'Signal Sender', 
    description: '첫 번째 이슈를 등록했습니다', 
    category: 'issue_create',
    level: 1,
    earned: true, 
    icon: '📡',
    requirement: '첫/5/10/30회 이슈 등록'
  },
  { 
    id: 18, 
    name: 'Bug Radar', 
    description: '버그를 찾아내는 레이더같은 능력', 
    category: 'issue_create',
    level: 2,
    earned: false, 
    icon: '📊',
    requirement: '첫/5/10/30회 이슈 등록'
  },
  { 
    id: 19, 
    name: 'Problem Mapper', 
    description: '문제를 체계적으로 매핑하는 전문가', 
    category: 'issue_create',
    level: 3,
    earned: false, 
    icon: '🗺️',
    requirement: '첫/5/10/30회 이슈 등록'
  },
  { 
    id: 20, 
    name: 'Solutions Syndicator', 
    description: '해결책을 조합하는 신디케이터', 
    category: 'issue_create',
    level: 4,
    earned: false, 
    icon: '🔮',
    requirement: '첫/5/10/30회 이슈 등록'
  },

  // Issue 해결 뱃지
  { 
    id: 21, 
    name: 'Debug Trigger', 
    description: '첫 번째 이슈를 해결했습니다', 
    category: 'issue_solve',
    level: 1,
    earned: true, 
    icon: '�',
    requirement: '첫/5/10/30회 이슈 close'
  },
  { 
    id: 22, 
    name: 'Resolution Agent', 
    description: '이슈 해결의 전문 에이전트', 
    category: 'issue_solve',
    level: 2,
    earned: false, 
    icon: '🕵️',
    requirement: '첫/5/10/30회 이슈 close'
  },
  { 
    id: 23, 
    name: 'Code Medic', 
    description: '코드의 의사, 문제를 치료합니다', 
    category: 'issue_solve',
    level: 3,
    earned: false, 
    icon: '⚕️',
    requirement: '첫/5/10/30회 이슈 close'
  },
  { 
    id: 24, 
    name: 'Stability Guru', 
    description: '안정성의 구루, 모든 문제를 해결', 
    category: 'issue_solve',
    level: 4,
    earned: false, 
    icon: '🧘',
    requirement: '첫/5/10/30회 이슈 close'
  },

  // 코드리뷰 뱃지
  { 
    id: 25, 
    name: 'Gatekeeper', 
    description: '첫 번째 코드 리뷰를 완료했습니다', 
    category: 'code_review',
    level: 1,
    earned: true, 
    icon: '🚪',
    requirement: '첫/5/10/30회 리뷰 참여'
  },
  { 
    id: 26, 
    name: 'Integrity Auditor', 
    description: '코드 무결성을 감사하는 전문가', 
    category: 'code_review',
    level: 2,
    earned: false, 
    icon: '🔍',
    requirement: '첫/5/10/30회 리뷰 참여'
  },
  { 
    id: 27, 
    name: 'Quality Whisperer', 
    description: '품질의 속삭임을 듣는 전문가', 
    category: 'code_review',
    level: 3,
    earned: false, 
    icon: '👂',
    requirement: '첫/5/10/30회 리뷰 참여'
  },
  { 
    id: 28, 
    name: 'Code Oracle', 
    description: '코드의 오라클, 모든 것을 꿰뚫어 봅니다', 
    category: 'code_review',
    level: 4,
    earned: false, 
    icon: '🔮',
    requirement: '첫/5/10/30회 리뷰 참여'
  },

  // Star 뱃지
  { 
    id: 29, 
    name: 'Spotlight Effect', 
    description: '10개 프로젝트에 스타를 주었습니다', 
    category: 'star',
    level: 1,
    earned: true, 
    icon: '�',
    requirement: '10/30/50/100개 별표'
  },
  { 
    id: 30, 
    name: 'Popularity Gainer', 
    description: '인기 프로젝트를 발굴하는 안목', 
    category: 'star',
    level: 2,
    earned: false, 
    icon: '📈',
    requirement: '10/30/50/100개 별표'
  },
  { 
    id: 31, 
    name: 'Star Magnet', 
    description: '별을 끌어모으는 자석같은 매력', 
    category: 'star',
    level: 3,
    earned: false, 
    icon: '🧲',
    requirement: '10/30/50/100개 별표'
  },
  { 
    id: 32, 
    name: 'Community Beacon', 
    description: '커뮤니티의 등대 역할을 합니다', 
    category: 'star',
    level: 4,
    earned: false, 
    icon: '🗼',
    requirement: '10/30/50/100개 별표'
  },

  // Fork 뱃지
  { 
    id: 33, 
    name: 'Branch Divergent', 
    description: '5개 프로젝트를 포크했습니다', 
    category: 'fork',
    level: 1,
    earned: true, 
    icon: '🌿',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 34, 
    name: 'Fork Explorer', 
    description: '포크의 탐험가, 새로운 길을 개척', 
    category: 'fork',
    level: 2,
    earned: false, 
    icon: '�',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 35, 
    name: 'Source Cultivator', 
    description: '소스코드를 기르는 재배자', 
    category: 'fork',
    level: 3,
    earned: false, 
    icon: '🌱',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 36, 
    name: 'Ecosystem Builder', 
    description: '생태계를 구축하는 건축가', 
    category: 'fork',
    level: 4,
    earned: false, 
    icon: '🏗️',
    requirement: '5/10/20/50개 돓파'
  },

  // Watch 뱃지
  { 
    id: 37, 
    name: 'Watchtower', 
    description: '5개 프로젝트를 관찰하고 있습니다', 
    category: 'watch',
    level: 1,
    earned: true, 
    icon: '�️',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 38, 
    name: 'Watchful Neighbor', 
    description: '이웃 프로젝트를 살피는 관찰자', 
    category: 'watch',
    level: 2,
    earned: false, 
    icon: '�',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 39, 
    name: 'Pulse Guardian', 
    description: '프로젝트 맥박을 지키는 수호자', 
    category: 'watch',
    level: 3,
    earned: false, 
    icon: '💓',
    requirement: '5/10/20/50개 돓파'
  },
  { 
    id: 40, 
    name: 'Sentinel of Trends', 
    description: '트렌드의 파수꾼', 
    category: 'watch',
    level: 4,
    earned: false, 
    icon: '🛡️',
    requirement: '5/10/20/50개 돓파'
  },

  // 업사이클링 참여 뱃지
  { 
    id: 41, 
    name: 'Upcycle Explorer', 
    description: '업사이클링 프로젝트에 첫 참여', 
    category: 'upcycle',
    level: 1,
    earned: false, 
    icon: '♻️',
    requirement: '업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30'
  },
  { 
    id: 42, 
    name: 'Revival Contributor', 
    description: '프로젝트 부활에 기여하는 공헌자', 
    category: 'upcycle',
    level: 2,
    earned: false, 
    icon: '🌱',
    requirement: '업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30'
  },
  { 
    id: 43, 
    name: 'Sustainability Builder', 
    description: '지속가능성을 구축하는 빌더', 
    category: 'upcycle',
    level: 3,
    earned: false, 
    icon: '🏗️',
    requirement: '업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30'
  },
  { 
    id: 44, 
    name: 'Legacy Reviver', 
    description: '레거시를 되살리는 부활의 마스터', 
    category: 'upcycle',
    level: 4,
    earned: false, 
    icon: '🔄',
    requirement: '업사이클링 리포지토리 기여활동 (PR, Issue 생성/답변 등) 1/5/15/30'
  }
];

// 기여 이력 데이터
export const contributionHistory = [
  {
    id: 1,
    title: 'Cleanup disableDefaultPropsExceptForClasses flag',
    type: 'pr',
    number: 35648,
    status: 'merged',
    timestamp: 'yesterday',
    icon: '🔗'
  },
  {
    id: 2,
    title: '[compiler] Fix bug with reassigning function param in destructuring',
    type: 'pr',
    number: 53624,
    status: 'merged',
    timestamp: 'last week',
    icon: '🔗'
  },
  {
    id: 3,
    title: '[DevTools Bug] callSite.getScriptNameOrSourceURL is not a function (it is undefined)',
    type: 'issue',
    number: 30801,
    status: 'opened',
    timestamp: 'yesterday',
    icon: '⚪'
  },
  {
    id: 4,
    title: 'Cleanup disableDefaultPropsExceptForClasses flag',
    type: 'pr',
    number: 35648,
    status: 'merged',
    timestamp: 'yesterday',
    icon: '🔗'
  },
  {
    id: 5,
    title: 'Cleanup disableDefaultPropsExceptForClasses flag',
    type: 'pr',
    number: 35648,
    status: 'merged',
    timestamp: null,
    icon: '🔗'
  }
];
