# BRIDGE-130 — canonical agent runtime contract

Assignment: board message 2026-10-07 01:15. Base d574f68, package 1.29.0,
branch codex/bridge-130. Read BASE-DOCUMENTALE, MODELLO-AGENTE and the original
sources before MEDITATION-01 / AGENTI-01; their pending product decisions are
outside this assignment. Meditation remains stopped. The existing HTTP path,
authentication and legacy status enums are retained.

## Scope

Only src/agent/**, src/http/endpoints/internal-agents-list.ts,
src/http/endpoints/index.ts, tests/** and this phase directory may change.
No version, CHANGELOG or dist changes. No other repository, release, push,
server, browser, secret or deployment action. The coordinator releases the package.

## Contract decisions

- Canonical identity explicitly pairs managementAgentId with runtimeAgentId.
  Neither slug aliases nor numeric database identifiers are inferred. Reject
  duplicate identities and cross-namespace ambiguity, including legacy list rows.
- Agent state: active, no-channel, stopped, error, unknown. Active requires at
  least one explicitly loaded channel reported by X9. Legacy runtimeStatus and
  loaded alone never prove a channel. Positive stopped/error evidence is explicit;
  no-channel requires a loaded agent and complete, known channel observations.
- Each channel has its own channelId, kind, state, nullable loaded evidence and
  readiness. Paused is declared and distinct from error; readiness never supplies
  missing loaded evidence. Web extends the existing messaging channel vocabulary
  locally without changing that existing contract.
- A runtime snapshot includes agent load evidence, channel completeness and a
  validated derived state. A source object identifies X9, availability,
  completeness and observation time. Missing/unavailable source information and
  missing rows resolve to unknown. A partial but available list can still prove
  a present agent's loaded channel.
- List fields are optional and additive. Existing valid 1.29 payloads keep their
  parsed shape. An exported lookup helper supplies the conservative canonical
  state; it never maps legacy running/bot-less/stopped to the new state.

## Tasks and dependencies

1. Identity pair and collection validation (no dependency).
   Tests first: staging/runtime pair, duplicates, ambiguous aliases, exact lookup
   vocabulary and invalid identifiers. Commit identity implementation and tests.
2. Channels and runtime evidence/state (depends on 1).
   Tests first: loaded versus readiness, paused, complete/no-channel, partial or
   unknown observations, explicit stopped/error, contradictions and duplicates.
   Commit runtime implementation and tests.
3. Additive list identity/runtime/source metadata (depends on 1 and 2).
   Tests first: old payload round trips, new complete/partial response, source
   contradictions, duplicate/ambiguous rows, runtime identity mismatch.
   Commit list implementation and tests.
4. Conservative canonical state lookup and public API verification (depends on 3).
   Tests first: exact management/runtime targeting, absent rows, old payloads,
   unavailable/missing source, partial positive evidence and public subpath exports.
   Commit helper and tests.

Each task: save the first genuinely failing test output, fix and save the passing
output, deliberately break new guards in a private copy and prove each relevant
regression test fails, restore the private copy. One implementation commit per
task. Then update and commit SUMMARY, reread PLAN/SUMMARY before the next task.
45-minute / three-attempt limit applies per task; document a skipped task rather
than inventing an unverified completion. One heavy command at a time, one worker.

## Final verification

Run the complete source contract suite with one worker, tsc --noEmit with its
build-info redirected to private temporary storage, and lint for changed sources.
Verify build, portable declarations, package checks and CJS smoke in an isolated
private copy if needed; never generate dist in the assigned worktree. Record all
numerators/denominators and limitations. Check changed files against the assigned
perimeter, commit the final SUMMARY, publish CONSEGNATO and stop.
