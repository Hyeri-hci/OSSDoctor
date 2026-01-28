/**
 * PHASE 1: Dataset Collection Script
 *
 * Collects 100 public GitHub repositories using stratified sampling
 * based on explicit, reproducible criteria.
 *
 * Selection Criteria:
 * - Public repository
 * - Stars ≥ 500
 * - At least 10 commits in the last 12 months
 * - Has issues or pull requests
 *
 * Stratification:
 * - Small (500–2,000 stars): 30 repos
 * - Medium (2,000–10,000 stars): 40 repos
 * - Large (≥10,000 stars): 30 repos
 */

import { Octokit } from "@octokit/rest";
import { graphql } from "@octokit/graphql";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root
const envPath = path.join(__dirname, "../../.env");
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  console.error("GITHUB_TOKEN not found in environment variables");
  console.error("   Please ensure GITHUB_TOKEN is set in .env file");
  process.exit(1);
}

// Validate token format
if (
  !GITHUB_TOKEN.startsWith("ghp_") &&
  !GITHUB_TOKEN.startsWith("github_pat_")
) {
  console.warn("Warning: GITHUB_TOKEN may be invalid (unexpected format)");
}

console.log(`Token loaded: ${GITHUB_TOKEN.substring(0, 10)}...`);

// Initialize clients
const octokit = new Octokit({ auth: GITHUB_TOKEN });
const graphqlWithAuth = graphql.defaults({
  headers: { authorization: `token ${GITHUB_TOKEN}` },
});

// Configuration
const CONFIG = {
  stratification: {
    small: { minStars: 500, maxStars: 2000, count: 30 },
    medium: { minStars: 2000, maxStars: 10000, count: 40 },
    large: { minStars: 10000, maxStars: Infinity, count: 30 },
  },
  minCommitsInYear: 10,
  totalRepos: 100,
  perPage: 100,
  cooldownMs: 1000,
};

// Calculate date 12 months ago
const oneYearAgo = new Date();
oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
const oneYearAgoISO = oneYearAgo.toISOString().split("T")[0];

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Search repositories by star range using GitHub Search API
 */
async function searchRepositories(minStars, maxStars, limit) {
  const repos = [];
  let page = 1;
  
  // Build star query properly for different ranges
  let starQuery;
  if (maxStars === Infinity) {
    starQuery = `stars:>=${minStars}`;
  } else {
    starQuery = `stars:${minStars}..${maxStars}`;
  }

  console.log(
    `\n🔍 Searching for repos with ${starQuery}...`,
  );

  while (repos.length < limit * 3) {
    // Fetch extra for filtering
    try {
      const query = `${starQuery} pushed:>${oneYearAgoISO} is:public`;

      const response = await octokit.search.repos({
        q: query,
        sort: "stars",
        order: "desc",
        per_page: CONFIG.perPage,
        page: page,
      });

      if (response.data.items.length === 0) break;

      repos.push(...response.data.items);
      console.log(
        `Fetched page ${page}: ${response.data.items.length} repos (total: ${repos.length})`,
      );

      page++;
      await sleep(CONFIG.cooldownMs);

      // GitHub Search API returns max 1000 results
      if (page > 10) break;
    } catch (error) {
      console.error(`Error on page ${page}:`, error.message);
      break;
    }
  }

  return repos;
}

/**
 * Verify repository meets all criteria using GraphQL
 */
