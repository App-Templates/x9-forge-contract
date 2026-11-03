import { describe, expect, it } from 'vitest';
import { KnowledgePublicationSchema } from '../../src/organization/index.js';

const valid = {
  ref: {
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
    slug: 'refund-procedure',
    version: 2,
    digest: 'a'.repeat(64),
    recipient: { kind: 'organization', id: 'org-1' },
  },
  kind: 'procedure',
  status: 'current',
  evidence: [{ kind: 'run_receipt', id: 'rcpt-1', digest: 'b'.repeat(64) }],
  supersedes: 1,
  validFrom: '2026-10-15T08:00:00.000Z',
  validUntil: '2026-12-31T00:00:00.000Z',
  contradicts: ['old-refund'],
};

describe('KnowledgePublicationSchema', () => {
  it('accepts a valid publication and round-trips', () => {
    const parsed = KnowledgePublicationSchema.parse(valid);
    expect(parsed).toEqual(valid);
    expect(KnowledgePublicationSchema.parse(JSON.parse(JSON.stringify(parsed)))).toEqual(valid);
  });

  it('rejects empty evidence', () => {
    expect(KnowledgePublicationSchema.safeParse({ ...valid, evidence: [] }).success).toBe(false);
  });

  it('rejects supersedes >= version', () => {
    for (const supersedes of [2, 3]) {
      expect(KnowledgePublicationSchema.safeParse({ ...valid, supersedes }).success).toBe(false);
    }
  });

  it('rejects validUntil before validFrom', () => {
    const r = KnowledgePublicationSchema.safeParse({ ...valid, validUntil: '2026-10-01T00:00:00.000Z' });
    expect(r.success).toBe(false);
  });

  it('rejects a permissions or tools field', () => {
    expect(KnowledgePublicationSchema.safeParse({ ...valid, permissions: ['x'] }).success).toBe(false);
    expect(KnowledgePublicationSchema.safeParse({ ...valid, tools: ['x'] }).success).toBe(false);
  });

  it('requires a reason when withdrawn', () => {
    const w = { ...valid, status: 'withdrawn' };
    expect(KnowledgePublicationSchema.safeParse(w).success).toBe(false);
    expect(KnowledgePublicationSchema.safeParse({ ...w, reason: 'superseded' }).success).toBe(true);
  });
});
