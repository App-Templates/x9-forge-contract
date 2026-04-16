---
phase: 1
plan: "01-01"
title: "Bridge capability contracts — Zod schemas, unit tests, real fixtures"
subsystem: capability
tags: [capability, zod, contracts, validation, retroactive]
requires: []
provides: [capability-tool-schema, capability-manifest-schema, tool-call-schemas, registry-entry-schema, env-schema, health-status-schema, barrel-export-capability]
affects: [src/capability/*, tests/capability/*]
tech-stack: [zod-v4, typescript-6, vitest]
key-files:
  - src/capability/capability-tool.ts
  - src/capability/capability-manifest.ts
  - src/capability/tool-call.ts
  - src/capability/capability-registry-entry.ts
  - src/capability/env-schema.ts
  - src/capability/health-status.ts
  - src/capability/index.ts
  - tests/capability/capability-manifest.test.ts
  - tests/capability/capability-registry-entry.test.ts
  - tests/capability/tool-call.test.ts
  - tests/capability/env-schema.test.ts
  - tests/capability/health-status.test.ts
key-decisions:
  - "All six capability schemas verified as conformant to plan spec — zero divergence from commit 5d1cde9"
  - "serviceName? optional field correctly resolves X9/Forge divergence (CAPA-01)"
  - "CapabilityRegistryEntry canonical shape with host/port/version confirmed (CAPA-04)"
  - "ToolCallResponse discriminated union on status with 3 error codes (CAPA-02)"
  - "Added real cap-calendar 5-tool fixture + Forge deploy.machine fixture for TEST-02"
patterns-established:
  - "Zod schema as source of truth, TS types via z.infer — zero drift guarantee"
  - "Real-world fixtures in tests (not synthetic) — catches shape assumptions"
  - "toEndpoint/fromEndpoint helpers for URL<->canonical shape conversion"
  - "Barrel re-export pattern at src/capability/index.ts"
requirements-completed: [CAPA-01, CAPA-02, CAPA-03, CAPA-04, CAPA-05, CAPA-06, TEST-01, TEST-02, TEST-03, TEST-05]
duration: "~15min"
completed: "2026-04-15"
---

# Plan 01-01 Summary: Bridge Capability Contracts

## What was done

Retroactive validation of all six capability Zod schemas against the plan 01-01 spec.
The code at commit `c441743` (base of Phase 1) already implemented the schemas correctly
during Phase 0 scaffolding (commit `5d1cde9`). This plan verified conformance and added
missing real-world test fixtures.

## Tasks completed

| Task | Status | Notes |
|------|--------|-------|
| T1: CapabilityTool schema | VERIFIED | z.object with name/description/inputSchema, z.infer type |
| T2: CapabilityManifest schema | VERIFIED | serviceName? optional resolves X9/Forge divergence |
| T3: ToolCallRequest/Response | VERIFIED | Discriminated union on status, 3 error codes, 4 types exported |
| T4: CapabilityRegistryEntry | VERIFIED | Canonical host/port/version + toEndpoint/fromEndpoint helpers |
| T5: EnvSchemaField/Doc | VERIFIED | Matches Forge X9EnvSchemaField shape exactly |
| T6: HealthStatus | VERIFIED | healthy/degraded/down enum + optional checks map |
| T7: Barrel exports | VERIFIED | All schemas+types re-exported, ./capability sub-path in package.json |
| T8: Real fixtures | ADDED | cap-calendar 5-tool manifest + Forge deploy.machine registry entry |
| T9: CI gate | VERIFIED | .github/workflows/ci.yml runs pnpm lint+build+test on push/PR |
| T10: Baseline green | VERIFIED | 57 tests pass, 0 fail, 0 skip, build clean |

## Test results

- **57 tests passing** (was 55 before T8 fixtures)
- 7 test files, all green
- `pnpm build` exits 0
- `pnpm test` exits 0

## Divergences found

None. All schemas matched the plan spec exactly.
