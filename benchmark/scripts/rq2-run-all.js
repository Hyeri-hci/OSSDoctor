/**
 * RQ2: Full Benchmark Runner
 *
 * Executes the complete RQ2 benchmark pipeline:
 * 1. Run GraphQL complexity benchmark
 * 2. Run REST complexity benchmark
 * 3. Analyze results and calculate effect sizes
 * 4. Generate journal-ready figures
 *
 * Research Question:
 * "How does query complexity affect the performance gap between GraphQL and REST APIs?"
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptName, isNode = true) {
  return new Promise((resolve, reject) => {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`Running: ${scriptName}`);
    console.log("═".repeat(60));

    const command = isNode ? "node" : "python";
    const child = spawn(command, [path.join(__dirname, scriptName)], {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${scriptName} exited with code ${code}`));
      }
    });

    child.on("error", reject);
  });
}

async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║   RQ2: Query Complexity Impact - Full Benchmark Suite          ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log("\nResearch Question:");
  console.log('  "How does query complexity affect the performance gap');
  console.log('   between GraphQL and REST APIs?"');

  const startTime = Date.now();

  try {
    // Check dataset exists
    const datasetPath = path.join(__dirname, "../dataset/repos.json");
    if (!fs.existsSync(datasetPath)) {
      console.error("\nDataset not found. Run RQ1 collect-dataset.js first.");
      process.exit(1);
    } else {
      const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf-8"));
      console.log(
        `\nDataset: ${dataset.repositories.length} repositories (reusing from RQ1)`,
      );
    }

    // Step 1: Run GraphQL complexity benchmark
    await runScript("rq2-benchmark-graphql.js");

    // Step 2: Run REST complexity benchmark
    await runScript("rq2-benchmark-rest.js");

    // Step 3: Analyze results
    await runScript("rq2-analyze.js");

    // Step 4: Generate figures (Python)
    console.log("\n" + "═".repeat(60));
    console.log("Generating journal-ready figures...");
    console.log("═".repeat(60));

    try {
      await runScript("rq2-generate-figures.py", false);
    } catch (figError) {
      console.log(
        "\nNote: Figure generation skipped (Python/matplotlib not available)",
      );
      console.log("Run manually: python scripts/rq2-generate-figures.py");
    }

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log("\n" + "═".repeat(70));
    console.log("RQ2 BENCHMARK COMPLETE");
    console.log("═".repeat(70));
    console.log(`\nTotal execution time: ${elapsed} minutes`);
    console.log("\nOutput files:");
    console.log("   Data:");
    console.log("   - results/rq2/graphql-complexity-*.json");
    console.log("   - results/rq2/rest-complexity-*.json");
    console.log("   - results/rq2/graphql-aggregate.json");
    console.log("   - results/rq2/rest-aggregate.json");
    console.log("   Analysis:");
    console.log("   - results/rq2/comparison.json");
    console.log("   - results/rq2/complexity-comparison.csv");
    console.log("   Figures:");
    console.log("   - figures/rq2-journal/fig_a_latency_by_complexity.pdf");
    console.log("   - figures/rq2-journal/fig_b_gap_scaling.pdf");
    console.log("   - figures/rq2-journal/fig_c_api_calls.pdf");
    console.log("   - figures/rq2-journal/fig_d_payload.pdf");
    console.log("   - figures/rq2-journal/fig_e_effect_size.pdf");
    console.log("   - figures/rq2-journal/fig_composite_rq2.pdf");
  } catch (error) {
    console.error("\nBenchmark failed:", error.message);
    process.exit(1);
  }
}

main();
