import { describe, expect, it } from 'vitest';
import { internalAgentCreationByEmailContract as contract } from '../../src/http/endpoints/index.js';

const attestation = {
  tenantId: 't1', actorId: 'actor-1', channel: 'telegram', issuer: 'forge',
  issuedAt: '2026-10-15T10:00:00.000Z', expiresAt: '2026-10-15T10:05:00.000Z', nonce: 'n-1',
};
const request = {
  idempotencyKey: 'create-by-email-1',
  recipientEmail: 'persona@example.com',
  draft: { name: 'Assistente', objective: 'Gestire la posta', allowedCapabilities: ['email'] },
  authorization: { tenantId: 't1', actorId: 'actor-1', decision: 'granted', attestation },
};

describe('internalAgentCreationByEmailContract', () => {
  it('declares method, path and auth', () => {
    expect(contract.method).toBe('POST');
    expect(contract.path).toBe('/internal/agents/create-by-email');
    expect(contract.authType).toBe('secret');
  });
  it('accepts a valid request', () => {
    expect(contract.bodySchema.safeParse(request).success).toBe(true);
  });
  it('rejects a body that imposes an ownerId', () => {
    expect(contract.bodySchema.safeParse({ ...request, ownerId: 'o-1' }).success).toBe(false);
  });
  it('validates the response', () => {
    expect(contract.responseSchema.safeParse({ status: 'pending', replayed: false }).success).toBe(true);
    expect(contract.responseSchema.safeParse({ status: 'created', replayed: false }).success).toBe(false);
  });
});
