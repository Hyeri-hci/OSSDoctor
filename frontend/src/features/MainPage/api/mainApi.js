const API_BASE_URL = '/api/main';

// API 요청 함수
const apiRequest = async (endpoint) => {
  try {
    const url = new URL(endpoint, window.location.origin);
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Main API 에러:', error);
    throw error;
  }
};

// 메인 페이지용 추천 프로젝트 조회 (3개)
export const getMainRecommendedProjects = async () => {
  const data = await apiRequest(`${API_BASE_URL}/recommended-projects`);
  
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