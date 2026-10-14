import { describe, expect, it } from 'vitest';
import {
  CompanyMemoryEntryRefSchema,
  CompanyMemoryScopeSchema,
} from '../../src/organization/company-memory.js';

const base = {
  context: {
    schemaVersion: 1,
    runId: 'run-1',
    organizationId: 'org-1',
    ownerId: 'owner-1',
    identity: { managementAgentId: 'agent-1', runtimeAgentId: 'runtime-1' },
    issuer: 'x9',
    issuedAt: '2026-10-14T10:00:00.000Z',
    expiresAt: '2026-10-14T11:00:00.000Z',
  },
  entryId: 'entry-1',
  ownerAgentId: 'agent-1',
};
const publication = { publicationSlug: 'publication-1' };

describe('CompanyMemoryEntryRefSchema', () => {
  it.each(['private', 'team'])('accepts %s memory without publication', (scope) => {
    const entry = { ...base, scope };
    expect(CompanyMemoryEntryRefSchema.parse(entry)).toEqual(entry);
  });

  it.each(['team', 'organization'])('accepts %s memory with publication', (scope) => {
    const entry = { ...base, scope, publishedFrom: publication };
    expect(CompanyMemoryEntryRefSchema.parse(entry)).toEqual(entry);
  });

  it('rejects organization memory without publication', () => {
    const result = CompanyMemoryEntryRefSchema.safeParse({ ...base, scope: 'organization' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        code: 'custom', path: ['publishedFrom', 'publicationSlug'],
      }));
    }
  });

  it('rejects private memory with publication', () => {
    const result = CompanyMemoryEntryRefSchema.safeParse({
      ...base, scope: 'private', publishedFrom: publication,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({
        code: 'custom', path: ['publishedFrom'],
      }));
    }
  });

  it('rejects unknown scope', () => {
    expect(CompanyMemoryScopeSchema.safeParse('public').success).toBe(false);
    expect(CompanyMemoryEntryRefSchema.safeParse({ ...base, scope: 'public' }).success).toBe(false);
  });

  it.each(['entryId', 'ownerAgentId'])('rejects empty or missing %s', (field) => {
    for (const value of ['', undefined]) {
      expect(CompanyMemoryEntryRefSchema.safeParse({
        ...base, scope: 'team', [field]: value,
      }).success).toBe(false);
    }
  });

  it.each([{}, { publicationSlug: '' }, { publicationSlug: 'p', extra: true }])(
    'rejects invalid publication reference %j', (publishedFrom) => {
      expect(CompanyMemoryEntryRefSchema.safeParse({
        ...base, scope: 'organization', publishedFrom,
      }).success).toBe(false);
    },
  );

  it('rejects extra fields', () => {
    expect(CompanyMemoryEntryRefSchema.safeParse({
      ...base, scope: 'team', extra: true,
    }).success).toBe(false);
  });

  it('requires a valid run context', () => {
    for (const context of [undefined, {
      ...base.context, expiresAt: base.context.issuedAt,
    }]) {
      expect(CompanyMemoryEntryRefSchema.safeParse({
        ...base, scope: 'team', context,
      }).success).toBe(false);
    }
  });
});
