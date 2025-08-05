// Ecosystem 페이지에서 사용하는 목업 데이터들

// 추천 프로젝트 목업 데이터
export const ALL_PROJECTS = [
    {
        id: 1,
        name: 'React UI Kit',
        description: '모던한 React 컴포넌트 라이브러리입니다. TypeScript 지원과 접근성 개선이 필요합니다.',
        lastCommit: '2024-07-20',
        stars: 892,
        forks: 156,
        tech: 'React'
    },
    {
        id: 2,
        name: 'DevTools CLI',
        description: '개발자를 위한 유용한 CLI 도구입니다. 새로운 기능 추가와 문서화가 필요한 상태입니다.',
        lastCommit: '2024-07-18',
        stars: 1200,
        forks: 89,
        tech: 'Python'
    },
    {
        id: 3,
        name: 'Analytics Dashboard',
        description: 'Vue.js로 만든 분석 대시보드입니다. 차트 라이브러리 업데이트와 반응형 개선이 필요합니다.',
        lastCommit: '2024-07-15',
        stars: 567,
        forks: 234,
        tech: 'Vue.js'
    },
    {
        id: 4,
        name: 'REST API Framework',
        description: 'Express.js 기반의 REST API 프레임워크입니다. 성능 최적화와 보안 강화가 필요합니다.',
        lastCommit: '2024-07-25',
        stars: 1800,
        forks: 321,
        tech: 'Node.js'
    },
    {
        id: 5,
        name: 'Budget Tracker',
        description: 'React Native로 개발된 가계부 앱입니다. UI/UX 개선과 새로운 기능 개발이 진행 중입니다.',
        lastCommit: '2024-07-22',
        stars: 445,
        forks: 78,
        tech: 'React Native'
    },
    {
        id: 6,
        name: 'ML Data Processor',
        description: '머신러닝 데이터 전처리 라이브러리입니다. 새로운 알고리즘 추가와 성능 최적화가 필요합니다.',
        lastCommit: '2024-07-28',
        stars: 723,
        forks: 142,
        tech: 'Python'
    },
    {
        id: 7,
        name: 'Design System',
        description: '통합 디자인 시스템 라이브러리입니다. 새로운 컴포넌트 추가와 테마 확장이 필요합니다.',
        lastCommit: '2024-07-30',
        stars: 1340,
        forks: 287,
        tech: 'CSS'
    },
    {
        id: 8,
        name: 'Security Scanner',
        description: '코드 보안 취약점 스캐너입니다. 새로운 규칙 추가와 성능 개선이 진행 중입니다.',
        lastCommit: '2024-07-29',
        stars: 965,
        forks: 178,
        tech: 'Go'
    },
    {
        id: 9,
        name: 'Documentation Builder',
        description: '자동 문서 생성 도구입니다. 다양한 언어 지원과 템플릿 확장이 필요합니다.',
        lastCommit: '2024-07-26',
        stars: 612,
        forks: 95,
        tech: 'TypeScript'
    },
    {
        id: 10,
        name: 'Multi-language Support',
        description: '다국어 지원 라이브러리입니다. 새로운 언어 추가와 번역 관리 개선이 필요합니다.',
        lastCommit: '2024-07-24',
        stars: 834,
        forks: 203,
        tech: 'JavaScript'
    },
    {
        id: 11,
        name: 'Performance Monitor',
        description: '웹 성능 모니터링 도구입니다. 실시간 분석 기능과 알림 시스템 개선이 필요합니다.',
        lastCommit: '2024-07-27',
        stars: 1156,
        forks: 267,
        tech: 'JavaScript'
    },
    {
        id: 12,
        name: 'Build Optimizer',
        description: '빌드 최적화 도구입니다. 새로운 플러그인 지원과 캐싱 시스템 개선이 진행 중입니다.',
        lastCommit: '2024-07-23',
        stars: 789,
        forks: 134,
        tech: 'Rust'
    }
];

