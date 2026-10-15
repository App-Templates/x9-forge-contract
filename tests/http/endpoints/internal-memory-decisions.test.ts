import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_DECISIONS_PATH,
  InternalMemoryDecisionRequestSchema,
  InternalMemoryDecisionResponseSchema,
  internalMemoryDecisionContract,
} from '../../../src/http/endpoints/internal-memory-decisions.js';
import {
  ExperienceConflictResponseSchema,
  ExperienceErrorResponseSchema,
} from '../../../src/http/endpoints/internal-memory-experience.js';

const DIGEST = 'b'.repeat(64);

const decision = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  recordId: 'dec-1',
  version: 1,
  occurredAt: '2026-10-15T10:00:00.000Z',
  digest: DIGEST,
  visibility: 'private_to_producer',
  kind: 'authoritative_decision',
  decisionRef: 'decision-9',
  status: 'approved',
  approvedBy: { actorType: 'human', actorId: 'stefano' },
  approvalRef: 'approval-1',
};

describe('internal-memory-decisions', () => {
  it('accepts an approved decision with approver and approvalRef', () => {
    expect(InternalMemoryDecisionRequestSchema.safeParse(decision).success).toBe(true);
  });

  it('rejects an approved decision without approvedBy', () => {
    const { approvedBy: _a, ...rest } = decision;
    expect(InternalMemoryDecisionRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a decision without tenantId or version', () => {
    const { tenantId: _t, ...noTenant } = decision;
    const { version: _v, ...noVersion } = decision;
    expect(InternalMemoryDecisionRequestSchema.safeParse(noTenant).success).toBe(false);
    expect(InternalMemoryDecisionRequestSchema.safeParse(noVersion).success).toBe(false);
  });

  it('rejects a run_outcome event on the decisions route', () => {
    expect(
      InternalMemoryDecisionRequestSchema.safeParse({ ...decision, kind: 'run_outcome' }).success,
    ).toBe(false);
  });

  it('rejects a body with an extra field', () => {
    expect(InternalMemoryDecisionRequestSchema.safeParse({ ...decision, extra: true }).success).toBe(false);
  });

  it('accepts a receipt and rejects one without recordId or correlation', () => {
    const receipt = { recordId: 'dec-1', version: 1, digest: DIGEST, disposition: 'stored' };
    expect(InternalMemoryDecisionResponseSchema.safeParse(receipt).success).toBe(true);
    const { recordId: _r, ...noRecord } = receipt;
    expect(InternalMemoryDecisionResponseSchema.safeParse(noRecord).success).toBe(false);
    const { digest: _d, ...noDigest } = receipt;
    expect(InternalMemoryDecisionResponseSchema.safeParse(noDigest).success).toBe(false);
  });

  it('shares conflict and error shapes with the experience route', () => {
    expect(
      ExperienceConflictResponseSchema.safeParse({ code: 'experience_conflict', recordId: 'dec-1', version: 1 })
        .success,
    ).toBe(true);
    expect(
      ExperienceErrorResponseSchema.safeParse({ code: 'invalid_event', message: 'bad body' }).success,
    ).toBe(true);
  });

  it('exposes a fixed path with secret auth', () => {
    expect(internalMemoryDecisionContract.path).toBe(INTERNAL_MEMORY_DECISIONS_PATH);
    expect(internalMemoryDecisionContract.authType).toBe('secret');
  });
});
