# contract-green

Comando: pnpm -C /Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-56-1 exec vitest run --maxWorkers=1 --testTimeout=60000 --reporter=json --outputFile=/var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-contract-green-g4l8fxdd/vitest.json tests/http/endpoints/internal-dev-conferme.test.ts tests/http/endpoints/internal-agents-reload.test.ts tests/model-router/model-push.test.ts
Esito: exit 0; 131/131 passati, 0 falliti; errori di raccolta 0.
Archivio completo: /var/folders/m3/mywf84wd2k50664nh_ffnc3m0000gq/T/bridge56-contract-green-g4l8fxdd
Ora: 2026-10-06T15:21:57.040277+02:00

| Test | Stato | Assert rosso |
| --- | --- | --- |
| ModelPushRequestSchema accepts minimal request (providers only) | passed | False |
| ModelPushRequestSchema accepts full request (providers + perCapPolicies + perAgentOverrides) | passed | False |
| ModelPushRequestSchema rejects unknown provider (T-06-02 — enum gate) | passed | False |
| ModelPushRequestSchema rejects request with incomplete mapping (propagates ModelTierMapping refine) | passed | False |
| ModelPushRequestSchema rejects empty providers record (WR-01 — at least one provider required) | passed | False |
| ModelPushRequestSchema rejects providers record with only declared-but-undefined entries (WR-01) | passed | False |
| ModelPushResponseSchema — success arm accepts minimal success | passed | False |
| ModelPushResponseSchema — success arm accepts success with reloadVersion | passed | False |
| ModelPushResponseSchema — success arm rejects negative applied count | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) accepts error with code=INVALID_POLICY | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) accepts error with code=UNKNOWN_CAP | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) accepts error with code=INVALID_MAPPING | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) accepts error with code=INTERNAL_ERROR | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) accepts error with details[] | passed | False |
| ModelPushResponseSchema — error arm (4 error-code cases) rejects unknown error code | passed | False |
| ModelPushResponseSchema — discriminated union narrowing narrows on ok=true | passed | False |
| pushModelConfigContract — D-15 shape has locked method/path/authType | passed | False |
| pushModelConfigContract — D-15 shape exposes request + response schemas | passed | False |
| ReloadAgentParamsSchema parses a valid agentId (lowercase + dash) | passed | False |
| ReloadAgentParamsSchema accepts numeric agentIds | passed | False |
| ReloadAgentParamsSchema rejects uppercase agentIds (AGENT_ID regex) | passed | False |
| ReloadAgentParamsSchema rejects agentIds with special characters | passed | False |
| ReloadAgentParamsSchema rejects empty agentId | passed | False |
| ReloadAgentResponseSchema parses the bot-less response { ok, agentId, telegram: 'skipped' } | passed | False |
| ReloadAgentResponseSchema rejects unknown telegram values (only the skipped marker is legal) | passed | False |
| ReloadAgentResponseSchema parses a valid success response (real fixture) | passed | False |
| ReloadAgentResponseSchema rejects response with ok: false (wrong discriminator) | passed | False |
| ReloadAgentResponseSchema rejects response missing agentId | passed | False |
| ReloadAgentErrorResponseSchema parses a valid error response | passed | False |
| ReloadAgentErrorResponseSchema rejects error with ok: true | passed | False |
| reloadAgentContract declares POST /internal/agents/:agentId/reload with secret auth | passed | False |
| internal dev pending confirmations contract declares the exact internal path | passed | False |
| internal dev pending confirmations contract uses POST for a one-time delivery request | passed | False |
| internal dev pending confirmations contract requires existing internal secret authentication | passed | False |
| internal dev pending confirmations contract exposes the request through the standard bodySchema | passed | False |
| internal dev pending confirmations contract exposes the response schema on the contract | passed | False |
| internal dev pending confirmations contract exports the same InternalDevConfermeRequestSchema through HTTP and its endpoints barrel | passed | False |
| internal dev pending confirmations contract exports the same InternalDevConfermeResponseSchema through HTTP and its endpoints barrel | passed | False |
| internal dev pending confirmations contract exports the same internalDevConfermeContract through HTTP and its endpoints barrel | passed | False |
| pending confirmation request preserves a web session identifier | passed | False |
| pending confirmation request accepts the specified nonempty string without inventing a session format | passed | False |
| pending confirmation request rejects a non-object request 0 | passed | False |
| pending confirmation request rejects a non-object request 1 | passed | False |
| pending confirmation request rejects a non-object request 2 | passed | False |
| pending confirmation request rejects a non-object request 3 | passed | False |
| pending confirmation request rejects a non-object request 4 | passed | False |
| pending confirmation request rejects a non-object request 5 | passed | False |
| pending confirmation request rejects a non-object request 6 | passed | False |
| pending confirmation request requires sessionId | passed | False |
| pending confirmation request rejects an empty sessionId | passed | False |
| pending confirmation request rejects a non-string sessionId 0 | passed | False |
| pending confirmation request rejects a non-string sessionId 1 | passed | False |
| pending confirmation request rejects a non-string sessionId 2 | passed | False |
| pending confirmation request rejects a non-string sessionId 3 | passed | False |
| pending confirmation request rejects a non-string sessionId 4 | passed | False |
| pending confirmation request rejects a non-string sessionId 5 | passed | False |
| pending confirmation request rejects unknown request fields | passed | False |
| pending confirmation response accepts command APPROVATO | passed | False |
| pending confirmation response accepts command SCARTATO | passed | False |
| pending confirmation response accepts command RIPRENDI | passed | False |
| pending confirmation response accepts an empty queue | passed | False |
| pending confirmation response preserves multiple confirmations in delivery order | passed | False |
| pending confirmation response accepts an empty title as specified by the string contract | passed | False |
| pending confirmation response rejects a non-object response 0 | passed | False |
| pending confirmation response rejects a non-object response 1 | passed | False |
| pending confirmation response rejects a non-object response 2 | passed | False |
| pending confirmation response rejects a non-object response 3 | passed | False |
| pending confirmation response rejects a non-object response 4 | passed | False |
| pending confirmation response rejects a non-object response 5 | passed | False |
| pending confirmation response rejects a non-object response 6 | passed | False |
| pending confirmation response requires the conferme collection | passed | False |
| pending confirmation response rejects a non-array collection 0 | passed | False |
| pending confirmation response rejects a non-array collection 1 | passed | False |
| pending confirmation response rejects a non-array collection 2 | passed | False |
| pending confirmation response rejects a non-array collection 3 | passed | False |
| pending confirmation response rejects a non-array collection 4 | passed | False |
| pending confirmation response rejects a non-array collection 5 | passed | False |
| pending confirmation response rejects a non-object confirmation 0 | passed | False |
| pending confirmation response rejects a non-object confirmation 1 | passed | False |
| pending confirmation response rejects a non-object confirmation 2 | passed | False |
| pending confirmation response rejects a non-object confirmation 3 | passed | False |
| pending confirmation response rejects a non-object confirmation 4 | passed | False |
| pending confirmation response requires confirmation field richiesta | passed | False |
| pending confirmation response requires confirmation field titolo | passed | False |
| pending confirmation response requires confirmation field comando | passed | False |
| pending confirmation response requires confirmation field link | passed | False |
| pending confirmation response rejects a non-finite numeric request number 0 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 1 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 2 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 3 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 4 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 5 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 6 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 7 | passed | False |
| pending confirmation response rejects a non-finite numeric request number 8 | passed | False |
| pending confirmation response requires a positive request number 0 | passed | False |
| pending confirmation response requires a positive request number 1 | passed | False |
| pending confirmation response requires a positive request number 2 | passed | False |
| pending confirmation response requires an integer request number 0 | passed | False |
| pending confirmation response requires an integer request number 1 | passed | False |
| pending confirmation response requires a string title 0 | passed | False |
| pending confirmation response requires a string title 1 | passed | False |
| pending confirmation response requires a string title 2 | passed | False |
| pending confirmation response requires a string title 3 | passed | False |
| pending confirmation response requires a string title 4 | passed | False |
| pending confirmation response requires a string title 5 | passed | False |
| pending confirmation response rejects an unknown or non-string command 0 | passed | False |
| pending confirmation response rejects an unknown or non-string command 1 | passed | False |
| pending confirmation response rejects an unknown or non-string command 2 | passed | False |
| pending confirmation response rejects an unknown or non-string command 3 | passed | False |
| pending confirmation response rejects an unknown or non-string command 4 | passed | False |
| pending confirmation response rejects an unknown or non-string command 5 | passed | False |
| pending confirmation response rejects an unknown or non-string command 6 | passed | False |
| pending confirmation response rejects an unknown or non-string command 7 | passed | False |
| pending confirmation response rejects an unknown or non-string command 8 | passed | False |
| pending confirmation response rejects an unknown or non-string command 9 | passed | False |
| pending confirmation response rejects an unknown or non-string command 10 | passed | False |
| pending confirmation response requires an absolute URL 0 | passed | False |
| pending confirmation response requires an absolute URL 1 | passed | False |
| pending confirmation response requires an absolute URL 2 | passed | False |
| pending confirmation response requires an absolute URL 3 | passed | False |
| pending confirmation response requires an absolute URL 4 | passed | False |
| pending confirmation response requires an absolute URL 5 | passed | False |
| pending confirmation response requires an absolute URL 6 | passed | False |
| pending confirmation response requires an absolute URL 7 | passed | False |
| pending confirmation response requires an absolute URL 8 | passed | False |
| pending confirmation response requires HTTPS 0 | passed | False |
| pending confirmation response requires HTTPS 1 | passed | False |
| pending confirmation response requires HTTPS 2 | passed | False |
| pending confirmation response rejects unknown confirmation fields | passed | False |
| pending confirmation response rejects unknown response fields | passed | False |
