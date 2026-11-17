import { describe, it, expect } from 'vitest';
import {
  AUTH_GATE_FIELDS,
  KNOWN_CREDENTIAL_KEYS,
  AgentCredentialsSchema,
} from '../../src/agent/agent-credentials.js';
import {
  AgentCredentialServiceSchema,
  getAgentCredentialServiceMetadata,
} from '../../src/agent/agent-credential-services.js';
import { CredentialKeySchema } from '../../src/vault/credential-key.js';
import {
  isPlatformInternalCredentialKey,
  stripPlatformInternalCredentials,
} from '../../src/vault/platform-internal-credentials.js';

const metaKeys = ['META_GRAPH_TOKEN', 'META_IG_BUSINESS_ID'] as const;

describe('Meta credentials (social-listening, per agent)', () => {
  it('s3607 (a) declares both known keys as optional string fields', () => {
    const keys: readonly string[] = KNOWN_CREDENTIAL_KEYS;
    for (const key of metaKeys) {
      expect(keys).toContain(key);
      expect(Object.keys(AgentCredentialsSchema.shape)).toContain(key);
      expect(AgentCredentialsSchema.parse({ [key]: undefined })[key]).toBeUndefined();
      expect(AgentCredentialsSchema.parse({ [key]: 't' })[key]).toBe('t');
      expect(AgentCredentialsSchema.safeParse({ [key]: 1 }).success).toBe(false);
    }
    expect(AgentCredentialsSchema.parse({})).toEqual({});
  });

  it('(b) accepts both agent keys in the Vault without making them auth gates or platform-internal', () => {
    const gates: readonly string[] = AUTH_GATE_FIELDS;
    for (const key of metaKeys) {
      expect(gates).not.toContain(key);
      expect(isPlatformInternalCredentialKey(key)).toBe(false);
      expect(CredentialKeySchema.safeParse(key).success).toBe(true);
    }
  });

  it('(c) attests the Meta service, labels, kinds and secret flags', () => {
    expect(getAgentCredentialServiceMetadata('META_GRAPH_TOKEN')).toEqual({
      key: 'META_GRAPH_TOKEN',
      service: { type: 'commercial', id: 'meta' },
      kind: 'credential',
      secret: true,
      label: 'Token Meta Graph (lettura Instagram)',
    });
    expect(getAgentCredentialServiceMetadata('META_IG_BUSINESS_ID')).toEqual({
      key: 'META_IG_BUSINESS_ID',
      service: { type: 'commercial', id: 'meta' },
      kind: 'identifier',
      secret: false,
      label: 'Identificativo account Instagram Business',
    });
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'meta' }).success).toBe(true);
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'meta-graph' }).success).toBe(false);
  });

  it('(d) preserves a saved context without Meta keys', () => {
    const saved = { OPENAI_API_KEY: 't', FIGMA_TOKEN: 't' };
    expect(AgentCredentialsSchema.parse(saved)).toEqual(saved);
  });

  it('(e) preserves both Meta agent keys when stripping platform-internal credentials', () => {
    expect(stripPlatformInternalCredentials({ META_GRAPH_TOKEN: 't' })).toEqual({ META_GRAPH_TOKEN: 't' });
    expect(stripPlatformInternalCredentials({ META_IG_BUSINESS_ID: 't' })).toEqual({ META_IG_BUSINESS_ID: 't' });
  });
});
