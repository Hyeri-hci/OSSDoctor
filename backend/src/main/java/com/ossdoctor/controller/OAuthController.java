package com.ossdoctor.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

import com.ossdoctor.model.UserInfo;

/**
 * GitHub OAuth 인증 및 JWT 토큰 관리를 담당하는 컨트롤러
 *
 * 주요 기능:
 * - GitHub OAuth 로그인 콜백 처리
 * - JWT 토큰 생성 및 쿠키 저장
 * - 로그인 상태 확인
 * - 로그아웃 처리
 */
@RestController
public class OAuthController {

    // GitHub OAuth 설정값 주입
    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;

    // JWT 서명용 시크릿 키 (최소 256비트/32바이트 이상)
    @Value("${jwt.secret.key}")
    private String jwtSecret;

    // 프론트엔드 URL (환경에 따라 변경)
    @Value("${app.frontend.url}")
    private String frontendUrl;

    /**
     * GitHub OAuth 콜백 처리 엔드포인트
     *
     * GitHub 로그인 완료 후 authorization code를 받아
     * access token 발급 → 사용자 정보 조회 → JWT 생성 → 쿠키 저장 → 프론트엔드 리다이렉트
     */
    @GetMapping("/oauth/callback")
    public ResponseEntity<?> githubCallback(@RequestParam("code") String code) {
        try {
            // 1. JWT 시크릿 키 검증
            if (jwtSecret == null || jwtSecret.isEmpty()) {
                throw new RuntimeException("JWT secret key is not configured");
            }

            // 2. GitHub OAuth 설정 검증
            if (clientId == null || clientSecret == null) {
                throw new RuntimeException("GitHub OAuth configuration is missing");
            }

            // 3. JWT 키 생성 및 만료시간 설정
            Key jwtkey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + 3600000); // 1시간

            // 4. GitHub에 access token 요청
            String accessToken = getGithubAccessToken(code);

            // 5. access token으로 사용자 정보 조회
            JSONObject userJson = getGithubUserInfo(accessToken);

            // 6. 사용자 정보로 JWT 생성
            String jwt = createJwtToken(userJson, jwtkey, now, expiryDate);

            // 7. JWT를 HTTP-only 쿠키로 설정
            ResponseCookie jwtCookie = createAuthCookie(jwt);

            // 8. 프론트엔드로 성공 리다이렉트
            String nickname = userJson.getString("login");
            HttpHeaders redirectHeaders = new HttpHeaders();
            redirectHeaders.setLocation(URI.create(frontendUrl + "/?auth=success&user=" +
                    URLEncoder.encode(nickname, StandardCharsets.UTF_8)));
            redirectHeaders.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());

            return ResponseEntity.status(HttpStatus.FOUND)
                    .headers(redirectHeaders)
                    .build();

        } catch (Exception e) {
            // 에러 발생 시 프론트엔드로 에러 리다이렉트 (URL 인코딩 적용)
            HttpHeaders redirectHeaders = new HttpHeaders();
            String errorMessage = URLEncoder.encode(e.getMessage(), StandardCharsets.UTF_8);
            redirectHeaders.setLocation(URI.create(frontendUrl + "/?auth=error&message=" + errorMessage));

            return ResponseEntity.status(HttpStatus.FOUND)
                    .headers(redirectHeaders)
                    .build();
        }
    }

    /**
     * 현재 로그인 상태 확인 API
     *
     * 요청의 auth_token 쿠키를 검증하여 로그인 여부와 사용자 정보 반환
     */
    @GetMapping("/auth/status")
    public Map<String, Object> getAuthStatus(HttpServletRequest request) {
        String jwtToken = getCookieValue(request, "auth_token");

        if (jwtToken != null && isValidJWT(jwtToken)) {
            UserInfo user = extractUserFromJWT(jwtToken);

            if (user != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("isLoggedIn", true);
                response.put("user", user);
                return response;
            }
        }

        // 로그인되지 않은 상태
        Map<String, Object> response = new HashMap<>();
        response.put("isLoggedIn", false);
        response.put("user", null);
        return response;
    }

    /**
     * 로그아웃 처리 API
     *
     * auth_token 쿠키를 만료시켜 로그아웃 처리
     */
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        // 쿠키 만료 (maxAge = 0)
        ResponseCookie expiredCookie = ResponseCookie.from("auth_token", "")
                .httpOnly(true)
                .secure(false)  // 프로덕션에서는 true로 변경
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, expiredCookie.toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(Map.of("message", "Logout successful"));
    }

    // ==================== Private Helper Methods ====================

    /**
     * GitHub에 access token 요청
     */
    private String getGithubAccessToken(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // 요청 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        // GitHub OAuth 서버에 토큰 요청
        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token", request, String.class);

        String responseBody = response.getBody();
        if (responseBody == null) {
            throw new RuntimeException("GitHub OAuth response is null");
        }

        JSONObject jsonResponse = new JSONObject(responseBody);
        if (!jsonResponse.has("access_token")) {
            throw new RuntimeException("Access token not found in GitHub response");
        }

        return jsonResponse.getString("access_token");
    }

    /**
     * GitHub API로 사용자 정보 조회
     */
    private JSONObject getGithubUserInfo(String accessToken) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // GitHub API 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.set("Accept", "application/vnd.github+json");
        headers.set("Authorization", "Bearer " + accessToken);
        headers.set("X-GitHub-Api-Version", "2022-11-28");

        HttpEntity<String> request = new HttpEntity<>(headers);

        // GitHub API로 사용자 정보 요청
        ResponseEntity<String> response = restTemplate.exchange(
                "https://api.github.com/user", HttpMethod.GET, request, String.class);

        String responseBody = response.getBody();
        if (responseBody == null) {
            throw new RuntimeException("GitHub user response is null");
        }

        JSONObject userJson = new JSONObject(responseBody);

        // 필수 필드 검증
        if (!userJson.has("login") || !userJson.has("id")) {
            throw new RuntimeException("Required user information is missing");
        }

        return userJson;
    }

    /**
     * 사용자 정보로 JWT 토큰 생성
     */
    private String createJwtToken(JSONObject userJson, Key jwtkey, Date now, Date expiryDate) {
        String nickname = userJson.getString("login");
        int userId = userJson.getInt("id");
        String avatarUrl = userJson.optString("avatar_url", "");
        String bio = userJson.optString("bio", "");

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("nickname", nickname)
                .claim("avatar_url", avatarUrl)
                .claim("bio", bio)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtkey, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * JWT용 HTTP-only 쿠키 생성
     */
    private ResponseCookie createAuthCookie(String jwt) {
        return ResponseCookie.from("auth_token", jwt)
                .httpOnly(true)
                .secure(false)  // 로컬 개발용, 프로덕션에서는 HTTPS 사용 시 true로 변경
                .path("/")
                .maxAge(3600)   // 1시간
                .sameSite("Lax")
                .build();
    }

    /**
     * JWT에서 사용자 정보 추출
     */
    private UserInfo extractUserFromJWT(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            var claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            return new UserInfo(
                    Integer.parseInt(claims.getSubject()),
                    (String) claims.get("nickname"),
                    (String) claims.get("avatar_url"),
                    (String) claims.get("bio")
            );
        } catch (Exception e) {
            return null; // JWT 파싱 실패 시 null 반환
        }
    }

    /**
     * 요청에서 특정 쿠키 값 추출
     */
    private String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;

        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(cookieName)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    /**
     * JWT 토큰 유효성 검사
     */
    private boolean isValidJWT(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
