---
plan: "01-02"
title: "X9 migration — re-export shim + generate-registry canonical + registry.json verification"
status: DONE
started: 2026-04-15
completed: 2026-04-15
---

# Plan 01-02 Summary: X9 Migration — Retroactive Validation

## Result: PASS (all 8 tasks verified)

### T1: Bridge dependency in X9 package.json — PASS
- `packages/types/package.json` has `"@x9-forge/contracts": "link:../../../x9-forge-contract-bridge"` in dependencies.
- `pnpm install` resolves without errors.

### T2: capability.ts compat shim — PASS
- Pure re-export shim from `@x9-forge/contracts/capability`.
- Exports: `CapabilityTool`, `ToolCallRequest`, `ToolCallSuccessResponse`, `ToolCallErrorResponse`, `ToolCallResponse`, `CapabilityManifest`, `CapabilityRegistryEntry` (types) + `CapabilityToolSchema`, `ToolCallRequestSchema`, `ToolCallResponseSchema`, `CapabilityManifestSchema`, `CapabilityRegistryEntrySchema`, `toEndpoint`, `fromEndpoint` (values).
- JSDoc header with "Single source of truth" present.
- Zero local type/interface definitions.

### T3: health.ts compat shim — PASS
- Re-exports `HealthStatus` (type) + `HealthStatusSchema` (value) from `@x9-forge/contracts/capability`.
- JSDoc header with "Single source of truth" present.
- Zero local definitions.

### T4: env-schema.ts compat shim — PASS
- Re-exports `EnvSchemaField`, `EnvSchemaDoc` (types) + `EnvSchemaFieldSchema`, `EnvSchemaDocSchema` (values) from `@x9-forge/contracts/capability`.
- JSDoc header with "Single source of truth" present.
- Zero local definitions.

### T5: generate-registry.ts uses fromEndpoint — PASS
- Imports `fromEndpoint` from `@x9-forge/contracts/capability`.
- Uses `fromEndpoint(manifest.endpoint, { name, enabled, version })` to produce canonical `{ host, port, version }` entries.
- Output JSON contains `host` and `port` fields, not `endpoint`.

### T6: registry.ts backward-compat z.union — PASS
- Imports `CapabilityRegistryEntrySchema` and `toEndpoint` from `@x9-forge/contracts/capability`.
- Defines `CanonicalEntrySchema` extending bridge schema with `name` + `enabled`.
- Defines `LegacyEntrySchema` with `{ endpoint, tools }` for backward compat.
- Uses `z.union([CanonicalEntrySchema, LegacyEntrySchema])` via `AnyEntrySchema`.
- `normaliseEntry()` converts both formats to unified `RegistryEntry` with `endpoint` derived via `toEndpoint()`.

### T7: X9 services compile — PASS (with fix)
- **Issue found:** `agent-core/package.json` was missing `@x9-forge/contracts` dependency. `registry.ts` imports directly from `@x9-forge/contracts/capability`, but only `packages/types` had the dependency.
- **Fix applied:** Added `"@x9-forge/contracts": "link:../../../x9-forge-contract-bridge"` to `services/agent-core/package.json`.
- **Committed in agent-x9:** `00c056d` — `fix(agent-core): add @x9-forge/contracts dependency for direct bridge import`
- After fix: `pnpm typecheck` exits 0 — all 23 tasks pass.

### T8: registry.json semantic equivalence — PASS (legacy format)
- `services/agent-core/registry.json` exists in **legacy format** (entries have `endpoint` field, e.g., `"endpoint": "http://memory:3001"`).
- This is expected: the file was generated before Phase 1-02 canonical format.
- `registry.ts` `z.union` with `LegacyEntrySchema` correctly accepts this format.
- `normaliseEntry()` parses legacy `endpoint` URLs into `host`+`port` at load time.
- Next `pnpm generate-registry` run will produce canonical format; existing VPS registry.json files will continue to work via backward compat.

## Fixes Applied (in agent-x9 repo)

| Commit | File | Description |
|--------|------|-------------|
| `00c056d` | `services/agent-core/package.json` | Added missing `@x9-forge/contracts` dependency |
| `00c056d` | `pnpm-lock.yaml` | Updated lockfile |

## Verification

```
pnpm typecheck → 23/23 tasks successful (FULL TURBO)
```
