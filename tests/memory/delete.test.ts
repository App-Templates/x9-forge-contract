import { describe, it, expect } from 'vitest';
import {
  MEMORY_DELETE_BY_SOURCE_REF_PATH,
  MemoryDeleteBySourceRefRequestSchema,
  MemoryDeleteBySourceRefResponseSchema,
} from '../../src/memory/delete.js';

// ---------------------------------------------------------------------------
// MEMORY_DELETE_BY_SOURCE_REF_PATH — literal lock
// ---------------------------------------------------------------------------

describe('MEMORY_DELETE_BY_SOURCE_REF_PATH', () => {
  it('is the exact canonical path string (locked — zero drift across consumers)', () => {
    expect(MEMORY_DELETE_BY_SOURCE_REF_PATH).toBe(
      '/internal/memory/delete-by-source-ref',
    );
  });
});

// ---------------------------------------------------------------------------
// MemoryDeleteBySourceRefRequestSchema
// ---------------------------------------------------------------------------

describe('MemoryDeleteBySourceRefRequestSchema', () => {
  it('accepts minimal valid input', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'call:abc',
      owner_id: 'u1',
      agent_id: 'a1',
      requested_by: 'dsar',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts full input with optional fields', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'call:abc',
      source_type: 'voice_call',
      tenant_id: 't1',
      owner_id: 'u1',
      agent_id: 'a1',
      requested_by: 'retention_policy',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects missing owner_id with error path ["owner_id"]', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'call:abc',
      agent_id: 'a1',
      requested_by: 'dsar',
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const paths = parsed.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('owner_id');
    }
  });

  it('rejects requested_by outside the closed set (e.g. "user")', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'call:abc',
      owner_id: 'u1',
      agent_id: 'a1',
      // @ts-expect-error — intentional invalid literal for negative test
      requested_by: 'user',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects source_ref longer than 256 chars', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'x'.repeat(257),
      owner_id: 'u1',
      agent_id: 'a1',
      requested_by: 'dsar',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts source_ref at exactly 256 chars', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: 'x'.repeat(256),
      owner_id: 'u1',
      agent_id: 'a1',
      requested_by: 'dsar',
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects empty source_ref', () => {
    const parsed = MemoryDeleteBySourceRefRequestSchema.safeParse({
      source_ref: '',
      owner_id: 'u1',
      agent_id: 'a1',
      requested_by: 'dsar',
    });
    expect(parsed.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// MemoryDeleteBySourceRefResponseSchema
// ---------------------------------------------------------------------------

describe('MemoryDeleteBySourceRefResponseSchema', () => {
  it('accepts valid counts', () => {
    const parsed = MemoryDeleteBySourceRefResponseSchema.safeParse({
      source_ref: 'call:abc',
      deleted_facts: 3,
      deleted_rules: 0,
      deleted_edges: 1,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects negative counts', () => {
    const parsed = MemoryDeleteBySourceRefResponseSchema.safeParse({
      source_ref: 'call:abc',
      deleted_facts: -1,
      deleted_rules: 0,
      deleted_edges: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects non-integer counts', () => {
    const parsed = MemoryDeleteBySourceRefResponseSchema.safeParse({
      source_ref: 'call:abc',
      deleted_facts: 1.5,
      deleted_rules: 0,
      deleted_edges: 0,
    });
    expect(parsed.success).toBe(false);
  });

  it('rejects missing deleted_facts', () => {
    const parsed = MemoryDeleteBySourceRefResponseSchema.safeParse({
      source_ref: 'call:abc',
      deleted_rules: 0,
      deleted_edges: 0,
    });
    expect(parsed.success).toBe(false);
  });
});
