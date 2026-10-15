import { describe, expect, it } from 'vitest';
import {
  PublishMaterialRequestSchema,
  PublishMaterialResponseSchema,
  ReadMaterialRequestSchema,
  ReadMaterialResponseSchema,
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
const publish = { context, sourceScope: 'team', slug: 'my-note', recipient, digest, contentRef: 'blob://x' };

describe('publish material', () => {
  it('round trip request and response', () => {
    expect(PublishMaterialRequestSchema.parse(publish)).toEqual(publish);
    const res = { status: 'published', ref };
    expect(PublishMaterialResponseSchema.parse(res)).toEqual(res);
  });
  it.each(['not_authorized', 'invalid_recipient'])('named error %s', (code) => {
    expect(PublishMaterialResponseSchema.safeParse({ status: 'error', code }).success).toBe(true);
  });
  it('rejects unknown error code', () => {
    expect(PublishMaterialResponseSchema.safeParse({ status: 'error', code: 'boom' }).success).toBe(false);
  });
  it('rejects tenantId from the caller', () => {
    expect(PublishMaterialRequestSchema.safeParse({ ...publish, tenantId: 't' }).success).toBe(false);
  });
  it('rejects private source without explicit', () => {
    expect(PublishMaterialRequestSchema.safeParse({ ...publish, sourceScope: 'private' }).success).toBe(false);
    expect(
      PublishMaterialRequestSchema.safeParse({ ...publish, sourceScope: 'private', explicit: true }).success,
    ).toBe(true);
  });
});

describe('read material', () => {
  it('round trip request and ok response', () => {
    expect(ReadMaterialRequestSchema.parse({ context, ref })).toEqual({ context, ref });
    const res = { status: 'ok', ref, digest };
    expect(ReadMaterialResponseSchema.parse(res)).toEqual(res);
  });
  it.each(['revoked', 'not_authorized', 'unknown_reference', 'version_superseded', 'digest_mismatch'])(
    'recognises outcome %s',
    (status) => {
      expect(ReadMaterialResponseSchema.parse({ status })).toEqual({ status });
    },
  );
  it('rejects unknown outcome and extra fields on request', () => {
    expect(ReadMaterialResponseSchema.safeParse({ status: 'gone' }).success).toBe(false);
    expect(ReadMaterialRequestSchema.safeParse({ context, ref, tenantId: 't' }).success).toBe(false);
  });
});
