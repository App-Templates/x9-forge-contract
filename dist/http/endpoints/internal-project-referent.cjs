"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalProjectReferentWriteContract = exports.ProjectReferentWriteErrorResponseSchema = exports.PROJECT_REFERENT_WRITE_ERROR_STATUS = exports.ProjectReferentWriteErrorSchema = exports.PROJECT_REFERENT_WRITE_ERRORS = exports.ProjectReferentWriteRequestSchema = exports.INTERNAL_PROJECT_REFERENT_WRITE_PATH = void 0;
const zod_1 = require("zod");
const company_map_js_1 = require("../../organization/company-map.cjs");
const internal_memory_company_map_js_1 = require("./internal-memory-company-map.cjs");
const internal_project_create_js_1 = require("./internal-project-create.cjs");
exports.INTERNAL_PROJECT_REFERENT_WRITE_PATH = '/internal/company-map/project-referent';
/**
 * Forge computes `personRef` and `role`. This body is always valid for
 * `internalMemoryCompanyMapWriteContract`, so agent-core forwards it unchanged.
 * Only a seed referent at project level can be written through this route.
 */
exports.ProjectReferentWriteRequestSchema = zod_1.z.strictObject({
    tenantId: company_map_js_1.CompanyMapScopeFieldsSchema.shape.tenantId,
    organizationId: company_map_js_1.CompanyMapScopeFieldsSchema.shape.organizationId,
    clientId: company_map_js_1.CompanyMapScopeFieldsSchema.shape.clientId,
    level: zod_1.z.literal('project'),
    projectId: internal_project_create_js_1.ProjectIdSchema,
    source: zod_1.z.strictObject({ kind: zod_1.z.literal('seed') }),
    confirmedAt: company_map_js_1.CompanyMapVersionFieldsSchema.shape.confirmedAt,
    ...company_map_js_1.CompanyMapReferentFieldsSchema.shape,
});
exports.PROJECT_REFERENT_WRITE_ERRORS = [
    'invalid_body',
    'unauthenticated',
    'internal_secret_unavailable',
    'company_memory_unavailable',
    'company_memory_refused',
    'company_memory_invalid_answer',
];
exports.ProjectReferentWriteErrorSchema = zod_1.z.enum(exports.PROJECT_REFERENT_WRITE_ERRORS);
exports.PROJECT_REFERENT_WRITE_ERROR_STATUS = {
    invalid_body: 400,
    unauthenticated: 401,
    internal_secret_unavailable: 503,
    company_memory_unavailable: 503,
    company_memory_refused: 409,
    company_memory_invalid_answer: 502,
};
exports.ProjectReferentWriteErrorResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    code: exports.ProjectReferentWriteErrorSchema,
    message: zod_1.z.string().min(1).max(500),
});
exports.internalProjectReferentWriteContract = {
    method: 'POST',
    path: exports.INTERNAL_PROJECT_REFERENT_WRITE_PATH,
    authType: 'secret',
    bodySchema: exports.ProjectReferentWriteRequestSchema,
    responseSchema: internal_memory_company_map_js_1.CompanyMapEntryWriteResponseSchema,
    errorSchema: exports.ProjectReferentWriteErrorResponseSchema,
};
//# sourceMappingURL=internal-project-referent.js.map