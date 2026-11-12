import { describe, expect, it } from 'vitest';
import {
  CompanyMapEntryWriteResponseSchema,
  INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
  internalMemoryCompanyMapWriteContract,
} from '../../src/http/endpoints/internal-memory-company-map.js';
import {
  INTERNAL_PROJECT_REFERENT_WRITE_PATH,
  PROJECT_REFERENT_WRITE_ERRORS,
  PROJECT_REFERENT_WRITE_ERROR_STATUS,
  ProjectReferentWriteErrorResponseSchema,
  ProjectReferentWriteErrorSchema,
  ProjectReferentWriteRequestSchema,
  internalProjectReferentWriteContract,
} from '../../src/http/endpoints/internal-project-referent.js';
import { BridgeErrorResponseSchema } from '../../src/http/response.js';

const request = {
  tenantId: '1',
  organizationId: 'good-choice',
  clientId: 'good-choice',
  level: 'project',
  projectId: 'cantina-facile',
  source: { kind: 'seed' },
  confirmedAt: '2026-11-12T09:00:00.000Z',
  kind: 'referent',
  personRef: 'stefano-argiolas',
  name: 'Stefano Argiolas',
  role: 'Referente del progetto',
  email: 'committente@example.com',
};

describe('s6715 progetto-e-referente: Forge writes only a seed referent at project level with six named refusals', () => {
  it('accepts the production-shaped referent unchanged in both write contracts', () => {
    expect(ProjectReferentWriteRequestSchema.parse(request)).toEqual(request);
    expect(internalProjectReferentWriteContract.bodySchema).toBe(ProjectReferentWriteRequestSchema);
    expect(internalMemoryCompanyMapWriteContract.bodySchema.parse(request)).toEqual(request);
  });

  it.each(['good-choice', 'orto-facile'])('preserves the current project id %s', (projectId) => {
    const body = { ...request, projectId };
    expect(ProjectReferentWriteRequestSchema.safeParse(body).success).toBe(true);
    expect(internalMemoryCompanyMapWriteContract.bodySchema.safeParse(body).success).toBe(true);
  });

  it.each(['client', 'business_unit'])('rejects the %s level even with a project id', (level) => {
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, level }).success).toBe(false);
  });

  it('rejects a person entry', () => {
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, kind: 'person' }).success).toBe(false);
  });

  it('rejects an otherwise valid decision source', () => {
    const body = { ...request, source: { kind: 'decision', requestId: 'req-cantina-facile-1', planVersion: 1 } };
    expect(ProjectReferentWriteRequestSchema.safeParse(body).success).toBe(false);
  });

  it('accepts 21 project characters and rejects 22', () => {
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, projectId: 'a'.repeat(21) }).success).toBe(true);
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, projectId: 'a'.repeat(22) }).success).toBe(false);
  });

  it.each(['personRef', 'role', 'tenantId', 'organizationId', 'clientId', 'confirmedAt', 'projectId'] as const)(
    'requires %s', (field) => {
      const { [field]: _omitted, ...body } = request;
      expect(ProjectReferentWriteRequestSchema.safeParse(body).success).toBe(false);
    },
  );

  it('rejects extra fields in the body and seed source', () => {
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, extra: true }).success).toBe(false);
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, buSlug: 'vendite' }).success).toBe(false);
    expect(ProjectReferentWriteRequestSchema.safeParse({ ...request, source: { kind: 'seed', extra: true } }).success).toBe(false);
  });

  it('reuses the Memory write response schema by identity', () => {
    expect(internalProjectReferentWriteContract.responseSchema).toBe(CompanyMapEntryWriteResponseSchema);
  });

  const errorStatuses = {
    invalid_body: 400,
    unauthenticated: 401,
    internal_secret_unavailable: 503,
    company_memory_unavailable: 503,
    company_memory_refused: 409,
    company_memory_invalid_answer: 502,
  } as const;

  it('publishes exactly the six errors and their status codes', () => {
    expect(PROJECT_REFERENT_WRITE_ERRORS).toEqual(Object.keys(errorStatuses));
    expect(PROJECT_REFERENT_WRITE_ERROR_STATUS).toEqual(errorStatuses);
    expect(internalProjectReferentWriteContract.errorSchema).toBe(ProjectReferentWriteErrorResponseSchema);
  });

  it.each(Object.entries(errorStatuses))('accepts the standard bridge error %s with status %s', (code, status) => {
    const error = { ok: false, code, message: 'The project referent could not be written' };
    expect(ProjectReferentWriteErrorSchema.safeParse(code).success).toBe(true);
    expect(ProjectReferentWriteErrorResponseSchema.parse(error)).toEqual(error);
    expect(BridgeErrorResponseSchema.safeParse(error).success).toBe(true);
    expect(PROJECT_REFERENT_WRITE_ERROR_STATUS[ProjectReferentWriteErrorSchema.parse(code)]).toBe(status);
  });

  it('rejects invented errors and invalid error envelopes', () => {
    const error = { ok: false, code: 'invalid_body', message: 'Invalid project referent' };
    expect(ProjectReferentWriteErrorSchema.safeParse('invented').success).toBe(false);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, code: 'invented' }).success).toBe(false);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, ok: true }).success).toBe(false);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, message: '' }).success).toBe(false);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, message: 'a'.repeat(501) }).success).toBe(false);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, message: 'a'.repeat(500) }).success).toBe(true);
    expect(ProjectReferentWriteErrorResponseSchema.safeParse({ ...error, extra: true }).success).toBe(false);
  });

  it('publishes a secret-authenticated POST distinct from the generic Memory write', () => {
    expect(INTERNAL_PROJECT_REFERENT_WRITE_PATH).toBe('/internal/company-map/project-referent');
    expect(internalProjectReferentWriteContract.path).toBe(INTERNAL_PROJECT_REFERENT_WRITE_PATH);
    expect(internalProjectReferentWriteContract.path).not.toBe(INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH);
    expect(internalProjectReferentWriteContract.method).toBe('POST');
    expect(internalProjectReferentWriteContract.authType).toBe('secret');
  });
});
