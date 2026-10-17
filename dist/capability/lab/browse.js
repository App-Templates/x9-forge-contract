import { z } from 'zod';
import { LabScopeSchema } from "./growth.js";
import { LabToolErrorSchema } from "./tools.js";
import { WikiClaimSchema, WikiLinkSchema, WikiPageSchema, WikiPageSlugSchema, WikiSourceSchema } from "./wiki.js";
/**
 * Browse, detail and export of an agent's wiki in cap-lab. Reuses the wiki shapes in ./wiki.ts and the scope in
 * ./growth.ts; errors are the canonical LabToolErrorSchema. Everything returned is data, never instructions.
 * The export file name is chosen by the server (never by the caller), so no path travels in the request.
 */
const CursorSchema = z.string().min(1);
export const LabPageListInputSchema = z.object({
    scope: LabScopeSchema,
    limit: z.number().int().min(1).max(200).default(50),
    cursor: CursorSchema.optional(),
}).strict();
export const LabPageListEntrySchema = WikiPageSchema.pick({
    slug: true, title: true, kind: true, version: true, updatedAt: true,
}).strict();
export const LabPageListOutputSchema = z.object({
    pages: z.array(LabPageListEntrySchema).max(200),
    /** Null means there is no subsequent page. */
    nextCursor: CursorSchema.nullable(),
}).strict();
export const LabPageDetailInputSchema = z.object({
    scope: LabScopeSchema,
    slug: WikiPageSlugSchema,
}).strict();
export const LabPageDetailOutputSchema = z.object({
    page: WikiPageSchema,
    claims: z.array(WikiClaimSchema).max(500),
    links: z.array(WikiLinkSchema).max(500),
    /** The sources the claims rest on, each with its `id` (the claims' `sourceIds`). */
    sources: z.array(WikiSourceSchema).max(500),
}).strict();
export const LabExportFormatSchema = z.enum(['markdown', 'json']);
export const LabExportRequestSchema = z.object({
    scope: LabScopeSchema,
    format: LabExportFormatSchema,
}).strict();
export const LabExportResultSchema = z.object({
    filename: z.string().regex(/^[A-Za-z0-9._-]{1,120}$/).refine(name => !name.includes('..'), {
        message: 'a file name never contains «..»',
    }),
    bytes: z.number().int().nonnegative().max(5_000_000),
    /** Version of the wiki snapshot the export was generated from. */
    generatedFrom: z.number().int().positive(),
}).strict();
/** Canonical failure for browse/detail/export: reuses the tool error codes. */
export const LabBrowseErrorSchema = z.object({ error: LabToolErrorSchema }).strict();
//# sourceMappingURL=browse.js.map