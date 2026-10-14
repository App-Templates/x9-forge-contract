import { describe, it, expect } from 'vitest';
import { OrganizationRunContextSchema } from '../../src/organization/run-context.js';

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

describe('OrganizationRunContextSchema', () => {
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