async function verifyRepository(owner, name) {
  const query = `
    query VerifyRepo($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        name
        owner { login }
        description
        stargazerCount
        forkCount
        watchers { totalCount }
        isPrivate
        
        defaultBranchRef {
          target {
            ... on Commit {
              history(since: "${oneYearAgo.toISOString()}") {
                totalCount
              }
            }
          }
        }
        
        issues { totalCount }
        pullRequests { totalCount }
        
        openIssues: issues(states: [OPEN]) { totalCount }
        closedIssues: issues(states: [CLOSED]) { totalCount }
        openPullRequests: pullRequests(states: [OPEN]) { totalCount }
        closedPullRequests: pullRequests(states: [CLOSED]) { totalCount }
        mergedPullRequests: pullRequests(states: [MERGED]) { totalCount }
        
        primaryLanguage { name }
        licenseInfo { spdxId }
        pushedAt
        createdAt
      }
    }
  `;

  try {
    const response = await graphqlWithAuth(query, { owner, name });
    const repo = response.repository;

    if (!repo) return null;
    if (repo.isPrivate) return null;

    // Check commit count in last 12 months
    const commitCount = repo.defaultBranchRef?.target?.history?.totalCount || 0;
    if (commitCount < CONFIG.minCommitsInYear) return null;

    // Check has issues or PRs
    const hasActivity =
      repo.issues.totalCount > 0 || repo.pullRequests.totalCount > 0;
    if (!hasActivity) return null;

    return {
      fullName: `${owner}/${name}`,
      owner: owner,
      name: name,
      description: repo.description,
      stargazerCount: repo.stargazerCount,
      forkCount: repo.forkCount,
      watcherCount: repo.watchers.totalCount,
      commitsInLastYear: commitCount,
      openIssueCount: repo.openIssues.totalCount,
      closedIssueCount: repo.closedIssues.totalCount,
      totalIssueCount: repo.issues.totalCount,
      openPullRequestCount: repo.openPullRequests.totalCount,
      closedPullRequestCount: repo.closedPullRequests.totalCount,
      mergedPullRequestCount: repo.mergedPullRequests.totalCount,
      totalPullRequestCount: repo.pullRequests.totalCount,
      primaryLanguage: repo.primaryLanguage?.name || null,
      license: repo.licenseInfo?.spdxId || null,
      lastPushedAt: repo.pushedAt,
      createdAt: repo.createdAt,
    };
  } catch (error) {
    console.error(`Verification failed for ${owner}/${name}:`, error.message);
    return null;
  }
}

/**
 * Collect repositories for a specific stratum
 */
async function collectStratum(stratumName, config) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(
    `Collecting ${stratumName.toUpperCase()} stratum (${config.count} repos)`,
  );
  console.log(
    `Stars range: ${config.minStars} - ${config.maxStars === Infinity ? "∞" : config.maxStars}`,
  );
  console.log(`${"=".repeat(60)}`);

  const candidates = await searchRepositories(
    config.minStars,
    config.maxStars,
    config.count,
  );
  const verified = [];

  console.log(`\nVerifying ${candidates.length} candidates...`);

  for (const candidate of candidates) {
    if (verified.length >= config.count) break;

    const [owner, name] = candidate.full_name.split("/");
    const repoData = await verifyRepository(owner, name);

    if (repoData) {
      verified.push({
        ...repoData,
        stratum: stratumName,
        searchRank: candidates.indexOf(candidate) + 1,
      });
      console.log(
        `  ✓ [${verified.length}/${config.count}] ${candidate.full_name} (★${repoData.stargazerCount})`,
      );
    } else {
      console.log(`  ✗ ${candidate.full_name} (did not meet criteria)`);
    }

    await sleep(500); // Rate limit protection
  }

  return verified;
}

/**
 * Main execution
 */
