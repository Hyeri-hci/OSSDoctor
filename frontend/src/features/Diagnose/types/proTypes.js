import PropTypes from 'prop-types';

export const ProjectDataType = PropTypes.shape({
    // 기본 정보
    name: PropTypes.string,
    description: PropTypes.string,
    url: PropTypes.string,

    // 통계
    stats: PropTypes.shape({
        stars: PropTypes.number,
        forks: PropTypes.number,
        watchers: PropTypes.number
    }),

    // 커밋 정보
    commits: PropTypes.shape({
        totalCommits: PropTypes.number,
        lastCommit: PropTypes.string,
        commitsByWeek: PropTypes.object,
        recentCommits: PropTypes.arrayOf(PropTypes.shape({
            message: PropTypes.string,
            author: PropTypes.string,
            date: PropTypes.string
        }))
    }),

    // Pull Request 정보
    pullRequests: PropTypes.shape({
        open: PropTypes.number,
        closed: PropTypes.number,
        merged: PropTypes.number,
        recentPRs: PropTypes.arrayOf(PropTypes.shape({
            title: PropTypes.string,
            author: PropTypes.string,
            createdAt: PropTypes.string
        }))
    }),

    // Issue 정보
    issues: PropTypes.shape({
        open: PropTypes.number,
        closed: PropTypes.number
    }),

    // 언어 정보
    languages: PropTypes.object,

    // 기여자 정보
    contributors: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string,
        contributions: PropTypes.number
    })),

    // 활동 정보
    activity: PropTypes.shape({
        recentPRs: PropTypes.number
    }),

    // 점수 정보
    scores: PropTypes.shape({
        overall: PropTypes.number,
        health: PropTypes.number,
        security: PropTypes.number,
        activity: PropTypes.number,
        popularity: PropTypes.number
    }),

    // 보안 정보
    security: PropTypes.shape({
        vulnerabilities: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string,
            title: PropTypes.string,
            severity: PropTypes.string,
            status: PropTypes.string,
            date: PropTypes.string,
            description: PropTypes.string
        }))
    })
});

/**
 * CVE 데이터 타입 정의
 */
export const CVEType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    severity: PropTypes.string.isRequired,
    cvss: PropTypes.string,
    status: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    description: PropTypes.string,
    versions: PropTypes.arrayOf(PropTypes.string),
    technicalDetails: PropTypes.string,
    mitigation: PropTypes.string
});

/**
 * 활동 데이터 타입 정의
 */
export const ActivityType = PropTypes.shape({
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired
});

/**
 * 차트 데이터 타입 정의
 */
export const ChartDataType = PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string
}));