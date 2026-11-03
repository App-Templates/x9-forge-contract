import { describe, expect, it } from 'vitest';
import {
  InternalMemoryKnowledgePublishRequestSchema,
  InternalMemoryKnowledgeWithdrawRequestSchema,
  InternalMemoryKnowledgeReceiptSchema,
  isKnowledgePublishReceiptForRequest,
  isKnowledgeWithdrawReceiptForRequest,
} from '../../../src/http/endpoints/internal-memory-knowledge.js';

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
const ref = {
  context,
  sourceScope: 'team',
  slug: 'refund-procedure',
  version: 2,
  digest: 'a'.repeat(64),
  recipient: { kind: 'organization', id: 'org-1' },
};
const publication = {
  ref,
  kind: 'procedure',
  status: 'current',
  evidence: [{ kind: 'run_receipt', id: 'receipt-1', digest: 'b'.repeat(64) }],
  supersedes: 1,
  validFrom: '2026-10-15T08:00:00.000Z',
};
const publish = { context, publication };
const withdraw = { context, ref, reason: 'Incorrect procedure' };
const receipt = { slug: ref.slug, version: ref.version, digest: ref.digest, disposition: 'stored' };

describe.each([
  { name: 'publish', correlate: isKnowledgePublishReceiptForRequest, request: publish,
    schema: InternalMemoryKnowledgePublishRequestSchema, other: withdraw },
  { name: 'withdraw', correlate: isKnowledgeWithdrawReceiptForRequest, request: withdraw,
    schema: InternalMemoryKnowledgeWithdrawRequestSchema, other: publish },
])('$name receipt correlation', ({ correlate, request, schema, other }) => {
  it.each(['stored', 'duplicate'])('accepts matching %s receipt', (disposition) => {
    expect(schema.safeParse(request).success).toBe(true);
    expect(correlate({ ...receipt, disposition }, request)).toBe(true);
  });

  // Mutation probes: remove each corresponding comparison independently.
  it.each([
    { field: 'slug', change: { slug: 'other-procedure' } },
    { field: 'version', change: { version: 3 } },
    { field: 'digest', change: { digest: 'c'.repeat(64) } },
  ])('rejects mismatched $field', ({ change }) => {
    const mismatched = { ...receipt, ...change };
    expect(InternalMemoryKnowledgeReceiptSchema.safeParse(mismatched).success).toBe(true);
    expect(correlate(mismatched, request)).toBe(false);
  });

  it('rejects invalid raw and expected without throwing', () => {
    for (const invalid of [undefined, null, false, 42, 'invalid', [], {}]) {
      expect(correlate(invalid, request)).toBe(false);
      expect(correlate(receipt, invalid)).toBe(false);
    }
    for (const change of [{ disposition: 'published' }, { version: 0 }, { digest: 'g'.repeat(64) }]) {
      expect(correlate({ ...receipt, ...change }, request)).toBe(false);
    }
    expect(correlate(receipt, { ...request, context: { ...context, ownerId: '' } })).toBe(false);
  });

  // Mutation probes: bypass receipt/request validation independently.
  it('rejects extra field in receipt or expected payload', () => {
    expect(correlate({ ...receipt, extra: true }, request)).toBe(false);
    expect(correlate(receipt, { ...request, extra: true })).toBe(false);
    expect(correlate(receipt, { ...request, context: { ...context, extra: true } })).toBe(false);
  });

  it('rejects the other operation request', () => {
    expect(correlate(receipt, other)).toBe(false);
  });
});

it('rejects invalid publication evidence and withdrawal reason', () => {
  expect(isKnowledgePublishReceiptForRequest(receipt, {
    ...publish, publication: { ...publication, evidence: [] },
  })).toBe(false);
  expect(isKnowledgePublishReceiptForRequest(receipt, {
    ...publish, publication: { ...publication, extra: true },
  })).toBe(false);
  expect(isKnowledgeWithdrawReceiptForRequest(receipt, { ...withdraw, reason: '' })).toBe(false);
  expect(isKnowledgeWithdrawReceiptForRequest(receipt, {
    ...withdraw, ref: { ...ref, extra: true },
  })).toBe(false);
});
