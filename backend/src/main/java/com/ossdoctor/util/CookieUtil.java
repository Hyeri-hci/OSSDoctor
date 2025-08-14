package com.ossdoctor.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseCookie;

/**
 * HTTP 쿠키 관련 유틸리티 클래스
 * 주요 기능:
 * - 인증 쿠키 생성
 * - 쿠키 값 추출
 * - 쿠키 만료 처리
 */
public class CookieUtil {

    // JWT용 HttP-only 쿠키 생성
    public static ResponseCookie createAuthCookie(String jwt) {
        return ResponseCookie.from("auth_token", jwt)
                .httpOnly(true)
                .secure(false)  // 로컬 개발용, 프로덕션에서는 HTTPS 사용 시 true로 변경
                .path("/")
                .maxAge(3600)   // 1시간
                .sameSite("Lax")
                .build();
    }

    // 쿠키 만료용 응답 쿠키 생성 (로그아웃 시 사용)
    public static ResponseCookie createExpiredAuthCookie() {
        return ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(false)  // 프로덕션에서는 true로 변경
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
    }

    // 요청에서 특정 쿠키 값 추출
    public static String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(cookieName)) {
                return cookie.getValue();
            }
        }
        return null;
    }
}
