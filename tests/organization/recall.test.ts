import { describe, expect, it } from 'vitest';
import {
  OrganizationRecallContextSchema,
  OrganizationRecallReferenceSchema,
} from '../../src/organization/recall.js';

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
const ref = {
  context,
  sourceScope: 'team',
  slug: 'note-1',
  version: 1,
  digest: 'a'.repeat(64),
  recipient,
};
const reference = { ref, authorizedAt: '2026-10-14T10:30:00.000Z', bindingVersion: 2 };

describe('OrganizationRecallContextSchema', () => {
  it('accepts context + recipient', () => {
    expect(OrganizationRecallContextSchema.parse({ context, recipient })).toEqual({ context, recipient });
  });
  it('rejects extra fields (strict)', () => {
    expect(OrganizationRecallContextSchema.safeParse({ context, recipient, extra: 1 }).success).toBe(false);
  });
  it('rejects missing recipient', () => {
    expect(OrganizationRecallContextSchema.safeParse({ context }).success).toBe(false);
  });
});

describe('OrganizationRecallReferenceSchema', () => {
  it('accepts a complete reference', () => {
    expect(OrganizationRecallReferenceSchema.parse(reference)).toEqual(reference);
  });
  it('rejects missing bindingVersion', () => {
    const { bindingVersion: _b, ...rest } = reference;
    expect(OrganizationRecallReferenceSchema.safeParse(rest).success).toBe(false);
  });
  it('rejects non-positive bindingVersion', () => {
    expect(OrganizationRecallReferenceSchema.safeParse({ ...reference, bindingVersion: 0 }).success).toBe(false);
  });
  it('rejects non-ISO authorizedAt', () => {
    expect(OrganizationRecallReferenceSchema.safeParse({ ...reference, authorizedAt: 'yesterday' }).success).toBe(false);
  });
  it('rejects extra fields such as content (strict)', () => {
    expect(OrganizationRecallReferenceSchema.safeParse({ ...reference, contentNormalized: 'x' }).success).toBe(false);
  });
});
