import { getMainRecommendedProjects } from '../api';

// 언어별 색상 매핑 (Ecosystem과 동일)
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

// GraphQL 응답을 컴포넌트에서 사용할 형식으로 변환
const transformProjectData = (repo) => {
  return {
    id: repo.id,
    name: repo.name,
    owner: repo.owner.login,
    fullName: repo.nameWithOwner,
    description: repo.description,
    url: repo.url,
    html_url: repo.url,
    stars: repo.stargazerCount,
    forks: repo.forkCount,
    language: repo.primaryLanguage?.name || null,
    languageColor: getLanguageColor(repo.primaryLanguage?.name),
    license: repo.licenseInfo?.name || null,
    lastCommit: repo.updatedAt?.split('T')[0] || null,
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
    imageUrl: repo.owner.avatarUrl,
    topics: repo.repositoryTopics?.nodes?.map(topic => topic.topic.name) || [],
    goodFirstIssues: repo.issues?.totalCount || 0,
    openPullRequests: Math.floor(Math.random() * 20) + 1,
    // RecommendedProjectsSection에서 기대하는 PropTypes 형식에 맞춤
    issues: repo.issues?.totalCount?.toString() || '0'
  };
};

// 메인 페이지 추천 프로젝트 서비스
export const getMainRecommendedProjectsService = async () => {
  try {
    // GraphQL API 사용 시도
    const result = await getMainRecommendedProjects();
    
    if (result && result.search && result.search.edges) {
      const transformedProjects = result.search.edges.map(edge => {
        return transformProjectData(edge.node);
      });

      return {
        projects: transformedProjects,
        totalCount: result.search.repositoryCount || transformedProjects.length
      };
    }
    
    // 백엔드 API 실패시 기본값 반환
    return {
      projects: [],
      totalCount: 0
    };
    
  } catch (error) {
    console.error('메인 페이지 추천 프로젝트 서비스 에러:', error);
    
    // API 실패시 기본 추천 프로젝트 반환
    return {
      projects: [
        {
          name: "React",
          description: "A declarative, efficient, and flexible JavaScript library for building user interfaces.",
          lastCommit: "2023-10-01",
          language: "JavaScript",
          stars: "210k",
          forks: "45k",
          issues: "1.2k",
        },
        {
          name: "Vue.js",
          description: "The Progressive JavaScript Framework for building user interfaces.",
          lastCommit: "2023-09-28",
          language: "TypeScript",
          stars: "200k",
          forks: "40k",
          issues: "800",
        },
        {
          name: "TensorFlow",
          description: "An end-to-end open source platform for machine learning.",
          lastCommit: "2023-09-30",
          language: "Python",
          stars: "170k",
          forks: "90k",
          issues: "5k",
        }
      ],
      totalCount: 3
    };
  }
};