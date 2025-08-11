import { searchProjects, getRepositoryActivity, getContributorStats, getRecommendedProjects } from './github-api.js';
import { ALL_PROJECTS, MOCK_PROJECTS } from '../mockData/mockData.js';

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

// 간단한 필터링 함수
const filterMockProjects = (projects, filters) => {
  const { searchQuery = '', language = '', license = '' } = filters;

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

    return true;
  });
};

// 초보자 친화적인 점수 계산
const calculateBeginnerFriendlyScore = (project) => {
  let score = 0;
  
  // Good First Issues 점수 (가장 중요)
  if (project.goodFirstIssues > 0) score += 50;
  
  // 난이도 점수
  if (project.difficulty === 'Beginner') score += 40;
  else if (project.difficulty === 'Intermediate') score += 20;
  
  // 적당한 인기도 점수
  const stars = typeof project.stars === 'number' ? project.stars : 
    parseInt(String(project.stars).replace(/[^\d]/g, '')) || 0;
  
  if (stars >= 1000 && stars <= 10000) score += 30;
  else if (stars >= 500 && stars <= 50000) score += 20;
  else if (stars >= 100) score += 10;
  
  // Fork 비율 점수 (활발한 커뮤니티 지표)
  const forks = typeof project.forks === 'number' ? project.forks : 
    parseInt(String(project.forks).replace(/[^\d]/g, '')) || 0;
  
  if (stars > 0 && forks > 0) {
    const forkRatio = forks / stars;
    if (forkRatio >= 0.1 && forkRatio <= 0.3) score += 25;
    else if (forkRatio >= 0.05) score += 15;
  }
  
  // 최근 활동 점수
  if (project.lastCommit || project.updatedAt) {
    const daysSince = getDaysSinceLastCommit(project.lastCommit || project.updatedAt);
    if (daysSince <= 30) score += 20;
    else if (daysSince <= 90) score += 10;
    else if (daysSince <= 180) score += 5;
  }
  
  // 토픽 기반 점수 (EcosystemPage의 검색 기준에 맞춤)
  if (project.topics && Array.isArray(project.topics)) {
    const priorityTopics = [
      'beginner-friendly', 'first-timers-only', 'good-first-issue', 
      'documentation', 'open-source'
    ];
    
    const topicMatches = project.topics.filter(topic => 
      priorityTopics.includes(topic.toLowerCase())
    ).length;
    
    score += topicMatches * 15;
  }
  
  // 프로젝트 이름/설명에서 초보자 친화적인 키워드 점수
  const beginnerKeywords = [
    'beginner', 'starter', 'tutorial', 'learning', 'simple', 'easy',
    'first', 'intro', 'guide', 'example', 'documentation'
  ];
  
  const projectText = `${project.name} ${project.description}`.toLowerCase();
  const keywordMatches = beginnerKeywords.filter(keyword => 
    projectText.includes(keyword)
  ).length;
  
  score += keywordMatches * 5;
  
  // 라이선스 점수 (오픈소스 친화적인 라이선스)
  const friendlyLicenses = ['MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'ISC'];
  if (project.license && friendlyLicenses.includes(project.license)) {
    score += 10;
  }
  
  return score;
};

// 마지막 커밋 이후 일수 계산 헬퍼 함수
const getDaysSinceLastCommit = (lastCommit) => {
  if (!lastCommit) return 999;
  const lastDate = new Date(lastCommit);
  const now = new Date();
  return Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
};

// 프로젝트 검색 서비스 (ProjectExplorer용)
export const searchProjectsService = async (filters = {}) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        const apiResult = await searchProjects(filters);
        return {
          ...apiResult,
          projects: apiResult.projects || [],
          totalCount: apiResult.totalCount || 0
        };
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 사용
    const filteredMockProjects = filterMockProjects(MOCK_PROJECTS, filters);
    const transformedProjects = transformMockToApiFormat(filteredMockProjects);

    // 점수 기반 정렬
    const scoredProjects = transformedProjects.map(project => ({
      ...project,
      score: calculateBeginnerFriendlyScore(project)
    }));

    scoredProjects.sort((a, b) => b.score - a.score);

    return {
      projects: scoredProjects.slice(0, filters.limit || 50),
      totalCount: scoredProjects.length,
      hasNextPage: scoredProjects.length > (filters.limit || 50)
    };
  } catch (error) {
    console.error('프로젝트 검색 서비스 에러:', error);
    throw error;
  }
};

