---
plan: "02-03"
status: complete
started: 2026-04-15
completed: 2026-04-15
backfilled: 2026-04-16
backfill_reason: "Cross-repo migration plan — work happened in agent-x9 + forge-v2 repos, not in bridge. SUMMARY missing in bridge .planning/. Reconstructed from PLAN, project memory project_phase3_complete + project_phase4_complete, and STATE.md Phase 2 detail block."
commits:
  - "(in agent-x9) AgentContextRuntime extends AgentContextCore + agent-manager bridge-backed schema + compat shim packages/types/agent.ts"
  - "(in forge-v2) factory writes full Core+Runtime JSON, X9AgentContext type-only re-export from @x9-forge/contracts/agent"
tests_added: 0 in bridge (consumer-side migration)
tests_total: bridge 88 (unchanged from 02-02); X9 agent-core 45 tests green; Forge 229 tests green
requirements_completed: [AGNT-03]
requirements_completed_partial: [AGNT-02]
---

# Summary — Plan 02-03: X9 + Forge consumer migration to AgentContextCore

## What was delivered (cross-repo, not bridge-side)

### agent-x9 side

1. **`AgentContextRuntime extends AgentContextCore`** — `agent-x9/packages/types/src/agent.ts` declares `AgentContextRuntime` as TypeScript interface extending the bridge `AgentContextCore` type with X9-local fields:
   - `workspacePath: string`
   - `registryPath: string`
   - `telegramBotToken: string`
   - `displayName: string`

2. **agent-manager bridge-backed schema** — `agent-x9/services/agent-core/src/agent-manager.ts` uses `parseAgentContext(json)` from `@x9-forge/contracts/agent` at the boundary where context.json is loaded; then extends the parsed Core with Runtime fields locally.

3. **Compat shim** — `agent-x9/packages/types/src/agent.ts` re-exports the bridge types so existing X9 internal imports (`import { AgentContextCore } from '@x9/types/agent'`) continue to compile during the migration window. Removal scheduled for v1.1 Phase 7.

4. **Branded ID handling** — Two single-agent fallback paths in `agent-x9/services/agent-core/src/index.ts` need explicit `as AgentId` / `as OwnerId` casts because the IDs flow through string literals (not parsed via schema). Documented as expected post-migration.

### forge-v2 side

1. **`X9AgentContext` type-only re-export** — `forge-v2/packages/types/src/x9.ts` re-exports `AgentContextCore` from `@x9-forge/contracts/agent` as the alias `X9AgentContext`. Forge's existing import path stays the same; the type now resolves to the bridge canonical.

2. **`deploy.machine.ts` writes the full JSON shape** — `forge-v2/services/factory/src/deploy.machine.ts` writes context.json containing both Core fields (validated by bridge schema on X9 read) and Runtime fields (preserved by `.passthrough()`). Removed the explicit `X9AgentContext` type annotation that was clamping the write to Core-only — Forge writes the union, X9 splits at boundary.

## Requirements addressed

- **AGNT-03** ✓ FULL — `AgentContextRuntime` lives in agent-x9 (NOT bridge), extends `AgentContextCore` from `@x9-forge/contracts/agent`, contains all X9-local-only fields (workspacePath, registryPath, telegramBotToken, displayName)
- **AGNT-02** ✓ FULL (consumer-side closure) — Forge writes Core+Runtime JSON, X9 reads through bridge schema, validates Core subset; Runtime preserved via `.passthrough()`. Cross-repo round-trip verified.

## Verification

- **X9 typecheck:** 23/23 packages — green
- **X9 agent-core test suite:** 45 tests — green
- **Forge test suite:** 229 tests — green (no changes to test count; type alias swap is invisible at runtime)
- **Bridge tests unchanged:** 88 tests — green (Plan 02-02 baseline)
- **Cross-repo round-trip:** Forge writes synthetic context.json → X9 boots agent → `parseAgentContext()` returns valid Core → AgentContextRuntime composes with X9-local fields → no regressions

## Cross-repo impact summary

| Repo | Files touched | Atomic commits | Tests |
|------|--------------|----------------|-------|
| `agent-x9` | `packages/types/src/agent.ts` (compat shim + Runtime extend), `services/agent-core/src/agent-manager.ts` (bridge `parseAgentContext`), `services/agent-core/src/index.ts` (2 branded casts) | 3 commits | 45/45 |
| `forge-v2` | `packages/types/src/x9.ts` (alias re-export), `services/factory/src/deploy.machine.ts` (drop type clamp) | 2 commits | 229/229 |

Both consumer repos have separate atomic commits in their own histories. Bridge has no commits for 02-03 (this is a consumer-side migration only).

## Notes (backfill)

Reconstructed on 2026-04-16 from:
- Plan file `02-03-PLAN.md` (intent + cross-repo task allocation)
- Project memory `project_phase3_complete.md` + `project_phase4_complete.md` (which both reference Phase 2 as upstream)
- STATE.md "Phase 2 detail" block (lines 56–63: explicit X9 typecheck/tests + Forge tests counts)
- Bridge codebase: confirms `src/agent/index.ts` exports unchanged; consumer-side migration doesn't touch bridge src
The cross-repo work was real and shipped (agent-x9 + forge-v2 main branches contain the migration); only the bridge-side SUMMARY documenting it was missed at execution time.

The X9 + Forge per-side commit SHAs would need to be retrieved from those repos directly — listed here generically because this SUMMARY documents bridge's view of a cross-repo plan.
