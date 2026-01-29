/**
 * RQ2: Complexity-Based Benchmark - REST API
 *
 * Measures REST API performance across three complexity levels:
 * - Low: Basic metadata (1 API call)
 * - Medium: Metadata + Issue/PR counts (4 API calls)
 * - High: Full TIS (7 API calls)
 *
 * Research Question:
 * "How does query complexity affect the performance gap between GraphQL and REST APIs?"
 */

import { Octokit } from "@octokit/rest";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  COMPLEXITY_LEVELS,
  getComplexityLevel,
} from "./rq2-complexity-schema.js";

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
  interCallDelay: 100, // Delay between REST calls within a measurement
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * LOW complexity: Basic repository info only
 * 1 API call: GET /repos/{owner}/{repo}
 */
async function measureRestLow(owner, name) {
  const startTime = performance.now();
  let totalPayloadSize = 0;
  let apiCallCount = 0;
  let error = null;

  try {
    const response = await octokit.repos.get({ owner, repo: name });
    apiCallCount++;
    totalPayloadSize += JSON.stringify(response.data).length;
  } catch (e) {
    error = e.message;
  }

  const endTime = performance.now();
  return {
    complexityLevel: "low",
    latencyMs: endTime - startTime,
    payloadBytes: totalPayloadSize,
    apiCallCount,
    success: error === null,
    error,
  };
}

/**
 * MEDIUM complexity: Repo info + Issue/PR counts
 * 4 API calls: repo + 3 search queries
 */
