"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryCompanyMapListContract = exports.internalMemoryCompanyMapWriteContract = exports.internalMemoryCompanyMapHistoryContract = exports.CompanyMapHistoryResponseSchema = exports.CompanyMapHistoryQuerySchema = exports.CompanyMapEntriesResponseSchema = exports.CompanyMapEntriesQuerySchema = exports.CompanyMapEntryWriteResponseSchema = exports.CompanyMapEntryWriteRequestSchema = exports.CompanyMapReferentWriteRequestSchema = exports.INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH = exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = void 0;
const zod_1 = require("zod");
const company_map_js_1 = require("../../organization/company-map.cjs");
exports.INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = '/internal/memory/company-map/entries';
exports.INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH = '/internal/memory/company-map/history';
const entryShape = company_map_js_1.CompanyMapEntrySchema.shape;
/** Fields every write body carries: scope, source and confirmation date. Version, digest and supersedes come from the server. */
const writeCommonShape = {
    ...company_map_js_1.CompanyMapScopeFieldsSchema.shape,
    source: entryShape.source,
    confirmedAt: entryShape.confirmedAt,
};
/** POST body of a «referent» entry (F1B-03, unchanged). */
exports.CompanyMapReferentWriteRequestSchema = zod_1.z
    .strictObject({ ...writeCommonShape, ...company_map_js_1.CompanyMapReferentFieldsSchema.shape })
    .superRefine(company_map_js_1.checkCompanyMapLevelScope);
/** POST body: one of the five entry kinds; version, digest and supersedes are assigned by the server. */
exports.CompanyMapEntryWriteRequestSchema = zod_1.z.discriminatedUnion('kind', [
    exports.CompanyMapReferentWriteRequestSchema,
    zod_1.z.strictObject({ ...writeCommonShape, ...company_map_js_1.CompanyMapPersonFieldsSchema.shape }).superRefine(company_map_js_1.checkCompanyMapLevelScope),
    zod_1.z.strictObject({ ...writeCommonShape, ...company_map_js_1.CompanyMapResponsibilityFieldsSchema.shape }).superRefine(company_map_js_1.checkCompanyMapLevelScope),
    zod_1.z.strictObject({ ...writeCommonShape, ...company_map_js_1.CompanyMapAssetFieldsSchema.shape }).superRefine(company_map_js_1.checkCompanyMapLevelScope),
    zod_1.z.strictObject({ ...writeCommonShape, ...company_map_js_1.CompanyMapAccessFieldsSchema.shape }).superRefine(company_map_js_1.checkCompanyMapLevelScope),
]);
exports.CompanyMapEntryWriteResponseSchema = zod_1.z.strictObject({ entry: company_map_js_1.CompanyMapAnyEntrySchema });
/** GET: current entries of one level of the map, optionally of one kind. */
exports.CompanyMapEntriesQuerySchema = zod_1.z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    level: entryShape.level,
    projectId: entryShape.projectId,
    buSlug: entryShape.buSlug,
    kind: company_map_js_1.CompanyMapEntryKindSchema.optional(),
})
    .superRefine(company_map_js_1.checkCompanyMapLevelScope);
exports.CompanyMapEntriesResponseSchema = zod_1.z.strictObject({
    entries: zod_1.z.array(company_map_js_1.CompanyMapAnyEntrySchema).max(200),
});
/** History of one complete entry key; entryRef is personRef, accessRef or asset.assetId according to kind. */
exports.CompanyMapHistoryQuerySchema = zod_1.z.strictObject({
    ...company_map_js_1.CompanyMapScopeFieldsSchema.shape,
    kind: company_map_js_1.CompanyMapEntryKindSchema,
    entryRef: zod_1.z.string().min(1).max(64),
    after: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
}).superRefine(company_map_js_1.checkCompanyMapLevelScope);
exports.CompanyMapHistoryResponseSchema = zod_1.z.strictObject({
    versions: zod_1.z.array(company_map_js_1.CompanyMapAnyEntrySchema).max(50),
    currentVersion: zod_1.z.number().int().min(1),
    nextAfter: zod_1.z.number().int().min(1).nullable(),
}).superRefine((value, ctx) => {
    let previousVersion = 0;
    for (const [index, entry] of value.versions.entries()) {
        if (entry.version <= previousVersion || entry.version > value.currentVersion) {
            ctx.addIssue({
                code: 'custom',
                message: 'History versions must strictly increase and not exceed currentVersion',
                path: ['versions', index, 'version'],
            });
        }
        previousVersion = entry.version;
    }
    const last = value.versions.at(-1);
    const expectedNextAfter = last && last.version < value.currentVersion ? last.version : null;
    if (value.nextAfter !== expectedNextAfter) {
        ctx.addIssue({
            code: 'custom',
            message: 'nextAfter must be the last version before currentVersion, or null at the end',
            path: ['nextAfter'],
        });
    }
});
exports.internalMemoryCompanyMapHistoryContract = {
    method: 'GET',
    path: exports.INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH,
    authType: 'secret',
    querySchema: exports.CompanyMapHistoryQuerySchema,
    responseSchema: exports.CompanyMapHistoryResponseSchema,
};
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