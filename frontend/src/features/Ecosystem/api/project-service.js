import { searchProjects, getRepositoryActivity, getContributorStats, getRecommendedProjects } from './backend-api.js';
import { ALL_PROJECTS, MOCK_PROJECTS } from '../mockData/mockData.js';

// API 사용 가능 여부 확인 (항상 true, 백엔드가 처리)
const isApiAvailable = () => {
  return true;
};

// Mock 데이터 API 응답 형식으로 변환 
const transformMockToApiFormat = (mockProjects) => {
  return mockProjects.map(mockProject => {
    const project = {
      id: mockProject.id.toString(),
      name: mockProject.name,
      owner: mockProject.owner || 'mock',
      fullName: mockProject.owner ? `${mockProject.owner}/${mockProject.name}` : `mock/${mockProject.name.toLowerCase().replace(/\s+/g, '-')}`,
      description: mockProject.description,
      url: mockProject.html_url || `https://github.com/${mockProject.owner || 'mock'}/${mockProject.name}`,
      html_url: mockProject.html_url || `https://github.com/${mockProject.owner || 'mock'}/${mockProject.name}`,
      stars: typeof mockProject.stars === 'string' ? 
        parseInt(mockProject.stars.replace(/[^\d]/g, '')) : mockProject.stars,
      forks: typeof mockProject.forks === 'string' ? 
        parseInt(mockProject.forks.replace(/[^\d]/g, '')) : mockProject.forks,
      language: mockProject.language || mockProject.tech,
      languageColor: getLanguageColor(mockProject.language || mockProject.tech),
      license: mockProject.license || 'MIT',
      licenseId: mockProject.license || 'MIT',
      lastCommit: mockProject.lastCommit,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: mockProject.lastCommit + 'T00:00:00Z',
      imageUrl: null,
      topics: mockProject.topics || [],
      goodFirstIssues: mockProject.goodFirstIssues || Math.floor(Math.random() * 20) + 1,
      openPullRequests: Math.floor(Math.random() * 50) + 1,
      latestRelease: null,
      latestReleaseDate: null
    };
    
    // Mock 데이터에 이미 difficulty가 있으면 우선 사용, 없으면 동적 계산
    project.difficulty = mockProject.difficulty || calculateProjectDifficulty(project);
    
    return project;
  });
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

// 종합적인 난이도 계산 시스템
const calculateProjectDifficulty = (project) => {
  let beginnerScore = 0;
  let advancedScore = 0;
  
  // 1. Good First Issues 기반 점수
  const goodFirstIssues = project.goodFirstIssues || 0;
  if (goodFirstIssues >= 5) beginnerScore += 30;
  else if (goodFirstIssues >= 3) beginnerScore += 20;
  else if (goodFirstIssues >= 1) beginnerScore += 10;
  else advancedScore += 15; // Good First Issues가 없으면 진입장벽 높음
  
  // 2. 프로젝트 규모 기반 점수
  const stars = typeof project.stars === 'number' ? project.stars : 
    parseInt(String(project.stars || 0).replace(/[^\d]/g, '')) || 0;
  const forks = typeof project.forks === 'number' ? project.forks : 
    parseInt(String(project.forks || 0).replace(/[^\d]/g, '')) || 0;
  
  // 적당한 인기도는 초보자 친화적 (커뮤니티 활성화 + 복잡도 적당)
  if (stars >= 100 && stars <= 5000) beginnerScore += 25;
  else if (stars > 5000 && stars <= 15000) beginnerScore += 15;
  else if (stars > 15000) advancedScore += 20; // 너무 큰 프로젝트는 복잡
  else if (stars < 100) advancedScore += 10; // 너무 작으면 문서화/안정성 부족
  
  // Fork 비율 (활발한 기여 문화 지표)
  if (stars > 0 && forks > 0) {
    const forkRatio = forks / stars;
    if (forkRatio >= 0.1 && forkRatio <= 0.3) beginnerScore += 20; // 적절한 기여 문화
    else if (forkRatio > 0.3) beginnerScore += 10; // 매우 활발한 기여
  }
  
  // 3. 토픽 기반 점수
  const topics = project.topics || [];
  const topicsString = topics.join(' ').toLowerCase();
  
  // 초보자 친화적 토픽들
  const beginnerTopics = [
    'tutorial', 'beginner', 'starter', 'learning', 'education', 'simple', 'easy',
    'first-time', 'good-first-issue', 'beginner-friendly', 'documentation',
    'example', 'demo', 'guide', 'howto', 'introduction'
  ];
  
  // 고급 토픽들
  const advancedTopics = [
    'kubernetes', 'docker', 'microservices', 'distributed-systems', 'blockchain',
    'machine-learning', 'deep-learning', 'ai', 'compiler', 'kernel', 'low-level',
    'performance', 'optimization', 'scalability', 'architecture', 'enterprise',
    'cryptography', 'security', 'networking', 'database-engine', 'operating-system'
  ];
  
  beginnerTopics.forEach(topic => {
    if (topicsString.includes(topic)) beginnerScore += 15;
  });
  
  advancedTopics.forEach(topic => {
    if (topicsString.includes(topic)) advancedScore += 15;
  });
  
  // 4. 설명 기반 점수
  const description = (project.description || '').toLowerCase();
  
  // 초보자 친화적 키워드
  const beginnerKeywords = [
    'beginner', 'starter', 'tutorial', 'learning', 'simple', 'easy',
    'introduction', 'guide', 'example', 'demo', 'first', 'basic'
  ];
  
  // 고급 키워드
  const advancedKeywords = [
    'advanced', 'complex', 'enterprise', 'production', 'scalable', 'performance',
    'optimization', 'distributed', 'microservice', 'architecture', 'framework',
    'sophisticated', 'professional'
  ];
  
  beginnerKeywords.forEach(keyword => {
    if (description.includes(keyword)) beginnerScore += 10;
  });
  
  advancedKeywords.forEach(keyword => {
    if (description.includes(keyword)) advancedScore += 10;
  });
  
  // 5. 프로그래밍 언어 기반 보정
  const language = (project.language || '').toLowerCase();
  const beginnerLanguages = ['html', 'css', 'javascript', 'python', 'go'];
  const advancedLanguages = ['rust', 'c++', 'c', 'assembly', 'haskell', 'scala'];
  
  if (beginnerLanguages.includes(language)) beginnerScore += 10;
  if (advancedLanguages.includes(language)) advancedScore += 15;
  
  // 최종 난이도 결정
  const totalScore = beginnerScore + advancedScore;
  const beginnerRatio = totalScore > 0 ? beginnerScore / totalScore : 0;
  
  if (beginnerRatio >= 0.7 || (goodFirstIssues >= 5 && beginnerRatio >= 0.5)) {
    return 'Beginner';
  } else if (beginnerRatio >= 0.4 || (goodFirstIssues >= 1 && beginnerRatio >= 0.3)) {
    return 'Intermediate';
  } else {
    return 'Advanced';
  }
};

// 난이도별 필터링 및 정렬 공통 함수
const applyDifficultyFiltering = (projects, sortBy) => {
  if (sortBy === 'easy-contribution') {
    // 쉬운 기여만 실제 필터링 적용
    const filtered = projects
      .filter(project => {
        const stars = project.stars || 0;
        const gfi = project.goodFirstIssues || 0;
        
        // 초보자 조건: Good First Issues가 3개 이상이거나 작은 프로젝트
        const isEasy = gfi >= 3 || stars < 5000;
        return isEasy;
      })
      .sort((a, b) => {
        const aGFI = a.goodFirstIssues || 0;
        const bGFI = b.goodFirstIssues || 0;
        if (aGFI !== bGFI) return bGFI - aGFI;
        return (b.stars || 0) - (a.stars || 0);
      });
    return filtered;
  } else if (sortBy === 'good-first-issues') {
    // Good First Issues 개수순 정렬
    const sorted = projects
      .sort((a, b) => {
        const aGFI = a.goodFirstIssues || 0;
        const bGFI = b.goodFirstIssues || 0;
        if (aGFI !== bGFI) return bGFI - aGFI; // GFI 많은 순
        return (b.stars || 0) - (a.stars || 0); // 동점일 때 stars 순
      });
    return sorted;
  } else if (sortBy === 'updated') {
    // 최근 업데이트순: GFI 3개 이상인 프로젝트만 + 업데이트순 정렬
    const filtered = projects
      .filter(project => {
        const gfi = project.goodFirstIssues || 0;
        const hasEnoughGFI = gfi >= 3;
        return hasEnoughGFI;
      })
      .sort((a, b) => {
        // 업데이트 날짜순 정렬 (최근 것부터)
        const aUpdated = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const bUpdated = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return bUpdated - aUpdated;
      });
    return filtered;
  } else {
    // 기본 정렬 (기존 로직 유지)
    return projects;
  }
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
    if (isApiAvailable()) {
      try {
        const apiResult = await searchProjects(filters);
        
        // 백엔드 API 응답 구조 처리
        if (apiResult && apiResult.search && apiResult.search.edges) {
          const transformedProjects = apiResult.search.edges.map(edge => {
            const repo = edge.node;
            const project = {
              id: repo.id,
              name: repo.name,
              owner: { login: repo.owner.login },  // 기존 구조 유지
              fullName: repo.nameWithOwner,
              description: repo.description,
              url: repo.url,
              html_url: repo.url,
              stars: repo.stargazerCount,
              stargazers_count: repo.stargazerCount,  // 기존 필드명 유지
              forks: repo.forkCount,
              forks_count: repo.forkCount,  // 기존 필드명 유지
              language: repo.primaryLanguage?.name || null,
              tech: repo.primaryLanguage?.name || null,  // 기존 필드명 유지
              languageColor: getLanguageColor(repo.primaryLanguage?.name),
              license: repo.licenseInfo?.name || null,
              licenseId: repo.licenseInfo?.spdxId || null,
              lastCommit: repo.updatedAt?.split('T')[0] || null,  // YYYY-MM-DD 형식으로 변환
              updated_at: repo.updatedAt,
              pushed_at: repo.pushedAt,
              createdAt: repo.createdAt,
              updatedAt: repo.updatedAt,
              imageUrl: repo.owner.avatarUrl,
              topics: repo.repositoryTopics?.nodes?.map(topic => topic.topic.name) || [],
              goodFirstIssues: repo.issues?.totalCount || 0,
              openPullRequests: Math.floor(Math.random() * 20) + 1,
              latestRelease: null,
              latestReleaseDate: null
            };
            
            // 동적 난이도 계산 적용
            project.difficulty = calculateProjectDifficulty(project);
            
            return project;
          });

          // 난이도별 필터링 및 정렬 적용
          let finalProjects = applyDifficultyFiltering(transformedProjects, filters.sortBy);

          return {
            projects: finalProjects,
            totalCount: apiResult.search.repositoryCount || finalProjects.length,
            hasNextPage: apiResult.search.pageInfo?.hasNextPage || false,
            endCursor: apiResult.search.pageInfo?.endCursor || null
          };
        }
        
        return {
          projects: [],
          totalCount: 0,
          hasNextPage: false
        };
      } catch (error) {
        console.warn('GitHub API 호출 실패, Mock 데이터로 대체:', error);
      }
    }

    // Mock 데이터 사용
    const filteredMockProjects = filterMockProjects(MOCK_PROJECTS, filters);
    const transformedProjects = transformMockToApiFormat(filteredMockProjects);

    // 난이도별 필터링 및 정렬
    let finalProjects;
    
    // 공통 필터링 함수 사용
    finalProjects = applyDifficultyFiltering(transformedProjects, filters.sortBy);

    return {
      projects: finalProjects.slice(0, filters.limit || 50),
      totalCount: finalProjects.length,
      hasNextPage: finalProjects.length > (filters.limit || 50)
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
    if (isApiAvailable()) {
      try {
        let result;
        if (searchQuery) {
          result = await searchProjects({ 
            searchQuery,
            limit,
            sortBy: 'stars' 
          });
        } else {
          result = await getRecommendedProjects(limit, 'beginner-friendly');
        }
        
        // 백엔드 API 응답 구조 처리
        if (result && result.search && result.search.edges) {
          const transformedProjects = result.search.edges.map(edge => {
            const repo = edge.node;
            const project = {
              id: repo.id,
              name: repo.name,
              owner: { login: repo.owner.login },  // 기존 구조 유지
              fullName: repo.nameWithOwner,
              description: repo.description,
              url: repo.url,
              html_url: repo.url,
              stars: repo.stargazerCount,
              stargazers_count: repo.stargazerCount,  // 기존 필드명 유지
              forks: repo.forkCount,
              forks_count: repo.forkCount,  // 기존 필드명 유지
              language: repo.primaryLanguage?.name || null,
              tech: repo.primaryLanguage?.name || null,  // 기존 필드명 유지
              languageColor: getLanguageColor(repo.primaryLanguage?.name),
              license: repo.licenseInfo?.name || null,
              licenseId: repo.licenseInfo?.spdxId || null,
              lastCommit: repo.updatedAt?.split('T')[0] || null,  // YYYY-MM-DD 형식으로 변환
              updated_at: repo.updatedAt,
              pushed_at: repo.pushedAt,
              createdAt: repo.createdAt,
              updatedAt: repo.updatedAt,
              imageUrl: repo.owner.avatarUrl,
              topics: repo.repositoryTopics?.nodes?.map(topic => topic.topic.name) || [],
              goodFirstIssues: repo.issues?.totalCount || 0,
              openPullRequests: Math.floor(Math.random() * 20) + 1,
              latestRelease: null,
              latestReleaseDate: null
            };
            
            // 동적 난이도 계산 적용
            project.difficulty = calculateProjectDifficulty(project);
            
            return project;
          });

          return {
            projects: transformedProjects,
            totalCount: result.search.repositoryCount || transformedProjects.length,
            hasNextPage: result.search.pageInfo?.hasNextPage || false
          };
        }
        
        return { projects: [], totalCount: 0, hasNextPage: false };
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
    if (isApiAvailable()) {
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
    if (isApiAvailable()) {
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
      // 검색 실행
    const searchKey = generateSearchKey(filters);
    
    // 새로운 검색인 경우 커서 초기화
    if (currentSearchKey !== searchKey) {
      currentSearchKey = searchKey;
      batchCursors = {};
    }

    // GitHub API 사용 가능한 경우
    if (isApiAvailable()) {
      try {
        // 해당 배치의 커서 찾기
        let cursor = null;
        
        if (batchNumber > 1) {
          cursor = batchCursors[batchNumber - 1];
          if (!cursor) {
            throw new Error(`배치 ${batchNumber}의 커서를 찾을 수 없습니다. 이전 배치를 먼저 로드해주세요.`);
          }
        }
        
        // GitHub API 호출
        const apiResult = await searchProjects(filters, cursor);
        
        // 백엔드 API 응답 구조 처리
        let projects = [];
        let totalCount = 0;
        let pageInfo = null;
        
        if (apiResult && apiResult.search) {
          // GraphQL 구조 처리
          if (apiResult.search.edges) {
            projects = apiResult.search.edges.map(edge => {
              const repo = edge.node;
              const project = {
                id: repo.id,
                name: repo.name,
                owner: { login: repo.owner.login },
                fullName: repo.nameWithOwner,
                description: repo.description,
                url: repo.url,
                html_url: repo.url,
                stars: repo.stargazerCount,
                stargazers_count: repo.stargazerCount,
                forks: repo.forkCount,
                forks_count: repo.forkCount,
                language: repo.primaryLanguage?.name || null,
                tech: repo.primaryLanguage?.name || null,
                languageColor: getLanguageColor(repo.primaryLanguage?.name),
                license: repo.licenseInfo?.name || null,
                licenseId: repo.licenseInfo?.spdxId || null,
                lastCommit: repo.updatedAt?.split('T')[0] || null,
                updated_at: repo.updatedAt,
                pushed_at: repo.pushedAt,
                createdAt: repo.createdAt,
                updatedAt: repo.updatedAt,
                imageUrl: repo.owner.avatarUrl,
                topics: repo.repositoryTopics?.nodes?.map(topic => topic.topic.name) || [],
                goodFirstIssues: repo.issues?.totalCount || 0,
                openPullRequests: Math.floor(Math.random() * 20) + 1,
                latestRelease: null,
                latestReleaseDate: null
              };
              
              // 동적 난이도 계산 적용
              project.difficulty = calculateProjectDifficulty(project);
              
              return project;
            });
          }
          totalCount = apiResult.search.repositoryCount || 0;
          pageInfo = apiResult.search.pageInfo;
        }
        
        if (!projects || projects.length === 0) {
          throw new Error('GitHub API에서 데이터를 가져올 수 없습니다.');
        }

        // 난이도별 필터링 적용
        const filteredProjects = applyDifficultyFiltering(projects, filters.sortBy);

        // 다음 배치 커서 저장
        if (pageInfo && pageInfo.hasNextPage) {
          batchCursors[batchNumber] = pageInfo.endCursor;
        }

        // 배치 정보 계산
        const hasMoreBatches = pageInfo?.hasNextPage || false;

        return {
          projects: filteredProjects,
          totalCount: totalCount,
          batchInfo: {
            batchNumber,
            batchSize,
            totalBatches: -1, // GitHub API에서는 정확한 총 배치 수를 알 수 없음
            hasMoreBatches,
            startIndex: (batchNumber - 1) * batchSize,
            endIndex: (batchNumber - 1) * batchSize + filteredProjects.length,
            actualBatchSize: filteredProjects.length,
            usingGitHubAPI: true
          }
        };
        
      } catch (error) {
        console.warn(`GitHub API 배치 ${batchNumber} 로딩 실패, Mock 데이터로 대체:`, error);
        // GitHub API 실패시 Mock 데이터로 폴백
      }
    }

    // Mock 데이터 사용 (GitHub API 미사용 또는 실패시)
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
