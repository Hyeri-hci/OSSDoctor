import { searchProjects, getRepositoryActivity, getContributorStats, getRecommendedProjects } from './github-api.js';
import { ALL_PROJECTS, MOCK_PROJECTS } from '../mockData/mockData.js';

// 실제 API 실패 혹은 토큰 없는 경우 Mock 데이터 반환 
// GitHub API 사용 가능 여부 확인
const isGitHubApiAvailable = () => {
  return !!import.meta.env.VITE_GITHUB_TOKEN;
};

// Mock 데이터 API 응답 형식으로 변환 
const transformMockToApiFormat = (mockProjects) => {
  return mockProjects.map(project => ({
    id: project.id.toString(),
    name: project.name,
    owner: project.owner || 'mock',
    fullName: project.owner ? `${project.owner}/${project.name}` : `mock/${project.name.toLowerCase().replace(/\s+/g, '-')}`,
    description: project.description,
    url: project.html_url || `https://github.com/${project.owner || 'mock'}/${project.name}`,
    html_url: project.html_url || `https://github.com/${project.owner || 'mock'}/${project.name}`,
    stars: typeof project.stars === 'string' ? 
      parseInt(project.stars.replace(/[^\d]/g, '')) : project.stars,
    forks: typeof project.forks === 'string' ? 
      parseInt(project.forks.replace(/[^\d]/g, '')) : project.forks,
    language: project.language || project.tech,
    languageColor: getLanguageColor(project.language || project.tech),
    license: project.license || 'MIT',
    licenseId: project.license || 'MIT',
    lastCommit: project.lastCommit,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: project.lastCommit + 'T00:00:00Z',
    imageUrl: null,
    topics: project.topics || [],
    goodFirstIssues: project.goodFirstIssues || Math.floor(Math.random() * 20) + 1,
    openPullRequests: Math.floor(Math.random() * 50) + 1,
    latestRelease: null,
    latestReleaseDate: null,
    difficulty: project.difficulty || 'Beginner'
  }));
};

// 언어별 색상 매핑
const getLanguageColor = (language) => {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'React': '#61dafb',
    'Vue.js': '#4FC08D',
    'Node.js': '#339933',
    'React Native': '#61dafb',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'C++': '#f34b7d',
    'PHP': '#4F5D95'
  };
  return colors[language] || '#586069';
};

// GitHub API 응답 결과 추가로 필터링
const filterApiResults = (projects, filters) => {
  const { license = '', language = '' } = filters;
  
  console.log('클라이언트 측 필터링 시작:', { license, language, projectCount: projects.length });
  
  const filteredResults = projects.filter(project => {
    let passesFilter = true;
    
    // 라이선스 필터링 (API에서 완전히 처리되지 않을 수 있으므로 추가 확인)
    if (license) {
      const projectLicense = project.license || project.licenseId || '';
      console.log('라이선스 확인:', { projectName: project.name, projectLicense, filterLicense: license });
      
      const licenseMatches = 
        projectLicense.toLowerCase() === license.toLowerCase() ||
        projectLicense === license ||
        (license === 'MIT' && (
          projectLicense.toLowerCase().includes('mit') ||
          projectLicense.toLowerCase() === 'mit license'
        )) ||
        (license === 'Apache-2.0' && (
          projectLicense.toLowerCase().includes('apache') ||
          projectLicense.toLowerCase() === 'apache license 2.0'
        )) ||
        (license === 'GPL-3.0' && (
          projectLicense.toLowerCase().includes('gpl') ||
          projectLicense.toLowerCase().includes('gnu gpl')
        )) ||
        (license === 'BSD-3-Clause' && (
          projectLicense.toLowerCase().includes('bsd')
        )) ||
        (license === 'ISC' && (
          projectLicense.toLowerCase().includes('isc')
        ));
      
      if (!licenseMatches) {
        console.log('라이선스 불일치:', { projectName: project.name, projectLicense, filterLicense: license });
        passesFilter = false;
      } else {
        console.log('✅ 라이선스 일치:', { projectName: project.name, projectLicense, filterLicense: license });
      }
    }
    
    // 언어 필터링 추가 확인
    if (language && project.language !== language) {
      console.log('언어 불일치:', { projectName: project.name, projectLanguage: project.language, filterLanguage: language });
      passesFilter = false;
    }
    
    console.log('필터 결과:', { projectName: project.name, passesFilter });
    return passesFilter;
  });
  
  console.log('필터링 완료:', { 
    originalCount: projects.length, 
    filteredCount: filteredResults.length,
    filters: { license, language }
  });
  
  return filteredResults;
};

