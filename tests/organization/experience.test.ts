import { describe, expect, it } from 'vitest';
import {
  ExperienceConflictSchema,
  ExperienceReceiptSchema,
  OrganizationExperienceEventSchema,
} from '../../src/organization/experience.js';

const digest = 'a'.repeat(64);
const base = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  recordId: 'rec-1',
  version: 1,
  occurredAt: '2026-10-15T10:00:00.000Z',
  digest,
  visibility: 'private_to_producer' as const,
};
const outcome = {
  runId: 'run-1',
  attemptId: 'att-1',
  status: 'succeeded' as const,
  evidence: [{ kind: 'log' as const, ref: 'log://1', grantsRead: false as const }],
  consumption: [],
  recordedAt: '2026-10-15T10:00:00.000Z',
};
const runEvent = { ...base, kind: 'run_outcome' as const, runId: 'run-1', attemptId: 'att-1', outcome };
const decision = {
  ...base,
  kind: 'authoritative_decision' as const,
  decisionRef: 'dec-1',
  status: 'approved' as const,
  approvedBy: { actorType: 'human' as const, actorId: 'owner-1' },
  approvalRef: 'appr-1',
};
const parse = (v: unknown) => OrganizationExperienceEventSchema.safeParse(v);

describe('OrganizationExperienceEventSchema', () => {
  it('accepts a valid run_outcome and a valid approved decision', () => {
    expect(parse(runEvent).success).toBe(true);
    expect(parse(decision).success).toBe(true);
  });

  it('rejects run_outcome without runId', () => {
    const { runId: _r, ...rest } = runEvent;
    expect(parse(rest).success).toBe(false);
  });

  it('rejects run_outcome without attemptId', () => {
    const { attemptId: _a, ...rest } = runEvent;
    expect(parse(rest).success).toBe(false);
  });

  it('rejects run_outcome whose outcome belongs to another attempt or run', () => {
    expect(parse({ ...runEvent, attemptId: 'att-2' }).success).toBe(false);
    expect(parse({ ...runEvent, runId: 'run-2' }).success).toBe(false);
  });

  it('rejects an approved decision without approvedBy', () => {
    const { approvedBy: _b, ...rest } = decision;
    expect(parse(rest).success).toBe(false);
  });

  it('rejects an approved decision without approvalRef', () => {
    const { approvalRef: _r, ...rest } = decision;
    expect(parse(rest).success).toBe(false);
  });

  it('does not treat a complete DecisionResponse as an approved event', () => {
    expect(
      parse({ ...base, kind: 'authoritative_decision', decisionRef: 'd', status: 'approved', completeness: 'complete' })
        .success,
    ).toBe(false);
  });

  it('accepts revoked/superseded without approval fields and rejects unknown status', () => {
    const { approvedBy: _b, approvalRef: _r, ...rest } = decision;
    expect(parse({ ...rest, status: 'revoked' }).success).toBe(true);
    expect(parse({ ...rest, status: 'superseded', supersedes: 1 }).success).toBe(true);
    expect(parse({ ...rest, status: 'pending' }).success).toBe(false);
  });

  it('rejects extra fields, version 0, short digest, wrong visibility', () => {
    expect(parse({ ...runEvent, extra: 1 }).success).toBe(false);
    expect(parse({ ...runEvent, version: 0 }).success).toBe(false);
    expect(parse({ ...runEvent, digest: 'abc' }).success).toBe(false);
    expect(parse({ ...runEvent, visibility: 'public' }).success).toBe(false);
  });

  it('requires explicit tenantId and organizationId', () => {
    const { tenantId: _t, ...noTenant } = runEvent;
    const { organizationId: _o, ...noOrg } = runEvent;
    expect(parse(noTenant).success).toBe(false);
    expect(parse(noOrg).success).toBe(false);
  });

  it('keeps uncertain uncertain and grantsRead false', () => {
    const uncertain = { ...outcome, status: 'uncertain', reason: 'timeout' };
    expect(parse({ ...runEvent, outcome: uncertain }).success).toBe(true);
    expect(parse({ ...runEvent, outcome: { ...uncertain, reason: undefined } }).success).toBe(false);
    const grants = { ...outcome, evidence: [{ kind: 'log', ref: 'x', grantsRead: true }] };
    expect(parse({ ...runEvent, outcome: grants }).success).toBe(false);
  });

  it('keeps unknown consumption flagged as estimated', () => {
    const c = { unit: 'tokens', quantity: 0, state: 'unknown', estimated: false };
    expect(parse({ ...runEvent, outcome: { ...outcome, consumption: [c] } }).success).toBe(false);
  });
});

describe('ExperienceReceiptSchema / ExperienceConflictSchema', () => {
  it('validates receipts and conflicts', () => {
    const receipt = { recordId: 'r', version: 1, digest, disposition: 'stored' };
    expect(ExperienceReceiptSchema.safeParse(receipt).success).toBe(true);
    expect(ExperienceReceiptSchema.safeParse({ ...receipt, disposition: 'dup' }).success).toBe(false);
    const conflict = { code: 'experience_conflict', recordId: 'r', version: 2 };
    expect(ExperienceConflictSchema.safeParse(conflict).success).toBe(true);
    expect(ExperienceConflictSchema.safeParse({ ...conflict, code: 'other' }).success).toBe(false);
  });
});
