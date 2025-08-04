// Ecosystem 페이지 공통 유틸리티 함수 정의

// 기술 스택별 색상 매핑 함수
export const getTechColor = (tech) => {
    const colorMap = {
        'React': 'bg-blue-100 text-blue-700',
        'Python': 'bg-green-100 text-green-700',
        'Vue.js': 'bg-green-100 text-green-700',
        'Node.js': 'bg-yellow-100 text-yellow-700',
        'React Native': 'bg-purple-100 text-purple-700',
        'CSS': 'bg-pink-100 text-pink-700',
        'Go': 'bg-indigo-100 text-indigo-700',
        'TypeScript': 'bg-blue-100 text-blue-700',
        'JavaScript': 'bg-orange-100 text-orange-700',
        'Rust': 'bg-red-100 text-red-700'
    };
    return colorMap[tech] || 'bg-gray-100 text-gray-700';
};

// 난이도별 색상 매핑 함수
export const getDifficultyColor = (difficulty) => {
    const colorMap = {
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-yellow-100 text-yellow-700',
        'Advanced': 'bg-red-100 text-red-700'
    };
    return colorMap[difficulty] || 'bg-gray-100 text-gray-700';
};

// 숫자 포맷팅 함수 (1000 -> 1k)
export const formatNumber = (num) => {
    if (typeof num === 'string') return num;
    
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

// 날짜 포맷팅 함수
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1일 전';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}개월 전`;
    return `${Math.floor(diffDays / 365)}년 전`;
};

// 기여도 점수 계산 함수
export const calculateContributionScore = (prCount, issueCount, commitsCount, streak) => {
    const prWeight = 10;
    const issueWeight = 5;
    const commitWeight = 1;
    const streakBonus = streak * 2;
    
    return (prCount * prWeight) + (issueCount * issueWeight) + (commitsCount * commitWeight) + streakBonus;
};

// 프로젝트 필터링 함수
export const filterProjects = (projects, filters) => {
    return projects.filter(project => {
        const { language, license, difficulty, searchQuery } = filters;
        
        // 언어 필터
        if (language && project.language !== language) return false;
        
        // 라이선스 필터
        if (license && project.license !== license) return false;
        
        // 난이도 필터
        if (difficulty && project.difficulty !== difficulty) return false;
        
        // 검색어 필터
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = project.name.toLowerCase().includes(query);
            const matchesDescription = project.description.toLowerCase().includes(query);
            const matchesTopics = project.topics?.some(topic => 
                topic.toLowerCase().includes(query)
            );
            
            if (!matchesName && !matchesDescription && !matchesTopics) return false;
        }
        
        return true;
    });
};

// 프로젝트 정렬 함수
export const sortProjects = (projects, sortBy) => {
    return [...projects].sort((a, b) => {
        switch (sortBy) {
            case 'stars': {
                const starsA = parseInt(a.stars?.toString().replace(/k|M/, '')) || 0;
                const starsB = parseInt(b.stars?.toString().replace(/k|M/, '')) || 0;
                return starsB - starsA;
            }
            case 'recent':
                return new Date(b.lastCommit) - new Date(a.lastCommit);
            case 'issues': {
                const issuesA = parseInt(a.goodFirstIssues) || 0;
                const issuesB = parseInt(b.goodFirstIssues) || 0;
                return issuesB - issuesA;
            }
            case 'name':
                return a.name.localeCompare(b.name);
            default:
                return 0;
        }
    });
};

// 랭킹 색상 반환 함수
export const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-600';
    if (rank === 2) return 'text-gray-500';
    if (rank === 3) return 'text-amber-600';
    return 'text-gray-400';
};

// 랭킹 아이콘 반환 함수
export const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
};
