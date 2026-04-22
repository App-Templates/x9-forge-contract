# Changelog — @x9-forge/contracts

All notable changes to the bridge package. This project adheres to [Semantic Versioning](https://semver.org/) at the milestone level (v1.0, v1.1, etc.); within a milestone, distribution is via SHA-pinned `git+https#<sha>` (no per-feature versioning).

## How releases work in this repo

- **No npm registry.** Consumers (agent-x9, forge-v2) depend via `git+https://github.com/App-Templates/x9-forge-contract.git#<sha>` with a `prepare` build script.
- **Atomic SHA bump.** Breaking contract changes require atomic SHA bump in BOTH consumer repos in the same step (RLSE-02). Never one consumer at a time.
- **Deprecation workflow** (RLSE-03): When deprecating a public symbol, add `/** @deprecated <reason — removal in v<X.Y>> */` JSDoc with explicit removal milestone. Minimum 1 milestone-cycle grace period before removal.

---

## [1.3.0] - 2026-04-22 (quick 260422-qhc — Bug A email hallucination structural fix)

### Added

- `@x9-forge/contracts/voice` — `VoiceToolNameSchema` extended with `'confirm_recipient_email'` (13-tool surface; was 12).
- `ConfirmRecipientEmailInputSchema = z.object({ email: z.string().email() })` + `ConfirmRecipientEmailOutputSchema = z.object({ confirmed, email, shadow?, message? })` + `ConfirmRecipientEmailInput` / `ConfirmRecipientEmailOutput` types.
- Re-exports wired in `src/capability/voice/index.ts` (tool-surface group).
- Schema tests: 6 new cases under `describe('ConfirmRecipientEmail schemas …')` + enum-length assertion updated 12 → 13 + `MUTATING_VOICE_TOOLS` exclusion test.

### Why

Closes Bug A (email hallucination) per ADR-cap-voice §13.5 D-16 evolution — server-authoritative `recipient_email`. Live evidence `conv_2501kptzb3nffjctrr9zc5tne1ek` (2026-04-22 16:11-16:13) showed the voice LLM inventing `stefano.argiolas@example.com` when `{{recipient_email}}` was empty. Removing the `to` foot-gun from `send_recap_email` requires a mid-call server-side path to populate the brief — that is `confirm_recipient_email`. Consumer cap-voice changes land in sibling agent-x9 commit.

### Compat

- **Additive.** Existing 12-tool consumers continue to parse their own subset via `VoiceToolNameSchema` without change.
- **`MUTATING_VOICE_TOOLS` unchanged** (still 7 tools). `confirm_recipient_email` is intentionally excluded — it is a brief-population prerequisite, not a downstream side-effecting mutation, so `idempotency_key` is not required.
- **Prior consumers of `send_recap_email`:** tool surface input shape does not narrow in the bridge (the bridge already treats `input` as `z.record(z.string(), z.unknown())`); the `to` foot-gun is removed by the consumer handler rewrite in cap-voice, not by a bridge schema narrowing.

### Rollback

If cap-voice consumer diverges or the new tool misbehaves in smoke: pin agent-x9 to bridge `1.2.0` (commit `b4fd9e4`). No DB migration dependency — `VoiceCallBriefSchema.recipient_email` was already optional prior to this release.

---

## [1.2.0] - 2026-04-19 (Phase 42 — CAP-Voice v2.2 foundation)

### Added

- `@x9-forge/contracts/voice` sub-path with 27 canonical schemas for the CAP-Voice v2.2 runtime (ADR-cap-voice.md §5.2 / D-04):
  - **Brief + authorization (2):** `VoiceCallBriefSchema`, `AuthorizedActionsSchema` (includes W-06 flags `can_share_sensitive_pii` + `can_act_outside_brief`).
  - **Call lifecycle (2):** `VoiceCallStartRequestSchema`, `VoiceCallStartResponseSchema`.
  - **Tool surface (4):** `VoiceToolNameSchema` (12-tool enum per D-16), `VoiceToolStatusSchema`, `VoiceToolCallRequestSchema` (superRefine enforces D-17 idempotency for mutating tools), `VoiceToolCallResponseSchema`.
  - **Calendar tool shapes (8):** `CalendarAvailability{Request,Response}Schema`, `CalendarConflict{Request,Response}Schema`, `CalendarHold{Request,Response}Schema`, `CalendarHoldRelease{Request,Response}Schema`.
  - **ElevenLabs webhook events (4):** `ElevenLabsWebhookEventTypeSchema` (enum) + `ElevenLabsPostCallTranscriptionEventSchema` / `ElevenLabsPostCallAudioEventSchema` / `ElevenLabsCallInitiationFailureEventSchema` (all LENIENT — `z.unknown()` + `.passthrough()` per external-provider-lenient policy).
  - **Forge normalized event (1):** `ForgeVoiceWebhookNormalizedEventSchema` (STRICT — internal X9↔Forge contract, no passthrough, signature_valid literal true).
  - **cap-voice ingest (2):** `CapVoicePostCallIngestRequestSchema`, `CapVoicePostCallIngestResponseSchema`.
  - **Reconciled outcome (1):** `VoiceCallOutcomeSchema` (16 fields per ADR §14.2).
  - **Tool log (1):** `VoiceCallToolLogSchema` (row shape for `call_tool_calls` table per D-27).
  - **Memory handoff (1):** `VoiceCallMemoryIngestPayloadSchema` (Phase 42 CONTRACT-ONLY STUB — extractor branch is Phase 43 scope per D-21/D-22).
  - **Privacy (1):** `VoicePrivacyMetadataSchema` (literal `source_type="voice_call"` + privacy level + jurisdiction flags).
  - Plus supporting named enums (no inline `z.enum`): `VoiceToolCallSourceSchema`, `VoiceCallOutcomeKindSchema`, `VoiceRecipientSentimentSchema`, `VoicePrivacyLevelSchema`, `CapVoiceIngestStatusSchema`.
  - Runtime helper: `MUTATING_VOICE_TOOLS` Set for idempotency gating.
- HTTP endpoint contracts under `src/http/endpoints/voice.ts` (re-exported from `@x9-forge/contracts/http`):
  - `FORGE_VOICE_WEBHOOK_POST_CALL_PATH` = `/webhooks/elevenlabs/post-call` (Forge voice-svc public ElevenLabs ingress).
  - `CAP_VOICE_INTERNAL_POST_CALL_PATH` = `/internal/voice/post-call` (Forge -> cap-voice forward).
  - `CAP_VOICE_CALL_START_PATH` = `/call-start` (cap-voice outbound init).
  - `CAP_VOICE_CALL_TOOL_PATH(tool)` typed path builder + `CAP_VOICE_CALL_TOOL_PATHS` frozen map of all 12 tool paths.
  - Matching `*_METHOD` constants.
- Golden fixtures under `tests/capability/voice/fixtures/{valid,invalid}/` — ≥1 valid + ≥1 invalid fixture per schema (27 + 27 minimum).
- New test suites:
  - `tests/capability/voice/schemas.test.ts` — parse/reject behavior for every schema, D-17 idempotency gate, W-06 authorized-actions defaults, ElevenLabs lenient passthrough, strict normalized-event missing-field rejection.
  - `tests/http/endpoints/voice.test.ts` — endpoint path + method constant equality, tool path builder R-14 compliance.

### Why

Phase 42 foundation (CAP-Voice v2.2). The ADR mandates `@x9-forge/contracts/voice` as the canonical source of truth (D-03) for every shape crossing the Forge↔X9 boundary. Plans 03 (forge-v2 voice-svc rebuild) and 04 (agent-x9 cap-voice internal receiver) SHA-pin to a bridge commit from this release before consuming any of these schemas — bridge ships FIRST per D-30 / R-14.

### Constraints

- ElevenLabs webhook event schemas are LENIENT (`z.unknown()` + `.passthrough()`) per `feedback_external_provider_schema_lenient.md`. Normalization happens at the Forge consumer boundary after HMAC validation.
- `ForgeVoiceWebhookNormalizedEventSchema` is STRICT — it is the internal X9↔Forge contract. Bug #15-style drift MUST fail at compile time.
- `VoiceCallMemoryIngestPayloadSchema` is CONTRACT-ONLY in Phase 42. Memory v2 `source_type="voice_call"` extractor is Phase 43 scope (lock-zone).
- All named enums and header constants reused — NO inline `z.enum([...])` in consumer-typed fields, NO literal `"X-Internal-Token"` / `"X-Internal-Secret"` strings (R-14 compliance).

### Rollback (per D-32 §23.1)

If bridge tests regress or consumers fail typecheck post-SHA-bump: pin agent-x9 + forge-v2 to the previous bridge SHA (`00cd9d92`), keep `@x9-forge/contracts/voice` exports marked `@deprecated` for ≥1 rollout cycle before removal, and document the revert commit in the next CHANGELOG entry.

### Consumer migration (plans 03, 04, 05, 06)

- `forge-v2/services/voice-svc/**` (Plan 03): `import { ForgeVoiceWebhookNormalizedEventSchema, ElevenLabsWebhookEventTypeSchema, FORGE_VOICE_WEBHOOK_POST_CALL_PATH, CAP_VOICE_INTERNAL_POST_CALL_PATH } from '@x9-forge/contracts/voice'` / `@x9-forge/contracts/http`.
- `agent-x9/services/cap-voice/**` (Plan 04 + 05): `import { CapVoicePostCallIngestRequestSchema, VoiceToolNameSchema, AuthorizedActionsSchema, VoiceCallOutcomeSchema, VoiceCallToolLogSchema, CalendarHoldRequestSchema, ... } from '@x9-forge/contracts/voice'`.
- `agent-x9/services/cap-voice/src/memory-handoff/**` (Plan 04 Task 3): `import { VoiceCallMemoryIngestPayloadSchema } from '@x9-forge/contracts/voice'`.

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
