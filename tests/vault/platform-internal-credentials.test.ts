import { describe, it, expect } from 'vitest';
import {
  PLATFORM_INTERNAL_CREDENTIAL_KEYS,
  isPlatformInternalCredentialKey,
  stripPlatformInternalCredentials,
} from '../../src/vault/index.js';
import { CONNECT_VAULT_SECRET_ENV } from '../../src/vault/connection-credential-keys.js';
import { ZodError } from 'zod';
import { KNOWN_CREDENTIAL_KEYS } from '../../src/agent/agent-credentials.js';
import { parseAgentContextFileForWrite } from '../../src/agent/agent-context-file.js';

describe('platform-internal credentials', () => {
  it('lists the Telegram user session (BotFather userbot)', () => {
    expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain('TELEGRAM_SESSION_STRING');
    expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain('APPROVALS_SIGNING_KEY');
  });

  it('recognises the Connessioni Google OAuth client keys and strips them', () => {
    // Mutazione: togliere una delle due chiavi dalla lista fa fallire questo test.
    expect(isPlatformInternalCredentialKey('CONNECT_GOOGLE_CLIENT_ID')).toBe(true);
    expect(isPlatformInternalCredentialKey('CONNECT_GOOGLE_CLIENT_SECRET')).toBe(true);
    expect(isPlatformInternalCredentialKey('CONNECT_GOOGLE_CLIENT_IDX')).toBe(false);
    const out = stripPlatformInternalCredentials({
      OPENAI_API_KEY: 'sk-x',
      CONNECT_GOOGLE_CLIENT_ID: 'id',
      CONNECT_GOOGLE_CLIENT_SECRET: 'secret',
    });
    expect(out).toEqual({ OPENAI_API_KEY: 'sk-x' });
  });

  it('recognises the Connessioni Vault secret, strips it and keeps name and list aligned', () => {
    // Mutazione: togliere la chiave dalla lista fa fallire questo test.
    expect(isPlatformInternalCredentialKey('CONNECT_VAULT_SECRET')).toBe(true);
    expect(stripPlatformInternalCredentials({ OPENAI_API_KEY: 'sk-x', CONNECT_VAULT_SECRET: 's' })).toEqual({
      OPENAI_API_KEY: 'sk-x',
    });
    expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS as readonly string[]).toContain(CONNECT_VAULT_SECRET_ENV);
  });

  it('does not classify inheritable agent credentials as internal', () => {
    expect(isPlatformInternalCredentialKey('TELEGRAM_SESSION_STRING')).toBe(true);
    for (const k of ['OPENAI_API_KEY', 'TELEGRAM_BOT_TOKEN', 'AGENT_EMAIL']) {
      expect(isPlatformInternalCredentialKey(k)).toBe(false);
    }
  });

  it('recognises the cap-ricerca database URL and strips it without changing the input', () => {
    expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain('RICERCA_DATABASE_URL');
    expect(isPlatformInternalCredentialKey('RICERCA_DATABASE_URL')).toBe(true);
    expect(isPlatformInternalCredentialKey('RICERCA_DATABASE_URL_EXTRA')).toBe(false);
    const input = {
      OPENAI_API_KEY: 'test-api-key',
      RICERCA_DATABASE_URL: 'postgresql://localhost:5432/ricerca',
    };
    expect(stripPlatformInternalCredentials(input)).toEqual({ OPENAI_API_KEY: 'test-api-key' });
    expect(input.RICERCA_DATABASE_URL).toBe('postgresql://localhost:5432/ricerca');
  });

  it('s6525 chiave-bacheca-interna: isolates the board token and preserves the agent key', () => {
    expect(isPlatformInternalCredentialKey('PAPERCLIP_API_KEY')).toBe(false);
    expect(KNOWN_CREDENTIAL_KEYS).toContain('PAPERCLIP_API_KEY');
    expect(KNOWN_CREDENTIAL_KEYS).not.toContain('PAPERCLIP_ADMIN_TOKEN');
    expect(isPlatformInternalCredentialKey('PAPERCLIP_ADMIN_TOKEN_FILE')).toBe(false);
    expect(isPlatformInternalCredentialKey('PAPERCLIP_ADMIN_TOKEN_EXTRA')).toBe(false);

    const input = { PAPERCLIP_API_KEY: 'k', PAPERCLIP_ADMIN_TOKEN: 't' };
    expect.soft(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain('PAPERCLIP_ADMIN_TOKEN');
    expect.soft(isPlatformInternalCredentialKey('PAPERCLIP_ADMIN_TOKEN')).toBe(true);
    expect.soft(stripPlatformInternalCredentials(input)).toEqual({ PAPERCLIP_API_KEY: 'k' });
    expect(input).toEqual({ PAPERCLIP_API_KEY: 'k', PAPERCLIP_ADMIN_TOKEN: 't' });

    // Same full context shape as tests/agent/agent-context-file.test.ts, with synthetic values.
    const context = {
      agentId: 'agent-stefano-prod-001',
      ownerId: 'owner_clerk_abc123',
      credentials: {
        OPENAI_API_KEY: 'sk-test',
        TELEGRAM_BOT_TOKEN: '123:abc',
        PAPERCLIP_API_KEY: 'k',
      },
      llmConfig: { provider: 'openai', model: 'gpt-4.1-mini' },
      telegramAllowFrom: ['123456789'],
      workspacePath: '/data/workspaces/agent-stefano-prod-001',
      registryPath: '/data/agents/agent-stefano-prod-001/registry.json',
      telegramBotToken: '123:abc',
      displayName: 'Stefano Prod',
    };
    expect(parseAgentContextFileForWrite(context)).toEqual(context);

    const boardToken = 'synthetic-board-token-for-s6525';
    let error: unknown;
    try {
      parseAgentContextFileForWrite({
        ...context,
        credentials: { ...context.credentials, PAPERCLIP_ADMIN_TOKEN: boardToken },
      });
    } catch (cause) {
      error = cause;
    }
    expect.soft(error).toBeInstanceOf(ZodError);
    expect.soft(error instanceof ZodError ? error.issues.map((issue) => issue.message) : []).toEqual([
      'platform-internal credential "PAPERCLIP_ADMIN_TOKEN" must not be written into an agent context',
    ]);
    expect(String(error)).not.toContain(boardToken);
  });

  it('strips only internal keys and leaves the input untouched', () => {
    const input = { OPENAI_API_KEY: 'sk-x', TELEGRAM_SESSION_STRING: 'session', AGENT_EMAIL: 'a@b.c' };
    const out = stripPlatformInternalCredentials(input);
    expect(out).toEqual({ OPENAI_API_KEY: 'sk-x', AGENT_EMAIL: 'a@b.c' });
    expect(input).toHaveProperty('TELEGRAM_SESSION_STRING');
  });
});
