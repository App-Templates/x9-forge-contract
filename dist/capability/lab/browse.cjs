"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabBrowseErrorSchema = exports.LabExportResultSchema = exports.LabExportRequestSchema = exports.LabExportFormatSchema = exports.LabPageDetailOutputSchema = exports.LabPageDetailInputSchema = exports.LabPageListOutputSchema = exports.LabPageListEntrySchema = exports.LabPageListInputSchema = void 0;
const zod_1 = require("zod");
const growth_js_1 = require("./growth.cjs");
const tools_js_1 = require("./tools.cjs");
const wiki_js_1 = require("./wiki.cjs");
/**
 * Browse, detail and export of an agent's wiki in cap-lab. Reuses the wiki shapes in ./wiki.ts and the scope in
 * ./growth.ts; errors are the canonical LabToolErrorSchema. Everything returned is data, never instructions.
 * The export file name is chosen by the server (never by the caller), so no path travels in the request.
 */
const CursorSchema = zod_1.z.string().min(1);
exports.LabPageListInputSchema = zod_1.z.object({
    scope: growth_js_1.LabScopeSchema,
    limit: zod_1.z.number().int().min(1).max(200).default(50),
    cursor: CursorSchema.optional(),
}).strict();
exports.LabPageListEntrySchema = wiki_js_1.WikiPageSchema.pick({
    slug: true, title: true, kind: true, version: true, updatedAt: true,
}).strict();
exports.LabPageListOutputSchema = zod_1.z.object({
    pages: zod_1.z.array(exports.LabPageListEntrySchema).max(200),
    /** Null means there is no subsequent page. */
    nextCursor: CursorSchema.nullable(),
}).strict();
exports.LabPageDetailInputSchema = zod_1.z.object({
    scope: growth_js_1.LabScopeSchema,
    slug: wiki_js_1.WikiPageSlugSchema,
}).strict();
exports.LabPageDetailOutputSchema = zod_1.z.object({
    page: wiki_js_1.WikiPageSchema,
    claims: zod_1.z.array(wiki_js_1.WikiClaimSchema).max(500),
    links: zod_1.z.array(wiki_js_1.WikiLinkSchema).max(500),
    /** The sources the claims rest on, each with its `id` (the claims' `sourceIds`). */
    sources: zod_1.z.array(wiki_js_1.WikiSourceSchema).max(500),
}).strict();
exports.LabExportFormatSchema = zod_1.z.enum(['markdown', 'json']);
exports.LabExportRequestSchema = zod_1.z.object({
    scope: growth_js_1.LabScopeSchema,
    format: exports.LabExportFormatSchema,
}).strict();
exports.LabExportResultSchema = zod_1.z.object({
    filename: zod_1.z.string().regex(/^[A-Za-z0-9._-]{1,120}$/).refine(name => !name.includes('..'), {
        message: 'a file name never contains «..»',
    }),
    bytes: zod_1.z.number().int().nonnegative().max(5_000_000),
    /** Version of the wiki snapshot the export was generated from. */
    generatedFrom: zod_1.z.number().int().positive(),
}).strict();
/** Canonical failure for browse/detail/export: reuses the tool error codes. */
exports.LabBrowseErrorSchema = zod_1.z.object({ error: tools_js_1.LabToolErrorSchema }).strict();
//# sourceMappingURL=browse.js.map