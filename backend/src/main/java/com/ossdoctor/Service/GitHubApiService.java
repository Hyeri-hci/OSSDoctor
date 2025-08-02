package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.DTO.CommitDTO;
import com.ossdoctor.DTO.RepositoryDTO;
import com.ossdoctor.config.GithubApiProperties;
import com.ossdoctor.exception.GitHubApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import reactor.util.retry.Retry;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubApiService {

    private final WebClient webClient; // HTTP 요청을 보내는 도구
    private final GithubApiProperties properties; // 설정 정보 (토큰, URL 등)
    private final ObjectMapper objectMapper; // JSON 데이터 변환 도구

    private final RepositoryService repositoryService;

    // Repository 기본 정보 GraphQL Query
    /**
     * 요청 정보:
     * - 프로젝트 기본 정보 (이름, 설명, 스타 수 등)
     * - 커밋, Pull Request, Issue 통계
     * - 사용 언어 분석
     * - 주제 태그들
     */
    // id 추가
    private static final String REPOSITORY_QUERY = """
    query GetRepository($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        databaseId
        name
        nameWithOwner
        description
        url
        stargazerCount
        forkCount
        diskUsage
        createdAt
        updatedAt
        pushedAt
        primaryLanguage {
          name
        }
        licenseInfo {
          name
        }
        repositoryTopics(first: 10) {
          nodes {
            topic {
              name
            }
          }
        }
        defaultBranchRef {
          name
          target {
            ... on Commit {
              history {
                totalCount
              }
            }
          }
        }
        pullRequests {
          totalCount
        }
        openPullRequests: pullRequests(states: [OPEN]) {
          totalCount
        }
        closedPullRequests: pullRequests(states: [CLOSED]) {
          totalCount
        }
        mergedPullRequests: pullRequests(states: [MERGED]) {
          totalCount
        }
        issues {
          totalCount
        }
        openIssues: issues(states: [OPEN]) {
          totalCount
        }
        closedIssues: issues(states: [CLOSED]) {
          totalCount
        }
        languages(first: 10) {
          edges {
            size
            node {
              name
            }
          }
        }
      }
    }
    """;

    // 특정 시점 이후의 커밋 정보 GraphQL Query
    private static final String COMMIT_ACTIVITY_QUERY = """
        query GetCommitActivity($owner: String!, $name: String!, $since: GitTimestamp!) {
          repository(owner: $owner, name: $name) {
            defaultBranchRef {
              target {
                ... on Commit {
                  history(since: $since, first: 100) {
                    nodes {
                      message
                      committedDate
                      author {
                        name
                        user {
                          login
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        """;

    // 최근 PR & Issue 정보 GraphQL Query
    private static final String RECENT_ACTIVITIES_QUERY = """
        query GetRecentActivities($owner: String!, $name: String!, $since: DateTime!) {
          repository(owner: $owner, name: $name) {
            pullRequests(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                title
                number
                state
                createdAt
                updatedAt
                mergedAt
                author {
                  login
                }
              }
            }
            issues(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
              nodes {
                title
                number
                state
                createdAt
                updatedAt
                closedAt
                author {
                  login
                }
              }
            }
          }
        }
        """;


    // Repository 기본 정보 조회
    // owner_repo 키로 캐시 있나?
    // 있으면 -> 메서드 본문 실행 X, 저장된 값을 바로 리턴
    // 없으면 메서드 실행하고, 결과를 캐시에 저장
    @Cacheable(value = "repositoryInfo", key = "#owner + '_' + #repo")
    public Mono<RepositoryDTO> getRepositoryInfo(String owner, String repo) {
        log.info("Fetching repository info for {}/{}", owner, repo);

        Map<String, Object> variables = Map.of(
                "owner", owner,
                "name", repo
        );

        // GraphQL Query 호출
        return executeGraphQLQuery(REPOSITORY_QUERY, variables)
                .map(this::parseRepositoryInfo) // JSON -> DTO
                .flatMap(dto -> {
                    // 비동기식 작업으로 (save(JPA) => 블로킹 방식의 동기 메서드)
                    return Mono.fromCallable(() -> repositoryService.save(dto))
                            .subscribeOn(Schedulers.boundedElastic()); // 다른 Thread 실행
                })
                .onErrorMap(this::handleApiError); // 에러 핸들링
    }

    // 커밋 활동 통계 조회 - 최근 30일간 커밋 활동 분석하여 일별 통계 반환
    // 프론트엔드의 차트에서 활용 (통계 일자는 변경 가능)
    @Cacheable(value = "commitActivity", key = "#owner + '_' + #repo")
    public Mono<List<CommitDTO>> getCommitActivity(String owner, String repo) {
        log.info("Fetching commit activities for {}/{}", owner, repo);

        // 최근 30일간의 커밋만 요청하기 위한 조건
        LocalDateTime since = LocalDateTime.now().minusDays(30);

        Map<String, Object> variables = Map.of(
                "owner", owner,
                "name", repo,
                "since", since.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(COMMIT_ACTIVITY_QUERY, variables)
                .map(this::parseCommitActivity)
                .onErrorMap(this::handleApiError);
    }

    // 최근 활동 이력 조회

    // Webclient 사용해서 GraphQL Query를 비동기로 호출하는 메서드
    private Mono<JsonNode> executeGraphQLQuery(String query, Map<String, Object> variables) {

        // GraphQL Json 형식
        Map<String, Object> body = Map.of(
                "query", query,
                "variables", variables
        );

        return webClient.post() // post 방식으로 요청
                .uri(properties.getApi().getGraphqlUrl()) // 요청할 URL
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(body)
                .retrieve() // 서버 응답 가져옴
                .bodyToMono(JsonNode.class)
                .timeout(Duration.ofSeconds(properties.getApi().getTimeoutSeconds()))
                // 요청이 실패했을 때 어떻게 재시도할지, Retry.backoff(재시도횟수, 최초대기시간)
                .retryWhen(Retry.backoff(properties.getApi().getRateLimitMaxRetries(), Duration.ofSeconds(1)))
                .doOnNext(jsonNode -> log.info("GraphQL Response: {}", jsonNode.toPrettyString()))  // 응답 로그 추가
                .doOnError(error -> log.error("GraphQL query failed: {}", error.getMessage()));
    }

    // Repository 정보 파싱
    private RepositoryDTO parseRepositoryInfo(JsonNode response) {
        if (response.has("errors")) { // 응답에 errors 필드가 있으면 호출 실패
            throw new GitHubApiException("GraphQL Error: " + response.get("errors").toString());
        }

        // data 내부의 repository 필드를 꺼내라
        /*
        * {
        *   "data": {
        *       "repository": { ... }
        *   }
        * }
        **/
        JsonNode repository = response.path("data").path("repository");

        // 언어 통계 계산
        Map<String, Double> languages = new HashMap<>();
        JsonNode languageEdges = repository.path("languages").path("edges");

        int totalSize = 0;

        for (JsonNode edge : languageEdges) {
            totalSize += edge.path("size").asInt();
        }

        for (JsonNode edge : languageEdges) {
            String langName = edge.path("node").path("name").asText(); // 언어 이름
            int size = edge.path("size").asInt(); // 각 언어별 사용량(바이트 수)
            double percentage = totalSize > 0 ? (double) size / totalSize * 100 : 0;
            languages.put(langName, Math.round(percentage * 10.0) / 10.0);
        }

        // 비율 높은 상위 3개 언어를 이름만 추출해서 쉼표로 연결
        String topLanguages = languages.entrySet().stream()
                // 내림차순 정렬
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue())) // 내림차순
                .limit(3)
                .map(Map.Entry::getKey) // 언어 이름만
                .collect(Collectors.joining(","));

        // 토픽 추출
        List<String> topics = new ArrayList<>();
        for (JsonNode topicNode : repository.path("repositoryTopics").path("nodes")) {
            topics.add(topicNode.path("topic").path("name").asText());
        }

        // Owner 추출
        String nameWithOwner = repository.path("nameWithOwner").asText();
        String owner = nameWithOwner.split("/")[0];

        return RepositoryDTO.builder()
                .githubRepoId(repository.get("databaseId").asLong())
                .name(repository.get("name").asText())
                //.fullName(repository.path("nameWithOwner").asText())
                .description(repository.path("description").asText())
                .url(repository.path("url").asText())
                .owner(owner)
                .language(topLanguages) // top3 언어, 예시) "C,Java,Python"
                .star(repository.path("stargazerCount").asInt()) // star
                .fork(repository.path("forkCount").asInt())
                .license(repository.path("licenseInfo").path("name").asText())
                .topics(topics)
                /*
                .totalCommits(repository.path("defaultBranchRef").path("target")
                        .path("history").path("totalCount").asInt())
                .openPullRequests(repository.path("openPullRequests").path("totalCount").asInt())
                .closedPullRequests(repository.path("closedPullRequests").path("totalCount").asInt())
                .mergedPullRequests(repository.path("mergedPullRequests").path("totalCount").asInt())
                .totalPullRequests(repository.path("pullRequests").path("totalCount").asInt())
                .openIssues(repository.path("openIssues").path("totalCount").asInt())
                .closedIssues(repository.path("closedIssues").path("totalCount").asInt())
                .totalIssues(repository.path("issues").path("totalCount").asInt())*/
                .build();
    }


    // 커밋 활동 파싱
    public List<CommitDTO> parseCommitActivity(JsonNode response) {
        // defaultBranchRef.target.history.nodes : 기본 브랜치 기준의 커밋 목록
        JsonNode commits = response.path("data").path("repository")
                .path("defaultBranchRef").path("target").path("history").path("nodes");

        // 날짜별 커밋 수
        Map<String, Integer> dailyCommits = new HashMap<>();

        // "yyyy-MM-dd" 형식으로 추출 + 날짜별 커밋 수 누적
        for (JsonNode commit : commits) {
            String date = commit.path("committedDate").asText().substring(0, 10);
            dailyCommits.merge(date, 1, Integer::sum);
        }

        return dailyCommits.entrySet().stream()
                .sorted(Map.Entry.comparingByKey()) // 오래된 순으로 정렬
                .map(entry -> CommitDTO.builder()
                        .date(entry.getKey())
                        .commits(entry.getValue())
                        .day(getDayOfWeek(entry.getKey()))
                        .build())
                .collect(Collectors.toList());
    }

    // 요일 파싱
    private String getDayOfWeek(String dateString) {
        try {
            LocalDate date = LocalDate.parse(dateString);
            return switch (date.getDayOfWeek()) {
                case SUNDAY -> "일";
                case MONDAY -> "월";
                case TUESDAY -> "화";
                case WEDNESDAY -> "수";
                case THURSDAY -> "목";
                case FRIDAY -> "금";
                case SATURDAY -> "토";
            };
        } catch (Exception e) {
            return "?";
        }
    }

    // GitHub Api 예외 처리
    private GitHubApiException handleApiError(Throwable throwable) {
        // WebClientResponseException : HTTP 결과 4xx or 5xx
        if (throwable instanceof WebClientResponseException webClientResponseException) {
            // 응답의 상태코드(400, 401, ...)를 HttpStatus 타입(BAD_REQUEST, UNAUTHORIZED, ...)으로 추출
            HttpStatus status = (HttpStatus) webClientResponseException.getStatusCode();

            return switch (status) {
                case UNAUTHORIZED -> new GitHubApiException("GitHub Token이 유효하지 않습니다", throwable);
                case FORBIDDEN -> new GitHubApiException("API 요청 한도를 초과했거나 권한이 부족합니다", throwable);
                case NOT_FOUND -> new GitHubApiException("Repository를 찾을 수 없습니다", throwable);
                default -> new GitHubApiException("GitHub API 오류: " + status, throwable);
            };
        }

        // WebClientResponseException이 아닌 경우 = GitHub 서버 자체와의 연결에 실패한 경우
        return new GitHubApiException("네트워크 오류가 발생했습니다", throwable);
    }


}