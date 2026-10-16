import { describe, expect, it } from 'vitest';
// Initialize the existing capability graph before exercising the public HTTP barrel.
import { DevelopmentSessionBindingSchema, DevelopmentSessionConsentSchema, DevelopmentSessionPairingChallengeSchema, DevelopmentSessionLeaseSchema } from '../../../src/capability/connect/index.js';
import { AuthDeviceSignatureSchema, DEVICE_ID_HEADER, DEVICE_TIMESTAMP_HEADER, DEVICE_NONCE_HEADER, DEVICE_SIGNATURE_HEADER } from '../../../src/auth/device-signature.js';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-context.js';
import * as api from '../../../src/http/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const revoked = { sessionId: 'session-1', status: 'revoked', revokedAt: '2026-10-16T10:03:00Z' };
describe('development session HTTP contracts', () => {
  it('startDevelopmentSessionPairingContract method', () => {
    expect(api.startDevelopmentSessionPairingContract.method === 'POST').toBe(true);
  });
  it('startDevelopmentSessionPairingContract path', () => {
    expect(api.startDevelopmentSessionPairingContract.path === '/internal/connect/development-sessions/pairings').toBe(true);
  });
  it('startDevelopmentSessionPairingContract authType', () => {
    expect(api.startDevelopmentSessionPairingContract.authType === 'secret').toBe(true);
  });
  it('startDevelopmentSessionPairingContract bodySchema identity', () => {
    expect(Object.is(api.startDevelopmentSessionPairingContract.bodySchema, DevelopmentSessionBindingSchema)).toBe(true);
  });
  it('startDevelopmentSessionPairingContract responseSchema identity', () => {
    expect(Object.is(api.startDevelopmentSessionPairingContract.responseSchema, DevelopmentSessionPairingChallengeSchema)).toBe(true);
  });
  it('consentDevelopmentSessionContract method', () => {
    expect(api.consentDevelopmentSessionContract.method === 'POST').toBe(true);
  });
  it('consentDevelopmentSessionContract path', () => {
    expect(api.consentDevelopmentSessionContract.path === '/connect/development-sessions/pairings/:pairingId/consent').toBe(true);
  });
  it('consentDevelopmentSessionContract authType', () => {
    expect(api.consentDevelopmentSessionContract.authType === 'device_signature').toBe(true);
  });
  it('consentDevelopmentSessionContract bodySchema identity', () => {
    expect(Object.is(api.consentDevelopmentSessionContract.bodySchema, DevelopmentSessionConsentSchema)).toBe(true);
  });
  it('consentDevelopmentSessionContract responseSchema identity', () => {
    expect(Object.is(api.consentDevelopmentSessionContract.responseSchema, DevelopmentSessionLeaseSchema)).toBe(true);
  });
  it('consentDevelopmentSessionContract headersSchema identity', () => {
    expect(Object.is(api.consentDevelopmentSessionContract.headersSchema, AuthDeviceSignatureSchema)).toBe(true);
  });
  it('consentDevelopmentSessionContract paramsSchema identity', () => {
    expect(Object.is(api.consentDevelopmentSessionContract.paramsSchema, api.DevelopmentSessionPairingParamsSchema)).toBe(true);
  });
  it('getDevelopmentSessionStateContract method', () => {
    expect(api.getDevelopmentSessionStateContract.method === 'GET').toBe(true);
  });
  it('getDevelopmentSessionStateContract path', () => {
    expect(api.getDevelopmentSessionStateContract.path === '/internal/connect/development-sessions/:sessionId/state').toBe(true);
  });
  it('getDevelopmentSessionStateContract authType', () => {
    expect(api.getDevelopmentSessionStateContract.authType === 'secret').toBe(true);
  });
  it('getDevelopmentSessionStateContract responseSchema identity', () => {
    expect(Object.is(api.getDevelopmentSessionStateContract.responseSchema, DevelopmentSessionLeaseSchema)).toBe(true);
  });
  it('getDevelopmentSessionStateContract paramsSchema identity', () => {
    expect(Object.is(api.getDevelopmentSessionStateContract.paramsSchema, api.DevelopmentSessionParamsSchema)).toBe(true);
  });
  it('getDevelopmentSessionStateContract querySchema identity', () => {
    expect(Object.is(api.getDevelopmentSessionStateContract.querySchema, api.DevelopmentSessionStateQuerySchema)).toBe(true);
  });
  it('revokeDevelopmentSessionContract method', () => {
    expect(api.revokeDevelopmentSessionContract.method === 'POST').toBe(true);
  });
  it('revokeDevelopmentSessionContract path', () => {
    expect(api.revokeDevelopmentSessionContract.path === '/internal/connect/development-sessions/:sessionId/revoke').toBe(true);
  });
  it('revokeDevelopmentSessionContract authType', () => {
    expect(api.revokeDevelopmentSessionContract.authType === 'secret').toBe(true);
  });
  it('revokeDevelopmentSessionContract bodySchema identity', () => {
    expect(Object.is(api.revokeDevelopmentSessionContract.bodySchema, CapabilityAgentScopeSchema)).toBe(true);
  });
  it('revokeDevelopmentSessionContract responseSchema identity', () => {
    expect(Object.is(api.revokeDevelopmentSessionContract.responseSchema, api.DevelopmentSessionRevocationSchema)).toBe(true);
  });
  it('revokeDevelopmentSessionContract paramsSchema identity', () => {
    expect(Object.is(api.revokeDevelopmentSessionContract.paramsSchema, api.DevelopmentSessionParamsSchema)).toBe(true);
  });
  it('state query reuses authenticated scope shape', () => {
    expect(Object.is(api.DevelopmentSessionStateQuerySchema.shape.scope, CapabilityAgentScopeSchema)).toBe(true);
  });
  it('publishes all four routes', () => {
    expect(["startDevelopmentSessionPairingContract", "consentDevelopmentSessionContract", "getDevelopmentSessionStateContract", "revokeDevelopmentSessionContract"].every((name) => Object.hasOwn(api, name))).toBe(true);
  });
  it('DevelopmentSessionPairingParamsSchema rejects empty id', () => {
    expect(!api.DevelopmentSessionPairingParamsSchema.safeParse({ pairingId: '' }).success).toBe(true);
  });
  it('DevelopmentSessionPairingParamsSchema rejects extra fields', () => {
    expect(!api.DevelopmentSessionPairingParamsSchema.safeParse({ pairingId: 'id-1', extra: true }).success).toBe(true);
  });
  it('DevelopmentSessionPairingParamsSchema rejects missing or nonstring id', () => {
    expect([{}, { pairingId: 42 }].every((value) => !api.DevelopmentSessionPairingParamsSchema.safeParse(value).success)).toBe(true);
  });
  it('DevelopmentSessionParamsSchema rejects empty id', () => {
    expect(!api.DevelopmentSessionParamsSchema.safeParse({ sessionId: '' }).success).toBe(true);
  });
  it('DevelopmentSessionParamsSchema rejects extra fields', () => {
    expect(!api.DevelopmentSessionParamsSchema.safeParse({ sessionId: 'id-1', extra: true }).success).toBe(true);
  });
  it('DevelopmentSessionParamsSchema rejects missing or nonstring id', () => {
    expect([{}, { sessionId: 42 }].every((value) => !api.DevelopmentSessionParamsSchema.safeParse(value).success)).toBe(true);
  });
  it('state query rejects extra fields', () => {
    expect(!api.DevelopmentSessionStateQuerySchema.safeParse({ scope, extra: true }).success).toBe(true);
  });
  it('state query requires scope', () => {
    expect(!api.DevelopmentSessionStateQuerySchema.safeParse({}).success).toBe(true);
  });
  it('revocation rejects empty session', () => {
    expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, sessionId: '' }).success).toBe(true);
  });
  it('revocation rejects connected', () => {
    expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, status: 'connected' }).success).toBe(true);
  });
  it('revocation requires ISO timestamp', () => {
    expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, revokedAt: 'yesterday' }).success).toBe(true);
  });
  it('revocation rejects extra fields', () => {
    expect(!api.DevelopmentSessionRevocationSchema.safeParse({ ...revoked, extra: true }).success).toBe(true);
  });

  it('accepts the complete local and cloud lifecycle', () => {
    for (const target of [{ kind: 'local', deviceId: 'device-1' }, { kind: 'cloud', connectionRef: 'registered-adapter-1' }]) {
      for (const engines of [['claude'], ['codex'], ['claude', 'codex']]) {
        const binding = { scope, sessionId: 'session-1', target, engines };
        const challenge = { binding, pairingId: 'pairing-1', nonce: 'n'.repeat(22), issuedAt: '2026-10-16T10:00:00Z', expiresAt: '2026-10-16T10:02:00Z' };
        const consent = { challenge, consentedAt: '2026-10-16T10:01:00Z' };
        const lease = { binding, leaseId: 'lease-1', consentRef: 'consent-1', status: 'connected', issuedAt: challenge.issuedAt, lastSeenAt: consent.consentedAt, expiresAt: challenge.expiresAt, availableEngines: engines };
        expect(api.startDevelopmentSessionPairingContract.bodySchema.safeParse(binding).success).toBe(true);
        expect(api.startDevelopmentSessionPairingContract.responseSchema.safeParse(challenge).success).toBe(true);
        expect(api.consentDevelopmentSessionContract.paramsSchema.safeParse({ pairingId: challenge.pairingId }).success).toBe(true);
        expect(api.consentDevelopmentSessionContract.bodySchema.safeParse(consent).success).toBe(true);
        expect(api.consentDevelopmentSessionContract.responseSchema.safeParse(lease).success).toBe(true);
        expect(api.getDevelopmentSessionStateContract.paramsSchema.safeParse({ sessionId: binding.sessionId }).success).toBe(true);
        expect(api.getDevelopmentSessionStateContract.querySchema.safeParse({ scope }).success).toBe(true);
        for (const status of ['connected', 'offline', 'revoked']) {
          expect(api.getDevelopmentSessionStateContract.responseSchema.safeParse({ ...lease, status }).success).toBe(true);
        }
        expect(api.revokeDevelopmentSessionContract.paramsSchema.safeParse({ sessionId: binding.sessionId }).success).toBe(true);
        expect(api.revokeDevelopmentSessionContract.bodySchema.safeParse(scope).success).toBe(true);
        expect(api.revokeDevelopmentSessionContract.responseSchema.safeParse(revoked).success).toBe(true);
        for (const key of ['token', 'accessToken', 'refreshToken', 'platformSecret', 'callbackUrl', 'credentials', 'extra']) {
          const injected = { [key]: 'synthetic-rejected-value' };
          for (const [schema, payload] of [[api.startDevelopmentSessionPairingContract.bodySchema, binding], [api.startDevelopmentSessionPairingContract.responseSchema, challenge], [api.consentDevelopmentSessionContract.bodySchema, consent], [api.consentDevelopmentSessionContract.responseSchema, lease], [api.getDevelopmentSessionStateContract.responseSchema, lease], [api.revokeDevelopmentSessionContract.bodySchema, scope], [api.revokeDevelopmentSessionContract.responseSchema, revoked]] as const) {
            expect(schema.safeParse({ ...payload, ...injected }).success).toBe(false);
            expect(schema.safeParse({}).success).toBe(false);
          }
          expect(api.startDevelopmentSessionPairingContract.bodySchema.safeParse({ ...binding, target: { ...target, ...injected } }).success).toBe(false);
        }
      }
    }
    const headers = { [DEVICE_ID_HEADER]: 'device-1', [DEVICE_TIMESTAMP_HEADER]: '2026-10-16T10:01:00Z', [DEVICE_NONCE_HEADER]: 'n'.repeat(22), [DEVICE_SIGNATURE_HEADER]: 's'.repeat(86) };
    expect(api.consentDevelopmentSessionContract.headersSchema.safeParse(headers).success).toBe(true);
    for (const key of Object.keys(headers)) {
      expect(api.consentDevelopmentSessionContract.headersSchema.safeParse({ ...headers, [key]: '' }).success).toBe(false);
    }
    for (const key of ['tenantId', 'ownerId', 'agentId']) {
      for (const value of [{ ...scope, [key]: '' }, { ...scope, extra: true }]) {
        expect(api.getDevelopmentSessionStateContract.querySchema.safeParse({ scope: value }).success).toBe(false);
        expect(api.revokeDevelopmentSessionContract.bodySchema.safeParse(value).success).toBe(false);
      }
    }
  });
});
