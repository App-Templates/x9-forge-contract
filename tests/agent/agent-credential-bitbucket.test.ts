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

describe('BITBUCKET_TOKEN (cap-dev, lettura Bitbucket)', () => {
  it('(a) è una chiave nota e un campo facoltativo dello schema', () => {
    const keys: readonly string[] = KNOWN_CREDENTIAL_KEYS;
    expect(keys).toContain('BITBUCKET_TOKEN');
    expect(Object.keys(AgentCredentialsSchema.shape)).toContain('BITBUCKET_TOKEN');
    expect(AgentCredentialsSchema.parse({ BITBUCKET_TOKEN: undefined }).BITBUCKET_TOKEN).toBeUndefined();
    expect(AgentCredentialsSchema.parse({ BITBUCKET_TOKEN: 't' }).BITBUCKET_TOKEN).toBe('t');
    expect(AgentCredentialsSchema.safeParse({ BITBUCKET_TOKEN: 1 }).success).toBe(false);
  });

  it('(b) non è un cancello di accesso né una chiave interna di piattaforma, e il Vault la accetta', () => {
    const gates: readonly string[] = AUTH_GATE_FIELDS;
    expect(gates).not.toContain('BITBUCKET_TOKEN');
    expect(isPlatformInternalCredentialKey('BITBUCKET_TOKEN')).toBe(false);
    expect(CredentialKeySchema.safeParse('BITBUCKET_TOKEN').success).toBe(true);
  });

  it('(c) ha servizio «bitbucket», tipo credential, segreta, con etichetta', () => {
    expect(getAgentCredentialServiceMetadata('BITBUCKET_TOKEN')).toMatchObject({
      service: { type: 'commercial', id: 'bitbucket' },
      kind: 'credential',
      secret: true,
      label: 'Token Bitbucket (sola lettura)',
    });
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'bitbucket' }).success).toBe(true);
    expect(AgentCredentialServiceSchema.safeParse({ type: 'commercial', id: 'bitbucket-cloud' }).success).toBe(false);
  });

  it('(d) un contesto salvato senza la chiave si legge invariato', () => {
    const saved = { OPENAI_API_KEY: 'sk-x' };
    expect(AgentCredentialsSchema.parse(saved)).toEqual(saved);
  });

  it('(e) la pulizia delle chiavi interne la conserva', () => {
    expect(stripPlatformInternalCredentials({ BITBUCKET_TOKEN: 't' })).toEqual({ BITBUCKET_TOKEN: 't' });
  });
});
