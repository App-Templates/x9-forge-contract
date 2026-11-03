import { describe, expect, it } from 'vitest';
import {
  ExperienceReceiptSchema,
  OrganizationExperienceEventSchema,
  isExperienceReceiptForEvent,
} from '../../src/organization/experience.js';

const runOutcomeEvent = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  recordId: 'rec-1',
  version: 1,
  occurredAt: '2026-10-15T10:00:00.000Z',
  digest: 'a'.repeat(64),
  visibility: 'private_to_producer',
  kind: 'run_outcome',
  runId: 'run-1',
  attemptId: 'att-1',
  outcome: {
    runId: 'run-1',
    attemptId: 'att-1',
    status: 'succeeded',
    evidence: [],
    consumption: [],
    recordedAt: '2026-10-15T10:00:00.000Z',
  },
};

const decision = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  recordId: 'dec-1',
  version: 1,
  occurredAt: '2026-10-15T10:00:00.000Z',
  digest: 'b'.repeat(64),
  visibility: 'private_to_producer',
  kind: 'authoritative_decision',
  decisionRef: 'decision-9',
  status: 'approved',
  approvedBy: { actorType: 'human', actorId: 'stefano' },
  approvalRef: 'approval-1',
};

const receipt = {
  recordId: runOutcomeEvent.recordId,
  version: runOutcomeEvent.version,
  digest: runOutcomeEvent.digest,
  disposition: 'stored',
};

// Mutation failures observed: 0/5; execution deferred to the lane runner.
// Remove each recordId/version/digest comparison separately (3 mutations), then
// bypass each safeParse separately (2 mutations). Invalid disposition and invalid
// expected tenantId preserve matching correlation fields to detect those bypasses.
describe('isExperienceReceiptForEvent', () => {
  it.each(['stored', 'duplicate'])('accepts a valid %s receipt for run_outcome', (disposition) => {
    expect(OrganizationExperienceEventSchema.safeParse(runOutcomeEvent).success).toBe(true);
    expect(isExperienceReceiptForEvent({ ...receipt, disposition }, runOutcomeEvent)).toBe(true);
  });

  it.each(['stored', 'duplicate'])('accepts a valid %s receipt for authoritative_decision', (disposition) => {
    expect(OrganizationExperienceEventSchema.safeParse(decision).success).toBe(true);
    expect(isExperienceReceiptForEvent({
      recordId: decision.recordId,
      version: decision.version,
      digest: decision.digest,
      disposition,
    }, decision)).toBe(true);
  });

  it.each([
    ['recordId', { recordId: 'rec-2' }],
    ['version', { version: 2 }],
    ['digest', { digest: 'c'.repeat(64) }],
  ])('rejects an individually valid receipt with different %s', (_field, change) => {
    const other = { ...receipt, ...change };
    expect(ExperienceReceiptSchema.safeParse(other).success).toBe(true);
    expect(OrganizationExperienceEventSchema.safeParse(runOutcomeEvent).success).toBe(true);
    expect(isExperienceReceiptForEvent(other, runOutcomeEvent)).toBe(false);
  });

  it('rejects invalid expected with matching correlation fields', () => {
    expect(isExperienceReceiptForEvent(receipt, { ...runOutcomeEvent, tenantId: '' })).toBe(false);
  });

  it('rejects null expected without throwing', () => {
    expect(isExperienceReceiptForEvent(receipt, null)).toBe(false);
  });

  it('rejects null raw without throwing', () => {
    expect(isExperienceReceiptForEvent(null, runOutcomeEvent)).toBe(false);
  });

  it('rejects a missing receipt field', () => {
    const { disposition: _disposition, ...missing } = receipt;
    expect(isExperienceReceiptForEvent(missing, runOutcomeEvent)).toBe(false);
  });

  it('rejects invalid disposition with matching correlation fields', () => {
    expect(isExperienceReceiptForEvent({ ...receipt, disposition: 'pending' }, runOutcomeEvent)).toBe(false);
  });

  it('rejects an extra receipt field', () => {
    expect(isExperienceReceiptForEvent({ ...receipt, extra: true }, runOutcomeEvent)).toBe(false);
  });

  it('rejects an extra expected field', () => {
    expect(isExperienceReceiptForEvent(receipt, { ...runOutcomeEvent, extra: true })).toBe(false);
  });
});
