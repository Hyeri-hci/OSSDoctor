export { 
  searchProjects, 
  getRepositoryActivity, 
  getContributorStats, 
  getRecommendedProjects 
} from './github-api.js';

export { 
  searchProjectsService, 
  getRecommendedProjectsService, 
  getRepositoryActivityService, 
  getContributorStatsService 
} from './project-service.js';

// API 상태 확인 유틸리티
export const checkApiStatus = () => {
  const hasToken = !!import.meta.env.VITE_GITHUB_TOKEN;
  return {
    hasGitHubToken: hasToken,
    apiMode: hasToken ? 'live' : 'mock'
  };
};
