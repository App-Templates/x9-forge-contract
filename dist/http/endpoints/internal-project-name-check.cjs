"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalProjectNameCheckContract = exports.ProjectNameCheckErrorResponseSchema = exports.PROJECT_NAME_CHECK_ERROR_STATUS = exports.ProjectNameCheckErrorCodeSchema = exports.PROJECT_NAME_CHECK_ERRORS = exports.ProjectNameCheckResponseSchema = exports.ProjectNameTakenReasonSchema = exports.PROJECT_NAME_TAKEN_REASONS = exports.ProjectNameCheckRequestSchema = exports.INTERNAL_PROJECT_NAME_CHECK_PATH = void 0;
const zod_1 = require("zod");
const internal_project_director_enrollment_js_1 = require("./internal-project-director-enrollment.cjs");
const internal_project_create_js_1 = require("./internal-project-create.cjs");
exports.INTERNAL_PROJECT_NAME_CHECK_PATH = '/internal/paperclip/project-name-check';
const enrollment = internal_project_director_enrollment_js_1.ProjectDirectorEnrollmentRequestSchema.shape;
/**
 * Forge factory-svc -> cap-paperclip, before the Director is born: is the short name of a project free in Paperclip
 * for that company? Read only; the project name in Paperclip is the project id.
 */
exports.ProjectNameCheckRequestSchema = zod_1.z.strictObject({
    tenantId: enrollment.tenantId,
    ownerId: enrollment.ownerId,
    companyId: enrollment.companyId,
    projectId: internal_project_create_js_1.ProjectIdSchema,
});
/**
 * `existing_project` = a project not archived (any status) has that name or url key; `archived_project` = only
 * archived ones have it; when both, `existing_project`.
 */
exports.PROJECT_NAME_TAKEN_REASONS = ['existing_project', 'archived_project'];
exports.ProjectNameTakenReasonSchema = zod_1.z.enum(exports.PROJECT_NAME_TAKEN_REASONS);
exports.ProjectNameCheckResponseSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.strictObject({ state: zod_1.z.literal('free') }),
    zod_1.z.strictObject({ state: zod_1.z.literal('taken'), reason: exports.ProjectNameTakenReasonSchema }),
]);
/**
 * `reader_unavailable` = cap-paperclip has no key to read the projects of that company (no Director, key missing);
 * `paperclip_unavailable` = Paperclip did not answer or answered in another shape.
 */
exports.PROJECT_NAME_CHECK_ERRORS = [
    'invalid_request',
    'organization_unknown',
    'not_configured',
    'reader_unavailable',
    'paperclip_unavailable',
];
exports.ProjectNameCheckErrorCodeSchema = zod_1.z.enum(exports.PROJECT_NAME_CHECK_ERRORS);
exports.PROJECT_NAME_CHECK_ERROR_STATUS = {
    invalid_request: 400,
    organization_unknown: 404,
    not_configured: 503,
    reader_unavailable: 503,
    paperclip_unavailable: 502,
};
exports.ProjectNameCheckErrorResponseSchema = zod_1.z.strictObject({ error: exports.ProjectNameCheckErrorCodeSchema });
exports.internalProjectNameCheckContract = {
    method: 'POST',
    path: exports.INTERNAL_PROJECT_NAME_CHECK_PATH,
    authType: 'secret',
    bodySchema: exports.ProjectNameCheckRequestSchema,
    responseSchema: exports.ProjectNameCheckResponseSchema,
    errorSchema: exports.ProjectNameCheckErrorResponseSchema,
};
//# sourceMappingURL=internal-project-name-check.js.map