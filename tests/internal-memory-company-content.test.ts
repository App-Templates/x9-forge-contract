import { describe, expect, it } from 'vitest';
import {
  COMPANY_CONTENT_SOURCES,
  CompanyContentReadRequestSchema,
  CompanyContentReadResponseSchema,
  INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH,
  internalMemoryCompanyContentReadContract,
} from '../src/http/endpoints/internal-memory-company-content.js';

const context = {
  schemaVersion: 1,
  runId: 'run-1',
  organizationId: 'org-1',
  ownerId: 'owner-1',
  identity: { managementAgentId: 'x9', runtimeAgentId: 'agent-x9' },
  issuer: 'x9',
  issuedAt: '2026-10-23T10:00:00.000Z',
  expiresAt: '2026-10-23T11:00:00.000Z',
};
const request = { context, clientId: 'good-choice' };
const item = {
  source: 'publication',
  ref: 'company-overview',
  version: 1,
  digest: 'a'.repeat(64),
  text: 'Approved company knowledge',
};
const response = { status: 'ok', clientId: 'good-choice', items: [item] };

describe('company content read contract', () => {
  it('accepts requests with and without a project filter', () => {
    expect(CompanyContentReadRequestSchema.safeParse(request).success).toBe(true);
    expect(CompanyContentReadRequestSchema.safeParse({
      ...request, projectId: 'website', query: 'approved decisions', limit: 50,
    }).success).toBe(true);
  });

  it('accepts every allowed source and permits the same reference across sources', () => {
    expect(COMPANY_CONTENT_SOURCES).toEqual(['publication', 'decision', 'map_entry']);
    expect(CompanyContentReadResponseSchema.safeParse({
      ...response,
      items: COMPANY_CONTENT_SOURCES.map((source) => ({ ...item, source, projectId: 'website', title: 'Overview' })),
    }).success).toBe(true);
  });

  it.each(['not_authorized', 'other_client'])('accepts the %s refusal without content', (status) => {
    expect(CompanyContentReadResponseSchema.safeParse({ status }).success).toBe(true);
    expect(CompanyContentReadResponseSchema.safeParse({ status, message: 'Access denied' }).success).toBe(true);
    expect(CompanyContentReadResponseSchema.safeParse({ status, items: [item] }).success).toBe(false);
  });

  it('exposes the exact route, authentication and schemas', () => {
    expect(INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH).toBe('/internal/memory/company-content/read');
    expect(internalMemoryCompanyContentReadContract).toEqual({
      method: 'POST',
      path: '/internal/memory/company-content/read',
      authType: 'secret',
      bodySchema: CompanyContentReadRequestSchema,
      responseSchema: CompanyContentReadResponseSchema,
    });
  });

  it('rejects a request without clientId', () => {
    expect(CompanyContentReadRequestSchema.safeParse({ context }).success).toBe(false);
  });

  it.each([0, 51, 1.5])('rejects an invalid limit of %s', (limit) => {
    expect(CompanyContentReadRequestSchema.safeParse({ ...request, limit }).success).toBe(false);
  });

  it('rejects extra keys in the request, response and item', () => {
    expect(CompanyContentReadRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
    expect(CompanyContentReadResponseSchema.safeParse({ ...response, extra: true }).success).toBe(false);
    expect(CompanyContentReadResponseSchema.safeParse({
      ...response, items: [{ ...item, extra: true }],
    }).success).toBe(false);
  });

  it('rejects private memory as a content source', () => {
    expect(CompanyContentReadResponseSchema.safeParse({
      ...response, items: [{ ...item, source: 'private' }],
    }).success).toBe(false);
  });

  it('accepts 50 unique items and rejects 51 unique items', () => {
    const items = Array.from({ length: 51 }, (_, index) => ({ ...item, ref: `ref-${index}` }));
    expect(CompanyContentReadResponseSchema.safeParse({ ...response, items: items.slice(0, 50) }).success).toBe(true);
    expect(CompanyContentReadResponseSchema.safeParse({ ...response, items }).success).toBe(false);
  });

  it('rejects repeated references within the same source even across versions', () => {
    const result = CompanyContentReadResponseSchema.safeParse({
      ...response, items: [item, { ...item, version: 2 }],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues).toContainEqual(expect.objectContaining({ path: ['items', 1, 'ref'] }));
    }
  });

  it.each([
    { projectId: '' }, { projectId: 'p'.repeat(65) },
    { query: '' }, { query: 'q'.repeat(2001) }, { clientId: '' },
    { context: { ...context, ownerId: '' } },
  ])('rejects invalid request fields (case %#)', (fields) => {
    expect(CompanyContentReadRequestSchema.safeParse({ ...request, ...fields }).success).toBe(false);
  });

  it.each([
    { ref: '' }, { ref: 'r'.repeat(201) }, { version: 0 }, { version: 1.5 },
    { digest: 'invalid' }, { text: 't'.repeat(65537) },
    { projectId: '' }, { projectId: 'p'.repeat(65) }, { title: '' }, { title: 't'.repeat(201) },
  ])('rejects invalid item fields (case %#)', (fields) => {
    expect(CompanyContentReadResponseSchema.safeParse({
      ...response, items: [{ ...item, ...fields }],
    }).success).toBe(false);
  });

  it('accepts empty results and text at the size boundary', () => {
    expect(CompanyContentReadResponseSchema.safeParse({ ...response, items: [] }).success).toBe(true);
    expect(CompanyContentReadResponseSchema.safeParse({
      ...response, items: [{ ...item, text: 't'.repeat(65536) }],
    }).success).toBe(true);
  });
});
