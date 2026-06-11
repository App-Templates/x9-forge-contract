import { describe, it, expect } from 'vitest';
import {
  InternalMemoryRecallBundleRequestSchema,
  InternalMemoryRecallBundleResponseSchema,
  RecallBundleEntrySchema,
  INTERNAL_MEMORY_RECALL_BUNDLE_PATH,
  internalMemoryRecallBundleContract,
} from '../../../src/http/endpoints/internal-memory-recall-bundle.js';

// Real fixture mirrors services/memory/src/routes/internal-recall-bundle.ts
// (recallBundleRequestSchema) — the live route this contract was lifted from.
const validRequest = {
  tenantId: 'tenant-1',
  ownerId: 'owner-1',
  agentId: 'agent-a',
  query: 'cosa preferisce mangiare',
  topK: 8,
  mode: 'standard',
};

describe('InternalMemoryRecallBundleRequestSchema', () => {
  it('parses a minimal valid request (defaults applied)', () => {
    const r = InternalMemoryRecallBundleRequestSchema.parse(validRequest);
    expect(r.agentId).toBe('agent-a');
    expect(r.mode).toBe('standard');
    expect(r.taskType).toBe('text'); // default
    expect(r.latencyBudgetMs).toBe(300); // default
  });

  it('parses a temporal valid_at request (Phase 41)', () => {
    const r = InternalMemoryRecallBundleRequestSchema.parse({
      ...validRequest,
      temporal: { mode: 'valid_at', validAt: '2026-06-11T12:00:00+02:00' },
    });
    expect(r.temporal?.mode).toBe('valid_at');
  });

  it('rejects a request missing agentId — the multi-tenancy triple is mandatory', () => {
    const { agentId: _drop, ...withoutAgent } = validRequest;
    expect(() => InternalMemoryRecallBundleRequestSchema.parse(withoutAgent)).toThrow();
  });

  it('rejects an empty query and an out-of-range topK', () => {
    expect(() =>
      InternalMemoryRecallBundleRequestSchema.parse({ ...validRequest, query: '' }),
    ).toThrow();
    expect(() =>
      InternalMemoryRecallBundleRequestSchema.parse({ ...validRequest, topK: 50 }),
    ).toThrow();
  });
});

describe('InternalMemoryRecallBundleResponseSchema', () => {
  const validEntry = {
    id: 'f_123',
    resultType: 'fact',
    score: 0.92,
    contentNormalized: "L'utente preferisce la cucina italiana",
    privacyLevel: 'standard',
    createdAt: '2026-06-11T10:00:00.000Z',
    metadata: {},
    memoryType: 'profile',
    subtype: 'preference.food',
    slotKey: 'preferred_cuisine',
    confidence: 0.85,
    salience: 0.8,
    status: 'active',
  };

  const validResponse = {
    entries: [validEntry],
    audit: {
      mode: 'standard',
      latencyMs: 120,
      candidateCount: 5,
      resultCount: 1,
      qdrantUsed: true,
      postgresUsed: true,
      degraded: false,
      degradedReason: null,
      embeddingCacheHit: false,
    },
  };

  it('parses a valid fact entry + response', () => {
    expect(RecallBundleEntrySchema.parse(validEntry).resultType).toBe('fact');
    const r = InternalMemoryRecallBundleResponseSchema.parse(validResponse);
    expect(r.entries).toHaveLength(1);
    expect(r.audit.degraded).toBe(false);
  });

  it('parses a degraded empty response (audit-only)', () => {
    const r = InternalMemoryRecallBundleResponseSchema.parse({
      entries: [],
      audit: { ...validResponse.audit, degraded: true, degradedReason: 'embed_timeout', qdrantUsed: false, resultCount: 0, candidateCount: 0 },
    });
    expect(r.audit.degradedReason).toBe('embed_timeout');
  });

  it('rejects an entry with an unknown resultType', () => {
    expect(() =>
      RecallBundleEntrySchema.parse({ ...validEntry, resultType: 'rule' }),
    ).toThrow();
  });
});

describe('internalMemoryRecallBundleContract', () => {
  it('pins method, path, and auth type', () => {
    expect(INTERNAL_MEMORY_RECALL_BUNDLE_PATH).toBe('/internal/memory/recall/bundle');
    expect(internalMemoryRecallBundleContract.method).toBe('POST');
    expect(internalMemoryRecallBundleContract.path).toBe(INTERNAL_MEMORY_RECALL_BUNDLE_PATH);
    expect(internalMemoryRecallBundleContract.authType).toBe('secret');
  });
});
