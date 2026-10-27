import { describe, expect, it } from 'vitest';
import {
  COMPANY_MAP_CONFIRM_OPTIONS,
  CompanyMapConfirmTargetSchema,
  CompanyMapEntrySchema,
  companyMapConfirmationSubject,
} from '../../src/organization/company-map.js';
import { DecisionRequestOptionSchema, DecisionSubjectSchema } from '../../src/organization/decision-request.js';

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

describe('company map confirmation', () => {
  it('creates a stable confirmation subject from the exact digest and entry version', () => {
    const digest = '0123456789abcdef'.repeat(4);
    const entry = CompanyMapEntrySchema.parse({ ...base, digest });
    const subject = companyMapConfirmationSubject(entry);
    expect(subject).toEqual({
      kind: 'confirmation',
      planId: `map-${digest.slice(0, 40)}`,
      planVersion: entry.version,
      digest,
    });
    expect(subject.planId).toHaveLength(44);
    expect(DecisionSubjectSchema.parse(subject)).toEqual(subject);
    const next = companyMapConfirmationSubject({ ...entry, version: 3 });
    expect(next.planId).toBe(subject.planId);
    expect(next.planVersion).toBe(3);
  });

  it('validates the generated subject instead of returning invalid version fields', () => {
    const entry = CompanyMapEntrySchema.parse(base);
    expect(() => companyMapConfirmationSubject({ ...entry, version: 0 })).toThrow();
    expect(() => companyMapConfirmationSubject({ ...entry, digest: 'invalid' })).toThrow();
  });

  it('offers confermo before e-cambiato with the existing labels', () => {
    expect(COMPANY_MAP_CONFIRM_OPTIONS).toEqual([
      { optionId: 'confermo', label: 'Confermo' },
      { optionId: 'e-cambiato', label: 'È cambiato' },
    ]);
    for (const option of COMPANY_MAP_CONFIRM_OPTIONS) {
      expect(DecisionRequestOptionSchema.parse(option)).toEqual(option);
    }
  });
});

describe('CompanyMapConfirmTargetSchema', () => {
  const target = { level: 'client', kind: 'referent', entryRef: 'stefano' };

  it.each([
    target,
    { ...target, level: 'project', projectId: 'sito' },
    { ...target, level: 'business_unit', projectId: 'sito', buSlug: 'marketing' },
  ])('accepts a target at $level level', (value) => {
    expect(CompanyMapConfirmTargetSchema.parse(value)).toEqual(value);
  });

  it.each([
    { ...target, level: 'business_unit', projectId: 'sito' },
    { ...target, level: 'business_unit', buSlug: 'marketing' },
    { ...target, projectId: 'sito' },
    { ...target, buSlug: 'marketing' },
    { ...target, level: 'project' },
    { ...target, level: 'project', projectId: 'sito', buSlug: 'marketing' },
  ])('rejects inconsistent level scope: %j', (value) => {
    expect(CompanyMapConfirmTargetSchema.safeParse(value).success).toBe(false);
  });

  it('rejects an extra key', () => {
    expect(CompanyMapConfirmTargetSchema.safeParse({ ...target, extra: true }).success).toBe(false);
  });

  it.each([
    { ...target, entryRef: '' },
    { ...target, entryRef: 'a'.repeat(201) },
    { ...target, level: 'other' },
    { ...target, kind: 'other' },
    { ...target, level: 'project', projectId: '' },
    { ...target, level: 'project', projectId: 'a'.repeat(65) },
    { ...target, level: 'business_unit', projectId: 'sito', buSlug: '' },
    { ...target, level: 'business_unit', projectId: 'sito', buSlug: 'a'.repeat(31) },
    { ...target, level: 'business_unit', projectId: 'sito', buSlug: 'Not a slug' },
  ])('rejects invalid target fields: %j', (value) => {
    expect(CompanyMapConfirmTargetSchema.safeParse(value).success).toBe(false);
  });
});
