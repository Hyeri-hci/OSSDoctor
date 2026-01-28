/**
 * PHASE 4 & 5: Results Analysis
 *
 * Analyzes benchmark results and generates:
 * - Statistical comparison (mean, P95, CI)
 * - Stratum-level analysis
 * - Summary CSV
 * - Comparison report
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as ss from "simple-statistics";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Bootstrap confidence interval
 */
function bootstrapCI(data, statFn, confidence = 0.95, iterations = 10000) {
  const bootstrapStats = [];

  for (let i = 0; i < iterations; i++) {
    const sample = [];
    for (let j = 0; j < data.length; j++) {
      sample.push(data[Math.floor(Math.random() * data.length)]);
    }
    bootstrapStats.push(statFn(sample));
  }

  bootstrapStats.sort((a, b) => a - b);

  const alpha = 1 - confidence;
  const lowerIdx = Math.floor((alpha / 2) * iterations);
  const upperIdx = Math.floor((1 - alpha / 2) * iterations);

  return {
    lower: bootstrapStats[lowerIdx],
    upper: bootstrapStats[upperIdx],
    mean: ss.mean(bootstrapStats),
  };
}

/**
 * Load most recent benchmark results
 */
function loadLatestResults(type) {
  const dir = path.join(__dirname, `../results/${type}`);
  if (!fs.existsSync(dir)) return null;

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith("benchmark-") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), "utf-8"));
}

/**
 * Calculate detailed statistics for a metric
 */
function calculateStats(values) {
  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);

  return {
    n: values.length,
    mean: ss.mean(values),
    median: ss.median(values),
    std: ss.standardDeviation(values),
    min: ss.min(values),
    max: ss.max(values),
    p25: ss.quantile(sorted, 0.25),
    p75: ss.quantile(sorted, 0.75),
    p95: ss.quantile(sorted, 0.95),
    p99: ss.quantile(sorted, 0.99),
    ci95: bootstrapCI(values, ss.mean, 0.95),
  };
}

