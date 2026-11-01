import { z } from 'zod';
import { CompanyMapAccessFieldsSchema, CompanyMapAnyEntrySchema, CompanyMapAssetFieldsSchema, CompanyMapEntryKindSchema, CompanyMapEntrySchema, CompanyMapPersonFieldsSchema, CompanyMapReferentFieldsSchema, CompanyMapResponsibilityFieldsSchema, CompanyMapScopeFieldsSchema, checkCompanyMapLevelScope, } from "../../organization/company-map.js";
export const INTERNAL_MEMORY_COMPANY_MAP_ENTRIES_PATH = '/internal/memory/company-map/entries';
export const INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH = '/internal/memory/company-map/history';
const entryShape = CompanyMapEntrySchema.shape;
/** Fields every write body carries: scope, source and confirmation date. Version, digest and supersedes come from the server. */
const writeCommonShape = {
    ...CompanyMapScopeFieldsSchema.shape,
    source: entryShape.source,
    confirmedAt: entryShape.confirmedAt,
};
/** POST body of a «referent» entry (F1B-03, unchanged). */
export const CompanyMapReferentWriteRequestSchema = z
    .strictObject({ ...writeCommonShape, ...CompanyMapReferentFieldsSchema.shape })
    .superRefine(checkCompanyMapLevelScope);
/** POST body: one of the five entry kinds; version, digest and supersedes are assigned by the server. */
export const CompanyMapEntryWriteRequestSchema = z.discriminatedUnion('kind', [
    CompanyMapReferentWriteRequestSchema,
    z.strictObject({ ...writeCommonShape, ...CompanyMapPersonFieldsSchema.shape }).superRefine(checkCompanyMapLevelScope),
    z.strictObject({ ...writeCommonShape, ...CompanyMapResponsibilityFieldsSchema.shape }).superRefine(checkCompanyMapLevelScope),
    z.strictObject({ ...writeCommonShape, ...CompanyMapAssetFieldsSchema.shape }).superRefine(checkCompanyMapLevelScope),
    z.strictObject({ ...writeCommonShape, ...CompanyMapAccessFieldsSchema.shape }).superRefine(checkCompanyMapLevelScope),
]);
export const CompanyMapEntryWriteResponseSchema = z.strictObject({ entry: CompanyMapAnyEntrySchema });
/** GET: current entries of one level of the map, optionally of one kind. */
export const CompanyMapEntriesQuerySchema = z
    .strictObject({
    tenantId: entryShape.tenantId,
    organizationId: entryShape.organizationId,
    clientId: entryShape.clientId,
    level: entryShape.level,
    projectId: entryShape.projectId,
    buSlug: entryShape.buSlug,
    kind: CompanyMapEntryKindSchema.optional(),
})
    .superRefine(checkCompanyMapLevelScope);
export const CompanyMapEntriesResponseSchema = z.strictObject({
    entries: z.array(CompanyMapAnyEntrySchema).max(200),
});
/** History of one complete entry key; entryRef is personRef, accessRef or asset.assetId according to kind. */
export const CompanyMapHistoryQuerySchema = z.strictObject({
    ...CompanyMapScopeFieldsSchema.shape,
    kind: CompanyMapEntryKindSchema,
    entryRef: z.string().min(1).max(64),
    after: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
}).superRefine(checkCompanyMapLevelScope);
export const CompanyMapHistoryResponseSchema = z.strictObject({
    versions: z.array(CompanyMapAnyEntrySchema).max(50),
    currentVersion: z.number().int().min(1),
    nextAfter: z.number().int().min(1).nullable(),
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
export const internalMemoryCompanyMapHistoryContract = {
    method: 'GET',
    path: INTERNAL_MEMORY_COMPANY_MAP_HISTORY_PATH,
    authType: 'secret',
    querySchema: CompanyMapHistoryQuerySchema,
    responseSchema: CompanyMapHistoryResponseSchema,
};
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