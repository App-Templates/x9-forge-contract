import { describe, expect, it } from 'vitest';
import {
  InternalMemoryRecallBundleRequestSchema,
  InternalMemoryRecallBundleResponseSchema,
} from '../../src/http/endpoints/internal-memory-recall-bundle.js';

const base = { tenantId: 't', ownerId: 'o', agentId: 'a', query: 'q' };
const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
const recipient = { kind: 'organization', id: 'org-1' };
const reference = {
  ref: { context, sourceScope: 'team', slug: 'note-1', version: 1, digest: 'a'.repeat(64), recipient },
  authorizedAt: '2026-10-14T10:30:00.000Z',
  bindingVersion: 1,
};
const audit = {
  mode: 'standard', latencyMs: 1, candidateCount: 0, resultCount: 0, qdrantUsed: false,
  postgresUsed: false, degraded: false, degradedReason: null, embeddingCacheHit: false,
};

describe('recall bundle request', () => {
  it('still accepts an old request without organization', () => {
    const r = InternalMemoryRecallBundleRequestSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.organization).toBeUndefined();
  });
  it('accepts a request with organization', () => {
    expect(InternalMemoryRecallBundleRequestSchema.safeParse({ ...base, organization: { context, recipient } }).success).toBe(true);
  });
  it('rejects organization with an extra field', () => {
    expect(InternalMemoryRecallBundleRequestSchema.safeParse({ ...base, organization: { context, recipient, x: 1 } }).success).toBe(false);
  });
});

describe('recall bundle response', () => {
  it('accepts a response without organizationReferences', () => {
    expect(InternalMemoryRecallBundleResponseSchema.safeParse({ entries: [], audit }).success).toBe(true);
  });
  it('accepts references up to 50', () => {
    const organizationReferences = Array.from({ length: 50 }, () => reference);
    expect(InternalMemoryRecallBundleResponseSchema.safeParse({ entries: [], audit, organizationReferences }).success).toBe(true);
  });
  it('rejects more than 50 references', () => {
    const organizationReferences = Array.from({ length: 51 }, () => reference);
    expect(InternalMemoryRecallBundleResponseSchema.safeParse({ entries: [], audit, organizationReferences }).success).toBe(false);
  });
  it('rejects a reference without bindingVersion', () => {
    const { bindingVersion: _b, ...rest } = reference;
    expect(InternalMemoryRecallBundleResponseSchema.safeParse({ entries: [], audit, organizationReferences: [rest] }).success).toBe(false);
  });
});
