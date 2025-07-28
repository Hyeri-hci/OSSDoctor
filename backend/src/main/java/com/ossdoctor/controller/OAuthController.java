package com.ossdoctor.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.Cookie;
import org.json.JSONObject;
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
import java.util.Map;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

import java.security.Key;
import java.util.Date;

import com.ossdoctor.model.UserInfo;

@RestController
public class OAuthController {
    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String clientId;
    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String clientSecret;
    @Value("${jwt.secret.key}")
    private String jwtSecret;

    @GetMapping("/oauth/callback")
    public ResponseEntity<?> githubCallback(@RequestParam("code") String code) {
        Key jwtkey = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        // 세션 유지 시간
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + 3600000);

        // 깃허브 access token 요청 (폼 데이터 전송)
        RestTemplate restTemplate = new RestTemplate();

        // URL-encoded 형식으로 바디 세팅
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("code", code);

        // Access Token 발급을 위한 헤더 정보
        HttpHeaders tokenHeaders = new HttpHeaders();
        tokenHeaders.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        tokenHeaders.setAccept(List.of(MediaType.APPLICATION_JSON));

        // HttpEntity 생성
        HttpEntity<MultiValueMap<String, String>> tokenRequest =
                new HttpEntity<>(params, tokenHeaders);

        // 위에서 생성한 HttpEntity를 아래의 url로 전달해서 결과를 받아온다. 결과에는 access token이 있다.
        ResponseEntity<String> oauthResponse = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token",
                tokenRequest,
                String.class
        );

        // 결과를 JSONObject로 받아오기
        String oauthResult = oauthResponse.getBody();
        JSONObject jsonObject = new JSONObject(oauthResult);

        // JSONObjec에서 access token을 확인해서 저장하기
        String accessToken = jsonObject.get("access_token").toString();

        // 사용자 정보 조회를 위한 헤더
        HttpHeaders userheaders = new HttpHeaders();
        userheaders.set("Accept", "application/vnd.github+json");
        userheaders.set("Authorization", "Bearer " + accessToken);
        userheaders.set("X-GitHub-Api-Version", "2022-11-28");

        // 사용자 정보 조회를 위한 엔티티
        HttpEntity<String> entity = new HttpEntity<>(userheaders);
        RestTemplate userRestTemplate = new RestTemplate();
        ResponseEntity<String> userResponse = userRestTemplate.exchange(
                "https://api.github.com/user",
                HttpMethod.GET,
                entity,
                String.class
        );

        String userResult = userResponse.getBody();

        // 유저 정보로 JWT 생성하기
        JSONObject userJson = new JSONObject(userResult);
        String nickname = userJson.getString("login");
        String jwt = Jwts.builder()
                .setSubject(String.valueOf(userJson.getInt("id")))
                .claim("nickname", nickname)
                .claim("avatar_url",userJson.getString("avatar_url"))
                .claim("bio", userJson.optString("bio"))
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(jwtkey, SignatureAlgorithm.HS256)
                .compact();

        // 쿠키 생성
        ResponseCookie jwtCookie = ResponseCookie.from("auth_token", jwt)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(3600)
                .sameSite("Lax")
                .build();

        // 리다이렉트 응답
        HttpHeaders redirectHeaders = new HttpHeaders();
        redirectHeaders.setLocation(URI.create("http://localhost:5173/?auth=success&user=" + nickname)); // 프론트 주소
        redirectHeaders.add(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        return ResponseEntity.status(HttpStatus.FOUND)
                .headers(redirectHeaders)
                .build();
    }

    @GetMapping("/auth/status")
    public Map<String, Object> status(HttpServletRequest request) {
        // 쿠키 이름을 프론트엔드와 일치시킴
        String jwtToken = getCookieValue(request, "auth_token");

        if (jwtToken != null && isValidJWT(jwtToken)) {
            UserInfo user = extractUserFromJWT(jwtToken);

            // 프론트엔드가 기대하는 키 사용
            return Map.of("isLoggedIn", true, "user", user);
        }

        return Map.of("isLoggedIn", false, "user", null);
    }

    // extractUserFromJWT 메서드 추가 필요
    private UserInfo extractUserFromJWT(String token) {
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
    }


    // 쿠키값을 가져오는 함수 (jakarta.servlet.http.Cookie 사용)
    private String getCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) return null;
        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().equals(cookieName)) {
                return cookie.getValue();
            }
        }
        return null;
    }

    // JWT 유효성 검사 함수
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
