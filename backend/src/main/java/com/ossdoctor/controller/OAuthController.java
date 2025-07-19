package com.ossdoctor.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.List;

@RestController
public class OAuthController {
    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;

    @GetMapping("/oauth/callback")
    public ResponseEntity<?> githubCallback(@RequestParam("code") String code) {
        System.out.println("코드 잘 받았다." + code);

        // 깃허브 access token 요청 (폼 데이터 전송)
        RestTemplate restTemplate = new RestTemplate();

        // URL-encoded 형식으로 바디 세팅
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);

        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED); // 반드시 form으로!
        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));         // 응답 json 기대

        HttpEntity<MultiValueMap<String, String>> tokenRequest =
                new HttpEntity<>(params, tokenHeaders);

        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token",
                tokenRequest,
                String.class
        );

        System.out.println("Access Token 응답: " + response.getBody());

        // 여기서 원하는 후속 처리 가능 (예: access_token 파싱)
        // ... (optionally access_token 추출해서 저장, 로그 등)

        // 리다이렉트 응답
        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(URI.create("http://localhost:5173")); // 프론트 주소
        return ResponseEntity.status(HttpStatus.FOUND)
                .headers(redirectHeaders)
                .build();
    }
}
