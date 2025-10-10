import { useState, useCallback } from 'react';
import { diagnoseRepository, parseGitHubUrl } from '../../../utils/api-client';

/**
 * 진단 기능을 위한 커스텀 훅
 */
export const useDiagnose = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [projectData, setProjectData] = useState(null);
    const [fullProjectName, setFullProjectName] = useState('');

    /**
     * Backend의 취약점 데이터를 Frontend 형식으로 변환
     */
    const transformVulnerabilityData = useCallback((vulnerabilities) => {
        if (!vulnerabilities || vulnerabilities.length === 0) {
            return [];
        }

        return vulnerabilities.map(vuln => ({
            id: vuln.cveId || 'N/A',
            title: vuln.cveId || 'Unknown Vulnerability',
            severity: vuln.severity ? vuln.severity.toLowerCase() : 'unknown',
            cvss: 'N/A', // Backend에서 제공하지 않는 경우
            status: vuln.fixed ? 'fixed' : 'open',
            date: vuln.detectedAt ? new Date(vuln.detectedAt).toISOString().split('T')[0] : 'N/A',
            description: vuln.description || 'No description available',
            versions: [], // Backend에서 제공하지 않는 경우
            technicalDetails: null, // Backend에서 제공하지 않는 경우
            mitigation: null // Backend에서 제공하지 않는 경우
        }));
    }, []);

    /**
     * 진단 결과 데이터를 프론트엔드 형식으로 변환
     */
    const transformDiagnosisData = useCallback((diagnosisResult) => {
        const repositoryData = diagnosisResult.repository;
        const contributorsData = diagnosisResult.contributors || [];
        const scoresData = diagnosisResult.scores;
        const vulnerabilitiesData = diagnosisResult.vulnerabilities || [];

        // 취약점 데이터 변환
        const transformedVulnerabilities = transformVulnerabilityData(vulnerabilitiesData);

        return {
            // 저장소 기본 정보
            owner: repositoryData.owner,
            name: repositoryData.name,
            fullName: `${repositoryData.owner}/${repositoryData.name}`,
            description: repositoryData.description,
            language: repositoryData.language,
            stars: repositoryData.star || repositoryData.stars,
            forks: repositoryData.fork || repositoryData.forks,
            watchers: repositoryData.watchers,
            contributors: contributorsData,
            totalContributors: repositoryData.totalContributors,

            // 추가 데이터
            languages: diagnosisResult.languages || {},
            commitActivities: diagnosisResult.commitActivities || [],
            recentActivities: diagnosisResult.recentActivities || [],

            // 날짜 정보
            createdAt: repositoryData.createdAt,
            updatedAt: repositoryData.lastUpdatedAt,
            pushedAt: repositoryData.lastCommitedAt,

            // 활동 정보
            commits: {
                total: repositoryData.totalCommits || 0
            },
            pullRequests: {
                open: repositoryData.openPullRequests || 0,
                merged: repositoryData.mergedPullRequests || 0,
                total: (repositoryData.openPullRequests || 0) + (repositoryData.mergedPullRequests || 0)
            },
            issues: {
                open: repositoryData.openIssues || 0,
                closed: repositoryData.closedIssues || 0,
                total: (repositoryData.openIssues || 0) + (repositoryData.closedIssues || 0)
            },

            // 추가 정보
            totalPullRequests: repositoryData.totalPullRequests || 0,
            mergedPullRequests: repositoryData.mergedPullRequests || 0,
            closedIssues: repositoryData.closedIssues || 0,
            totalIssues: repositoryData.totalIssues || 0,
            topics: repositoryData.topics || [],
            license: repositoryData.license,

            // 점수 정보
            scores: scoresData,

            // 보안 취약점 정보
            security: {
                vulnerabilities: transformedVulnerabilities
            }
        };
    }, [transformVulnerabilityData]);

    /**
     * 저장소 진단 실행
     */
    const handleSearch = useCallback(async (inputValue) => {
        if (!inputValue || inputValue.trim() === '') {
            setError('GitHub Repository URL 또는 owner/name 형식으로 입력해주세요.');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            // GitHub URL 파싱
            const parseResult = parseGitHubUrl(inputValue.trim());

            if (!parseResult) {
                setError('유효한 GitHub Repository URL 또는 owner/name 형식으로 입력해주세요.');
                setIsLoading(false);
                return;
            }

            const { owner, repo } = parseResult;
            const fullProjectName = `${owner}/${repo}`;
            setFullProjectName(fullProjectName);

            // 실제 API 호출
            const diagnosisResult = await diagnoseRepository(owner, repo);

            // Nodata 체크 (활동이 없는 repository)
            if (diagnosisResult.Nodata !== undefined) {
                setError('해당 저장소는 아직 활동이 없습니다.');
                setProjectData(null);
                setIsLoading(false);
                return;
            }

            // 데이터 변환 및 설정
            const transformedData = transformDiagnosisData(diagnosisResult);
            setProjectData(transformedData);

        } catch (error) {
            console.error('❌ 진단 중 오류:', error);

            // 사용자 친화적 에러 메시지
            if (error.message?.includes('404')) {
                setError('저장소를 찾을 수 없습니다. GitHub Repository URL을 확인해주세요.');
            } else if (error.message?.includes('403')) {
                setError('GitHub API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.');
            } else if (error.message?.includes('500')) {
                setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            } else {
                setError('진단 중 오류가 발생했습니다. 다시 시도해주세요.');
            }

        } finally {
            setIsLoading(false);
        }
    }, [transformDiagnosisData]);

    /**
     * 상태 초기화
     */
    const resetState = useCallback(() => {
        setProjectData(null);
        setError('');
        setFullProjectName('');
    }, []);

    return {
        isLoading,
        error,
        projectData,
        fullProjectName,
        handleSearch,
        resetState
    };
};
