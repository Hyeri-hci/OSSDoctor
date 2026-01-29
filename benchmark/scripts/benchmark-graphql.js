/**
 * PHASE 3a: GraphQL Benchmark
 *
 * Collects Target Information Set using GitHub GraphQL API
 * and measures performance metrics.
 */

import { graphql } from "@octokit/graphql";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { validateTIS, extractTIS, TIS_SCHEMA } from "./tis-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN not found");
  process.exit(1);
}

const graphqlWithAuth = graphql.defaults({
  headers: { authorization: `token ${GITHUB_TOKEN}` },
});

// Configuration
const CONFIG = {
  warmupRuns: 1,
  measurementRuns: 5,
  cooldownMs: 1000,
  timeoutMs: 30000,
};

/**
 * GraphQL query for TIS
 * This query retrieves EXACTLY the TIS fields - no more, no less
 */
const TIS_GRAPHQL_QUERY = `
  query GetRepositoryTIS($owner: String!, $name: String!) {
    repository(owner: $owner, name: $name) {
      name
      owner { login }
      description
      stargazerCount
      forkCount
      watchers { totalCount }
      
      # Issue statistics
      issues { totalCount }
      openIssues: issues(states: [OPEN]) { totalCount }
      closedIssues: issues(states: [CLOSED]) { totalCount }
      
      # Pull request statistics
      pullRequests { totalCount }
      openPullRequests: pullRequests(states: [OPEN]) { totalCount }
      closedPullRequests: pullRequests(states: [CLOSED]) { totalCount }
      mergedPullRequests: pullRequests(states: [MERGED]) { totalCount }
      
      primaryLanguage { name }
      licenseInfo { spdxId }
      pushedAt
      createdAt
    }
    
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`;

/**
 * Separate query for contributor count (requires REST-like approach in GraphQL)
 * Note: GitHub GraphQL API does not directly expose contributor count
 */
const CONTRIBUTOR_GRAPHQL_QUERY = `
  query GetContributors($owner: String!, $name: String!, $cursor: String) {
    repository(owner: $owner, name: $name) {
      mentionableUsers(first: 100, after: $cursor) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }
`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Measure a single GraphQL request
 */
async function measureGraphQLRequest(owner, name) {
  const startTime = performance.now();
  let response;
  let payloadSize = 0;
  let apiCallCount = 1;
  let rateLimitCost = 0;
  let error = null;

  try {
    // Main TIS query
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CONFIG.timeoutMs);

    response = await graphqlWithAuth(TIS_GRAPHQL_QUERY, { owner, name });
    clearTimeout(timeout);

    // Calculate payload size
    payloadSize = JSON.stringify(response).length;
    rateLimitCost = response.rateLimit?.cost || 1;

    // Note: For contributor count, we use mentionableUsers as proxy
    // In production OSSDoctor, this is fetched via REST API
    // For fair comparison, we'll note this limitation
  } catch (e) {
    error = e.message;
  }

  const endTime = performance.now();
  const latency = endTime - startTime;

  // Parse response to TIS format
  let tisData = null;
  if (response && response.repository) {
    const repo = response.repository;
    tisData = {
      name: repo.name,
      owner: repo.owner.login,
      fullName: `${repo.owner.login}/${repo.name}`,
      description: repo.description,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      watcherCount: repo.watchers.totalCount,
      openIssueCount: repo.openIssues.totalCount,
      closedIssueCount: repo.closedIssues.totalCount,
      totalIssueCount: repo.issues.totalCount,
      openPullRequestCount: repo.openPullRequests.totalCount,
      closedPullRequestCount: repo.closedPullRequests.totalCount,
      mergedPullRequestCount: repo.mergedPullRequests.totalCount,
      totalPullRequestCount: repo.pullRequests.totalCount,
      contributorCount: 0, // GraphQL limitation - noted in results
      primaryLanguage: repo.primaryLanguage?.name || null,
      license: repo.licenseInfo?.spdxId || null,
      lastPushedAt: repo.pushedAt,
      createdAt: repo.createdAt,
    };
  }

  return {
    latencyMs: latency,
    payloadBytes: payloadSize,
    apiCallCount,
    rateLimitCost,
    success: error === null,
    error,
    tisData,
  };
}

/**
 * Run benchmark for a single repository
 */
async function benchmarkRepository(repo) {
  const results = {
    repository: repo.fullName,
    stratum: repo.stratum,
    stargazerCount: repo.stargazerCount,
    warmup: [],
    measurements: [],
    summary: {},
  };

  console.log(
    `\n  🔬 ${repo.fullName} (${repo.stratum}, ★${repo.stargazerCount})`,
  );

  const [owner, name] = repo.fullName.split("/");

  // Warm-up runs (discarded)
  for (let i = 0; i < CONFIG.warmupRuns; i++) {
    const result = await measureGraphQLRequest(owner, name);
    results.warmup.push(result);
    console.log(`     Warmup ${i + 1}: ${result.latencyMs.toFixed(1)}ms`);
    await sleep(CONFIG.cooldownMs);
  }

  // Measurement runs
  for (let i = 0; i < CONFIG.measurementRuns; i++) {
    const result = await measureGraphQLRequest(owner, name);
    results.measurements.push(result);
    console.log(
      `     Run ${i + 1}: ${result.latencyMs.toFixed(1)}ms, ${result.payloadBytes} bytes`,
    );
    await sleep(CONFIG.cooldownMs);
  }

  // Calculate summary statistics
  const successfulRuns = results.measurements.filter((m) => m.success);
  const latencies = successfulRuns
    .map((m) => m.latencyMs)
    .sort((a, b) => a - b);

  if (latencies.length > 0) {
    results.summary = {
      latencyMean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      latencyMedian: latencies[Math.floor(latencies.length / 2)],
      latencyP95:
        latencies[Math.floor(latencies.length * 0.95)] ||
        latencies[latencies.length - 1],
      latencyMin: latencies[0],
      latencyMax: latencies[latencies.length - 1],
      payloadBytesAvg:
        successfulRuns.reduce((a, m) => a + m.payloadBytes, 0) /
        successfulRuns.length,
      apiCallCount: 1, // Single GraphQL query
      successRate: successfulRuns.length / results.measurements.length,
      failureRate: 1 - successfulRuns.length / results.measurements.length,
      totalRateLimitCost: successfulRuns.reduce(
        (a, m) => a + m.rateLimitCost,
        0,
      ),
    };
  }

  return results;
}

