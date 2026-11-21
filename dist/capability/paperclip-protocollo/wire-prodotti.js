import { z } from 'zod';
import { PaperclipIncaricoSchema } from "./wire-letture.js";
// Paperclip packages/shared/src/validators/work-product.ts:9-17,19-29,31-36.
export const PAPERCLIP_WORK_PRODUCT_TYPES = [
    'preview_url', 'runtime_service', 'pull_request', 'branch', 'commit', 'artifact', 'document',
];
export const PAPERCLIP_WORK_PRODUCT_STATUSES = [
    'active', 'ready_for_review', 'approved', 'changes_requested', 'merged', 'closed', 'failed', 'archived', 'draft',
];
export const PAPERCLIP_WORK_PRODUCT_REVIEW_STATES = [
    'none', 'needs_board_review', 'approved', 'changes_requested',
];
export const PAPERCLIP_WORK_PRODUCT_HEALTH = ['unknown', 'healthy', 'unhealthy'];
export const PaperclipProdottoTipoSchema = z.enum(PAPERCLIP_WORK_PRODUCT_TYPES);
export const PaperclipProdottoStatoSchema = z.enum(PAPERCLIP_WORK_PRODUCT_STATUSES);
export const PaperclipProdottoRevisioneSchema = z.enum(PAPERCLIP_WORK_PRODUCT_REVIEW_STATES);
// Paperclip validators/work-product.ts:38-69 e routes/issues.ts:4443-4480: per `artifact` +
// `paperclip` il client manda SOLO `{attachmentId}`; contentType, byteSize, percorsi e nome
// li ricalcola il server (422 invalid_attachment_artifact_metadata se manca o non e' dell'incarico).
export const PaperclipProdottoMetadatiAllegatoSchema = z.strictObject({ attachmentId: z.guid() });
const campiProdotto = {
    projectId: z.guid().nullable().optional(),
    executionWorkspaceId: z.guid().nullable().optional(),
    runtimeServiceId: z.guid().nullable().optional(),
    type: PaperclipProdottoTipoSchema,
    provider: z.string().min(1),
    externalId: z.string().nullable().optional(),
    title: z.string().min(1),
    url: z.url().nullable().optional(),
    status: PaperclipProdottoStatoSchema.optional(),
    reviewState: PaperclipProdottoRevisioneSchema.optional(),
    isPrimary: z.boolean().optional(),
    healthStatus: z.enum(PAPERCLIP_WORK_PRODUCT_HEALTH).optional(),
    summary: z.string().nullable().optional(),
    metadata: z.looseObject({}).nullable().optional(),
    createdByRunId: z.guid().nullable().optional(),
};
function controllaMetadatiAllegato(value, ctx, richiesti) {
    if (value.type !== 'artifact' || value.provider !== 'paperclip')
        return;
    if (value.metadata === undefined || value.metadata === null) {
        if (richiesti)
            ctx.addIssue({ code: 'custom', path: ['metadata'], message: 'artifact/paperclip requires metadata { attachmentId }' });
        return;
    }
    const parsed = PaperclipProdottoMetadatiAllegatoSchema.safeParse(value.metadata);
    if (!parsed.success)
        ctx.addIssue({ code: 'custom', path: ['metadata'], message: 'artifact/paperclip metadata is only { attachmentId }' });
}
// Paperclip validators/work-product.ts:81-97 (POST /api/issues/:id/work-products).
export const PaperclipProdottoCreaCorpoSchema = z
    .strictObject(campiProdotto)
    .superRefine((value, ctx) => controllaMetadatiAllegato(value, ctx, true));
// Paperclip validators/work-product.ts:101-103 (PATCH /api/work-products/:id): tutto opzionale.
export const PaperclipProdottoAggiornaCorpoSchema = z
    .strictObject(campiProdotto)
    .partial()
    .superRefine((value, ctx) => controllaMetadatiAllegato(value, ctx, false));
// Riga letta: Paperclip server/src/services/work-products.ts:126-148.
export const PaperclipProdottoSchema = z.looseObject({
    id: z.guid(),
    companyId: z.guid(),
    issueId: z.guid(),
    projectId: z.guid().nullable().optional(),
    executionWorkspaceId: z.guid().nullable().optional(),
    runtimeServiceId: z.guid().nullable().optional(),
    type: PaperclipProdottoTipoSchema,
    provider: z.string().min(1),
    externalId: z.string().nullable().optional(),
    title: z.string().min(1),
    url: z.string().nullable().optional(),
    status: PaperclipProdottoStatoSchema,
    reviewState: PaperclipProdottoRevisioneSchema,
    isPrimary: z.boolean(),
    healthStatus: z.enum(PAPERCLIP_WORK_PRODUCT_HEALTH),
    summary: z.string().nullable().optional(),
    metadata: z.looseObject({}).nullable().optional(),
    createdByRunId: z.guid().nullable().optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
});
export const PaperclipProdottiSchema = z.array(PaperclipProdottoSchema);
// `GET /api/issues/:id` porta gia' i prodotti (routes/issues.ts:8840).
export const PaperclipIncaricoConProdottiSchema = PaperclipIncaricoSchema.extend({
    workProducts: PaperclipProdottiSchema.optional(),
});
/**
 * Il prodotto durevole di un file gia' caricato (caso vero 2): `artifact` + `paperclip` + `{attachmentId}`.
 * Titolo dal nome del file come fa il server (services/issues.ts:12938-12966); nasce `active`, non primario.
 */
export function paperclipProdottoDaAllegato(allegato, opzioni = {}) {
    return PaperclipProdottoCreaCorpoSchema.parse({
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
export const PAPERCLIP_PREVIEW_PROVIDER = 'x9';
// Require a secure demo link and a canonical file digest so consumers can register it once.
export function paperclipProdottoDaAnteprima(anteprima) {
    if (!/^[0-9a-f]{64}$/.test(anteprima.sha256)) {
        throw new Error('Preview sha256 must contain exactly 64 lowercase hexadecimal digits');
    }
    if (!anteprima.url.startsWith('https://')) {
        throw new Error('Preview URL must use https://');
    }
    return PaperclipProdottoCreaCorpoSchema.parse({
        type: 'preview_url',
        provider: PAPERCLIP_PREVIEW_PROVIDER,
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
export function paperclipProdottoEAnteprima(prodotto, sha256) {
    return prodotto.type === 'preview_url'
        && prodotto.provider === PAPERCLIP_PREVIEW_PROVIDER
        && prodotto.externalId === sha256;
}
/** Paperclip routes/issues.ts:6331-6336: `createdByRunId` deve essere la corsa autenticata (403 altrimenti). */
export function paperclipProdottoDellaCorsa(corpo, runIdAutenticata) {
    return corpo.createdByRunId === undefined || corpo.createdByRunId === null || corpo.createdByRunId === runIdAutenticata;
}
//# sourceMappingURL=wire-prodotti.js.map