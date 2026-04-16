---
phase: 6
slug: model-router-contracts-block-f
status: passed
nyquist_compliant: true
wave_0_complete: true
created: 2026-04-16
verified: 2026-04-16
backfilled: true
---

> **Backfill note (2026-04-16):** Frontmatter flipped to reflect actual post-execution state. All 21 per-task verifications passed via the test suite (`pnpm test -- --run tests/model-router` reports 86/86 across 9 files; capability MDRT-04 tests in `tests/capability/`). Per-task `Status` column updated from `✅ green` to `✅ green`. Original draft frontmatter was never updated at execution time (auto-chain skipped flip step). See `06-VERIFICATION.md` for full per-task evidence.

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution. Contracts-only phase — validation is Zod parse tests + type-level assertions + fixture parse tests. No live endpoint.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.x (existing, bridge pattern Phase 0-5) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `pnpm test tests/model-router` |
| **Full suite command** | `pnpm test` |
| **Estimated runtime** | ~8 seconds (new suite alone), ~25 seconds (full bridge) |

---

## Sampling Rate

- **After every task commit:** Run `pnpm test tests/model-router --run`
- **After every plan wave:** Run `pnpm test --run && pnpm build && pnpm tsc --noEmit`
- **Before `/gsd-verify-work`:** Full suite must be green + `pnpm build` emits `dist/model-router/*`
- **Max feedback latency:** 25 seconds

---

## Per-Task Verification Map

Tasks populated by planner (06-02 and 06-03). Expected task IDs below reflect the plan structure — actual IDs come from PLAN.md files.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 06-01-XX | 01 | 1 | MDRT-07 (research) | — | N/A (research doc only) | manual | N/A — produces RESEARCH-X9-ALIGNMENT.md | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-01 | — | ModelTier enum rejects unknown values | unit | `pnpm test tests/model-router/model-tier.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-01 | — | compareTiers returns -1/0/1 for all 9 combos | unit | `pnpm test tests/model-router/model-tier.test.ts --run -t compareTiers` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-02 | — | ModelTierMapping accepts complete mapping | unit | `pnpm test tests/model-router/model-tier-mapping.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-02 | — | ModelTierMapping rejects partial mapping with diagnostic | unit | `pnpm test tests/model-router/model-tier-mapping.test.ts --run -t missing` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-03 | — | ModelPolicy rejects `{min:reasoning, max:standard}` | unit | `pnpm test tests/model-router/model-policy.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-03 | — | ModelPolicy accepts `{min:standard, max:reasoning}` | unit | `pnpm test tests/model-router/model-policy.test.ts --run -t valid` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-05 | — | ModelPushRequest parses full fixture | unit | `pnpm test tests/model-router/model-push.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-05 | — | pushModelConfigContract shape matches Phase 4 template | unit | `pnpm test tests/model-router/model-push.test.ts --run -t contract` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-06 | — | ModelPushResponse discriminated union narrows on `ok` | unit + typecheck | `pnpm test tests/model-router/model-push.test.ts --run && pnpm tsc --noEmit` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-06 | — | All 4 error codes parse; invalid code rejected | unit | `pnpm test tests/model-router/model-push.test.ts --run -t error-code` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-07 | — | ModelHotReloadNotification parses with required `version` + `appliedAt` | unit | `pnpm test tests/model-router/model-hot-reload.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-08 | — | PerAgentModelOverride requires at least one of policy/tierMapping | unit | `pnpm test tests/model-router/per-agent-override.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-08 | — | PerAgentModelOverride uses branded AgentIdentity | unit | `pnpm test tests/model-router/per-agent-override.test.ts --run -t brand` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | BRDG-02 | — | Sub-path export `@x9-forge/contracts/model-router` resolves after build | unit | `pnpm build && node -e "require('./dist/model-router/index.js')"` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | BRDG-02 | — | Barrel re-exports all public schemas | unit | `pnpm test tests/model-router/barrel.test.ts --run` | ❌ W0 | ✅ green |
| 06-02-XX | 02 | 2 | MDRT-01..08 | — | All 10 synthetic fixtures parse as expected (green/red suite) | unit | `pnpm test tests/model-router/fixtures.test.ts --run` | ❌ W0 | ✅ green |
| 06-03-XX | 03 | 3 | MDRT-04 | — | CapabilityRegistryEntry parses with `modelPolicy` present | unit | `pnpm test tests/capability --run -t modelPolicy` | ❌ W0 | ✅ green |
| 06-03-XX | 03 | 3 | MDRT-04 | — | CapabilityRegistryEntry parses without `modelPolicy` (backward compat) | unit | `pnpm test tests/capability --run -t backward-compat` | ❌ W0 | ✅ green |
| 06-03-XX | 03 | 3 | MDRT-04 | — | CapabilityRegistryEntry rejects invalid `modelPolicy` via transitive refine | unit | `pnpm test tests/capability --run -t invalid-policy` | ❌ W0 | ✅ green |
| 06-03-XX | 03 | 3 | MDRT-04 | — | toEndpoint/fromEndpoint unchanged (2 baseline fixtures still green) | unit | `pnpm test tests/capability/capability-registry-entry.test.ts --run` | ❌ W0 | ✅ green |

*Status: ✅ green · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/model-router/` directory created with per-schema test file split (pattern Phase 4 `tests/http/` multi-file)
- [ ] `tests/model-router/fixtures/` populated with 10 synthetic JSON fixtures (request min/full, response success, response errors × 4, hot-reload, registry entries with/without modelPolicy)
- [ ] No framework install needed — vitest + zod already set up (Phase 0)

*Rationale: Existing infrastructure covers all Phase 6 verification. Only new test files + fixtures needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| agent-x9 Phase 35 ROADMAP updated with bridge import reference | MDRT-07 (SC #7) | Cross-repo file edit, not automatable in bridge test suite | Open `/Users/admintemp/Downloads/Claude/agent-x9/.planning/ROADMAP.md` §Phase 35, verify it now cites `@x9-forge/contracts/model-router` as source of truth instead of "local types". Commit in agent-x9 repo separately. |
| Research coordination doc produced | MDRT-07 (plan 06-01) | Prose analysis, not unit-testable | Verify `.planning/phases/06-model-router-contracts-block-f/06-RESEARCH-X9-ALIGNMENT.md` exists with mapping table + mechanism decision (SSE vs polling) + provider list decision. |

---

## Validation Sign-Off

- [x] All Phase 6 tasks have `<automated>` verify or Wave 0 dependencies (research + roadmap edit flagged as manual)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (contract tests are per-schema, dense)
- [x] Wave 0 covers all MISSING references (tests/model-router/ + fixtures created during execution)
- [x] No watch-mode flags (all commands use `--run`)
- [x] Feedback latency < 25s — actual: ~5s tests + setup
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ✅ passed (verified 2026-04-16, backfilled — see 06-VERIFICATION.md)