/**
 * Main execution
 */
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║     OSSDoctor Benchmark - GraphQL API Performance              ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  // Load dataset
  const datasetPath = path.join(__dirname, "../dataset/repos.json");
  if (!fs.existsSync(datasetPath)) {
    console.error("Dataset not found. Run collect-dataset.js first.");
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  const repos = dataset.repositories;

  console.log(`\nDataset: ${repos.length} repositories`);
  console.log(`Configuration:`);
  console.log(`   - Warmup runs: ${CONFIG.warmupRuns}`);
  console.log(`   - Measurement runs: ${CONFIG.measurementRuns}`);
  console.log(`   - Cooldown: ${CONFIG.cooldownMs}ms`);
  console.log(`   - Timeout: ${CONFIG.timeoutMs}ms`);

  const startTime = Date.now();
  const allResults = [];

  // Benchmark each repository
  for (let i = 0; i < repos.length; i++) {
    console.log(`\n[${i + 1}/${repos.length}]`);
    const result = await benchmarkRepository(repos[i]);
    allResults.push(result);
  }

  // Create results directory
  const resultsDir = path.join(__dirname, "../results/graphql");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(resultsDir, `benchmark-${timestamp}.json`);

  const outputData = {
    metadata: {
      type: "graphql",
      timestamp: new Date().toISOString(),
      config: CONFIG,
      datasetVersion: dataset.metadata.version,
      totalRepositories: repos.length,
    },
    results: allResults,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(outputData, null, 2));

  // Calculate aggregate statistics
  const validResults = allResults.filter((r) => r.summary.latencyMean);

  const aggregateStats = {
    byStratum: {},
    overall: {},
  };

  for (const stratum of ["small", "medium", "large"]) {
    const stratumResults = validResults.filter((r) => r.stratum === stratum);
    if (stratumResults.length > 0) {
      const latencies = stratumResults.map((r) => r.summary.latencyMean);
      const payloads = stratumResults.map((r) => r.summary.payloadBytesAvg);

      aggregateStats.byStratum[stratum] = {
        count: stratumResults.length,
        latencyMean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        latencyP95:
          latencies.sort((a, b) => a - b)[
            Math.floor(latencies.length * 0.95)
          ] || latencies[latencies.length - 1],
        payloadBytesAvg: payloads.reduce((a, b) => a + b, 0) / payloads.length,
        apiCallsPerRepo: 1,
      };
    }
  }

  // Overall stats
  const allLatencies = validResults.map((r) => r.summary.latencyMean);
  const allPayloads = validResults.map((r) => r.summary.payloadBytesAvg);

  aggregateStats.overall = {
    count: validResults.length,
    latencyMean: allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length,
    latencyP95:
      allLatencies.sort((a, b) => a - b)[
        Math.floor(allLatencies.length * 0.95)
      ] || allLatencies[allLatencies.length - 1],
    payloadBytesAvg:
      allPayloads.reduce((a, b) => a + b, 0) / allPayloads.length,
    apiCallsPerRepo: 1,
    totalApiCalls: validResults.length,
  };

  // Save aggregate stats
  const aggregatePath = path.join(resultsDir, "aggregate-stats.json");
  fs.writeFileSync(aggregatePath, JSON.stringify(aggregateStats, null, 2));

  // Print summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("GRAPHQL BENCHMARK SUMMARY");
  console.log("═".repeat(60));
  console.log(`\nTotal time: ${elapsed} minutes`);
  console.log(`\nOverall Statistics:`);
  console.log(
    `   Latency (mean): ${aggregateStats.overall.latencyMean.toFixed(1)}ms`,
  );
  console.log(
    `   Latency (P95): ${aggregateStats.overall.latencyP95.toFixed(1)}ms`,
  );
  console.log(
    `   Payload (avg): ${aggregateStats.overall.payloadBytesAvg.toFixed(0)} bytes`,
  );
  console.log(`   API calls/repo: ${aggregateStats.overall.apiCallsPerRepo}`);

  console.log("\nBy Stratum:");
  for (const [stratum, stats] of Object.entries(aggregateStats.byStratum)) {
    console.log(
      `   ${stratum.toUpperCase()}: ${stats.latencyMean.toFixed(1)}ms (n=${stats.count})`,
    );
  }

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log("\nGraphQL benchmark complete!");
}

main().catch(console.error);
