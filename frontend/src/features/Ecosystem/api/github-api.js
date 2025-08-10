// GitHub GraphQL API 클라이언트
const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';
const GITHUB_REST_ENDPOINT = 'https://api.github.com/repos';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

// GraphQL API 호출 함수
const graphqlRequest = async (query, variables = {}) => {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token이 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    return null;
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  } catch (error) {
    console.error('GitHub GraphQL API 에러:', error);
    throw error;
  }
};

// REST API 호출 함수 
const restRequest = async (endpoint) => {
  if (!GITHUB_TOKEN) {
    console.warn('GitHub token이 설정되지 않았습니다. Mock 데이터를 사용합니다.');
    return null;
  }

  try {
    const response = await fetch(`${GITHUB_REST_ENDPOINT}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('GitHub REST API 에러:', error);
    throw error;
  }
};

// 시간 필터에 따른 날짜 범위 계산
const getDateRange = (timeFilter) => {
  const now = new Date();
  const ranges = {
    'day': new Date(now.getTime() - 24 * 60 * 60 * 1000),
    '1week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    'week': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
    '1month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    'month': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    '3months': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
    '6months': new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
    '1year': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    'year': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
    'anytime': null
  };
  
  return ranges[timeFilter] || null;
};

// 프로젝트 검색 GraphQL 쿼리 (페이지네이션 지원)
export const searchProjects = async (filters = {}, cursor = null) => {
  const {
    searchQuery = '',
    language = '',
    license = '',
    timeFilter = '', // 'day', 'week', 'month', '6months', 'year'
    sortBy = 'beginner-friendly', // 'beginner-friendly', 'good-first-issues', 'stars', 'updated', 'created'
    limit = 30
  } = filters;

  // 검색 조건 구성
  let searchTerms = [];
  
  // 기본 검색어 추가
  if (searchQuery) {
    searchTerms.push(searchQuery);
  }
  
  if (language) {
    searchTerms.push(`language:${language}`);
  }
  
  // 라이선스 필터링 - GitHub API에서 지원하는 정확한 라이선스 키 사용
  if (license) {
    // 라이선스 이름을 GitHub API에서 인식하는 키로 변환
    const licenseMap = {
      'MIT': 'mit',
      'Apache-2.0': 'apache-2.0',
      'GPL-3.0': 'gpl-3.0',
      'BSD-3-Clause': 'bsd-3-clause',
      'ISC': 'isc',
      'GPL-2.0': 'gpl-2.0',
      'LGPL-3.0': 'lgpl-3.0',
      'MPL-2.0': 'mpl-2.0'
    };
    
    const licenseKey = licenseMap[license] || license.toLowerCase();
    searchTerms.push(`license:${licenseKey}`);
  }

  // 시간 필터가 있으면 pushed 날짜 조건 추가
  if (timeFilter) {
    const sinceDate = getDateRange(timeFilter);
    if (sinceDate) {
      const dateString = sinceDate.toISOString().split('T')[0];
      searchTerms.push(`pushed:>=${dateString}`);
    }
  }

  // 초보자 친화적이고 좋은 라이브러리를 위한 조건
  // 스타 수: 너무 크지도 작지도 않은 적당한 크기 (1,000~50,000)
  if (!searchTerms.some(term => term.includes('stars:'))) {
    searchTerms.push('stars:1000..50000');
  }
  
  // 최근 6개월간 활발한 활동이 있는 프로젝트
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsAgoString = sixMonthsAgo.toISOString().split('T')[0];
  
  // 시간 필터가 없는 경우에만 기본 활동성 조건 추가
  if (!timeFilter) {
    // 최근 6개월간 push되었거나 업데이트된 프로젝트 (활발한 프로젝트)
    searchTerms.push(`pushed:>=${sixMonthsAgoString}`);
  }
  
  const searchString = searchTerms.join(' ');
  
  console.log('=== GitHub API 쿼리 생성 ===');
  console.log('개별 검색 조건들:', searchTerms);
  console.log('최종 검색 쿼리:', searchString);
  console.log('적용된 필터들:', { 
    검색어: searchQuery || '없음',
    언어: language || '없음', 
    라이선스: license || '없음',
    시간필터: timeFilter || '없음',
    정렬: sortBy 
  });

  const query = `
    query SearchRepositories($searchString: String!, $first: Int!, $after: String) {
      search(query: $searchString, type: REPOSITORY, first: $first, after: $after) {
        repositoryCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ... on Repository {
              id
              name
              nameWithOwner
              description
              url
              stargazerCount
              forkCount
              createdAt
              updatedAt
              pushedAt
              primaryLanguage {
                name
                color
              }
              licenseInfo {
                name
                spdxId
              }
              openGraphImageUrl
              repositoryTopics(first: 10) {
                nodes {
                  topic {
                    name
                  }
                }
              }
              issues(states: OPEN, labels: ["good first issue"], first: 1) {
                totalCount
              }
              recentIssues: issues(states: OPEN, first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                totalCount
                nodes {
                  createdAt
                }
              }
              allOpenIssues: issues(states: OPEN, first: 1) {
                totalCount
              }
              pullRequests(states: OPEN, first: 1) {
                totalCount
              }
              releases(first: 1, orderBy: {field: CREATED_AT, direction: DESC}) {
                nodes {
                  tagName
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    searchString,
    first: limit,
    after: cursor
  };

  try {
    const data = await graphqlRequest(query, variables);
    
    if (!data || !data.search) {
      throw new Error('검색 결과를 가져올 수 없습니다.');
    }

    console.log('GitHub API 원시 응답:', {
      repositoryCount: data.search.repositoryCount,
      actualResultCount: data.search.edges.length,
      searchString: searchString,
      filters
    });

    // 결과를 프론트엔드에서 사용하기 쉬운 형태로 변환
    const projects = data.search.edges.map(({ node }) => ({
      id: node.id,
      name: node.name,
      owner: node.nameWithOwner.split('/')[0],
      fullName: node.nameWithOwner,
      description: node.description || '설명이 없습니다.',
      url: node.url,
      html_url: node.url,
      stars: node.stargazerCount,
      forks: node.forkCount,
      language: node.primaryLanguage?.name || 'Unknown',
      languageColor: node.primaryLanguage?.color,
      license: node.licenseInfo?.name || 'No License',
      licenseId: node.licenseInfo?.spdxId,
      lastCommit: node.pushedAt,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      imageUrl: node.openGraphImageUrl,
      topics: node.repositoryTopics.nodes.map(({ topic }) => topic.name),
      goodFirstIssues: node.issues.totalCount,
      openPullRequests: node.pullRequests.totalCount,
      totalOpenIssues: node.allOpenIssues.totalCount,
      latestIssueDate: node.recentIssues.nodes[0]?.createdAt || null,
      latestRelease: node.releases.nodes[0]?.tagName || null,
      latestReleaseDate: node.releases.nodes[0]?.createdAt || null,
      difficulty: getAdvancedDifficultyLevel(node),
      activityStatus: getActivityStatus(node)
    }));

    // 초보자 친화적 난이도 판정 함수
    function getAdvancedDifficultyLevel(node) {
      const stars = node.stargazerCount;
      const goodFirstIssues = node.issues.totalCount;
      const forks = node.forkCount;
      const openIssues = node.allOpenIssues.totalCount;
      const hasDocumentation = node.repositoryTopics.nodes.some(t => 
        ['documentation', 'tutorial', 'learning', 'guide', 'beginner'].includes(t.topic.name)
      );
      
      // Beginner: 초보자에게 최적화된 프로젝트
      if (
        goodFirstIssues >= 3 || // Good First Issues 많음
        hasDocumentation || // 문서화/튜토리얼이 잘 되어 있음
        (stars >= 1000 && stars <= 10000 && openIssues >= 5 && forks >= 100) // 적당한 크기에 활발한 커뮤니티
      ) {
        return 'Beginner';
      }
      
      // Advanced: 대형 프로젝트이거나 복잡한 프로젝트
      if (
        stars > 30000 || // 매우 인기 있는 프로젝트
        forks > 5000 || // 매우 많이 포크된 프로젝트
        (goodFirstIssues === 0 && openIssues < 3) // 이슈가 거의 없어서 진입하기 어려움
      ) {
        return 'Advanced';
      }
      
      // Intermediate: 그 외 - 어느 정도 경험이 있으면 기여 가능
      return 'Intermediate';
    }

    // 활동 상태 판정 함수 (활성 프로젝트 중심으로 수정)
    function getActivityStatus(node) {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const lastPush = new Date(node.pushedAt);
      const lastUpdate = new Date(node.updatedAt);
      const hasRecentIssue = node.recentIssues.nodes[0] && 
        new Date(node.recentIssues.nodes[0].createdAt) > threeMonthsAgo;
      
      // 활성 프로젝트 기준으로 판정
      const isVeryActive = lastPush > threeMonthsAgo || lastUpdate > threeMonthsAgo || hasRecentIssue;
      const isActive = lastPush > sixMonthsAgo || lastUpdate > sixMonthsAgo;
      
      // 가장 최근 활동 날짜 찾기
      let lastActivityDate = lastPush;
      if (lastUpdate > lastActivityDate) lastActivityDate = lastUpdate;
      if (hasRecentIssue && new Date(node.recentIssues.nodes[0].createdAt) > lastActivityDate) {
        lastActivityDate = new Date(node.recentIssues.nodes[0].createdAt);
      }
      
      return {
        isActive: isActive,
        isVeryActive: isVeryActive,
        lastActivityDate: lastActivityDate,
        hasOpenIssues: node.allOpenIssues.totalCount > 0,
        daysSinceLastActivity: Math.floor((new Date() - lastActivityDate) / (1000 * 60 * 60 * 24)),
        activityLevel: isVeryActive ? 'very-active' : isActive ? 'active' : 'inactive'
      };
    }

    // 클라이언트 측에서 정렬 처리 (초보자 친화적 정렬 추가)
    const sortedProjects = [...projects].sort((a, b) => {
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
          // 같으면 전체 이슈 수로 정렬
          return b.totalOpenIssues - a.totalOpenIssues;
        }
        
        case 'recently-active': {
          // 최근 활동도순
          const activityScoreA = calculateActivityScore(a);
          const activityScoreB = calculateActivityScore(b);
          return activityScoreB - activityScoreA;
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

    // 초보자 친화도 점수 계산 함수
    function calculateBeginnerScore(project) {
      let score = 0;
      
      // Good First Issues 점수 (가장 중요)
      score += (project.goodFirstIssues || 0) * 10;
      
      // 난이도 점수
      if (project.difficulty === 'Beginner') score += 50;
      else if (project.difficulty === 'Intermediate') score += 20;
      
      // 활동성 점수
      if (project.activityStatus?.isVeryActive) score += 30;
      else if (project.activityStatus?.isActive) score += 15;
      
      // 적당한 크기 점수 (너무 크거나 작지 않은)
      if (project.stars >= 1000 && project.stars <= 10000) score += 20;
      else if (project.stars >= 500 && project.stars <= 50000) score += 10;
      
      // 오픈 이슈 점수 (기여 기회)
      if (project.totalOpenIssues > 0) score += Math.min(project.totalOpenIssues * 2, 30);
      
      return score;
    }

    // 최근 활동도 점수 계산 함수
    function calculateActivityScore(project) {
      let score = 0;
      
      if (project.activityStatus?.isVeryActive) score += 100;
      else if (project.activityStatus?.isActive) score += 50;
      
      // 최근 활동일수에 따른 점수
      const daysSince = project.activityStatus?.daysSinceLastActivity || 999;
      if (daysSince <= 7) score += 50;
      else if (daysSince <= 30) score += 30;
      else if (daysSince <= 90) score += 15;
      
      // 이슈와 PR 활동 점수
      score += Math.min((project.totalOpenIssues || 0) * 2, 30);
      score += Math.min((project.openPullRequests || 0) * 3, 30);
      
      return score;
    }

    console.log(`검색 결과: ${projects.length}개 프로젝트 발견`); // 디버그용
    console.log('라이선스 정보:', projects.map(p => ({ name: p.name, license: p.license })).slice(0, 5)); // 디버그용

    return {
      projects: sortedProjects,
      totalCount: data.search.repositoryCount,
      pageInfo: data.search.pageInfo,
      hasNextPage: data.search.pageInfo.hasNextPage
    };
  } catch (error) {
    console.error('프로젝트 검색 실패:', error);
    
    // GitHub API 에러 메시지 개선
    if (error.message.includes('GraphQL errors')) {
      throw new Error('GitHub API 검색 쿼리에 문제가 있습니다. 검색 조건을 확인해주세요.');
    } else if (error.message.includes('401')) {
      throw new Error('GitHub API 토큰이 유효하지 않습니다. 토큰을 확인해주세요.');
    } else if (error.message.includes('403')) {
      throw new Error('GitHub API 사용량 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
    } else {
      throw new Error(`검색 중 오류가 발생했습니다: ${error.message}`);
    }
  }
};

// 특정 저장소 최근 활동 정보 조회 (REST API 사용)
export const getRepositoryActivity = async (owner, repo) => {
  try {
    // 최근 커밋, 이슈, PR 정보를 병렬로 가져오기
    const [commits, issues, pullRequests] = await Promise.all([
      restRequest(`/${owner}/${repo}/commits?per_page=10`),
      restRequest(`/${owner}/${repo}/issues?state=open&per_page=10`),
      restRequest(`/${owner}/${repo}/pulls?state=open&per_page=10`)
    ]);

    return {
      recentCommits: commits?.slice(0, 5).map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      })) || [],
      openIssues: issues?.slice(0, 5).map(issue => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        createdAt: issue.created_at,
        labels: issue.labels.map(label => label.name),
        url: issue.html_url
      })) || [],
      openPullRequests: pullRequests?.slice(0, 5).map(pr => ({
        id: pr.id,
        number: pr.number,
        title: pr.title,
        createdAt: pr.created_at,
        author: pr.user.login,
        url: pr.html_url
      })) || []
    };
  } catch (error) {
    console.error('저장소 활동 정보 조회 실패:', error);
    throw error;
  }
};

// 프로젝트 기여 통계 조회
export const getContributorStats = async (owner, repo) => {
  try {
    const contributors = await restRequest(`/${owner}/${repo}/contributors?per_page=10`);
    
    return contributors?.map(contributor => ({
      login: contributor.login,
      avatarUrl: contributor.avatar_url,
      contributions: contributor.contributions,
      profileUrl: contributor.html_url
    })) || [];
  } catch (error) {
    console.error('기여자 통계 조회 실패:', error);
    return [];
  }
};

// 추천 프로젝트 목록 조회 (인기 있는 프로젝트)
export const getRecommendedProjects = async (language = '', limit = 12) => {
  const filters = {
    searchQuery: '', // 빈 검색어로 일반적인 인기 프로젝트 조회
    language: language,
    sortBy: 'stars',
    limit,
    timeFilter: 'month' // 최근 한달 내 업데이트된 프로젝트
  };

  try {
    return await searchProjects(filters);
  } catch (error) {
    console.error('추천 프로젝트 조회 실패:', error);
    throw error;
  }
};
