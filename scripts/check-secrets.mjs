// Lightweight, dependency-free secret scan for local use / pre-commit.
//   node scripts/check-secrets.mjs
//
// Scans git-tracked files for high-risk secrets and verifies that .env is not
// tracked. Exits non-zero if anything is found. The CI gitleaks workflow is the
// thorough scan; this is a fast guard you can run before pushing.

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const RULES = [
  {
    name: "Supabase service_role / secret key",
    // New secret keys (sb_secret_...) and legacy service_role JWTs.
    re: /sb_secret_[A-Za-z0-9]+|"role"\s*:\s*"service_role"|\bservice_role\b\s*[:=]/,
  },
  { name: "Private key block", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: "AWS access key id", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "Twilio auth token assignment", re: /TWILIO_AUTH_TOKEN\s*[:=]\s*['"][0-9a-f]{32}['"]/i },
  { name: "Generic hardcoded secret assignment", re: /(secret|password|token)\s*[:=]\s*['"][A-Za-z0-9\/+_-]{24,}['"]/i },
];

// Files we never want to scan (placeholders, lockfiles, this scanner, config).
const SKIP = [
  /^\.env\.example$/,
  /^package-lock\.json$/,
  /^scripts\/check-secrets\.mjs$/,
  /^\.gitleaks\.toml$/,
  /(^|\/)README\.md$/,
];

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((f) => !SKIP.some((re) => re.test(f)));

const findings = [];

// 1) .env must not be tracked.
if (execSync("git ls-files .env", { encoding: "utf8" }).trim()) {
  findings.push({ file: ".env", rule: ".env is tracked by git (should be ignored)" });
}

// 2) Scan tracked file contents.
for (const file of tracked) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue; // binary / unreadable
  }
  for (const rule of RULES) {
    if (rule.re.test(text)) findings.push({ file, rule: rule.name });
  }
}

if (findings.length) {
  console.error("❌ Potential secrets found:\n");
  for (const f of findings) console.error(`  ${f.file} — ${f.rule}`);
  console.error("\nRemove the secret or add a false positive to .gitleaks.toml allowlist.");
  process.exit(1);
}

console.log(`✅ No secrets found in ${tracked.length} tracked files.`);
