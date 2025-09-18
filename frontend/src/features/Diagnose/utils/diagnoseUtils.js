// 진단 페이지 공통 유틸리티 함수 정의

// 언어별 색상 매핑 함수
export const getLanguageColor = (language) => {
    const colors = {
        'JavaScript': '#f1e05a',
        'TypeScript': '#2b7489',
        'Python': '#3572A5',
        'Java': '#b07219',
        'C++': '#f34b7d',
        'C': '#555555',
        'HTML': '#e34c26',
        'CSS': '#1572B6',
        'Go': '#00ADD8',
        'Rust': '#dea584',
        'PHP': '#777BB4',
        'Ruby': '#701516',
        'Swift': '#FA7343',
        'Kotlin': '#F18E33',
        'C#': '#239120'
    };
    return colors[language] || '#8B5CF6'; // 기본 보라색
};

// 언어 분포 데이터 변환 함수 - 차트용 데이터 변환
export const transformLanguageData = (languages) => {
    if (!languages) return [];

    return Object.entries(languages)
        .sort((a, b) => b[1] - a[1]) // 비율 내림차순 정렬
        .map(([name, percentage]) => ({
            label: name,
            value: percentage,
            color: getLanguageColor(name)
        }));
};

// 프로젝트 정보 데이터 변환 함수
export const calculateRepositoryStats = (projectData) => {
    if (!projectData) return null;

    return {
        totalCommits: projectData.commits?.total || 0,
        totalPullRequests: projectData.pullRequests?.total ||
            ((projectData.pullRequests?.open || 0) + (projectData.pullRequests?.closed || 0)),
        totalIssues: projectData.issues?.total ||
            ((projectData.issues?.open || 0) + (projectData.issues?.closed || 0)),
        lastCommit: projectData.commits?.lastCommitDate
            ? new Date(projectData.commits.lastCommitDate).toLocaleDateString('ko-KR')
            : projectData.pushedAt
                ? new Date(projectData.pushedAt).toLocaleDateString('ko-KR')
                : 'N/A',
        activePR: projectData.pullRequests?.open || 0,
        activeIssue: projectData.issues?.open || 0,
        stars: projectData.stars || 0,
        forks: projectData.forks || 0,
        watchers: projectData.watchers || 0,
    };
};

export const transformCommitActivityData = (projectData) => {
    if (!projectData?.commits?.commitsByWeek) return [];

    return Object.entries(projectData.commits.commitsByWeek)
        .slice(-7) // 최근 7주
        .map(([week, count]) => ({
            label: week.split('-')[1] + '주',
            value: count
        }));
};

export const transformRecentActivities = (projectData) => {
    if (!projectData) return [];

    const recentCommits = (projectData.commits?.recentCommits || [])
        .slice(0, 3)
        .map(commit => ({
            type: 'commit',
            title: commit.message,
            author: `${commit.author} • ${new Date(commit.date).toLocaleDateString('ko-KR')}`,
            icon: '📝'
        }));

    const recentPRs = (projectData.pullRequests?.recentPRs || [])
        .slice(0, 2)
        .map(pr => ({
            type: 'pullrequest',
            title: pr.title,
            author: `${pr.author} • ${new Date(pr.createdAt).toLocaleDateString('ko-KR')}`,
            icon: '🔀'
        }));

    return [{
        date: new Date().toLocaleDateString('ko-KR'),
        activities: [...recentCommits, ...recentPRs]
    }];
};

export const getActivityColor = (type) => {
    const colors = {
        commit: 'bg-blue-50 border-blue-200',
        pullrequest: 'bg-green-50 border-green-200',
        issue: 'bg-yellow-50 border-yellow-200',
        release: 'bg-purple-50 border-purple-200'
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
};


export const getSeverityColor = (severity) => {
    const colors = {
        'Critical': 'bg-red-100 text-red-800',
        'High': 'bg-orange-100 text-orange-800',
        'Medium': 'bg-yellow-100 text-yellow-800',
        'Low': 'bg-green-100 text-green-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
};

export const getStatusColor = (status) => {
    const colors = {
        'patched': 'bg-green-100 text-green-800',
        'mitigated': 'bg-blue-100 text-blue-800',
        'open': 'bg-red-100 text-red-800',
        'investigating': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
};