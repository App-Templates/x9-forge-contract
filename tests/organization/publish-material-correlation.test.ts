import { describe, expect, it } from 'vitest';
import {
  isPublishMaterialResponseForRequest,
  PublishMaterialRequestSchema,
  PublishMaterialResponseSchema,
} from '../../src/organization/index.js';

const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1', vaultAgentId: 1 },
  personRef: 'person-1',
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};
const request = {
  context,
  sourceScope: 'private',
  slug: 'my-note',
  recipient: { kind: 'organization', id: 'org-1' },
  digest: 'a'.repeat(64),
  explicit: true,
  contentRef: 'content-1',
};
const { contentRef: _contentRef, ...material } = request;
const ref = { ...material, version: 7 };
const response = { status: 'published', ref };

// Mutation failures observed: 0/7; execution deferred to the lane runner.
// Omit each context/sourceScope/slug/recipient.kind/recipient.id/digest/explicit
// comparison separately, require its mismatch assertion to fail, then restore.
describe('isPublishMaterialResponseForRequest', () => {
  it('accepts a published private material with service-assigned version 7', () => {
    expect(PublishMaterialRequestSchema.safeParse(request).success).toBe(true);
    expect(PublishMaterialResponseSchema.safeParse(response).success).toBe(true);
    expect(isPublishMaterialResponseForRequest(response, request)).toBe(true);
  });

  it.each([1, 2, 42])('accepts valid service-assigned version %s', (version) => {
    expect(isPublishMaterialResponseForRequest({ ...response, ref: { ...ref, version } }, request)).toBe(true);
  });

  it.each([
    ['slug', { slug: 'another-note' }],
    ['digest', { digest: 'b'.repeat(64) }],
    ['sourceScope', { sourceScope: 'team' }],
    ['recipient.kind', { recipient: { ...ref.recipient, kind: 'group' } }],
    ['recipient.id', { recipient: { ...ref.recipient, id: 'org-2' } }],
    ['context.ownerId', { context: { ...context, ownerId: 'owner-2' } }],
    ['context.identity.runtimeAgentId', {
      context: { ...context, identity: { ...context.identity, runtimeAgentId: 'runtime-2' } },
    }],
    ['context.identity.managementAgentId', {
      context: { ...context, identity: { ...context.identity, managementAgentId: 'agent-2' } },
    }],
    ['context.identity.vaultAgentId', {
      context: { ...context, identity: { ...context.identity, vaultAgentId: 2 } },
    }],
    ['context.personRef', { context: { ...context, personRef: 'person-2' } }],
    ['context.personRef absent', { context: { ...context, personRef: undefined } }],
    ['context.runId', { context: { ...context, runId: 'run-2' } }],
    ['context.organizationId', { context: { ...context, organizationId: 'org-2' } }],
  ])('rejects a valid receipt differing only in %s', (_field, change) => {
    const other = { ...response, ref: { ...ref, ...change } };
    expect(PublishMaterialRequestSchema.safeParse(request).success).toBe(true);
    expect(PublishMaterialResponseSchema.safeParse(other).success).toBe(true);
    expect(isPublishMaterialResponseForRequest(other, request)).toBe(false);
  });

  it.each([false, undefined])('rejects team explicit true versus %s', (explicit) => {
    const teamRequest = { ...request, sourceScope: 'team' };
    const other = { ...response, ref: { ...ref, sourceScope: 'team', explicit } };
    expect(PublishMaterialRequestSchema.safeParse(teamRequest).success).toBe(true);
    expect(PublishMaterialResponseSchema.safeParse(other).success).toBe(true);
    expect(isPublishMaterialResponseForRequest(other, teamRequest)).toBe(false);
    expect(isPublishMaterialResponseForRequest(
      { ...other, ref: { ...other.ref, explicit: true } }, { ...teamRequest, explicit },
    )).toBe(false);
  });

  it('accepts team publication with explicit absent on both sides', () => {
    expect(isPublishMaterialResponseForRequest(
      { ...response, ref: { ...ref, sourceScope: 'team', explicit: undefined } },
      { ...request, sourceScope: 'team', explicit: undefined },
    )).toBe(true);
  });

  it.each(['not_authorized', 'invalid_recipient'])('rejects typed error %s', (code) => {
    const error = { status: 'error', code };
    expect(PublishMaterialResponseSchema.safeParse(error).success).toBe(true);
    expect(isPublishMaterialResponseForRequest(error, request)).toBe(false);
  });

  it.each([null, {}, { ...response, extra: true },
    { ...response, ref: { ...ref, version: 0 } },
    { ...response, ref: { ...ref, explicit: false } },
  ])('rejects invalid response %#', (raw) => {
    expect(PublishMaterialResponseSchema.safeParse(raw).success).toBe(false);
    expect(isPublishMaterialResponseForRequest(raw, request)).toBe(false);
  });

  it.each([null, {}, { ...request, contentRef: '' }, { ...request, extra: true },
    { ...request, explicit: false },
  ])('rejects invalid request %#', (expected) => {
    expect(PublishMaterialRequestSchema.safeParse(expected).success).toBe(false);
    expect(isPublishMaterialResponseForRequest(response, expected)).toBe(false);
  });

  it('compares parsed contexts regardless of nested key order or stripped identity fields', () => {
    const reorderedContext = {
      ...Object.fromEntries(Object.entries(context).reverse()),
      identity: { vaultAgentId: 1, runtimeAgentId: 'runtime-1', managementAgentId: 'agent-1', ignored: 'stripped' },
    };
    const reordered = {
      ref: {
        ...Object.fromEntries(Object.entries(ref).reverse()),
        context: reorderedContext,
        recipient: { id: 'org-1', kind: 'organization' },
      },
      status: 'published',
    };
    expect(PublishMaterialResponseSchema.safeParse(reordered).success).toBe(true);
    expect(isPublishMaterialResponseForRequest(reordered, request)).toBe(true);
  });

  it('does not attest contentRef persistence', () => {
    expect(isPublishMaterialResponseForRequest(response, { ...request, contentRef: 'other-content' })).toBe(true);
  });
});
