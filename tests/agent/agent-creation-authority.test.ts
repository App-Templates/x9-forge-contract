import { describe, expect, it } from 'vitest';
import {
  CreationActorAttestationSchema, PlatformOwnerAuthorizationSchema, isCreationAuthorityCurrent,
} from '../../src/agent/index.js';

const attestation = {
  tenantId: 't1', actorId: 'actor-1', channel: 'telegram', issuer: 'forge',
  issuedAt: '2026-10-15T10:00:00.000Z', expiresAt: '2026-10-15T10:05:00.000Z', nonce: 'n-1',
};
const auth = { tenantId: 't1', actorId: 'actor-1', decision: 'granted', attestation };
const at = (iso: string) => Date.parse(iso);

describe('creation authority', () => {
  it('accepts a valid attestation and authorization', () => {
    expect(CreationActorAttestationSchema.safeParse(attestation).success).toBe(true);
    expect(PlatformOwnerAuthorizationSchema.safeParse(auth).success).toBe(true);
    expect(isCreationAuthorityCurrent(attestation, at('2026-10-15T10:02:00.000Z'))).toBe(true);
  });
  it('rejects expired and not-yet-valid attestations', () => {
    expect(isCreationAuthorityCurrent(attestation, at('2026-10-15T10:05:00.000Z'))).toBe(false);
    expect(isCreationAuthorityCurrent(attestation, at('2026-10-15T09:59:59.000Z'))).toBe(false);
    expect(isCreationAuthorityCurrent({ ...attestation, issuer: 'x9' }, at('2026-10-15T10:02:00.000Z'))).toBe(false);
  });
  it('rejects expiresAt not after issuedAt', () => {
    expect(CreationActorAttestationSchema.safeParse({ ...attestation, expiresAt: attestation.issuedAt }).success).toBe(false);
    expect(CreationActorAttestationSchema.safeParse({ ...attestation, expiresAt: '2026-10-15T09:00:00.000Z' }).success).toBe(false);
  });
  it('rejects an issuer other than forge', () => {
    expect(CreationActorAttestationSchema.safeParse({ ...attestation, issuer: 'x9' }).success).toBe(false);
  });
  it('rejects ownerId and agentId as extra fields', () => {
    expect(CreationActorAttestationSchema.safeParse({ ...attestation, ownerId: 'o' }).success).toBe(false);
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, ownerId: 'o' }).success).toBe(false);
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, agentId: 'a' }).success).toBe(false);
  });
  it('requires a reason when denied', () => {
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, decision: 'denied' }).success).toBe(false);
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, decision: 'denied', reason: '' }).success).toBe(false);
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, decision: 'denied', reason: 'not owner' }).success).toBe(true);
  });
  it('rejects an attestation for another actor or tenant', () => {
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, actorId: 'other' }).success).toBe(false);
    expect(PlatformOwnerAuthorizationSchema.safeParse({ ...auth, tenantId: 't2' }).success).toBe(false);
  });
  it('round trips through JSON', () => {
    const parsed = PlatformOwnerAuthorizationSchema.parse(auth);
    expect(PlatformOwnerAuthorizationSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
  });
});
