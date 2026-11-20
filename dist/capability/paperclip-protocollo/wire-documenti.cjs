"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipConfermaDocumentoCorpoSchema = exports.PAPERCLIP_CONFERMA_CONTINUATION_POLICIES = exports.PaperclipDocumentoConflittoSchema = exports.PaperclipIncaricoConDocumentiSchema = exports.PaperclipPianoLegacySchema = exports.PaperclipDocumentoLettoSchema = exports.PaperclipDocumentoAggiornaCorpoSchema = exports.PaperclipDocumentoCreaCorpoSchema = exports.PaperclipDocumentoScriviCorpoSchema = exports.PAPERCLIP_DOCUMENT_BODY_MAX = exports.PAPERCLIP_DOCUMENT_FORMATS = exports.PaperclipDocumentoChiaveSchema = exports.PAPERCLIP_DOCUMENT_KEY_PATTERN = void 0;
exports.paperclipDocumentoScritto = paperclipDocumentoScritto;
exports.paperclipConfermaPianoIdempotencyKey = paperclipConfermaPianoIdempotencyKey;
const zod_1 = require("zod");
const wire_letture_js_1 = require("./wire-letture.cjs");
// Paperclip validators/issue.ts:1153-1161. Require the already lowercase wire key.
exports.PAPERCLIP_DOCUMENT_KEY_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
exports.PaperclipDocumentoChiaveSchema = zod_1.z.string().trim().min(1).max(64).regex(exports.PAPERCLIP_DOCUMENT_KEY_PATTERN);
// Paperclip validators/issue.ts:2158-2172.
exports.PAPERCLIP_DOCUMENT_FORMATS = ['markdown'];
exports.PAPERCLIP_DOCUMENT_BODY_MAX = 524288;
// PUT document: creation has no base; updates use the latest revision just read.
exports.PaperclipDocumentoScriviCorpoSchema = zod_1.z.strictObject({
    title: zod_1.z.string().trim().max(200).nullable().optional(),
    format: zod_1.z.enum(exports.PAPERCLIP_DOCUMENT_FORMATS),
    body: zod_1.z.string().max(exports.PAPERCLIP_DOCUMENT_BODY_MAX),
    changeSummary: zod_1.z.string().trim().max(500).nullable().optional(),
    baseRevisionId: zod_1.z.guid().nullable().optional(),
});
exports.PaperclipDocumentoCreaCorpoSchema = exports.PaperclipDocumentoScriviCorpoSchema.refine((corpo) => corpo.baseRevisionId === undefined || corpo.baseRevisionId === null, { message: 'a creation has no baseRevisionId', path: ['baseRevisionId'] });
exports.PaperclipDocumentoAggiornaCorpoSchema = exports.PaperclipDocumentoScriviCorpoSchema.extend({
    baseRevisionId: zod_1.z.guid(),
});
// Paperclip services/documents.ts:60-84: summaries omit body; unrevised documents have a null revision.
exports.PaperclipDocumentoLettoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
    issueId: zod_1.z.guid(),
    key: exports.PaperclipDocumentoChiaveSchema,
    title: zod_1.z.string().nullable(),
    format: zod_1.z.enum(exports.PAPERCLIP_DOCUMENT_FORMATS),
    body: zod_1.z.string().optional(),
    latestRevisionId: zod_1.z.guid().nullable(),
    latestRevisionNumber: zod_1.z.number().int().min(0),
    lockedAt: zod_1.z.string().nullable().optional(),
    lockedByAgentId: zod_1.z.guid().nullable().optional(),
    lockedByUserId: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().min(1).optional(),
    updatedAt: zod_1.z.string().min(1).optional(),
});
// Paperclip services/documents.ts:116-148; routes/issues.ts:8833-8842.
exports.PaperclipPianoLegacySchema = zod_1.z.looseObject({
    key: zod_1.z.literal('plan'),
    body: zod_1.z.string(),
    source: zod_1.z.literal('issue_description'),
});
exports.PaperclipIncaricoConDocumentiSchema = wire_letture_js_1.PaperclipIncaricoSchema.extend({
    planDocument: exports.PaperclipDocumentoLettoSchema.nullable().optional(),
    documentSummaries: zod_1.z.array(exports.PaperclipDocumentoLettoSchema).optional(),
    legacyPlanDocument: exports.PaperclipPianoLegacySchema.nullable().optional(),
});
// Paperclip services/documents.ts:350-359: revision conflicts carry the current revision in details.
exports.PaperclipDocumentoConflittoSchema = zod_1.z.looseObject({
    error: zod_1.z.string(),
    details: zod_1.z.looseObject({ currentRevisionId: zod_1.z.guid().optional() }).optional(),
});
// Paperclip services/documents.ts:19-31,219-259: writing a locked document creates a new key.
function paperclipDocumentoScritto(chiaveChiesta, risposta) {
    const chiesta = exports.PaperclipDocumentoChiaveSchema.parse(chiaveChiesta);
    const key = exports.PaperclipDocumentoChiaveSchema.parse(risposta.key);
    return { key, rediretto: key !== chiesta };
}
function paperclipConfermaPianoIdempotencyKey(issueId, latestRevisionId) {
    return `confirmation:${zod_1.z.guid().parse(issueId)}:plan:${zod_1.z.guid().parse(latestRevisionId)}`;
}
// Paperclip constants.ts:342-346; require an explicit policy instead of the server default 'none'.
exports.PAPERCLIP_CONFERMA_CONTINUATION_POLICIES = ['none', 'wake_assignee', 'wake_assignee_on_accept'];
// Paperclip validators/issue.ts:1467-1476: anchors, local paths and HTTP(S) URLs only.
const PaperclipConfermaHrefSchema = zod_1.z.string().trim().min(1).max(2000).refine((valore) => valore.startsWith('#') || (valore.startsWith('/') && !valore.startsWith('//')) || /^https?:\/\//i.test(valore), { message: 'href must be an anchor, a path or an http(s) URL' });
// Paperclip validators/issue.ts:1483-1492,1534-1552,1972-1982.
exports.PaperclipConfermaDocumentoCorpoSchema = zod_1.z.strictObject({
    kind: zod_1.z.literal('request_confirmation'),
    idempotencyKey: zod_1.z.string().trim().min(1).max(255),
    continuationPolicy: zod_1.z.enum(exports.PAPERCLIP_CONFERMA_CONTINUATION_POLICIES),
    title: zod_1.z.string().trim().max(240).nullable().optional(),
    summary: zod_1.z.string().trim().max(1000).nullable().optional(),
    payload: zod_1.z.strictObject({
        version: zod_1.z.literal(1),
        prompt: zod_1.z.string().trim().min(1).max(1000),
        acceptLabel: zod_1.z.string().trim().min(1).max(80).nullable().optional(),
        rejectLabel: zod_1.z.string().trim().min(1).max(80).nullable().optional(),
        rejectRequiresReason: zod_1.z.boolean().optional(),
        detailsMarkdown: zod_1.z.string().max(20000).nullable().optional(),
        supersedeOnUserComment: zod_1.z.boolean().optional(),
        target: zod_1.z.strictObject({
            type: zod_1.z.literal('issue_document'),
            key: exports.PaperclipDocumentoChiaveSchema,
            revisionId: zod_1.z.guid(),
            issueId: zod_1.z.guid().nullable().optional(),
            documentId: zod_1.z.guid().nullable().optional(),
            revisionNumber: zod_1.z.number().int().positive().nullable().optional(),
            label: zod_1.z.string().trim().min(1).max(120).nullable().optional(),
            href: PaperclipConfermaHrefSchema.nullable().optional(),
        }),
    }),
});
//# sourceMappingURL=wire-documenti.js.map