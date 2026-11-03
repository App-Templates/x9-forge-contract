import { describe, expect, it } from 'vitest';
import {
  LIST_PUBLICATIONS_MAX_LIMIT,
  ListPublicationsRequestSchema,
  ListPublicationsResponseSchema,
  WithdrawPublicationRequestSchema,
  WithdrawPublicationResponseSchema,
} from '../../src/organization/index.js';

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
const digest = 'a'.repeat(64);
const recipient = { kind: 'organization', id: 'org-1' };
const ref = { context, sourceScope: 'team', slug: 'my-note', version: 1, digest, recipient };

describe('withdraw publication', () => {
  it('round trip request and receipt', () => {
    expect(WithdrawPublicationRequestSchema.parse({ context, ref })).toEqual({ context, ref });
    const receipt = { status: 'withdrawn', ref, withdrawnAt: '2026-10-15T08:00:00.000Z' };
    expect(WithdrawPublicationResponseSchema.parse(receipt)).toEqual(receipt);
  });
  it('same receipt parses twice (idempotent shape)', () => {
    const receipt = { status: 'withdrawn', ref, withdrawnAt: '2026-10-15T08:00:00.000Z' };
    expect(WithdrawPublicationResponseSchema.parse(receipt)).toEqual(
      WithdrawPublicationResponseSchema.parse(receipt),
    );
  });
  it.each(['not_authorized', 'unknown_reference'])('refusal %s', (status) => {
    expect(WithdrawPublicationResponseSchema.parse({ status })).toEqual({ status });
  });
  it('rejects receipt without withdrawnAt', () => {
    expect(WithdrawPublicationResponseSchema.safeParse({ status: 'withdrawn', ref }).success).toBe(false);
  });
  it('rejects extra fields (tenantId) on request', () => {
    expect(WithdrawPublicationRequestSchema.safeParse({ context, ref, tenantId: 't' }).success).toBe(false);
  });
});

describe('list publications', () => {
  it('round trip request and response', () => {
    const req = { context, recipient, cursor: 'c1', limit: 20 };
    expect(ListPublicationsRequestSchema.parse(req)).toEqual(req);
    const res = { items: [ref], nextCursor: null };
    expect(ListPublicationsResponseSchema.parse(res)).toEqual(res);
  });
  it('rejects limit above the maximum', () => {
    const over = { context, recipient, limit: LIST_PUBLICATIONS_MAX_LIMIT + 1 };
    expect(ListPublicationsRequestSchema.safeParse(over).success).toBe(false);
    expect(
      ListPublicationsRequestSchema.safeParse({ ...over, limit: LIST_PUBLICATIONS_MAX_LIMIT }).success,
    ).toBe(true);
  });
  it('rejects extra fields on request and response', () => {
    expect(ListPublicationsRequestSchema.safeParse({ context, recipient, tenantId: 't' }).success).toBe(false);
    expect(
      ListPublicationsResponseSchema.safeParse({ items: [], nextCursor: null, total: 0 }).success,
    ).toBe(false);
  });
});
