import { describe, expect, it } from 'vitest';
import { PublicationRefSchema } from '../../src/organization/publication-ref.js';

const valid = {
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
  slug: 'my-note-1',
  version: 1,
  digest: 'a'.repeat(64),
  recipient: { kind: 'organization', id: 'org-1' },
};

describe('PublicationRefSchema', () => {
  it.each(['organization', 'group', 'project', 'department'])(
    'accepts recipient %s',
    (kind) => {
      const ref = { ...valid, recipient: { kind, id: 'x-1' } };
      expect(PublicationRefSchema.parse(ref)).toEqual(ref);
    },
  );

  it('accepts private source with explicit true', () => {
    expect(PublicationRefSchema.safeParse({
      ...valid, sourceScope: 'private', explicit: true,
    }).success).toBe(true);
  });

  it.each([undefined, false])('rejects private source with explicit %s', (explicit) => {
    const result = PublicationRefSchema.safeParse({ ...valid, sourceScope: 'private', explicit });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        path: ['explicit'], code: 'custom',
      }));
    }
  });

  it('rejects slug with uppercase or empty', () => {
    expect(PublicationRefSchema.safeParse({ ...valid, slug: 'My-Note' }).success).toBe(false);
    expect(PublicationRefSchema.safeParse({ ...valid, slug: '' }).success).toBe(false);
  });

  it('rejects short, long or non-hex digest', () => {
    for (const digest of ['abc123', 'a'.repeat(65), 'g'.repeat(64)]) {
      expect(PublicationRefSchema.safeParse({ ...valid, digest }).success).toBe(false);
    }
  });

  it('rejects version 0 and non-integer versions', () => {
    expect(PublicationRefSchema.safeParse({ ...valid, version: 0 }).success).toBe(false);
    expect(PublicationRefSchema.safeParse({ ...valid, version: 1.5 }).success).toBe(false);
  });

  it('rejects unknown recipient kind, empty id and extra recipient fields', () => {
    for (const recipient of [
      { kind: 'team', id: 'x' },
      { kind: 'group', id: '' },
      { kind: 'project', id: 'x', extra: 1 },
    ]) {
      expect(PublicationRefSchema.safeParse({ ...valid, recipient }).success).toBe(false);
    }
  });

  it('rejects unknown source scope and extra fields', () => {
    expect(PublicationRefSchema.safeParse({ ...valid, sourceScope: 'public' }).success).toBe(false);
    expect(PublicationRefSchema.safeParse({ ...valid, content: 'secret' }).success).toBe(false);
  });

  it('rejects an invalid run context', () => {
    expect(PublicationRefSchema.safeParse({
      ...valid, context: { ...valid.context, expiresAt: valid.context.issuedAt },
    }).success).toBe(false);
  });
});
