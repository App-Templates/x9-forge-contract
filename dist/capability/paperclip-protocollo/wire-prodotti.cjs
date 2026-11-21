"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_PREVIEW_PROVIDER = exports.PaperclipIncaricoConProdottiSchema = exports.PaperclipProdottiSchema = exports.PaperclipProdottoSchema = exports.PaperclipProdottoAggiornaCorpoSchema = exports.PaperclipProdottoCreaCorpoSchema = exports.PaperclipProdottoMetadatiAllegatoSchema = exports.PaperclipProdottoRevisioneSchema = exports.PaperclipProdottoStatoSchema = exports.PaperclipProdottoTipoSchema = exports.PAPERCLIP_WORK_PRODUCT_HEALTH = exports.PAPERCLIP_WORK_PRODUCT_REVIEW_STATES = exports.PAPERCLIP_WORK_PRODUCT_STATUSES = exports.PAPERCLIP_WORK_PRODUCT_TYPES = void 0;
exports.paperclipProdottoDaAllegato = paperclipProdottoDaAllegato;
exports.paperclipProdottoDaAnteprima = paperclipProdottoDaAnteprima;
exports.paperclipProdottoEAnteprima = paperclipProdottoEAnteprima;
exports.paperclipProdottoDaFileLink = paperclipProdottoDaFileLink;
exports.paperclipProdottoEFileLink = paperclipProdottoEFileLink;
exports.paperclipProdottoDellaCorsa = paperclipProdottoDellaCorsa;
const zod_1 = require("zod");
const wire_letture_js_1 = require("./wire-letture.cjs");
// Paperclip packages/shared/src/validators/work-product.ts:9-17,19-29,31-36.
exports.PAPERCLIP_WORK_PRODUCT_TYPES = [
    'preview_url', 'runtime_service', 'pull_request', 'branch', 'commit', 'artifact', 'document',
];
exports.PAPERCLIP_WORK_PRODUCT_STATUSES = [
    'active', 'ready_for_review', 'approved', 'changes_requested', 'merged', 'closed', 'failed', 'archived', 'draft',
];
exports.PAPERCLIP_WORK_PRODUCT_REVIEW_STATES = [
    'none', 'needs_board_review', 'approved', 'changes_requested',
];
exports.PAPERCLIP_WORK_PRODUCT_HEALTH = ['unknown', 'healthy', 'unhealthy'];
exports.PaperclipProdottoTipoSchema = zod_1.z.enum(exports.PAPERCLIP_WORK_PRODUCT_TYPES);
exports.PaperclipProdottoStatoSchema = zod_1.z.enum(exports.PAPERCLIP_WORK_PRODUCT_STATUSES);
exports.PaperclipProdottoRevisioneSchema = zod_1.z.enum(exports.PAPERCLIP_WORK_PRODUCT_REVIEW_STATES);
// Paperclip validators/work-product.ts:38-69 e routes/issues.ts:4443-4480: per `artifact` +
// `paperclip` il client manda SOLO `{attachmentId}`; contentType, byteSize, percorsi e nome
// li ricalcola il server (422 invalid_attachment_artifact_metadata se manca o non e' dell'incarico).
exports.PaperclipProdottoMetadatiAllegatoSchema = zod_1.z.strictObject({ attachmentId: zod_1.z.guid() });
const campiProdotto = {
    projectId: zod_1.z.guid().nullable().optional(),
    executionWorkspaceId: zod_1.z.guid().nullable().optional(),
    runtimeServiceId: zod_1.z.guid().nullable().optional(),
    type: exports.PaperclipProdottoTipoSchema,
    provider: zod_1.z.string().min(1),
    externalId: zod_1.z.string().nullable().optional(),
    title: zod_1.z.string().min(1),
    url: zod_1.z.url().nullable().optional(),
    status: exports.PaperclipProdottoStatoSchema.optional(),
    reviewState: exports.PaperclipProdottoRevisioneSchema.optional(),
    isPrimary: zod_1.z.boolean().optional(),
    healthStatus: zod_1.z.enum(exports.PAPERCLIP_WORK_PRODUCT_HEALTH).optional(),
    summary: zod_1.z.string().nullable().optional(),
    metadata: zod_1.z.looseObject({}).nullable().optional(),
    createdByRunId: zod_1.z.guid().nullable().optional(),
};
function controllaMetadatiAllegato(value, ctx, richiesti) {
    if (value.type !== 'artifact' || value.provider !== 'paperclip')
        return;
    if (value.metadata === undefined || value.metadata === null) {
        if (richiesti)
            ctx.addIssue({ code: 'custom', path: ['metadata'], message: 'artifact/paperclip requires metadata { attachmentId }' });
        return;
    }
    const parsed = exports.PaperclipProdottoMetadatiAllegatoSchema.safeParse(value.metadata);
    if (!parsed.success)
        ctx.addIssue({ code: 'custom', path: ['metadata'], message: 'artifact/paperclip metadata is only { attachmentId }' });
}
// Paperclip validators/work-product.ts:81-97 (POST /api/issues/:id/work-products).
exports.PaperclipProdottoCreaCorpoSchema = zod_1.z
    .strictObject(campiProdotto)
    .superRefine((value, ctx) => controllaMetadatiAllegato(value, ctx, true));
// Paperclip validators/work-product.ts:101-103 (PATCH /api/work-products/:id): tutto opzionale.
exports.PaperclipProdottoAggiornaCorpoSchema = zod_1.z
    .strictObject(campiProdotto)
    .partial()
    .superRefine((value, ctx) => controllaMetadatiAllegato(value, ctx, false));
