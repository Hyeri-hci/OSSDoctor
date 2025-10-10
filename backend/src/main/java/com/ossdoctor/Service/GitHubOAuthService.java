package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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



        // 요청 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        try {
            // GitHub OAuth 서버에 토큰 요청
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://github.com/login/oauth/access_token", request, String.class);

            log.info("GitHub OAuth 응답 성공");

            String responseBody = response.getBody();
            return parseAccessToken(responseBody);

        } catch (Exception e) {
            log.error("GitHub OAuth 토큰 교환 실패", e);
            throw new RuntimeException("GitHub OAuth token request failed: " + e.getMessage(), e);
        }
    }

    // GitHub API로 사용자 정보 조회
    public JsonNode getUserInfo(String accessToken) throws Exception {
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
        ObjectMapper mapper = new ObjectMapper();
        JsonNode userJson = mapper.readTree(responseBody);

        // 필수 필드 검증
        if (!userJson.has("login") || !userJson.has("id")) {
            throw new RuntimeException("Required user information is missing");
        }

        return userJson;
    }

    // GitHub 응답에서 access token 파싱
    private String parseAccessToken(String responseBody) {
        String accessToken = null;
        ObjectMapper mapper = new ObjectMapper();

        // JSON 형식인지 확인
        if (responseBody.trim().startsWith("{")) {
            try {
                JsonNode jsonResponse = mapper.readTree(responseBody);
                if (jsonResponse.has("access_token")) {
                    accessToken = jsonResponse.get("access_token").asText();
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