/**
 * Main analysis
 */
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║     OSSDoctor Benchmark - Results Analysis                     ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  // Load results
  const graphqlResults = loadLatestResults("graphql");
  const restResults = loadLatestResults("rest");

  if (!graphqlResults || !restResults) {
    console.error("Missing benchmark results. Run benchmarks first.");
    process.exit(1);
  }

  console.log(`\nLoaded results:`);
  console.log(`   GraphQL: ${graphqlResults.results.length} repositories`);
  console.log(`   REST: ${restResults.results.length} repositories`);

  // Prepare data
  const analysis = {
    metadata: {
      timestamp: new Date().toISOString(),
      graphqlTimestamp: graphqlResults.metadata.timestamp,
      restTimestamp: restResults.metadata.timestamp,
      datasetVersion: graphqlResults.metadata.datasetVersion,
    },
    overall: {},
    byStratum: {},
    comparison: {},
  };

  // Extract metrics
  const graphqlData = {
    latencies: [],
    payloads: [],
    calls: [],
  };

  const restData = {
    latencies: [],
    payloads: [],
    calls: [],
  };

  for (const r of graphqlResults.results) {
    if (r.summary.latencyMean) {
      graphqlData.latencies.push(r.summary.latencyMean);
      graphqlData.payloads.push(r.summary.payloadBytesAvg);
      graphqlData.calls.push(r.summary.apiCallCount || 1);
    }
  }

  for (const r of restResults.results) {
    if (r.summary.latencyMean) {
      restData.latencies.push(r.summary.latencyMean);
      restData.payloads.push(r.summary.payloadBytesAvg);
      restData.calls.push(r.summary.apiCallCount || 7);
    }
  }

  // Overall statistics
  analysis.overall = {
    graphql: {
      latency: calculateStats(graphqlData.latencies),
      payload: calculateStats(graphqlData.payloads),
      apiCalls: calculateStats(graphqlData.calls),
    },
    rest: {
      latency: calculateStats(restData.latencies),
      payload: calculateStats(restData.payloads),
      apiCalls: calculateStats(restData.calls),
    },
  };

  // Stratum-level analysis
  for (const stratum of ["small", "medium", "large"]) {
    const graphqlStratum = graphqlResults.results
      .filter((r) => r.stratum === stratum && r.summary.latencyMean)
      .map((r) => r.summary);

    const restStratum = restResults.results
      .filter((r) => r.stratum === stratum && r.summary.latencyMean)
      .map((r) => r.summary);

    if (graphqlStratum.length > 0 && restStratum.length > 0) {
      analysis.byStratum[stratum] = {
        graphql: {
          n: graphqlStratum.length,
          latency: calculateStats(graphqlStratum.map((s) => s.latencyMean)),
          payload: calculateStats(graphqlStratum.map((s) => s.payloadBytesAvg)),
        },
        rest: {
          n: restStratum.length,
          latency: calculateStats(restStratum.map((s) => s.latencyMean)),
          payload: calculateStats(restStratum.map((s) => s.payloadBytesAvg)),
        },
      };
    }
  }

  // Comparison metrics
  const gLatency = analysis.overall.graphql.latency;
  const rLatency = analysis.overall.rest.latency;
  const gPayload = analysis.overall.graphql.payload;
  const rPayload = analysis.overall.rest.payload;
  const gCalls = analysis.overall.graphql.apiCalls;
  const rCalls = analysis.overall.rest.apiCalls;

  analysis.comparison = {
    latencyReduction: {
      absolute: rLatency.mean - gLatency.mean,
      relative:
        (((rLatency.mean - gLatency.mean) / rLatency.mean) * 100).toFixed(1) +
        "%",
      ratio: (rLatency.mean / gLatency.mean).toFixed(2),
    },
    payloadReduction: {
      absolute: rPayload.mean - gPayload.mean,
      relative:
        (((rPayload.mean - gPayload.mean) / rPayload.mean) * 100).toFixed(1) +
        "%",
      ratio: (rPayload.mean / gPayload.mean).toFixed(2),
    },
    apiCallReduction: {
      absolute: rCalls.mean - gCalls.mean,
      relative:
        (((rCalls.mean - gCalls.mean) / rCalls.mean) * 100).toFixed(1) + "%",
      ratio: (rCalls.mean / gCalls.mean).toFixed(2),
    },
  };

  // Save analysis
  const resultsDir = path.join(__dirname, "../results");
  fs.writeFileSync(
    path.join(resultsDir, "comparison.json"),
    JSON.stringify(analysis, null, 2),
  );

  // Generate summary CSV
  const csvHeader = "Metric,API,N,Mean,Median,Std,P95,CI95_Lower,CI95_Upper\n";
  const csvRows = [];

  // Overall metrics
  csvRows.push(
    `Latency (ms),GraphQL,${gLatency.n},${gLatency.mean.toFixed(2)},${gLatency.median.toFixed(2)},${gLatency.std.toFixed(2)},${gLatency.p95.toFixed(2)},${gLatency.ci95.lower.toFixed(2)},${gLatency.ci95.upper.toFixed(2)}`,
  );
  csvRows.push(
    `Latency (ms),REST,${rLatency.n},${rLatency.mean.toFixed(2)},${rLatency.median.toFixed(2)},${rLatency.std.toFixed(2)},${rLatency.p95.toFixed(2)},${rLatency.ci95.lower.toFixed(2)},${rLatency.ci95.upper.toFixed(2)}`,
  );
  csvRows.push(
    `Payload (bytes),GraphQL,${gPayload.n},${gPayload.mean.toFixed(0)},${gPayload.median.toFixed(0)},${gPayload.std.toFixed(0)},${gPayload.p95.toFixed(0)},${gPayload.ci95.lower.toFixed(0)},${gPayload.ci95.upper.toFixed(0)}`,
  );
  csvRows.push(
    `Payload (bytes),REST,${rPayload.n},${rPayload.mean.toFixed(0)},${rPayload.median.toFixed(0)},${rPayload.std.toFixed(0)},${rPayload.p95.toFixed(0)},${rPayload.ci95.lower.toFixed(0)},${rPayload.ci95.upper.toFixed(0)}`,
  );
  csvRows.push(
    `API Calls,GraphQL,${gCalls.n},${gCalls.mean.toFixed(1)},${gCalls.median.toFixed(1)},${gCalls.std.toFixed(2)},${gCalls.p95.toFixed(1)},${gCalls.ci95.lower.toFixed(1)},${gCalls.ci95.upper.toFixed(1)}`,
  );
  csvRows.push(
    `API Calls,REST,${rCalls.n},${rCalls.mean.toFixed(1)},${rCalls.median.toFixed(1)},${rCalls.std.toFixed(2)},${rCalls.p95.toFixed(1)},${rCalls.ci95.lower.toFixed(1)},${rCalls.ci95.upper.toFixed(1)}`,
  );

  fs.writeFileSync(
    path.join(resultsDir, "summary.csv"),
    csvHeader + csvRows.join("\n"),
  );

  // Generate detailed per-repo CSV
  const detailedHeader =
    "Repository,Stratum,Stars,GraphQL_Latency,GraphQL_Payload,REST_Latency,REST_Payload,REST_Calls\n";
  const detailedRows = [];

  for (const gResult of graphqlResults.results) {
    const rResult = restResults.results.find(
      (r) => r.repository === gResult.repository,
    );
    if (rResult && gResult.summary.latencyMean && rResult.summary.latencyMean) {
      detailedRows.push(
        [
          gResult.repository,
          gResult.stratum,
          gResult.stargazerCount,
          gResult.summary.latencyMean.toFixed(2),
          gResult.summary.payloadBytesAvg.toFixed(0),
          rResult.summary.latencyMean.toFixed(2),
          rResult.summary.payloadBytesAvg.toFixed(0),
          rResult.summary.apiCallCount || 7,
        ].join(","),
      );
    }
  }

  fs.writeFileSync(
    path.join(resultsDir, "detailed-results.csv"),
    detailedHeader + detailedRows.join("\n"),
  );

  // Print summary
  console.log("\n" + "═".repeat(70));
  console.log("GRAPHQL vs REST COMPARISON RESULTS");
  console.log("═".repeat(70));

  console.log(
    "\n┌─────────────────────────────────────────────────────────────────────┐",
  );
  console.log(
    "│                        OVERALL STATISTICS                           │",
  );
  console.log(
    "├────────────────┬───────────────────────┬───────────────────────────┤",
  );
  console.log(
    "│    Metric      │      GraphQL          │         REST              │",
  );
  console.log(
    "├────────────────┼───────────────────────┼───────────────────────────┤",
  );
  console.log(
    `│ Latency (ms)   │ ${gLatency.mean.toFixed(1).padStart(8)} ± ${gLatency.std.toFixed(1).padStart(6)} │ ${rLatency.mean.toFixed(1).padStart(8)} ± ${rLatency.std.toFixed(1).padStart(8)}    │`,
  );
  console.log(
    `│ Latency P95    │ ${gLatency.p95.toFixed(1).padStart(8)}             │ ${rLatency.p95.toFixed(1).padStart(8)}               │`,
  );
  console.log(
    `│ Payload (KB)   │ ${(gPayload.mean / 1024).toFixed(2).padStart(8)}             │ ${(rPayload.mean / 1024).toFixed(2).padStart(8)}               │`,
  );
  console.log(
    `│ API Calls      │ ${gCalls.mean.toFixed(0).padStart(8)}             │ ${rCalls.mean.toFixed(0).padStart(8)}               │`,
  );
  console.log(
    "└────────────────┴───────────────────────┴───────────────────────────┘",
  );

  console.log(
    "\n┌─────────────────────────────────────────────────────────────────────┐",
  );
  console.log(
    "│                     GRAPHQL ADVANTAGES                              │",
  );
  console.log(
    "├────────────────────────────────────────────────────────────────────┤",
  );
  console.log(
    `│ Latency reduction: ${analysis.comparison.latencyReduction.relative.padStart(7)} (${analysis.comparison.latencyReduction.ratio}x faster)                     │`,
  );
  console.log(
    `│ Payload reduction: ${analysis.comparison.payloadReduction.relative.padStart(7)} (${analysis.comparison.payloadReduction.ratio}x smaller)                    │`,
  );
  console.log(
    `│ API call reduction: ${analysis.comparison.apiCallReduction.relative.padStart(6)} (${analysis.comparison.apiCallReduction.ratio}x fewer)                      │`,
  );
  console.log(
    "└────────────────────────────────────────────────────────────────────┘",
  );

  console.log("\nBY STRATUM:");
  console.log(
    "┌──────────┬───────────────────┬───────────────────┬─────────────────┐",
  );
  console.log(
    "│ Stratum  │ GraphQL (ms)      │ REST (ms)         │ Speedup         │",
  );
  console.log(
    "├──────────┼───────────────────┼───────────────────┼─────────────────┤",
  );

  for (const [stratum, data] of Object.entries(analysis.byStratum)) {
    const gLat = data.graphql.latency.mean;
    const rLat = data.rest.latency.mean;
    const speedup = (rLat / gLat).toFixed(2);
    console.log(
      `│ ${stratum.padEnd(8)} │ ${gLat.toFixed(1).padStart(8)} ± ${data.graphql.latency.std.toFixed(1).padStart(5)} │ ${rLat.toFixed(1).padStart(8)} ± ${data.rest.latency.std.toFixed(1).padStart(5)} │ ${speedup.padStart(6)}x         │`,
    );
  }
  console.log(
    "└──────────┴───────────────────┴───────────────────┴─────────────────┘",
  );

  console.log("\nOutput files:");
  console.log("   - results/comparison.json");
  console.log("   - results/summary.csv");
  console.log("   - results/detailed-results.csv");

  console.log("\nAnalysis complete!");
}

main().catch(console.error);