// Mock 데이터 필터링 함수
const filterMockProjects = (projects, filters) => {
  const {
    searchQuery = '',
    language = '',
    license = '',
    timeFilter = ''
  } = filters;

  return projects.filter(project => {
    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = project.name.toLowerCase().includes(query);
      const matchesDesc = project.description.toLowerCase().includes(query);
      if (!matchesName && !matchesDesc) return false;
    }

    // 언어 필터링
    if (language && project.language !== language && project.tech !== language) {
      return false;
    }

    // 라이선스 필터링
    if (license && project.license !== license) {
      return false;
    }

    // 시간 필터링 (Mock 데이터에서는 단순하게 처리)
    if (timeFilter) {
      const commitDate = new Date(project.lastCommit);
      const now = new Date();
      const timeDiffs = {
        'day': 1,
        'week': 7,
        'month': 30,
        '6months': 180,
        'year': 365
      };
      
      const diffDays = (now - commitDate) / (1000 * 60 * 60 * 24);
      if (diffDays > timeDiffs[timeFilter]) {
        return false;
      }
    }

    return true;
  });
};

// 프로젝트 검색 (API 또는 Mock 데이터 사용)
export const searchProjectsService = async (filters = {}) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        const apiResult = await searchProjects(filters);
        
        // API 결과에 추가 필터링 적용 (라이선스 등이 완전히 필터링되지 않을 수 있음)
        const filteredProjects = filterApiResults(apiResult.projects, filters);
        
        console.log('API 검색 최종 결과:', {
          originalApiCount: apiResult.projects.length,
          filteredCount: filteredProjects.length,
          filters
        });
        
        return {
          ...apiResult,
          projects: filteredProjects,
          totalCount: filteredProjects.length
        };
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 사용
    console.log('Mock 데이터를 사용하여 프로젝트를 검색합니다.');
    
    const filteredMockProjects = filterMockProjects(MOCK_PROJECTS, filters);
    const transformedProjects = transformMockToApiFormat(filteredMockProjects);

    console.log('Mock 데이터 필터링 결과:', {
      originalMockCount: MOCK_PROJECTS.length,
      filteredMockCount: filteredMockProjects.length,
      transformedCount: transformedProjects.length,
      filters
    });

    // 정렬 처리
    const { sortBy = 'beginner-friendly' } = filters;
    const sortedProjects = transformedProjects.sort((a, b) => {
      switch (sortBy) {
        case 'beginner-friendly': {
          // 초보자 친화도 점수 계산
          const scoreA = calculateBeginnerScore(a);
          const scoreB = calculateBeginnerScore(b);
          return scoreB - scoreA;
        }
        
        case 'good-first-issues': {
          // Good First Issues 개수순
          if (b.goodFirstIssues !== a.goodFirstIssues) {
            return b.goodFirstIssues - a.goodFirstIssues;
          }
          // 같으면 전체 이슈 수로 정렬 (mock에서는 stars로 대체)
          return b.stars - a.stars;
        }
        
        case 'recently-active': {
          // 최근 활동도순 (lastCommit 기준)
          return new Date(b.lastCommit) - new Date(a.lastCommit);
        }
        
        case 'updated':
          return new Date(b.lastCommit) - new Date(a.lastCommit);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'stars':
        default:
          return b.stars - a.stars;
      }
    });

    // 초보자 친화도 점수 계산 함수 (Mock 데이터용)
    function calculateBeginnerScore(project) {
      let score = 0;
      
      // Good First Issues 점수 (가장 중요)
      score += (project.goodFirstIssues || 0) * 10;
      
      // 난이도 점수
      if (project.difficulty === 'Beginner') score += 50;
      else if (project.difficulty === 'Intermediate') score += 20;
      
      // 적당한 크기 점수
      if (project.stars >= 1000 && project.stars <= 10000) score += 20;
      else if (project.stars >= 500 && project.stars <= 50000) score += 10;
      
      // 최근 활동 점수 (간단한 버전)
      const daysSince = getDaysSinceLastCommit(project.lastCommit);
      if (daysSince <= 7) score += 30;
      else if (daysSince <= 30) score += 15;
      
      return score;
    }

    // 마지막 커밋 이후 일수 계산
    function getDaysSinceLastCommit(lastCommit) {
      if (!lastCommit) return 999;
      const lastDate = new Date(lastCommit);
      const now = new Date();
      return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
    }

    const finalResult = {
      projects: sortedProjects.slice(0, filters.limit || 50),
      totalCount: sortedProjects.length,
      hasNextPage: sortedProjects.length > (filters.limit || 50)
    };

    console.log('최종 반환 결과:', {
      resultProjectCount: finalResult.projects.length,
      totalCount: finalResult.totalCount,
      hasNextPage: finalResult.hasNextPage,
      sampleProjects: finalResult.projects.slice(0, 3).map(p => ({ name: p.name, license: p.license }))
    });

    return finalResult;
  } catch (error) {
    console.error('프로젝트 검색 서비스 에러:', error);
    throw error;
  }
};

