import { z } from 'zod';
import { CompanyMapReferentFieldsSchema, CompanyMapScopeFieldsSchema, CompanyMapVersionFieldsSchema, } from "../../organization/company-map.js";
import { CompanyMapEntryWriteResponseSchema } from "./internal-memory-company-map.js";
import { ProjectIdSchema } from "./internal-project-create.js";
export const INTERNAL_PROJECT_REFERENT_WRITE_PATH = '/internal/company-map/project-referent';
/**
 * Forge computes `personRef` and `role`. This body is always valid for
 * `internalMemoryCompanyMapWriteContract`, so agent-core forwards it unchanged.
 * Only a seed referent at project level can be written through this route.
 */
export const ProjectReferentWriteRequestSchema = z.strictObject({
    tenantId: CompanyMapScopeFieldsSchema.shape.tenantId,
    organizationId: CompanyMapScopeFieldsSchema.shape.organizationId,
    clientId: CompanyMapScopeFieldsSchema.shape.clientId,
    level: z.literal('project'),
    projectId: ProjectIdSchema,
    source: z.strictObject({ kind: z.literal('seed') }),
    confirmedAt: CompanyMapVersionFieldsSchema.shape.confirmedAt,
    ...CompanyMapReferentFieldsSchema.shape,
});
export const PROJECT_REFERENT_WRITE_ERRORS = [
    'invalid_body',
    'unauthenticated',
    'internal_secret_unavailable',
    'company_memory_unavailable',
    'company_memory_refused',
    'company_memory_invalid_answer',
];
export const ProjectReferentWriteErrorSchema = z.enum(PROJECT_REFERENT_WRITE_ERRORS);
export const PROJECT_REFERENT_WRITE_ERROR_STATUS = {
    invalid_body: 400,
    unauthenticated: 401,
    internal_secret_unavailable: 503,
    company_memory_unavailable: 503,
    company_memory_refused: 409,
    company_memory_invalid_answer: 502,
};
export const ProjectReferentWriteErrorResponseSchema = z.strictObject({
    ok: z.literal(false),
    code: ProjectReferentWriteErrorSchema,
    message: z.string().min(1).max(500),
});
export const internalProjectReferentWriteContract = {
    method: 'POST',
    path: INTERNAL_PROJECT_REFERENT_WRITE_PATH,
    authType: 'secret',
    bodySchema: ProjectReferentWriteRequestSchema,
    responseSchema: CompanyMapEntryWriteResponseSchema,
    errorSchema: ProjectReferentWriteErrorResponseSchema,
};
//# sourceMappingURL=internal-project-referent.js.map