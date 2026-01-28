/**
 * PHASE 3b: REST API Benchmark
 *
 * Collects Target Information Set using GitHub REST API
 * and measures performance metrics.
 */

import { Octokit } from "@octokit/rest";
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

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Configuration
const CONFIG = {
  warmupRuns: 1,
  measurementRuns: 5,
  cooldownMs: 1000,
  timeoutMs: 30000,
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * REST API endpoints needed for TIS:
 *
 * 1. GET /repos/{owner}/{repo} - Basic metadata, stars, forks, watchers, language, license
 * 2. GET /repos/{owner}/{repo}/contributors - Contributor count (paginated)
 * 3. GET /search/issues?q=repo:{owner}/{repo}+type:issue+state:open - Open issues
 * 4. GET /search/issues?q=repo:{owner}/{repo}+type:issue+state:closed - Closed issues
 * 5. GET /search/issues?q=repo:{owner}/{repo}+type:pr+state:open - Open PRs
 * 6. GET /search/issues?q=repo:{owner}/{repo}+type:pr+state:closed - Closed PRs
 * 7. GET /search/issues?q=repo:{owner}/{repo}+type:pr+is:merged - Merged PRs
 *
 * Total: 7 API calls minimum (vs 1 for GraphQL)
 */

/**
 * Measure a complete TIS collection using REST API
 */
async function measureRESTRequest(owner, name) {
  const startTime = performance.now();
  let totalPayloadSize = 0;
  let apiCallCount = 0;
  let rateLimitRemaining = null;
  const errors = [];

  const tisData = {
    name: null,
    owner: null,
    fullName: null,
    description: null,
    stargazerCount: 0,
    forkCount: 0,
    watcherCount: 0,
    openIssueCount: 0,
    closedIssueCount: 0,
    totalIssueCount: 0,
    openPullRequestCount: 0,
    closedPullRequestCount: 0,
    mergedPullRequestCount: 0,
    totalPullRequestCount: 0,
    contributorCount: 0,
    primaryLanguage: null,
    license: null,
    lastPushedAt: null,
    createdAt: null,
  };

  try {
    // 1. Get basic repository info
    const repoResponse = await octokit.repos.get({ owner, repo: name });
    apiCallCount++;
    totalPayloadSize += JSON.stringify(repoResponse.data).length;
    rateLimitRemaining = parseInt(
      repoResponse.headers["x-ratelimit-remaining"] || "0",
    );

    const repo = repoResponse.data;
    tisData.name = repo.name;
    tisData.owner = repo.owner.login;
    tisData.fullName = repo.full_name;
    tisData.description = repo.description;
    tisData.stargazerCount = repo.stargazers_count;
    tisData.forkCount = repo.forks_count;
    tisData.watcherCount = repo.subscribers_count; // Note: watchers != subscribers in REST
    tisData.primaryLanguage = repo.language;
    tisData.license = repo.license?.spdx_id || null;
    tisData.lastPushedAt = repo.pushed_at;
    tisData.createdAt = repo.created_at;
    tisData.openIssueCount = repo.open_issues_count; // Includes PRs!

    await sleep(100); // Small delay between calls

    // 2. Get contributor count (first page only, check total)
    try {
      const contribResponse = await octokit.repos.listContributors({
        owner,
        repo: name,
        per_page: 1,
        anon: "false",
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(contribResponse.data).length;

      // Parse Link header for total count
      const linkHeader = contribResponse.headers.link;
      if (linkHeader && linkHeader.includes('rel="last"')) {
        const match = linkHeader.match(/page=(\d+)>; rel="last"/);
        if (match) {
          tisData.contributorCount = parseInt(match[1]);
        }
      } else {
        tisData.contributorCount = contribResponse.data.length;
      }
    } catch (e) {
      errors.push(`Contributors: ${e.message}`);
    }

    await sleep(100);

    // 3. Get open issues count (excluding PRs)
    try {
      const openIssuesResponse = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:open`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(openIssuesResponse.data).length;
      tisData.openIssueCount = openIssuesResponse.data.total_count;
    } catch (e) {
      errors.push(`Open issues: ${e.message}`);
    }

    await sleep(100);

    // 4. Get closed issues count
    try {
      const closedIssuesResponse = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:closed`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(closedIssuesResponse.data).length;
      tisData.closedIssueCount = closedIssuesResponse.data.total_count;
    } catch (e) {
      errors.push(`Closed issues: ${e.message}`);
    }

    tisData.totalIssueCount = tisData.openIssueCount + tisData.closedIssueCount;

    await sleep(100);

    // 5. Get open PRs count
    try {
      const openPRsResponse = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr state:open`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(openPRsResponse.data).length;
      tisData.openPullRequestCount = openPRsResponse.data.total_count;
    } catch (e) {
      errors.push(`Open PRs: ${e.message}`);
    }

    await sleep(100);

    // 6. Get closed PRs count (includes merged)
    try {
      const closedPRsResponse = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr state:closed`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(closedPRsResponse.data).length;
      tisData.closedPullRequestCount = closedPRsResponse.data.total_count;
    } catch (e) {
      errors.push(`Closed PRs: ${e.message}`);
    }

    await sleep(100);

    // 7. Get merged PRs count
    try {
      const mergedPRsResponse = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr is:merged`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(mergedPRsResponse.data).length;
      tisData.mergedPullRequestCount = mergedPRsResponse.data.total_count;
    } catch (e) {
      errors.push(`Merged PRs: ${e.message}`);
    }

    tisData.totalPullRequestCount =
      tisData.openPullRequestCount + tisData.closedPullRequestCount;
  } catch (e) {
    errors.push(`Main: ${e.message}`);
  }

  const endTime = performance.now();
  const latency = endTime - startTime;

  return {
    latencyMs: latency,
    payloadBytes: totalPayloadSize,
    apiCallCount,
    rateLimitRemaining,
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
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
    const result = await measureRESTRequest(owner, name);
    results.warmup.push(result);
    console.log(
      `     Warmup ${i + 1}: ${result.latencyMs.toFixed(1)}ms (${result.apiCallCount} calls)`,
    );
    await sleep(CONFIG.cooldownMs);
  }

  // Measurement runs
  for (let i = 0; i < CONFIG.measurementRuns; i++) {
    const result = await measureRESTRequest(owner, name);
    results.measurements.push(result);
    console.log(
      `     Run ${i + 1}: ${result.latencyMs.toFixed(1)}ms, ${result.payloadBytes} bytes, ${result.apiCallCount} calls`,
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
      apiCallCount: successfulRuns[0]?.apiCallCount || 7,
      successRate: successfulRuns.length / results.measurements.length,
      failureRate: 1 - successfulRuns.length / results.measurements.length,
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
    "║     OSSDoctor Benchmark - REST API Performance                 ║",
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

  console.log(`\n Dataset: ${repos.length} repositories`);
  console.log(` Configuration:`);
  console.log(`   - Warmup runs: ${CONFIG.warmupRuns}`);
  console.log(`   - Measurement runs: ${CONFIG.measurementRuns}`);
  console.log(`   - Cooldown: ${CONFIG.cooldownMs}ms`);
  console.log(`   - Timeout: ${CONFIG.timeoutMs}ms`);
  console.log(`   - API calls per repo: 7 (REST)`);

  const startTime = Date.now();
  const allResults = [];

  // Benchmark each repository
  for (let i = 0; i < repos.length; i++) {
    console.log(`\n[${i + 1}/${repos.length}]`);
    const result = await benchmarkRepository(repos[i]);
    allResults.push(result);
  }

  // Create results directory
  const resultsDir = path.join(__dirname, "../results/rest");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(resultsDir, `benchmark-${timestamp}.json`);

  const outputData = {
    metadata: {
      type: "rest",
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
      const calls = stratumResults.map((r) => r.summary.apiCallCount);

      aggregateStats.byStratum[stratum] = {
        count: stratumResults.length,
        latencyMean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        latencyP95:
          latencies.sort((a, b) => a - b)[
            Math.floor(latencies.length * 0.95)
          ] || latencies[latencies.length - 1],
        payloadBytesAvg: payloads.reduce((a, b) => a + b, 0) / payloads.length,
        apiCallsPerRepo: calls.reduce((a, b) => a + b, 0) / calls.length,
      };
    }
  }

  // Overall stats
  const allLatencies = validResults.map((r) => r.summary.latencyMean);
  const allPayloads = validResults.map((r) => r.summary.payloadBytesAvg);
  const allCalls = validResults.map((r) => r.summary.apiCallCount);

  aggregateStats.overall = {
    count: validResults.length,
    latencyMean: allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length,
    latencyP95:
      allLatencies.sort((a, b) => a - b)[
        Math.floor(allLatencies.length * 0.95)
      ] || allLatencies[allLatencies.length - 1],
    payloadBytesAvg:
      allPayloads.reduce((a, b) => a + b, 0) / allPayloads.length,
    apiCallsPerRepo: allCalls.reduce((a, b) => a + b, 0) / allCalls.length,
    totalApiCalls: validResults.length * 7,
  };

  // Save aggregate stats
  const aggregatePath = path.join(resultsDir, "aggregate-stats.json");
  fs.writeFileSync(aggregatePath, JSON.stringify(aggregateStats, null, 2));

  // Print summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("REST API BENCHMARK SUMMARY");
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
  console.log(
    `   API calls/repo: ${aggregateStats.overall.apiCallsPerRepo.toFixed(1)}`,
  );

  console.log("\nBy Stratum:");
  for (const [stratum, stats] of Object.entries(aggregateStats.byStratum)) {
    console.log(
      `   ${stratum.toUpperCase()}: ${stats.latencyMean.toFixed(1)}ms, ${stats.apiCallsPerRepo.toFixed(1)} calls (n=${stats.count})`,
    );
  }

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log("\nREST benchmark complete!");
}

main().catch(console.error);
