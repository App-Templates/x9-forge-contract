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
