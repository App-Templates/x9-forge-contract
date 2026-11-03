import { describe, expect, it } from 'vitest';
import {
  CompanyMapAccessEntrySchema,
  CompanyMapAnyEntrySchema,
  CompanyMapAssetEntrySchema,
  CompanyMapEntrySchema,
  CompanyMapPersonEntrySchema,
  CompanyMapResponsibilityEntrySchema,
  companyMapEntryKey,
} from '../../src/organization/company-map.js';
import { AssetTypeSchema } from '../../src/organization/asset.js';

const common = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'good-choice',
  level: 'client',
  source: { kind: 'seed' },
  confirmedAt: '2026-10-23T10:00:00+02:00',
  version: 2,
  digest: 'a'.repeat(64),
};

const referent = { ...common, kind: 'referent', personRef: 'stefano', name: 'Stefano', role: 'Titolare', email: 'stefano@example.com' };
const person = { ...common, kind: 'person', personRef: 'giulia', name: 'Giulia', role: 'Marketing' };
const responsibility = { ...common, kind: 'responsibility', personRef: 'giulia', responsibility: 'Approva i testi del sito' };
const asset = {
  ...common,
  level: 'project',
  projectId: 'sito',
  kind: 'asset',
  asset: { assetId: 'logo-good-choice', assetType: 'logo', version: 3, sha256: 'b'.repeat(64) },
};
const access = {
  ...common,
  kind: 'access',
  accessRef: 'shopify-admin',
  provider: 'shopify',
  resource: 'negozio good-choice',
  holderAgentId: 'agent-director-1',
};

describe('company map entry kinds (F3B-01)', () => {
  it('accepts a person entry', () => {
    expect(CompanyMapPersonEntrySchema.safeParse(person).success).toBe(true);
  });
  it('accepts a responsibility entry', () => {
    expect(CompanyMapResponsibilityEntrySchema.safeParse(responsibility).success).toBe(true);
  });
  it('accepts an asset entry with type and version', () => {
    expect(CompanyMapAssetEntrySchema.safeParse(asset).success).toBe(true);
  });
  it('accepts an access entry as a reference only', () => {
    expect(CompanyMapAccessEntrySchema.safeParse(access).success).toBe(true);
  });
  it('keeps the referent entry of F1B-03 valid in both schemas', () => {
    expect(CompanyMapEntrySchema.safeParse(referent).success).toBe(true);
    expect(CompanyMapAnyEntrySchema.safeParse(referent).success).toBe(true);
  });
  it('accepts every kind in the union', () => {
    for (const entry of [referent, person, responsibility, asset, access]) {
      expect(CompanyMapAnyEntrySchema.safeParse(entry).success).toBe(true);
    }
  });
  it('gives the key of each kind', () => {
    expect(companyMapEntryKey(referent as never)).toBe('stefano');
    expect(companyMapEntryKey(person as never)).toBe('giulia');
    expect(companyMapEntryKey(responsibility as never)).toBe('giulia');
    expect(companyMapEntryKey(asset as never)).toBe('logo-good-choice');
    expect(companyMapEntryKey(access as never)).toBe('shopify-admin');
  });

  it('rejects an access entry carrying a value', () => {
    expect(CompanyMapAnyEntrySchema.safeParse({ ...access, value: 'segreto' }).success).toBe(false);
    expect(CompanyMapAccessEntrySchema.safeParse({ ...access, value: 'segreto' }).success).toBe(false);
  });
  it('rejects an asset without assetType', () => {
    const { assetType: _t, ...rest } = asset.asset;
    expect(CompanyMapAnyEntrySchema.safeParse({ ...asset, asset: rest }).success).toBe(false);
  });
  it('rejects an assetType with capitals', () => {
    expect(AssetTypeSchema.safeParse('Logo').success).toBe(false);
    expect(CompanyMapAnyEntrySchema.safeParse({ ...asset, asset: { ...asset.asset, assetType: 'Logo' } }).success).toBe(false);
  });
  it('rejects a responsibility without personRef', () => {
    const { personRef: _p, ...rest } = responsibility;
    expect(CompanyMapAnyEntrySchema.safeParse(rest).success).toBe(false);
  });
  it('rejects an unknown kind', () => {
    expect(CompanyMapAnyEntrySchema.safeParse({ ...person, kind: 'other' }).success).toBe(false);
  });
  it('rejects a client-level person with buSlug', () => {
    expect(CompanyMapAnyEntrySchema.safeParse({ ...person, buSlug: 'marketing' }).success).toBe(false);
  });
  it('rejects a person with supersedes equal to version', () => {
    expect(CompanyMapAnyEntrySchema.safeParse({ ...person, supersedes: 2 }).success).toBe(false);
  });
  it('rejects a project-level asset without projectId', () => {
    const { projectId: _p, ...rest } = asset;
    expect(CompanyMapAnyEntrySchema.safeParse(rest).success).toBe(false);
  });
  it('rejects a model source on a new kind', () => {
    expect(CompanyMapAnyEntrySchema.safeParse({ ...person, source: { kind: 'model' } }).success).toBe(false);
  });
});
