import PropTypes from 'prop-types';

// 프로젝트 기본 정보 타입
export const ProjectType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    lastCommit: PropTypes.string,
    stars: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    forks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    tech: PropTypes.string,
    language: PropTypes.string
});

// 상세 프로젝트 정보 타입
export const DetailedProjectType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    lastCommit: PropTypes.string,
    language: PropTypes.string,
    stars: PropTypes.string,
    forks: PropTypes.string,
    issues: PropTypes.string,
    license: PropTypes.string,
    difficulty: PropTypes.oneOf(['Beginner', 'Intermediate', 'Advanced']),
    topics: PropTypes.arrayOf(PropTypes.string),
    goodFirstIssues: PropTypes.number
});

// 리더보드 사용자 타입
export const LeaderboardUserType = PropTypes.shape({
    rank: PropTypes.number.isRequired,
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    totalScore: PropTypes.number.isRequired,
    prCount: PropTypes.number,
    issueCount: PropTypes.number,
    commitsCount: PropTypes.number,
    contributionStreak: PropTypes.number,
    joinDate: PropTypes.string
});

// 필터 옵션 타입
export const FilterOptionsType = PropTypes.shape({
    languages: PropTypes.arrayOf(PropTypes.string),
    licenses: PropTypes.arrayOf(PropTypes.string),
    difficulties: PropTypes.arrayOf(PropTypes.string),
    topics: PropTypes.arrayOf(PropTypes.string)
});

// 프로젝트 검색 결과 타입
export const SearchResultType = PropTypes.shape({
    projects: PropTypes.arrayOf(DetailedProjectType),
    total: PropTypes.number,
    page: PropTypes.number,
    hasMore: PropTypes.bool
});

// 리더보드 데이터 타입
export const LeaderboardDataType = PropTypes.shape({
    realtime: PropTypes.arrayOf(LeaderboardUserType),
    week: PropTypes.arrayOf(LeaderboardUserType),
    month: PropTypes.arrayOf(LeaderboardUserType)
});

// 에코시스템 뷰 타입
export const EcosystemViewType = PropTypes.oneOf(['main', 'ecosystem', 'leaderboard']);

// 시간 기간 타입
export const TimePeriodType = PropTypes.oneOf(['realtime', 'week', 'month']);
