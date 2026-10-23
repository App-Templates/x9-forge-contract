"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryCompanyMapListContract = exports.internalMemoryCompanyMapWriteContract = exports.CompanyMapEntriesResponseSchema = exports.CompanyMapEntriesQuerySchema = exports.CompanyMapEntryWriteResponseSchema = exports.CompanyMapEntryWriteRequestSchema = exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = void 0;
const zod_1 = require("zod");
const company_map_js_1 = require("../../organization/company-map.cjs");
exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = '/internal/memory/company-map/entries';
const entryShape = company_map_js_1.CompanyMapEntrySchema.shape;
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
exports.CompanyMapEntryWriteRequestSchema = zod_1.z
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
exports.CompanyMapEntryWriteResponseSchema = zod_1.z.strictObject({ entry: company_map_js_1.CompanyMapEntrySchema });
/** GET: entries of one level of the map. */
exports.CompanyMapEntriesQuerySchema = zod_1.z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    level: entryShape.level,
    projectId: entryShape.projectId,
    buSlug: entryShape.buSlug,
})
    .superRefine(checkLevelScope);
exports.CompanyMapEntriesResponseSchema = zod_1.z.strictObject({
    entries: zod_1.z.array(company_map_js_1.CompanyMapEntrySchema).max(200),
});
exports.internalMemoryCompanyMapWriteContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
    authType: 'secret',
    bodySchema: exports.CompanyMapEntryWriteRequestSchema,
    responseSchema: exports.CompanyMapEntryWriteResponseSchema,
};
exports.internalMemoryCompanyMapListContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH,
    authType: 'secret',
    querySchema: exports.CompanyMapEntriesQuerySchema,
    responseSchema: exports.CompanyMapEntriesResponseSchema,
};
//# sourceMappingURL=internal-memory-company-map.js.map