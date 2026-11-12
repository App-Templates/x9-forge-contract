import { describe, expect, it } from 'vitest';
import {
  INTERNAL_PROJECT_NAME_CHECK_PATH,
  PROJECT_NAME_CHECK_ERRORS,
  PROJECT_NAME_CHECK_ERROR_STATUS,
  PROJECT_NAME_TAKEN_REASONS,
  ProjectNameCheckErrorResponseSchema,
  ProjectNameCheckRequestSchema,
  ProjectNameCheckResponseSchema,
  internalProjectNameCheckContract,
} from '../../src/http/endpoints/internal-project-name-check.js';
import type {
  ProjectNameCheckErrorCode,
  ProjectNameCheckErrorResponse,
  ProjectNameCheckRequest,
  ProjectNameCheckResponse,
  ProjectNameTakenReason,
} from '../../src/http/endpoints/internal-project-name-check.js';

const request = (projectId: string) => ({ tenantId: '1', ownerId: '1', companyId: 'good-choice', projectId });

describe('internal project name check contract', () => {
  it('s6720 nome-del-progetto: Forge asks cap-paperclip with the internal secret whether the short name of a project is free', () => {
    for (const id of ['cantina-facile', 'orto-facile', 'orto-facile-5']) {
      const parsed: ProjectNameCheckRequest = ProjectNameCheckRequestSchema.parse(request(id));
      expect(parsed).toEqual(request(id));
    }
    expect(internalProjectNameCheckContract.method).toBe('POST');
    expect(internalProjectNameCheckContract.authType).toBe('secret');
    expect(internalProjectNameCheckContract.path).toBe('/internal/paperclip/project-name-check');
    expect(INTERNAL_PROJECT_NAME_CHECK_PATH).toBe(internalProjectNameCheckContract.path);
    expect(internalProjectNameCheckContract.bodySchema).toBe(ProjectNameCheckRequestSchema);
    expect(internalProjectNameCheckContract.responseSchema).toBe(ProjectNameCheckResponseSchema);
    expect(internalProjectNameCheckContract.errorSchema).toBe(ProjectNameCheckErrorResponseSchema);
  });

  it('request: same id rule as the create contract', () => {
    expect(ProjectNameCheckRequestSchema.safeParse(request('a'.repeat(22))).success).toBe(false);
    expect(ProjectNameCheckRequestSchema.safeParse(request('Cantina-Facile')).success).toBe(false);
    expect(ProjectNameCheckRequestSchema.safeParse({ ...request('orto-facile'), name: 'x' }).success).toBe(false);
    expect(ProjectNameCheckRequestSchema.safeParse({ ...request('orto-facile'), companyId: '' }).success).toBe(false);
    expect(ProjectNameCheckRequestSchema.safeParse(request('a'.repeat(21))).success).toBe(true);
  });

  it('response: free or taken with one fixed reason', () => {
    expect(PROJECT_NAME_TAKEN_REASONS).toEqual(['existing_project', 'archived_project']);
    const free: ProjectNameCheckResponse = { state: 'free' };
    expect(ProjectNameCheckResponseSchema.safeParse(free).success).toBe(true);
    for (const reason of PROJECT_NAME_TAKEN_REASONS) {
      const r: ProjectNameTakenReason = reason;
      expect(ProjectNameCheckResponseSchema.safeParse({ state: 'taken', reason: r }).success).toBe(true);
    }
    expect(ProjectNameCheckResponseSchema.safeParse({ state: 'taken' }).success).toBe(false);
    expect(ProjectNameCheckResponseSchema.safeParse({ state: 'free', reason: 'existing_project' }).success).toBe(false);
    expect(ProjectNameCheckResponseSchema.safeParse({ state: 'taken', reason: 'renamed' }).success).toBe(false);
  });

  it('errors: five fixed codes with their own status', () => {
    expect(PROJECT_NAME_CHECK_ERRORS).toHaveLength(5);
    for (const code of PROJECT_NAME_CHECK_ERRORS) {
      const c: ProjectNameCheckErrorCode = code;
      const body: ProjectNameCheckErrorResponse = { error: c };
      expect(ProjectNameCheckErrorResponseSchema.safeParse(body).success).toBe(true);
    }
    expect(ProjectNameCheckErrorResponseSchema.safeParse({ error: 'other' }).success).toBe(false);
    expect(ProjectNameCheckErrorResponseSchema.safeParse({ error: 'invalid_request', message: 'x' }).success).toBe(false);
    expect(PROJECT_NAME_CHECK_ERROR_STATUS).toEqual({
      invalid_request: 400,
      organization_unknown: 404,
      not_configured: 503,
      reader_unavailable: 503,
      paperclip_unavailable: 502,
    });
  });
});
