/**
 * 인증 상태 모니터링 유틸리티
 * 서버 연결이 끊어졌을 때 자동으로 로그아웃 처리
 * 서버 재시작 감지 기능 추가
 */

import { checkAuthStatus } from './github-auth';

let authCheckInterval = null;
let isMonitoring = false;
let lastKnownServerStartTime = null;

/**
 * 서버 재시작 감지를 위한 서버 상태 확인
 * @returns {Promise<boolean>} 서버가 재시작되었는지 여부
 */
const checkServerRestart = async () => {
    try {
        const backendUrl = import.meta.env.VITE_BACKEND_API_URL;
        if (!backendUrl) {
            return false;
        }

        const response = await fetch(`${backendUrl}/api/server/status`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const serverStatus = await response.json();
            const currentServerStartTime = serverStatus.serverStartTime;
            
            // 첫 번째 호출이거나 서버 시작 시간이 같으면 재시작 아님
            if (lastKnownServerStartTime === null) {
                lastKnownServerStartTime = currentServerStartTime;
                return false;
            }
            
            // 서버 시작 시간이 다르면 재시작됨
            if (lastKnownServerStartTime !== currentServerStartTime) {
                console.log('서버 재시작 감지:', {
                    이전: new Date(lastKnownServerStartTime),
                    현재: new Date(currentServerStartTime)
                });
                lastKnownServerStartTime = currentServerStartTime;
                return true;
            }
            
            return false;
        } else {
            // 서버 상태 API 호출 실패
            return false;
        }
    } catch (error) {
        console.error('서버 재시작 감지 중 오류:', error);
        return false;
    }
};

/**
 * 강제로 인증 쿠키 삭제하는 함수
 * 서버 연결 실패시 클라이언트에서 직접 쿠키를 삭제
 */
const forceDeleteAuthCookie = () => {
    // 여러 방법으로 쿠키 삭제 시도
    const cookieNames = ['auth_token'];
    const domains = [window.location.hostname, `.${window.location.hostname}`, 'localhost', '.localhost'];
    const paths = ['/', '/auth', '/oauth'];
    
    cookieNames.forEach(cookieName => {
        // 기본 삭제
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        
        // 다양한 도메인과 경로 조합으로 삭제 시도
        domains.forEach(domain => {
            paths.forEach(path => {
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; domain=${domain}`;
                document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
            });
        });
    });
    
    console.log('인증 쿠키 강제 삭제 완료');
};

/**
 * 주기적으로 인증 상태를 체크하는 모니터링 시작
 * @param {number} intervalMs - 체크 주기 (밀리초, 기본값: 30초)
 * @param {Function} onAuthLost - 인증 상실시 호출할 콜백 함수
 */
export const startAuthMonitoring = (intervalMs = 30000, onAuthLost = null) => {
    if (isMonitoring) {
        console.log('인증 모니터링이 이미 실행 중입니다');
        return;
    }
    
    console.log(`인증 상태 모니터링 시작 (${intervalMs/1000}초 주기)`);
    isMonitoring = true;
    
    authCheckInterval = setInterval(async () => {
        try {
            // 1. 서버 재시작 감지
            const serverRestarted = await checkServerRestart();
            if (serverRestarted) {
                console.log('서버 재시작으로 인한 자동 로그아웃 처리');
                
                // 쿠키 강제 삭제
                forceDeleteAuthCookie();
                
                // 모니터링 중단
                stopAuthMonitoring();
                
                // 콜백 함수 호출
                if (onAuthLost && typeof onAuthLost === 'function') {
                    onAuthLost({
                        serverRestarted: true,
                        serverError: false,
                        isLoggedIn: false,
                        error: '서버가 재시작되어 세션이 만료되었습니다'
                    });
                }
                
                // 보호된 페이지에서 메인 페이지로 리다이렉트
                const protectedPaths = ['/myactivity'];
                const currentPath = window.location.pathname;
                
                if (protectedPaths.some(path => currentPath.includes(path))) {
                    console.log('보호된 페이지에서 서버 재시작 감지 - 메인 페이지로 이동');
                    window.location.href = '/?auth=server_restarted';
                }
                
                return;
            }
            
            // 2. 일반적인 인증 상태 확인
            const authStatus = await checkAuthStatus();
            
            // 서버 연결 실패 또는 인증 만료 감지
            if (authStatus.serverError || (!authStatus.isLoggedIn && !authStatus.serverError)) {
                console.log('인증 상실 감지 - 자동 로그아웃 처리');
                
                // 모니터링 중단
                stopAuthMonitoring();
                
                // 콜백 함수 호출 (옵션)
                if (onAuthLost && typeof onAuthLost === 'function') {
                    onAuthLost(authStatus);
                }
                
                // 현재 페이지가 보호된 페이지인지 확인하고 메인 페이지로 리다이렉트
                const protectedPaths = ['/myactivity'];
                const currentPath = window.location.pathname;
                
                if (protectedPaths.some(path => currentPath.includes(path))) {
                    console.log('보호된 페이지에서 인증 상실 - 메인 페이지로 이동');
                    window.location.href = '/?auth=session_expired';
                }
            }
        } catch (error) {
            console.error('인증 상태 모니터링 중 오류:', error);
        }
    }, intervalMs);
};

/**
 * 인증 상태 모니터링 중단
 */
export const stopAuthMonitoring = () => {
    if (authCheckInterval) {
        clearInterval(authCheckInterval);
        authCheckInterval = null;
    }
    isMonitoring = false;
    lastKnownServerStartTime = null; // 서버 시작 시간 초기화
    console.log('인증 상태 모니터링 중단');
};

/**
 * 현재 모니터링 상태 확인
 * @returns {boolean} 모니터링 실행 여부
 */
export const isAuthMonitoringActive = () => {
    return isMonitoring;
};