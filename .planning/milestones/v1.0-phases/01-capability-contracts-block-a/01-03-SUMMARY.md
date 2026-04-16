---
phase: 1
plan: "01-03"
title: "Forge v2 migration — re-export shim + factory update + contract test e2e"
status: DONE
started: 2026-04-15
completed: 2026-04-15
forge_commit: efa2668
---

# Plan 01-03 Summary: Forge v2 Migration — Re-export Shim

## Result: ALL 9 TASKS COMPLETE

### T1: Add bridge dependency to Forge
- Added `pnpm.overrides` in `forge-v2/package.json`: `"@x9-forge/contracts": "link:../x9-forge-contract-bridge"`
- Added `@x9-forge/contracts` and `zod` as dependencies in `packages/types/package.json`
- `pnpm install` resolved successfully; bridge symlinked at `packages/types/node_modules/@x9-forge/contracts`

### T2: Migrate x9.ts to re-export shim
- Replaced 4 local interface definitions with aliased re-exports from `@x9-forge/contracts/capability`:
  - `CapabilityManifest as X9CapabilityManifest`
  - `CapabilityRegistryEntry as X9CapabilityRegistryEntry`
  - `EnvSchemaField as X9EnvSchemaField`
  - `EnvSchemaDoc as X9EnvSchemaDoc`
- `X9AgentContext` remains as local interface (Phase 2 scope)
- Zero local capability interface definitions remain

### T3: Verify packages/types compiles
- `pnpm build` in `packages/types/` exits 0
- `dist/x9.js` and `dist/x9.d.ts` generated correctly

### T4: Verify x9.client.ts compiles
- `pnpm typecheck` in `services/factory/` exits 0
- `x9.client.ts` NOT modified (zero-change migration)

### T5: Verify deploy.machine.ts compiles
- `pnpm typecheck` in `services/factory/` exits 0
- `deploy.machine.ts` NOT modified (zero-change migration)
- Object literal `{ name, enabled, host, port, version }` compiles against bridge `CapabilityRegistryEntry` (optional `protocol?` and `tools?` not required)

### T6: Verify capabilities.service.ts compiles
- `pnpm typecheck` in `services/factory/` exits 0
- `capabilities.service.ts` NOT modified

### T7: Run full Forge test suite
- `pnpm test` exits 0
- 229 tests passed across 5 services: voice (24), docker (13), factory (62), vault (51), workspace (79)
- 0 failures
- No test failure caused by the migration

### T8: Verify structural compatibility with deploy.machine output
- Bridge test `capability-registry-entry.test.ts` already contains:
  - `FORGE_DEPLOY_MACHINE_FIXTURE` with shape `{ name, enabled, host, port, version }`
  - `TEST-02 conformance` test that `CapabilityRegistryEntrySchema.safeParse()` succeeds
  - Forge-style entry test (no tools, no protocol)
- Cross-reference confirmed with plan 01-01 T8

### T9: Document staging verification plan
- Staging verification steps (documented below, no code changes):
  1. Deploy Forge to staging with bridge dependency (`git+https` SHA pin for CI)
  2. Trigger agent deploy via Forge UI (uses `deploy.machine.ts`)
  3. `curl http://<vps>:3000/internal/agents/<agentId>/context` to verify `registry.json` has valid entries
  4. Verify `x9.client.ts` discovers capabilities: `curl http://cap-calendar:3000/manifest`
  5. Verify health check aggregation: `curl http://<vps>:3000/api/agents/<agentId>/capabilities`
- Actual staging deployment requires VPS access (deferred to Stefano)

## Files Modified (in forge-v2 repo)

| File | Change |
|------|--------|
| `package.json` | Added `pnpm.overrides` for `@x9-forge/contracts` link |
| `packages/types/package.json` | Added `@x9-forge/contracts` and `zod` dependencies |
| `packages/types/src/x9.ts` | Migrated to re-export shim |
| `pnpm-lock.yaml` | Updated lockfile |

## Files NOT Modified (zero-change migration)

- `services/factory/src/services/x9.client.ts`
- `services/factory/src/services/deploy.machine.ts`
- `services/factory/src/services/capabilities.service.ts`

## Requirements Addressed

- **CAPA-01**: Capability types now come from bridge (single source of truth)
- **CAPA-04**: Forge factory services compile with bridge types
- **CAPA-05**: deploy.machine output structurally valid against CapabilityRegistryEntrySchema
- **MGRT-05**: Backward-compatible migration via aliased re-exports
- **TEST-02**: Forge fixture conformance verified via bridge test suite
- **TEST-05**: Full Forge test suite baseline (229 tests, 0 failures)
