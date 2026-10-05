import { describe, it, expect } from 'vitest';
import {
  PLATFORM_INTERNAL_CREDENTIAL_KEYS,
  isPlatformInternalCredentialKey,
  stripPlatformInternalCredentials,
} from '../../src/vault/index.js';

describe('platform-internal credentials', () => {
  it('lists the Telegram user session (BotFather userbot)', () => {
    expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain('TELEGRAM_SESSION_STRING');
  });

  it('does not classify inheritable agent credentials as internal', () => {
    expect(isPlatformInternalCredentialKey('TELEGRAM_SESSION_STRING')).toBe(true);
    for (const k of ['OPENAI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'AGENT_EMAIL']) {
      expect(isPlatformInternalCredentialKey(k)).toBe(false);
    }
  });

  it('strips only internal keys and leaves the input untouched', () => {
    const input = { OPENAI_API_KEY: 'sk-x', TELEGRAM_SESSION_STRING: 'session', AGENT_EMAIL: 'a@b.c' };
    const out = stripPlatformInternalCredentials(input);
    expect(out).toEqual({ OPENAI_API_KEY: 'sk-x', AGENT_EMAIL: 'a@b.c' });
    expect(input).toHaveProperty('TELEGRAM_SESSION_STRING');
  });
});