// 추천 프로젝트 조회 (EcosystemPage용)
export const getRecommendedProjectsService = async (searchQuery = '', limit = 12) => {
  try {
    // GitHub API 사용 시도
    if (isGitHubApiAvailable()) {
      try {
        if (searchQuery) {
          const result = await searchProjects({ 
            searchQuery,
            limit,
            sortBy: 'stars' 
          });
          return result;
        }
        
        return await getRecommendedProjects('', limit);
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 사용
    let projects = [...ALL_PROJECTS];
    
    // 검색 쿼리 필터링
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      projects = projects.filter(project => {
        return (
          project.name.toLowerCase().includes(queryLower) ||
          project.description.toLowerCase().includes(queryLower) ||
          (project.topics && project.topics.some(topic => topic.toLowerCase().includes(queryLower)))
        );
      });
    }

    // 초보자 친화적인 프로젝트와 인기 프로젝트 결합
    const beginnerFriendlyProjects = projects.filter(project => 
      project.difficulty === 'Beginner' || 
      project.goodFirstIssues > 0 ||
      (project.topics && project.topics.some(topic => 
        ['beginner-friendly', 'first-timers-only', 'good-first-issue', 'documentation'].includes(topic.toLowerCase())
      ))
    );
    
    const popularProjects = projects.filter(project => 
      typeof project.stars === 'number' ? project.stars > 1000 : 
      parseInt(String(project.stars).replace(/[^\d]/g, '')) > 1000
    );
    
    const combinedProjects = [
      ...beginnerFriendlyProjects,
      ...popularProjects.filter(p => 
        !beginnerFriendlyProjects.some(bf => bf.id === p.id)
      )
    ];

    // 점수 기반 정렬 후 랜덤 요소 추가
    const scoredProjects = combinedProjects.map(project => ({
      ...project,
      score: calculateBeginnerFriendlyScore(project)
    }));

    scoredProjects.sort((a, b) => b.score - a.score);

    // 상위 프로젝트들 중에서 랜덤 선택
    const topProjects = scoredProjects.slice(0, Math.min(limit * 2, scoredProjects.length));
    const shuffled = topProjects.sort(() => 0.5 - Math.random());
    const selectedProjects = shuffled.slice(0, limit);
    
    return {
      projects: transformMockToApiFormat(selectedProjects),
      totalCount: combinedProjects.length,
      hasNextPage: combinedProjects.length > limit
    };
  } catch (error) {
    console.error('추천 프로젝트 조회 서비스 에러:', error);
    throw error;
  }
};

// 저장소 활동 정보 조회 (API 또는 Mock 데이터 사용)
export const getRepositoryActivityService = async (owner, repo) => {
  try {
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
        login: 'mock-user-1',
        contributions: 150,
        avatar_url: 'https://via.placeholder.com/40',
        html_url: 'https://github.com/mock-user-1'
      },
      {
        login: 'mock-user-2',
        contributions: 95,
        avatar_url: 'https://via.placeholder.com/40',
        html_url: 'https://github.com/mock-user-2'
      }
    ];
  } catch (error) {
    console.error('기여자 통계 조회 서비스 에러:', error);
    throw error;
  }
};

// 배치별 커서를 저장하기 위한 전역 저장소
let batchCursors = {};
let currentSearchKey = '';

// 검색 키 생성 (필터 조건을 기반으로 고유 키 생성)
const generateSearchKey = (filters) => {
  return JSON.stringify({
    searchQuery: filters.searchQuery || '',
    language: filters.language || '',
    license: filters.license || '',
    timeFilter: filters.timeFilter || '',
    sortBy: filters.sortBy || 'beginner-friendly'
  });
};

