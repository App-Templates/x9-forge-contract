"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalMemoryCompanyContentReadContract = exports.CompanyContentReadResponseSchema = exports.CompanyContentReadRequestSchema = exports.COMPANY_CONTENT_SOURCES = exports.INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH = void 0;
const zod_1 = require("zod");
const asset_js_1 = require("../../organization/asset.cjs");
const run_context_js_1 = require("../../organization/run-context.cjs");
exports.INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH = '/internal/memory/company-content/read';
exports.COMPANY_CONTENT_SOURCES = ['publication', 'decision', 'map_entry'];
/** The service checks the requested client against the reader's attested identity. */
exports.CompanyContentReadRequestSchema = zod_1.z.strictObject({
    context: run_context_js_1.OrganizationRunContextSchema,
    /**
     * Optional since 1.65.0 (MVP, decision «Da dove il turno del Director e di Lab sa la sua azienda cliente e il suo
     * ruolo»): absent, the service uses the client company the map attests for the verified organization.
     */
    clientId: asset_js_1.AssetRefSchema.shape.companyId.optional(),
    projectId: zod_1.z.string().min(1).max(64).optional(),
    query: zod_1.z.string().min(1).max(2000).optional(),
    limit: zod_1.z.number().int().min(1).max(50).optional(),
});
exports.CompanyContentReadResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.strictObject({
        status: zod_1.z.literal('ok'),
        clientId: asset_js_1.AssetRefSchema.shape.companyId,
        items: zod_1.z.array(zod_1.z.strictObject({
            source: zod_1.z.enum(exports.COMPANY_CONTENT_SOURCES),
            ref: zod_1.z.string().min(1).max(200),
            version: zod_1.z.number().int().min(1),
            digest: asset_js_1.AssetSha256Schema,
            projectId: zod_1.z.string().min(1).max(64).optional(),
            title: zod_1.z.string().min(1).max(200).optional(),
            text: zod_1.z.string().max(65536),
        })).max(50),
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('not_authorized'),
        message: zod_1.z.string().min(1).optional(),
    }),
    zod_1.z.strictObject({
        status: zod_1.z.literal('other_client'),
        message: zod_1.z.string().min(1).optional(),
    }),
]).superRefine((response, ctx) => {
    if (response.status !== 'ok')
        return;
    const references = new Set();
    for (const [index, item] of response.items.entries()) {
        const key = JSON.stringify([item.source, item.ref]);
        if (references.has(key)) {
            ctx.addIssue({
                code: 'custom',
                message: 'Duplicate reference for the same source',
                path: ['items', index, 'ref'],
            });
        }
        references.add(key);
    }
});
exports.internalMemoryCompanyContentReadContract = {
    method: 'POST',
    path: exports.INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH,
    authType: 'secret',
    bodySchema: exports.CompanyContentReadRequestSchema,
    responseSchema: exports.CompanyContentReadResponseSchema,
};
//# sourceMappingURL=internal-memory-company-content.js.map