// 프로젝트 탐색기용 상세 프로젝트 데이터
export const MOCK_PROJECTS = [
    {
        id: 1,
        name: "awesome-react-components",
        owner: "brillout",
        description: "A curated list of awesome React components and libraries. Perfect for developers looking to contribute to React ecosystem.",
        lastCommit: "2024-07-20",
        language: "JavaScript",
        stars: "2.1k",
        forks: "320",
        issues: "45",
        license: "MIT",
        difficulty: "Beginner",
        topics: ["react", "components", "ui", "frontend"],
        goodFirstIssues: 12,
        html_url: "https://github.com/brillout/awesome-react-components"
    },
    {
        id: 2,
        name: "awesome-datascience",
        owner: "academic",
        description: "Open source data science tools and tutorials for Python. Great for beginners and experienced developers.",
        lastCommit: "2024-07-18",
        language: "Python",
        stars: "1.8k",
        forks: "280",
        issues: "32",
        license: "Apache-2.0",
        difficulty: "Intermediate",
        topics: ["python", "data-science", "machine-learning"],
        goodFirstIssues: 8,
        html_url: "https://github.com/academic/awesome-datascience"
    },
    {
        id: 3,
        name: "awesome-vue",
        owner: "vuejs",
        description: "Modern Vue.js UI component library with TypeScript support. Looking for contributors to expand components collection.",
        lastCommit: "2024-07-15",
        language: "TypeScript",
        stars: "956",
        forks: "124",
        issues: "67",
        license: "MIT",
        difficulty: "Intermediate",
        topics: ["vue", "typescript", "ui", "components"],
        goodFirstIssues: 5,
        html_url: "https://github.com/vuejs/awesome-vue"
    },
    {
        id: 4,
        name: "microservices-demo",
        owner: "microservices-demo",
        description: "Microservices architecture example with Go. Great project for learning distributed systems and Go best practices.",
        lastCommit: "2024-07-22",
        language: "Go",
        stars: "1.3k",
        forks: "198",
        issues: "23",
        license: "MIT",
        difficulty: "Advanced",
        topics: ["golang", "microservices", "docker", "kubernetes"],
        goodFirstIssues: 3,
        html_url: "https://github.com/microservices-demo/microservices-demo"
    },
    {
        id: 5,
        name: "actix-web",
        owner: "actix",
        description: "Fast and secure web framework built with Rust. Perfect for contributors interested in systems programming.",
        lastCommit: "2024-07-19",
        language: "Rust",
        stars: "890",
        forks: "145",
        issues: "34",
        license: "Apache-2.0",
        difficulty: "Advanced",
        topics: ["rust", "web", "framework", "performance"],
        goodFirstIssues: 6,
        html_url: "https://github.com/actix/actix-web"
    },
    {
        id: 6,
        name: "react-native-elements",
        owner: "react-native-elements",
        description: "Cross-platform mobile UI components for React Native. Needs help with iOS and Android specific features.",
        lastCommit: "2024-07-21",
        language: "JavaScript",
        stars: "750",
        forks: "89",
        issues: "28",
        license: "MIT",
        difficulty: "Beginner",
        topics: ["react-native", "mobile", "ui", "ios", "android"],
        goodFirstIssues: 15,
        html_url: "https://github.com/react-native-elements/react-native-elements"
    }
];

// 리더보드 목업 데이터
export const MOCK_LEADERBOARD_DATA = {
    realtime: [
        {
            rank: 1,
            username: "opensourcedev",
            avatar: null,
            totalScore: 2500,
            prCount: 145,
            issueCount: 67,
            commitsCount: 432,
            contributionStreak: 89,
            joinDate: "2023-01-15"
        },
        {
            rank: 2,
            username: "codemaster",
            avatar: null,
            totalScore: 2100,
            prCount: 98,
            issueCount: 45,
            commitsCount: 356,
            contributionStreak: 67,
            joinDate: "2023-03-20"
        },
        {
            rank: 3,
            username: "devcontributor",
            avatar: null,
            totalScore: 1850,
            prCount: 76,
            issueCount: 38,
            commitsCount: 289,
            contributionStreak: 45,
            joinDate: "2023-02-10"
        },
        {
            rank: 4,
            username: "reactexpert",
            avatar: null,
            totalScore: 1650,
            prCount: 89,
            issueCount: 32,
            commitsCount: 234,
            contributionStreak: 34,
            joinDate: "2023-04-05"
        },
        {
            rank: 5,
            username: "pythonista",
            avatar: null,
            totalScore: 1400,
            prCount: 67,
            issueCount: 28,
            commitsCount: 198,
            contributionStreak: 28,
            joinDate: "2023-05-12"
        }
    ],
    week: [
        {
            rank: 1,
            username: "weeklystar",
            avatar: null,
            totalScore: 450,
            prCount: 12,
            issueCount: 8,
            commitsCount: 45,
            contributionStreak: 7,
            joinDate: "2023-01-15"
        },
        {
            rank: 2,
            username: "activecoder",
            avatar: null,
            totalScore: 380,
            prCount: 10,
            issueCount: 6,
            commitsCount: 38,
            contributionStreak: 6,
            joinDate: "2023-03-20"
        },
        {
            rank: 3,
            username: "contributor99",
            avatar: null,
            totalScore: 320,
            prCount: 8,
            issueCount: 5,
            commitsCount: 32,
            contributionStreak: 5,
            joinDate: "2023-02-10"
        }
    ],
    month: [
        {
            rank: 1,
            username: "monthlyking",
            avatar: null,
            totalScore: 1200,
            prCount: 45,
            issueCount: 23,
            commitsCount: 156,
            contributionStreak: 28,
            joinDate: "2023-01-15"
        },
        {
            rank: 2,
            username: "steadydev",
            avatar: null,
            totalScore: 980,
            prCount: 38,
            issueCount: 19,
            commitsCount: 134,
            contributionStreak: 25,
            joinDate: "2023-03-20"
        },
        {
            rank: 3,
            username: "consistent",
            avatar: null,
            totalScore: 850,
            prCount: 32,
            issueCount: 16,
            commitsCount: 112,
            contributionStreak: 22,
            joinDate: "2023-02-10"
        }
    ]
};

// 현재 사용자 목업 데이터
export const MOCK_CURRENT_USER = {
    rank: 15,
    username: "currentuser",
    avatar: null,
    totalScore: 890,
    prCount: 23,
    issueCount: 12,
    commitsCount: 98,
    contributionStreak: 12,
    joinDate: "2023-06-01"
};

// 기타 필터 옵션들
export const FILTER_OPTIONS = {
    languages: ['All', 'JavaScript', 'Python', 'TypeScript', 'Java', 'Go', 'Rust'],
    licenses: ['All', 'MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause'],
    commitDates: [
        { label: '전체', value: 'all' },
        { label: '하루 전', value: '1d' },
        { label: '일주일 전', value: '1w' },
        { label: '한달 전', value: '1m' },
        { label: '6개월 전', value: '6m' },
        { label: '1년 전', value: '1y' }
    ]
};
