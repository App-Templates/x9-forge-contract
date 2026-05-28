import { z } from 'zod';
/**
 * Known credential keys used across agent capabilities.
 * Provides IDE autocomplete while allowing dynamic capability-specific keys
 * via the Record<string, string> extension (catchall).
 */
export declare const KNOWN_CREDENTIAL_KEYS: readonly ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_API_KEY", "AGENT_CHAT_MODEL", "TELEGRAM_BOT_TOKEN", "ELEVENLABS_API_KEY", "ELEVENLABS_VOICE_ID", "ELEVENLABS_MODEL_ID", "ELEVENLABS_MINDFULNESS_AGENT_ID", "FORGE_VOICE_REGISTER_TOKEN", "AGENTMAIL_API_KEY", "AGENTMAIL_INBOX_ID", "AGENT_EMAIL", "GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REFRESH_TOKEN", "INTERNAL_SECRET", "X9_INTERNAL_SECRET"];
export type KnownCredentialKey = (typeof KNOWN_CREDENTIAL_KEYS)[number];
/**
 * Agent credentials schema.
 * Known keys are optional strings (IDE autocomplete).
 * Unknown keys pass through via catchall (capability-specific dynamic keys).
 */
export declare const AgentCredentialsSchema: z.ZodObject<{
    OPENAI_API_KEY: z.ZodOptional<z.ZodString>;
    ANTHROPIC_API_KEY: z.ZodOptional<z.ZodString>;
    GOOGLE_API_KEY: z.ZodOptional<z.ZodString>;
    AGENT_CHAT_MODEL: z.ZodOptional<z.ZodString>;
    TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
    ELEVENLABS_API_KEY: z.ZodOptional<z.ZodString>;
    ELEVENLABS_VOICE_ID: z.ZodOptional<z.ZodString>;
    ELEVENLABS_MODEL_ID: z.ZodOptional<z.ZodString>;
    ELEVENLABS_MINDFULNESS_AGENT_ID: z.ZodOptional<z.ZodString>;
    FORGE_VOICE_REGISTER_TOKEN: z.ZodOptional<z.ZodString>;
    AGENTMAIL_API_KEY: z.ZodOptional<z.ZodString>;
    AGENTMAIL_INBOX_ID: z.ZodOptional<z.ZodString>;
    AGENT_EMAIL: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_CLIENT_ID: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_CLIENT_SECRET: z.ZodOptional<z.ZodString>;
    GOOGLE_CALENDAR_REFRESH_TOKEN: z.ZodOptional<z.ZodString>;
    INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
    X9_INTERNAL_SECRET: z.ZodOptional<z.ZodString>;
}, z.core.$catchall<z.ZodString>>;
export type AgentCredentials = z.infer<typeof AgentCredentialsSchema>;
/**
 * Subset of KNOWN_CREDENTIAL_KEYS that MUST be fail-fast (`:?`) in
 * compose environment blocks. Empty-fallback patterns silently drop
 * auth on deploy (Bug E class, 2026-04-23 CAP_VOICE_INTERNAL_TOKEN).
 *
 * Does NOT include ELEVENLABS_WEBHOOK_SECRET — that is service-local
 * HMAC validator (cap-voice @bridge-optout), not cross-repo.
 *
 * Consumed by agent-x9 scripts/validate-credentials-compose.ts (CONTRACT-06).
 *
 * Added 2026-04-24 Option δ Front P2 — Auditor B FINDING-B-04.
 */
export declare const AUTH_GATE_FIELDS: readonly ["INTERNAL_SECRET", "INTERNAL_TOKEN", "FORGE_VOICE_REGISTER_TOKEN", "X9_INTERNAL_SECRET"];
export type AuthGateField = (typeof AUTH_GATE_FIELDS)[number];
//# sourceMappingURL=agent-credentials.d.ts.map