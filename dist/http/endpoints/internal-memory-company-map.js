import { z } from 'zod';
import { CompanyMapEntrySchema } from "../../organization/company-map.js";
export const INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = '/internal/memory/company-map/entries';
const entryShape = CompanyMapEntrySchema.shape;
/** Same level rules as the entry: project/BU ids are required exactly where the level asks for them. */
function checkLevelScope(value, ctx) {
    const wantsProject = value.level !== 'client';
    const wantsBu = value.level === 'business_unit';
    if (wantsProject !== (value.projectId !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsProject ? 'projectId is required for this level' : 'projectId is not allowed at client level',
            path: ['projectId'],
        });
    }
    if (wantsBu !== (value.buSlug !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            message: wantsBu ? 'buSlug is required at business_unit level' : 'buSlug is only allowed at business_unit level',
            path: ['buSlug'],
        });
    }
}
/** POST body: version, digest and supersedes are assigned by the server. */
export const CompanyMapEntryWriteRequestSchema = z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    projectId: entryShape.projectId,
    buSlug: entryShape.buSlug,
    level: entryShape.level,
    kind: entryShape.kind,
    personRef: entryShape.personRef,
    name: entryShape.name,
    role: entryShape.role,
    email: entryShape.email,
    source: entryShape.source,
    confirmedAt: entryShape.confirmedAt,
})
    .superRefine(checkLevelScope);
export const CompanyMapEntryWriteResponseSchema = z.strictObject({ entry: CompanyMapEntrySchema });
/** GET: entries of one level of the map. */
export const CompanyMapEntriesQuerySchema = z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    level: entryShape.level,
    projectId: entryShape.projectId,
    buSlug: entryShape.buSlug,
})
    .superRefine(checkLevelScope);
export const CompanyMapEntriesResponseSchema = z.strictObject({
    entries: z.array(CompanyMapEntrySchema).max(200),
});
export const internalMemoryCompanyMapWriteContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
    authType: 'secret',
    bodySchema: CompanyMapEntryWriteRequestSchema,
    responseSchema: CompanyMapEntryWriteResponseSchema,
};
export const internalMemoryCompanyMapListContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
    authType: 'secret',
    querySchema: CompanyMapEntriesQuerySchema,
    responseSchema: CompanyMapEntriesResponseSchema,
};
//# sourceMappingURL=internal-memory-company-map.js.map