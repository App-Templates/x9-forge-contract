import { describe, expect, it } from 'vitest';
import {
  isResolveMaterialResponseForRequest,
  ResolveMaterialRequestSchema,
  ResolveMaterialResponseSchema,
} from '../../src/organization/index.js';

const context = {
  schemaVersion: 1,
  runId: 'producer-run',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1', vaultAgentId: 1 },
  personRef: 'person-1',
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
const ref = {
  context,
  sourceScope: 'team',
  slug: 'experience-report',
  version: 7,
  digest: 'a'.repeat(64),
  recipient: { kind: 'organization', id: 'org-1' },
  explicit: true,
};
const request = {
  context: {
    ...context,
    runId: 'reader-run',
    ownerId: 'reader-owner',
    personRef: 'reader-person',
    identity: { managementAgentId: 'reader-agent', runtimeAgentId: 'reader-runtime', vaultAgentId: 2 },
  },
  ref,
};
const response = {
  status: 'ok', ref, digest: ref.digest,
  content: { mediaType: 'text/plain', text: 'Published experience report' },
  contentDigest: 'service-validated-content-digest',
};

// Mutation failures observed: 0/4; execution deferred to the lane runner.
// Disable ref equality, digest equality, status guard, and parsing in turn.
// Mismatch, digest, refusal, and invalid-input cases must fail; restore each change.
describe('isResolveMaterialResponseForRequest', () => {
  it('accepts a different reader context and schema-valid content digest', () => {
    expect(ResolveMaterialRequestSchema.safeParse(request).success).toBe(true);
    expect(ResolveMaterialResponseSchema.safeParse(response).success).toBe(true);
    expect(isResolveMaterialResponseForRequest(response, request)).toBe(true);
  });

  it('accepts empty text', () => {
    expect(isResolveMaterialResponseForRequest({
      ...response, content: { ...response.content, text: '' },
    }, request)).toBe(true);
  });

  it('compares parsed references independently of nested input key order', () => {
    const reordered = {
      ...Object.fromEntries(Object.entries(ref).reverse()),
      context: {
        ...Object.fromEntries(Object.entries(context).reverse()),
        identity: { vaultAgentId: 1, runtimeAgentId: 'runtime-1', managementAgentId: 'agent-1' },
      },
      recipient: { id: 'org-1', kind: 'organization' },
    };
    expect(ResolveMaterialResponseSchema.safeParse({ ...response, ref: reordered }).success).toBe(true);
    expect(isResolveMaterialResponseForRequest({ ...response, ref: reordered }, request)).toBe(true);
    expect(isResolveMaterialResponseForRequest(response, { ...request, ref: reordered })).toBe(true);
  });

  it.each([
    ['slug', { slug: 'other-report' }],
    ['version', { version: 8 }],
    ['digest', { digest: 'b'.repeat(64) }],
    ['recipient.kind', { recipient: { ...ref.recipient, kind: 'group' } }],
    ['recipient.id', { recipient: { ...ref.recipient, id: 'org-2' } }],
    ['ownerId', { context: { ...context, ownerId: 'owner-2' } }],
    ['personRef', { context: { ...context, personRef: 'person-2' } }],
    ['runtimeAgentId', {
      context: { ...context, identity: { ...context.identity, runtimeAgentId: 'runtime-2' } },
    }],
    ['sourceScope', { sourceScope: 'organization' }],
    ['explicit', { explicit: false }],
    ['runId', { context: { ...context, runId: 'another-run' } }],
    ['organizationId', { context: { ...context, organizationId: 'org-2' } }],
  ])('rejects reference mismatch in %s', (_field, change) => {
    const other = { ...response, ref: { ...ref, ...change } };
    expect(ResolveMaterialResponseSchema.safeParse(other).success).toBe(true);
    expect(isResolveMaterialResponseForRequest(other, request)).toBe(false);
  });

  it('rejects response digest differing from requested reference digest', () => {
    const other = { ...response, digest: 'b'.repeat(64) };
    expect(ResolveMaterialResponseSchema.safeParse(other).success).toBe(true);
    expect(isResolveMaterialResponseForRequest(other, request)).toBe(false);
  });

  it.each([
    'revoked', 'not_authorized', 'unknown_reference', 'version_superseded', 'digest_mismatch',
  ])('rejects refusal %s', (status) => {
    const refusal = { status, message: 'Service refused resolution' };
    expect(ResolveMaterialResponseSchema.safeParse(refusal).success).toBe(true);
    expect(isResolveMaterialResponseForRequest(refusal, request)).toBe(false);
  });

  it('rejects schema-valid revoked resolution without success fields', () => {
    const revoked = { status: 'revoked', message: 'Service refused resolution' };
    expect(ResolveMaterialRequestSchema.safeParse(request).success).toBe(true);
    expect(ResolveMaterialResponseSchema.parse(revoked)).toEqual(revoked);
    // A refusal carrying success fields is not an alternative valid response.
    expect(ResolveMaterialResponseSchema.safeParse({
      ...response, ...revoked,
    }).success).toBe(false);
    expect(isResolveMaterialResponseForRequest(response, request)).toBe(true);
    expect(isResolveMaterialResponseForRequest(revoked, request)).toBe(false);
  });

  it.each([
    null,
    {},
    { ...response, content: undefined },
    { ...response, content: { ...response.content, mediaType: 'text/html' } },
    { ...response, contentDigest: '' },
    { ...response, extra: true },
    { ...response, ref: { ...ref, extra: true } },
    { ...response, content: { ...response.content, extra: true } },
  ])('rejects invalid response %#', (raw) => {
    expect(ResolveMaterialResponseSchema.safeParse(raw).success).toBe(false);
    expect(isResolveMaterialResponseForRequest(raw, request)).toBe(false);
  });

  it.each([
    null,
    {},
    { ...request, extra: true },
    { ...request, context: { ...request.context, ownerId: '' } },
    { ...request, ref: { ...ref, version: 0 } },
    { ...request, ref: { ...ref, extra: true } },
  ])('rejects invalid expected request %#', (expected) => {
    expect(ResolveMaterialRequestSchema.safeParse(expected).success).toBe(false);
    expect(isResolveMaterialResponseForRequest(response, expected)).toBe(false);
  });
});
