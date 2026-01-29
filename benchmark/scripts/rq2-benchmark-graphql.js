/**
 * RQ2: Complexity-Based Benchmark - GraphQL
 *
 * Measures GraphQL API performance across three complexity levels:
 * - Low: Basic metadata (6 fields)
 * - Medium: Metadata + Issue/PR counts (12 fields)
 * - High: Full TIS (16 fields)
 *
 * Research Question:
 * "How does query complexity affect the performance gap between GraphQL and REST APIs?"
 */

import { graphql } from "@octokit/graphql";
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Measure a single GraphQL request for a specific complexity level
 */
async function measureGraphQLRequest(owner, name, complexityLevel) {
  const config = getComplexityLevel(complexityLevel);
  const startTime = performance.now();
  let response;
  let payloadSize = 0;
  let error = null;

  try {
    response = await graphqlWithAuth(config.graphqlQuery, { owner, name });
    payloadSize = JSON.stringify(response).length;
  } catch (e) {
    error = e.message;
  }

  const endTime = performance.now();
  const latency = endTime - startTime;

  return {
    complexityLevel,
    latencyMs: latency,
    payloadBytes: payloadSize,
    apiCallCount: 1, // GraphQL always 1 call
    success: error === null,
    error,
  };
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
    `\n  ${repo.fullName} (${repo.stratum}, ★${repo.stargazerCount})`,
  );

  const [owner, name] = repo.fullName.split("/");

  for (const level of ["low", "medium", "high"]) {
    const levelConfig = getComplexityLevel(level);
    const measurements = [];

    console.log(
      `     [${level.toUpperCase()}] ${levelConfig.fieldCount} fields...`,
    );

    // Warm-up
    await measureGraphQLRequest(owner, name, level);
    await sleep(CONFIG.cooldownMs);

    // Measurement runs
    for (let i = 0; i < CONFIG.measurementRuns; i++) {
      const result = await measureGraphQLRequest(owner, name, level);
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
          apiCallCount: 1,
          successRate: successfulRuns.length / measurements.length,
        },
      };

      console.log(
        `       → ${results.byComplexity[level].summary.latencyMean.toFixed(1)}ms, ${results.byComplexity[level].summary.payloadBytesAvg.toFixed(0)} bytes`,
      );
    }
  }

  return results;
}

/**
 * Calculate standard deviation
 */
function calculateStd(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Main execution
 */
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║   RQ2: GraphQL Complexity Benchmark                            ║",
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
  console.log(`Complexity Levels:`);
  for (const [level, config] of Object.entries(COMPLEXITY_LEVELS)) {
    console.log(
      `   - ${config.name}: ${config.fieldCount} fields, ${config.aggregationCount} aggregations`,
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
    `graphql-complexity-${timestamp}.json`,
  );

  const outputData = {
    metadata: {
      type: "graphql-complexity",
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

      aggregateStats[level] = {
        n: levelResults.length,
        fieldCount: COMPLEXITY_LEVELS[level].fieldCount,
        aggregationCount: COMPLEXITY_LEVELS[level].aggregationCount,
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
        apiCallCount: 1,
      };
    }
  }

  // Save aggregate stats
  fs.writeFileSync(
    path.join(resultsDir, "graphql-aggregate.json"),
    JSON.stringify(aggregateStats, null, 2),
  );

  // Print summary
  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("RQ2 GRAPHQL BENCHMARK SUMMARY");
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
      `│ ${level.padEnd(10)} │ ${String(stats.fieldCount).padStart(6)} │ ${stats.latency.mean.toFixed(1).padStart(7)} ± ${stats.latency.std.toFixed(1).padStart(6)} │ ${stats.payload.mean.toFixed(0).padStart(11)} │ ${String(stats.apiCallCount).padStart(9)} │`,
    );
  }
  console.log(
    "└────────────┴────────┴───────────────────┴─────────────┴───────────┘",
  );

  console.log(`\nResults saved to: ${resultsPath}`);
  console.log("\nGraphQL complexity benchmark complete!");
}

main().catch(console.error);
