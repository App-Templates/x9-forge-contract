---
phase: 01-modelli-bridge-145
status: clean
depth: standard
files_reviewed: 4
diff_base: 4ea787345aa04f7c7d2a28ab100887e1607e4dcc
latest_targeted_recheck: a5103c97c39b6178e8d53f201f27352c0fb58220
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
---

# Code review — release 1.45.0

Scope: explicit package.json, CHANGELOG.md, README.md and tests/cjs/public-entrypoints-first.mjs; current uncommitted changes against4ea7873. Reviewed native manifest, phase CONTEXT/PLAN and code-review workflow. No test, install or repository mutation performed; this is static review, not release verification.

Latest targeted recheck: commit `a5103c97c39b6178e8d53f201f27352c0fb58220`, the two pnpm provenance assertions only. **Status remains clean.** Removing the full-SHA substring assumption from pnpm's truncated virtual-folder name is appropriate. The replacement requires the real installed package under the native `.pnpm` store and byte-identical installed/root locks; importer-specific exact SHA, package version, export map and full dist hash checks remain intact. This does not weaken the resolved importer finding. The native installation results reported by the parent are separate execution evidence, not tests run by this reviewer.

## Recheck outcome

**Clean after correction.** Targeted read of the updated runner confirms the selected importer key is derived from consumer/install-root, its block is delimited, and the bridge dependency must have both the exact Git-SHA specifier and the matching codeload resolution (with optional peer suffix). An unrelated expected-SHA lock entry can no longer satisfy this guard. No tests executed by this reviewer; deliberate mutation and install qualification remain execution evidence to collect.

### Resolved WR-01 — [P2] Bind the lock guard to the actual consumer importer

**File:** `tests/cjs/public-entrypoints-first.mjs:52–65` (corrected block).

The earlier lock assertion only checked that the expected codeload URL occurred anywhere in pnpm-lock.yaml. An unused expected-SHA entry could therefore satisfy it despite a different selected importer resolution. The updated importer-specific assertions remove that false-positive path.

**Applied fix:** Importer selection and dependency specifier/resolution assertions now bind provenance to the selected context. Retain the planned qualification mutation preserving an unrelated expected-SHA entry while changing this importer's resolution, followed by byte restoration.

## Other reviewed behavior

- CJS provenance resolution is anchored with createRequire at the explicit consumer context. Child first-import probes use that context as cwd in both formats, with fresh processes and existing canonical valid/invalid parser checks retained.
- Installed package realpath must lie under the private installation root's node_modules and outside the author bridge; complete dist path/hash maps and export maps are compared.
- Default no-option path still uses bridge cwd and the same probe bodies/result/report shape. Legacy positional report and explicit --report select the output path without adding provenance in default mode. Static equivalence checked; no execution credited by this review.
- package.json changes only version. The README delta is restricted to release version, public entrypoint list and actual SHA/prepare/dist behavior. CHANGELOG distinguishes already-approved contracts from runtime implementation.

No further product feature or historical documentation cleanup requested.
