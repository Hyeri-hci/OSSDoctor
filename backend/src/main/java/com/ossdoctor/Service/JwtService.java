package com.ossdoctor.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ossdoctor.model.UserInfo;

import jakarta.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

/**
 * JWT 토큰 관련 비즈니스 로직을 담당하는 서비스
 *
 * 주요 기능:
 * - JWT 토큰 생성
 * - JWT 토큰 유효성 검사
 * - JWT에서 사용자 정보 추출
 * - 서버 재시작 시 이전 토큰 무효화
 */
@Service
public class JwtService {

    // JWT 서명용 시크릿 키
    @Value("${jwt.secret.key}")
    private String jwtSecret;
    
    // 서버 시작 시간 (서버 재시작 감지용)
    private Date serverStartTime;
    
    @PostConstruct
    public void init() {
        serverStartTime = new Date();
    }

    /**
     * 사용자 정보로 JWT 토큰 생성
     */
    public String createJwtToken(JsonNode userJson, Date now, Date expiryDate) {
        Key jwtkey = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String nickname = userJson.get("login").asText();
        int userId = userJson.get("id").asInt();
        String avatarUrl = userJson.has("avatar_url") && !userJson.get("avatar_url").isNull() 
            ? userJson.get("avatar_url").asText() : "";
        String bio = userJson.has("bio") && !userJson.get("bio").isNull() 
            ? userJson.get("bio").asText() : "";

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("nickname", nickname)
                .claim("avatar_url", avatarUrl)
                .claim("bio", bio)
                .claim("server_start", serverStartTime.getTime()) // 서버 시작 시간 추가
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith((javax.crypto.SecretKey) jwtkey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * JWT 토큰 유효성 검사 (서버 재시작 감지 포함)
     */
    public boolean isValidJWT(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            var claims = Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            
            // 서버 시작 시간 검증 - 서버 재시작 후 발급된 토큰인지 확인
            Object serverStartClaim = claims.get("server_start");
            if (serverStartClaim != null) {
                long tokenServerStart = ((Number) serverStartClaim).longValue();
                long currentServerStart = serverStartTime.getTime();
                
                // 토큰이 현재 서버 시작 시간보다 이전에 발급되었다면 무효
                if (tokenServerStart != currentServerStart) {
                    System.out.println("토큰이 서버 재시작 이전에 발급되어 무효처리됨");
                    return false;
                }
            } else {
                // server_start 클레임이 없는 구버전 토큰은 무효 처리
                System.out.println("구버전 토큰으로 무효처리됨");
                return false;
            }
            
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * JWT에서 사용자 정보 추출
     */
    public UserInfo extractUserFromJWT(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            var claims = Jwts.parser()
                    .verifyWith((javax.crypto.SecretKey) key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            // 서버 시작 시간 재검증
            Object serverStartClaim = claims.get("server_start");
            if (serverStartClaim != null) {
                long tokenServerStart = ((Number) serverStartClaim).longValue();
                long currentServerStart = serverStartTime.getTime();
                
                if (tokenServerStart != currentServerStart) {
                    System.out.println("사용자 정보 추출 실패 - 서버 재시작으로 인한 토큰 무효");
                    return null;
                }
            } else {
                System.out.println("사용자 정보 추출 실패 - 구버전 토큰");
                return null;
            }

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
     * JWT 시크릿 키 검증
     */
    public void validateJwtSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new RuntimeException("JWT secret key is not configured");
        }
    }
    
    /**
     * 서버 시작 시간 반환 (디버깅용)
     */
    public Date getServerStartTime() {
        return serverStartTime;
    }
}