export const searchProjectsWithPagination = async (filters = {}, batchSize = 30, batchNumber = 1) => {
  try {
    console.log(`배치 ${batchNumber} 검색 시작:`, { filters, batchSize, batchNumber });

    const searchKey = generateSearchKey(filters);
    
    // 새로운 검색인 경우 커서 초기화
    if (currentSearchKey !== searchKey) {
      currentSearchKey = searchKey;
      batchCursors = {};
      console.log('새로운 검색 - 커서 초기화');
    }

    // GitHub API 사용 가능한 경우
    if (isGitHubApiAvailable()) {
      try {
        // 해당 배치의 커서 찾기
        let cursor = null;
        
        if (batchNumber > 1) {
          cursor = batchCursors[batchNumber - 1];
          if (!cursor) {
            throw new Error(`배치 ${batchNumber}의 커서를 찾을 수 없습니다. 이전 배치를 먼저 로드해주세요.`);
          }
        }
        
        console.log(`GitHub API 호출 - 배치 ${batchNumber}, 커서:`, cursor ? cursor.substring(0, 20) + '...' : 'null');
        
        // GitHub API 호출
        const apiResult = await searchProjects(filters, cursor);
        
        if (!apiResult || !apiResult.projects) {
          throw new Error('GitHub API에서 데이터를 가져올 수 없습니다.');
        }

        // 다음 배치 커서 저장
        if (apiResult.pageInfo && apiResult.pageInfo.hasNextPage) {
          batchCursors[batchNumber] = apiResult.pageInfo.endCursor;
        }

        // 배치 정보 계산
        const hasMoreBatches = apiResult.pageInfo?.hasNextPage || false;
        
        console.log(`GitHub API 배치 ${batchNumber} 완료:`, {
          projectCount: apiResult.projects.length,
          hasMoreBatches,
          nextCursor: hasMoreBatches ? apiResult.pageInfo.endCursor.substring(0, 20) + '...' : 'none'
        });

        return {
          projects: apiResult.projects,
          totalCount: apiResult.totalCount,
          batchInfo: {
            batchNumber,
            batchSize,
            totalBatches: -1, // GitHub API에서는 정확한 총 배치 수를 알 수 없음
            hasMoreBatches,
            startIndex: (batchNumber - 1) * batchSize,
            endIndex: (batchNumber - 1) * batchSize + apiResult.projects.length,
            actualBatchSize: apiResult.projects.length,
            usingGitHubAPI: true
          }
        };
        
      } catch (error) {
        console.warn(`GitHub API 배치 ${batchNumber} 로딩 실패, Mock 데이터로 대체:`, error);
        // GitHub API 실패시 Mock 데이터로 폴백
      }
    }

    // Mock 데이터 사용 (GitHub API 미사용 또는 실패시)
    console.log('Mock 데이터 사용');
    const allResults = await searchProjectsService(filters);
    
    if (!allResults || !allResults.projects) {
      return {
        projects: [],
        totalCount: 0,
        batchInfo: {
          batchNumber,
          batchSize,
          totalBatches: 0,
          hasMoreBatches: false,
          startIndex: 0,
          endIndex: 0,
          actualBatchSize: 0,
          usingGitHubAPI: false
        }
      };
    }

    // 전체 결과에서 해당 배치의 데이터 추출 (Mock 데이터용)
    const allProjects = allResults.projects;
    const totalProjects = allProjects.length;
    const totalBatches = Math.ceil(totalProjects / batchSize);
    
    // 배치 인덱스 계산
    const startIndex = (batchNumber - 1) * batchSize;
    const endIndex = Math.min(startIndex + batchSize, totalProjects);
    const batchProjects = allProjects.slice(startIndex, endIndex);
    
    const hasMoreBatches = batchNumber < totalBatches;
    
    console.log(`Mock 데이터 배치 ${batchNumber} 검색 완료:`, {
      totalProjects,
      totalBatches,
      currentBatchSize: batchProjects.length,
      hasMoreBatches,
      startIndex,
      endIndex
    });

    return {
      projects: batchProjects,
      totalCount: totalProjects,
      batchInfo: {
        batchNumber,
        batchSize,
        totalBatches,
        hasMoreBatches,
        startIndex,
        endIndex,
        actualBatchSize: batchProjects.length,
        usingGitHubAPI: false
      }
    };

  } catch (error) {
    console.error(`배치 ${batchNumber} 검색 실패:`, error);
    
    return {
      projects: [],
      totalCount: 0,
      batchInfo: {
        batchNumber,
        batchSize,
        totalBatches: 0,
        hasMoreBatches: false,
        startIndex: 0,
        endIndex: 0,
        actualBatchSize: 0,
        usingGitHubAPI: false
      },
      error: error.message
    };
  }
};

export const quickSearchProjects = async (query = '', batchSize = 30, batchNumber = 1) => {
  const filters = {
    query: query.trim(),
    sortBy: 'beginner-friendly'
  };
  
  return await searchProjectsWithPagination(filters, batchSize, batchNumber);
};
