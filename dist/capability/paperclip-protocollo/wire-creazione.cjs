"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipCreazioneRispostaSchema = exports.PaperclipCorriereCorpoSchema = exports.PaperclipFiglioCreaCorpoSchema = exports.PaperclipFiglioCreaCampiSchema = exports.PaperclipIncaricoCorpoSchema = exports.PaperclipIncaricoCampiSchema = exports.PAPERCLIP_CORRIERE_DESCRIZIONE_MIN = exports.PAPERCLIP_DESCRIZIONE_MAX = exports.PAPERCLIP_TITOLO_MAX = exports.PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI = exports.PAPERCLIP_CRITERIO_MAX = exports.PAPERCLIP_CRITERI_MASSIMI = exports.PAPERCLIP_FIGLI_MASSIMI_PER_PADRE = exports.PaperclipDeduplicazioneMotivoSchema = exports.PAPERCLIP_DEDUP_MOTIVI = exports.PAPERCLIP_DEDUP_TITOLO_ORE = exports.PAPERCLIP_IDEMPOTENZA_GIORNI = exports.PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX = exports.PaperclipCreazioneStatoSchema = exports.PAPERCLIP_CREAZIONE_STATI = void 0;
exports.paperclipStatoCreazionePredefinito = paperclipStatoCreazionePredefinito;
exports.paperclipFiglioAncoraAmmesso = paperclipFiglioAncoraAmmesso;
exports.paperclipEsitoCreazione = paperclipEsitoCreazione;
const zod_1 = require("zod");
const wire_letture_js_1 = require("./wire-letture.cjs");
const wire_scritture_js_1 = require("./wire-scritture.cjs");
// Paperclip packages/shared/src/validators/issue.ts:643-670 (default status), :687-748 (fields),
// :767-777 (deduplication), :829-844 (children); server/src/services/issues.ts:223,236,9246-9251,9856-9878.
exports.PAPERCLIP_CREAZIONE_STATI = ['backlog', 'todo', 'blocked'];
exports.PaperclipCreazioneStatoSchema = zod_1.z.enum(exports.PAPERCLIP_CREAZIONE_STATI);
/** Paperclip defaults to todo with an assignee and backlog without one when status is omitted. */
function paperclipStatoCreazionePredefinito(haAssegnatario) {
    return haAssegnatario ? 'todo' : 'backlog';
}
exports.PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX = 255;
exports.PAPERCLIP_IDEMPOTENZA_GIORNI = 7;
exports.PAPERCLIP_DEDUP_TITOLO_ORE = 48;
exports.PAPERCLIP_DEDUP_MOTIVI = ['idempotency_key', 'recent_open_title'];
exports.PaperclipDeduplicazioneMotivoSchema = zod_1.z.enum(exports.PAPERCLIP_DEDUP_MOTIVI);
exports.PAPERCLIP_FIGLI_MASSIMI_PER_PADRE = 25;
exports.PAPERCLIP_CRITERI_MASSIMI = 20;
exports.PAPERCLIP_CRITERIO_MAX = 500;
exports.PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI = 20;
/** Bridge limits, absent in Paperclip: title matches PUT /title, description matches pcp_affida. */
exports.PAPERCLIP_TITOLO_MAX = 240;
exports.PAPERCLIP_DESCRIZIONE_MAX = 20000;
exports.PAPERCLIP_CORRIERE_DESCRIZIONE_MIN = 40;
const Title = zod_1.z.string().trim().min(1).max(exports.PAPERCLIP_TITOLO_MAX);
const Description = zod_1.z.string().trim().min(1).max(exports.PAPERCLIP_DESCRIZIONE_MAX);
const BlockingIssueIds = zod_1.z.array(zod_1.z.guid()).min(1).max(exports.PAPERCLIP_BLOCCHI_CREAZIONE_MASSIMI)
    .refine((values) => new Set(values).size === values.length, 'Blocking issue ids must be unique');
