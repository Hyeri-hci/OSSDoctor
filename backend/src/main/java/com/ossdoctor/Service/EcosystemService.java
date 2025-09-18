package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.config.GithubApiProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EcosystemService {

    private final WebClient webClient;
    private final GithubApiProperties properties;
    private final ObjectMapper objectMapper;

    // GraphQL 엔드포인트
    private static final String GITHUB_GRAPHQL_ENDPOINT = "https://api.github.com/graphql";
    private static final String GITHUB_REST_ENDPOINT = "https://api.github.com/repos";

    /**
     * GraphQL 요청 실행
     */
    private Mono<Map<String, Object>> executeGraphQL(String query, Map<String, Object> variables) {
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("query", query);
        if (variables != null && !variables.isEmpty()) {
            requestBody.put("variables", variables);
        }

        return webClient.post()
                .uri(GITHUB_GRAPHQL_ENDPOINT)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken())
                .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        JsonNode jsonNode = objectMapper.readTree(response);
                        if (jsonNode.has("errors")) {
                            log.error("GraphQL errors: {}", jsonNode.get("errors"));
                            throw new RuntimeException("GraphQL API 오류: " + jsonNode.get("errors"));
                        }
                        @SuppressWarnings("unchecked")
                        Map<String, Object> result = objectMapper.convertValue(jsonNode.get("data"), Map.class);
                        return result;
                    } catch (Exception e) {
                        log.error("GraphQL 응답 파싱 오류", e);
                        throw new RuntimeException("GraphQL 응답 파싱 실패", e);
                    }
                });
    }

    /**
     * REST API 요청 실행
     */
    private Mono<Map<String, Object>> executeRestAPI(String endpoint) {
        return webClient.get()
                .uri(GITHUB_REST_ENDPOINT + endpoint)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getToken())
                .header(HttpHeaders.ACCEPT, "application/vnd.github.v3+json")
                .retrieve()
                .bodyToMono(String.class)
                .map(response -> {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> result = objectMapper.readValue(response, Map.class);
                        return result;
                    } catch (Exception e) {
                        log.error("REST API 응답 파싱 오류", e);
                        throw new RuntimeException("REST API 응답 파싱 실패", e);
                    }
                });
    }

    /**
     * 프로젝트 검색
     */
    public Map<String, Object> searchProjects(Map<String, Object> filters, String cursor) {
        String searchQuery = (String) filters.getOrDefault("searchQuery", "");
        String language = (String) filters.getOrDefault("language", "");
        String license = (String) filters.getOrDefault("license", "");
        String timeFilter = (String) filters.getOrDefault("timeFilter", "");
        String sortBy = (String) filters.getOrDefault("sortBy", "beginner-friendly");
        int limit = (Integer) filters.getOrDefault("limit", 30);

        // 검색 조건 구성
        List<String> searchTerms = new ArrayList<>();
        
        if (!searchQuery.isEmpty()) {
            searchTerms.add(searchQuery);
        }
        
        if (!language.isEmpty()) {
            searchTerms.add("language:" + language);
        }
        
        if (!license.isEmpty()) {
            searchTerms.add("license:" + license);
        }

        // 시간 필터 적용
        if (!timeFilter.isEmpty()) {
            String dateFilter = getDateFilter(timeFilter);
            if (dateFilter != null) {
                searchTerms.add("created:" + dateFilter);
            }
        }

        // 정렬 조건 적용
        String sortQuery = getSortQuery(sortBy);
        if (sortQuery != null && !sortQuery.isEmpty()) {
            searchTerms.add(sortQuery);
        }
        
        // 기본 검색어 설정 (품질 필터)
        if (searchTerms.isEmpty()) {
            searchTerms.add("good-first-issues:>0");
        }
        
        // 최소 품질 기준 추가 (모든 검색에 적용)
        searchTerms.add("stars:>50");        // 최소 50개 stars
        searchTerms.add("forks:>5");         // 최소 5개 forks
        searchTerms.add("pushed:>2023-01-01"); // 2023년 이후 업데이트된 프로젝트

        String searchString = String.join(" ", searchTerms) + " sort:" + getSortField(sortBy);

        String query = """
            query SearchRepositories($query: String!, $first: Int!, $after: String) {
              search(query: $query, type: REPOSITORY, first: $first, after: $after) {
                repositoryCount
                pageInfo {
                  hasNextPage
                  hasPreviousPage
                  startCursor
                  endCursor
                }
                nodes {
                  ... on Repository {
                    id
                    name
                    nameWithOwner
                    description
                    url
                    stargazerCount
                    forkCount
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
                    repositoryTopics(first: 5) {
                      nodes {
                        topic {
                          name
                        }
                      }
                    }
                    issues(states: [OPEN], labels: ["good first issue"]) {
                      totalCount
                    }
                    owner {
                      login
                      avatarUrl
                    }
                  }
                }
              }
            }
            """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("query", searchString);
        variables.put("first", limit);
        if (cursor != null && !cursor.isEmpty()) {
            variables.put("after", cursor);
        }

        return executeGraphQL(query, variables).block();
    }

    /**
     * 저장소 활동 정보 조회
     */
    public Map<String, Object> getRepositoryActivity(String owner, String name, String timeFilter) {
        String query = """
            query GetRepositoryActivity($owner: String!, $name: String!) {
              repository(owner: $owner, name: $name) {
                name
                nameWithOwner
                description
                stargazerCount
                forkCount
                issues(states: [OPEN]) {
                  totalCount
                }
                pullRequests(states: [OPEN]) {
                  totalCount
                }
                releases {
                  totalCount
                }
                primaryLanguage {
                  name
                }
                languages(first: 10) {
                  nodes {
                    name
                  }
                  totalSize
                }
                defaultBranchRef {
                  target {
                    ... on Commit {
                      history(first: 100) {
                        totalCount
                        nodes {
                          committedDate
                          author {
                            name
                            email
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("owner", owner);
        variables.put("name", name);

        return executeGraphQL(query, variables).block();
    }

    /**
     * 컨트리뷰터 통계 조회
     */
    public Map<String, Object> getContributorStats(String owner, String name, String timeFilter) {
        // REST API를 사용하여 컨트리뷰터 정보 조회
        String endpoint = "/" + owner + "/" + name + "/contributors";
        
        return executeRestAPI(endpoint).block();
    }

    /**
     * 추천 프로젝트 조회
     */
    public Map<String, Object> getRecommendedProjects(int count, String category) {
        String searchQuery = getRecommendedQuery(category);
        
        String query = """
            query GetRecommendedProjects($query: String!, $first: Int!) {
              search(query: $query, type: REPOSITORY, first: $first) {
                repositoryCount
                nodes {
                  ... on Repository {
                    id
                    name
                    nameWithOwner
                    description
                    url
                    stargazerCount
                    forkCount
                    createdAt
                    updatedAt
                    primaryLanguage {
                      name
                    }
                    licenseInfo {
                      name
                    }
                    repositoryTopics(first: 3) {
                      nodes {
                        topic {
                          name
                        }
                      }
                    }
                    issues(states: [OPEN], labels: ["good first issue"]) {
                      totalCount
                    }
                    owner {
                      login
                      avatarUrl
                    }
                  }
                }
              }
            }
            """;

        Map<String, Object> variables = new HashMap<>();
        variables.put("query", searchQuery);
        variables.put("first", count);

        return executeGraphQL(query, variables).block();
    }

    // Helper methods
    private String getDateFilter(String timeFilter) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since;
        
        switch (timeFilter) {
            case "day":
                since = now.minusDays(1);
                break;
            case "week":
            case "1week":
                since = now.minusWeeks(1);
                break;
            case "month":
            case "1month":
                since = now.minusMonths(1);
                break;
            case "3months":
                since = now.minusMonths(3);
                break;
            case "6months":
                since = now.minusMonths(6);
                break;
            case "year":
            case "1year":
                since = now.minusYears(1);
                break;
            default:
                return null;
        }
        
        return ">=" + since.format(DateTimeFormatter.ISO_LOCAL_DATE);
    }

    private String getSortQuery(String sortBy) {
        switch (sortBy) {
            case "good-first-issues":
                return "good-first-issues:>0";
            case "help-wanted":
                return "help-wanted-issues:>0";
            case "beginner-friendly":
                return "good-first-issues:>0";
            case "updated":
                return "good-first-issues:>=3"; // 최근 업데이트순: Good First Issues 3개 이상
            case "easy-contribution":
                return "good-first-issues:>2"; // 쉬운 기여: Good First Issues 3개 이상
            case "intermediate-projects":
                return "stars:1000..15000"; // 중급자용: 적당한 인기도 (1K-15K stars)
            case "advanced-projects":
                return "stars:>15000"; // 고급자용: 높은 인기도 (15K+ stars)
            default:
                return null;
        }
    }

    private String getSortField(String sortBy) {
        switch (sortBy) {
            case "stars":
                return "stars";
            case "updated":
                return "updated";
            case "help-wanted":
            case "good-first-issues":
                return "help-wanted-issues";
            case "easy-contribution":
                return "stars"; // 쉬운 기여: 초보자 친화적 프로젝트를 인기순으로
            case "intermediate-projects":
                return "stars"; // 중급자용: 적당한 복잡도 프로젝트를 인기순으로
            case "advanced-projects":
                return "stars"; // 고급자용: 복잡한 프로젝트를 인기순으로
            case "beginner-friendly":
            default:
                return "stars"; // 기본값
        }
    }

    private String getRecommendedQuery(String category) {
        switch (category) {
            case "good-first-issues":
                return "good-first-issues:>3 stars:>100 sort:updated";
            case "beginner-friendly":
                return "topic:beginner-friendly good-first-issues:>0 stars:>50 sort:stars";
            case "trending":
                return "created:>2023-01-01 stars:>500 sort:stars";
            default:
                return "good-first-issues:>0 stars:>10 sort:updated";
        }
    }
}
