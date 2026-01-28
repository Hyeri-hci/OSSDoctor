/**
 * Full Benchmark Runner
 *
 * Executes the complete benchmark pipeline:
 * 1. Verify dataset exists
 * 2. Run GraphQL benchmark
 * 3. Run REST benchmark
 * 4. Generate comparison analysis
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n${"═".repeat(60)}`);
    console.log(`Running: ${scriptName}`);
    console.log("═".repeat(60));

    const child = spawn("node", [path.join(__dirname, scriptName)], {
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
    "║     OSSDoctor Full Benchmark Suite                             ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );

  const startTime = Date.now();

  try {
    // Check dataset exists
    const datasetPath = path.join(__dirname, "../dataset/repos.json");
    if (!fs.existsSync(datasetPath)) {
      console.log("\nDataset not found. Collecting dataset first...");
      await runScript("collect-dataset.js");
    } else {
      console.log("\nDataset found.");
    }

    // Run GraphQL benchmark
    await runScript("benchmark-graphql.js");

    // Run REST benchmark
    await runScript("benchmark-rest.js");

    // Run analysis
    await runScript("analyze-results.js");

    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

    console.log("\n" + "═".repeat(60));
    console.log("FULL BENCHMARK COMPLETE");
    console.log("═".repeat(60));
    console.log(`\nTotal execution time: ${elapsed} minutes`);
    console.log("\nOutput files:");
    console.log("   - dataset/repos.json");
    console.log("   - results/graphql/");
    console.log("   - results/rest/");
    console.log("   - results/summary.csv");
    console.log("   - results/comparison.json");
  } catch (error) {
    console.error("\nBenchmark failed:", error.message);
    process.exit(1);
  }
}

main();
