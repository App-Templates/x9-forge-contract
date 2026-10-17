import { describe, it, expect } from 'vitest';
import {
  AUTH_GATE_FIELDS,
  KNOWN_CREDENTIAL_KEYS,
  AgentCredentialsSchema,
} from '../../src/agent/agent-credentials.js';

import { CredentialKeySchema } from '../../src/vault/credential-key.js';
import { isPlatformInternalCredentialKey } from '../../src/vault/platform-internal-credentials.js';

describe('KNOWN_CREDENTIAL_KEYS', () => {
  it('has at least 16 known keys', () => {
    expect(KNOWN_CREDENTIAL_KEYS.length).toBeGreaterThanOrEqual(16);
  });

  it('includes core credential keys', () => {
    const keys: readonly string[] = KNOWN_CREDENTIAL_KEYS;
    expect(keys).toContain('OPENAI_API_KEY');
    expect(keys).toContain('TELEGRAM_BOT_TOKEN');
    expect(keys).toContain('INTERNAL_SECRET');
    expect(keys).toContain('AGENTMAIL_API_KEY');
    expect(keys).toContain('GOOGLE_CALENDAR_CLIENT_ID');
    expect(keys).toContain('ELEVENLABS_API_KEY');
    expect(keys).toContain('HOSTINGER_API_TOKEN');
    expect(keys).toContain('PAPERCLIP_API_KEY');
  });

  it('Phase 50: includes voice-note provider-lane keys', () => {
    const keys: readonly string[] = KNOWN_CREDENTIAL_KEYS;
    for (const k of ['TTS_PROVIDER', 'OPENAI_TTS_MODEL', 'OPENAI_TTS_VOICE', 'STT_PRIMARY_PROVIDER', 'OPENAI_STT_MODEL',
      'VOICE_CALL_PROVIDER', 'OPENAI_LIVE_VOICE', 'OPENAI_LIVE_BACKEND_MODEL', 'TELNYX_API_KEY', 'TELNYX_CONNECTION_ID', 'TELNYX_FROM_NUMBER', 'TELNYX_PUBLIC_KEY', 'LIVE_WEB_AUTH_TOKEN', 'QDRANT_API_KEY']) {
      expect(keys).toContain(k);
    }
    expect(AgentCredentialsSchema.parse({ TTS_PROVIDER: 'openai' }).TTS_PROVIDER).toBe('openai');
  });
});

describe('AgentCredentialsSchema', () => {
  it('parses full production credentials', () => {
    const result = AgentCredentialsSchema.parse({
      OPENAI_API_KEY: 'sk-test',
      TELEGRAM_BOT_TOKEN: '123:abc',
      INTERNAL_SECRET: 'secret',
      ELEVENLABS_API_KEY: 'el-key',
      AGENTMAIL_API_KEY: 'am-key',
      AGENTMAIL_INBOX_ID: 'inbox-1',
      AGENT_EMAIL: 'agent@test.com',
      GOOGLE_CALENDAR_CLIENT_ID: 'gcal-id',
      GOOGLE_CALENDAR_CLIENT_SECRET: 'gcal-secret',
    });
    expect(result.OPENAI_API_KEY).toBe('sk-test');
    expect(result.TELEGRAM_BOT_TOKEN).toBe('123:abc');
  });

  it('declares and preserves the optional Paperclip agent API key', () => {
    expect(Object.keys(AgentCredentialsSchema.shape)).toContain('PAPERCLIP_API_KEY');
    const field = AgentCredentialsSchema.shape.PAPERCLIP_API_KEY;
    expect(field.safeParse(undefined).success).toBe(true);
    expect(field.safeParse(123).success).toBe(false);
    expect(AgentCredentialsSchema.parse({ PAPERCLIP_API_KEY: 'x' })).toEqual({
      PAPERCLIP_API_KEY: 'x',
    });
    expect(KNOWN_CREDENTIAL_KEYS).not.toContain('PAPERCLIP_RUN_ID');
    expect(Object.keys(AgentCredentialsSchema.shape)).not.toContain('PAPERCLIP_RUN_ID');
  });

  it('accepts empty credentials object', () => {
    const result = AgentCredentialsSchema.parse({});
    expect(result).toEqual({});
  });

  it('accepts dynamic capability-specific keys via catchall', () => {
    const result = AgentCredentialsSchema.parse({
      OPENAI_API_KEY: 'sk-test',
      NETATMO_CLIENT_ID: 'netatmo-id',
      NETATMO_CLIENT_SECRET: 'netatmo-secret',
      CUSTOM_CAPABILITY_KEY: 'custom-value',
    });
    expect(result.OPENAI_API_KEY).toBe('sk-test');
    expect(result['NETATMO_CLIENT_ID']).toBe('netatmo-id');
    expect(result['CUSTOM_CAPABILITY_KEY']).toBe('custom-value');
  });

  it('rejects non-string credential values', () => {
    expect(() =>
      AgentCredentialsSchema.parse({ OPENAI_API_KEY: 123 }),
    ).toThrow();
  });

  it('rejects non-string dynamic key values', () => {
    expect(() =>
      AgentCredentialsSchema.parse({ SOME_DYNAMIC_KEY: true }),
    ).toThrow();
  });
});

describe('Netatmo account credential', () => {
  it('declares the account email as a known key', () => {
    expect(KNOWN_CREDENTIAL_KEYS).toContain('NETATMO_EMAIL');
  });

  it('declares an explicit optional string schema for the account email', () => {
    expect(Object.hasOwn(AgentCredentialsSchema.shape, 'NETATMO_EMAIL')).toBe(true);
    const field = AgentCredentialsSchema.shape['NETATMO_EMAIL' as keyof typeof AgentCredentialsSchema.shape];
    expect(field.isOptional()).toBe(true);
    expect(field.safeParse('synthetic@example.invalid').success).toBe(true);
    expect(field.safeParse(123).success).toBe(false);
  });
});


describe('Phase 55 cap-dev agent credentials', () => {
  it('elenco = campi dello schema', () => {
    expect([...KNOWN_CREDENTIAL_KEYS].sort()).toEqual(Object.keys(AgentCredentialsSchema.shape).sort());
  });

  // Removing a key from either declaration or marking it platform-internal must fail these assertions.
  it.each([
    'GITHUB_TOKEN',
    'GITHUB_APP_ID',
    'GITHUB_APP_INSTALLATION_ID',
    'GITHUB_APP_PRIVATE_KEY',
    'DEV_SIGNING_PRIVATE_KEY',
  ] as const)('declares optional agent-owned credential %s', key => {
    expect(KNOWN_CREDENTIAL_KEYS).toContain(key);
    expect(Object.hasOwn(AgentCredentialsSchema.shape, key)).toBe(true);
    const field = AgentCredentialsSchema.shape[key];
    expect(field.safeParse(undefined).success).toBe(true);
    expect(field.safeParse('synthetic-value').success).toBe(true);
    expect(field.safeParse(123).success).toBe(false);
    expect(isPlatformInternalCredentialKey(key)).toBe(false);
    expect(CredentialKeySchema.safeParse(key).success).toBe(true);
    expect(AUTH_GATE_FIELDS).not.toContain(key);
    expect(AgentCredentialsSchema.parse({ [key]: 'synthetic-value' })).toEqual({ [key]: 'synthetic-value' });
  });
});
