import { describe, expect, it } from 'vitest';
import {
  CompanyMapEntriesQuerySchema,
  CompanyMapEntriesResponseSchema,
  CompanyMapEntryWriteRequestSchema,
  CompanyMapEntryWriteResponseSchema,
  INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
  internalMemoryCompanyMapListContract,
  internalMemoryCompanyMapWriteContract,
} from '../src/http/endpoints/internal-memory-company-map.js';

const write = {
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
};

const stored = { ...write, version: 1, digest: 'a'.repeat(64) };

describe('company map contracts', () => {
  it('exposes exact method, path and auth type', () => {
    expect(INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH).toBe('/internal/memory/company-map/entries');
    expect(internalMemoryCompanyMapWriteContract).toMatchObject({
      method: 'POST',
      path: '/internal/memory/company-map/entries',
      authType: 'secret',
    });
    expect(internalMemoryCompanyMapListContract).toMatchObject({
      method: 'GET',
      path: '/internal/memory/company-map/entries',
      authType: 'secret',
    });
  });

  it('accepts a write from a seed', () => {
    expect(CompanyMapEntryWriteRequestSchema.safeParse(write).success).toBe(true);
  });

  it('accepts a write from a decision', () => {
    const source = { kind: 'decision', requestId: 'req-123456', planVersion: 1 };
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, source }).success).toBe(true);
  });

  it('rejects a write carrying version, digest or supersedes', () => {
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, version: 1 }).success).toBe(false);
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, digest: 'a'.repeat(64) }).success).toBe(false);
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, supersedes: 1 }).success).toBe(false);
  });

  it('rejects a write whose source is a model', () => {
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, source: { kind: 'model' } }).success).toBe(false);
  });

  it('rejects a write with level scope mismatches', () => {
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, level: 'project' }).success).toBe(false);
    expect(CompanyMapEntryWriteRequestSchema.safeParse({ ...write, buSlug: 'marketing' }).success).toBe(false);
    expect(
      CompanyMapEntryWriteRequestSchema.safeParse({ ...write, level: 'business_unit', projectId: 'sito' }).success,
    ).toBe(false);
  });

  it('validates the write response entry', () => {
    expect(CompanyMapEntryWriteResponseSchema.safeParse({ entry: stored }).success).toBe(true);
    expect(CompanyMapEntryWriteResponseSchema.safeParse({ entry: write }).success).toBe(false);
  });

  it('accepts queries per level', () => {
    const q = { tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice' };
    expect(CompanyMapEntriesQuerySchema.safeParse({ ...q, level: 'client' }).success).toBe(true);
    expect(CompanyMapEntriesQuerySchema.safeParse({ ...q, level: 'project', projectId: 'sito' }).success).toBe(true);
    expect(
      CompanyMapEntriesQuerySchema.safeParse({ ...q, level: 'business_unit', projectId: 'sito', buSlug: 'marketing' })
        .success,
    ).toBe(true);
  });

  it('rejects a business_unit query without buSlug', () => {
    const q = { tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice' };
    expect(CompanyMapEntriesQuerySchema.safeParse({ ...q, level: 'business_unit', projectId: 'sito' }).success).toBe(
      false,
    );
  });

  it('rejects a query with an extra key', () => {
    const q = { tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'good-choice', level: 'client' };
    expect(CompanyMapEntriesQuerySchema.safeParse({ ...q, limit: 5 }).success).toBe(false);
  });

  it('caps the list response at 200 entries', () => {
    expect(CompanyMapEntriesResponseSchema.safeParse({ entries: [stored] }).success).toBe(true);
    expect(CompanyMapEntriesResponseSchema.safeParse({ entries: Array(201).fill(stored) }).success).toBe(false);
  });
});
