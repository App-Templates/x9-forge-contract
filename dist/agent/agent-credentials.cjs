"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTH_GATE_FIELDS = exports.AgentCredentialsSchema = exports.KNOWN_CREDENTIAL_KEYS = void 0;
const zod_1 = require("zod");
/**
 * Known credential keys used across agent capabilities.
 * Provides IDE autocomplete while allowing dynamic capability-specific keys
 * via the Record<string, string> extension (catchall).
 */
exports.KNOWN_CREDENTIAL_KEYS = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'GOOGLE_API_KEY',
    'AGENT_CHAT_MODEL',
    'TELEGRAM_BOT_TOKEN',
    'ELEVENLABS_API_KEY',
    'ELEVENLABS_VOICE_ID',
    'ELEVENLABS_MODEL_ID', // NEW — Phase 39 REQ-39-01
    'ELEVENLABS_MINDFULNESS_AGENT_ID',
    'FORGE_VOICE_REGISTER_TOKEN',
    'AGENTMAIL_API_KEY',
    'AGENTMAIL_INBOX_ID',
    'AGENT_EMAIL',
    'GOOGLE_CALENDAR_CLIENT_ID',
    'GOOGLE_CALENDAR_CLIENT_SECRET',
    'GOOGLE_CALENDAR_REFRESH_TOKEN',
    'INTERNAL_SECRET',
    'X9_INTERNAL_SECRET',
];
/**
 * Agent credentials schema.
 * Known keys are optional strings (IDE autocomplete).
 * Unknown keys pass through via catchall (capability-specific dynamic keys).
 */
exports.AgentCredentialsSchema = zod_1.z
    .object({
    OPENAI_API_KEY: zod_1.z.string().optional(),
    ANTHROPIC_API_KEY: zod_1.z.string().optional(),
    GOOGLE_API_KEY: zod_1.z.string().optional(),
    AGENT_CHAT_MODEL: zod_1.z.string().optional(),
    TELEGRAM_BOT_TOKEN: zod_1.z.string().optional(),
    ELEVENLABS_API_KEY: zod_1.z.string().optional(),
    ELEVENLABS_VOICE_ID: zod_1.z.string().optional(),
    ELEVENLABS_MODEL_ID: zod_1.z.string().optional(), // NEW — Phase 39 REQ-39-01
    ELEVENLABS_MINDFULNESS_AGENT_ID: zod_1.z.string().optional(),
    FORGE_VOICE_REGISTER_TOKEN: zod_1.z.string().optional(),
    AGENTMAIL_API_KEY: zod_1.z.string().optional(),
    AGENTMAIL_INBOX_ID: zod_1.z.string().optional(),
    AGENT_EMAIL: zod_1.z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_ID: zod_1.z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_SECRET: zod_1.z.string().optional(),
    GOOGLE_CALENDAR_REFRESH_TOKEN: zod_1.z.string().optional(),
    INTERNAL_SECRET: zod_1.z.string().optional(),
    X9_INTERNAL_SECRET: zod_1.z.string().optional(),
})
    .catchall(zod_1.z.string());
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
exports.AUTH_GATE_FIELDS = [
    'INTERNAL_SECRET',
    'INTERNAL_TOKEN',
    'FORGE_VOICE_REGISTER_TOKEN',
    'X9_INTERNAL_SECRET',
    // ELEVENLABS_WEBHOOK_SECRET intentionally excluded — service-local
    // HMAC validator, declared @bridge-optout in cap-voice env.ts.
];
//# sourceMappingURL=agent-credentials.js.map