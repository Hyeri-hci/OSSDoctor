import { useState, useEffect } from 'react';
import { getMainRecommendedProjectsService } from '../services/mainProjectService';

const useMainRecommendedProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedProjects = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await getMainRecommendedProjectsService();
        setProjects(result.projects);
      } catch (err) {
        console.error('추천 프로젝트 로딩 실패:', err);
        setError('추천 프로젝트를 불러오는데 실패했습니다.');
        // 에러 발생시에도 기본 프로젝트 표시
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      try {
        const result = await getMainRecommendedProjectsService();
        setProjects(result.projects);
        setError(null);
      } catch (err) {
        console.error('추천 프로젝트 재로딩 실패:', err);
        setError('추천 프로젝트를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
  };
};

export default useMainRecommendedProjects;