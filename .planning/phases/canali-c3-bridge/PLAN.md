# CANALI-C3-BRIDGE — additive Web policy and invitation foundation

Assigned123-1/codex/canali-c3-bridge by coordinator121907. Basea251bbc origin/main1.43.0 verified clean. Source scope is initially documentation only; request exact files before code. Reuse accepted C3/R-31 and Forge BRIDGE-DELTA-PLAN, existing CapabilityAgentScope/PersonScope, AgentManagementRequestId, AgentConfigVersion, cap-agent-elevenlabs mapping/provision/status and existing HTTP auth. Do not rewrite these types or implement a second provider resource lifecycle. No package version/pin, publish, push, tag, merge, server or secret/environment file work.

Production cutoff12:45. First narrow atomic lot B1: canonical Web-only access policy (owner/invited/public), independent pause, scope/revision-correlated change/readback and server-owned invitation record with recipient, revision, expiry and revocation. Validity helper only consumes server-resolved scope/authenticated person/current time; it is not a browser authorization request or a provider lease. Result-current helper rejects mismatched request ID, full scope, next revision and requested access/pause. Invitation checks never use display name or invitation ID as authentication. Pause does not mutate existing ElevenLabsDesiredState or resource/phone/other doors. B1 is a foundation, not complete C3 or admission/provider implementation.

Tests first: schemas negative/boundary cases must become AssertionError red; valid owner/invited/public fixtures use canonical scope/version validators. Test two owners, primary/heir and sibling/alias arbitrary IDs, wrong tenant/owner/agent/person, expiry at equality, future/invalid time, revoked record, malformed scope/schema and changed invitation revision. Test policy result mismatches and unknown-field rejection. Deliberately mutate every new check; exact source/hash restoration and fresh green. Test actual capability barrel exports and derived ESM/CJS after build; no import failure/empty suite/typeerror/timeout counted as semantic red.

