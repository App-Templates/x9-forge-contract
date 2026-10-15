import { describe, expect, it } from 'vitest';
import {
  PublicationRecordLinkSchema,
  PublicationRecordLinkStateSchema,
  PublicationRecordLinkViewSchema,
  type PublicationRecordLink,
} from '../../src/organization/publication-record-link.js';

const source = {
  context: {
    schemaVersion: 1,
    runId: 'run-1',
    organizationId: 'org-1',
    ownerId: 'owner-1',
    identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
    issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z',
    expiresAt: '2026-10-14T11:00:00.000Z',
  },
  sourceScope: 'team',
  slug: 'source-note',
  version: 2,
  digest: 'a'.repeat(64),
  recipient: { kind: 'organization', id: 'org-1' },
} satisfies PublicationRecordLink['source'];

const targets = [
  { kind: 'knowledge', slug: 'derived-note', version: 1, digest: 'b'.repeat(64) },
  { kind: 'experience', recordId: 'record-1', version: 3, digest: 'c'.repeat(64) },
] satisfies PublicationRecordLink['target'][];

const link = { tenantId: 'tenant-1', source, target: targets[0], derivationKey: 'derive-1' };
const view = { ...link, state: 'active', updatedAt: '2026-10-14T12:00:00.000Z' };

describe('PublicationRecordLinkSchema', () => {
  it.each(targets)('accepts a $kind link with distinct source and target digests', (target) => {
    const value = { ...link, target };
    expect(PublicationRecordLinkSchema.parse(value)).toEqual(value);
    expect(value.source.digest).not.toBe(value.target.digest);
  });

  it('rejects an unknown target kind and mismatched variant fields', () => {
    for (const target of [
      { ...targets[0], kind: 'unknown' },
      { kind: 'knowledge', recordId: 'record-1', version: 1, digest: 'b'.repeat(64) },
      { kind: 'experience', slug: 'derived-note', version: 1, digest: 'b'.repeat(64) },
    ]) {
      expect(PublicationRecordLinkSchema.safeParse({ ...link, target }).success).toBe(false);
    }
  });

  it('rejects zero and fractional versions in both targets and the source', () => {
    for (const version of [0, 1.5]) {
      for (const target of targets) {
        expect(PublicationRecordLinkSchema.safeParse({
          ...link, target: { ...target, version },
        }).success).toBe(false);
      }
      expect(PublicationRecordLinkSchema.safeParse({
        ...link, source: { ...source, version },
      }).success).toBe(false);
    }
  });

  it('rejects empty identities and derivation keys', () => {
    for (const value of [
      { ...link, tenantId: '' },
      { ...link, derivationKey: '' },
      { ...link, target: { ...targets[0], slug: '' } },
      { ...link, target: { ...targets[1], recordId: '' } },
      { ...link, target: { ...targets[0], slug: 'Invalid Slug' } },
    ]) {
      expect(PublicationRecordLinkSchema.safeParse(value).success).toBe(false);
    }
  });

  it('rejects extra fields at every link boundary', () => {
    expect(PublicationRecordLinkSchema.safeParse({ ...link, extra: true }).success).toBe(false);
    expect(PublicationRecordLinkSchema.safeParse({
      ...link, source: { ...source, extra: true },
    }).success).toBe(false);
    for (const target of targets) {
      expect(PublicationRecordLinkSchema.safeParse({
        ...link, target: { ...target, extra: true },
      }).success).toBe(false);
    }
    expect(PublicationRecordLinkViewSchema.safeParse({ ...view, extra: true }).success).toBe(false);
  });

  it('requires separate source and target digests', () => {
    for (const target of targets) {
      const { digest: sourceDigest, ...sourceWithoutDigest } = source;
      const { digest: targetDigest, ...targetWithoutDigest } = target;
      expect(PublicationRecordLinkSchema.safeParse({
        ...link, source: sourceWithoutDigest, target,
      }).success).toBe(false);
      expect(PublicationRecordLinkSchema.safeParse({
        ...link, target: targetWithoutDigest,
      }).success).toBe(false);
      expect(PublicationRecordLinkSchema.safeParse({
        ...link, source: sourceWithoutDigest, target: targetWithoutDigest, digest: sourceDigest,
      }).success).toBe(false);
      expect(targetDigest).not.toBe(sourceDigest);
    }
  });

  it('rejects malformed target digests', () => {
    for (const target of targets) {
      for (const digest of ['', 'a'.repeat(63), 'a'.repeat(65), 'g'.repeat(64)]) {
        expect(PublicationRecordLinkSchema.safeParse({
          ...link, target: { ...target, digest },
        }).success).toBe(false);
      }
    }
  });
});

describe('PublicationRecordLinkViewSchema', () => {
  it.each(['active', 'superseded', 'withdrawn'])('accepts state %s', (state) => {
    expect(PublicationRecordLinkStateSchema.parse(state)).toBe(state);
    expect(PublicationRecordLinkViewSchema.parse({ ...view, state })).toEqual({ ...view, state });
  });

  it('rejects unknown or missing states and invalid timestamps', () => {
    expect(PublicationRecordLinkStateSchema.safeParse('deleted').success).toBe(false);
    for (const value of [
      { ...view, state: 'deleted' },
      { ...view, state: undefined },
      { ...view, updatedAt: undefined },
      { ...view, updatedAt: '2026-10-14' },
      { ...view, updatedAt: 'not-a-date' },
      { ...view, derivationKey: '' },
    ]) {
      expect(PublicationRecordLinkViewSchema.safeParse(value).success).toBe(false);
    }
  });
});
