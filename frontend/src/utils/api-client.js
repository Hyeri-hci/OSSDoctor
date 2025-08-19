// API 클라이언트 유틸리티
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8080';

/**
 * API 요청을 위한 기본 fetch 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션
 * @returns {Promise} API 응답
 */
export const apiClient = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        credentials: 'include', // 쿠키 포함
        ...options,
    };

    try {
        // 개발 환경에서만 로깅
        if (import.meta.env.DEV) {
            console.log(`🌐 API 호출: ${options.method || 'GET'} ${url}`);
        }

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // 개발 환경에서만 로깅
        if (import.meta.env.DEV) {
            console.log(`✅ API 응답:`, data);
        }

        return data;
    } catch (error) {
        console.error(`❌ API 에러 (${url}):`, error);
        throw error;
    }
};

/**
 * GET 요청
 */
export const get = (endpoint) => apiClient(endpoint);

/**
 * POST 요청
 */
export const post = (endpoint, data) => apiClient(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
});

/**
 * PUT 요청
 */
export const put = (endpoint, data) => apiClient(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
});

/**
 * DELETE 요청
 */
export const deleteRequest = (endpoint) => apiClient(endpoint, {
    method: 'DELETE',
});

/**
 * 백엔드 상태 확인
 */
export const checkBackendHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}`, {
            credentials: 'include'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// ========== 진단 관련 API ==========

/**
 * 저장소 진단 - 전체 진단 정보 (저장소 정보 + 점수)
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @returns {Promise<Object>} 진단 결과
 */
export const diagnoseRepository = async (owner, repo) => {
    return get(`/api/diagnose/${owner}/${repo}`);
};

/**
 * 저장소 기본 정보만 조회 (점수 계산 없이)
 * @param {string} owner - 저장소 소유자
 * @param {string} repo - 저장소 이름
 * @returns {Promise<Object>} 저장소 정보
 */
export const getRepositoryInfo = async (owner, repo) => {
    return get(`/api/diagnose/${owner}/${repo}/info`);
};

/**
 * GitHub 저장소 URL에서 owner와 repo 추출
 * @param {string} url - GitHub 저장소 URL
 * @returns {Object} {owner, repo} 또는 null
 */
export const parseGitHubUrl = (url) => {
    if (!url) return null;

    // GitHub URL 패턴들 처리
    const patterns = [
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/.*)?$/i,
        /^([^\/]+)\/([^\/]+)$/  // owner/repo 형태
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return {
                owner: match[1],
                repo: match[2]
            };
        }
    }

    return null;
};