// 추천 프로젝트 조회 (API 또는 Mock 데이터 사용)
export const getRecommendedProjectsService = async (language = '', limit = 12) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        return await getRecommendedProjects(language, limit);
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 사용
    console.log('Mock 데이터를 사용하여 추천 프로젝트를 조회합니다.');
    
    let projects = [...ALL_PROJECTS];
    
    // 언어 필터링
    if (language) {
      projects = projects.filter(project => 
        project.tech === language || project.language === language
      );
    }

    // 랜덤 셔플 후 제한
    const shuffled = projects.sort(() => 0.5 - Math.random());
    const selectedProjects = shuffled.slice(0, limit);
    
    return {
      projects: transformMockToApiFormat(selectedProjects),
      totalCount: projects.length,
      hasNextPage: projects.length > limit
    };
  } catch (error) {
    console.error('추천 프로젝트 조회 서비스 에러:', error);
    throw error;
  }
};

// 저장소 활동 정보 조회 (API 또는 Mock 데이터 사용)
export const getRepositoryActivityService = async (owner, repo) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        return await getRepositoryActivity(owner, repo);
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 반환
    return {
      recentCommits: [
        {
          sha: 'abc123',
          message: 'Update README.md',
          author: 'Mock User',
          date: new Date().toISOString(),
          url: '#'
        }
      ],
      openIssues: [
        {
          id: 1,
          number: 123,
          title: 'Sample issue',
          createdAt: new Date().toISOString(),
          labels: ['bug'],
          url: '#'
        }
      ],
      openPullRequests: [
        {
          id: 1,
          number: 456,
          title: 'Sample PR',
          createdAt: new Date().toISOString(),
          author: 'Mock User',
          url: '#'
        }
      ]
    };
  } catch (error) {
    console.error('저장소 활동 정보 조회 서비스 에러:', error);
    throw error;
  }
};

// 기여자 통계 조회 (API 또는 Mock 데이터 사용)
export const getContributorStatsService = async (owner, repo) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        return await getContributorStats(owner, repo);
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 반환
    return [
      {
        login: 'mockuser1',
        avatarUrl: 'https://github.com/identicons/mockuser1.png',
        contributions: 150,
        profileUrl: 'https://github.com/mockuser1'
      },
      {
        login: 'mockuser2',
        avatarUrl: 'https://github.com/identicons/mockuser2.png',
        contributions: 89,
        profileUrl: 'https://github.com/mockuser2'
      }
    ];
  } catch (error) {
    console.error('기여자 통계 조회 서비스 에러:', error);
    return [];
  }
};
