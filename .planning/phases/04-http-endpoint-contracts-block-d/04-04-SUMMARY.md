---
phase: 04-http-endpoint-contracts-block-d
plan: "04-04"
subsystem: http
tags: [forge, bridge-client, typed-migration, bug-15, x9client, voice-svc, post-call-webhook]

# Dependency graph
requires:
  - phase: 04-http-endpoint-contracts-block-d
    provides: [SecretBridgeClient.listAgents/reloadAgent/stopAgent, TokenBridgeClient.postCallWebhook, CapManifestResponseSchema, CapEnvSchemaResponseSchema, PostCallPayloadSchema]
  - phase: 03-auth-headers-discriminated-block-c
    provides: [createBridgeClient skeleton, AuthInternalSecret/AuthInternalToken discriminated types]
provides:
  - forge-v2 X9Client fully migrated — every /internal/* call goes through typed bridge client
  - capBridgeClient(svc, port) helper consolidating 3 previously duplicated no-auth /manifest + /env-schema fetch sites
  - voice-svc /api/voice/webhook post-call forward migrated to TokenBridgeClient.postCallWebhook (Bug #15 Forge-side mitigation)
  - factory /api/agents/:slug/health now uses X9Client.listAgents (no duplicated fetch)
  - deploy.machine write-registry step uses capBridgeClient
  - X9Client.mapError — unified BridgeHttpError → {code, status, message} mapping ready for Phase 5+ server standardization
  - 12 new factory integration tests (X9Client bridge tests); 4 new voice Bug #15 regression tests
affects: [05-vault-contracts, 06-model-router-contracts, future-ui-phases]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Forge X9Client uses createBridgeClient<'secret'>() with typed method calls (listAgents/reloadAgent/stopAgent); raw fetch removed"
    - "capBridgeClient(svc, port) — local helper validating /manifest + /env-schema responses via bridge-exported Zod schemas; source of truth for shape remains in the bridge"
    - "voice-svc post-call forward uses createBridgeClient<'token'>() — TokenBridgeClient type physically enforces X-Internal-Token (Bug #15 compile-time guard applied at Forge boundary)"
    - "X9Client.mapError central handler — prefers structured body.code; falls back to status-derived X9_AUTH/X9_NOT_FOUND/X9_HTTP; preserves legacy message prefixes for regex-based tests"

key-files:
  created:
    - ../forge-v2/services/factory/tests/x9-client.bridge.test.ts
  modified:
    - ../forge-v2/services/voice/package.json
    - ../forge-v2/services/factory/src/services/x9.client.ts
    - ../forge-v2/services/factory/src/services/deploy.machine.ts
    - ../forge-v2/services/factory/src/routes/health.ts
    - ../forge-v2/services/voice/src/routes/voice.ts
    - ../forge-v2/services/voice/tests/voice.test.ts

key-decisions:
  - "Extended scope 04-04-03 with a LOCAL capBridgeClient helper rather than extending the bridge to emit a NoAuthBridgeClient — the plan's fallback instruction explicitly authorized this path; bridge extension is recorded as Phase 4+ follow-up"
  - "Bridge-exported Zod schemas (CapManifestResponseSchema, CapEnvSchemaResponseSchema) validate responses inside the local helper, so wire-shape source-of-truth remains in the bridge even though HTTP plumbing is local"
  - "Tasks 04-04-09 (staging fixture capture) and 04-04-10 (staging smoke) require VPS network access + deployed images — deferred out of the autonomous executor scope; operator follow-up required"
  - "Error message prefix preserved verbatim ('X9 reload failed for <id>', 'X9 stop failed for <id>', 'X9 listAgents failed') so legacy regex tests cannot regress; mapError attaches {code, status} as properties for structured upstream handling"
  - "PostCallPayloadSchema.safeParse used as a defensive local check before forwarding; on failure we still forward the raw body so new ElevenLabs fields are never silently dropped"

patterns-established:
  - "capBridgeClient helper pattern — single file helper exporting a factory for no-auth discovery calls; consumers call client.capManifest(signal) / client.capEnvSchema(signal); no raw fetch leaks"
  - "Forge error handling: try { bridgeClient.X() } catch (err) { this.mapError(prefix, err) } — uniform across all X9Client methods"
  - "Bug #15 wire-level test: fastify mock of X9 cap-voice recording {headers, body} of incoming forward; assert X-Internal-Token header is present + body includes appended agentId"

requirements-completed: [HTTP-01, HTTP-02, HTTP-03, HTTP-07, HTTP-08, HTTP-09, HTTP-10]

# Metrics
duration: ~11 min
completed: 2026-04-15
---

# Phase 04 Plan 04-04: Forge Migration — X9Client, voice.ts, factory Discovery Summary

**Forge-side migration: X9Client.stop/listAgents/reload now flow through `createBridgeClient<'secret'>`, voice-svc `/api/voice/webhook` forwards via typed `TokenBridgeClient.postCallWebhook` (Bug #15 compile-time guard at both ends), and the three no-auth capability discovery fetches (discoverCapabilities, getEnvSchema, deploy.machine write-registry) now funnel through a single `capBridgeClient` helper that validates responses via bridge-exported Zod schemas.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-04-15T20:44Z
- **Completed:** 2026-04-15T20:55Z
- **Tasks completed autonomously:** 8/10
- **Tasks deferred (require VPS/staging network):** 2/10 (04-04-09, 04-04-10)
- **forge-v2 commits:** 8
- **Files modified:** 6 (src) + 1 (new test file)

## Accomplishments

- Every X9Client method (reload, stop, listAgents) migrated from raw fetch to typed SecretBridgeClient methods (completing the Phase 3 pilot)
- Voice-svc post-call webhook forward migrated to typed `createBridgeClient<'token'>().postCallWebhook` — X-Internal-Token enforced at compile time (Bug #15 Forge-side closed)
- Three duplicated no-auth capability fetches consolidated into one `capBridgeClient` helper (T-4-04-03 mitigation)
- `X9Client.mapError` helper added — translates BridgeHttpError into structured {code, status, message} ready to consume Phase 5+ standardized `{ ok: false, code, message }` response bodies without further call-site changes
- Factory integration tests: +12 (fastify mock of agent-core, all methods + error paths exercised, headers asserted)
- Voice regression tests: +4 (mock X9 cap-voice captures {headers, body}, asserts X-Internal-Token forwarded + skip-on-missing-secret behaviour preserved)
- Zero raw `fetch(…/internal/…)` or `fetch(…/webhook/post-call…)` calls remain in services/factory or services/voice

## Task Commits (forge-v2 repo)

Each task atomically committed with hooks enabled.

1. **04-04-01** Add @x9-forge/contracts dep to voice-svc — `ceb2d9b`
2. **04-04-02** X9Client stop/listAgents/reload migrated to typed bridge — `0cd0a6a`
3. **04-04-03** X9Client discoverCapabilities/getEnvSchema use capBridgeClient — `f84ef67`
4. **04-04-04** deploy.machine write-registry + factory health route migrated — `b07d26b`
5. **04-04-05** voice-svc post-call forward uses createBridgeClient<'token'>.postCallWebhook — `9ab0669`
6. **04-04-06** X9Client.mapError unified error handling — `f708739`
7. **04-04-07** X9Client integration tests (12 tests) — `01a8bc9`
8. **04-04-08** voice-svc Bug #15 regression tests (4 tests) — `8274869`
9. **04-04-09** DEFERRED — requires staging VPS access to curl real fixtures
10. **04-04-10** DEFERRED — requires staging VPS deploy + live smoke test

_Bridge repo SUMMARY commit left to the orchestrator._

## Files Created/Modified

### Created (forge-v2)

- `services/factory/tests/x9-client.bridge.test.ts` — 12 integration tests using fastify mock of agent-core

### Modified (forge-v2)

- `services/voice/package.json` — add "@x9-forge/contracts": "*"
- `services/factory/src/services/x9.client.ts` — complete typed-bridge migration; capBridgeClient helper; mapError
- `services/factory/src/services/deploy.machine.ts` — write-registry uses capBridgeClient (removes 1 raw fetch to `/manifest`)
- `services/factory/src/routes/health.ts` — `/internal/agents` check uses X9Client (removes 1 raw fetch + manual header)
- `services/voice/src/routes/voice.ts` — post-call forward uses typed TokenBridgeClient
- `services/voice/tests/voice.test.ts` — +4 Bug #15 regression tests

## Tests Run — Before / After

| Repo | Service | Baseline | After | New | Status |
|------|---------|----------|-------|-----|--------|
| forge-v2 | factory | 62 | 74 | +12 | PASS |
| forge-v2 | voice | 24 | 28 | +4 | PASS |
| bridge | — | 228 | 228 | 0 | PASS (no bridge edits) |

All green, zero regressions.

## Decisions Made

- **Local capBridgeClient vs. bridge extension.** `createBridgeClient` currently only supports `'secret' | 'token'` auth types — no `'none'` / `NoAuthBridgeClient`. Per the plan's explicit fallback instruction (04-04-03 action text, lines 276-282), rather than extending the bridge mid-plan I introduced a local `capBridgeClient(svc, port)` helper in `services/factory/src/services/x9.client.ts`. The helper uses bridge-exported Zod schemas (`CapManifestResponseSchema`, `CapEnvSchemaResponseSchema`) so the bridge remains source-of-truth for wire SHAPE; only the HTTP plumbing is local. When the bridge later adds `auth: 'none'` support, this helper collapses to a thin `createBridgeClient<'none'>()` wrapper.
- **Error message prefix preservation.** `X9Client.mapError` preserves the exact legacy message prefixes (`"X9 reload failed for <id>"`, `"X9 stop failed for <id>"`, `"X9 listAgents failed"`) as the first segment of the composed error; the structured `{code, status}` is attached as properties (not in the message), so upstream handlers can discriminate on `err.code === 'X9_AUTH'` without parsing strings, and legacy regex-based tests continue to pass unchanged.
- **Tasks 04-04-09 + 04-04-10 deferred.** Both require VPS SSH access + ability to `curl` live staging endpoints. The autonomous executor has neither; attempting to run these would fail with an authentication gate, not a bug. Both are operator follow-ups to be scheduled after Plan 04-03 (X9 side) is also complete.

## Deviations from Plan

### Rule 3 (Blocking) — capBridgeClient implemented locally instead of extending bridge

- **Found during:** Task 04-04-03 (discoverCapabilities migration)
- **Issue:** The plan's task 04-04-03 action text assumes `createBridgeClient<'none'>()` returns a `NoAuthBridgeClient` with `capManifest() / capEnvSchema() / capHealth()` methods. Reading `src/http/bridge-client.ts` showed that 04-01-12 only added `SecretBridgeClient` and `TokenBridgeClient`; there is no `'none'` branch in `createBridgeClient`, and the type constraint is `A extends 'secret' | 'token'`.
- **Fix:** Followed the plan's explicit fallback clause ("file a follow-up and fall back"). Implemented `capBridgeClient(svc, port)` as a local exported helper in `x9.client.ts` that uses the bridge-exported `CapManifestResponseSchema.parse(...)` and `CapEnvSchemaResponseSchema.parse(...)` for response validation. This preserves the single-source-of-truth property for wire shapes and consolidates the 3 previous fetch sites into one helper (T-4-04-03 mitigation intact).
- **Files modified:** `services/factory/src/services/x9.client.ts`
- **Verification:** 4 new tests in `x9-client.bridge.test.ts` exercise `capBridgeClient.capManifest` (success + shape check), `capBridgeClient.capEnvSchema` (404 throw), and the integration path via `X9Client.discoverCapabilities` / `X9Client.getEnvSchema`.
- **Commit:** `f84ef67`

### Rule — "none"-auth bridge extension is a Phase 4+ follow-up

- **Follow-up for the bridge repo:** Add `'none'` support to `createBridgeClient` with a `NoAuthBridgeClient` exposing `capManifest(signal?) / capEnvSchema(signal?) / capHealth(signal?)`. Collapse the local `capBridgeClient` helper in `x9.client.ts` to a thin wrapper. Not blocking — current implementation is correct and tested.

**Total deviations:** 1 auto-fixed (Rule 3 - Blocking; explicitly anticipated and authorized by the plan).
**Impact on plan:** None on acceptance criteria — the helper name, signature, and consolidation semantics match the plan's design. Only the provider (local module instead of bridge) differs, and this was pre-authorized.

## Issues Encountered

- **Task 04-04-06 (mapError) — message prefix mismatch.** Initial implementation formatted `X9 ${op} failed` as `X9 ${"reload for stefano-main"} failed`, which broke the legacy prefix `X9 reload failed for stefano-main`. Fixed by changing `mapError` to take an explicit `opPrefix` string already containing the full prefix; callers pass `"X9 reload failed for ${agentId}"`, `"X9 stop failed for ${agentId}"`, `"X9 listAgents failed"`. Verified with regex assertions in the new integration tests.

## Authentication Gates

- **Task 04-04-09 (staging fixture capture)** — requires `curl` against staging VPS with the production `X-Internal-Secret`. Out-of-band for the autonomous executor. Operator action: execute the curl battery described in the plan, sanitize fixtures (redact real agent names, tokens), commit to `tests/http/endpoints/staging-fixtures/` in the bridge repo, then run `pnpm test`.
- **Task 04-04-10 (end-to-end staging smoke)** — requires VPS image deploy + live orchestration across X9 + Forge. Must run after 04-03 (X9 migration) also lands. Operator action: run `pnpm -r build`, build Docker images, deploy to VPS, exercise the 8 smoke steps described in the plan, write `04-04-SMOKE.md` with PASS/FAIL per step and the X9 + Forge commit SHAs. This is Phase 4 SC-6 final gate.

## Threat Model Status

| ID | Severity | Mitigation | Status |
|----|----------|-----------|--------|
| T-4-04-01 (error-path regression) | HIGH | mapError unifies BridgeHttpError → structured {code, status}; legacy message prefixes preserved; 12 factory + 4 voice tests assert error paths | MITIGATED |
| T-4-04-02 (Bug #15 regression — silent auth drop) | HIGH | voice.ts uses createBridgeClient<'token'>; X-Internal-Token enforced by type; 4 wire-level tests assert header present on forward AND NO forward when vault is incomplete | MITIGATED |
| T-4-04-03 (manifest discovery drift across 3 sites) | MEDIUM | capBridgeClient helper is the single entry point for /manifest + /env-schema; deploy.machine + discoverCapabilities + getEnvSchema all route through it | MITIGATED |
| T-4-04-04 (response shape confusion legacy vs standardized) | MEDIUM | Documented in JSDoc on X9Client.reload/stop/listAgents; mapError already handles structured body.code | MITIGATED by design |
| T-4-04-05 (AbortSignal timeout lost) | MEDIUM | `AbortSignal.timeout(5000)` preserved in capBridgeClient call sites (discoverCapabilities, getEnvSchema, deploy.machine); can be verified via grep | MITIGATED |
| T-4-04-06 (voice-svc missing bridge dep) | LOW | 04-04-01 adds "@x9-forge/contracts": "*" to voice-svc package.json; pnpm install verified symlink resolves | MITIGATED |

## Notes for Phase 5+ (Memory Engine)

- **factory.client (X9Client) is extension-friendly.** Adding new contracts (e.g. memory engine `/internal/memory/*`) is a two-step pattern: (1) add typed method to `SecretBridgeClient` in the bridge; (2) add thin wrapper on `X9Client` that does `try { this.bridgeClient.memoryXxx(...) } catch (err) { this.mapError('X9 memoryXxx failed', err); }`. No fetch, no header construction, no response parsing leaks out of the bridge.
- **Error shape standardization is ready.** When Phase 5 migrates agent-core to emit `{ ok: false, code: 'MEMORY_NOT_FOUND', message: ... }`, `X9Client.mapError` will automatically surface that `code` + `message` to upstream — no call-site change needed. Test this by adding one `{ok: false, code: 'MEMORY_NOT_FOUND', ...}` path to the mock agent-core in `x9-client.bridge.test.ts`.
- **capBridgeClient follow-up.** Phase 5+ should extend `createBridgeClient` with `'none'` auth + `NoAuthBridgeClient` exposing `capManifest / capEnvSchema / capHealth` methods, then delete the local helper in `x9.client.ts`. This keeps the "single source of truth" property complete.
- **health.ts capability /health fan-out (line 70)** still uses raw fetch — it was out of 04-04 scope (plan only listed `/internal/agents` on line 113). Candidate for a Phase 4+ consolidation: extend `capBridgeClient` with `capHealth(signal?)` and route the fan-out through it. Non-blocking.

## Acceptance Criteria — Verified

| must_have | Check | Result |
|-----------|-------|--------|
| SC-2 (Forge) — X9Client uses bridge for 3+ methods | `grep "this.bridgeClient\." x9.client.ts` | 3 matches (reload, stop, listAgents) PASS |
| SC-2 (Forge) — capBridgeClient for manifest+env-schema | `grep "capBridgeClient" x9.client.ts` | 5 matches PASS |
| SC-2 (voice-svc) — postCallWebhook | `grep "postCallWebhook" voice.ts` | 1 match PASS |
| T-4-04-02 Bug #15 | `grep "X-Internal-Token" voice.ts` + integration test | PASS (header present, 4 regression tests green) |
| Zero raw cross-repo fetch | `grep -r "fetch\\(\\\`\\\${.*Url\\|fetch\\(\\\`http://\\${svc}" services/factory services/voice` | Matches only: qdrant (local), docker-svc (Forge-internal), capability /health fan-out (out of plan scope), capBridgeClient internals — zero cross-repo X9 fetches PASS |
| Error shape unification | `grep "X9_AUTH\\|X9_HTTP" x9.client.ts` | 2 matches PASS |
| SC-6 (full end-to-end) | 04-04-SMOKE.md | **DEFERRED** — operator action required |
| No regressions | `pnpm -r test` forge-v2, `pnpm test` bridge | factory 74, voice 28, bridge 228 — all green PASS |

## Next Phase Readiness

**Ready for Plan 04-03 outcomes to merge:**
- When 04-03 (X9 migration) lands, the cross-repo symmetry is complete: every /internal/* call from Forge routes through typed SecretBridgeClient; every /webhook/post-call from cap-voice routes through typed TokenBridgeClient; every /api/voice/register from cap-voice routes through typed TokenBridgeClient (on the X9 side, 04-03 scope).

**Ready for Phase 5 (memory engine):**
- X9Client pattern is established. New methods go through the typed bridge, error via mapError, test via fastify mock.

**Blocking for full SC-6:**
- 04-04-09 + 04-04-10 are the final staging gates. They require operator action on the VPS with the current X9 + Forge images built from commits that include both 04-03 + 04-04 changes.

---
*Phase: 04-http-endpoint-contracts-block-d*
*Plan: 04-04*
*Completed: 2026-04-15 (8/10 tasks autonomous; 2/10 deferred to operator for staging)*

## Self-Check: PASSED

- All 6 modified forge-v2 files verified on disk
- New test file `tests/x9-client.bridge.test.ts` verified on disk (225 lines)
- All 8 task commits found in `cd ../forge-v2 && git log --oneline` (ceb2d9b, 0cd0a6a, f84ef67, b07d26b, 9ab0669, f708739, 01a8bc9, 8274869)
- forge-v2 factory: `pnpm build` green, `pnpm test` 74 passed (62 → 74, +12)
- forge-v2 voice: `pnpm build` green, `pnpm test` 28 passed (24 → 28, +4)
- bridge repo: `pnpm build` green (no bridge edits this plan), `pnpm test` 228 passed (unchanged)
- All task-level acceptance criteria grep patterns verified (see "Acceptance Criteria — Verified" table)
- T-4-04-01 through T-4-04-06 mitigated (T-4-04-04 by documentation + mapError design)
- Tasks 04-04-09 and 04-04-10 explicitly marked DEFERRED with operator-follow-up notes — not a failure, a scope boundary
