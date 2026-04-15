# AgentContext Backward-Compatibility Notes

**Source:** VPS staging SSH inventory (2026-04-15) + codebase analysis
**Finding:** VPS staging `/data/agents/` is empty (no agents deployed). All field shapes derived from source code analysis of `deploy.machine.ts` (writer) and `agent-manager.ts` (reader).

## VPS Inventory Summary

- **Total context.json files on VPS:** 0 (staging env, no agents deployed)
- **Source of truth for shape:** `forge-v2/services/factory/src/services/deploy.machine.ts` lines 378-391
- **Reader:** `agent-x9/services/agent-core/src/core/agent-manager.ts` lines 22-28

## Passthrough Fields

Fields present in production context.json that are NOT part of `AgentContextCore` but must survive `.passthrough()` parsing:

| Field | Type | Source |
|-------|------|--------|
| `workspacePath` | `string` (absolute path) | Derived from agentId by Forge deploy |
| `registryPath` | `string` (absolute path) | Derived from agentId by Forge deploy |
| `telegramBotToken` | `string` | From `params.telegram_bot_token` AND duplicated in `credentials['TELEGRAM_BOT_TOKEN']` |
| `displayName` | `string` | From `params.name` |

All 4 fields are written by Forge and consumed by X9 at boot. They become part of `AgentContextRuntime` (X9-local, not in bridge).

## Credential Key Catalog

### Known Keys (will be in `KnownCredentialKey` union)

These keys are used directly in capability code via `credentials['KEY']` or env schema:

| Key | Capability | Required | Notes |
|-----|-----------|----------|-------|
| `OPENAI_API_KEY` | agent-core, telegram | Yes (for most agents) | Primary LLM key |
| `ANTHROPIC_API_KEY` | agent-core | Optional | Alternative LLM provider |
| `GOOGLE_API_KEY` | agent-core | Optional | Alternative LLM provider |
| `AGENT_CHAT_MODEL` | agent-core | Optional | Overrides `llmConfig.model` in some paths |
| `TELEGRAM_BOT_TOKEN` | agent-core, telegram | Yes | Also duplicated as top-level field |
| `ELEVENLABS_API_KEY` | agent-core (TTS) | Optional | Text-to-speech |
| `ELEVENLABS_VOICE_ID` | agent-core (TTS) | Optional | Default: `etz1gLgQTuQIYLCRkFJh` |
| `ELEVENLABS_MINDFULNESS_AGENT_ID` | cap-websocket | Optional | Separate ElevenLabs agent for mindfulness |
| `FORGE_VOICE_REGISTER_TOKEN` | cap-voice | Optional | Token for Forge voice-svc registration |
| `AGENTMAIL_API_KEY` | cap-email | Optional | AgentMail API key |
| `AGENTMAIL_INBOX_ID` | cap-email | Optional | AgentMail inbox identifier |
| `AGENT_EMAIL` | cap-email | Optional | Injected by Forge deploy from owner email |
| `GOOGLE_CALENDAR_CLIENT_ID` | cap-calendar | Optional | OAuth2 client ID |
| `GOOGLE_CALENDAR_CLIENT_SECRET` | cap-calendar | Optional | OAuth2 client secret |
| `GOOGLE_CALENDAR_REFRESH_TOKEN` | cap-calendar | Optional | OAuth2 refresh token |
| `INTERNAL_SECRET` | cap-security, agent-core | Yes (for auth) | Shared internal auth secret |
| `X9_INTERNAL_SECRET` | Forge-side only | Optional | Used by Forge X9Client, may appear in credentials |

**Total known keys: 17** (exceeds AGNT-04 requirement of 10+)

### Dynamic Keys (capability-specific, use `Record<string, string>` extension)

These are NOT hardcoded in agent-core but may appear in credentials via Forge vault resolution:

| Key Pattern | Capability | Notes |
|------------|-----------|-------|
| `NETATMO_CLIENT_ID` | cap-netatmo | OAuth2 client ID |
| `NETATMO_CLIENT_SECRET` | cap-netatmo | OAuth2 client secret |
| `NETATMO_EMAIL` | cap-netatmo | Account email |
| `NETATMO_PASSWORD` | cap-netatmo | Account password |
| `NETATMO_HOME_ID` | cap-netatmo | Has default in env schema |
| `NETATMO_GATE_HOME_ID` | cap-netatmo | Has default in env schema |
| Future capability keys | TBD | `.catchall(z.string())` handles these |

## Empty/Missing Field Handling

Based on code analysis:

1. **Empty `credentials` (`{}`):** Possible for a freshly deployed agent with no vault entries. `AgentContextSchema` accepts `z.record(z.string(), z.string())` which allows empty objects. `parseAgentContext` must also accept this.

2. **Missing `displayName`:** The Forge deploy always writes `displayName: params.name`, but `params.name` could theoretically be empty. Current X9 schema requires `z.string().min(1)`. Safe to keep `min(1)` — Forge validates name before deploy.

3. **Missing `telegramBotToken`:** Forge writes `params.telegram_bot_token?.trim() ?? ''`. So the field is always present but can be empty string `''`. Current X9 schema requires `z.string().min(1)` — this means an agent without Telegram bot token would FAIL schema validation. **Edge case to watch.**

4. **`ownerId` as `'0'`:** Forge writes `ownerIdStr = '0'` when `params.ownerId` is falsy. This is a valid string, passes `min(1)`.

## telegramAllowFrom Variations

Based on `deploy.machine.ts` lines 362-376:

- **Normal case:** Array of string chat IDs, e.g. `["123456789", "987654321"]`
- **Legacy wildcard:** `["*"]` — emitted when no `telegram_allow_from` or `telegram_user_id` provided (with console warning FACT-08)
- **Single user:** `["123456789"]` — when only `telegram_user_id` provided

The `context-minimal.json` fixture uses `["*"]` to test the legacy wildcard case.

## Open Question Resolutions (from 02-RESEARCH.md)

- **Q1 (empty credentials):** Yes, possible. `parseAgentContext` must accept `{}` for credentials.
- **Q2 (telegramAllowFrom wildcard):** Yes, `['*']` exists as legacy fallback. Schema must accept `z.array(z.string())` without further constraint.
- **Q3 (missing displayName):** No — Forge always writes it. Safe to require `min(1)`.
- **Q4 (unexpected extra fields):** No unexpected fields found. The 10-field shape from `X9AgentContext` interface is canonical. `.passthrough()` handles any future additions safely.
- **Q5 (credential key inventory):** 17 known keys cataloged above. Netatmo keys are dynamic (capability-specific, not in agent-core).
