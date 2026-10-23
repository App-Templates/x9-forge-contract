import { z } from 'zod';
import { AssetRefSchema, AssetSha256Schema } from "../../organization/asset.js";
import { OrganizationRunContextSchema } from "../../organization/run-context.js";
export const INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH = '/internal/memory/company-content/read';
export const COMPANY_CONTENT_SOURCES = ['publication', 'decision', 'map_entry'];
/** The service checks the requested client against the reader's attested identity. */
export const CompanyContentReadRequestSchema = z.strictObject({
    context: OrganizationRunContextSchema,
    clientId: AssetRefSchema.shape.companyId,
    projectId: z.string().min(1).max(64).optional(),
    query: z.string().min(1).max(2000).optional(),
    limit: z.number().int().min(1).max(50).optional(),
});
export const CompanyContentReadResponseSchema = z.discriminatedUnion('status', [
    z.strictObject({
        status: z.literal('ok'),
        clientId: AssetRefSchema.shape.companyId,
        items: z.array(z.strictObject({
            source: z.enum(COMPANY_CONTENT_SOURCES),
            ref: z.string().min(1).max(200),
            version: z.number().int().min(1),
            digest: AssetSha256Schema,
            projectId: z.string().min(1).max(64).optional(),
            title: z.string().min(1).max(200).optional(),
            text: z.string().max(65536),
        })).max(50),
    }),
    z.strictObject({
        status: z.literal('not_authorized'),
        message: z.string().min(1).optional(),
    }),
    z.strictObject({
        status: z.literal('other_client'),
        message: z.string().min(1).optional(),
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
export const internalMemoryCompanyContentReadContract = {
    method: 'POST',
    path: INTERNAL_MEMORY_COMPANY_CONTENT_READ_PATH,
    authType: 'secret',
    bodySchema: CompanyContentReadRequestSchema,
    responseSchema: CompanyContentReadResponseSchema,
};
//# sourceMappingURL=internal-memory-company-content.js.map