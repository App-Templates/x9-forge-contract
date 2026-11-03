import { describe, expect, it } from 'vitest';
import {
  INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH,
  INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH,
  InternalMemoryKnowledgePublishRequestSchema,
  InternalMemoryKnowledgeWithdrawRequestSchema,
  InternalMemoryKnowledgeReceiptSchema,
  InternalMemoryKnowledgeErrorResponseSchema,
  internalMemoryKnowledgePublishContract,
  internalMemoryKnowledgeWithdrawContract,
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

describe('internal-memory-knowledge', () => {
  it('exposes fixed POST paths and schema bindings', () => {
    expect(INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH).toBe('/internal/memory/knowledge/publish');
    expect(INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH).toBe('/internal/memory/knowledge/withdraw');
    expect(internalMemoryKnowledgePublishContract.path).toBe(INTERNAL_MEMORY_KNOWLEDGE_PUBLISH_PATH);
    expect(internalMemoryKnowledgeWithdrawContract.path).toBe(INTERNAL_MEMORY_KNOWLEDGE_WITHDRAW_PATH);
    expect(internalMemoryKnowledgePublishContract.bodySchema).toBe(InternalMemoryKnowledgePublishRequestSchema);
    expect(internalMemoryKnowledgeWithdrawContract.bodySchema).toBe(InternalMemoryKnowledgeWithdrawRequestSchema);
    for (const contract of [internalMemoryKnowledgePublishContract, internalMemoryKnowledgeWithdrawContract]) {
      expect(contract.method).toBe('POST');
      expect(contract.responseSchema).toBe(InternalMemoryKnowledgeReceiptSchema);
    }
  });

  // Mutation probe: change publish authType from 'secret' to 'none'; this case must fail, then restore it.
  it('requires secret auth on both contracts', () => {
    expect(internalMemoryKnowledgePublishContract.authType).toBe('secret');
    expect(internalMemoryKnowledgeWithdrawContract.authType).toBe('secret');
  });

  it('accepts valid publish and withdraw requests', () => {
    expect(InternalMemoryKnowledgePublishRequestSchema.parse(publish)).toEqual(publish);
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.parse(withdraw)).toEqual(withdraw);
  });

  it('rejects extra fields and missing context on both requests', () => {
    expect(InternalMemoryKnowledgePublishRequestSchema.safeParse({ ...publish, extra: true }).success).toBe(false);
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.safeParse({ ...withdraw, extra: true }).success).toBe(false);
    expect(InternalMemoryKnowledgePublishRequestSchema.safeParse({ publication }).success).toBe(false);
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.safeParse({ ref, reason: withdraw.reason }).success).toBe(false);
  });

  it('rejects empty evidence and withdrawn publications without a reason', () => {
    for (const invalid of [{ ...publication, evidence: [] }, { ...publication, status: 'withdrawn' }]) {
      expect(InternalMemoryKnowledgePublishRequestSchema.safeParse({ context, publication: invalid }).success).toBe(false);
    }
    expect(InternalMemoryKnowledgePublishRequestSchema.safeParse({
      context, publication: { ...publication, status: 'withdrawn', reason: withdraw.reason },
    }).success).toBe(true);
  });

  it('rejects non-hexadecimal reference digests on both requests', () => {
    const invalidRef = { ...ref, digest: 'g'.repeat(64) };
    expect(InternalMemoryKnowledgePublishRequestSchema.safeParse({
      context, publication: { ...publication, ref: invalidRef },
    }).success).toBe(false);
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.safeParse({ ...withdraw, ref: invalidRef }).success).toBe(false);
  });

  it('requires a nonempty withdrawal reason', () => {
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.safeParse({ context, ref }).success).toBe(false);
    expect(InternalMemoryKnowledgeWithdrawRequestSchema.safeParse({ ...withdraw, reason: '' }).success).toBe(false);
  });

  it('accepts both receipt dispositions and rejects invalid receipt fields', () => {
    for (const disposition of ['stored', 'duplicate']) {
      expect(InternalMemoryKnowledgeReceiptSchema.safeParse({ ...receipt, disposition }).success).toBe(true);
    }
    for (const invalid of [
      { disposition: 'published' }, { slug: '' }, { slug: 'Invalid_slug' },
      { version: 0 }, { version: 1.5 }, { digest: 'g'.repeat(64) }, { digest: 'a' }, { extra: true },
    ]) {
      expect(InternalMemoryKnowledgeReceiptSchema.safeParse({ ...receipt, ...invalid }).success).toBe(false);
    }
  });

  it('accepts contractual errors and rejects unknown codes or invalid fields', () => {
    for (const code of ['invalid_publication', 'identity_uncertain', 'knowledge_conflict', 'supersedes_missing']) {
      expect(InternalMemoryKnowledgeErrorResponseSchema.safeParse({ status: 'error', code }).success).toBe(true);
      expect(InternalMemoryKnowledgeErrorResponseSchema.safeParse({ status: 'error', code, message: 'Invalid input' }).success).toBe(true);
    }
    const error = { status: 'error', code: 'invalid_publication' };
    for (const invalid of [{ code: 'unknown' }, { status: 'ok' }, { message: '' }, { extra: true }]) {
      expect(InternalMemoryKnowledgeErrorResponseSchema.safeParse({ ...error, ...invalid }).success).toBe(false);
    }
  });
});
