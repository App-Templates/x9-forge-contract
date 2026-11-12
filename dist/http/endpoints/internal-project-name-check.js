import { z } from 'zod';
import { ProjectDirectorEnrollmentRequestSchema } from "./internal-project-director-enrollment.js";
import { ProjectIdSchema } from "./internal-project-create.js";
export const INTERNAL_PROJECT_NAME_CHECK_PATH = '/internal/paperclip/project-name-check';
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
/**
 * `existing_project` = a project not archived (any status) has that name or url key; `archived_project` = only
 * archived ones have it; when both, `existing_project`.
 */
export const PROJECT_NAME_TAKEN_REASONS = ['existing_project', 'archived_project'];
export const ProjectNameTakenReasonSchema = z.enum(PROJECT_NAME_TAKEN_REASONS);
export const ProjectNameCheckResponseSchema = z.discriminatedUnion('state', [
    z.strictObject({ state: z.literal('free') }),
    z.strictObject({ state: z.literal('taken'), reason: ProjectNameTakenReasonSchema }),
]);
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
];
export const ProjectNameCheckErrorCodeSchema = z.enum(PROJECT_NAME_CHECK_ERRORS);
export const PROJECT_NAME_CHECK_ERROR_STATUS = {
    invalid_request: 400,
    organization_unknown: 404,
    not_configured: 503,
    reader_unavailable: 503,
    paperclip_unavailable: 502,
};
export const ProjectNameCheckErrorResponseSchema = z.strictObject({ error: ProjectNameCheckErrorCodeSchema });
export const internalProjectNameCheckContract = {
    method: 'POST',
    path: INTERNAL_PROJECT_NAME_CHECK_PATH,
    authType: 'secret',
    bodySchema: ProjectNameCheckRequestSchema,
    responseSchema: ProjectNameCheckResponseSchema,
    errorSchema: ProjectNameCheckErrorResponseSchema,
};
//# sourceMappingURL=internal-project-name-check.js.map