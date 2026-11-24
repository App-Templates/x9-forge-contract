"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentPdfOutputSchema = exports.DocumentPdfRequestSchema = exports.DocumentPdfReferencesInputSchema = exports.DocumentPdfInputSchema = exports.DocumentPdfMarkdownSchema = exports.DOCUMENT_PDF_MAX_BYTES = exports.DOCUMENT_PDF_TOOL = void 0;
const node_crypto_1 = require("node:crypto");
const zod_1 = require("zod");
const action_plan_js_1 = require("../organization/action-plan.cjs");
const document_render_js_1 = require("./document-render.cjs");
const document_receipt_js_1 = require("./document-receipt.cjs");
const dossier_js_1 = require("./lab/dossier.cjs");
exports.DOCUMENT_PDF_TOOL = 'document_pdf';
/** Cumulative UTF-8 limit, including source, presentation and delivery metadata. */
exports.DOCUMENT_PDF_MAX_BYTES = document_render_js_1.DOCUMENT_DATA_MAX_BYTES;
const LanguageSchema = document_render_js_1.DocumentDataSchema.shape.language;
const ReferentSchema = action_plan_js_1.ActionPlanReferentRefSchema.extend({
    name: zod_1.z.string().trim().min(1).max(200),
});
/** A deliberately small Markdown subset: text, headings, lists, code and reference links.
 * Rendering must never fetch resources, interpret HTML, or execute directives.
 */
exports.DocumentPdfMarkdownSchema = zod_1.z.string().trim().min(1).max(exports.DOCUMENT_PDF_MAX_BYTES).refine(value => !/<\/?[a-z!][^>]*>/i.test(value)
    && !/!\[|^\s*\[[^\]]+\]:|\]\(\s*(?!https?:\/\/)[^)]/im.test(value)
    && !/@(?:font-face|import)|url\s*\(|\{\{|\}\}|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/i.test(value), { message: 'Markdown must contain only local, inert document content' });
const GenericDataSchema = document_render_js_1.DocumentDataSchema.refine(document => document.source.sha256 === undefined, {
    path: ['source', 'sha256'], message: 'The service computes the generic source digest',
});
/** Structured sources cannot be replaced by caller-authored blocks or Markdown.
 * The service authorizes scope and uses one common local pdfmake conversion for all variants.
 * No model credential, rendering option, filename or byte payload is accepted here.
 */
exports.DocumentPdfInputSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({
        kind: zod_1.z.literal('action_plan'),
        plan: action_plan_js_1.ActionPlanSchema,
        language: LanguageSchema,
        referents: zod_1.z.array(ReferentSchema).max(100).optional(),
        deliveryContext: document_receipt_js_1.DocumentPdfDeliveryContextSchema,
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('lab_dossier'),
        snapshot: dossier_js_1.LabDossierSnapshotSchema,
        language: LanguageSchema,
        deliveryContext: document_receipt_js_1.DocumentPdfDeliveryContextSchema,
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('document'),
        document: GenericDataSchema.optional(),
        markdown: exports.DocumentPdfMarkdownSchema.optional(),
        language: LanguageSchema,
    }),
]).superRefine((input, ctx) => {
    const issue = (path, message) => ctx.addIssue({ code: 'custom', path, message });
    if (new TextEncoder().encode(JSON.stringify(input)).byteLength > exports.DOCUMENT_PDF_MAX_BYTES) {
        issue([], 'PDF input exceeds the cumulative UTF-8 byte limit');
    }
    if (input.kind === 'action_plan') {
        const { plan, deliveryContext: context } = input;
        if (context.planId !== plan.planId || context.planVersion !== plan.version || context.planDigest !== plan.digest) {
            issue(['deliveryContext'], 'Delivery context must match the complete plan source');
        }
        const digest = (0, node_crypto_1.createHash)('sha256').update((0, action_plan_js_1.actionPlanCanonicalJson)(plan), 'utf8').digest('hex');
        if (digest !== plan.digest)
            issue(['plan', 'digest'], 'Plan digest does not match its content');
        const references = plan.businessUnits.map(unit => unit.referent);
        const seen = new Set();
        input.referents?.forEach((referent, index) => {
            if (!references.some(ref => ref.personRef === referent.personRef && ref.entryVersion === referent.entryVersion)
                || seen.has(referent.personRef)) {
                issue(['referents', index], 'Presentation referents must uniquely identify a plan referent');
            }
            seen.add(referent.personRef);
        });
    }
    else if (input.kind === 'lab_dossier') {
        if (input.deliveryContext.dossierSnapshotId !== input.snapshot.snapshotId
            || input.deliveryContext.dossierDigest !== input.snapshot.manifestDigest) {
            issue(['deliveryContext'], 'Delivery context must match the frozen dossier source');
        }
    }
    else {
        if ((input.document === undefined) === (input.markdown === undefined)) {
            issue(['document'], 'Exactly one structured document or controlled Markdown is required');
        }
        if (input.document !== undefined && input.document.language !== input.language) {
            issue(['language'], 'Language must match the structured document');
        }
    }
});
/**
 * Dossier PDF requested by references only: the caller owns no photograph. It is a request still to be resolved,
 * never a source the renderer can use: the delivery context and the dossier digest exist only after the Lab answers.
 */
exports.DocumentPdfReferencesInputSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('lab_dossier'),
    language: LanguageSchema,
    references: dossier_js_1.LabDossierReferencesSchema,
}).superRefine((input, ctx) => {
    if (new TextEncoder().encode(JSON.stringify(input)).byteLength > exports.DOCUMENT_PDF_MAX_BYTES) {
        ctx.addIssue({ code: 'custom', path: [], message: 'PDF input exceeds the cumulative UTF-8 byte limit' });
    }
});
/** What the HTTP boundary and the client accept: a complete renderer input or a reference-only dossier request. */
exports.DocumentPdfRequestSchema = zod_1.z.union([exports.DocumentPdfInputSchema, exports.DocumentPdfReferencesInputSchema]);
/** Success is emitted only after the service persists and reads back the PDF asset.
 * This shape validates the receipt; storage/readability are enforced by the issuing service.
 */
exports.DocumentPdfOutputSchema = zod_1.z.strictObject({
    receipt: document_receipt_js_1.DocumentPdfReceiptSchema,
});
//# sourceMappingURL=document-tools.js.map