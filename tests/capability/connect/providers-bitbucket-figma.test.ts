import { describe, expect, it } from 'vitest';
import {
  CONNECT_INVITE_LIMITS,
  CONNECT_LINK_LIMITS,
  CONNECT_PROVIDER_SCOPES,
  ConnectProviderSchema,
  ConnectScopeSchema,
  ConnectStartRequestSchema,
  ConnectStateResponseSchema,
  ConnectToolPermitSchema,
} from '../../../src/capability/index.js';
import {
  PLATFORM_INTERNAL_CREDENTIAL_KEYS,
  isPlatformInternalCredentialKey,
  stripPlatformInternalCredentials,
} from '../../../src/vault/platform-internal-credentials.js';
import {
  connectionCredentialKey,
  isConnectionCredentialKey,
} from '../../../src/vault/connection-credential-keys.js';

const start = { agentId: 'a1', personRef: 'p1', conversationId: 'c1' };

describe('Bitbucket and Figma connection providers', () => {
  // Mutation: removing bitbucket from the provider enum fails (a) and the valid request in (c).
  it('(a) exposes Google, Bitbucket and Figma in order', () => {
    expect(ConnectProviderSchema.options).toEqual(['google', 'bitbucket', 'figma']);
  });

  it('(b) supports code and design reading without write permissions', () => {
    for (const scope of ['code_read', 'design_read']) {
      expect(ConnectScopeSchema.safeParse(scope).success).toBe(true);
    }
    for (const scope of ['mail_write', 'drive_write', 'repo_write']) {
      expect(ConnectScopeSchema.safeParse(scope).success).toBe(false);
    }
    expect(CONNECT_PROVIDER_SCOPES).toEqual({
      google: ['calendar_events', 'contacts_read', 'mail_send', 'mail_draft', 'mail_read', 'drive_read'],
      bitbucket: ['code_read'],
      figma: ['design_read'],
    });
  });

  // Mutation: removing superRefine accepts Google's code_read request and fails (c).
  it('(c) accepts only scopes belonging to the requested provider and rejects extra fields', () => {
    for (const request of [
      { provider: 'bitbucket', scopes: ['code_read'] },
      { provider: 'figma', scopes: ['design_read'] },
      { provider: 'google', scopes: ['calendar_events'] },
      { provider: 'google', scopes: ['calendar_events', 'contacts_read', 'mail_send', 'mail_draft', 'mail_read', 'drive_read'] },
    ]) {
      expect(ConnectStartRequestSchema.parse({ ...start, ...request })).toEqual({ ...start, ...request });
    }
    for (const request of [
      { provider: 'google', scopes: ['code_read'] },
      { provider: 'bitbucket', scopes: ['drive_read'] },
      { provider: 'figma', scopes: ['code_read', 'design_read'] },
    ]) {
      const result = ConnectStartRequestSchema.safeParse({ ...start, ...request });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ['scopes'] }));
      }
    }
    expect(ConnectStartRequestSchema.safeParse({
      ...start, provider: 'bitbucket', scopes: ['code_read'], extra: true,
    }).success).toBe(false);
  });

  it('(d) preserves the personRef object shape for Vault consumers', () => {
    expect(ConnectStartRequestSchema.shape.personRef).toBeDefined();
    expect(ConnectStartRequestSchema.shape.personRef.parse('p1')).toBe('p1');
    expect(ConnectStartRequestSchema.shape.personRef.safeParse('').success).toBe(false);
  });

  it('(e) recognises the Bitbucket connection credential key', () => {
    expect(connectionCredentialKey('bitbucket')).toBe('CONNECTION_BITBUCKET');
    expect(isConnectionCredentialKey(connectionCredentialKey('bitbucket'))).toBe(true);
  });

  it('(f) exposes a seven-day invite without changing the one-time link limits', () => {
    expect(CONNECT_INVITE_LIMITS).toEqual({ ttlSeconds: 604800 });
    expect(CONNECT_LINK_LIMITS).toEqual({ ttlSeconds: 600, stateBytes: 32 });
  });

  it('(g) keeps both OAuth clients internal and strips all four keys', () => {
    const internalKeys = [
      'CONNECT_BITBUCKET_CLIENT_ID', 'CONNECT_BITBUCKET_CLIENT_SECRET',
      'CONNECT_FIGMA_CLIENT_ID', 'CONNECT_FIGMA_CLIENT_SECRET',
    ];
    const input: Record<string, string> = { AGENT_EMAIL: 'agent@example.test' };
    for (const key of internalKeys) {
      expect(PLATFORM_INTERNAL_CREDENTIAL_KEYS).toContain(key);
      expect(isPlatformInternalCredentialKey(key)).toBe(true);
      input[key] = 'test-placeholder';
    }
    expect(stripPlatformInternalCredentials(input)).toEqual({ AGENT_EMAIL: 'agent@example.test' });
    for (const key of internalKeys) {
      expect(input[key]).toBe('test-placeholder');
    }
  });

  it('(h) rereads Google state and tool permits saved with 1.86.0 unchanged', () => {
    const state = {
      agentId: 'a1', provider: 'google', status: 'connected', accountLabel: 'x@y.it',
      scopes: ['mail_send'], connectedAt: 1760000000,
    };
    const permit = {
      agentId: 'a1', provider: 'google', scopes: ['calendar_events'],
      issuedAt: 1760000000, expiresAt: 1760003600,
    };
    expect(ConnectStateResponseSchema.parse(state)).toEqual(state);
    expect(ConnectToolPermitSchema.parse(permit)).toEqual(permit);
  });
});
