/**
 * Environment Validation
 * ======================
 * Validates required environment variables at server startup.
 * Missing or unsafe values cause a fatal error in production and a clear
 * warning in development so misconfiguration is caught immediately.
 */

const PLACEHOLDER_PATTERN =
  /REPLACE_WITH|PLACEHOLDER|YOUR_|CHANGE_ME|EXAMPLE|TODO|FIXME/i;

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const isProd = process.env["NODE_ENV"] === "production";

  // ── DATABASE_URL ──────────────────────────────────────────────────────────
  const dbUrl = process.env["DATABASE_URL"];
  if (!dbUrl) {
    errors.push("DATABASE_URL is not set.");
  } else if (isProd && PLACEHOLDER_PATTERN.test(dbUrl)) {
    errors.push("DATABASE_URL contains a placeholder value in production.");
  }

  // ── AUTH_SECRET ───────────────────────────────────────────────────────────
  const secret = process.env["AUTH_SECRET"];
  if (!secret) {
    errors.push("AUTH_SECRET is not set. Generate with: openssl rand -hex 32");
  } else if (secret.length < 32) {
    errors.push(
      `AUTH_SECRET is too short (${secret.length} chars; minimum 32). ` +
        "Generate with: openssl rand -hex 32",
    );
  } else if (isProd && PLACEHOLDER_PATTERN.test(secret)) {
    errors.push("AUTH_SECRET contains a placeholder value in production.");
  }

  // ── OAuth Providers ───────────────────────────────────────────────────────
  const hasGitHub =
    !!(process.env["AUTH_GITHUB_ID"] ?? process.env["GITHUB_ID"]) &&
    !!(process.env["AUTH_GITHUB_SECRET"] ?? process.env["GITHUB_SECRET"]);
  const hasGoogle =
    !!process.env["AUTH_GOOGLE_ID"] && !!process.env["AUTH_GOOGLE_SECRET"];

  if (!hasGitHub && !hasGoogle) {
    warnings.push(
      "No OAuth provider is configured. Only the credentials provider will be available. " +
        "Set AUTH_GITHUB_ID + AUTH_GITHUB_SECRET to enable GitHub login.",
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Call this once during server startup.
 * In production: throws on any error.
 * In development: logs errors/warnings but continues to allow hot-reload fixes.
 */
export function assertEnvValid(): void {
  const result = validateEnv();
  const isProd = process.env["NODE_ENV"] === "production";

  for (const warning of result.warnings) {
    console.warn(`[env] WARNING: ${warning}`);
  }

  if (!result.valid) {
    const lines = [
      "[env] FATAL: Required environment variables are missing or invalid:",
      ...result.errors.map((e) => `  • ${e}`),
      "",
      "  Copy .env.example → .env and fill in real values.",
      "  See README.md for setup instructions.",
    ].join("\n");

    if (isProd) {
      throw new Error(lines);
    } else {
      console.error(lines);
    }
  }
}
