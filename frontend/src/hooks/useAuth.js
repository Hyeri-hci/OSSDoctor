import { useState, useCallback } from 'react';
import {
    checkAuthStatus,
    logout
} from '../utils/github-auth';

/** * 사용자 인증 상태를 관리하는 커스텀 훅
 * @returns {Object} 인증 상태와 관련된 함수들
 * @param {boolean} isAuthenticated - 로그인 여부
 * @param {Object|null} user - 사용자 정보 (로그인하지 않은 경우 null)
 * @param {boolean} isLoading - 인증 상태 로딩 여부
 * @param {string|null} error - 오류 메시지 (로그인 실패 시)
 * @param {Function} checkAuthStatus - 인증 상태를 확인하는 함수
 * @param {Function} handleLogin - 로그인 처리를 수행하는 함수
 * @param {Function} handleLogout - 로그아웃을 수행하는 함수
 * @param {Function} refreshUser - 인증 상태를 새로 고치는 함수
 */

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // 초기에는 로딩 상태가 아님
    const [error, setError] = useState(null);


    const loadUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            const authStatus = await checkAuthStatus();

            if (authStatus.isLoggedIn && authStatus.user) {
                setIsAuthenticated(true);
                setUser(authStatus.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
            setError('Failed to check authentication status');

            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** 
     * 로그인 처리 함수 (OAuth 콜백 후 상태 업데이트)
     * @param {Object} authResult - OAuth 인증 결과 (백엔드에서 반환된 사용자 정보)
     * 
     * - authResult가 유효한 경우, 사용자 정보 설정
     * - authResult가 유효하지 않은 경우, 백엔드에서 상태 다시 확인
     */
    const handleLogin = useCallback(async (authResult = null) => {
        try {
            setIsLoading(true);
            setError(null);

            if (authResult && authResult.user) {
                // OAuth 콜백에서 전달받은 사용자 정보로 직접 설정
                console.log('OAuth 콜백에서 받은 사용자 정보로 로그인 처리:', authResult.user);
                setIsAuthenticated(true);
                setUser(authResult.user);
            } else {
                // 백엔드에서 현재 인증 상태 확인
                console.log('백엔드에서 현재 인증 상태 확인 중...');
                const authStatus = await checkAuthStatus();
                
                if (authStatus.isLoggedIn && authStatus.user) {
                    console.log('백엔드 인증 상태 확인 성공:', authStatus.user);
                    setIsAuthenticated(true);
                    setUser(authStatus.user);
                } else {
                    console.log('백엔드 인증 상태 확인 결과: 로그인되지 않음');
                    setIsAuthenticated(false);
                    setUser(null);
                    
                    if (authStatus.error) {
                        setError(authStatus.error);
                    }
                }
            }
        } catch (error) {
            console.error('Login processing failed:', error);
            setError(error.message || 'Login failed, please try again');
            setIsAuthenticated(false);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** * 로그아웃 처리 함수
     * 모든 인증 상태를 초기화하고, 메인 페이지로 리다이렉트
     */
    const handleLogout = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            await logout();

            setIsAuthenticated(false);
            setUser(null);
            window.location.href = '/'; // 메인 페이지로 리다이렉트
        } catch (error) {
            console.error('Logout failed:', error);
            setError('Logout failed, please try again');
        } finally {
            setIsLoading(false);
        }
    }, []);

    /** * 인증 상태를 새로 고치는 함수
     * - 로그인 상태에서 현재 인증 상태를 다시 확인하고, 사용자 정보를 업데이트 & 프론트 상태 동기화
     */
    const refreshUser = useCallback(async () => {
        if(!isAuthenticated) return;

        try {
            setIsLoading(true);
            setError(null);

            const authStatus = await checkAuthStatus();

            if (authStatus.isLoggedIn && authStatus.user) {
                setIsAuthenticated(true);
                setUser(authStatus.user);
            } else {
                setIsAuthenticated(false);
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to refresh authentication:', error);
            setError('Failed to refresh authentication status');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    return {
        isAuthenticated,
        user,
        isLoading,
        error,
        checkAuthStatus: loadUserData,
        handleLogin,
        handleLogout,
        refreshUser
    };
};