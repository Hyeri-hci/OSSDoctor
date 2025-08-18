package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.ossdoctor.DTO.*;
import com.ossdoctor.Entity.*;
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
import org.springframework.web.servlet.mvc.method.annotation.ContinuationHandlerMethodArgumentResolver;
import reactor.core.publisher.Flux;
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

    private final RepositoryService repositoryService;
    private final ActivityService activityService;
    private final ScoreService scoreService;
    private final UserService userService;


    // ========== REST API 사용 메서드 ==========
    private final ScoreCalculatorService scoreCalculator;

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
            spdxId
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
                 totalCommit: totalCount
                 nodes {
                   committedDate
                 }
               }
              }
            }
          }
          totalPullRequests: pullRequests { totalCount }
          openPullRequests:  pullRequests(states: [OPEN])   { totalCount }
          closedPullRequests: pullRequests(states: [CLOSED]){ totalCount }
          mergedPullRequests: pullRequests(states: [MERGED]){ totalCount }

          totalIssues: issues { totalCount }
          openIssues:  issues(states: [OPEN])  { totalCount }
          closedIssues: issues(states: [CLOSED]){ totalCount }
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

    private static final String FULL_CONTRIBUTIONS_QUERY = """
    query GetFullContributions($login: String!, $since: DateTime!) {
      user(login: $login) {
        login
        contributionsCollection(from: $since) {
          commitContributionsByRepository(maxRepositories: 50) {
            repository {
              name
              owner { login }
            }
            contributions(first: 100) {
              nodes {
                commitCount
                occurredAt
              }
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 50) {
            repository {
              name
              owner { login }
            }
            contributions(first: 100) {
              nodes {
                pullRequest {
                  title
                  number
                  state
                  createdAt
                  closedAt
                  mergedAt
                }
              }
            }
          }
          issueContributionsByRepository(maxRepositories: 50) {
            repository {
              name
              owner { login }
            }
            contributions(first: 100) {
              nodes {
                issue {
                  title
                  number
                  state
                  createdAt
                  closedAt
                  comments { totalCount }
                }
              }
            }
          }
          pullRequestReviewContributionsByRepository(maxRepositories: 50) {
            repository {
              name
              owner { login }
            }
            contributions(first: 100) {
              nodes {
                pullRequestReview {
                  state
                  submittedAt
                  pullRequest {
                    number
                    title
                  }
                }
              }
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
                "name", repo);

        // GraphQL Query 호출
        return executeGraphQLQuery(REPOSITORY_QUERY, variables)
                .map(this::parseRepositoryInfo) // JSON -> DTO
                .flatMap(dto ->
                        // contributor 수를 가져와 DTO에 설정
                        getContributorCount(owner, repo)
                                .doOnNext(totalContributorCount -> {
                                    dto.setTotalContributors(totalContributorCount);
                                    dto.setContributors(Math.min(totalContributorCount, 9));
                                })
                                .then(Mono.fromCallable(() -> {
                                    RepositoryDTO savedDto = repositoryService.findByGithubId(dto.getGithubRepoId())
                                            .orElseGet(() -> repositoryService.save(dto));
                                    calculateTotalScore(savedDto);
                                    return savedDto;
                                }).subscribeOn(Schedulers.boundedElastic())))
                .onErrorMap(this::handleApiError); // 에러 핸들링
    }

    // 커밋 활동 통계 조회 - 최근 30일간 커밋 활동 분석하여 일별 통계 반환
    // 프론트엔드의 차트에서 활용 (통계 일자는 변경 가능)
    @Cacheable(value = "commitActivity", key = "#owner + '_' + #repo")
    public Mono<List<CommitDTO>> getCommitActivity(String owner, String repo) {
        // 최근 30일간의 커밋만 요청하기 위한 조건
        LocalDateTime since = LocalDateTime.now().minusDays(30);

        Map<String, Object> variables = Map.of(
                "owner", owner,
                "name", repo,
                "since", since.format(DateTimeFormatter.ISO_DATE_TIME));

        return executeGraphQLQuery(COMMIT_ACTIVITY_QUERY, variables)
                .map(this::parseCommitActivity)
                .onErrorMap(this::handleApiError);
    }

    // 최근 활동 이력 조회 - 최근 7일간 Pull Request, Issue 등 활동 가져와 프로젝트 최근 동향 파악
    @Cacheable(value = "recentActivities", key = "#owner + '_' +#repo")
    public Mono<List<ActivityDTO>> getRecentActivities(String owner, String repo) {
        // LocalDateTime since = LocalDateTime.now().minusDays(7);

        Map<String, Object> variables = Map.of(
                "owner", owner,
                "name", repo
                // "since", since.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(RECENT_ACTIVITIES_QUERY, variables)
                .map(this::parseRecentActivities)
                // ActivityDTO -> PR, Issue 저장(비동기식)
                .flatMap(result -> activityService.saveActivities(result.getActivities(), result.getRepositoryId()))
                .onErrorMap(this::handleApiError);
    }

    public Mono<List<ContributionDTO>> getContributionSince(String owner, LocalDateTime since) {
        Map<String, Object> variables = Map.of(
                "login", owner,
                "since", since.format(DateTimeFormatter.ISO_DATE_TIME)
                //"to", to.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(FULL_CONTRIBUTIONS_QUERY, variables)
                .flatMapMany(this::parseContributions) // Flux<ContributionDTO> 반환
                .collectList() // Flux -> Mono<List<ContributionDTO>>
                .onErrorMap(this::handleApiError);
    // 최근 활동 이력 프론트엔드용 Map 형태 변환 
    public Mono<List<Map<String, Object>>> getRecentActivitiesForFrontend(String owner, String repo) {
        return getRecentActivities(owner, repo)
                .map(activities -> activities.stream()
                        .map(this::convertActivityToMap)
                        .collect(Collectors.toList()));
    }

    // ActivityDTO 프론트엔드용 사용할 수 있는 Map 형태로 변환
    private Map<String, Object> convertActivityToMap(ActivityDTO activity) {
        Map<String, Object> result = new HashMap<>();
        result.put("type", activity.getType());
        result.put("title", activity.getTitle());
        result.put("author", activity.getAuthor());
        result.put("startDate", activity.getStartDate());
        result.put("number", activity.getNumber());
        return result;
    }

    // ========== REST API 사용 메서드 ==========
    // Contributors 9명 정보 조회
    @Cacheable(value = "contributors", key = "#owner + '_' + #repo")
    public Mono<List<ContributorDTO>> getContributors(String owner, String repo) {
        log.info("Fetching contributors for {}/{}", owner, repo);

        return webClient.get()
                //
                .uri("/repos/{owner}/{repo}/contributors?per_page=9", owner, repo)
                .header(HttpHeaders.AUTHORIZATION, "token " + properties.getToken())
                .retrieve()
                .bodyToMono(JsonNode.class)
                // .doOnNext(jsonNode -> log.info("RESTAPI Response: {}",
                // jsonNode.toPrettyString()))
                .map(this::parseContributors)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                .onErrorMap(this::handleApiError);
    }

    // 언어 분포 정보 조회
    @Cacheable(value = "languages", key = "#owner + '_' + #repo")
    public Mono<Map<String, Double>> getLanguages(String owner, String repo) {
        log.info("Fetching languages for {}/{}", owner, repo);

        return webClient.get()
                .uri("/repos/{owner}/{repo}/languages", owner, repo)
                .header(HttpHeaders.AUTHORIZATION, "token " + properties.getToken())
                .retrieve()
                .bodyToMono(JsonNode.class)
                .map(this::parseLanguages)
                .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
                .onErrorMap(this::handleApiError);
    }

    // Contributors 수 조회
    @Cacheable(value = "contributorCount", key = "#owner + '_' + #repo")
    public Mono<Integer> getContributorCount(String owner, String repo) {
        return webClient.get()
                // 한 페이지에 1명만 응답 => 마지막 페이지 번호 = 전체 contributor 수
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
                "variables", variables);

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
                // .doOnNext(jsonNode -> log.info("GraphQL Response: {}",
                // jsonNode.toPrettyString())) // 응답 로그 추가
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
         * "data": {
         * "repository": { ... }
         * }
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
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(3)
                .map(Map.Entry::getKey)
                .collect(Collectors.collectingAndThen(Collectors.joining(","), s -> s.isEmpty() ? null : s));

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
                .description(repository.path("description").asText(null))
                .url(repository.path("url").asText())
                .owner(owner)
                .language(topLanguages) // top3 언어, 예시) "C,Java,Python"
                .sourceType(SOURCE_TYPE.ANALYZED) // 프로젝트 분석용
                .star(repository.path("stargazerCount").asInt()) // star
                .fork(repository.path("forkCount").asInt())
                .watchers(repository.path("watchers").path("totalCount").asInt())
                .license(repository.path("licenseInfo").path("spdxId").asText(null))
                .topics(topics)
                .lastCommitedAt(commitedAt) // 모니터링 점수
                .totalCommits(repository.path("defaultBranchRef").path("target").path("history").path("totalCommit").asInt(0))
                .openPullRequests(repository.path("openPullRequests").path("totalCount").asInt())
                .closedPullRequests(repository.path("closedPullRequests").path("totalCount").asInt(0))
                .mergedPullRequests(repository.path("mergedPullRequests").path("totalCount").asInt(0))
                .totalPullRequests(repository.path("totalPullRequests").path("totalCount").asInt(0))
                .openIssues(repository.path("openIssues").path("totalCount").asInt(0))
                .closedIssues(repository.path("closedIssues").path("totalCount").asInt(0))
                .totalIssues(repository.path("totalIssues").path("totalCount").asInt(0))
                .lastUpdatedAt(pushedAt) // 모니터링 점수
                .totalContributors(0) // 초기값으로 설정, 이후 getContributorCount()에서 업데이트됨
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

            String type = mergedAtText.isEmpty() ? (pr.path("state").asText().equals("OPEN") ? "pr_opened" : "pr_closed")
                    : "pr_merged";

            activities.add(ActivityDTO.builder()
                    .type(type)
                    .title(pr.path("title").asText())
                    .author(pr.path("author").path(("login")).asText())
                    .startDate(pr.path("createdAt").asText())
                    .endDate(
                            pr.path("mergedAt").asText().isEmpty() ? pr.path("updatedAt").asText() : pr.path("mergedAt").asText())
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
                    .endDate(issue.path("closedAt").asText().isEmpty() ? issue.path("updatedAt").asText()
                            : issue.path("closedAt").asText())
                    .number(issue.path("number").asInt())
                    .build());
        }

        // 정렬 + limit 처리 후 리턴
        List<ActivityDTO> sortedLimited = activities.stream()
                .sorted((a, b) -> b.getEndDate().compareTo(a.getEndDate()))
                // .limit(20)
                .toList();

        // ActivitiesWithRepoId 객체 생성하여 반환
        return new ActivitiesWithRepoId(sortedLimited, repoId);
    }

    public Flux<ContributionDTO> parseContributions(JsonNode response) {
        // user.login 가져오기
        JsonNode userNode = response.path("data").path("user");
        String userLogin = userNode.path("login").asText();

        JsonNode contributionsCollection = userNode.path("contributionsCollection");

        // PR 기여
        Flux<ContributionDTO> prFlux = Flux.fromIterable(contributionsCollection.path("pullRequestContributionsByRepository"))
                .flatMap(repoNode -> {
                    JsonNode repo = repoNode.path("repository");
                    String owner = repo.path("owner").path("login").asText();
                    String repoName = owner + "/" + repo.path("name").asText();

                    if (owner.equals(userLogin)) return Flux.empty();

                    return Flux.fromIterable(repoNode.path("contributions").path("nodes"))
                            .map(node -> {
                                JsonNode pr = node.path("pullRequest");

                                CONTRIBUTION_TYPE type = pr.path("mergedAt").isNull() || pr.path("mergedAt").isMissingNode()
                                        ? (pr.path("state").asText().equals("OPEN") ? CONTRIBUTION_TYPE.OPEN : CONTRIBUTION_TYPE.CLOSED)
                                        : CONTRIBUTION_TYPE.MERGED;

                                LocalDateTime createdAt = parseDate(pr.path("createdAt").asText());
                                LocalDateTime endAt = null;
                                if (type == CONTRIBUTION_TYPE.MERGED) {
                                    endAt = parseDate(pr.path("mergedAt").asText());
                                } else if (type == CONTRIBUTION_TYPE.CLOSED) {
                                    endAt = parseDate(pr.path("closedAt").asText());
                                }

                                return ContributionDTO.builder()
                                        .repositoryName(repoName)
                                        .referenceType(REFERENCE_TYPE.PR)
                                        .state(type)
                                        .number(pr.path("number").isMissingNode() ? null : pr.path("number").asInt())
                                        .title(pr.path("title").isMissingNode() ? null : pr.path("title").asText())
                                        .contributedAt(createdAt)
                                        .endAt(endAt)
                                        .build();
                            });
                });

        // Issue 기여
        Flux<ContributionDTO> issueFlux = Flux.fromIterable(contributionsCollection.path("issueContributionsByRepository"))
                .flatMap(repoNode -> {
                    JsonNode repo = repoNode.path("repository");
                    String owner = repo.path("owner").path("login").asText();
                    String repoName = owner + "/" + repo.path("name").asText();

                    if (owner.equals(userLogin)) return Flux.empty();

                    return Flux.fromIterable(repoNode.path("contributions").path("nodes"))
                            .map(node -> {
                                JsonNode issue = node.path("issue");
                                CONTRIBUTION_TYPE type = issue.path("state").asText().equals("OPEN") ? CONTRIBUTION_TYPE.OPEN : CONTRIBUTION_TYPE.CLOSED;

                                LocalDateTime createdAt = parseDate(issue.path("createdAt").asText());
                                LocalDateTime endAt = (type == CONTRIBUTION_TYPE.CLOSED)
                                        ? parseDate(issue.path("closedAt").asText())
                                        : null;

                                return ContributionDTO.builder()
                                        .referenceType(REFERENCE_TYPE.ISSUE)
                                        .state(type)
                                        .repositoryName(repoName)
                                        .number(issue.path("number").isMissingNode() ? null : issue.path("number").asInt())
                                        .title(issue.path("title").isMissingNode() ? null : issue.path("title").asText())
                                        .contributedAt(createdAt)
                                        .endAt(endAt)
                                        .build();
                            });
                });

        // Review 기여
        Flux<ContributionDTO> reviewFlux = Flux.fromIterable(contributionsCollection
                        .path("pullRequestReviewContributionsByRepository"))
                .flatMap(repoNode -> {
                    JsonNode repo = repoNode.path("repository");
                    String owner = repo.path("owner").path("login").asText();
                    String repoName = owner + "/" + repo.path("name").asText();

                    if (owner.equals(userLogin)) return Flux.empty();

                    return Flux.fromIterable(repoNode.path("contributions").path("nodes"))
                            .map(node -> {
                                JsonNode review = node.path("pullRequestReview");
                                JsonNode pr = review.path("pullRequest");

                                String state = review.path("state").asText();
                                CONTRIBUTION_TYPE reviewState;
                                try {
                                    reviewState = CONTRIBUTION_TYPE.valueOf(state);
                                } catch (IllegalArgumentException e) {
                                    // DISMISSED, PENDING 등 기여로 인정 안되는 상태는 스킵
                                    return null;
                                }

                                LocalDateTime submittedAt = parseDate(review.path("submittedAt").asText());

                                return ContributionDTO.builder()
                                        .referenceType(REFERENCE_TYPE.REVIEW)
                                        .state(reviewState)
                                        .repositoryName(repoName)
                                        .number(pr.isMissingNode() ? null : pr.path("number").asInt())
                                        .title(pr.isMissingNode() ? null : pr.path("title").asText())
                                        .contributedAt(submittedAt)
                                        .endAt(null)
                                        .build();
                            })
                            .filter(Objects::nonNull);
                });

        return Flux.concat(prFlux, issueFlux, reviewFlux);
    }



    /*public Mono<RepositoryDTO> getOrFetchRepository(String owner, String repoName) {
        return Mono.fromCallable(() -> repositoryService.findByFullName(owner, repoName))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(repoOpt -> repoOpt
                        .map(Mono::just) // 존재하면 그대로 반환
                        .orElseGet(() -> getRepositoryInfo(owner, repoName)) // 없으면 GitHub에서 가져오기
                );
    }

    // PullRequestDTO 반환
    public Flux<PullRequestDTO> getPullRequests(String owner, LocalDateTime since) {
        Map<String, Object> variables = Map.of(
                "login", owner,
                "since", since.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(FULL_CONTRIBUTIONS_QUERY, variables)
                .flatMapMany(this::parsePullRequests);
    }

    // IssueDTO 반환
    public Flux<IssueDTO> getIssues(String owner, LocalDateTime since) {
        Map<String, Object> variables = Map.of(
                "login", owner,
                "since", since.format(DateTimeFormatter.ISO_DATE_TIME)
        );

        return executeGraphQLQuery(FULL_CONTRIBUTIONS_QUERY, variables)
                .flatMapMany(this::parseIssues);
    }

    private Flux<PullRequestDTO> parsePullRequests(JsonNode response) {
        JsonNode userNode = response.path("data").path("user");
        final String userName = userNode.path("login").asText();

        final UserDTO actualUser = userService.findByUsername(userName)
                .orElseGet(() -> userService.findByUsername("dabbun").orElseThrow());

        JsonNode repositoryCollection = userNode.path("contributionsCollection");

        return Flux.fromIterable(repositoryCollection.path("pullRequestContributionsByRepository"))
                .flatMap(repoNode -> {
                    JsonNode repo = repoNode.path("repository");
                    String repoName = repo.path("name").asText();
                    String repoOwner = repo.path("owner").path("login").asText();

                    // getOrFetchRepository()를 Mono 체인 안에서 호출
                    return getOrFetchRepository(repoOwner, repoName)
                            .flatMapMany(repositoryDTO ->
                                    Flux.fromIterable(repoNode.path("contributions").path("nodes"))
                                            .map(node -> {
                                                JsonNode pr = node.path("pullRequest");
                                                PR_STATE type = pr.path("mergedAt").isNull() ?
                                                        (pr.path("state").asText().equals("OPEN") ? PR_STATE.OPEN : PR_STATE.CLOSED)
                                                        : PR_STATE.MERGED;

                                                return PullRequestDTO.builder()
                                                        .repositoryId(repositoryDTO.getIdx())
                                                        .userId(actualUser.getIdx())
                                                        .userName(userName)
                                                        .title(pr.path("title").asText())
                                                        .prNumber(pr.path("number").asInt())
                                                        .state(type)
                                                        .createdAt(parseDate(pr.path("createdAt").asText()))
                                                        .mergedAt(type == PR_STATE.MERGED ? parseDate(pr.path("mergedAt").asText()) : null)
                                                        .build();
                                            })
                            );
                });
    }

    private Flux<IssueDTO> parseIssues(JsonNode response) {
        JsonNode userNode = response.path("data").path("user");
        final String userName = userNode.path("login").asText();

        final UserDTO actualUser = userService.findByUsername(userName)
                .orElseGet(() -> userService.findByUsername("dabbun").orElseThrow());

        JsonNode repositoryCollection = userNode.path("contributionsCollection");

        return Flux.fromIterable(repositoryCollection.path("issueContributionsByRepository"))
                .flatMap(repoNode -> {
                    JsonNode repo = repoNode.path("repository");
                    String repoName = repo.path("name").asText();
                    String repoOwner = repo.path("owner").path("login").asText();

                    // getOrFetchRepository를 Mono 체인 안에서 사용
                    return getOrFetchRepository(repoOwner, repoName)
                            .flatMapMany(repositoryDTO ->
                                    Flux.fromIterable(repoNode.path("contributions").path("nodes"))
                                            .map(node -> {
                                                JsonNode issue = node.path("issue");
                                                ISSUE_STATE type = issue.path("state").asText().equals("OPEN") ? ISSUE_STATE.OPEN : ISSUE_STATE.CLOSED;

                                                return IssueDTO.builder()
                                                        .repositoryId(repositoryDTO.getIdx())
                                                        .userId(actualUser.getIdx())
                                                        .userName(userName)
                                                        .title(issue.path("title").asText())
                                                        .issueNumber(issue.path("number").asInt())
                                                        .state(type)
                                                        .createdAt(parseDate(issue.path("createdAt").asText()))
                                                        .closedAt(parseDate(issue.path("closedAt").asText()))
                                                        .build();
                                            })
                            );
                });
    }*/

    // Contributors 파싱
    private List<ContributorDTO> parseContributors(JsonNode response) {
        List<ContributorDTO> contributors = new ArrayList<>();

        for (JsonNode contributor : response) {
            contributors.add(ContributorDTO.builder()
                    .name(contributor.path("login").asText())
                    .contributions(contributor.path("contributions").asInt())
                    .avatarUrl(contributor.path("avatar_url").asText())
                    .htmlUrl(contributor.path("html_url").asText())
                    .type(contributor.path("type").asText())
                    .build());
        }

        return contributors;
    }

    // 언어 분포 파싱
    private Map<String, Double> parseLanguages(JsonNode response) {
        Map<String, Double> languages = new HashMap<>();

        int totalBytes = 0;
        Iterator<String> fieldNames = response.fieldNames();

        // 전체 바이트 수 계산
        while (fieldNames.hasNext()) {
            String languageName = fieldNames.next();
            totalBytes += response.path(languageName).asInt();
        }

        // 각 언어별 퍼센티지 계산
        fieldNames = response.fieldNames();
        while (fieldNames.hasNext()) {
            String languageName = fieldNames.next();
            int bytes = response.path(languageName).asInt();
            double percentage = totalBytes > 0 ? (double) bytes / totalBytes * 100 : 0;
            languages.put(languageName, Math.round(percentage * 10.0) / 10.0);
        }

        return languages;
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

    public ScoreDTO getTotalScore(String owner, String repo) {
        Optional<RepositoryDTO> repository = repositoryService.findByFullName(owner, repo);

        return repository.map(this::calculateTotalScore).orElse(null);

        //return calculateTotalScore(repositoryService.findByFullName(owner, repo));
    }

    // 저장소의 건강 점수만 조회
    public ScoreDTO getHealthScore(String owner, String repo) {
        RepositoryDTO repo_dto = repositoryService.findByFullName(owner, repo);
        if (repo_dto == null) {
            throw new RuntimeException("Repository not found: " + owner + "/" + repo);
        }
        return calculateHealthScore(repo_dto);
    }

    // 저장소의 소셜 점수만 조회
    public ScoreDTO getSocialScore(String owner, String repo) {
        RepositoryDTO repo_dto = repositoryService.findByFullName(owner, repo);
        if (repo_dto == null) {
            throw new RuntimeException("Repository not found: " + owner + "/" + repo);
        }
        return calculateSocialScore(repo_dto);
    }

    // 저장소의 모든 점수 정보 조회
    public Map<String, Object> getAllScores(String owner, String repo) {
        RepositoryDTO repo_dto = repositoryService.findByFullName(owner, repo);
        if (repo_dto == null) {
            throw new RuntimeException("Repository not found: " + owner + "/" + repo);
        }

        ScoreDTO healthScore = calculateHealthScore(repo_dto);
        ScoreDTO socialScore = calculateSocialScore(repo_dto);
        ScoreDTO totalScore = calculateTotalScore(repo_dto);

        Map<String, Object> scores = new HashMap<>();
        scores.put("healthScore", healthScore.getScore());
        scores.put("socialScore", socialScore.getScore());
        scores.put("totalScore", totalScore.getScore());

        // 점수별 세부 정보
        scores.put("healthDetails", getHealthScoreDetails(repo_dto));
        scores.put("socialDetails", getSocialScoreDetails(repo_dto));

        return scores;
    }

    // 건강 점수 세부 정보
    private Map<String, Integer> getHealthScoreDetails(RepositoryDTO repo) {
        Map<String, Integer> details = new HashMap<>();
        details.put("commitScore", scoreCalculator.calculateCommitScore(repo.getTotalCommits()));
        details.put("updateScore", scoreCalculator.calculateUpdateScore(repo.getLastUpdatedAt()));
        details.put("prScore", scoreCalculator.calculatePRScore(repo.getMergedPullRequests()));
        details.put("issueScore", scoreCalculator.calculateIssueScore(repo.getClosedIssues()));
        return details;
    }

    // 소셜 점수 세부 정보
    private Map<String, Integer> getSocialScoreDetails(RepositoryDTO repo) {
        Map<String, Integer> details = new HashMap<>();
        details.put("starScore", scoreCalculator.calculateStarScore(repo.getStar()));
        details.put("forkScore", scoreCalculator.calculateForkScore(repo.getFork()));
        details.put("watcherScore", scoreCalculator.calculateWatcherScore(repo.getWatchers()));
        details.put("contributorScore", scoreCalculator.calculateContributorScore(repo.getTotalContributors())); // 총 기여자 수 사용
        return details;
    }

    // 건강 점수 계산 최종
    private ScoreDTO calculateHealthScore(RepositoryDTO repo) {

        int commitScore = scoreCalculator.calculateCommitScore(repo.getTotalCommits());
        int updateScore = scoreCalculator.calculateUpdateScore(repo.getLastUpdatedAt());
        int prScore = scoreCalculator.calculatePRScore(repo.getMergedPullRequests());
        int issueScore = scoreCalculator.calculateIssueScore(repo.getClosedIssues());

        log.info("repo: " + repo.getName());

        int healthScore = commitScore + updateScore + prScore + issueScore;

        return scoreService.save(ScoreDTO.builder()
                .repositoryId(repo.getIdx())
                .scoreType(SCORE_TYPE.HEALTH)
                .score(healthScore)
                .build());
    }

    // 소셜 점수 계산 최종
    private ScoreDTO calculateSocialScore(RepositoryDTO repo) {

        int star = repo.getStar();
        int fork = repo.getFork();
        int watchers = repo.getWatchers();
        int totalContributors = repo.getTotalContributors(); // 총 기여자 수 사용

        int starScore = scoreCalculator.calculateStarScore(star);
        int forkScore = scoreCalculator.calculateForkScore(fork);
        int watcherScore = scoreCalculator.calculateWatcherScore(watchers);
        int contributorScore = scoreCalculator.calculateContributorScore(totalContributors); // 총 기여자 수로 점수 계산

        log.info("repo: " + repo.getName());

        int socialScore = starScore + forkScore + watcherScore + contributorScore;

        return scoreService.save(ScoreDTO.builder()
                .repositoryId(repo.getIdx())
                .scoreType(SCORE_TYPE.SOCIAL)
                .score(socialScore)
                .build());
    }

    // 종합 점수 계산
    private ScoreDTO calculateTotalScore(RepositoryDTO repo) {

        int healthScore = calculateHealthScore(repo).getScore() * 5;
        int socialScore = calculateSocialScore(repo).getScore() * 2;

        log.info("repo: " + repo.getName());

        // 최종 점수는 반올림
        int totalScore = (healthScore + socialScore) / 10;

        return scoreService.save(ScoreDTO.builder()
                .repositoryId(repo.getIdx())
                .scoreType(SCORE_TYPE.TOTAL)
                .score(totalScore)
                .build());
    }

    // ========== 유틸리티 메서드들 ==========

    // 날짜 계산
    private long getDaysSinceLast(LocalDate date) {
        if (date == null)
            return 999;

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

    private LocalDateTime parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank() || "null".equalsIgnoreCase(dateStr)) {
            return null;
        }
        return LocalDateTime.parse(dateStr, DateTimeFormatter.ISO_DATE_TIME);
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