import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  INTERNAL_PUBLICATION_PUBLISH_PATH,
  INTERNAL_PUBLICATION_READ_PATH,
  internalPublicationPublishContract,
  internalPublicationReadContract,
} from '../../src/http/endpoints/index.js';
import {
  PublishMaterialRequestSchema,
  PublishMaterialResponseSchema,
  ReadMaterialRequestSchema,
  ReadMaterialResponseSchema,
} from '../../src/organization/publication-operations.js';

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
const publish = { context, sourceScope: 'team', slug: 'my-note', recipient, digest, contentRef: 'blob://x' };

describe('internal publication contracts', () => {
  it('uses exact paths, secret authentication and existing schemas', () => {
    expect(INTERNAL_PUBLICATION_PUBLISH_PATH).toBe('/internal/publications/publish');
    expect(INTERNAL_PUBLICATION_READ_PATH).toBe('/internal/publications/read');
    expect(internalPublicationPublishContract).toEqual({
      method: 'POST',
      path: INTERNAL_PUBLICATION_PUBLISH_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: PublishMaterialRequestSchema,
      responseSchema: PublishMaterialResponseSchema,
    });
    expect(internalPublicationReadContract).toEqual({
      method: 'POST',
      path: INTERNAL_PUBLICATION_READ_PATH,
      authType: 'secret',
      authHeader: INTERNAL_SECRET_HEADER,
      bodySchema: ReadMaterialRequestSchema,
      responseSchema: ReadMaterialResponseSchema,
    });
  });

  it('accepts valid requests and rejects extra fields on both requests', () => {
    expect(internalPublicationPublishContract.bodySchema.parse(publish)).toEqual(publish);
    expect(internalPublicationReadContract.bodySchema.parse({ context, ref })).toEqual({ context, ref });
    expect(internalPublicationPublishContract.bodySchema.safeParse({
      ...publish, tenantId: 'tenant-1',
    }).success).toBe(false);
    expect(internalPublicationReadContract.bodySchema.safeParse({
      context, ref, tenantId: 'tenant-1',
    }).success).toBe(false);
  });

  it('accepts successful responses and rejects unnamed outcomes and extra fields', () => {
    const published = { status: 'published', ref };
    const read = { status: 'ok', ref, digest };
    expect(internalPublicationPublishContract.responseSchema.parse(published)).toEqual(published);
    expect(internalPublicationReadContract.responseSchema.parse(read)).toEqual(read);
    expect(internalPublicationPublishContract.responseSchema.safeParse({
      ...published, status: 'accepted',
    }).success).toBe(false);
    expect(internalPublicationReadContract.responseSchema.safeParse({
      ...read, status: 'accepted',
    }).success).toBe(false);
    expect(internalPublicationPublishContract.responseSchema.safeParse({
      ...published, extra: true,
    }).success).toBe(false);
    expect(internalPublicationReadContract.responseSchema.safeParse({
      ...read, extra: true,
    }).success).toBe(false);
  });
});
