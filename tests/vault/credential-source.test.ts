import { describe, expect, it } from 'vitest';
import {
  CredentialSourceIdSchema,
  CredentialVersionRefSchema,
  compareCredentialVersions,
  credentialSourceOf,
  type CredentialSourceId,
  type CredentialVersionRef,
} from '../../src/vault/index.js';

describe('CredentialSourceIdSchema', () => {
  // Existing credential_source_versions rows use the first three source forms.
  it.each(['platform', 'owner:12', 'agent:34', 'preset:56'])(
    'accepts the persisted source form %s',
    (source) => {
      const parsed: CredentialSourceId = CredentialSourceIdSchema.parse(source);
      expect(parsed).toBe(source);
    },
  );

  it.each(['preset:0', 'preset:x', 'company:1', 'owner:0', 'agent:-1', 'preset:01', 'preset:1.5'])(
    'rejects invalid source %s',
    (source) => {
      expect(CredentialSourceIdSchema.safeParse(source).success).toBe(false);
    },
  );
});

describe('credentialSourceOf', () => {
  it('derives the source for all four cascade tiers', () => {
    expect(credentialSourceOf({ tier: 'platform', agentId: null, ownerId: null })).toBe('platform');
    expect(credentialSourceOf({ tier: 'owner', agentId: null, ownerId: 12 })).toBe('owner:12');
    expect(credentialSourceOf({ tier: 'agent', agentId: 34, ownerId: 12 })).toBe('agent:34');
    expect(credentialSourceOf({ tier: 'preset', agentId: null, ownerId: null, presetId: 56 })).toBe('preset:56');
  });

  it('rejects a preset without a valid preset identity', () => {
    expect(() => credentialSourceOf({ tier: 'preset', agentId: null, ownerId: null })).toThrow();
    for (const presetId of [null, 0, -1, 1.5]) {
      expect(() => credentialSourceOf({ tier: 'preset', agentId: null, ownerId: null, presetId })).toThrow();
    }
  });

  it('rejects missing owner and agent identities', () => {
    expect(() => credentialSourceOf({ tier: 'owner', agentId: null, ownerId: null })).toThrow();
    expect(() => credentialSourceOf({ tier: 'agent', agentId: null, ownerId: 12 })).toThrow();
  });
});

describe('CredentialVersionRefSchema', () => {
  it('defaults revoked to false and preserves explicit revocation', () => {
    const ref: CredentialVersionRef = CredentialVersionRefSchema.parse({ source: 'preset:1', counter: 3 });
    expect(ref).toEqual({ source: 'preset:1', counter: 3, revoked: false });
    expect(CredentialVersionRefSchema.parse({ ...ref, revoked: true }).revoked).toBe(true);
  });

  it('rejects extra fields', () => {
    expect(CredentialVersionRefSchema.safeParse({ source: 'preset:1', counter: 3, extra: true }).success).toBe(false);
  });

  it.each([0, -1, 1.5])('rejects invalid counter %s', (counter) => {
    expect(CredentialVersionRefSchema.safeParse({ source: 'preset:1', counter }).success).toBe(false);
  });

  it('validates source and revoked fields', () => {
    expect(CredentialVersionRefSchema.safeParse({ source: 'company:1', counter: 3 }).success).toBe(false);
    expect(CredentialVersionRefSchema.safeParse({ source: 'preset:1', counter: 3, revoked: 'false' }).success).toBe(false);
  });
});

describe('compareCredentialVersions', () => {
  it('keeps versions from different sources incomparable', () => {
    for (const counter of [2, 3, 4]) {
      expect(compareCredentialVersions(
        { source: 'preset:1', counter: 3, revoked: false },
        { source: 'preset:2', counter, revoked: false },
      )).toBe('incomparable');
    }
    expect(compareCredentialVersions(
      { source: 'owner:1', counter: 3, revoked: false },
      { source: 'agent:1', counter: 3, revoked: false },
    )).toBe('incomparable');
  });

  it('orders counters within the same source and ignores revocation', () => {
    const ref: CredentialVersionRef = { source: 'preset:1', counter: 3, revoked: false };
    expect(compareCredentialVersions(ref, { ...ref, counter: 4 })).toBe('older');
    expect(compareCredentialVersions({ ...ref, counter: 4 }, ref)).toBe('newer');
    expect(compareCredentialVersions(ref, ref)).toBe('same');
    expect(compareCredentialVersions(ref, { ...ref, revoked: true })).toBe('same');
    expect(compareCredentialVersions({ ...ref, revoked: true }, ref)).toBe('same');
    expect(compareCredentialVersions({ ...ref, revoked: true }, { ...ref, counter: 4 })).toBe('older');
    expect(compareCredentialVersions({ ...ref, counter: 4, revoked: true }, ref)).toBe('newer');
  });
});
