import { describe, expect, it } from 'vitest';
import { CompanyMapEntrySchema } from '../../src/organization/company-map.js';

const base = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'good-choice',
  level: 'client',
  kind: 'referent',
  personRef: 'stefano',
  name: 'Stefano',
  role: 'Titolare',
  email: 'stefano@example.com',
  source: { kind: 'seed' },
  confirmedAt: '2026-10-22T10:00:00+02:00',
  version: 2,
  digest: 'a'.repeat(64),
};

const levels = {
  client: base,
  project: { ...base, level: 'project', projectId: 'sito' },
  business_unit: { ...base, level: 'business_unit', projectId: 'sito', buSlug: 'marketing' },
};

describe('CompanyMapEntrySchema', () => {
  for (const [level, entry] of Object.entries(levels)) {
    it(`accepts a ${level} entry from a seed`, () => {
      expect(CompanyMapEntrySchema.safeParse(entry).success).toBe(true);
    });
    it(`accepts a ${level} entry from a decision`, () => {
      const source = { kind: 'decision', requestId: 'req-123456', planVersion: 1 };
      expect(CompanyMapEntrySchema.safeParse({ ...entry, source, supersedes: 1 }).success).toBe(true);
    });
  }

  it('rejects client level with buSlug', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, buSlug: 'marketing' }).success).toBe(false);
  });

  it('rejects client level with projectId', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, projectId: 'sito' }).success).toBe(false);
  });

  it('rejects project level without projectId', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, level: 'project' }).success).toBe(false);
  });

  it('rejects project level with buSlug', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...levels.project, buSlug: 'marketing' }).success).toBe(false);
  });

  it('rejects business_unit level without projectId', () => {
    const { projectId: _projectId, ...entry } = levels.business_unit;
    expect(CompanyMapEntrySchema.safeParse(entry).success).toBe(false);
  });

  it('rejects business_unit level without buSlug', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...levels.project, level: 'business_unit' }).success).toBe(false);
  });

  it('rejects supersedes equal to version', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, supersedes: 2 }).success).toBe(false);
  });

  it('rejects a model source', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, source: { kind: 'model' } }).success).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, email: 'not-an-email' }).success).toBe(false);
  });

  it('rejects an extra key', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, extra: true }).success).toBe(false);
  });

  it('rejects a non-referent kind', () => {
    expect(CompanyMapEntrySchema.safeParse({ ...base, kind: 'other' }).success).toBe(false);
  });
});
