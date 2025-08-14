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
        console.log(`🌐 API 호출: ${options.method || 'GET'} ${url}`);

        const response = await fetch(url, defaultOptions);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`✅ API 응답:`, data);

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