Exact proposed B1 perimeter:
- src/capability/agent-elevenlabs/web-channel.ts (new canonical schemas/helpers only)
- src/capability/index.ts (one additive export; avoid circular export through provider index)
- tests/capability/agent-elevenlabs-web-channel.test.ts (new behavior and actual source barrel)
- tests/cjs/smoke.cjs (additive public export assertions if needed after source green)
- dist/** (only generated zshy outputs; dist is tracked and build/CJS proof requires it)
- .planning/phases/canali-c3-bridge/** (already authorized)

No existing cap-agent-elevenlabs/index implementation change, no HTTP path yet, no shared model-router override, no manual dist or Forge DTO. Later B2 requests explicit new endpoint/client/export/test paths for stable link/status/admission/session/catalog once existing producer integration can be inspected in assigned X9 worktree. New public link must come from authoritative source; no external provider share link bypasses owner/invitation gates. Public entrypoint must not expose resource mappings or management metadata.

Quality: one heavy command at a time; current Forge full completes before any bridge test/build. B1 targeted semantic baseline/green, mutation recipes, native noEmit/lint/build/dts/CJS, complete bridge only after acquiring mandatory slot. If time or scope ends, clean committed checkpoint of verified foundation and honest remaining work; no fabricated producer acceptance. Plan/SUMMARY reread after commit.

B1 verified 08/10/2026 12:41 Europe/Rome:59/59new,3286/3286complete,139/139files,23/23source+3/3compiledCJS mutation recipes qualified/exactrestore;native5/5exit0,generated336dtsportable,package/provider sourceunchanged. B2/X9/F1 remain. Final proof/SUMMARY and clean commit before12:45.

## B2 — resumed 12:49, deadline 13:34 (45 minutes)

Coordinator124622 authorizes continued bridge B2, no complete suites before13:05. Exact file extension requested125055; do not edit new source until approved. Two additive modules web-session.ts and web-catalog.ts, capability export; internal-capability-elevenlabs-web.ts and endpoints export; two capability test files, tests/http/elevenlabs-web.test.ts, additive CJS assertions and generated dist. Existing B1/provider/model-router/package source remain unchanged.

Stable link is a server-persisted record tied to full scope with an opaque linkId and authoritative configured-origin URL; validate same configured origin and canonical /parla/:linkId path, never a provider share URL. Admission consumes freshly loaded Web policy/link/provider status, resolved lifecycle and a server-derived authenticated viewer/owner membership or anonymous viewer. Reuse canonical full mapping and channel status: unknown, missing, paused or unloaded provider cannot grant admission. Public only when explicitly public; owner membership full tenant/owner; invited requires authenticated recipient plus server-loaded current invitation revision. Link ID alone never authenticates.

Mint correlation must reject changed request, viewer, link, policy, lifecycle or mapping after awaits. Provider WebSocket signed URL comes from the real ElevenLabs server API, per official documentation https://elevenlabs.io/docs/eleven-agents/api-reference/conversations/get-signed-url and https://elevenlabs.io/docs/eleven-agents/customization/authentication; credentials remain server-side. A handed-out signed URL is a bearer connection artifact, so pause/revocation prevents NEW issuance, not guaranteed invalidation of already issued/active sessions; public page must request it only immediately before connect. No claim of hard cancellation until an actual producer/gateway proves it. Contract helper is validation, not installed authorization.

Conversational catalog carries full agent scope and existing ModelCatalog model descriptors (managementAgentId is separately resolved; runtime and management ids may differ) plus real provider-discovered voice entries/version/window, not the static R4 TTS catalog. Freshness checks full scope, management agent, source API, time window, available voice/model options and canonical descriptor equality. No alternative model writer; Modelli owns selections.

Tests first against compiling neutral scaffolds; save semantic AssertionError red and green. Add scope isolation, anonymous/public/owner/invited, provider/lifecycle gates, post-await mutation, URL origin/path, catalog freshness/duplicates/selection. Deliberately cut every added check, restore exact bytes/hash and fresh green; at most3 failed campaigns per task. Native noEmit/lint/build/dts/CJS and full after13:05 only with mandatory slot; refusal gives a committed honest checkpoint. Actual provider adapter/admission installation requires assigned X9 worktree after this bridge lot; no consumer pin/release/push.

13:18 B2 exact approved HTTP file also exports the canonical public /parla/:linkId page path and validated opaque-id path builder, so X9 link persistence and Forge route mounting import one shared path. Ten tests first with a compiling neutral path builder; fresh HTTP mutation group requalifies that final HTTP file, while session/catalog source bytes remain exactly the completed52-recipe foundation. No consumer code touched.

B2 checkpoint13:26:130/130native,3416/3416full142files,69/69distinctsource boundaries(71qualification executions,2requalifiedHTTPguards),4/4actualcompiledCJS cuts/restores, native5/5zero/build342portable. Existing B1/provider/package/lock protected5/5byteexact. Full finished13:23:40 before existing slotexpiry13:24:16; released/alreadyfree. B2 remains contracts only; C3-X9125-1 now assigned132017. Native package still1.43 and no consumer alias/pin/release.


## B3 — Forge authority callback, planning checkpoint 14:39

Coordinator142902 assigns B3 to this existing123-1 chain above B2 bac8277, not a new worktree. X1 in125-1 is frozen5c622f53; its remaining62/68 mutation recipes are reassigned to another Codex after release. Do not resume X1 qualification. B2 source/test bodies remain unchanged for independent review; additive barrels/CJS/generated artifacts may follow an explicitly approved B3 perimeter.

### R-31: reuse and authoritative dependency

Reuse coordinator134035: Forge owns authenticated viewer/owner membership, lifecycle and management/runtime/vault identity. X9 never guesses these from a resource name, credentials, request Host or a caller-supplied viewer. Existing CapabilityCallContextSchema and POST /resolve/capability-context are the canonical credential/configuration resolver; reuse their schema rather than a second credential wire. Existing B2 admission/session validators, viewer and lifecycle shapes, canonical full scope, request/link IDs and mapping remain the only Web rules. The public HTTPS origin is explicit Forge startup configuration; provider keys never enter the public facade.

BRIDGE-IDENTITA-AGENTE is now assigned to Codex D, including the unique context identity constructor/validator, tenant, master/heir role and parent. B3 imports that canonical export once integrated by the coordinator. Do not duplicate its function, invent an interim identity DTO, edit D's files or merge/pin the dependency ourselves. Board decisions143508/143513 request the public export and integration order. Source execution waits for exact perimeter and the canonical dependency/order decision; elapsed time is not approval.

### Narrow lot and intended wire

New web-context.ts supplies the Web-specific authoritative context/correlation wrapper around the existing per-call context and D's unique agent identity. A new token-authenticated callback contract in capability-elevenlabs-web-context.ts is X9 -> Forge. Proposed stable path: POST /resolve/elevenlabs-web-admission (requires coordinator approval). Caller sends only full scope, server-generated attempt/request ID, bound link ID and before/after phase; no caller-chosen viewer, lifecycle, origin or identity mapping. Forge resolves the pending admission attempt from its server-side authenticated request state, enforces scope/link/request binding and expiry, and returns freshly loaded authority. Missing/expired/revoked attempt or unavailable authority denies issuance. Attempt identity is correlation, never browser authentication.

Forge authority contains authenticated/anonymous viewer, lifecycle, configured public origin, freshness and canonical context identity. It does not fetch or guess X9-owned Web policy/provider mapping, avoiding a recursive X9->Forge->X9 callback. X9 loads its own fresh policy/link/invitation/provider state and composes the existing B2 snapshot. Credentials remain within the canonical server-only call context; requests/responses and logs must not echo them to a browser. Whether the context is nested in the callback or resolved separately is fixed in PLAN after the identity export/order decision, before tests/source.

Before and after every provider mint await, reload Forge authority and X9 state. Bind request, full tenant/owner/runtime scope, management/vault identity, viewer, link, phase and authority/configuration revisions; reuse B2 current-session/admission checks. No cached callback or identity-less result can open admission. Forge also rechecks its authenticated request after the X9 result. A contract helper supplies validation, not deployed route authorization or provider proof. Public-origin and attempt-lifetime bounds are documented in the final source PLAN before implementation, not inferred from current traffic.

### Exact requested B3 file perimeter

- src/capability/agent-elevenlabs/web-context.ts (new wrapper/callback schemas and freshness/correlation helpers, canonical identity dependency only)
- src/capability/index.ts (one additive export)
- src/http/endpoints/capability-elevenlabs-web-context.ts (new token callback wire/path)
- src/http/endpoints/index.ts (one additive export)
- tests/capability/agent-elevenlabs-web-context.test.ts (new native behavioral and actual barrel tests)
- tests/http/elevenlabs-web-context.test.ts (new method/path/auth/body/response tests)
- tests/cjs/smoke.cjs (additive actual compiled-export assertions)
- dist/** (generated build only)
- .planning/phases/canali-c3-bridge/** (already authorized)

No edits to existing capability-call-context.ts, identity sources, B1/B2 bodies/tests, package/version/lock or other worktrees. If the canonical identity dependency needs another path, request it rather than work around the perimeter. Invitation management CRUD and public facade remain later lots, not silently included in B3.

### Test-first proof and cutoff

After prerequisites, one B3 source lot <=45 minutes or3 failed attempts, timer recorded before first test. Write tests first against a compiling neutral scaffold and save semantic AssertionError reds. Cover valid canonical context, unknown-field rejection, missing authoritative mapping, runtime/context mismatch, cross tenant/owner/agent/link/request isolation, primary/heir/sibling identities, authenticated recipient/anonymous public viewer, lifecycle unavailable/archive/removal, expired/equal/future/invalid time, stale revision, origin tampering, before/after phase and response correlation, and exact token-auth wire/barrel exports. Reuse the existing B2 policy/provider tests rather than reimplement their rule.

Deliberately cut every new check, save native semantic red, restore exact final source SHA and fresh green; no timeout/import/TypeError/empty-suite is credited. CJS cuts rebuild actual sources and restore/rebuild; never hand-edit dist. Execute native noEmit/scoped lint/build/portable dts/pack/CJS and complete bridge suite only with x9-posti, one heavy command at a time and <=2 workers. Retain raw logs and committed manifests with passed/total denominators. Stop cleanly at a documented partial checkpoint if prerequisites/time/3 attempts prevent completion. PLAN/SUMMARY are reread after each commit.
