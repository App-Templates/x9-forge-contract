import { z } from 'zod';

/**
 * Known credential keys used across agent capabilities.
 * Provides IDE autocomplete while allowing dynamic capability-specific keys
 * via the Record<string, string> extension (catchall).
 */
export const KNOWN_CREDENTIAL_KEYS = [
  'OPENAI_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_API_KEY',
  'AGENT_CHAT_MODEL',
  'TELEGRAM_BOT_TOKEN',
  'ELEVENLABS_API_KEY',
  'ELEVENLABS_VOICE_ID',
  'ELEVENLABS_MODEL_ID',                     // NEW — Phase 39 REQ-39-01
  'TTS_PROVIDER',                            // Phase 50 — voice-note TTS lane (elevenlabs | openai)
  'OPENAI_TTS_MODEL',                        // Phase 50 — default gpt-4o-mini-tts
  'OPENAI_TTS_VOICE',                        // Phase 50 — default marin
  'STT_PRIMARY_PROVIDER',                    // Phase 50 — voice-note STT primary (elevenlabs | openai)
  'OPENAI_STT_MODEL',                        // Phase 50 — default gpt-transcribe
  'VOICE_CALL_PROVIDER',                     // Phase 50 — call lane (elevenlabs | openai_live)
  'OPENAI_LIVE_VOICE',                       // Phase 50 — GPT-Live stock voice (default marin)
  'OPENAI_LIVE_BACKEND_MODEL',               // Phase 50 — delegation.responses model
  'TELNYX_API_KEY',                          // Phase 50 — cap-voice-live PSTN originator
  'TELNYX_CONNECTION_ID',                    // Phase 50 — Telnyx Call Control app id
  'TELNYX_FROM_NUMBER',                      // Phase 50 — E.164 caller id
  'TELNYX_PUBLIC_KEY',                       // Phase 50 — Ed25519 webhook verification key
  'LIVE_WEB_AUTH_TOKEN',                     // Phase 50-06 — bearer for the browser live-voice ingress
  'QDRANT_API_KEY',                          // Security 2026-09-12 — X9 Qdrant API key (memory-svc, cap-rag; Forge factory reads Qdrant too)
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
] as const;

export type KnownCredentialKey = (typeof KNOWN_CREDENTIAL_KEYS)[number];

/**
 * Agent credentials schema.
 * Known keys are optional strings (IDE autocomplete).
 * Unknown keys pass through via catchall (capability-specific dynamic keys).
 */
export const AgentCredentialsSchema = z
  .object({
    OPENAI_API_KEY: z.string().optional(),
    ANTHROPIC_API_KEY: z.string().optional(),
    GOOGLE_API_KEY: z.string().optional(),
    AGENT_CHAT_MODEL: z.string().optional(),
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    ELEVENLABS_API_KEY: z.string().optional(),
    ELEVENLABS_VOICE_ID: z.string().optional(),
    ELEVENLABS_MODEL_ID: z.string().optional(),     // NEW — Phase 39 REQ-39-01
    TTS_PROVIDER: z.string().optional(),            // Phase 50 — validated against TtsProviderSchema by the consumer
    OPENAI_TTS_MODEL: z.string().optional(),        // Phase 50
    OPENAI_TTS_VOICE: z.string().optional(),        // Phase 50
    STT_PRIMARY_PROVIDER: z.string().optional(),    // Phase 50 — validated against TranscribeProviderSchema by the consumer
    OPENAI_STT_MODEL: z.string().optional(),        // Phase 50
    VOICE_CALL_PROVIDER: z.string().optional(),     // Phase 50 — validated against VoiceProviderSchema by the consumer
    OPENAI_LIVE_VOICE: z.string().optional(),       // Phase 50
    OPENAI_LIVE_BACKEND_MODEL: z.string().optional(), // Phase 50
    TELNYX_API_KEY: z.string().optional(),          // Phase 50
    TELNYX_CONNECTION_ID: z.string().optional(),    // Phase 50
    TELNYX_FROM_NUMBER: z.string().optional(),      // Phase 50
    TELNYX_PUBLIC_KEY: z.string().optional(),       // Phase 50
    LIVE_WEB_AUTH_TOKEN: z.string().optional(),     // Phase 50-06
    QDRANT_API_KEY: z.string().optional(),          // Security 2026-09-12
    ELEVENLABS_MINDFULNESS_AGENT_ID: z.string().optional(),
    FORGE_VOICE_REGISTER_TOKEN: z.string().optional(),
    AGENTMAIL_API_KEY: z.string().optional(),
    AGENTMAIL_INBOX_ID: z.string().optional(),
    AGENT_EMAIL: z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_ID: z.string().optional(),
    GOOGLE_CALENDAR_CLIENT_SECRET: z.string().optional(),
    GOOGLE_CALENDAR_REFRESH_TOKEN: z.string().optional(),
    INTERNAL_SECRET: z.string().optional(),
    X9_INTERNAL_SECRET: z.string().optional(),
  })
  .catchall(z.string());

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
export const AUTH_GATE_FIELDS = [
  'INTERNAL_SECRET',
  'INTERNAL_TOKEN',
  'FORGE_VOICE_REGISTER_TOKEN',
  'X9_INTERNAL_SECRET',
  // ELEVENLABS_WEBHOOK_SECRET intentionally excluded — service-local
  // HMAC validator, declared @bridge-optout in cap-voice env.ts.
] as const;
export type AuthGateField = (typeof AUTH_GATE_FIELDS)[number];
