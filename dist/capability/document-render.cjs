"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentDataSchema = exports.DocumentBlockSchema = exports.DocumentTableSchema = exports.DocumentSourceSchema = exports.DocumentInlineSchema = exports.DOCUMENT_DATA_MAX_CELLS = exports.DOCUMENT_DATA_MAX_BLOCKS = exports.DOCUMENT_DATA_MAX_BYTES = void 0;
exports.documentDataCanonicalJson = documentDataCanonicalJson;
const zod_1 = require("zod");
const action_plan_js_1 = require("../organization/action-plan.cjs");
const asset_js_1 = require("../organization/asset.cjs");
/** Limits apply to the complete document, including table headers; exceeding them fails. */
exports.DOCUMENT_DATA_MAX_BYTES = 1024 * 1024;
exports.DOCUMENT_DATA_MAX_BLOCKS = 1000;
exports.DOCUMENT_DATA_MAX_CELLS = 20000;
// Text is literal data. HTML is deliberately excluded, including in code blocks.
const TextSchema = zod_1.z.string().max(65536).refine(value => !/<\/?[a-z!][^>]*>/i.test(value), {
    message: 'HTML markup is not document data',
});
const LabelSchema = TextSchema.refine(value => value.trim().length > 0, { message: 'Text must not be blank' });
exports.DocumentInlineSchema = zod_1.z.strictObject({
    text: TextSchema,
    bold: zod_1.z.boolean().optional(),
    italic: zod_1.z.boolean().optional(),
    /** A reference only: consumers must not fetch it to render the document. */
    href: zod_1.z.url({ protocol: /^https?$/ }).max(2048).optional(),
});
const ContentSchema = zod_1.z.array(exports.DocumentInlineSchema).min(1).max(1000);
exports.DocumentSourceSchema = zod_1.z.strictObject({
    kind: LabelSchema,
    id: LabelSchema,
    version: LabelSchema.optional(),
    /** Digest of the source, distinct from the document-data digest and rendered PDF bytes. */
    sha256: asset_js_1.AssetSha256Schema.optional(),
});
exports.DocumentTableSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('table'),
    header: zod_1.z.array(ContentSchema).min(1).max(200),
    rows: zod_1.z.array(zod_1.z.array(ContentSchema).min(1).max(200)).min(1).max(1000),
    /** Relative column weights only; physical sizes belong to the rendering capability. */
    widths: zod_1.z.array(zod_1.z.union([zod_1.z.number().finite().positive(), zod_1.z.literal('*')])).min(1).max(200).optional(),
}).superRefine(({ header, rows, widths }, ctx) => {
    const columns = header.length;
    const rectangular = rows.every(row => row.length === columns);
    if (!rectangular) {
        ctx.addIssue({ code: 'custom', path: ['rows'], message: 'Table rows must be rectangular' });
    }
    if (widths !== undefined && widths.length !== columns) {
        ctx.addIssue({ code: 'custom', path: ['widths'], message: 'Table widths must match the header' });
    }
});
exports.DocumentBlockSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('heading'), level: zod_1.z.number().int().min(1).max(6), content: ContentSchema }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('paragraph'), content: ContentSchema }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('list'), ordered: zod_1.z.boolean(), items: zod_1.z.array(ContentSchema).min(1).max(1000) }),
    exports.DocumentTableSchema,
    zod_1.z.strictObject({ kind: zod_1.z.literal('code'), language: LabelSchema.optional(), text: TextSchema }),
]);
/** Portable semantic content only: no HTML, fonts, downloads, callbacks or pagination options. */
exports.DocumentDataSchema = zod_1.z.strictObject({
    title: LabelSchema,
    language: zod_1.z.string().min(2).max(64).regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/),
    source: exports.DocumentSourceSchema,
    blocks: zod_1.z.array(exports.DocumentBlockSchema).min(1).max(exports.DOCUMENT_DATA_MAX_BLOCKS),
}).superRefine((document, ctx) => {
    const cells = document.blocks.reduce((sum, block) => block.kind === 'table'
        ? sum + block.header.length + block.rows.reduce((count, row) => count + row.length, 0)
        : sum, 0);
    if (cells > exports.DOCUMENT_DATA_MAX_CELLS) {
        ctx.addIssue({ code: 'custom', path: ['blocks'], message: 'Document exceeds the total cell limit' });
    }
    if (new TextEncoder().encode(JSON.stringify(document)).byteLength > exports.DOCUMENT_DATA_MAX_BYTES) {
        ctx.addIssue({ code: 'custom', message: 'Document exceeds the UTF-8 byte limit' });
    }
});
/** UTF-8 input for a SHA-256 of document data, separate from plan and PDF digests.
 * Validates before serializing; preserves array order and every block and cell.
 */
function documentDataCanonicalJson(value) {
    const document = exports.DocumentDataSchema.parse(value);
    // JSON serialization omits explicitly undefined optional fields before sorting keys.
    return (0, action_plan_js_1.canonicalJson)(JSON.parse(JSON.stringify(document)));
}
//# sourceMappingURL=document-render.js.map