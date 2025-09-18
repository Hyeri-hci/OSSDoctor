const API_BASE_URL = '/api/ecosystem';

// API 요청 함수
const apiRequest = async (endpoint, params = {}) => {
  try {
    const url = new URL(endpoint, window.location.origin);
    
    // 파라미터를 URL에 추가
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Backend API 에러:', error);
    throw error;
  }
};

// 프로젝트 검색 (페이지네이션 지원)
export const searchProjects = async (filters = {}, cursor = null) => {
  const params = {
    searchQuery: filters.searchQuery || '',
    language: filters.language || '',
    license: filters.license || '',
    timeFilter: filters.timeFilter || '',
    sortBy: filters.sortBy || 'beginner-friendly',
    limit: filters.limit || 30
  };

  if (cursor) {
    params.cursor = cursor;
  }

  const data = await apiRequest(`${API_BASE_URL}/search`, params);
  
  if (data && data.search) {
    return {
      search: {
        repositoryCount: data.search.repositoryCount,
        pageInfo: data.search.pageInfo,
        edges: data.search.nodes.map(node => ({ node }))
      }
    };
  }
  
  return data;
};

// 저장소 활동 정보 조회
export const getRepositoryActivity = async (owner, name, timeFilter = 'week') => {
  const data = await apiRequest(`${API_BASE_URL}/repository/${owner}/${name}/activity`, {
    timeFilter
  });
  
  return data;
};

// 컨트리뷰터 통계 조회
export const getContributorStats = async (owner, name, timeFilter = 'month') => {
  const data = await apiRequest(`${API_BASE_URL}/repository/${owner}/${name}/contributors`, {
    timeFilter
  });
  
  return data;
};

// 추천 프로젝트 조회
export const getRecommendedProjects = async (count = 10, category = 'beginner-friendly') => {
  const data = await apiRequest(`${API_BASE_URL}/recommended`, {
    count,
    category
  });
  
  if (data && data.search) {
    return {
      search: {
        repositoryCount: data.search.repositoryCount,
        edges: data.search.nodes.map(node => ({ node }))
      }
    };
  }
  
  return data;
};
