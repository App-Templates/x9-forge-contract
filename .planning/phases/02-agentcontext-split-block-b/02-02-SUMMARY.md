---
plan: "02-02"
status: complete
started: 2026-04-15
completed: 2026-04-15
backfilled: 2026-04-16
backfill_reason: "SUMMARY not authored at execution time (auto-chain skipped write step). Reconstructed from PLAN, git commit ab3b254, on-disk src/agent/, and tests/agent/."
commits:
  - ab3b254 feat(agent): AgentIdentity branded, AgentContextCore, AgentCredentials discriminated, parseAgentContext (02-02)
tests_added: 31
tests_total: 88 (post Phase 2; precedent: 57 from Phase 1)
requirements_completed: [AGNT-01, AGNT-02, AGNT-04, AGNT-05]
requirements_completed_partial: []
---

# Summary — Plan 02-02: Bridge — AgentIdentity branded + AgentContextCore + AgentCredentials + parseAgentContext

## What was delivered

1. **`src/agent/agent-identity.ts`** (16 lines) — `AgentIdSchema` and `OwnerIdSchema` as Zod string schemas with `.brand<'AgentId'>()` / `.brand<'OwnerId'>()`. `AgentIdentitySchema` composes both. Branding direction is "out" (Zod v4 default): `parse()` accepts plain string, output is branded type. Per AF-02, only `AgentId`/`OwnerId` branded — no over-branding.

2. **`src/agent/agent-credentials.ts`** (57 lines) — `KNOWN_CREDENTIAL_KEYS` const-asserted array of 17 keys (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_API_KEY`, `AGENT_CHAT_MODEL`, `TELEGRAM_BOT_TOKEN`, `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID`, `ELEVENLABS_MINDFULNESS_AGENT_ID`, `FORGE_VOICE_REGISTER_TOKEN`, `AGENTMAIL_API_KEY`, `AGENTMAIL_INBOX_ID`, `AGENT_EMAIL`, `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET`, `GOOGLE_CALENDAR_REFRESH_TOKEN`, `INTERNAL_SECRET`, `X9_INTERNAL_SECRET`). `AgentCredentialsSchema` is a `z.object({...})` with each key as `z.string().optional()` (IDE autocomplete) plus `.catchall(z.string())` (dynamic capability-specific keys).

3. **`src/agent/agent-context-core.ts`** (37 lines) — `LlmConfigSchema = { provider, model }`. `AgentContextCoreSchema = { agentId, ownerId, credentials, llmConfig, telegramAllowFrom: string[] }.passthrough()`. The `.passthrough()` is critical — Forge writes Runtime fields (`workspacePath`, `registryPath`, `telegramBotToken`, `displayName`) into the same JSON; bridge schema validates the Core subset without stripping them.

4. **`src/agent/parse-agent-context.ts`** (21 lines) — `parseAgentContext(json: unknown): AgentContextCore` thin wrapper that `.parse()`s with fail-loud ZodError on invalid input. Used at the X9 boundary where context.json is loaded.

5. **`src/agent/index.ts`** barrel export — re-exports all schemas + types from the 4 source files.

6. **Tests added (31 total across 4 files):**
   - `tests/agent/agent-identity.test.ts` (8 tests) — brand reject empty, accept valid, type-level check via `@ts-expect-error`, AgentIdentity composes both
   - `tests/agent/agent-credentials.test.ts` (7 tests) — known keys parse + autocomplete, catchall accepts dynamic keys, rejects non-string values, parse the production fixture
   - `tests/agent/agent-context-core.test.ts` (10 tests) — full Core parse, passthrough preserves Runtime fields, rejects missing required fields, LlmConfig validation
   - `tests/agent/parse-agent-context.test.ts` (6 tests) — happy path with all 3 fixtures from 02-01, fail-loud on invalid input, branded types in output

## Requirements addressed

- **AGNT-01** ✓ FULL — `AgentIdentity` branded with `AgentIdSchema`/`OwnerIdSchema`, both via `z.infer`
- **AGNT-02** ✓ FULL — `AgentContextCore` Zod schema (cross-repo); writes from Forge, reads in X9; `.passthrough()` preserves Runtime fields without exposing them in the type
- **AGNT-04** ✓ FULL — `AgentCredentials` discriminated for 17 known keys (autocomplete) + `.catchall(z.string())` (dynamic catchall)
- **AGNT-05** ✓ FULL — `parseAgentContext(json: unknown): AgentContextCore` fail-loud wrapper; tested with 3 production fixtures from 02-01

## Notable implementation detail

- `GOOGLE_CALENDAR_REFRESH_TOKEN` added to KNOWN_CREDENTIAL_KEYS during execution (originally 16 keys in plan, became 17 after surfacing the calendar refresh token usage in cap-calendar). Reflected in plan amendment.
- `.passthrough()` chosen over `.strict()` for AgentContextCoreSchema — Forge's full context.json contains Runtime fields the bridge schema doesn't model. `.strict()` would have rejected real production data.
- Brand direction = "out" (Zod v4 default) — accepts `string`, outputs branded. Required explicit casts in two single-agent fallback paths in agent-x9 (`agent-core/src/index.ts`) — documented as expected.

## Verification

- `pnpm build` — clean
- `pnpm test -- --run tests/agent` — 31/31 passing across 4 test files (verified at backfill time 2026-04-16, still green)
- All 3 fixtures from 02-01 round-trip through `parseAgentContext` without errors

## Notes (backfill)

Reconstructed on 2026-04-16 from:
- Plan file `02-02-PLAN.md` (intent + per-task action blocks + acceptance criteria)
- Git commit `ab3b254` (single atomic delivery)
- On-disk source `src/agent/{agent-identity,agent-credentials,agent-context-core,parse-agent-context,index}.ts`
- On-disk tests `tests/agent/*.test.ts` (verified passing at backfill)
- Phase 2 STATE.md detail block + integration checker findings + project_phase3_complete.md memory
The work was real, merged, and reachable from `dist/agent/index.js`. Only the SUMMARY write step was missed at execution time (auto-chain mode).
