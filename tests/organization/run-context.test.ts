import { describe, it, expect } from 'vitest';
import { OrganizationRunContextSchema } from '../../src/organization/run-context.js';
import { ReadMaterialRequestSchema } from '../../src/organization/publication-operations.js';
import { OrganizationRecallContextSchema } from '../../src/organization/recall.js';

const valid = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9', vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-10-14T10:00:00.000Z',
  expiresAt: '2026-10-14T11:00:00.000Z',
};

const validWithPerson = { ...valid, personRef: 'person-1' };
const recipient = { kind: 'organization', id: 'org-1' };

describe('OrganizationRunContextSchema', () => {
  it('preserves the attested personRef', () => {
    expect(OrganizationRunContextSchema.parse(validWithPerson).personRef).toBe('person-1');
  });

  // Mutation probe: removing personRef.min(1) must make this test fail.
  it('rejects an empty personRef', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, personRef: '' }).success).toBe(false);
  });

  it('rejects a non-string personRef', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, personRef: 42 }).success).toBe(false);
  });

  it('accepts a context without personRef', () => {
    expect(OrganizationRunContextSchema.parse(valid)).toEqual(valid);
  });

  it('preserves personRef in recall context', () => {
    const parsed = OrganizationRecallContextSchema.parse({ context: validWithPerson, recipient });
    expect(parsed.context.personRef).toBe('person-1');
  });

  it('preserves personRef in a read material request', () => {
    const parsed = ReadMaterialRequestSchema.parse({
      context: validWithPerson,
      ref: {
        context: validWithPerson,
        sourceScope: 'team',
        slug: 'note-1',
        version: 1,
        digest: 'a'.repeat(64),
        recipient,
      },
    });
    expect(parsed.context.personRef).toBe('person-1');
    expect(parsed.ref.context.personRef).toBe('person-1');
  });

  it('accepts a valid context', () => {
    expect(OrganizationRunContextSchema.safeParse(valid).success).toBe(true);
  });

  it('accepts every issuer in the list', () => {
    for (const issuer of ['x9', 'forge', 'paperclip']) {
      expect(OrganizationRunContextSchema.safeParse({ ...valid, issuer }).success).toBe(true);
    }
  });

  it.each(Object.keys(valid))('rejects a context missing %s', (field) => {
    const { [field]: _omitted, ...rest } = valid as Record<string, unknown>;
    expect(OrganizationRunContextSchema.safeParse(rest).success).toBe(false);
  });

  it('rejects an extra field', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, token: 'secret' }).success).toBe(false);
  });

  it('rejects an issuer outside the list', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, issuer: 'storefront' }).success).toBe(false);
  });

  it('rejects expiresAt equal to issuedAt', () => {
    const r = OrganizationRunContextSchema.safeParse({ ...valid, expiresAt: valid.issuedAt });
    expect(r.success).toBe(false);
  });

  it('rejects expiresAt before issuedAt', () => {
    const r = OrganizationRunContextSchema.safeParse({ ...valid, expiresAt: '2026-10-14T09:00:00.000Z' });
    expect(r.success).toBe(false);
  });

  it('rejects a non-ISO datetime', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, issuedAt: 'yesterday' }).success).toBe(false);
  });

  it('rejects schemaVersion 2', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, schemaVersion: 2 }).success).toBe(false);
  });

  it('rejects an empty runId', () => {
    expect(OrganizationRunContextSchema.safeParse({ ...valid, runId: '' }).success).toBe(false);
  });

  it('rejects an identity without runtimeAgentId', () => {
    const identity = { managementAgentId: 'x9' };
    expect(OrganizationRunContextSchema.safeParse({ ...valid, identity }).success).toBe(false);
  });
});
