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

describe('FIGMA_TOKEN (cap-dev, Figma read access)', () => {
  it('(a) is a known key and an optional string field in the schema', () => {
    const keys: readonly string[] = KNOWN_CREDENTIAL_KEYS;
    expect(keys).toContain('FIGMA_TOKEN');
    expect(Object.keys(AgentCredentialsSchema.shape)).toContain('FIGMA_TOKEN');
    expect(AgentCredentialsSchema.parse({ FIGMA_TOKEN: undefined }).FIGMA_TOKEN).toBeUndefined();
    expect(AgentCredentialsSchema.parse({ FIGMA_TOKEN: 't' }).FIGMA_TOKEN).toBe('t');
    expect(AgentCredentialsSchema.safeParse({ FIGMA_TOKEN: 1 }).success).toBe(false);
  });

  it('(b) is neither an auth gate nor a platform-internal key and is accepted by the Vault', () => {
    const gates: readonly string[] = AUTH_GATE_FIELDS;
    expect(gates).not.toContain('FIGMA_TOKEN');
    expect(isPlatformInternalCredentialKey('FIGMA_TOKEN')).toBe(false);
    expect(CredentialKeySchema.safeParse('FIGMA_TOKEN').success).toBe(true);
  });

  it('(c) has the Figma commercial service, credential kind, secret flag and label', () => {
    expect(getAgentCredentialServiceMetadata('FIGMA_TOKEN')).toMatchObject({
      service: { type: 'commercial', id: 'figma' },
      kind: 'credential',
      secret: true,
      label: 'Token Figma (sola lettura)',
    });
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'figma' }).success).toBe(true);
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'figma-design' }).success).toBe(false);
  });

  it('(d) preserves a saved context without the key', () => {
    const saved = { OPENAI_API_KEY: 'sk-x', BITBUCKET_TOKEN: 'b' };
    expect(AgentCredentialsSchema.parse(saved)).toEqual(saved);
  });

  it('(e) preserves the agent key while the Figma connection secret remains platform-internal', () => {
    expect(stripPlatformInternalCredentials({ FIGMA_TOKEN: 't' })).toEqual({ FIGMA_TOKEN: 't' });
    expect(isPlatformInternalCredentialKey('CONNECT_FIGMA_CLIENT_SECRET')).toBe(true);
  });
});
