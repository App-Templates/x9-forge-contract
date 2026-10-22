/**
 * Agent-scoped vaulted credentials — **alias** of `AgentCredentials` from
 * `@x9-forge/contracts/agent` (Phase 2). This is a documentation-only
 * distinction — one type, two names for consumer intent clarity.
 *
 * Known-key categories (JSDoc-only, no Zod enforcement — per D-21):
 *   - LLM:           OPENAI_API_KEY, ANTHROPIC_API_KEY, GOOGLE_API_KEY, AGENT_CHAT_MODEL
 *   - Telegram:      TELEGRAM_BOT_TOKEN
 *   - Voice/Webhook: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID,
 *                    ELEVENLABS_MINDFULNESS_AGENT_ID, FORGE_VOICE_REGISTER_TOKEN
 *   - Mail:          AGENTMAIL_API_KEY, AGENTMAIL_INBOX_ID, AGENT_EMAIL
 *   - Calendar:      GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET,
 *                    GOOGLE_CALENDAR_REFRESH_TOKEN
 *   - Internal:      INTERNAL_SECRET, X9_INTERNAL_SECRET
 *   - (dynamic):     capability-specific keys via the catchall
 *
 * The 17 known keys + catchall are defined once in `src/agent/agent-credentials.ts`
 * and re-exported here. Do NOT duplicate the schema — refactor the source
 * module instead.
 *
 * @see src/agent/agent-credentials.ts (KNOWN_CREDENTIAL_KEYS, AgentCredentialsSchema)
 */
export { AgentCredentialsSchema as AgentVaultedCredentialsSchema } from "../agent/agent-credentials.js";
export type { AgentCredentials as AgentVaultedCredentials } from "../agent/agent-credentials.js";
//# sourceMappingURL=agent-vaulted-credentials.d.ts.map