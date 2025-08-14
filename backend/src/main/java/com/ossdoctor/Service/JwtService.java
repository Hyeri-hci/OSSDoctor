package com.ossdoctor.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.ossdoctor.model.UserInfo;

import java.security.Key;
import java.util.Date;

/**
 * JWT 토큰 관련 비즈니스 로직을 담당하는 서비스
 *
 * 주요 기능:
 * - JWT 토큰 생성
 * - JWT 토큰 유효성 검사
 * - JWT에서 사용자 정보 추출
 */
@Service
public class JwtService {

    // JWT 서명용 시크릿 키
    @Value("${jwt.secret.key}")
    private String jwtSecret;

    /**
     * 사용자 정보로 JWT 토큰 생성
     */
    public String createJwtToken(JSONObject userJson, Date now, Date expiryDate) {
        Key jwtkey = Keys.hmacShaKeyFor(jwtSecret.getBytes());

        String nickname = userJson.getString("login");
        int userId = userJson.getInt("id");
        String avatarUrl = userJson.optString("avatar_url", "");
        String bio = userJson.optString("bio", "");

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("nickname", nickname)
                .claim("avatar_url", avatarUrl)
                .claim("bio", bio)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith((javax.crypto.SecretKey) jwtkey, Jwts.SIG.HS256)
                .compact();
    }

    /**
     * JWT 토큰 유효성 검사
     */
    public boolean isValidJWT(String token) {
        try {
            Key key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build().parseSignedClaims(token);
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
}
