import { describe, expect, it } from 'vitest';
import {
  AGENT_CREDENTIAL_PORT_KEYS,
  AGENT_CREDENTIAL_VAULT_SECRET_ENV,
  AgentCredentialPortParamsSchema,
  PutAgentCredentialBodySchema,
  PutAgentCredentialResponseSchema,
  putAgentCredentialContract,
} from '../src/http/endpoints/internal-vault-agent-credentials.js';
import { KNOWN_CREDENTIAL_KEYS } from '../src/agent/agent-credentials.js';
import { INTERNAL_SECRET_HEADER } from '../src/auth/auth-headers.js';
import { isPlatformInternalCredentialKey } from '../src/vault/platform-internal-credentials.js';

describe('putAgentCredentialContract', () => {
  it('has exact method, path, header and secret', () => {
    expect(putAgentCredentialContract.method).toBe('PUT');
    expect(putAgentCredentialContract.path).toBe('/internal/vault/agents/:agentId/credentials/:key');
    expect(putAgentCredentialContract.authType).toBe('secret');
    expect(putAgentCredentialContract.authHeader).toBe(INTERNAL_SECRET_HEADER);
    expect(putAgentCredentialContract.secretEnv).toBe('AGENT_CREDENTIAL_VAULT_SECRET');
    expect(AGENT_CREDENTIAL_VAULT_SECRET_ENV).toBe('AGENT_CREDENTIAL_VAULT_SECRET');
  });

  it('accepts only known credential keys, and only PAPERCLIP_API_KEY', () => {
    expect(AGENT_CREDENTIAL_PORT_KEYS).toEqual(['PAPERCLIP_API_KEY']);
    for (const key of AGENT_CREDENTIAL_PORT_KEYS) {
      expect(KNOWN_CREDENTIAL_KEYS as readonly string[]).toContain(key);
    }
  });

  it('accepts valid params, body and response', () => {
    expect(AgentCredentialPortParamsSchema.safeParse({ agentId: '12', key: 'PAPERCLIP_API_KEY' }).success).toBe(true);
    expect(PutAgentCredentialBodySchema.safeParse({ value: 'pc-secret' }).success).toBe(true);
    expect(PutAgentCredentialResponseSchema.safeParse({ ok: true, key: 'PAPERCLIP_API_KEY', tier: 'agent' }).success).toBe(true);
  });

  it('rejects a key outside the closed list', () => {
    expect(AgentCredentialPortParamsSchema.safeParse({ agentId: '12', key: 'OPENAI_API_KEY' }).success).toBe(false);
  });

  it('rejects agentId 0', () => {
    expect(AgentCredentialPortParamsSchema.safeParse({ agentId: '0', key: 'PAPERCLIP_API_KEY' }).success).toBe(false);
  });

  it('rejects a response carrying the value', () => {
    expect(
      PutAgentCredentialResponseSchema.safeParse({ ok: true, key: 'PAPERCLIP_API_KEY', tier: 'agent', value: 'x' }).success,
    ).toBe(false);
  });

  it('rejects a body with an extra field and an empty value', () => {
    expect(PutAgentCredentialBodySchema.safeParse({ value: 'x', extra: 1 }).success).toBe(false);
    expect(PutAgentCredentialBodySchema.safeParse({ value: '' }).success).toBe(false);
  });

  it('rejects tier tenant in the response', () => {
    expect(PutAgentCredentialResponseSchema.safeParse({ ok: true, key: 'PAPERCLIP_API_KEY', tier: 'tenant' }).success).toBe(false);
  });

  it('marks the dedicated secret as platform-internal', () => {
    expect(isPlatformInternalCredentialKey('AGENT_CREDENTIAL_VAULT_SECRET')).toBe(true);
  });
});
