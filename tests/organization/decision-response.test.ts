import { describe, expect, it } from 'vitest';
import { DecisionResponseSchema } from '../../src/organization/decision-response.js';

const base = {
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
  decision: 'Adopt supplier A',
  alternatives: [{ label: 'Supplier B', reason: 'higher cost' }],
  recommendation: 'Go with supplier A',
  uncertainties: [],
  verifications: ['price list checked'],
  evidence: [{ kind: 'document', ref: 'doc-1', grantsRead: false }],
  completeness: 'complete',
};

const parse = (v: unknown) => DecisionResponseSchema.safeParse(v);

const hasIssue = (v: unknown, path: string) => {
  const r = parse(v);
  expect(r.success).toBe(false);
  if (!r.success) {
    expect(r.error.issues.some((i) => i.path[0] === path)).toBe(true);
  }
};

describe('DecisionResponseSchema', () => {
  it('accepts a complete response', () => {
    expect(DecisionResponseSchema.parse(base)).toEqual(base);
  });

  it('rejects a response without evidence', () => {
    hasIssue({ ...base, evidence: [] }, 'evidence');
  });

  it('rejects empty alternatives', () => {
    hasIssue({ ...base, alternatives: [] }, 'alternatives');
  });

  it('rejects denied without denialReason', () => {
    const r = parse({ ...base, completeness: 'denied' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues).toContainEqual(
        expect.objectContaining({ path: ['denialReason'], code: 'custom' }),
      );
    }
  });

  it('accepts denied with denialReason', () => {
    expect(parse({ ...base, completeness: 'denied', denialReason: 'no access' }).success).toBe(
      true,
    );
  });

  it.each(['complete', 'incomplete'])('rejects denialReason with %s', (completeness) => {
    const r = parse({ ...base, completeness, denialReason: 'x' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues).toContainEqual(
        expect.objectContaining({ path: ['denialReason'], code: 'custom' }),
      );
    }
  });

  it('rejects an unknown completeness', () => {
    hasIssue({ ...base, completeness: 'partial' }, 'completeness');
  });

  it('rejects an extra field', () => {
    expect(parse({ ...base, extra: 1 }).success).toBe(false);
  });
});
