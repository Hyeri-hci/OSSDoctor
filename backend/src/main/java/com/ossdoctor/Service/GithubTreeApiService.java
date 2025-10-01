package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.DTO.CpeDTO;
import com.ossdoctor.DTO.GithubTreeFileResponseDTO;
import com.ossdoctor.DTO.GithubTreeNodeDTO;
import com.ossdoctor.DTO.GithubTreeResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GithubTreeApiService {
    // Github token을 매핑시킨다.
    @Value("${github.token}")
    private String githubToken;

    @Autowired
    private ObjectMapper objectMapper;

    // API를 보내기 위해서 RestTemplate 객체를 선언한다.
    private final RestTemplate restTemplate;
    @Autowired
    private WebClient webClient;

    // 생성자
    public GithubTreeApiService() {
        this.restTemplate = new RestTemplate();
    }

    public Mono<List<GithubTreeNodeDTO>> getRepositoryTree(String owner, String repo) {
        String url = String.format("https://api.github.com/repos/%s/%s/git/trees/HEAD?recursive=true",
                owner, repo);
        return webClient.get()
                .uri(url)
                .headers(headers -> {
                    headers.setBearerAuth(githubToken);
                    headers.set("Accept", "application/vnd.github+json");
                    headers.set("User-Agent", "OSSDoctor/1.0");
                })
                //본문(body) 추출
                .retrieve()
                .bodyToMono(GithubTreeResponseDTO.class)
                .map(GithubTreeResponseDTO::getTree)
                .doOnNext(treeNodes -> {
                    long dependencyFileCount = treeNodes.stream()
                            .filter(node -> "blob".equals(node.getType()))
                            .filter(node ->
                                    node.getPath().endsWith("package.json") ||
                                            node.getPath().endsWith("pom.xml") ||
                                            node.getPath().endsWith("build.gradle") ||
                                            node.getPath().endsWith("requirements.txt") ||
                                            node.getPath().endsWith("composer.json") ||
                                            node.getPath().endsWith("go.mod") ||
                                            node.getPath().equals("Gemfile") ||
                                            node.getPath().endsWith("/Gemfile")
                            )
                            .count();
                        log.info("의존성 {}개 발견", dependencyFileCount);

                }).doOnError(error -> log.error("github Tree API 호출 실패/n",error));
    }


    // Api를 보내서 repo의 파일 내용을 받아오는 메서드
    public String getFileContent(String owner, String repo, String path) {
        // 파일의 정보를 확인해 api를 보낼 주소를 생성한다.
        String url = String.format("https://api.github.com/repos/%s/%s/contents/%s",
                owner, repo, path);

        // api 요청을 위한 헤더 생성
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + githubToken); // Bearer 방식으로 변경
        headers.set("Accept", "application/vnd.github+json");
        headers.set("User-Agent", "OSSDoctor/1.0");

        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            log.debug("📄 파일 내용 조회: {}", path);
            // api 보낸 후 응답(파일의 내용)
            ResponseEntity<GithubTreeFileResponseDTO> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, GithubTreeFileResponseDTO.class);

            String content = response.getBody().getContent();
            if (content == null) {
                log.warn("⚠️ 파일 내용이 null: {}", path);
                return "";
            }

            // ✅ 공백 제거 후 Base64 디코딩
            String decoded = new String(Base64.getDecoder().decode(content.replaceAll("\\s", "")));
            log.debug("✅ 파일 내용 조회 완료: {} ({}바이트)", path, decoded.length());

            return decoded;

        } catch (Exception e) {
            log.error("💥 파일 내용 조회 실패: {} - {}", path, e.getMessage());
            return ""; // 실패 시 빈 문자열 반환 (서비스에서 처리)
        }
    }

    /**
     * GitHub 리포지토리 URL에서 Repository ID를 추출
     *
     * @param repositoryUrl GitHub 리포지토리 URL (예: https://github.com/owner/repo)
     * @return Repository ID (Long)
     */
    public Long getRepositoryId(String repositoryUrl) {
        try {
            // 1. URL에서 owner/repo 파싱
            String[] parts = parseRepositoryUrl(repositoryUrl);
            String owner = parts[0];
            String repo = parts[1];

            // 2. GitHub API URL 생성 (가장 간단한 repository 정보 API)
            String apiUrl = String.format("https://api.github.com/repos/%s/%s", owner, repo);

            // 3. HTTP 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            if (githubToken != null && !githubToken.trim().isEmpty()) {
                headers.set("Authorization", "Bearer " + githubToken);
            }
            headers.set("Accept", "application/vnd.github+json");
            headers.set("User-Agent", "OSSDoctor/1.0");

            // 4. HTTP 요청 엔티티 생성
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // 5. API 호출
            ResponseEntity<Map> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            // 6. Repository ID 추출
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                Object idValue = responseBody.get("id");

                if (idValue instanceof Number) {
                    long repositoryId = ((Number) idValue).longValue();
                    log.debug("✅ Repository ID 조회 성공: {}/{} -> {}", owner, repo, repositoryId);
                    return repositoryId;
                }
            }

            log.warn("⚠️ Repository ID를 찾을 수 없습니다: {}", repositoryUrl);
            return null;

        } catch (Exception e) {
            log.error("❌ Repository ID 조회 실패: {} - {}", repositoryUrl, e.getMessage());
            return null;
        }
    }

    /**
     * GitHub 리포지토리 URL을 파싱하여 owner와 repo 이름 추출
     *
     * @param repositoryUrl GitHub URL (예: https://github.com/owner/repo)
     * @return [owner, repo] 배열
     */
    private String[] parseRepositoryUrl(String repositoryUrl) {
        if (repositoryUrl == null || repositoryUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("Repository URL은 필수입니다");
        }

        // URL 정규화 (끝의 / 제거, .git 제거)
        String cleanUrl = repositoryUrl.trim()
                .replaceAll("/$", "")
                .replaceAll("\\.git$", "");

        // GitHub URL 패턴 매칭
        String[] patterns = {
                "https://github.com/([^/]+)/([^/]+)",  // HTTPS
                "http://github.com/([^/]+)/([^/]+)",   // HTTP
                "git@github.com:([^/]+)/([^/]+)"       // SSH
        };

        for (String pattern : patterns) {
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(cleanUrl);

            if (m.find()) {
                String owner = m.group(1);
                String repo = m.group(2);

                log.debug("🔍 URL 파싱 성공: {} -> {}/{}", repositoryUrl, owner, repo);
                return new String[]{owner, repo};
            }
        }

        throw new IllegalArgumentException("유효하지 않은 GitHub URL입니다: " + repositoryUrl);
    }

}
