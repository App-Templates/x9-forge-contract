# Plan 04-03 Staging Smoke Test Report

**Status:** PARTIAL — local verification PASSED; remote VPS deploy DEFERRED to human.

**Date:** 2026-04-15

**Plan commits verified locally (agent-x9 repo):**
- 9aeb814 chore(04-03-01): add @x9-forge/contracts dep to cap-voice and cap-glasses
- 6ee7999 feat(04-03-02): migrate cap-voice voice-call to createBridgeClient for /api/voice/register
- 9c056da feat(04-03-03): migrate cap-voice voice-fallback to createBridgeClient.internalQuery
- 00476d6 feat(04-03-04): integrate PostCallPayloadSchema at /webhook/post-call route boundary
- f2e75bf feat(04-03-05): rewire agent-core /internal/* routes to bridge request schemas
- 0f04939 feat(04-03-06): migrate cap-glasses agent-bridge to internalTurnStream + parseSseStream
- a0cb91a test(04-03-07): add cap-voice voiceRegister bridge integration tests
- 2f8f51d test(04-03-08): add internal-routes contract tests against bridge schemas

## Locally verifiable checks

| # | Step | Result | Notes |
|---|------|--------|-------|
| 1 | `cd agent-x9/services/cap-voice && pnpm build` | PASS | tsc, zero errors |
| 2 | `cd agent-x9/services/cap-voice && pnpm test` | PASS | 9/9 green (5 pre-existing + 4 new bridge tests; one stale-fixture bug fixed [Rule 1]) |
| 3 | `cd agent-x9/services/agent-core && pnpm build` | PASS | tsc, zero errors |
| 4 | `cd agent-x9/services/agent-core && pnpm test` | PASS | 61/61 green (45 baseline + 16 new internal-routes-contract tests) |
| 5 | `cd agent-x9/services/cap-glasses && pnpm build` | PASS | tsc, zero errors |
| 6 | `cd x9-forge-contract-bridge && pnpm build && pnpm test` | PASS | 26 files / 228 tests, no regressions from 04-01/04-02 |
| 7 | Drift detection proven | PASS | Temporarily added a required field to InternalTurnRequestSchema; 2 agent-core contract tests failed as expected; restored |
| 8 | Pkg dep wiring | PASS | `ls services/cap-voice/node_modules/@x9-forge/contracts` + `services/cap-glasses/node_modules/@x9-forge/contracts` resolve to bridge repo |

## Deferred: VPS staging deploy (human-action)

The plan's Task 04-03-09 includes Docker build + push to Hostinger VPS + curl
smoke tests against the deployed `x9-agent-core` / `x9-cap-voice` /
`x9-cap-glasses` containers. This subagent does not have SSH access configured
for this session and cannot execute:

```bash
# REQUIRES HUMAN: SSH credentials to Hostinger VPS
docker compose -f compose.staging.yml build x9-agent-core x9-cap-voice x9-cap-glasses
# push images to VPS; then curl probes on:
#   GET  /internal/agents
#   POST /internal/agents/INVALID_CAPS/reload       (expect 400)
#   POST /internal/turn                              (expect 200)
#   POST /internal/turn/stream                       (expect text/event-stream + done)
#   POST /webhook/post-call  (with X-Internal-Token) (expect 200 received:true)
```

**Recommended follow-up (Stefano):**
1. From a local machine with VPS SSH key: `cd ../agent-x9 && pnpm -r build`
2. `docker compose -f compose.staging.yml build x9-agent-core x9-cap-voice x9-cap-glasses`
3. Push images + restart services on Hostinger staging
4. Run the 7 curl probes above; append results to this file replacing the DEFERRED row
5. Verify FORGE_VOICE_REGISTER_TOKEN flow end-to-end (outbound voice call → Forge voice-svc logs show /api/voice/register POST received with correct `agentId` + `conversationId`)

Commit SHA at time of this report (agent-x9 HEAD): `2f8f51d`

## Self-Check for this file

- File created via Write tool
- Acceptance criteria from plan: "grep PASS|FAIL ... matches at least 7 lines" → 8 PASS rows + 1 DEFERRED row above
- "grep FAIL ... returns NO match" → 0 FAIL rows
- "grep commit.*[a-f0-9]\{7,\} ... matches at least 1 line" → commit hash 2f8f51d included
