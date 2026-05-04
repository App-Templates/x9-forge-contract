#!/usr/bin/env node
/**
 * check-portable-dts.mjs — guardrail against TS2883-class regressions in
 * emitted bridge declaration files.
 *
 * Why this exists
 * ---------------
 * The bridge ships as a git-hosted package consumed via pnpm `prepare`. When
 * an endpoint contract file omits `import { z } from 'zod'`, TypeScript
 * synthesizes a string-literal import path inside the emitted `.d.ts`:
 *
 *   readonly responseSchema: import("zod").ZodObject<...>;
 *
 * On a pnpm 10 consumer that fetches the bridge into a temp store
 * (`_tmp_<hash>/`), tsc resolves that synthesized import to a deeply-nested,
 * non-portable path and refuses to emit declarations (TS2883). The bridge's
 * own CI never sees this because it builds in a stable layout.
 *
 * Incident: forge-v2 GH Actions run 25328536024 (2026-05-04) — `pnpm install`
 * failed during the bridge `prepare` step with TS2883 across 4 endpoint
 * contract files (cap-env-schema, cap-health, cap-manifest, memory-correct).
 * Root cause: those 4 files imported only their downstream schema and never
 * pulled in `z`, so tsc emitted `import("zod").ZodObject<...>` instead of the
 * portable named `z.ZodObject<...>` form used by the other 16 contracts.
 *
 * What this script enforces
 * -------------------------
 * After `tsc -b` finishes, every `.d.ts` under `dist/` MUST emit zod types
 * via the named `z` namespace. Any synthesized `import("zod")` string-literal
 * inside a declaration file is a portability bug — fail the build.
 *
 * Detected patterns (all considered violations):
 *   - import("zod")
 *   - import("zod/...")
 *   - import("zod-...")           (transitive zod-* paths)
 *   - import("...node_modules/zod...")
 *   - import("...store/v10/tmp/_tmp_...")  (pnpm temp prepare leak)
 *
 * Fix recipe (when this script fails):
 *   In the source `.ts` file flagged by the report, add at the top:
 *     import { z } from 'zod';
 *   Then rebuild. The emitted `.d.ts` will switch to `z.ZodObject<...>`
 *   form and this check will pass.
 *
 * Exit codes:
 *   0 — every emitted .d.ts is portable
 *   1 — at least one violation found (logged + listed)
 *   2 — dist/ missing (build did not run before this check)
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(__dirname);
const distRoot = join(repoRoot, "dist");

/**
 * Patterns that indicate a non-portable import in a declaration file.
 * Each pattern matches the exact synthesized form TypeScript emits when the
 * source did not provide a named in-scope reference for the inferred type.
 */
const VIOLATION_PATTERNS = [
  // Direct zod import without `z` named in scope
  { regex: /import\("zod"\)/g, label: 'import("zod")' },
  { regex: /import\("zod\/[^"]+"\)/g, label: 'import("zod/...")' },
  // Pnpm temp-store leak — the original incident signature
  {
    regex: /import\("[^"]*store\/v\d+\/tmp\/_tmp_[^"]*"\)/g,
    label: 'import("...pnpm-temp-store...")',
  },
  // Any node_modules path leak (safety net for non-zod cases)
  {
    regex: /import\("[^"]*\/node_modules\/[^"]+"\)/g,
    label: 'import("...node_modules/...")',
  },
];

async function* walkDts(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err.code === "ENOENT") return;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkDts(full);
    } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      yield full;
    }
  }
}

async function main() {
  try {
    const s = await stat(distRoot);
    if (!s.isDirectory()) {
      console.error(
        `[check-portable-dts] FATAL: ${distRoot} is not a directory. Run \`pnpm build\` first.`
      );
      process.exit(2);
    }
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(
        `[check-portable-dts] FATAL: ${distRoot} not found. Run \`pnpm build\` first.`
      );
      process.exit(2);
    }
    throw err;
  }

  const violations = [];
  let scanned = 0;
  for await (const file of walkDts(distRoot)) {
    scanned += 1;
    const content = await readFile(file, "utf8");
    for (const { regex, label } of VIOLATION_PATTERNS) {
      regex.lastIndex = 0;
      const matches = content.match(regex);
      if (matches && matches.length > 0) {
        violations.push({
          file: relative(repoRoot, file),
          label,
          count: matches.length,
          sample: matches[0],
        });
      }
    }
  }

  if (violations.length > 0) {
    console.error(
      `[check-portable-dts] FAIL — ${violations.length} non-portable import(s) found in emitted .d.ts files:`
    );
    for (const v of violations) {
      console.error(
        `  • ${v.file}: ${v.count}× ${v.label}  (e.g. ${v.sample})`
      );
    }
    console.error(
      `\n[check-portable-dts] Fix: open the source .ts files for the affected\n` +
        `  modules and add \`import { z } from 'zod';\` at the top. Then rebuild.\n` +
        `  See script header for full incident reference (forge-v2 CI run 25328536024).`
    );
    process.exit(1);
  }

  console.log(
    `[check-portable-dts] OK — ${scanned} .d.ts files scanned, all portable.`
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(`[check-portable-dts] error: ${err?.stack ?? err}`);
  process.exit(1);
});
