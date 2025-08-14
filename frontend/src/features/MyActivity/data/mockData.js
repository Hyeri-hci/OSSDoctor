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

// 기여 이력 데이터 - HealthOverview와 동일한 형식
export const contributionHistory = [
  {
    id: 1,
    title: 'Cleanup disableDefaultPropsExceptForClasses flag',
    type: 'pr_merged',
    number: 35648,
    status: 'merged',
    timestamp: 'yesterday',
    icon: '�',
    author: 'username',
    time: 'merged yesterday',
    repository: 'facebook/react'
  },
  {
    id: 2,
    title: '[compiler] Fix bug with reassigning function param in destructuring',
    type: 'pr_merged',
    number: 53624,
    status: 'merged',
    timestamp: 'last week',
    icon: '�',
    author: 'username',
    time: 'merged last week',
    repository: 'facebook/react'
  },
  {
    id: 3,
    title: '[DevTools Bug] callSite.getScriptNameOrSourceURL is not a function (it is undefined)',
    type: 'issue_opened',
    number: 30801,
    status: 'opened',
    timestamp: 'yesterday',
    icon: '🔧',
    author: 'username',
    time: 'opened yesterday',
    repository: 'facebook/react'
  },
  {
    id: 4,
    title: 'Add support for React Server Components',
    type: 'pr_opened',
    number: 35650,
    status: 'opened',
    timestamp: '2 days ago',
    icon: '📝',
    author: 'username',
    time: 'opened 2 days ago',
    repository: 'vercel/next.js'
  },
  {
    id: 5,
    title: 'Fix TypeScript types for new hooks',
    type: 'commit',
    number: null,
    status: 'committed',
    timestamp: '3 days ago',
    icon: '🔧',
    author: 'username',
    time: 'committed 3 days ago',
    repository: 'facebook/react'
  },
  {
    id: 6,
    title: 'Documentation update for installation guide',
    type: 'pr_merged',
    number: 12345,
    status: 'merged',
    timestamp: '1 week ago',
    icon: '📝',
    author: 'username',
    time: 'merged 1 week ago',
    repository: 'nodejs/node'
  },
  {
    id: 7,
    title: 'Performance optimization in rendering pipeline',
    type: 'issue_closed',
    number: 54321,
    status: 'closed',
    timestamp: '1 week ago',
    icon: '�',
    author: 'username',
    time: 'closed 1 week ago',
    repository: 'facebook/react'
  },
  {
    id: 8,
    title: 'Add unit tests for new feature',
    type: 'commit',
    number: null,
    status: 'committed',
    timestamp: '2 weeks ago',
    icon: '🔧',
    author: 'username',
    time: 'committed 2 weeks ago',
    repository: 'microsoft/vscode'
  }
];