async function measureRestMedium(owner, name) {
  const startTime = performance.now();
  let totalPayloadSize = 0;
  let apiCallCount = 0;
  const errors = [];

  try {
    // 1. Basic repo info
    const repoResponse = await octokit.repos.get({ owner, repo: name });
    apiCallCount++;
    totalPayloadSize += JSON.stringify(repoResponse.data).length;
    await sleep(CONFIG.interCallDelay);

    // 2. Open issues
    try {
      const openIssues = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:open`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(openIssues.data).length;
    } catch (e) {
      errors.push(`Open issues: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 3. Closed issues
    try {
      const closedIssues = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:closed`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(closedIssues.data).length;
    } catch (e) {
      errors.push(`Closed issues: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 4. Pull requests (open + closed)
    try {
      const prs = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(prs.data).length;
    } catch (e) {
      errors.push(`PRs: ${e.message}`);
    }
  } catch (e) {
    errors.push(`Main: ${e.message}`);
  }

  const endTime = performance.now();
  return {
    complexityLevel: "medium",
    latencyMs: endTime - startTime,
    payloadBytes: totalPayloadSize,
    apiCallCount,
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
  };
}

/**
 * HIGH complexity: Full TIS
 * 7 API calls: repo + contributors + 5 search queries
 */
async function measureRestHigh(owner, name) {
  const startTime = performance.now();
  let totalPayloadSize = 0;
  let apiCallCount = 0;
  const errors = [];

  try {
    // 1. Basic repo info
    const repoResponse = await octokit.repos.get({ owner, repo: name });
    apiCallCount++;
    totalPayloadSize += JSON.stringify(repoResponse.data).length;
    await sleep(CONFIG.interCallDelay);

    // 2. Contributors
    try {
      const contribResponse = await octokit.repos.listContributors({
        owner,
        repo: name,
        per_page: 1,
        anon: "false",
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(contribResponse.data).length;
    } catch (e) {
      errors.push(`Contributors: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 3. Open issues
    try {
      const openIssues = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:open`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(openIssues.data).length;
    } catch (e) {
      errors.push(`Open issues: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 4. Closed issues
    try {
      const closedIssues = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:issue state:closed`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(closedIssues.data).length;
    } catch (e) {
      errors.push(`Closed issues: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 5. Open PRs
    try {
      const openPRs = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr state:open`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(openPRs.data).length;
    } catch (e) {
      errors.push(`Open PRs: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 6. Closed PRs
    try {
      const closedPRs = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr state:closed`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(closedPRs.data).length;
    } catch (e) {
      errors.push(`Closed PRs: ${e.message}`);
    }
    await sleep(CONFIG.interCallDelay);

    // 7. Merged PRs
    try {
      const mergedPRs = await octokit.search.issuesAndPullRequests({
        q: `repo:${owner}/${name} type:pr is:merged`,
        per_page: 1,
      });
      apiCallCount++;
      totalPayloadSize += JSON.stringify(mergedPRs.data).length;
    } catch (e) {
      errors.push(`Merged PRs: ${e.message}`);
    }
  } catch (e) {
    errors.push(`Main: ${e.message}`);
  }

  const endTime = performance.now();
  return {
    complexityLevel: "high",
    latencyMs: endTime - startTime,
    payloadBytes: totalPayloadSize,
    apiCallCount,
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : null,
  };
}

/**
 * Measure REST request for a specific complexity level
 */
async function measureRestRequest(owner, name, complexityLevel) {
  switch (complexityLevel) {
    case "low":
      return measureRestLow(owner, name);
    case "medium":
      return measureRestMedium(owner, name);
    case "high":
      return measureRestHigh(owner, name);
    default:
      throw new Error(`Unknown complexity level: ${complexityLevel}`);
  }
}

/**
 * Calculate standard deviation
 */
function calculateStd(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Run benchmark for a single repository across all complexity levels
 */
async function benchmarkRepository(repo) {
  const results = {
    repository: repo.fullName,
    stratum: repo.stratum,
    stargazerCount: repo.stargazerCount,
    byComplexity: {},
  };

  console.log(
    `\n  🔬 ${repo.fullName} (${repo.stratum}, ★${repo.stargazerCount})`,
  );

  const [owner, name] = repo.fullName.split("/");

  for (const level of ["low", "medium", "high"]) {
    const levelConfig = getComplexityLevel(level);
    const measurements = [];

    console.log(
      `     [${level.toUpperCase()}] ${levelConfig.restApiCalls} API calls...`,
    );

    // Warm-up
    await measureRestRequest(owner, name, level);
    await sleep(CONFIG.cooldownMs);

    // Measurement runs
    for (let i = 0; i < CONFIG.measurementRuns; i++) {
      const result = await measureRestRequest(owner, name, level);
      measurements.push(result);
      await sleep(CONFIG.cooldownMs);
    }

    // Calculate summary
    const successfulRuns = measurements.filter((m) => m.success);
    const latencies = successfulRuns
      .map((m) => m.latencyMs)
      .sort((a, b) => a - b);

    if (latencies.length > 0) {
      results.byComplexity[level] = {
        fieldCount: levelConfig.fieldCount,
        aggregationCount: levelConfig.aggregationCount,
        expectedApiCalls: levelConfig.restApiCalls,
        measurements,
        summary: {
          latencyMean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
          latencyMedian: latencies[Math.floor(latencies.length / 2)],
          latencyStd: calculateStd(latencies),
          latencyMin: latencies[0],
          latencyMax: latencies[latencies.length - 1],
          payloadBytesAvg:
            successfulRuns.reduce((a, m) => a + m.payloadBytes, 0) /
            successfulRuns.length,
          apiCallCount:
            successfulRuns[0]?.apiCallCount || levelConfig.restApiCalls,
          successRate: successfulRuns.length / measurements.length,
        },
      };

      console.log(
        `       → ${results.byComplexity[level].summary.latencyMean.toFixed(1)}ms, ${results.byComplexity[level].summary.payloadBytesAvg.toFixed(0)} bytes, ${results.byComplexity[level].summary.apiCallCount} calls`,
      );
    }
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
    "║   RQ2: REST API Complexity Benchmark                           ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  // Load dataset (same as RQ1)
  const datasetPath = path.join(__dirname, "../dataset/repos.json");
  if (!fs.existsSync(datasetPath)) {
    console.error("Dataset not found. Run collect-dataset.js first.");
    process.exit(1);
  }

  const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
  const repos = dataset.repositories;

  console.log(`\nDataset: ${repos.length} repositories (same as RQ1)`);
  console.log(`Complexity Levels (REST API calls required):`);
  for (const [level, config] of Object.entries(COMPLEXITY_LEVELS)) {
    console.log(
      `   - ${config.name}: ${config.fieldCount} fields → ${config.restApiCalls} API calls`,
    );
  }

  const startTime = Date.now();
  const allResults = [];

  // Benchmark each repository
  for (let i = 0; i < repos.length; i++) {
    console.log(`\n[${i + 1}/${repos.length}]`);
    const result = await benchmarkRepository(repos[i]);
    allResults.push(result);
  }

  // Create results directory
  const resultsDir = path.join(__dirname, "../results/rq2");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const resultsPath = path.join(
    resultsDir,
    `rest-complexity-${timestamp}.json`,
  );

  const outputData = {
    metadata: {
      type: "rest-complexity",
      researchQuestion: "RQ2",
      timestamp: new Date().toISOString(),
      config: CONFIG,
      complexityLevels: Object.fromEntries(
        Object.entries(COMPLEXITY_LEVELS).map(([k, v]) => [
          k,
          {
            fieldCount: v.fieldCount,
            aggregationCount: v.aggregationCount,
            restApiCalls: v.restApiCalls,
          },
        ]),
      ),
      datasetVersion: dataset.metadata.version,
      totalRepositories: repos.length,
    },
    results: allResults,
  };

  fs.writeFileSync(resultsPath, JSON.stringify(outputData, null, 2));

  // Calculate aggregate statistics by complexity level
  const aggregateStats = {};

  for (const level of ["low", "medium", "high"]) {
    const levelResults = allResults
      .filter((r) => r.byComplexity[level]?.summary)
      .map((r) => r.byComplexity[level].summary);

    if (levelResults.length > 0) {
      const latencies = levelResults.map((s) => s.latencyMean);
      const payloads = levelResults.map((s) => s.payloadBytesAvg);
      const calls = levelResults.map((s) => s.apiCallCount);

      aggregateStats[level] = {
        n: levelResults.length,
        fieldCount: COMPLEXITY_LEVELS[level].fieldCount,
        aggregationCount: COMPLEXITY_LEVELS[level].aggregationCount,
        expectedApiCalls: COMPLEXITY_LEVELS[level].restApiCalls,
        latency: {
          mean: latencies.reduce((a, b) => a + b, 0) / latencies.length,
          std: calculateStd(latencies),
          min: Math.min(...latencies),
          max: Math.max(...latencies),
        },
        payload: {
          mean: payloads.reduce((a, b) => a + b, 0) / payloads.length,
          std: calculateStd(payloads),
        },
        apiCallCount: {
          mean: calls.reduce((a, b) => a + b, 0) / calls.length,
        },
      };
    }
  }

  // Save aggregate stats
  fs.writeFileSync(
    path.join(resultsDir, "rest-aggregate.json"),
    JSON.stringify(aggregateStats, null, 2),
  );

  // Print summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("RQ2 REST API BENCHMARK SUMMARY");
  console.log("═".repeat(60));
  console.log(`\nTotal time: ${elapsed} minutes`);
  console.log("\nBy Complexity Level:");
  console.log(
    "┌────────────┬────────┬───────────────────┬─────────────┬───────────┐",
  );
  console.log(
    "│ Level      │ Fields │ Latency (ms)      │ Payload (B) │ API Calls │",
  );
  console.log(
    "├────────────┼────────┼───────────────────┼─────────────┼───────────┤",
  );

  for (const [level, stats] of Object.entries(aggregateStats)) {
    console.log(
      `│ ${level.padEnd(10)} │ ${String(stats.fieldCount).padStart(6)} │ ${stats.latency.mean.toFixed(1).padStart(7)} ± ${stats.latency.std.toFixed(1).padStart(6)} │ ${stats.payload.mean.toFixed(0).padStart(11)} │ ${stats.apiCallCount.mean.toFixed(1).padStart(9)} │`,
    );
  }
  console.log(
    "└────────────┴────────┴───────────────────┴─────────────┴───────────┘",
  );

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log("\nREST complexity benchmark complete!");
}

main().catch(console.error);
