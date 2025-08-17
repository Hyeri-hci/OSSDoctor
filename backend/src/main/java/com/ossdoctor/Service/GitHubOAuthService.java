package com.ossdoctor.Service;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

import java.util.List;

/**
 * GitHub OAuth 관련 비즈니스 로직을 담당하는 서비스
 * 주요 기능:
 * - GitHub access token 요청
 * - GitHub 사용자 정보 조회
 * - GitHub OAuth 설정 검증
 */
@Slf4j
@Service
public class GitHubOAuthService {

    // GitHub OAuth 설정값 주입
    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;

    // GitHub OAuth 설정 검증
    public void validateOAuthConfiguration() {
        if (clientId == null || clientSecret == null) {
            throw new RuntimeException("GitHub OAuth configuration is missing");
        }
    }

    // GitHub access token 요청
    public String getAccessToken(String code) throws Exception {
        RestTemplate restTemplate = new RestTemplate();

        // 요청 파라미터 설정
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);

        log.info("GitHub OAuth 토큰 교환 시작 - Code: {}", code != null ? "[PRESENT]" : "[MISSING]");
        log.debug("Client ID: {}", clientId);
        log.debug("Client Secret 길이: {}", clientSecret != null ? clientSecret.length() : "null");
        log.debug("요청 URL: https://github.com/login/oauth/access_token");

        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            // GitHub OAuth 서버에 토큰 요청
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://github.com/login/oauth/access_token", request, String.class);

            log.info("GitHub OAuth 응답 성공 - 상태: {}", response.getStatusCode());
            log.debug("GitHub OAuth 응답 헤더: {}", response.getHeaders());
            log.debug("GitHub OAuth 응답 본문: {}", response.getBody());

            String responseBody = response.getBody();
            return parseAccessToken(responseBody);

        } catch (Exception e) {
            log.error("GitHub OAuth 토큰 교환 실패", e);
            log.error("오류 상세 정보 - 타입: {}, 메시지: {}",
                    e.getClass().getSimpleName(), e.getMessage());
            if (e.getCause() != null) {
                log.error("근본 원인: {}", e.getCause().getMessage());
            }
            throw new RuntimeException("GitHub OAuth token request failed: " + e.getMessage(), e);
        }
    }

    // GitHub API로 사용자 정보 조회
    public JSONObject getUserInfo(String accessToken) throws Exception {
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
        JSONObject userJson = new JSONObject(responseBody);

        // 필수 필드 검증
        if (!userJson.has("login") || !userJson.has("id")) {
            throw new RuntimeException("Required user information is missing");
        }

        return userJson;
    }

    // GitHub 응답에서 access token 파싱
    private String parseAccessToken(String responseBody) {
        String accessToken = null;

        // JSON 형식인지 확인
        if (responseBody.trim().startsWith("{")) {
            try {
                JSONObject jsonResponse = new JSONObject(responseBody);
                if (jsonResponse.has("access_token")) {
                    accessToken = jsonResponse.getString("access_token");
                }
            } catch (Exception e) {
                // JSON 파싱 실패 시 URL 인코딩 형식으로 처리
            }
        }

        // URL 인코딩 형식으로 파싱 (access_token=xxx&scope=xxx&token_type=xxx)
        if (accessToken == null) {
            String[] responseParams = responseBody.split("&");
            for (String param : responseParams) {
                String[] keyValue = param.split("=");
                if (keyValue.length == 2 && "access_token".equals(keyValue[0])) {
                    accessToken = keyValue[1];
                    break;
                }
            }
        }

        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("Access token not found in GitHub response: " + responseBody);
        }

        return accessToken;
    }
}
