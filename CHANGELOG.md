# Changelog — @x9-forge/contracts

All notable changes to the bridge package. This project adheres to [Semantic Versioning](https://semver.org/) at the milestone level (v1.0, v1.1, etc.); within a milestone, distribution is via SHA-pinned `git+https#<sha>` (no per-feature versioning).

## How releases work in this repo

- **No npm registry.** Consumers (agent-x9, forge-v2) depend via `git+https://github.com/App-Templates/x9-forge-contract.git#<sha>` with a `prepare` build script.
- **Atomic SHA bump.** Breaking contract changes require atomic SHA bump in BOTH consumer repos in the same step (RLSE-02). Never one consumer at a time.
- **Deprecation workflow** (RLSE-03): When deprecating a public symbol, add `/** @deprecated <reason — removal in v<X.Y>> */` JSDoc with explicit removal milestone. Minimum 1 milestone-cycle grace period before removal.

---

## [1.6.0] - 2026-04-24 — M46 Phase 46.0: Voice Origination Contracts

### Added

- **`VoiceCallIntentSchema`** — 7-enum `reminder|information|sales|legal|logistics|social|other` (VORIG-01).
  Exported from `src/capability/voice/intent.ts` + barrel `index.ts`. Order is part of the contract.
  Consumers: 46.1 intent classifier (classifier output), 46.2 workspace prompt dynVar wiring.
- **`VoiceCallProvenanceEntrySchema`** — minimal `{source, ref_id?, summary?(≤500), timestamp?}` (VORIG-03).
  Lives in `src/capability/voice/provenance.ts` (new file). Traces data sources
  (`strategic_file` / `cap_contacts` / `memory_v2` / `cap_calendar` / …) that composed a `VoiceCallBrief`.
  Placed in its own module (not co-located with `prepare-call.ts`) to avoid a module-initialization cycle
  with `brief.ts` — see `46.0-RESEARCH.md` §12 pitfall #2.
- **`VoicePrepareCallRequestSchema`** — `{call_id, raw_instruction, requested_contact?}` (VORIG-02).
- **`VoicePrepareCallResponseSchema`** — `{brief, authorized_actions, intent, intent_confidence?, provenance, preview_markdown?}` (VORIG-02).
- **`CAP_VOICE_PREPARE_CALL_PATH = '/call/voice_prepare_call'`** + `CAP_VOICE_PREPARE_CALL_METHOD = 'POST'` (VORIG-04).
  Exported from `src/http/endpoints/voice.ts`; re-exported via `src/http/endpoints/index.ts`.

### Changed (additive, non-breaking)

- **`VoiceCallBriefSchema`** extended with 4 optional fields (VORIG-03):
  - `intent?: VoiceCallIntentSchema`
  - `memory_context?: z.string().max(2000)` — ElevenLabs dynVar `{{memory_context}}` (wired in 46.2)
  - `relationship_context?: z.string().max(500)` — prior-interaction summary
  - `provenance?: VoiceCallProvenanceEntry[]` — data-source audit trail

### Why

M46 Voice Origination Composer (phases 46.0-46.4). Replaces free-form `voice_call`
prose with structured `voice_prepare_call` → `voice_call_start` pipeline. 46.0 is
bridge-FIRST per R-14 — no consumer code ships until bridge contracts are locked.

Q11 decision (CONTEXT.md): explicit `memory_context` field on brief (vs enriched string)
for typed validation + 2000-char bound enforcement at bridge layer. Sanitizer
implementation is 46.1 scope.

### Consumer impact

- **Additive only.** All 4 new `VoiceCallBriefSchema` fields are `.optional()` — pre-v1.6.0
  consumers compile and parse unchanged. No migration required for 46.0 (VORIG-05).
- **46.1 (cap-voice, upcoming)**: imports `VoiceCallIntentSchema`, `VoicePrepareCallRequestSchema`,
  `VoicePrepareCallResponseSchema`, `VoiceCallProvenanceEntrySchema` from `@x9-forge/contracts/capability/voice`
  (or the shorter `@x9-forge/contracts/voice` subpath). Also imports `CAP_VOICE_PREPARE_CALL_PATH` +
  `CAP_VOICE_PREPARE_CALL_METHOD` from `@x9-forge/contracts/http`.
- **46.2 (agent-core, upcoming)**: imports `CAP_VOICE_PREPARE_CALL_PATH` for workspace prompt wiring.
- **forge-v2**: no action in 46.0.
- **Vendor sync (agent-x9)**: Plan 03 syncs this version into `vendor/x9-forge-contract-bridge/`;
  consumers do NOT pick up until vendor update committed (VORIG-05).

### Tests

- `tests/capability/voice/origination.test.ts` — 37 tests covering VORIG-01..04:
  - Enum exhaustive (all 7 accepted, unknown/case-variant rejected, order preserved, length=7)
  - Provenance minimal + full round-trip + 500-char summary bound + datetime validation
  - Prepare-call request/response valid + invalid shape + empty-string rejection + optional fields
  - Response bounds `intent_confidence [0,1]` + enum enforcement + provenance array edge cases
  - Brief backward compat (legacy parses unchanged, 4 fields undefined) + 4 new-field accept
  - Brief bounds 2000/500 boundary + over-limit reject
  - Endpoint constant equality (`/call/voice_prepare_call` + `POST`)

---

## [1.5.0] - 2026-04-22 — Bug D1: cap dependency registry

### Added

- **`CapabilityManifestSchema.requires?: string[]`** — optional array of cap names this service depends on at runtime.
- **`CapabilityRegistryEntrySchema.requires?: string[]`** — same field on the registry-entry shape written by X9 generate-registry and Forge deploy.machine.

### Why

Bug D1 (quick-260422-wrz). Today cap-voice can be enabled while cap-calendar is disabled with ZERO error until the first live voice call tries to HTTP-dispatch calendar_today/week/etc. and the LLM hallucinates. `requires` lets agent-core's new `validateDependencies(registry)` fail-fast at boot on config drift.

### Consumer impact

- **Additive only.** Pre-v1.5.0 manifests/entries parse unchanged (`requires: undefined`).
- agent-x9 starts consuming in agent-core `registry.ts` + `validate-dependencies.ts`.
- forge-v2 D2 (storefront bundling + pricing schema) will consume later — OUT OF SCOPE for this release (parked M46).

---

## [1.4.1+blindatura-transcript] - 2026-04-20 — CRITICAL consumer bump required

### Fixed (latent, exposed 2026-04-20)

- **`PostCallPayloadSchema.transcript`** — ElevenLabs changed the post-call webhook shape on some calls so that `data.transcript` arrives as an **array of transcript turns** (structured objects) rather than a plain string. The historical `transcript: z.string().optional()` was too strict — the typed `postCallWebhook()` bridge client would throw `ZodError: expected string, received array`, dropping the whole forward from forge voice-svc → cap-voice and silently breaking the Telegram post-call recap.
- The fix (`z.unknown().optional()` on `transcript` both at the root and under `data.*`) was first landed in bridge commit `189dd850eef2e85a3cedf5972cc6615672e3cc59` ("quick-260419-m2a") on 2026-04-19, verified via golden fixtures + husky pre-commit gate.
- **Consumer status as of 2026-04-20T22:45Z:**
  - `agent-x9` (cap-voice): already consumes post-189dd850 bridge via workspace link + vendor sync — no action needed.
  - `forge-v2` (voice-svc): package.json pin stayed at `00cd9d92` (pre-blindatura) through Phase 45 planning. **Bumped to `1c9c73baddc7db4ab5476270fecec72960ae3058` on 2026-04-20** to unblock the post-call webhook forward.

### Required consumer pin (minimum)

Any repo consuming `PostCallPayloadSchema` MUST pin at or after `189dd850`. Before that SHA the schema rejects array-shaped transcripts and the entire post-call pipeline fails silently (voice-svc returns 200 to ElevenLabs per Pitfall 4, but the cap-voice forward never completes).

| Consumer | Path | Minimum SHA | As of |
|----------|------|-------------|-------|
| agent-x9 | `services/cap-voice/src/webhooks/post-call.ts` + vendor `src/http/endpoints/webhook-post-call.ts` | `189dd850` | ≥1c9c73b (vendored + workspace link) |
| forge-v2 | `services/voice/src/routes/voice.ts` (imports `PostCallPayloadSchema`) | `189dd850` | `1c9c73b` (bumped 2026-04-20) |

### Why this is non-obvious

The 2026-04-19 "quick" session added a 5-layer blindatura (bridge lenient schema + cap-voice normalizer + golden fixtures + husky hook + Claude hook) but the layers only protect the agent-x9 side. forge-v2 has no husky hook and its bridge pin was never atomically bumped per RLSE-02. A future edit to `PostCallPayloadSchema.transcript` that re-tightens the type (e.g. a well-intentioned "make types stricter" refactor) would re-break the same path — the bridge's own husky pre-commit gate (`.husky/pre-commit` running `webhook-post-call` tests) is the backstop.

### How to extend this blindatura

If future breaking changes to this schema are proposed:
1. Run `pnpm test -- webhook-post-call` — it MUST still pass with array-transcript fixtures under `tests/fixtures/elevenlabs-post-call/`.
2. Bump SHA atomically in both `agent-x9/vendor/x9-forge-contract-bridge/` (run `scripts/sync-bridge.sh`) AND `forge-v2/package.json` (`pnpm.overrides.@x9-forge/contracts`) in the same deploy (RLSE-02).
3. Add a new CHANGELOG entry listing all consumers and their new pin. If the change is not additive, bump `[1.5.0]` per SemVer milestone.

---

## [1.4.0] - 2026-04-19

### Added

- `InvalidationReasonSchema` — 10-value enum for memory invalidation tracking (ADR-MEM-GRAPHITI-ALIGNMENT §4.4): `superseded_by_new_fact`, `user_correction`, `admin_correction`, `source_deleted`, `privacy_redaction`, `retention_expired`, `entity_merge`, `entity_split`, `low_confidence_rejected`, `conflict_unresolved`.
- `RecallTemporalModeSchema` — 5 temporal recall modes: `current`, `valid_at`, `known_at`, `valid_between`, `history`.
- `RecallTemporalFilterSchema` — temporal filter contract for recall bundle requests (mode + optional datetime params + include flags).
- `BitemporalFieldsSchema` — bitemporal field contract: `validFrom`/`validTo` (validity time), `recordedAt`/`recordInvalidatedAt` (transaction time), `assertedAt`, `sourceObservedAt`.
- `InvalidationMetadataSchema` — structured invalidation metadata: `reason` (InvalidationReason enum) + optional `sourceId`, `actor`, `note`.
- 45 new unit tests in `tests/memory/invalidation-reason.test.ts` and `tests/memory/temporal.test.ts` covering all new schemas (valid + invalid payloads, edge cases, regression on existing TemporalSemanticsSchema).

### Why

Phase 41 (Memory V2 Graphiti Alignment) requires 4 temporal primitives from ADR-MEM-GRAPHITI-ALIGNMENT. Per R-14, all shared types must land in the bridge BEFORE consumer code. These 5 schemas are consumed by Plans 41-02 through 41-05 in agent-x9.

### Consumer migration (agent-x9)

- `services/memory/src/extraction/pipeline.ts`: `import { InvalidationReasonSchema } from '@x9-forge/contracts/memory'`
- `services/memory/src/routes/internal-recall-bundle.ts`: `import { RecallTemporalFilterSchema } from '@x9-forge/contracts/memory'`
- `services/memory/src/schema.ts`: `import { BitemporalFieldsSchema } from '@x9-forge/contracts/memory'` (reference for column names)

### Notes

- Additive minor bump. No existing contracts modified.
- `TemporalSemanticsSchema` (v1.0) remains untouched — backward compatible.
- `InvalidationReasonSchema` lives in `enums.ts` alongside existing `MemoryStatusSchema` and `MemoryCorrectiveActionSchema`.
- All new temporal schemas live in `temporal.ts` alongside existing `TemporalSemanticsSchema`.

---

## [1.3.0] - 2026-04-18

### Added

- `@x9-forge/contracts/http/endpoints/vault-resolve` — new endpoint contract for `GET /resolve/:agentId/:key` (X9 capabilities → Forge vault-svc, X-Internal-Token auth). Exports:
  - `VaultResolveParamsSchema` / `VaultResolveParams` — path-param schema (numeric `agentId`, non-empty `key`).
  - `VaultResolveResponseSchema` / `VaultResolveResponse` — 200 success body `{ ok: true, key, value, tier }` where `tier` reuses `VaultTierSchema` (platform | owner | agent).
  - `VaultResolveNotFoundResponseSchema` / `VaultResolveNotFoundResponse` — 404 body `{ ok: false, error }` (alias `VaultResolveErrorResponseSchema`).
  - `vaultResolveContract` — `GET /resolve/:agentId/:key`, `authType: 'token'`, paramsSchema + responseSchema.
- Re-exported from `src/http/endpoints/index.ts` so consumers can `import { VaultResolveResponseSchema, vaultResolveContract } from '@x9-forge/contracts/http'` (also reachable via `@x9-forge/contracts/http/endpoints/vault-resolve`).
- 16 new unit tests in `tests/http/endpoints/vault-resolve.test.ts` covering: valid 200 for every tier, missing/wrong tier, missing key/value, `ok: true|false` discriminator guards, non-string `value`, valid 404, missing `error`, alias parity, and contract metadata (method / path / authType / schema wiring).

### Why

Closes R-14 gap identified on 2026-04-17 during Phase 38 Wave 1 review. The agent-x9 `@x9/capability-sdk` VaultClient had shipped with (a) inline `z.enum(["agent","owner","platform"])` (wrong-ordered vs the bridge `['platform','owner','agent']`), (b) a literal `"X-Internal-Token"` header string, and (c) no endpoint contract for `/resolve/:agentId/:key`. This bridge release is the single source of truth; the consumer VaultClient is refactored in the same Phase 38 commit to import from here.

### Consumer migration (agent-x9)

- `packages/capability-sdk/package.json` adds `"@x9-forge/contracts": "link:../../../x9-forge-contract-bridge"` (matches `packages/types`).
- `packages/capability-sdk/src/vault-client.ts`:
  - `import { VaultTierSchema, type VaultTier } from '@x9-forge/contracts/vault'` (replaces local enum).
  - `import { INTERNAL_TOKEN_HEADER } from '@x9-forge/contracts/auth'` (replaces `"X-Internal-Token"` literal).
  - `import { VaultResolveResponseSchema, type VaultResolveResponse } from '@x9-forge/contracts/http'` (replaces the local `z.object({...})` schema).

### Notes

- Additive minor bump. No existing contract is modified.
- `vaultResolveContract` is a token-auth GET contract, so it slots into the existing `createBridgeClient<'token'>` factory without any runtime change.

---

## [1.2.0] - 2026-04-17

### Added

- `@x9-forge/contracts/rag` sub-path (Phase 37.7) — see commit `0774c31` for full list of cap-rag contracts.

### Notes

- No breaking changes. Additive minor bump.

---

## [1.1.0] - 2026-04-16

### Added

- `MemoryCorrectiveActionRequestSchema` + `MemoryCorrectiveActionResponse` — Zod schemas for ADR §20.3 `POST /internal/memory/correct` payload.
- `MemoryActorTypeSchema` (`'forge_user' | 'forge_superadmin' | 'system'`) and `MemoryTargetTypeSchema` (`'episode' | 'fact' | 'rule' | 'entity' | 'alias'`).
- `MemoryConsoleEpisodeSchema`, `MemoryConsoleFactSchema`, `MemoryConsoleRuleSchema`, `MemoryConsoleAliasSchema`, `MemoryConsoleFeedbackSchema` — read-shape schemas for ADR §22 Phase 5 Memory Console.
- `makeListResponseSchema<T>` helper + pre-baked `MemoryConsoleEpisodesResponseSchema`, `MemoryConsoleFactsResponseSchema`, `MemoryConsoleRulesResponseSchema`, `MemoryConsoleAliasesResponseSchema`, `MemoryConsoleFeedbackResponseSchema` for each row type.

### Notes

- Phase 36.6 (Forge governance) consumers: forge-v2 `services/factory` (via `link:`), agent-x9 `services/memory` continues with local Zod (decoupled).
- No breaking changes. Additive minor bump.
- `z.record(z.string(), z.unknown())` used for `beforeSnapshot`/`afterSnapshot` (Zod v4 `z.record()` requires key + value type).

---

## v1.0 — Bridge Foundation

**Shipped:** 2026-04-16 (PR #1, commit `1d709a1`, git tag `v1.0`)

### Added

**Sub-paths (8 total):**
- `@x9-forge/contracts/capability` — `CapabilityManifest`, `CapabilityTool`, `ToolCallRequest/Response`, `CapabilityRegistryEntry` (canonical `{host, port, version, protocol?}` + `toEndpoint`/`fromEndpoint` helpers; **`modelPolicy?` extension** in Phase 6), `EnvSchemaField/Doc`, `HealthStatus`
- `@x9-forge/contracts/agent` — `AgentIdentity` branded, `AgentContextCore` cross-repo, `AgentCredentials` discriminated for 17 known keys + catchall, `parseAgentContext` fail-loud helper
- `@x9-forge/contracts/auth` — `AuthInternalSecret`, `AuthInternalToken` literal discriminated types, header constants
- `@x9-forge/contracts/http` — `createBridgeClient<'secret'|'token'|'none'>` with `AuthForEndpoint<T>` compile-time discrimination, 11 endpoint contracts (HTTP-01..11), SSE frame discriminated schemas + parser (HTTP-05), standardized response envelopes `{ok, data}` / `{ok, code, message, details?}` (HTTP-13/14)
- `@x9-forge/contracts/vault` — `VaultTier`, `VaultSyncState` + `toSyncState`, `VaultEntryPlain` ≠ `VaultEntryEncrypted` (T-05-01 wire-format-leak guard), `SyncAll*`, `WorkspaceFile`, `PlatformBootstrapEnv` (type-only), `AgentVaultedCredentials`
- `@x9-forge/contracts/model-router` — `ModelTier` ordered enum + `compareTiers`, `ModelTierMapping`, `ModelPolicy` (`min ≤ max` invariant), `PerAgentModelOverride` (branded `AgentIdentity` reuse), `ModelPushRequest/Response`, `ModelHotReloadNotification`, `pushModelConfigContract`
- `@x9-forge/contracts/memory` — Memory Engine v2 anticipated contracts: 4 enum schemas (`MemoryScope`, `MemoryType`, `MemoryStatus`, `MemoryCorrectiveAction`) + 5 envelope schemas (`TemporalSemantics`, `MemoryIdentityEnvelope`, `MemoryWriteCandidate`, `RecallBundle`, `RetentionPolicyMetadata`)
- Root `@x9-forge/contracts` — re-exports model-router only (intentional — README guides consumers to sub-paths)

### Changed

- **Bug #15 (post-call webhook 401 silent) closed at compile time** — `createBridgeClient<'secret'|'token'|'none'>` rejects mis-auth construction at TypeScript compile via `AuthForEndpoint<T>` mapping
- **Cross-repo drift guards operational** in agent-x9 + forge-v2 (contract tests catch bridge schema drift)

### Migration notes for consumers

- Consumer `package.json`: pin via `git+https://github.com/App-Templates/x9-forge-contract.git#1d709a1` (or later v1.0 tag/SHA)
- Sub-path imports preferred (`@x9-forge/contracts/<domain>`); root import only re-exports model-router
- Forge prerequisite: zod@4 + TypeScript 6.0.2 + `exactOptionalPropertyTypes: true` (Phase 0)
- agent-x9 already on bridge-compatible baseline since pre-v1.0

### Known v1.0 trade-offs (documented, not bugs)

- Legacy endpoint success responses (`InternalQueryResponseSchema`, `ListAgentsResponseSchema`, etc.) keep domain-specific shapes rather than uniform `{ok, data}` envelope. Standardized envelope IS wired into the error path (`BridgeHttpError` parses `BridgeErrorResponseSchema`). Standardization across success shapes is tracked for the next breaking SHA bump.
- `web/` workspace stuck on zod@3 (R-07 — MCP SDK upstream peer-dep chain). Web does NOT consume the bridge.
- Cosmetic: `HealthStatus` enum uses `'down'` value; original REQUIREMENTS.md said `'unhealthy'` — code is canonical (CAPA-06).

### Operator-deferred items (carried forward)

- 04-03-09: X9 staging deploy
- 04-04-09: Forge staging fixture capture
- 04-04-10: Forge e2e staging smoke (briefing + voice + webhook + internal/turn streaming)
- 05-03 vault sync-all live smoke (POST /api/vault/sync-all)
- MDRT-07 SC#7: agent-x9 Phase 35 ROADMAP cross-repo cite (operator action in agent-x9 repo)
- agent-x9 vendor re-sync via `scripts/sync-bridge.sh` on `fix/docker-bridge-build-context` branch

---

## v1.1 (planned)

**Scope:** Shim Removal + Final Consolidation + Bookkeeping cleanup

### Will add

- ESLint `no-restricted-imports` rule in agent-x9 + forge-v2 (MGRT-06)
- CODEOWNERS in 2 consumers for paths importing the bridge (OBS-05)
- JSDoc on every public export (OBS-04)
- (Optional) Standardize legacy endpoint success responses to `{ok, data}` envelope at next breaking SHA bump

### Will remove (breaking — atomic SHA bump in both consumers)

- `agent-x9/packages/types/capability.ts` compat shim
- `forge-v2/packages/types/src/x9.ts` compat shim
