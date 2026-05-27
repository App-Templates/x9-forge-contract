# Changelog — @x9-forge/contracts

All notable changes to the bridge package. This project adheres to [Semantic Versioning](https://semver.org/) at the milestone level (v1.0, v1.1, etc.); within a milestone, distribution is via SHA-pinned `git+https#<sha>` (no per-feature versioning).

## How releases work in this repo

- **No npm registry.** Consumers (agent-x9, forge-v2) depend via `git+https://github.com/App-Templates/x9-forge-contract.git#<sha>` with a `prepare` build script.
- **Atomic SHA bump.** Breaking contract changes require atomic SHA bump in BOTH consumer repos in the same step (RLSE-02). Never one consumer at a time.
- **Deprecation workflow** (RLSE-03): When deprecating a public symbol, add `/** @deprecated <reason — removal in v<X.Y>> */` JSDoc with explicit removal milestone. Minimum 1 milestone-cycle grace period before removal.

---

## v1.8.0 — 2026-05-27

**Minor release — additive only.** Phase 11.A. New `messaging` subpath + 2 inbound webhook endpoint contracts + new `EndpointAuthType` literal. Zero rename, zero removal, zero shape change of existing schemas. Public API surface 100% backward-compatible with v1.7.1.

### Added
- **New subpath `./messaging`** — cross-channel inbound messaging contracts. 5 schemas:
  - `ChannelTypeSchema` — `z.enum(['telegram','email','voice','whatsapp'])`. Bridge-owned source-of-truth for the 4 channels X9/Forge address. Parallel mirrors locally per Hard Rule 21 (memoria 21) — JSDoc cross-link both files; update in lockstep.
  - `IncomingMessageAttachmentSchema` — reusable attachment subschema (`mime`, `filename`, `size_bytes`, `url`/`inline_b64`).
  - `IncomingMessageEnvelopeSchema` — STRICT internal boundary envelope emitted by cap-email (post-Svix verify) and telegram-router-svc (post-bot-secret verify). `signature_valid: z.literal(true)` enforces D-09 no-fallback (invalid-signature events MUST be dropped at the boundary, never propagated). `raw_provider_event: z.unknown()` is the LENIENT escape hatch for provider drift. Mirrors `capability/voice/normalized-event.ts` pattern.
  - `AgentEmailInboxSchema` — per-agent AgentMail inbox identity (matches Forge `agentmail.service.ts` return shape `{inboxId, email}`). Zero secret material in schema; vault carries the API key under existing `AGENTMAIL_API_KEY` credential (R-17).
  - `AgentTelegramBotSchema` — per-agent Telegram bot identity (`bot_username`, `bot_token_ref` vault pointer, `chat_allow_list` as string array to preserve int64 supergroup ids). NO `bot_token` field — vault carries the value (R-17). Pattern: `botTokenRef` references existing `TELEGRAM_BOT_TOKEN` credential.
- **2 new endpoint contracts in `./http`**:
  - `webhookInboundTelegramContract` (`POST /webhook/inbound/telegram`) — telegram-router-svc inbound. `authType: 'external_provider'` (provider-set secret-token header).
  - `webhookInboundEmailContract` (`POST /webhook/agentmail/inbound`) — cap-email inbound. `authType: 'external_provider'` (Svix HMAC).
- **New `EndpointAuthType` literal: `'external_provider'`** in `src/auth/auth-headers.ts`. Additive — `'secret' | 'token' | 'none'` unchanged. Documents the semantic where auth is supplied by an external provider's own scheme (Svix HMAC, Telegram bot secret-token, ElevenLabs HMAC). Bridge does NOT type the provider header shape; each consumer owns verification. Mirrors precedent in `webhook-post-call.ts:6` JSDoc.
- **Consumer-cjs probe + cjs-smoke** updated with all 5 messaging symbols (`ChannelTypeSchema`, `IncomingMessageEnvelopeSchema`, `IncomingMessageAttachmentSchema`, `AgentEmailInboxSchema`, `AgentTelegramBotSchema`). consumer-cjs-node20 CI gate now exercises the new subpath under NodeNext + Node 20 (Phase 18.1.1 D-18.1.1-3 mechanism).
- **Unit tests** under `tests/messaging/`: 6 files covering happy paths + STRICT boundary rejection cases (`signature_valid: false` rejected, int64 chat-id preservation, branded type safety, etc.).

### Notes
- **NOT added to bridge**: `AGENTMAIL_WEBHOOK_SECRET` is service-local in cap-email `env.ts` with `@bridge-optout` documentation (R-17 service-instance pattern). Mirrors the `ELEVENLABS_WEBHOOK_SECRET` exclusion at `agent-credentials.ts:67-79`. Webhook secrets are per-registration, not per-agent, so they don't belong in `AgentCredentialsSchema`.
- **Voice keeps `capability/voice/`** subpath — call-shaped contract predates the generic envelope and remains canonical for voice (transcript, conversation_id, post-call recap). Messaging subpath covers everything that is NOT call-shaped.
- **Snake_case convention** maintained across messaging transport payloads (`message_id`, `body_text`, `received_at`, `provider_event_hash`) — matches `normalized-event.ts` template.
- **`'external_provider'` auth literal** is intentionally distinct from `'token'` to preserve Bug #15 semantics (`'token'` reserved for `X-Internal-Token` forwarded across X9/Forge).
- **No removal, no rename, no shape change of existing schemas.** Public API surface byte-equivalent for v1.7.1 imports.

### Consumer impact
- **agent-x9**: zero install impact (link mode reads `dist/` directly). Consumers of `./messaging` subpath will become cap-email (Phase 11.B) and telegram-router-svc (Phase 11.C). Forge factory-svc may also import `AgentEmailInboxSchema` for cross-repo provisioning handshake.
- **forge-v2**: atomic SHA bump of `pnpm.overrides["@x9-forge/contracts"]` from `41d8ee5...` to the new v1.8.0 HEAD SHA. Same wave as bridge merge (RLSE-02 atomic). Forge factory-svc will optionally consume `AgentEmailInboxSchema` to type the `agentmail.service.ts` return value cross-repo.
- **parallel**: atomic SHA bump of `pnpm-lock.yaml` + `scripts/verify-bridge-pin.mjs` (replace SHA constant). 16 services in `*` pattern resolve via override. Parallel uses the messaging subpath in Phase 11.E inbound→Director→outbound loop.

### Rollback anchor
- Pre-Phase-11 baseline: tag `pre-phase-11-2026-05-27` at commit `41d8ee5` (v1.7.1 + STATE doc update). Restore via `git reset --hard pre-phase-11-2026-05-27` + atomic SHA revert in forge-v2/parallel.

### Incident reference
- Phase 11 plan + intel: `/Users/admintemp/Downloads/Claude/parallel/.planning/phases/11-multi-canale-routing/` (Parallel-side planning).
- Phase 10.11 night work that exposed the gap (outbound-only demo, no inbound loop): `/Users/admintemp/Downloads/Claude/parallel/.planning/phases/10-director-runtime-narrative-loop/10-11-NIGHT-FINAL.md`.

---

## v1.7.1 — 2026-05-05

**Hotfix release.** Closes the Node 20 consumability gap that broke forge-v2 CI on the v1.7.0 pin bump (`986634b`, CI run 25377004134). Public API surface byte-equivalent to v1.7.0 (R-14).

### Fixed
- **`engines.node` lowered** from `">=22.0.0"` to `">=20.0.0"` (Phase 18.1.1 D-18.1.1-1). Forge-v2 CI runs Node 20.20.2 — the previous constraint produced `WARN Unsupported engine` on install + downstream zshy ran on unsupported runtime, emitting `.d.cts` Node 20 NodeNext could not resolve (TS2307 across every subpath consumer).
- **`prepare`-in-temp-store dependency eliminated** (D-18.1.1-2). Bridge tarball now ships `dist/` pre-built; consumer `pnpm install --frozen-lockfile` no longer invokes zshy in pnpm 10 temp store. `package.json#/scripts.prepare` narrowed from `"husky && pnpm build"` to `"husky"` only; new `prepublishOnly` script keeps the npm publish path running `pnpm build`. `.gitignore` no longer excludes `dist/`.

### Added
- **`tests/consumer-cjs/` synthetic fixture + `consumer-cjs-node20` CI gate** (D-18.1.1-3). New required job in `.github/workflows/ci.yml` spins Node 20 + ubuntu + pnpm 10, runs `pnpm pack`, installs the tarball into a CommonJS-shaped fixture (`tsconfig.json` `moduleResolution: NodeNext` + `module: NodeNext` + `skipLibCheck: false`), runs `tsc --noEmit`. Catches every Phase-19-class subpath-resolution bug AT THE BRIDGE PR, not at consumer install time. Closes the producer-only-validation gap that let v1.7.0 ship broken.
- **`dist`-staleness CI gate** (companion to D-18.1.1-2). Existing Node 22 `test` job now asserts `git diff --quiet -- dist/` after `pnpm build` — committed dist must stay in lockstep with src.

### Notes
- **No breaking changes for ESM consumers.** Public API surface byte-identical to v1.7.0 (R-14 verified via `find dist -name '*.d.ts' -o -name '*.d.cts' | xargs grep -hE '^export ' | sort -u` → 735 export lines, zero-diff against v1.7.0 baseline).
- **agent-x9 unaffected** by the dist commit — it consumes via `link:` mode (file-system path), reads `dist/` directly. Tracked dist/ adds nothing for link consumers.
- **forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]`** to v1.7.1 SHA per RLSE-02 (atomic consumer bump). Tracked in forge-v2 Phase 18.1.1 Plan 02 Task 4.
- **v1.7.0 tag preserved on origin** as historical record (first dual-build attempt with engines/prepare flaws). v1.7.1 is the working release pointer.

### Why
Phase 18.1 attempted 2026-05-05. Bridge v1.7.0 ran 4 producer-side validation layers (vitest 711+/711+, cjs-smoke 13/13, publint, attw) all green LOCALLY on Node 22 + pnpm 9. Pushed; tagged. Forge-v2 pin bump `986634b` pushed to main → CI run 25377004134 FAILED with TS2307 across every bridge subpath consumer (`Cannot find module './agent-identity.cjs'` etc.). Local pin install passed (Node ≥22); CI on Node 20 failed.

3-auditor consensus 2026-05-05 (x9-verifier + x9-contract-bridge-auditor + x9-release-auditor):
- Smoking gun: `engines.node = ">=22.0.0"` mismatch with CI Node 20.20.2.
- Root cause: zshy `prepare` brittleness in pnpm 10 temp-store on CI (RESEARCH.md §Pitfall #3 — Fix C explicitly endorsed: commit dist/ to git).
- Validation gap: producer-side validation (publint+ATTW+vitest+cjs-smoke) all run INSIDE the bridge — none replicated a fresh consumer install on the consumer's runtime. Bridge-side CI gate added.

### Consumer impact
- **agent-x9:** zero impact (link mode reads `dist/` directly; engines lower is more permissive, not less).
- **forge-v2:** atomic SHA bump required (Phase 18.1.1 Plan 02 Task 4-5). After bump, fresh `pnpm install --frozen-lockfile` exits 0 on Node 20 + ubuntu + pnpm 10. Phase 19 deploy retry unblocked.

### Rollback anchor
- Bridge tag `pre-phase-18.1.1-2026-05-05` (LOCAL only) at commit `2520403` (post-Phase-18.1 v1.7.0 release commit + STATE update).
- Bridge tag `v1.7.0` on origin remains valid as the previous (broken-on-Node-20) release pointer.
- Bridge tag `pre-phase-18.1-2026-05-05` (LOCAL only) at `4f2da00` remains as v1.6.3 baseline.

### Incident reference
- forge-v2 CI run that surfaced the bug: GitHub Actions run `25377004134` on commit `986634b` (2026-05-05).
- forge-v2 Phase 18.1 handoff: `forge-v2/.planning/phases/18.1-bridge-dual-esm-cjs-build/18.1-HANDOFF.md`
- forge-v2 Phase 18.1.1: `forge-v2/.planning/phases/18.1.1-bridge-v1.7.1-hotfix/`
- Memory: `project_phase19_paused_cjs_esm_bug_2026_05_04.md` (2026-05-05 update section)

---

## v1.7.0 — 2026-05-05

### Added
- **Dual ESM+CJS build pipeline.** `pnpm build` now uses [`zshy`](https://github.com/colinhacks/zshy) (the same toolchain zod uses) to emit both ESM (`.js` + `.d.ts`) AND CJS (`.cjs` + `.d.cts`) artifacts for every public subpath. `package.json#/exports` declares `"types"` + `"import"` + `"require"` triples for all 11 subpaths (auto-written by zshy). `package.json#/main` flips to `./dist/index.cjs`, `package.json#/types` flips to `./dist/index.d.cts`, while `"type": "module"` and the `"import"` condition stay unchanged for ESM consumers.
- **`./capability/stt` subpath now has source.** The exports entry was declared in commit `43f7ef5` (X9 Phase 47.0) but no source file existed in the bridge — agent-x9's `services/cap-stt` consumes the subpath via link mode but a fresh git+https install would have failed. New `src/capability/stt/index.ts` exports `CAP_STT_DEFAULT_PORT` (number, =4011), `TranscribeProviderSchema` (zod enum: openai|elevenlabs), `TranscribeRequestSchema`, `TranscribeResponseSchema` + types. Symbol set derived from agent-x9 import sites (4 files in services/cap-stt/src).
- **CJS resolution smoke test.** `tests/cjs/smoke.cjs` is a pure-CommonJS file that runs via `node tests/cjs/smoke.cjs` (NOT vitest — vitest's loader is ESM and does not exercise the bug class that crashed forge-v2 vault-svc on 2026-05-04). The smoke `require()`s every public subpath + asserts known named symbols.
- **ESM smoke test.** `tests/esm/smoke.test.ts` mirrors the CJS smoke under vitest, proving ESM consumers (agent-x9 link mode + future ESM forge-v2) are unaffected by the dual build.
- **`publint` + `@arethetypeswrong/cli` validation layers.** Wired into `pnpm check:pack` (separated from `build` to avoid a recursive `prepare`-script fork-bomb — see Plan 01 Deviation #1). publint catches malformed `exports` map entries (missing files, wrong condition order). attw catches types-resolution failures across node10 / node16-cjs / node16-esm / bundler conditions. attw runs with `--profile node16 --ignore-rules false-cjs` to suppress the documented benign "Masquerading as CJS" warning that follows from the standard zod pattern (`"type": "module"` + `"types"` → `.d.cts`). New `pnpm validate` aggregator runs build + check:pack + test as a one-shot CI/pre-release entry point.
- **`scripts/check-portable-dts.mjs` walker extension.** Now scans `.d.cts` and `.d.mts` in addition to `.d.ts`. Function rename `walkDts` → `walkDeclarationFiles`. The TS2883 portable-dts guardrail introduced in v1.6.3 stays effective on the new artifact class.

### Notes
- **No breaking changes for existing ESM consumers.** Public API surface is byte-identical for the 9 pre-existing subpaths (verified via R-14 byte-identity diff: `find dist -name '*.d.ts' | xargs grep -hE '^export ' | sort -u` produces zero removed lines). Net-new exports come ONLY from the back-filled `./capability/stt` subpath (additive).
- **agent-x9 unaffected** by the dual build — it consumes via `link:` (file-system path), reads `dist/` directly, and the dual build adds CJS files alongside ESM without removing anything. agent-x9 stays on its current bridge link.
- **forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]`** to the new bridge SHA per RLSE-02 (atomic consumer bump). This is the post-release follow-up tracked in forge-v2 Phase 18.1 Plan 02 Task 4.

### Why
Forge-v2 Phase 19 deploy attempt (2026-05-04) crashed vault-svc with `ERR_PACKAGE_PATH_NOT_EXPORTED` on `@x9-forge/contracts/auth`. Root cause: bridge was full-ESM (`"type": "module"` + only `"import"` condition); all 5 forge-v2 services compile CJS (`tsconfig.json "module": "CommonJS"`); tsc emits `require("@x9-forge/contracts/auth")`; Node CJS resolver finds no `"require"` field in exports → throws. The latent bug was introduced in Phase 18-04 R-14 hygiene sweep (commits `20f0af1`, `ea24add`) which migrated subpath imports into vault, factory, voice. Local vitest passed because it runs the ESM resolver. First runtime exposure was Phase 19 deploy → PATH C Hostinger snapshot restore. Phase 18.1 closes the structural bug in the bridge so Phase 19 retry can succeed.

### Consumer impact
- **agent-x9:** zero impact (link mode reads `dist/` directly; new `./capability/stt` source resolves what was previously dangling — actually IMPROVES the install path for fresh consumer scenarios).
- **forge-v2:** atomic SHA bump required (Phase 18.1 Plan 02 Task 4-6). After bump, forge-v2 services compile + boot under CJS without the ERR_PACKAGE_PATH_NOT_EXPORTED crash. Phase 19 deploy retry unblocked.

### Rollback anchor
- Bridge tag `pre-phase-18.1-2026-05-05` at commit `4f2da00d0a7ae68ef4ca65c6b9664d63389e360d` (the v1.6.3 release commit).
- Bridge tag `pre-ts2883-fix-2026-05-04` at commit `7f718c17b1d65c6549ee8d43ceae2e814e3ad37c` (v1.6.2) remains valid.

### Incident reference
- forge-v2 Phase 19 Plan 02 deploy log: `forge-v2/.planning/phases/19-coordinated-phase17-18-deploy/19-DEPLOY-LOG.md` §"Task 2 — INCIDENT + ROLLBACK"
- forge-v2 Phase 18.1: `forge-v2/.planning/phases/18.1-bridge-dual-esm-cjs-build/`
- Memory: `project_phase19_paused_cjs_esm_bug_2026_05_04.md`

---

## v1.6.3 — 2026-05-04

### Fixed
- `src/http/endpoints/{cap-env-schema,cap-health,cap-manifest,memory-correct}.ts`: added `import { z } from 'zod'` so emitted `.d.ts` uses the portable `z.ZodObject<...>` named form instead of a synthesized `import("zod").ZodObject<...>` string. Without the in-scope `z`, TypeScript writes a string-literal import that a pnpm 10 consumer resolves through its temp prepare store (`_tmp_<hash>/`), producing TS2883 declaration emit errors.

### Added
- `scripts/check-portable-dts.mjs` — guardrail that fails the build if any emitted `.d.ts` contains a non-portable synthesized import (`import("zod")`, pnpm temp-store paths, or any `node_modules/` path). Wired as the second step of `pnpm build`, so every local build, every consumer `prepare`, and bridge CI catch a regression of this class at build time. Verified positive (700/700 tests, 89 portable `.d.ts`) and negative (injected violation → exit 1 with file + count + sample + fix recipe).

### Notes
- No breaking changes — pure declaration-emit fix; runtime behavior and public API identical to 1.6.2.
- Asymptomatic on bridge own CI (Node 22 / pnpm 10) because the bridge builds in a stable layout. Manifested only when a fresh pnpm 10 consumer fetched the package and ran `prepare` in a temp store.
- Incident reference: forge-v2 GH Actions run 25328536024 (2026-05-04) — Phase 19 deploy CI failed at `pnpm install --frozen-lockfile` during bridge `prepare` step.
- Rollback anchor: tag `pre-ts2883-fix-2026-05-04` on bridge commit `7f718c17b1d65c6549ee8d43ceae2e814e3ad37c` (v1.6.2).
- Consumer follow-up: forge-v2 must bump `pnpm.overrides["@x9-forge/contracts"]` to the new bridge SHA (atomic SHA bump per RLSE-02). agent-x9 currently uses `link:` and is unaffected.

---

## v1.6.2 — 2026-04-30

### Added
- `@x9-forge/contracts/memory`: `MEMORY_CORRECT_PATH`, `MEMORY_CORRECT_METHOD`, `MEMORY_CONSOLE_LIST_PATH_TEMPLATE`, `MEMORY_CONSOLE_LIST_METHOD` path constants (Phase 18 D3).
- `@x9-forge/contracts/http`: `memoryCorrectContract` endpoint contract (POST /internal/memory/correct, secret auth) and `memoryConsoleListContract` metadata + `memoryConsoleParamsSchema` + `MemoryConsoleKindSchema` (GET /internal/memory/console/:kind, secret auth).
- Tests: `tests/http/endpoints/memory-correct.test.ts`, `tests/http/endpoints/memory-console.test.ts`.

### Notes
- Closes forge-v2 Phase 18 D3 (R-14 cross-repo URL hygiene for memory-v2 routes).
- No breaking changes — additive only. Consumers can upgrade transparently.

---

## [1.6.1] - 2026-04-25 — M46 Phase 46.1: Bug C send_recap_email narrowing

### Added

- **`SendRecapEmailInputSchema`** — narrowed `send_recap_email` input shape (`{intent?: z.string().max(200).optional()}`). Replaces the generic `z.record(z.string(), z.unknown())` at the cap-voice handler boundary. LLM no longer supplies `subject`/`body`/`to` (Bug A closed `to`; Bug C closes `subject`/`body`).
- **`SendRecapEmailOutputSchema`** — narrowed output shape with `body_source: z.enum(['template'])`. Single value first cut; widens M47+ if LLM-synthesis fallback is enabled.

### Changed

- (additive only — no breaking changes; envelope `VoiceToolCallRequestSchema.input` stays `z.record` to preserve the 13-tool generic dispatch)

### Why

Bug C fold-in per `project_bug_c_decided_fold_in_m46_2026_04_23.md`. The recap email body is now composed server-side by `services/cap-voice/src/brief-composer/recap-body-composer.ts`. LLM-supplied body content is IGNORED. Eliminates the hallucination foot-gun observed in conv_2501 and quick-260422-qhc Ferrari test.

### Consumer impact

- **Additive only.** Envelope schema unchanged.
- cap-voice consumes the new schemas in `services/cap-voice/src/tools/send-recap-email.ts`.
- ElevenLabs dashboard tool description tightens via `sync-elevenlabs-tools.ts` PATCH at end of Phase 46.1 (D-13).
- Old consumers passing `subject`/`body`/`to` continue to work at envelope level — those fields are now silently ignored by the cap-voice handler. Tool count stays 13.

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
