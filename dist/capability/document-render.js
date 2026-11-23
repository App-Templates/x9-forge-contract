import { z } from 'zod';
import { canonicalJson } from "../organization/action-plan.js";
import { AssetSha256Schema } from "../organization/asset.js";
/** Limits apply to the complete document, including table headers; exceeding them fails. */
export const DOCUMENT_DATA_MAX_BYTES = 1024 * 1024;
export const DOCUMENT_DATA_MAX_BLOCKS = 1000;
export const DOCUMENT_DATA_MAX_CELLS = 20000;
// Text is literal data. HTML is deliberately excluded, including in code blocks.
const TextSchema = z.string().max(65536).refine(value => !/<\/?[a-z!][^>]*>/i.test(value), {
    message: 'HTML markup is not document data',
});
const LabelSchema = TextSchema.refine(value => value.trim().length > 0, { message: 'Text must not be blank' });
export const DocumentInlineSchema = z.strictObject({
    text: TextSchema,
    bold: z.boolean().optional(),
    italic: z.boolean().optional(),
    /** A reference only: consumers must not fetch it to render the document. */
    href: z.url({ protocol: /^https?$/ }).max(2048).optional(),
});
const ContentSchema = z.array(DocumentInlineSchema).min(1).max(1000);
export const DocumentSourceSchema = z.strictObject({
    kind: LabelSchema,
    id: LabelSchema,
    version: LabelSchema.optional(),
    /** Digest of the source, distinct from the document-data digest and rendered PDF bytes. */
    sha256: AssetSha256Schema.optional(),
});
export const DocumentTableSchema = z.strictObject({
    kind: z.literal('table'),
    header: z.array(ContentSchema).min(1).max(200),
    rows: z.array(z.array(ContentSchema).min(1).max(200)).min(1).max(1000),
    /** Relative column weights only; physical sizes belong to the rendering capability. */
    widths: z.array(z.union([z.number().finite().positive(), z.literal('*')])).min(1).max(200).optional(),
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
export const DocumentBlockSchema = z.discriminatedUnion('kind', [
    z.strictObject({ kind: z.literal('heading'), level: z.number().int().min(1).max(6), content: ContentSchema }),
    z.strictObject({ kind: z.literal('paragraph'), content: ContentSchema }),
    z.strictObject({ kind: z.literal('list'), ordered: z.boolean(), items: z.array(ContentSchema).min(1).max(1000) }),
    DocumentTableSchema,
    z.strictObject({ kind: z.literal('code'), language: LabelSchema.optional(), text: TextSchema }),
]);
/** Portable semantic content only: no HTML, fonts, downloads, callbacks or pagination options. */
export const DocumentDataSchema = z.strictObject({
    title: LabelSchema,
    language: z.string().min(2).max(64).regex(/^[a-zA-Z]{2,3}(?:-[a-zA-Z0-9]{2,8})*$/),
    source: DocumentSourceSchema,
    blocks: z.array(DocumentBlockSchema).min(1).max(DOCUMENT_DATA_MAX_BLOCKS),
}).superRefine((document, ctx) => {
    const cells = document.blocks.reduce((sum, block) => block.kind === 'table'
        ? sum + block.header.length + block.rows.reduce((count, row) => count + row.length, 0)
        : sum, 0);
    if (cells > DOCUMENT_DATA_MAX_CELLS) {
        ctx.addIssue({ code: 'custom', path: ['blocks'], message: 'Document exceeds the total cell limit' });
    }
    if (new TextEncoder().encode(JSON.stringify(document)).byteLength > DOCUMENT_DATA_MAX_BYTES) {
        ctx.addIssue({ code: 'custom', message: 'Document exceeds the UTF-8 byte limit' });
    }
});
/** UTF-8 input for a SHA-256 of document data, separate from plan and PDF digests.
 * Validates before serializing; preserves array order and every block and cell.
 */
export function documentDataCanonicalJson(value) {
    const document = DocumentDataSchema.parse(value);
    // JSON serialization omits explicitly undefined optional fields before sorting keys.
    return canonicalJson(JSON.parse(JSON.stringify(document)));
}
//# sourceMappingURL=document-render.js.map