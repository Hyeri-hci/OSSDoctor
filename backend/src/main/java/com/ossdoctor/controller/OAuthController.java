package com.ossdoctor.controller;

import jakarta.servlet.http.HttpServletRequest;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;

import com.ossdoctor.model.UserInfo;
import com.ossdoctor.Service.UserService;
import com.ossdoctor.Service.JwtService;
import com.ossdoctor.Service.GitHubOAuthService;
import com.ossdoctor.DTO.UserDTO;
import com.ossdoctor.util.CookieUtil;
import org.springframework.beans.factory.annotation.Autowired;

@RestController
public class OAuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private GitHubOAuthService gitHubOAuthService;

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
            // 1. 설정값 검증
            jwtService.validateJwtSecret();
            gitHubOAuthService.validateOAuthConfiguration();

            // 2. JWT 키 생성 및 만료시간 설정
            Date now = new Date();
            Date expiryDate = new Date(now.getTime() + 3600000); // 1시간

            // 3. GitHub에 access token 요청
            String accessToken = gitHubOAuthService.getAccessToken(code);

            // 4. access token으로 사용자 정보 조회
            JSONObject userJson = gitHubOAuthService.getUserInfo(accessToken);

            // 5. 사용자 정보를 데이터베이스에 저장 또는 업데이트
            UserDTO savedUser = userService.saveOrUpdateUserFromGithub(userJson);
            System.out.println("사용자 정보 DB 저장 완료: " + savedUser.getNickname());

            // 6. 사용자 정보로 JWT 생성
            String jwt = jwtService.createJwtToken(userJson, now, expiryDate);

            // 7. JWT를 HTTP-only 쿠키로 설정
            ResponseCookie jwtCookie = CookieUtil.createAuthCookie(jwt);

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

    // 현재 로그인 상태 확인 API (요청의 auth_token 쿠키 검증하여 로그인 여부와 사용자 정보 반환)
    @GetMapping("/auth/status")
    public Map<String, Object> getAuthStatus(HttpServletRequest request) {
        String jwtToken = CookieUtil.getCookieValue(request, "auth_token");

        if (jwtToken != null && jwtService.isValidJWT(jwtToken)) {
            UserInfo user = jwtService.extractUserFromJWT(jwtToken);

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

    // 로그아웃 처리 API (auth_token 쿠키 만료시켜 로그아웃 처리)
    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        // 쿠키 만료 (maxAge = 0)
        ResponseCookie expiredCookie = CookieUtil.createExpiredAuthCookie();

        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, expiredCookie.toString());

        return ResponseEntity.ok()
                .headers(headers)
                .body(Map.of("message", "Logout successful"));
    }
}
