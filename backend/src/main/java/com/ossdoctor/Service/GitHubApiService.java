package com.ossdoctor.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ossdoctor.config.GithubApiProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GitHubApiService {

    private final WebClient webClient;
    private final GithubApiProperties properties;
    private final ObjectMapper objectMapper;


    @Value("${github.token}")
    private String githubToken;

    @Value("${github.api.graphql-url}")
    private String graphqlUrl;

    // Repository 기본 정보 GraphQL query
    private static final String REPOSITORY_QUERY = """
    query GetRepository($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
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

    public Mono<String> runRepositoryQuery(String owner, String name) {
        // GraphQL 요청 JSON을 변수 포함해서 생성
        String body = """
    {
      "query": "%s",
      "variables": {
        "owner": "%s",
        "name": "%s"
      }
    }
    """.formatted(
                REPOSITORY_QUERY.replace("\"", "\\\"").replace("\n", " "),
                owner,
                name
        );

        return webClient.post()
                .uri(graphqlUrl)
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(String.class);
    }


    public Mono<String> runSimpleQuery() {
        String query = """
        {
          viewer {
            login
            name
          }
        }
        """;

        return webClient.post()
                .uri(graphqlUrl)
                .header("Authorization", "Bearer " + githubToken)
                .header("Accept", "application/vnd.github+json")
                .bodyValue("{\"query\": \"" + query.replace("\"", "\\\"").replace("\n", "") + "\"}")
                .retrieve()
                .bodyToMono(String.class);
    }
}