async function main() {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗",
  );
  console.log(
    "║     OSSDoctor Benchmark - PHASE 1: Dataset Collection          ║",
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝",
  );
  console.log(`\n Collection Date: ${new Date().toISOString()}`);
  console.log(`Target: ${CONFIG.totalRepos} repositories`);
  console.log(`Criteria:`);
  console.log(`   - Public repositories`);
  console.log(`   - Stars ≥ 500`);
  console.log(`   - Commits in last 12 months ≥ ${CONFIG.minCommitsInYear}`);
  console.log(`   - Has issues or pull requests`);

  const startTime = Date.now();
  const allRepos = [];
  const selectionLog = {
    collectionDate: new Date().toISOString(),
    criteria: CONFIG,
    oneYearAgoCutoff: oneYearAgoISO,
    strata: {},
  };

  // Collect each stratum
  for (const [stratumName, stratumConfig] of Object.entries(
    CONFIG.stratification,
  )) {
    const stratumRepos = await collectStratum(stratumName, stratumConfig);
    allRepos.push(...stratumRepos);

    selectionLog.strata[stratumName] = {
      config: stratumConfig,
      collected: stratumRepos.length,
      repositories: stratumRepos.map((r) => r.fullName),
    };
  }

  // Ensure output directory exists
  const datasetDir = path.join(__dirname, "../dataset");
  if (!fs.existsSync(datasetDir)) {
    fs.mkdirSync(datasetDir, { recursive: true });
  }

  // Sort by stratum and stars
  const stratumOrder = { large: 0, medium: 1, small: 2 };
  allRepos.sort((a, b) => {
    if (stratumOrder[a.stratum] !== stratumOrder[b.stratum]) {
      return stratumOrder[a.stratum] - stratumOrder[b.stratum];
    }
    return b.stargazerCount - a.stargazerCount;
  });

  // Add index
  allRepos.forEach((repo, idx) => {
    repo.datasetIndex = idx + 1;
  });

  // Save dataset
  const datasetPath = path.join(datasetDir, "repos.json");
  fs.writeFileSync(
    datasetPath,
    JSON.stringify(
      {
        metadata: {
          version: "1.0.0",
          collectionDate: new Date().toISOString(),
          totalCount: allRepos.length,
          criteria: {
            minStars: 500,
            minCommitsInLastYear: CONFIG.minCommitsInYear,
            requiresActivity: true,
          },
          stratification: {
            small: {
              range: "500-2000",
              count: allRepos.filter((r) => r.stratum === "small").length,
            },
            medium: {
              range: "2000-10000",
              count: allRepos.filter((r) => r.stratum === "medium").length,
            },
            large: {
              range: "10000+",
              count: allRepos.filter((r) => r.stratum === "large").length,
            },
          },
        },
        repositories: allRepos,
      },
      null,
      2,
    ),
  );

  // Save selection log
  const logPath = path.join(datasetDir, "selection-log.json");
  selectionLog.totalCollected = allRepos.length;
  selectionLog.executionTimeMs = Date.now() - startTime;
  fs.writeFileSync(logPath, JSON.stringify(selectionLog, null, 2));

  // Print summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log("\n" + "═".repeat(60));
  console.log("COLLECTION SUMMARY");
  console.log("═".repeat(60));
  console.log(`\nTotal repositories collected: ${allRepos.length}`);
  console.log(
    `   - Large (≥10k stars): ${allRepos.filter((r) => r.stratum === "large").length}`,
  );
  console.log(
    `   - Medium (2k-10k stars): ${allRepos.filter((r) => r.stratum === "medium").length}`,
  );
  console.log(
    `   - Small (500-2k stars): ${allRepos.filter((r) => r.stratum === "small").length}`,
  );
  console.log(`\nExecution time: ${elapsed}s`);
  console.log(`\nOutput files:`);
  console.log(`   - Dataset: ${datasetPath}`);
  console.log(`   - Selection Log: ${logPath}`);

  // Print language distribution
  const languages = {};
  allRepos.forEach((r) => {
    const lang = r.primaryLanguage || "Unknown";
    languages[lang] = (languages[lang] || 0) + 1;
  });

  console.log("\nLanguage Distribution:");
  Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([lang, count]) => {
      const bar = "█".repeat(Math.ceil(count / 2));
      console.log(`   ${lang.padEnd(15)} ${bar} ${count}`);
    });

  console.log("\nDataset collection complete!");
}

main().catch(console.error);
