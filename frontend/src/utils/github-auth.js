/**
 * @param {Object} options - 인증 옵션
 * @param {string} options.state - CSRF 공격 방지를 위한 상태 값 (보안용 랜덤 문자열)
 * @param {string} options.redirectAfterLogin - 로그인 후 이동할 페이지 경로
 */

export const initiateGitHubLogin = (options = {}) => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;

    if (!clientId) {
        console.error('GitHub Client ID가 설정되지 않았습니다. .env 파일을 확인하세요.');
        console.error('GitHub OAuth Application을 생성하고 VITE_GITHUB_CLIENT_ID 환경 변수를 설정해야 합니다.');
        throw new Error('GitHub Client ID가 설정되지 않았습니다.');
    }

    if (!redirectUri) {
        console.error('GitHub Redirect URI가 설정되지 않았습니다. .env 파일을 확인하세요.');
        console.error('이 주소는 GitHub에서 로그인 완료 후 사용자를 보낼 URI입니다.');
        console.error('예시: VITE_GITHUB_REDIRECT_URI=http://localhost:8080/oauth/callback');
        throw new Error('GitHub Redirect URI가 설정되지 않았습니다.');
    }

    const {
        scope = 'read:user,user:email,public_repo', // 기본 권한 범위: 사용자 정보 읽기, 저장소 접근, 이메일 읽기
        state = generateRandomState(), // CSRF 방지를 위한 랜덤 문자열
        redirectAfterLogin = null, // 로그인 후 이동할 페이지
    } = options;

    // 로그인 후 리다이렉션할 페이지를 sessionStorage에 저장
    if (redirectAfterLogin) {
        sessionStorage.setItem('redirectAfterLogin', redirectAfterLogin);
    }

    const authUrl = new URL('https://github.com/login/oauth/authorize');

    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scope);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('allow_signup', 'true'); // GitHub 계정이 없는 사용자도 GitHub 가입 후 바로 로그인 가능

    // 확인용 로그 출력
    console.log('GitHub 로그인 시작: ', {
        clientId,
        redirectUri,
        scope,
        state,
        authUrl: authUrl.toString(),
    });

    // GitHub 로그인 페이지로 리다이렉트
    window.location.href = authUrl.toString();
};

/** * CSRF 공격 방지를 위한 랜덤 문자열 생성
 * @returns {string} 32자리 16진수 랜덤 문자열 (예: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6')
 */

const generateRandomState = () => {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/** * GitHub 로그인 후 상태 검증
 *
 * @returns {Promise<Object>} 로그인 상태와 사용자 정보
 * - isLoggedIn: {boolean} - 로그인 여부
 * - user: {Object|null} - 사용자 정보 (로그인하지 않은 경우 null)
 * - error: {string|null} - 오류 메시지 (로그인 실패 시)
 */
export const checkAuthStatus = async () => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
        if (!backendUrl) {
            return {
                isLoggedIn: false,
                user: null,
                error: null,
            };
        }

        const response = await fetch(`${backendUrl}/auth/status`, {
            method: 'GET',
            credentials: 'include', // 쿠키를 포함하여 요청
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();

            return {
                isLoggedIn: data.isLoggedIn || false,
                user: data.user || null,
                ...data,
            };
        } else {
            console.error('로그인 상태 확인 실패:', response.status, response.statusText);
            return {
                isLoggedIn: false,
                user: null,
            };
        }
    } catch (error) {
        console.error('로그인 상태 확인 중 오류 발생:', error);
        return {
            isLoggedIn: false,
            user: null,
            error: error.message || '알 수 없는 오류 발생',
        };
    }
};

/** * GitHub 로그아웃
 * @returns {Promise<boolean>} 로그아웃 성공 여부
 */
export const logout = async () => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
        if (!backendUrl) {
            window.location.href = '/';
            return true;
        }

        const response = await fetch(`${backendUrl}/auth/logout`, {
            method: 'POST',
            credentials: 'include', // 쿠키를 포함하여 요청
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            window.location.href = '/';
            return true;
        } else {
            window.location.href = '/';
            return false;
        }
    } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        window.location.href = '/';
        return false;
    }
};