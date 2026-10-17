import { describe, expect, it } from 'vitest';
import {
  ExperienceConflictResponseSchema,
  ExperienceErrorCodeSchema,
  ExperienceErrorResponseSchema,
  INTERNAL_MEMORY_EXPERIENCE_PATH,
  INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH,
  InternalMemoryExperienceQueryResponseSchema,
  InternalMemoryExperienceQuerySchema,
  InternalMemoryExperienceRequestSchema,
  InternalMemoryExperienceResponseSchema,
  internalMemoryExperienceContract,
  internalMemoryExperienceQueryContract,
} from '../../../src/http/endpoints/internal-memory-experience.js';

const DIGEST = 'a'.repeat(64);

const runOutcomeEvent = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  recordId: 'rec-1',
  version: 1,
  occurredAt: '2026-10-15T10:00:00.000Z',
  digest: DIGEST,
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

describe('internal-memory-experience ingest', () => {
  it('accepts a valid run_outcome event', () => {
    expect(InternalMemoryExperienceRequestSchema.safeParse(runOutcomeEvent).success).toBe(true);
  });

  it('rejects a request without tenantId', () => {
    const { tenantId: _t, ...rest } = runOutcomeEvent;
    expect(InternalMemoryExperienceRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a request without version', () => {
    const { version: _v, ...rest } = runOutcomeEvent;
    expect(InternalMemoryExperienceRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects a body with an extra field', () => {
    expect(
      InternalMemoryExperienceRequestSchema.safeParse({ ...runOutcomeEvent, extra: 1 }).success,
    ).toBe(false);
  });

  it('rejects an outcome whose runId differs from the event runId', () => {
    const bad = { ...runOutcomeEvent, outcome: { ...runOutcomeEvent.outcome, runId: 'run-2' } };
    expect(InternalMemoryExperienceRequestSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts a receipt for stored and duplicate', () => {
    for (const disposition of ['stored', 'duplicate']) {
      expect(
        InternalMemoryExperienceResponseSchema.safeParse({
          recordId: 'rec-1',
          version: 1,
          digest: DIGEST,
          disposition,
        }).success,
      ).toBe(true);
    }
  });

  it('rejects a receipt without recordId', () => {
    expect(
      InternalMemoryExperienceResponseSchema.safeParse({
        version: 1,
        digest: DIGEST,
        disposition: 'stored',
      }).success,
    ).toBe(false);
  });

  it('rejects a receipt without correlation (version or digest)', () => {
    expect(
      InternalMemoryExperienceResponseSchema.safeParse({ recordId: 'rec-1', disposition: 'stored' }).success,
    ).toBe(false);
  });

  it('models the conflict as experience_conflict with recordId and version', () => {
    const conflict = { code: 'experience_conflict', recordId: 'rec-1', version: 1 };
    expect(ExperienceConflictResponseSchema.safeParse(conflict).success).toBe(true);
    expect(ExperienceConflictResponseSchema.safeParse({ code: 'experience_conflict' }).success).toBe(false);
  });

  it('names the four distinct errors and rejects others', () => {
    expect(ExperienceErrorCodeSchema.options).toEqual([
      'unauthenticated',
      'identity_uncertain',
      'experience_conflict',
      'invalid_event',
    ]);
    expect(ExperienceErrorResponseSchema.safeParse({ code: 'boom', message: 'x' }).success).toBe(false);
    expect(
      ExperienceErrorResponseSchema.safeParse({ code: 'identity_uncertain', message: 'tenant missing' })
        .success,
    ).toBe(true);
  });

  it('exposes fixed paths and secret auth', () => {
    expect(internalMemoryExperienceContract.path).toBe(INTERNAL_MEMORY_EXPERIENCE_PATH);
    expect(internalMemoryExperienceContract.authType).toBe('secret');
    expect(internalMemoryExperienceQueryContract.path).toBe(INTERNAL_MEMORY_EXPERIENCE_QUERY_PATH);
    expect(internalMemoryExperienceQueryContract.authType).toBe('secret');
  });
});

describe('internal-memory-experience query', () => {
  it('accepts a query with kind and provenance filters and defaults limit', () => {
    const parsed = InternalMemoryExperienceQuerySchema.parse({
      tenantId: 'tenant-1',
      organizationId: 'org-1',
      kind: 'run_outcome',
      runId: 'run-1',
    });
    expect(parsed.limit).toBe(50);
  });

  it('rejects a query without tenantId or organizationId', () => {
    expect(InternalMemoryExperienceQuerySchema.safeParse({ organizationId: 'org-1' }).success).toBe(false);
    expect(InternalMemoryExperienceQuerySchema.safeParse({ tenantId: 'tenant-1' }).success).toBe(false);
  });

  it('rejects an unknown kind and an extra field', () => {
    const base = { tenantId: 'tenant-1', organizationId: 'org-1' };
    expect(InternalMemoryExperienceQuerySchema.safeParse({ ...base, kind: 'other' }).success).toBe(false);
    expect(InternalMemoryExperienceQuerySchema.safeParse({ ...base, extra: 1 }).success).toBe(false);
  });

  it('returns records with the version in force and state', () => {
    const ok = {
      records: [
        {
          recordId: 'rec-1',
          kind: 'authoritative_decision',
          version: 2,
          state: 'current',
          digest: DIGEST,
          occurredAt: '2026-10-15T10:00:00.000Z',
        },
      ],
    };
    expect(InternalMemoryExperienceQueryResponseSchema.safeParse(ok).success).toBe(true);
    const noVersion = { records: [{ ...ok.records[0], version: undefined }] };
    expect(InternalMemoryExperienceQueryResponseSchema.safeParse(noVersion).success).toBe(false);
  });
});