const CreationFields = {
    title: Title.optional(),
    description: Description.optional(),
    projectId: zod_1.z.guid().optional(),
    goalId: zod_1.z.guid().nullable().optional(),
    blockedByIssueIds: BlockingIssueIds.optional(),
    unblockDescriptor: wire_scritture_js_1.PaperclipDescrittoreSbloccoSchema.optional(),
    status: exports.PaperclipCreazioneStatoSchema.optional(),
    priority: wire_letture_js_1.PaperclipPrioritaSchema.optional(),
    // validators/issue.ts:713: the assignee is a GUID, never a role or department name.
    assigneeAgentId: zod_1.z.guid().optional(),
    idempotencyKey: zod_1.z.string().trim().min(1).max(exports.PAPERCLIP_IDEMPOTENZA_CHIAVE_MAX).optional(),
    allowDuplicate: zod_1.z.boolean().optional(),
};
function validateCreation(value, ctx) {
    // validators/issue.ts:793-800: 422 "Provide a title or task description".
    if (value.title === undefined && value.description === undefined) {
        ctx.addIssue({ code: 'custom', path: ['title'], message: 'A title or description is required' });
    }
    // validators/issue.ts:750-765: unblock descriptors are allowed only with blocked.
    if (value.unblockDescriptor !== undefined && value.status !== 'blocked') {
        ctx.addIssue({
            code: 'custom',
            path: ['unblockDescriptor'],
            message: 'An unblock descriptor is allowed only with status blocked',
        });
    }
    // Paperclip accepts blocked without a path on creation; routes/issues.ts:13229-13290 applies only to PATCH.
    // The bridge requires a path, as it already does for dispositions (execution-semantics.md:73-83).
    if (value.status === 'blocked' && value.blockedByIssueIds === undefined && value.unblockDescriptor === undefined) {
        ctx.addIssue({
            code: 'custom',
            path: ['status'],
            message: 'Blocked requires blocking issues or an unblock descriptor',
        });
    }
}
/** POST /api/companies/:companyId/issues creates an issue with an assignee identified by id. */
exports.PaperclipIncaricoCampiSchema = zod_1.z.strictObject({
    ...CreationFields,
    parentId: zod_1.z.guid().nullable().optional(),
});
exports.PaperclipIncaricoCorpoSchema = exports.PaperclipIncaricoCampiSchema.superRefine(validateCreation);
/**
 * POST /api/issues/:id/children identifies the parent in the route, without parentId in the body.
 * Paperclip defaults blockParentUntilDone to false; callers waiting for the child must set true
 * explicitly (execution-semantics.md:247).
 */
exports.PaperclipFiglioCreaCampiSchema = zod_1.z.strictObject({
    ...CreationFields,
    acceptanceCriteria: zod_1.z.array(zod_1.z.string().trim().min(1).max(exports.PAPERCLIP_CRITERIO_MAX)).max(exports.PAPERCLIP_CRITERI_MASSIMI).optional(),
    blockParentUntilDone: zod_1.z.boolean().optional(),
});
exports.PaperclipFiglioCreaCorpoSchema = exports.PaperclipFiglioCreaCampiSchema.superRefine(validateCreation);
/** Paperclip rejects creation beyond 25 children per parent with 422 (services/issues.ts:9275-9279). */
function paperclipFiglioAncoraAmmesso(figliEsistenti) {
    return Number.isInteger(figliEsistenti) && figliEsistenti >= 0 && figliEsistenti < exports.PAPERCLIP_FIGLI_MASSIMI_PER_PADRE;
}
/**
 * Lateral courier (execution-semantics.md:263-265): a new issue assigned to the destination agent by id.
 * Its description carries complete instructions because the recipient cannot see the sender's subtree.
 */
exports.PaperclipCorriereCorpoSchema = zod_1.z.strictObject({
    title: Title,
    description: zod_1.z.string().trim().min(exports.PAPERCLIP_CORRIERE_DESCRIZIONE_MIN).max(exports.PAPERCLIP_DESCRIZIONE_MAX),
    assigneeAgentId: zod_1.z.guid(),
    status: zod_1.z.literal('todo').optional(),
    priority: wire_letture_js_1.PaperclipPrioritaSchema.optional(),
    projectId: zod_1.z.guid().optional(),
    goalId: zod_1.z.guid().nullable().optional(),
    idempotencyKey: CreationFields.idempotencyKey,
    allowDuplicate: CreationFields.allowDuplicate,
});
// routes/issues.ts:11805-11817: 200 includes deduplicated and deduplicationReason; 201 omits them.
// The children route always responds with 201.
exports.PaperclipCreazioneRispostaSchema = wire_letture_js_1.PaperclipIncaricoSchema.extend({
    deduplicated: zod_1.z.literal(true).optional(),
    deduplicationReason: exports.PaperclipDeduplicazioneMotivoSchema.optional(),
}).superRefine((value, ctx) => {
    if ((value.deduplicated === true) !== (value.deduplicationReason !== undefined)) {
        ctx.addIssue({
            code: 'custom',
            path: ['deduplicationReason'],
            message: 'deduplicated and deduplicationReason must be provided together',
        });
    }
});
/** A 200 response identifies an existing issue, so the body alone cannot establish a new creation. */
function paperclipEsitoCreazione(statoHttp, corpo) {
    if (statoHttp !== 200 && statoHttp !== 201)
        return { ok: false, motivo: 'stato_http_inatteso' };
    const parsed = exports.PaperclipCreazioneRispostaSchema.safeParse(corpo);
    if (!parsed.success)
        return { ok: false, motivo: 'risposta_non_valida' };
    const incarico = parsed.data;
    if (statoHttp === 201) {
        return incarico.deduplicated === true
            ? { ok: false, motivo: 'deduplica_incoerente' }
            : { ok: true, nuovo: true, incarico };
    }
    return incarico.deduplicationReason === undefined
        ? { ok: false, motivo: 'deduplica_incoerente' }
        : { ok: true, nuovo: false, motivo: incarico.deduplicationReason, incarico };
}
//# sourceMappingURL=wire-creazione.js.map