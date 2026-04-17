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
