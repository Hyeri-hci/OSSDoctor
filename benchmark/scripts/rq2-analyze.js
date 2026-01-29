/**
 * RQ2: Complexity-Based Analysis
 *
 * Analyzes benchmark results and generates:
 * - Statistical comparison by complexity level
 * - Effect size calculations (Cohen's d, Cliff's delta)
 * - Performance gap scaling analysis
 * - CSV output for visualization
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import * as ss from "simple-statistics";
import { COMPLEXITY_LEVELS } from "./rq2-complexity-schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Bootstrap confidence interval
 */
function bootstrapCI(data, statFn, confidence = 0.95, iterations = 10000) {
  if (data.length === 0) return { lower: 0, upper: 0, mean: 0 };

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
 * Calculate Cohen's d effect size
 */
function cohensD(group1, group2) {
  const n1 = group1.length;
  const n2 = group2.length;
  const mean1 = ss.mean(group1);
  const mean2 = ss.mean(group2);
  const var1 = ss.variance(group1);
  const var2 = ss.variance(group2);

  // Pooled standard deviation
  const pooledStd = Math.sqrt(
    ((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2),
  );

  if (pooledStd === 0) return Infinity;
  return (mean2 - mean1) / pooledStd;
}

/**
 * Calculate Cliff's delta effect size
 */
function cliffsDelata(group1, group2) {
  let greater = 0;
  let less = 0;

  for (const x of group1) {
    for (const y of group2) {
      if (x > y) greater++;
      else if (x < y) less++;
    }
  }

  const n = group1.length * group2.length;
  return (greater - less) / n;
}

/**
 * Interpret effect size magnitude
 */
function interpretEffectSize(d) {
  const absD = Math.abs(d);
  if (absD < 0.2) return "negligible";
  if (absD < 0.5) return "small";
  if (absD < 0.8) return "medium";
  return "large";
}

/**
 * Load most recent benchmark results
 */
function loadLatestResults(type) {
  const dir = path.join(__dirname, "../results/rq2");
  if (!fs.existsSync(dir)) return null;

  const prefix =
    type === "graphql" ? "graphql-complexity-" : "rest-complexity-";
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) return null;

  return JSON.parse(fs.readFileSync(path.join(dir, files[0]), "utf-8"));
}

/**
 * Main analysis
 */
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║   RQ2: Complexity-Based Analysis                               ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  // Load results
  const graphqlResults = loadLatestResults("graphql");
  const restResults = loadLatestResults("rest");

  if (!graphqlResults || !restResults) {
    console.error("Missing benchmark results. Run RQ2 benchmarks first.");
    process.exit(1);
  }

  console.log(`\nLoaded results:`);
  console.log(`   GraphQL: ${graphqlResults.results.length} repositories`);
  console.log(`   REST: ${restResults.results.length} repositories`);

  // Prepare analysis structure
  const analysis = {
    metadata: {
      timestamp: new Date().toISOString(),
      researchQuestion: "RQ2",
      graphqlTimestamp: graphqlResults.metadata.timestamp,
      restTimestamp: restResults.metadata.timestamp,
    },
    byComplexity: {},
    scaling: {},
    effectSizes: {},
  };

  // Analyze each complexity level
  for (const level of ["low", "medium", "high"]) {
    console.log(`\nAnalyzing ${level.toUpperCase()} complexity...`);

    // Extract latencies for matched repositories
    const graphqlLatencies = [];
    const restLatencies = [];
    const graphqlPayloads = [];
    const restPayloads = [];
    const restApiCalls = [];

    for (const gResult of graphqlResults.results) {
      const rResult = restResults.results.find(
        (r) => r.repository === gResult.repository,
      );

      if (
        rResult &&
        gResult.byComplexity[level]?.summary &&
        rResult.byComplexity[level]?.summary
      ) {
        graphqlLatencies.push(gResult.byComplexity[level].summary.latencyMean);
        restLatencies.push(rResult.byComplexity[level].summary.latencyMean);
        graphqlPayloads.push(
          gResult.byComplexity[level].summary.payloadBytesAvg,
        );
        restPayloads.push(rResult.byComplexity[level].summary.payloadBytesAvg);
        restApiCalls.push(rResult.byComplexity[level].summary.apiCallCount);
      }
    }

    if (graphqlLatencies.length === 0) {
      console.log(`   No matched data for ${level} complexity`);
      continue;
    }

    // Calculate statistics
    const gLatencyMean = ss.mean(graphqlLatencies);
    const gLatencyStd = ss.standardDeviation(graphqlLatencies);
    const rLatencyMean = ss.mean(restLatencies);
    const rLatencyStd = ss.standardDeviation(restLatencies);

    const gPayloadMean = ss.mean(graphqlPayloads);
    const rPayloadMean = ss.mean(restPayloads);
    const rApiCallsMean = ss.mean(restApiCalls);

    // Effect sizes
    const cohenD = cohensD(graphqlLatencies, restLatencies);
    const cliffD = cliffsDelata(graphqlLatencies, restLatencies);

    // Performance gap metrics
    const latencyGap = rLatencyMean - gLatencyMean;
    const latencyRatio = rLatencyMean / gLatencyMean;
    const latencyReduction =
      ((rLatencyMean - gLatencyMean) / rLatencyMean) * 100;

    const payloadGap = rPayloadMean - gPayloadMean;
    const payloadRatio = rPayloadMean / gPayloadMean;
    const payloadReduction =
      ((rPayloadMean - gPayloadMean) / rPayloadMean) * 100;

    analysis.byComplexity[level] = {
      n: graphqlLatencies.length,
      fieldCount: COMPLEXITY_LEVELS[level].fieldCount,
      aggregationCount: COMPLEXITY_LEVELS[level].aggregationCount,
      graphql: {
        latency: {
          mean: gLatencyMean,
          std: gLatencyStd,
          ci95: bootstrapCI(graphqlLatencies, ss.mean),
        },
        payload: {
          mean: gPayloadMean,
          std: ss.standardDeviation(graphqlPayloads),
        },
        apiCalls: 1,
      },
      rest: {
        latency: {
          mean: rLatencyMean,
          std: rLatencyStd,
          ci95: bootstrapCI(restLatencies, ss.mean),
        },
        payload: {
          mean: rPayloadMean,
          std: ss.standardDeviation(restPayloads),
        },
        apiCalls: rApiCallsMean,
      },
      comparison: {
        latency: {
          gap: latencyGap,
          ratio: latencyRatio,
          reductionPercent: latencyReduction,
        },
        payload: {
          gap: payloadGap,
          ratio: payloadRatio,
          reductionPercent: payloadReduction,
        },
      },
      effectSize: {
        cohensD: cohenD,
        cohensD_interpretation: interpretEffectSize(cohenD),
        cliffsDelata: cliffD,
        cliffsDelata_interpretation:
          Math.abs(cliffD) < 0.147
            ? "negligible"
            : Math.abs(cliffD) < 0.33
              ? "small"
              : Math.abs(cliffD) < 0.474
                ? "medium"
                : "large",
      },
    };

    console.log(`   n=${graphqlLatencies.length}`);
    console.log(
      `   GraphQL: ${gLatencyMean.toFixed(1)} ± ${gLatencyStd.toFixed(1)} ms`,
    );
    console.log(
      `   REST: ${rLatencyMean.toFixed(1)} ± ${rLatencyStd.toFixed(1)} ms`,
    );
    console.log(`   Speedup: ${latencyRatio.toFixed(2)}x`);
    console.log(
      `   Cohen's d: ${cohenD.toFixed(2)} (${interpretEffectSize(cohenD)})`,
    );
  }

  // Calculate scaling behavior
  const levels = ["low", "medium", "high"];
  const scalingData = levels
    .filter((l) => analysis.byComplexity[l])
    .map((l) => ({
      level: l,
      ...analysis.byComplexity[l],
    }));

  if (scalingData.length === 3) {
    analysis.scaling = {
      latencyGapGrowth: {
        lowToMedium: {
          gap:
            analysis.byComplexity.medium.comparison.latency.gap -
            analysis.byComplexity.low.comparison.latency.gap,
          multiplier:
            analysis.byComplexity.medium.comparison.latency.gap /
            analysis.byComplexity.low.comparison.latency.gap,
        },
        mediumToHigh: {
          gap:
            analysis.byComplexity.high.comparison.latency.gap -
            analysis.byComplexity.medium.comparison.latency.gap,
          multiplier:
            analysis.byComplexity.high.comparison.latency.gap /
            analysis.byComplexity.medium.comparison.latency.gap,
        },
        lowToHigh: {
          gap:
            analysis.byComplexity.high.comparison.latency.gap -
            analysis.byComplexity.low.comparison.latency.gap,
          multiplier:
            analysis.byComplexity.high.comparison.latency.gap /
            analysis.byComplexity.low.comparison.latency.gap,
        },
      },
      restApiCallScaling: {
        low: COMPLEXITY_LEVELS.low.restApiCalls,
        medium: COMPLEXITY_LEVELS.medium.restApiCalls,
        high: COMPLEXITY_LEVELS.high.restApiCalls,
        trend: "Linear increase with complexity",
      },
      graphqlConstant: {
        low: 1,
        medium: 1,
        high: 1,
        trend: "Constant (1 API call regardless of complexity)",
      },
    };
  }

  // Save analysis
  const resultsDir = path.join(__dirname, "../results/rq2");
  fs.writeFileSync(
    path.join(resultsDir, "comparison.json"),
    JSON.stringify(analysis, null, 2),
  );

  // Generate CSV for visualization
  const csvHeader =
    "ComplexityLevel,Fields,Aggregations,GraphQL_Latency_Mean,GraphQL_Latency_Std,REST_Latency_Mean,REST_Latency_Std,REST_APICalls,Speedup,Latency_Reduction_Pct,Cohens_d,Cliffs_delta\n";
  const csvRows = levels
    .filter((l) => analysis.byComplexity[l])
    .map((l) => {
      const data = analysis.byComplexity[l];
      return [
        l,
        data.fieldCount,
        data.aggregationCount,
        data.graphql.latency.mean.toFixed(2),
        data.graphql.latency.std.toFixed(2),
        data.rest.latency.mean.toFixed(2),
        data.rest.latency.std.toFixed(2),
        data.rest.apiCalls.toFixed(1),
        data.comparison.latency.ratio.toFixed(2),
        data.comparison.latency.reductionPercent.toFixed(1),
        data.effectSize.cohensD.toFixed(2),
        data.effectSize.cliffsDelata.toFixed(3),
      ].join(",");
    });

  fs.writeFileSync(
    path.join(resultsDir, "complexity-comparison.csv"),
    csvHeader + csvRows.join("\n"),
  );

  // Print summary
  console.log("\n" + "═".repeat(70));
  console.log("RQ2 ANALYSIS SUMMARY: Query Complexity Impact");
  console.log("═".repeat(70));

  console.log(
    "\n┌─────────────┬────────┬───────────────────┬───────────────────┬─────────┬──────────┐",
  );
  console.log(
    "│ Complexity  │ Fields │ GraphQL (ms)      │ REST (ms)         │ Speedup │ Cohen's d│",
  );
  console.log(
    "├─────────────┼────────┼───────────────────┼───────────────────┼─────────┼──────────┤",
  );

  for (const level of levels) {
    if (analysis.byComplexity[level]) {
      const data = analysis.byComplexity[level];
      console.log(
        `│ ${level.padEnd(11)} │ ${String(data.fieldCount).padStart(6)} │ ${data.graphql.latency.mean.toFixed(1).padStart(7)} ± ${data.graphql.latency.std.toFixed(1).padStart(6)} │ ${data.rest.latency.mean.toFixed(1).padStart(7)} ± ${data.rest.latency.std.toFixed(1).padStart(6)} │ ${data.comparison.latency.ratio.toFixed(2).padStart(7)}x│ ${data.effectSize.cohensD.toFixed(2).padStart(8)} │`,
      );
    }
  }
  console.log(
    "└─────────────┴────────┴───────────────────┴───────────────────┴─────────┴──────────┘",
  );

  console.log("\nKEY FINDINGS:");
  if (analysis.byComplexity.low && analysis.byComplexity.high) {
    const lowRatio = analysis.byComplexity.low.comparison.latency.ratio;
    const highRatio = analysis.byComplexity.high.comparison.latency.ratio;
    console.log(`   • Low complexity speedup: ${lowRatio.toFixed(2)}x`);
    console.log(`   • High complexity speedup: ${highRatio.toFixed(2)}x`);
    console.log(
      `   • Speedup increase: ${((highRatio / lowRatio - 1) * 100).toFixed(1)}%`,
    );
    console.log(
      `   • REST API calls scale from ${COMPLEXITY_LEVELS.low.restApiCalls} to ${COMPLEXITY_LEVELS.high.restApiCalls}`,
    );
    console.log(`   • GraphQL API calls remain constant at 1`);
  }

  console.log("\nOutput files:");
  console.log("   - results/rq2/comparison.json");
  console.log("   - results/rq2/complexity-comparison.csv");

  console.log("\nAnalysis complete!");
}

main().catch(console.error);
