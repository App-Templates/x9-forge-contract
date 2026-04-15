import { describe, it, expect } from 'vitest';
import {
  KNOWN_CREDENTIAL_KEYS,
  AgentCredentialsSchema,
  type KnownCredentialKey,
} from '../../src/agent/agent-credentials.js';

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
