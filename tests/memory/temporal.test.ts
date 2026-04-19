import { describe, it, expect } from 'vitest';
import {
  TemporalSemanticsSchema,
  RecallTemporalModeSchema,
  RecallTemporalFilterSchema,
  BitemporalFieldsSchema,
  InvalidationMetadataSchema,
} from '../../src/memory/temporal.js';

// ---------------------------------------------------------------------------
// RecallTemporalModeSchema
// ---------------------------------------------------------------------------

describe('RecallTemporalModeSchema', () => {
  it.each(RecallTemporalModeSchema.options)(
    'accepts valid mode "%s"',
    (mode) => {
      const parsed = RecallTemporalModeSchema.safeParse(mode);
      expect(parsed.success).toBe(true);
    },
  );

  it('has exactly 5 modes', () => {
    expect(RecallTemporalModeSchema.options).toHaveLength(5);
  });

  it('rejects unknown mode "deep"', () => {
    const parsed = RecallTemporalModeSchema.safeParse('deep');
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// RecallTemporalFilterSchema
// ---------------------------------------------------------------------------

describe('RecallTemporalFilterSchema', () => {
  it('accepts minimal { mode: "current" }', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({ mode: 'current' });
    expect(parsed.success).toBe(true);
  });

  it('accepts valid_at with validAt timestamp', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({
      mode: 'valid_at',
      validAt: '2026-04-01T00:00:00Z',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts known_at with knownAt timestamp', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({
      mode: 'known_at',
      knownAt: '2026-04-01T12:00:00+02:00',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts valid_between with validFrom + validTo', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({
      mode: 'valid_between',
      validFrom: '2026-01-01T00:00:00Z',
      validTo: '2026-04-01T00:00:00Z',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts history mode with include flags', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({
      mode: 'history',
      includeInvalidated: true,
      includeSuperseded: true,
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts valid_at without validAt (validation at app level)', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({ mode: 'valid_at' });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing mode', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({ validAt: '2026-04-01T00:00:00Z' });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid datetime format in validAt', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({
      mode: 'valid_at',
      validAt: 'not-a-date',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid mode value', () => {
    const parsed = RecallTemporalFilterSchema.safeParse({ mode: 'snapshot' });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// BitemporalFieldsSchema
// ---------------------------------------------------------------------------

describe('BitemporalFieldsSchema', () => {
  const fullValid = {
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2026-12-31T23:59:59Z',
    recordedAt: '2026-04-19T12:00:00Z',
    recordInvalidatedAt: null,
    assertedAt: '2026-04-19T12:00:00Z',
    sourceObservedAt: '2026-04-18T08:00:00Z',
  };

  it('accepts all fields populated', () => {
    const parsed = BitemporalFieldsSchema.safeParse(fullValid);
    expect(parsed.success).toBe(true);
  });

  it('accepts nullable fields as null', () => {
    const parsed = BitemporalFieldsSchema.safeParse({
      validFrom: null,
      validTo: null,
      recordedAt: '2026-04-19T12:00:00Z',
      recordInvalidatedAt: null,
      assertedAt: null,
      sourceObservedAt: null,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing recordedAt (required)', () => {
    const { recordedAt: _, ...rest } = fullValid;
    const parsed = BitemporalFieldsSchema.safeParse(rest);
    expect(parsed.success).toBe(false);
  });

  it('rejects invalid datetime in recordedAt', () => {
    const parsed = BitemporalFieldsSchema.safeParse({
      ...fullValid,
      recordedAt: 'yesterday',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts offset datetime format', () => {
    const parsed = BitemporalFieldsSchema.safeParse({
      ...fullValid,
      recordedAt: '2026-04-19T14:00:00+02:00',
    });
    expect(parsed.success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// InvalidationMetadataSchema
// ---------------------------------------------------------------------------

describe('InvalidationMetadataSchema', () => {
  it('accepts minimal { reason }', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'user_correction',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts full metadata', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'superseded_by_new_fact',
      sourceId: 'fact-uuid-123',
      actor: 'pipeline',
      note: 'New fact extracted from conversation',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects invalid reason', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'fake_reason',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects empty sourceId', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'admin_correction',
      sourceId: '',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects note over 500 chars', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'admin_correction',
      note: 'x'.repeat(501),
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts note at exactly 500 chars', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      reason: 'admin_correction',
      note: 'x'.repeat(500),
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing reason', () => {
    const parsed = InvalidationMetadataSchema.safeParse({
      actor: 'pipeline',
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TemporalSemanticsSchema — regression (existing, must not break)
// ---------------------------------------------------------------------------

describe('TemporalSemanticsSchema — regression', () => {
  it('accepts valid minimal payload', () => {
    const parsed = TemporalSemanticsSchema.safeParse({
      validAt: '2026-04-01T00:00:00Z',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts full payload with all optional fields', () => {
    const parsed = TemporalSemanticsSchema.safeParse({
      validAt: '2026-04-01T00:00:00Z',
      invalidAt: '2026-05-01T00:00:00Z',
      supersedes: 'prev-id-123',
      supersededBy: 'next-id-456',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing validAt', () => {
    const parsed = TemporalSemanticsSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });
});
