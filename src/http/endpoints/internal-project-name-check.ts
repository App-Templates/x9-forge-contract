import { z } from 'zod';
import { ProjectDirectorEnrollmentRequestSchema } from './internal-project-director-enrollment.js';
import { ProjectIdSchema } from './internal-project-create.js';

export const INTERNAL_PROJECT_NAME_CHECK_PATH = '/internal/paperclip/project-name-check' as const;

const enrollment = ProjectDirectorEnrollmentRequestSchema.shape;

/**
 * Forge factory-svc -> cap-paperclip, before the Director is born: is the short name of a project free in Paperclip
 * for that company? Read only; the project name in Paperclip is the project id.
 */
export const ProjectNameCheckRequestSchema = z.strictObject({
  tenantId: enrollment.tenantId,
  ownerId: enrollment.ownerId,
  companyId: enrollment.companyId,
  projectId: ProjectIdSchema,
});
export type ProjectNameCheckRequest = z.infer<typeof ProjectNameCheckRequestSchema>;

/**
 * `existing_project` = a project not archived (any status) has that name or url key; `archived_project` = only
 * archived ones have it; when both, `existing_project`.
 */
export const PROJECT_NAME_TAKEN_REASONS = ['existing_project', 'archived_project'] as const;
export const ProjectNameTakenReasonSchema = z.enum(PROJECT_NAME_TAKEN_REASONS);
export type ProjectNameTakenReason = z.infer<typeof ProjectNameTakenReasonSchema>;

export const ProjectNameCheckResponseSchema = z.discriminatedUnion('state', [
  z.strictObject({ state: z.literal('free') }),
  z.strictObject({ state: z.literal('taken'), reason: ProjectNameTakenReasonSchema }),
]);
export type ProjectNameCheckResponse = z.infer<typeof ProjectNameCheckResponseSchema>;

/**
 * `reader_unavailable` = cap-paperclip has no key to read the projects of that company (no Director, key missing);
 * `paperclip_unavailable` = Paperclip did not answer or answered in another shape.
 */
export const PROJECT_NAME_CHECK_ERRORS = [
  'invalid_request',
  'organization_unknown',
  'not_configured',
  'reader_unavailable',
  'paperclip_unavailable',
] as const;
export const ProjectNameCheckErrorCodeSchema = z.enum(PROJECT_NAME_CHECK_ERRORS);
export type ProjectNameCheckErrorCode = z.infer<typeof ProjectNameCheckErrorCodeSchema>;

export const PROJECT_NAME_CHECK_ERROR_STATUS = {
  invalid_request: 400,
  organization_unknown: 404,
  not_configured: 503,
  reader_unavailable: 503,
  paperclip_unavailable: 502,
} as const satisfies Record<ProjectNameCheckErrorCode, number>;

export const ProjectNameCheckErrorResponseSchema = z.strictObject({ error: ProjectNameCheckErrorCodeSchema });
export type ProjectNameCheckErrorResponse = z.infer<typeof ProjectNameCheckErrorResponseSchema>;

export const internalProjectNameCheckContract = {
  method: 'POST' as const,
  path: INTERNAL_PROJECT_NAME_CHECK_PATH,
  authType: 'secret' as const,
  bodySchema: ProjectNameCheckRequestSchema,
  responseSchema: ProjectNameCheckResponseSchema,
  errorSchema: ProjectNameCheckErrorResponseSchema,
} as const;
