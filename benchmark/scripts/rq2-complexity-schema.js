/**
 * RQ2: Query Complexity Schema Definition
 *
 * Defines three levels of query complexity for comparing
 * GraphQL vs REST API performance scaling behavior.
 *
 * Research Question:
 * "How does query complexity affect the performance gap between GraphQL and REST APIs?"
 */

/**
 * Complexity Level Definitions
 *
 * Each level is defined by:
 * - Number of fields requested
 * - Number of aggregations/counts
 * - REST API calls required
 * - Semantic description
 */
export const COMPLEXITY_LEVELS = {
  /**
   * LOW Complexity
   * - Basic repository metadata only
   * - 6 fields, 0 aggregations
   * - REST: 1 API call (/repos/{owner}/{repo})
   */
  low: {
    name: "Low",
    description: "Basic repository metadata",
    fieldCount: 6,
    aggregationCount: 0,
    restApiCalls: 1,
    fields: [
      "name",
      "owner",
      "fullName",
      "description",
      "stargazerCount",
      "forkCount",
    ],
    graphqlQuery: `
      query GetRepoBasic($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          owner { login }
          description
          stargazerCount
          forkCount
        }
      }
    `,
    restEndpoints: [
      {
        method: "GET",
        path: "/repos/{owner}/{repo}",
        description: "Basic metadata",
      },
    ],
  },

  /**
   * MEDIUM Complexity
   * - Repository metadata + Issue/PR counts
   * - 12 fields, 4 aggregations (issue/PR state counts)
   * - REST: 4 API calls (repo + 3 search queries)
   */
  medium: {
    name: "Medium",
    description: "Repository metadata with issue/PR statistics",
    fieldCount: 12,
    aggregationCount: 4,
    restApiCalls: 4,
    fields: [
      "name",
      "owner",
      "fullName",
      "description",
      "stargazerCount",
      "forkCount",
      "watcherCount",
      "openIssueCount",
      "closedIssueCount",
      "openPullRequestCount",
      "closedPullRequestCount",
      "primaryLanguage",
    ],
    graphqlQuery: `
      query GetRepoMedium($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          owner { login }
          description
          stargazerCount
          forkCount
          watchers { totalCount }
          
          openIssues: issues(states: [OPEN]) { totalCount }
          closedIssues: issues(states: [CLOSED]) { totalCount }
          openPullRequests: pullRequests(states: [OPEN]) { totalCount }
          closedPullRequests: pullRequests(states: [CLOSED]) { totalCount }
          
          primaryLanguage { name }
        }
      }
    `,
    restEndpoints: [
      {
        method: "GET",
        path: "/repos/{owner}/{repo}",
        description: "Basic metadata",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:issue+state:open",
        description: "Open issues",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:issue+state:closed",
        description: "Closed issues",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:pr",
        description: "Pull requests",
      },
    ],
  },

  /**
   * HIGH Complexity
   * - Full TIS (Target Information Set) from RQ1
   * - 16 fields, 7 aggregations
   * - REST: 7 API calls (repo + contributors + 5 search queries)
   */
  high: {
    name: "High",
    description: "Full repository analysis (TIS)",
    fieldCount: 16,
    aggregationCount: 7,
    restApiCalls: 7,
    fields: [
      "name",
      "owner",
      "fullName",
      "description",
      "stargazerCount",
      "forkCount",
      "watcherCount",
      "openIssueCount",
      "closedIssueCount",
      "totalIssueCount",
      "openPullRequestCount",
      "closedPullRequestCount",
      "mergedPullRequestCount",
      "totalPullRequestCount",
      "contributorCount",
      "primaryLanguage",
      "license",
      "lastPushedAt",
      "createdAt",
    ],
    graphqlQuery: `
      query GetRepoFull($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          name
          owner { login }
          description
          stargazerCount
          forkCount
          watchers { totalCount }
          
          issues { totalCount }
          openIssues: issues(states: [OPEN]) { totalCount }
          closedIssues: issues(states: [CLOSED]) { totalCount }
          
          pullRequests { totalCount }
          openPullRequests: pullRequests(states: [OPEN]) { totalCount }
          closedPullRequests: pullRequests(states: [CLOSED]) { totalCount }
          mergedPullRequests: pullRequests(states: [MERGED]) { totalCount }
          
          primaryLanguage { name }
          licenseInfo { spdxId }
          pushedAt
          createdAt
        }
      }
    `,
    restEndpoints: [
      {
        method: "GET",
        path: "/repos/{owner}/{repo}",
        description: "Basic metadata",
      },
      {
        method: "GET",
        path: "/repos/{owner}/{repo}/contributors",
        description: "Contributors",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:issue+state:open",
        description: "Open issues",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:issue+state:closed",
        description: "Closed issues",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:pr+state:open",
        description: "Open PRs",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:pr+state:closed",
        description: "Closed PRs",
      },
      {
        method: "GET",
        path: "/search/issues?q=repo:{owner}/{repo}+type:pr+is:merged",
        description: "Merged PRs",
      },
    ],
  },
};

/**
 * Complexity level summary for documentation
 */
export const COMPLEXITY_SUMMARY = {
  levels: ["low", "medium", "high"],
  comparison: {
    low: {
      fields: 6,
      aggregations: 0,
      graphqlCalls: 1,
      restCalls: 1,
      ratio: 1.0,
    },
    medium: {
      fields: 12,
      aggregations: 4,
      graphqlCalls: 1,
      restCalls: 4,
      ratio: 4.0,
    },
    high: {
      fields: 16,
      aggregations: 7,
      graphqlCalls: 1,
      restCalls: 7,
      ratio: 7.0,
    },
  },
};

/**
 * Get complexity level configuration
 */
export function getComplexityLevel(level) {
  if (!COMPLEXITY_LEVELS[level]) {
    throw new Error(
      `Unknown complexity level: ${level}. Use: low, medium, high`,
    );
  }
  return COMPLEXITY_LEVELS[level];
}

export default COMPLEXITY_LEVELS;
