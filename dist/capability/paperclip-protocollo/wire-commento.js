import { z } from 'zod';
import { PaperclipIncaricoSchema, PaperclipStatoIncaricoSchema, } from "./wire-letture.js";
// Paperclip packages/shared/src/validators/issue.ts:866-871 (unique attachment UUIDs, at most 20),
// :873-897 (PATCH), :1054-1065 (POST comment); server/src/routes/issues.ts:12824-12827,12851-12854.
export const PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO = 20;
const AllegatiIds = z.array(z.uuid()).max(PAPERCLIP_ALLEGATI_MASSIMI_PER_COMMENTO)
    .refine((valori) => new Set(valori).size === valori.length, 'Gli id degli allegati devono essere unici');
const Testo = z.string().trim().min(1);
/** Fields accepted by Paperclip but forbidden to agents; strict schemas reject each one. */
export const PAPERCLIP_CAMPI_COMMENTO_VIETATI = {
    clientRequestId: 'per un attore agente Paperclip lo ignora (routes/issues.ts:17739): un reinvio crea due commenti',
    commentClientRequestId: 'per un attore agente Paperclip lo ignora (routes/issues.ts:17739)',
    interrupt: 'solo utenti board, 403 (routes/issues.ts:13025-13038,17520-17527)',
    onBehalfOfUserId: 'respinto come spoof dell\'attribuzione (issue_write_attribution_spoof_rejected; packages/shared/src/issue-write-denial.ts:26-35)',
    authorType: 'deve combaciare con l\'attore autenticato (services/issues.ts:6765-6779): lo mette il server',
    presentation: 'solo utenti board, 403 (routes/issues.ts:6369-6390)',
    metadata: 'solo utenti board, 403 (routes/issues.ts:6369-6390)',
};
function controllaRiapertura(valore, ctx) {
    if (valore.reopen === true && valore.resume === true) {
        ctx.addIssue({ code: 'custom', path: ['resume'], message: 'reopen e resume non vanno insieme: serve un solo intento' });
    }
    // routes/issues.ts:12851-12854: 400 "Follow-up intent requires a comment"; the bridge also requires it for reopen.
    if ((valore.reopen === true || valore.resume === true) && valore.comment === undefined) {
        ctx.addIssue({ code: 'custom', path: ['comment'], message: 'reopen e resume richiedono un commento' });
    }
    // routes/issues.ts:13080-13089: Paperclip moves the issue to todo without an explicit status.
    if ((valore.reopen === true || valore.resume === true) && valore.status !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'reopen e resume portano a todo da soli: niente status' });
    }
}
/** POST comment: text, previously uploaded attachments and an explicit reopen/resume intent. */
export const PaperclipCommentoCorpoEstesoSchema = z.strictObject({
    body: Testo,
    attachmentIds: AllegatiIds.optional(),
    reopen: z.literal(true).optional(),
    resume: z.literal(true).optional(),
}).superRefine((valore, ctx) => {
    controllaRiapertura({ reopen: valore.reopen, resume: valore.resume, comment: valore.body }, ctx);
});
/** PATCH issue: status, comment, assignee ID, attachments and an explicit reopen/resume intent. */
export const PaperclipAggiornaConCommentoCorpoSchema = z.strictObject({
    status: PaperclipStatoIncaricoSchema.optional(),
    comment: Testo.optional(),
    // validators/issue.ts:883 accepts shortnames too (409 if ambiguous); the bridge accepts only IDs.
    assigneeAgentId: z.guid().optional(),
    attachmentIds: AllegatiIds.optional(),
    reopen: z.literal(true).optional(),
    resume: z.literal(true).optional(),
}).superRefine((valore, ctx) => {
    if (valore.status === undefined && valore.comment === undefined && valore.assigneeAgentId === undefined
        && valore.reopen === undefined && valore.resume === undefined) {
        ctx.addIssue({ code: 'custom', message: 'serve almeno uno fra status, comment e assigneeAgentId' });
    }
    // routes/issues.ts:12824-12827: 400 "Attachment ids require a comment".
    if (valore.attachmentIds !== undefined && valore.comment === undefined) {
        ctx.addIssue({ code: 'custom', path: ['attachmentIds'], message: 'gli allegati richiedono un commento' });
    }
    controllaRiapertura(valore, ctx);
});
// routes/issues.ts:2355-2363 (isExplicitResumeCapableStatus).
export const PAPERCLIP_STATI_RIPRENDIBILI = ['done', 'cancelled', 'blocked', 'todo', 'in_progress'];
export const PAPERCLIP_RIPRESA_RIFIUTI = [
    'non_riprendibile',
    'cancellato_serve_resume',
    'blocchi_non_risolti',
    'sottoalbero_in_pausa',
    'senza_assegnatario',
];
/**
 * Paperclip's 409 resume refusals (routes/issues.ts:6409-6514): backlog and in_review cannot resume;
 * cancelled requires resume; unresolved blockers, a paused subtree or no agent assignee prevent resuming.
 */
export function paperclipRipresaAmmessa(fatti) {
    if (!PAPERCLIP_STATI_RIPRENDIBILI.includes(fatti.stato)) {
        return { ok: false, motivo: 'non_riprendibile' };
    }
    if (fatti.stato === 'cancelled' && fatti.via === 'reopen')
        return { ok: false, motivo: 'cancellato_serve_resume' };
    if (fatti.sottoalberoInPausa)
        return { ok: false, motivo: 'sottoalbero_in_pausa' };
    if (fatti.stato === 'blocked' && fatti.bloccantiNonRisolti > 0)
        return { ok: false, motivo: 'blocchi_non_risolti' };
    if (!fatti.haAssegnatarioAgente)
        return { ok: false, motivo: 'senza_assegnatario' };
    return { ok: true };
}
// docs/api/issues.md:71-125: PATCH returns authoritative state; Prefer: return=minimal reduces it to five fields.
// z.unknown() makes a key optional in Zod 4: both ends of a change must be present (null is a valid value).
const PaperclipCambioSchema = z.strictObject({ from: z.unknown(), to: z.unknown() })
    .refine((cambio) => 'from' in cambio && 'to' in cambio, 'un cambiamento ha sempre from e to');
export const PaperclipCambiamentiSchema = z.record(z.string(), PaperclipCambioSchema);
const PaperclipCommentoCreatoSchema = z.looseObject({ id: z.guid() }).nullable();
export const PaperclipAggiornaRispostaMinimaSchema = z.strictObject({
    id: z.guid(),
    identifier: z.string().nullable(),
    updatedAt: z.string(),
    changes: PaperclipCambiamentiSchema,
    comment: PaperclipCommentoCreatoSchema,
});
export const PaperclipAggiornaRispostaCompletaSchema = PaperclipIncaricoSchema.extend({
    changes: PaperclipCambiamentiSchema,
    comment: PaperclipCommentoCreatoSchema,
});
export const PaperclipAggiornaRispostaSchema = z.union([
    PaperclipAggiornaRispostaCompletaSchema,
    PaperclipAggiornaRispostaMinimaSchema,
]);
/**
 * Paperclip ignores clientRequestId for agents (routes/issues.ts:17739), so retries can duplicate comments.
 * After an uncertain result, read recent comments in descending order before deciding whether to write again.
 */
export function paperclipCommentoGiaScritto(commentiRecenti, authorAgentId, body) {
    const cercato = body.trim();
    return commentiRecenti.some((commento) => commento.authorAgentId === authorAgentId && commento.body.trim() === cercato);
}
//# sourceMappingURL=wire-commento.js.map