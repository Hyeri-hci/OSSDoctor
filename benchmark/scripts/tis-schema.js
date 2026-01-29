/**
 * Target Information Set (TIS) Definition
 *
 * This module defines the exact fields that both GraphQL and REST
 * collectors must retrieve. No additional information is allowed.
 *
 * TIS is based on OSSDoctor's actual repository-level analysis requirements.
 */

/**
 * Target Information Set Schema
 * Both GraphQL and REST must collect exactly these fields
 */
export const TIS_SCHEMA = {
  // Basic Metadata
  name: { type: "string", required: true, description: "Repository name" },
  owner: { type: "string", required: true, description: "Owner login" },
  fullName: {
    type: "string",
    required: true,
    description: "Full name (owner/repo)",
  },
  description: {
    type: "string",
    required: false,
    description: "Repository description",
  },

  // Popularity Metrics
  stargazerCount: {
    type: "number",
    required: true,
    description: "Number of stars",
  },
  forkCount: { type: "number", required: true, description: "Number of forks" },
  watcherCount: {
    type: "number",
    required: true,
    description: "Number of watchers",
  },

  // Issue Statistics
  openIssueCount: {
    type: "number",
    required: true,
    description: "Open issues count",
  },
  closedIssueCount: {
    type: "number",
    required: true,
    description: "Closed issues count",
  },
  totalIssueCount: {
    type: "number",
    required: true,
    description: "Total issues count",
  },

  // Pull Request Statistics
  openPullRequestCount: {
    type: "number",
    required: true,
    description: "Open PRs count",
  },
  closedPullRequestCount: {
    type: "number",
    required: true,
    description: "Closed PRs count",
  },
  mergedPullRequestCount: {
    type: "number",
    required: true,
    description: "Merged PRs count",
  },
  totalPullRequestCount: {
    type: "number",
    required: true,
    description: "Total PRs count",
  },

  // Contributor Info
  contributorCount: {
    type: "number",
    required: true,
    description: "Number of contributors",
  },

  // Technology & License
  primaryLanguage: {
    type: "string",
    required: false,
    description: "Main programming language",
  },
  license: { type: "string", required: false, description: "License SPDX ID" },

  // Activity Timestamps
  lastPushedAt: {
    type: "string",
    required: true,
    description: "Last push timestamp (ISO 8601)",
  },
  createdAt: {
    type: "string",
    required: true,
    description: "Creation timestamp (ISO 8601)",
  },
};

/**
 * Validates collected data against TIS schema
 */
export function validateTIS(data) {
  const errors = [];
  const warnings = [];

  for (const [field, spec] of Object.entries(TIS_SCHEMA)) {
    if (spec.required && (data[field] === undefined || data[field] === null)) {
      errors.push(`Missing required field: ${field}`);
    }

    if (data[field] !== undefined && data[field] !== null) {
      const actualType = typeof data[field];
      if (spec.type === "number" && actualType !== "number") {
        errors.push(`Field ${field} should be number, got ${actualType}`);
      }
      if (spec.type === "string" && actualType !== "string") {
        errors.push(`Field ${field} should be string, got ${actualType}`);
      }
    }
  }

  // Check for extra fields
  const allowedFields = new Set(Object.keys(TIS_SCHEMA));
  for (const field of Object.keys(data)) {
    if (!allowedFields.has(field)) {
      warnings.push(`Extra field not in TIS: ${field}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Extract only TIS fields from raw data
 */
export function extractTIS(rawData) {
  const tis = {};
  for (const field of Object.keys(TIS_SCHEMA)) {
    if (rawData[field] !== undefined) {
      tis[field] = rawData[field];
    }
  }
  return tis;
}

/**
 * Compare two TIS results for equivalence
 */
export function compareTIS(graphqlData, restData) {
  const differences = [];

  for (const field of Object.keys(TIS_SCHEMA)) {
    const gVal = graphqlData[field];
    const rVal = restData[field];

    if (gVal !== rVal) {
      // Allow for minor timestamp differences
      if (TIS_SCHEMA[field].type === "string" && field.includes("At")) {
        const gDate = new Date(gVal).getTime();
        const rDate = new Date(rVal).getTime();
        if (Math.abs(gDate - rDate) < 1000) continue; // Within 1 second
      }

      differences.push({
        field,
        graphql: gVal,
        rest: rVal,
      });
    }
  }

  return {
    equivalent: differences.length === 0,
    differences,
  };
}

export default TIS_SCHEMA;