// Riga letta: Paperclip server/src/services/work-products.ts:126-148.
exports.PaperclipProdottoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
    issueId: zod_1.z.guid(),
    projectId: zod_1.z.guid().nullable().optional(),
    executionWorkspaceId: zod_1.z.guid().nullable().optional(),
    runtimeServiceId: zod_1.z.guid().nullable().optional(),
    type: exports.PaperclipProdottoTipoSchema,
    provider: zod_1.z.string().min(1),
    externalId: zod_1.z.string().nullable().optional(),
    title: zod_1.z.string().min(1),
    url: zod_1.z.string().nullable().optional(),
    status: exports.PaperclipProdottoStatoSchema,
    reviewState: exports.PaperclipProdottoRevisioneSchema,
    isPrimary: zod_1.z.boolean(),
    healthStatus: zod_1.z.enum(exports.PAPERCLIP_WORK_PRODUCT_HEALTH),
    summary: zod_1.z.string().nullable().optional(),
    metadata: zod_1.z.looseObject({}).nullable().optional(),
    createdByRunId: zod_1.z.guid().nullable().optional(),
    createdAt: zod_1.z.string().min(1),
    updatedAt: zod_1.z.string().min(1),
});
exports.PaperclipProdottiSchema = zod_1.z.array(exports.PaperclipProdottoSchema);
// `GET /api/issues/:id` porta gia' i prodotti (routes/issues.ts:8840).
exports.PaperclipIncaricoConProdottiSchema = wire_letture_js_1.PaperclipIncaricoSchema.extend({
    workProducts: exports.PaperclipProdottiSchema.optional(),
});
/**
 * Il prodotto durevole di un file gia' caricato (caso vero 2): `artifact` + `paperclip` + `{attachmentId}`.
 * Titolo dal nome del file come fa il server (services/issues.ts:12938-12966); nasce `active`, non primario.
 */
function paperclipProdottoDaAllegato(allegato, opzioni = {}) {
    return exports.PaperclipProdottoCreaCorpoSchema.parse({
        type: 'artifact',
        provider: 'paperclip',
        title: opzioni.title ?? allegato.originalFilename ?? 'Attachment',
        status: opzioni.status ?? 'active',
        reviewState: opzioni.reviewState ?? 'none',
        isPrimary: opzioni.isPrimary ?? false,
        ...(opzioni.summary === undefined ? {} : { summary: opzioni.summary }),
        ...(opzioni.createdByRunId === undefined ? {} : { createdByRunId: opzioni.createdByRunId }),
        metadata: { attachmentId: allegato.id },
    });
}
exports.PAPERCLIP_PREVIEW_PROVIDER = 'x9';
// Require a secure demo link and a canonical file digest so consumers can register it once.
function paperclipProdottoDaAnteprima(anteprima) {
    if (!/^[0-9a-f]{64}$/.test(anteprima.sha256)) {
        throw new Error('Preview sha256 must contain exactly 64 lowercase hexadecimal digits');
    }
    if (!anteprima.url.startsWith('https://')) {
        throw new Error('Preview URL must use https://');
    }
    return exports.PaperclipProdottoCreaCorpoSchema.parse({
        type: 'preview_url',
        provider: exports.PAPERCLIP_PREVIEW_PROVIDER,
        externalId: anteprima.sha256,
        title: anteprima.title,
        url: anteprima.url,
        status: 'active',
        reviewState: 'none',
        isPrimary: false,
        ...(anteprima.summary === undefined ? {} : { summary: anteprima.summary }),
        ...(anteprima.createdByRunId === undefined ? {} : { createdByRunId: anteprima.createdByRunId }),
    });
}
// Scope digest matching to X9 previews to avoid treating another product as an existing demo.
function paperclipProdottoEAnteprima(prodotto, sha256) {
    return prodotto.type === 'preview_url'
        && prodotto.provider === exports.PAPERCLIP_PREVIEW_PROVIDER
        && prodotto.externalId === sha256;
}
// A file above the attachment cap is recorded as a `document` product carrying its link, keyed by digest.
function paperclipProdottoDaFileLink(file) {
    if (!/^[0-9a-f]{64}$/.test(file.sha256)) {
        throw new Error('File sha256 must contain exactly 64 lowercase hexadecimal digits');
    }
    if (!file.url.startsWith('https://')) {
        throw new Error('File URL must use https://');
    }
    return exports.PaperclipProdottoCreaCorpoSchema.parse({
        type: 'document',
        provider: exports.PAPERCLIP_PREVIEW_PROVIDER,
        externalId: file.sha256,
        title: file.title,
        url: file.url,
        status: 'active',
        reviewState: 'none',
        isPrimary: false,
        ...(file.summary === undefined ? {} : { summary: file.summary }),
        ...(file.createdByRunId === undefined ? {} : { createdByRunId: file.createdByRunId }),
    });
}
// Scope digest matching to X9 documents so another product is never taken for an existing file link.
function paperclipProdottoEFileLink(prodotto, sha256) {
    return prodotto.type === 'document'
        && prodotto.provider === exports.PAPERCLIP_PREVIEW_PROVIDER
        && prodotto.externalId === sha256;
}
/** Paperclip routes/issues.ts:6331-6336: `createdByRunId` deve essere la corsa autenticata (403 altrimenti). */
function paperclipProdottoDellaCorsa(corpo, runIdAutenticata) {
    return corpo.createdByRunId === undefined || corpo.createdByRunId === null || corpo.createdByRunId === runIdAutenticata;
}
//# sourceMappingURL=wire-prodotti.js.map