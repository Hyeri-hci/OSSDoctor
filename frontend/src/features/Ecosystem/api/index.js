// 백엔드를 통한 API 서비스들만 export
export { 
  searchProjectsService, 
  getRecommendedProjectsService, 
  getRepositoryActivityService, 
  getContributorStatsService 
} from './project-service.js';

// API 상태 확인 유틸리티
export const checkApiStatus = () => {
  return {
    hasGitHubToken: false, // 백엔드에서 처리하므로 항상 false
    apiMode: 'backend' // 백엔드 모드로 고정
  };
};