// 날짜별로 그룹화된 기여 이력 데이터 (HealthOverview 형식) - 확장된 데이터
export const recentActivitiesData = [
  {
    date: "2024년 8월 12일",
    activities: [
      {
        type: "pr_merged",
        title: "Add new React 19 features support",
        author: "username",
        time: "merged today",
        repository: "facebook/react",
        number: 35700
      },
      {
        type: "commit",
        title: "Update dependencies to latest versions",
        author: "username",
        time: "committed today",
        repository: "vercel/next.js"
      }
    ]
  },
  {
    date: "2024년 8월 11일",
    activities: [
      {
        type: "pr_merged",
        title: "Cleanup disableDefaultPropsExceptForClasses flag",
        author: "username",
        time: "merged yesterday",
        repository: "facebook/react",
        number: 35648
      },
      {
        type: "issue_opened",
        title: "[DevTools Bug] callSite.getScriptNameOrSourceURL is not a function",
        author: "username", 
        time: "opened yesterday",
        repository: "facebook/react",
        number: 30801
      },
      {
        type: "pr_opened",
        title: "Improve TypeScript performance in large codebases",
        author: "username",
        time: "opened yesterday",
        repository: "microsoft/TypeScript",
        number: 56789
      }
    ]
  },
  {
    date: "2024년 8월 10일",
    activities: [
      {
        type: "issue_closed",
        title: "Memory leak in useEffect cleanup",
        author: "username",
        time: "closed 2 days ago",
        repository: "facebook/react",
        number: 35555
      },
      {
        type: "commit",
        title: "Add comprehensive unit tests for new hooks",
        author: "username",
        time: "committed 2 days ago",
        repository: "facebook/react"
      }
    ]
  },
  {
    date: "2024년 8월 9일",
    activities: [
      {
        type: "pr_opened",
        title: "Add support for React Server Components",
        author: "username",
        time: "opened 3 days ago",
        repository: "vercel/next.js",
        number: 35650
      },
      {
        type: "pr_merged",
        title: "Fix CSS-in-JS hydration mismatch",
        author: "username",
        time: "merged 3 days ago",
        repository: "emotion-js/emotion",
        number: 2890
      }
    ]
  },
  {
    date: "2024년 8월 8일",
    activities: [
      {
        type: "commit",
        title: "Fix TypeScript types for new hooks",
        author: "username",
        time: "committed 4 days ago",
        repository: "facebook/react"
      },
      {
        type: "issue_opened",
        title: "Performance regression in React 18.3",
        author: "username",
        time: "opened 4 days ago",
        repository: "facebook/react",
        number: 35601
      }
    ]
  },
  {
    date: "2024년 8월 7일",
    activities: [
      {
        type: "pr_merged",
        title: "Implement concurrent rendering optimizations",
        author: "username",
        time: "merged 5 days ago",
        repository: "facebook/react",
        number: 35600
      },
      {
        type: "commit",
        title: "Add ESLint rules for React best practices",
        author: "username",
        time: "committed 5 days ago",
        repository: "eslint/eslint-plugin-react"
      },
      {
        type: "issue_closed",
        title: "Bundle size increase after update",
        author: "username",
        time: "closed 5 days ago",
        repository: "webpack/webpack",
        number: 17234
      }
    ]
  },
  {
    date: "2024년 8월 6일",
    activities: [
      {
        type: "pr_opened",
        title: "Add experimental Suspense boundaries",
        author: "username",
        time: "opened 6 days ago",
        repository: "facebook/react",
        number: 35580
      }
    ]
  },
  {
    date: "2024년 8월 5일",
    activities: [
      {
        type: "commit",
        title: "Refactor component lifecycle methods",
        author: "username",
        time: "committed 1 week ago",
        repository: "facebook/react"
      },
      {
        type: "pr_merged",
        title: "Improve error boundaries handling",
        author: "username",
        time: "merged 1 week ago",
        repository: "facebook/react",
        number: 35570
      }
    ]
  },
  {
    date: "2024년 8월 4일",
    activities: [
      {
        type: "pr_merged",
        title: "[compiler] Fix bug with reassigning function param in destructuring",
        author: "username",
        time: "merged 1 week ago",
        repository: "facebook/react",
        number: 53624
      },
      {
        type: "pr_merged",
        title: "Documentation update for installation guide",
        author: "username",
        time: "merged 1 week ago",
        repository: "nodejs/node",
        number: 12345
      },
      {
        type: "issue_opened",
        title: "Node.js 20 compatibility issues",
        author: "username",
        time: "opened 1 week ago",
        repository: "nodejs/node",
        number: 49876
      }
    ]
  },
  {
    date: "2024년 8월 3일",
    activities: [
      {
        type: "issue_closed",
        title: "Performance optimization in rendering pipeline",
        author: "username",
        time: "closed 1 week ago",
        repository: "facebook/react",
        number: 54321
      },
      {
        type: "commit",
        title: "Update build configuration for production",
        author: "username",
        time: "committed 1 week ago",
        repository: "webpack/webpack"
      }
    ]
  },
  {
    date: "2024년 8월 2일",
    activities: [
      {
        type: "pr_opened",
        title: "Add support for Web Components integration",
        author: "username",
        time: "opened 10 days ago",
        repository: "facebook/react",
        number: 35500
      },
      {
        type: "commit",
        title: "Implement lazy loading for components",
        author: "username",
        time: "committed 10 days ago",
        repository: "facebook/react"
      }
    ]
  },
  {
    date: "2024년 8월 1일",
    activities: [
      {
        type: "pr_merged",
        title: "Fix memory leak in development mode",
        author: "username",
        time: "merged 11 days ago",
        repository: "facebook/react",
        number: 35490
      },
      {
        type: "issue_closed",
        title: "Hot reload not working in development",
        author: "username",
        time: "closed 11 days ago",
        repository: "webpack/webpack-dev-server",
        number: 4567
      }
    ]
  },
  {
    date: "2024년 7월 31일",
    activities: [
      {
        type: "commit",
        title: "Add TypeScript strict mode configuration",
        author: "username",
        time: "committed 12 days ago",
        repository: "microsoft/TypeScript"
      },
      {
        type: "pr_opened",
        title: "Implement new JSX transform",
        author: "username",
        time: "opened 12 days ago",
        repository: "babel/babel",
        number: 15432
      }
    ]
  },
  {
    date: "2024년 7월 30일",
    activities: [
      {
        type: "issue_opened",
        title: "CSS modules not working with latest version",
        author: "username",
        time: "opened 13 days ago",
        repository: "css-modules/css-modules",
        number: 987
      },
      {
        type: "commit",
        title: "Fix compatibility with Node.js 20",
        author: "username",
        time: "committed 13 days ago",
        repository: "nodejs/node"
      }
    ]
  },
  {
    date: "2024년 7월 29일",
    activities: [
      {
        type: "pr_merged",
        title: "Improve bundle splitting algorithm",
        author: "username",
        time: "merged 2 weeks ago",
        repository: "webpack/webpack",
        number: 17100
      }
    ]
  },
  {
    date: "2024년 7월 28일",
    activities: [
      {
        type: "commit",
        title: "Add unit tests for new feature",
        author: "username",
        time: "committed 2 weeks ago",
        repository: "microsoft/vscode"
      },
      {
        type: "issue_closed",
        title: "Extension marketplace search issues",
        author: "username",
        time: "closed 2 weeks ago",
        repository: "microsoft/vscode",
        number: 189234
      }
    ]
  },
  {
    date: "2024년 7월 27일",
    activities: [
      {
        type: "pr_opened",
        title: "Add dark mode support for editor",
        author: "username",
        time: "opened 2 weeks ago",
        repository: "microsoft/vscode",
        number: 189200
      },
      {
        type: "commit",
        title: "Optimize syntax highlighting performance",
        author: "username",
        time: "committed 2 weeks ago",
        repository: "microsoft/vscode"
      }
    ]
  },
  {
    date: "2024년 7월 26일",
    activities: [
      {
        type: "pr_merged",
        title: "Fix accessibility issues in navigation",
        author: "username",
        time: "merged 2 weeks ago",
        repository: "microsoft/vscode",
        number: 189150
      },
      {
        type: "issue_opened",
        title: "Screen reader compatibility problems",
        author: "username",
        time: "opened 2 weeks ago",
        repository: "microsoft/vscode",
        number: 189100
      }
    ]
  }
];
