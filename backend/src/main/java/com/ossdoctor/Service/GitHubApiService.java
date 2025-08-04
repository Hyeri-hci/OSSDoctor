package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.DTO.*;
import com.ossdoctor.Entity.SCORE_TYPE;
import com.ossdoctor.config.GithubApiProperties;
import com.ossdoctor.exception.GitHubApiException;
import lombok.AllArgsConstructor;
import lombok.Data;
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
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GitHubApiService {

    private final WebClient webClient; // HTTP 요청을 보내는 도구
    private final GithubApiProperties properties; // 설정 정보 (토큰, URL 등)
    private final ObjectMapper objectMapper; // JSON 데이터 변환 도구

    private final RepositoryService repositoryService;
    private final ActivityService activityService;
    private final ScoreService scoreService;

    // ========== REST API 사용 메서드 ==========

    // Repository 기본 정보 GraphQL Query (databaseId, watcher 추가)
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
              history(first: 1) {
               totalCount
               nodes {
                 committedDate
               }
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
        watchers {
          totalCount
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

    // 최근 PR & Issue 정보 GraphQL Query => id 추가, since 삭제(추후 논의)
    private static final String RECENT_ACTIVITIES_QUERY = """
        query GetRecentActivities($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            databaseId
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

    // =========== 공개 API 메서드 ===========

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
                .flatMap(dto ->
                        // contributor 수를 가져와 DTO에 설정
                        getContributorCount(owner, repo)
                                .doOnNext(dto::setContributors)
                                .then(Mono.fromCallable(() -> repositoryService.save(dto))
                                        .subscribeOn(Schedulers.boundedElastic()))
                )
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

    // 최근 활동 이력 조회 - 최근 7일간 Pull Request, Issue 등 활동 가져와 프로젝트 최근 동향 파악
    @Cacheable(value = "recentActivities", key = "#owner + '_' +#repo")
    public Mono<List<ActivityDTO>> getRecentActivities(String owner, String repo) {
        log.info("Fetching recent activities for {}/{}", owner, repo);

        LocalDateTime since = LocalDateTime.now().minusDays(7);

        Map<String, Object> variables = Map.of(
                "owner", owner,
                "name", repo
                //"since", since.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(RECENT_ACTIVITIES_QUERY, variables)
                .map(this::parseRecentActivities)
                // ActivityDTO -> PR, Issue 저장(비동기식)
                .flatMap(result -> activityService.saveActivities(result.getActivities(), result.getRepositoryId()))
                .onErrorMap(this::handleApiError);
    }

    // ========== REST API 사용 메서드 ==========
    // Contributors 10명 정보 조회
    @Cacheable(value = "contributors", key = "#owner + '_' + #repo")
    public Mono<List<ContributorDTO>> getContributors(String owner, String repo) {
        log.info("Fetching contributors for {}/{}", owner, repo);

        return webClient.get()
                //
                .uri("/repos/{owner}/{repo}/contributors?per_page=10", owner, repo)
                .header(HttpHeaders.AUTHORIZATION, "token " + properties.getToken())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .doOnNext(jsonNode -> log.info("RESTAPI Response: {}", jsonNode.toPrettyString()))
                .map(this::parseContributors)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                .onErrorMap(this::handleApiError);
    }

    // Contributors 수 조회
    @Cacheable(value = "contributorCount", key = "#owner + '_' + #repo")
    public Mono<Integer> getContributorCount(String owner, String repo) {
        return webClient.get()
                // 함 페이지에 1명만 응답 => 마지막 페이지 번호 = 전체 contributor 수
                .uri("/repos/{owner}/{repo}/contributors?per_page=1&anon=true", owner, repo)
                .header(HttpHeaders.AUTHORIZATION, "token " + properties.getToken())
                .exchangeToMono(response -> {
                    HttpHeaders headers = response.headers().asHttpHeaders();
                    String linkHeader = headers.getFirst("Link"); // Link 헤더(페이징 정보)

                    // rel="last"가 포함 => 어러 페이지 존재
                    if (linkHeader != null && linkHeader.contains("rel=\"last\"")) {
                        Pattern pattern = Pattern.compile(".*[?&]page=(\\d+)>; rel=\"last\"");
                        Matcher matcher = pattern.matcher(linkHeader);
                        if (matcher.find()) {
                            int lastPage = Integer.parseInt(matcher.group(1));
                            log.info("Parsed contributor count from Link header: {}", lastPage);
                            return Mono.just(lastPage);
                        }
                    }

                    log.info("No Link header found. Defaulting contributor count to 1.");
                    return Mono.just(1); // Link 헤더 없음 => 1명 이하
                });
    }

    // API 상태 확인
    public Mono<ApiStatusDTO> getApiStatus() {
        return webClient.get()
                .uri("/rate_limit")
                .header(HttpHeaders.AUTHORIZATION, "token " + properties.getToken())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .doOnNext(jsonNode -> log.info("REST API Response: {}", jsonNode.toPrettyString()))
                .map(this::parseApiStatus)
                .onErrorReturn(ApiStatusDTO.builder()
                        .tokenValid(false)
                        .error("API unavailable")
                        .build());
    }


    // ========== 내부 유틸리티 메서드들 ==========
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

        // 최근 업데이트 날짜 추출
        String pushedAtStr = repository.path("updatedAt").asText();
        LocalDate pushedAt = OffsetDateTime.parse(pushedAtStr).toLocalDate();

        String commitedAtStr = repository.path("defaultBranchRef")
                .path("target")
                .path("history")
                .path("nodes")
                .get(0)
                .path("committedDate").asText();
        LocalDate commitedAt = OffsetDateTime.parse(commitedAtStr).toLocalDate();

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
                .watchers(repository.path("watchers").path("totalCount").asInt())
                .license(repository.path("licenseInfo").path("name").asText())
                .topics(topics)
                .lastCommitedAt(commitedAt)
                //.openPullRequests(repository.path("openPullRequests").path("totalCount").asInt())
                //.closedPullRequests(repository.path("closedPullRequests").path("totalCount").asInt())
                .mergedPullRequests(repository.path("mergedPullRequests").path("totalCount").asInt())
                .totalPullRequests(repository.path("pullRequests").path("totalCount").asInt())
                //.openIssues(repository.path("openIssues").path("totalCount").asInt())
                .closedIssues(repository.path("closedIssues").path("totalCount").asInt())
                .totalIssues(repository.path("issues").path("totalCount").asInt())
                .lastUpdatedAt(pushedAt)
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

    // 최근 활동 파싱
    private ActivitiesWithRepoId parseRecentActivities(JsonNode response) {
        List<ActivityDTO> activities = new ArrayList<>();
        JsonNode repository = response.path("data").path("repository");
        Long repoId = repository.path("databaseId").asLong();

        // PR 파싱
        for (JsonNode pr : repository.path("pullRequests").path("nodes")) {
            JsonNode mergedAtNode = pr.path("mergedAt");
            String mergedAtText = mergedAtNode.isNull() ? "" : mergedAtNode.asText();

            String type = mergedAtText.isEmpty() ?
                    (pr.path("state").asText().equals("OPEN") ? "pr_opened" : "pr_closed")
                    : "pr_merged";

            activities.add(ActivityDTO.builder()
                            .type(type)
                            .title(pr.path("title").asText())
                            .author(pr.path("author").path(("login")).asText())
                            .startDate(pr.path("createdAt").asText())
                            .endDate(pr.path("mergedAt").asText().isEmpty() ?
                                    pr.path("updatedAt").asText() : pr.path("mergedAt").asText())
                            .number(pr.path("number").asInt())
                    .build());
        }

        // Issue 파싱
        for (JsonNode issue : repository.path("issues").path("nodes")) {
            String type = issue.path("state").asText().equals("OPEN") ? "issue_opened" : "issue_closed";

            activities.add(ActivityDTO.builder()
                    .type(type)
                    .title(issue.path("title").asText())
                    .author(issue.path("author").path("login").asText())
                    .startDate(issue.path("createdAt").asText())
                    .endDate(issue.path("closedAt").asText().isEmpty() ?
                            issue.path("updatedAt").asText() : issue.path("closedAt").asText())
                    .number(issue.path("number").asInt())
                    .build());
        }

        // 정렬 + limit 처리 후 리턴
        List<ActivityDTO> sortedLimited = activities.stream()
                .sorted((a, b) -> b.getEndDate().compareTo(a.getEndDate()))
                //.limit(20)
                .toList();

        // ActivitiesWithRepoId 객체 생성하여 반환
        return new ActivitiesWithRepoId(sortedLimited, repoId);
    }

    // Contributors 파싱
    private List<ContributorDTO> parseContributors(JsonNode response) {
        List<ContributorDTO> contributors = new ArrayList<>();

        for (JsonNode contributor : response) {
            contributors.add(ContributorDTO.builder()
                            .name(contributor.path("login").asText())
                            .contributions(contributor.path("contributions").asInt())
                            .avatarUrl(contributor.path("avatarUrl").asText())
                            .htmlUrl(contributor.path("htmlUrl").asText())
                            .type(contributor.path("type").asText())
                    .build());
        }

        return contributors;
    }

    // API 상태 파싱
    private ApiStatusDTO parseApiStatus(JsonNode response) {
        JsonNode coreLimit = response.path("resources").path("core");

        return ApiStatusDTO.builder()
                .tokenValid(true)
                .rateLimit(RateLimitDTO.builder()
                        .limit(coreLimit.path("limit").asInt())
                        .used(coreLimit.path("used").asInt())
                        .remaining(coreLimit.path("remaining").asInt())
                        .resetAt(coreLimit.path("reset").asText())
                        .build())
                .build();
    }

    public ScoreDTO getHealthScore(String owner, String repo) {
        return calculateHealthScore(repositoryService.findByFullName(owner, repo));
    }

    // 건강 점수 계산 최종
    private ScoreDTO calculateHealthScore(RepositoryDTO repo) {

        int commitScore = calculateCommitScore(repo);
        int updateScore = calculateUpdateScore(repo);
        int prScore = calculatePrMergeScore(repo);
        int issueScore = calculateIssueScore(repo);

        log.info("repo: " + repo.getName());
        log.info("commitScore: " + commitScore);
        log.info("updateScore: " + updateScore);
        log.info("prScore: " + prScore);
        log.info("issueScore: " + issueScore);

        int healthScore = commitScore + updateScore + prScore + issueScore;

        return scoreService.save(ScoreDTO.builder()
                .repositoryId(repo.getIdx())
                .scoreType(SCORE_TYPE.HEALTH)
                .score(healthScore)
                .createdAt(LocalDateTime.now())
                .build());
    }

    // 건겅 점수 계산1 - 최근 커밋 날짜
    private int calculateCommitScore(RepositoryDTO repo) {
        long daysSinceLastCommit = getDaysSinceLast(repo.getLastCommitedAt());

        if (daysSinceLastCommit <= 7) return 15;
        else if (daysSinceLastCommit <= 14) return 10;
        else if (daysSinceLastCommit <= 30) return 5;
        else if (daysSinceLastCommit <= 90) return 2;
        else return 0;

    }

    // 건강 점수 계산2 - 최근 업데이트 날짜
    private int calculateUpdateScore(RepositoryDTO repo) {
        long daysSinceLastUpdate = getDaysSinceLast(repo.getLastUpdatedAt());

        if (daysSinceLastUpdate <= 7) return 30;
        else if (daysSinceLastUpdate <= 14) return 20;
        else if (daysSinceLastUpdate <= 30) return 10;
        else if (daysSinceLastUpdate <= 90) return 5;
        else return 0;
    }

    // 건강 점수 계산3 - PR Merge 비율
    private int calculatePrMergeScore(RepositoryDTO repo) {
        int mergedPR = repo.getMergedPullRequests();
        int totalPR = repo.getTotalPullRequests();

        // 로직

        return 0;
    }

    // 건강 점수 계산4 - Issue 해결율
    private int calculateIssueScore(RepositoryDTO repo) {
        int closedIssue = repo.getClosedIssues();
        int totalIssue = repo.getTotalIssues();

        // 로직

        return 0;
    }


    // ========== 유틸리티 메서드들 ==========

    // 날짜 계산
    private long getDaysSinceLast(LocalDate date) {
        if (date == null) return 999;

        // 두 날짜 사이 일(day) 단위 차이 계산
        return ChronoUnit.DAYS.between(date, LocalDate.now());
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

    @Data
    @AllArgsConstructor
    public static class ActivitiesWithRepoId {
        private final List<ActivityDTO> activities;
        private final Long repositoryId;
    }


}