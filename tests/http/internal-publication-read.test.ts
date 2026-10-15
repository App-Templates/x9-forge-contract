import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  INTERNAL_PUBLICATION_RESOLVE_PATH,
  internalPublicationResolveContract,
  INTERNAL_PUBLICATION_LIST_PATH,
  INTERNAL_PUBLICATION_WITHDRAW_PATH,
  internalPublicationListContract,
  internalPublicationWithdrawContract,
} from '../../src/http/endpoints/index.js';
import {
  ListPublicationsRequestSchema,
  ListPublicationsResponseSchema,
  WithdrawPublicationRequestSchema,
  WithdrawPublicationResponseSchema,
} from '../../src/organization/publication-lookup.js';

import {
  ResolveMaterialRequestSchema,
  ResolveMaterialResponseSchema,
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
const withdrawn = { status: 'withdrawn', ref, withdrawnAt: '2026-10-14T10:30:00.000Z' };
const listed = { items: [ref], nextCursor: null };

describe('internal publication withdraw and list contracts', () => {
  it('uses exact paths, secret authentication and existing schemas', () => {
    expect(INTERNAL_PUBLICATION_WITHDRAW_PATH).toBe('/internal/publications/withdraw');
    expect(INTERNAL_PUBLICATION_LIST_PATH).toBe('/internal/publications/list');
    expect(internalPublicationWithdrawContract).toEqual({
      method: 'POST',
      path: INTERNAL_PUBLICATION_WITHDRAW_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: WithdrawPublicationRequestSchema,
      responseSchema: WithdrawPublicationResponseSchema,
    });
    expect(internalPublicationListContract).toEqual({
      method: 'POST',
      path: INTERNAL_PUBLICATION_LIST_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: ListPublicationsRequestSchema,
      responseSchema: ListPublicationsResponseSchema,
    });
  });

  it('accepts valid requests and rejects extra fields', () => {
    const list = { context, recipient };
    expect(internalPublicationWithdrawContract.bodySchema.parse({ context, ref })).toEqual({ context, ref });
    expect(internalPublicationListContract.bodySchema.parse(list)).toEqual(list);
    expect(internalPublicationWithdrawContract.bodySchema.safeParse({
      context, ref, tenantId: 'tenant-1',
    }).success).toBe(false);
    expect(internalPublicationListContract.bodySchema.safeParse({
      ...list, tenantId: 'tenant-1',
    }).success).toBe(false);
  });

  it('accepts receipts and rejects a receipt without withdrawnAt or with extra fields', () => {
    expect(internalPublicationWithdrawContract.responseSchema.parse(withdrawn)).toEqual(withdrawn);
    expect(internalPublicationListContract.responseSchema.parse(listed)).toEqual(listed);
    const { withdrawnAt: _omitted, ...noTimestamp } = withdrawn;
    expect(internalPublicationWithdrawContract.responseSchema.safeParse(noTimestamp).success).toBe(false);
    expect(internalPublicationWithdrawContract.responseSchema.safeParse({
      ...withdrawn, extra: true,
    }).success).toBe(false);
    expect(internalPublicationListContract.responseSchema.safeParse({
      ...listed, extra: true,
    }).success).toBe(false);
  });
});

describe('internal publication resolve contract', () => {
  it('exports the resolve path and uses secret authentication with canonical schemas', () => {
    expect(INTERNAL_PUBLICATION_RESOLVE_PATH).toBe('/internal/publication/resolve');
    expect(internalPublicationResolveContract).toEqual({
      method: 'POST',
      path: INTERNAL_PUBLICATION_RESOLVE_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: ResolveMaterialRequestSchema,
      responseSchema: ResolveMaterialResponseSchema,
    });
    expect(internalPublicationResolveContract.bodySchema.parse({ context, ref })).toEqual({ context, ref });
    const response = {
      status: 'ok', ref, digest,
      content: { mediaType: 'text/plain', text: 'Published knowledge' },
      contentDigest: digest,
    };
    expect(internalPublicationResolveContract.responseSchema.parse(response)).toEqual(response);
    expect(internalPublicationResolveContract.responseSchema.safeParse({ status: 'ok', ref, digest }).success).toBe(false);
  });
});
