"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipErroreRispostaSchema = exports.PaperclipAgenteMeSchema = exports.PaperclipContestoTurnoSchema = exports.PaperclipRiassuntoContinuazioneSchema = exports.PaperclipObiettivoContestoSchema = exports.PaperclipProgettoContestoSchema = exports.PaperclipCursoreCommentiSchema = exports.PaperclipCommentiSchema = exports.PaperclipCommentoSchema = exports.PaperclipElencoIncarichiSchema = exports.PaperclipIncaricoSchema = exports.PaperclipBloccoSchema = exports.PAPERCLIP_PRIORITA_PREDEFINITA = exports.PaperclipPrioritaSchema = exports.PAPERCLIP_PRIORITA = exports.PaperclipStatoIncaricoSchema = exports.PAPERCLIP_STATI_INCARICO = void 0;
exports.paperclipCommentoPiuRecente = paperclipCommentoPiuRecente;
const zod_1 = require("zod");
// Paperclip packages/shared/dist/constants.js:165-173.
exports.PAPERCLIP_STATI_INCARICO = [
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'blocked',
    'cancelled',
];
exports.PaperclipStatoIncaricoSchema = zod_1.z.enum(exports.PAPERCLIP_STATI_INCARICO);
// Paperclip packages/shared/src/constants.ts:210 (ISSUE_PRIORITIES); validators/issue.ts:709 (default medium).
exports.PAPERCLIP_PRIORITA = ['critical', 'high', 'medium', 'low'];
exports.PaperclipPrioritaSchema = zod_1.z.enum(exports.PAPERCLIP_PRIORITA);
exports.PAPERCLIP_PRIORITA_PREDEFINITA = 'medium';
// Paperclip server/dist/routes/issues.js:5806-5807.
exports.PaperclipBloccoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    status: exports.PaperclipStatoIncaricoSchema,
    title: zod_1.z.string().optional(),
    identifier: zod_1.z.string().nullable().optional(),
    assigneeAgentId: zod_1.z.guid().nullable().optional(),
});
// Paperclip server/dist/routes/issues.js:5790-5810.
exports.PaperclipIncaricoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    title: zod_1.z.string(),
    description: zod_1.z.string().nullable().optional(),
    status: exports.PaperclipStatoIncaricoSchema,
    parentId: zod_1.z.guid().nullable().optional(),
    goalId: zod_1.z.guid().nullable().optional(),
    assigneeAgentId: zod_1.z.guid().nullable().optional(),
    blockedBy: zod_1.z.array(exports.PaperclipBloccoSchema).optional(),
    // Paperclip GET /issues/:id: creator, execution ownership and outgoing blockers.
    identifier: zod_1.z.string().nullable().optional(),
    companyId: zod_1.z.guid().optional(),
    priority: exports.PaperclipPrioritaSchema.optional(),
    createdByAgentId: zod_1.z.guid().nullable().optional(),
    executionRunId: zod_1.z.guid().nullable().optional(),
    blocks: zod_1.z.array(exports.PaperclipBloccoSchema).optional(),
    updatedAt: zod_1.z.string().optional(),
});
// Paperclip server/src/services/issues.ts:211-212 limits issue lists to 1000 entries.
exports.PaperclipElencoIncarichiSchema = zod_1.z.array(exports.PaperclipIncaricoSchema).max(1000);
// Paperclip server/dist/routes/issues.js:10826-10855.
exports.PaperclipCommentoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    body: zod_1.z.string(),
    authorAgentId: zod_1.z.guid().nullable().optional(),
    authorUserId: zod_1.z.string().nullable().optional(),
    createdAt: zod_1.z.string().optional(),
});
exports.PaperclipCommentiSchema = zod_1.z.array(exports.PaperclipCommentoSchema);
/** Select the newest valid timestamp, falling back to the API's requested order (descending by default). */
function paperclipCommentoPiuRecente(commenti, ordine = 'desc') {
    let scelto = null;
    let istante = -Infinity;
    for (const commento of commenti) {
        const data = Date.parse(commento.createdAt ?? '');
        if (Number.isFinite(data) && data > istante) {
            scelto = commento;
            istante = data;
        }
    }
    if (scelto !== null)
        return scelto;
    return (ordine === 'desc' ? commenti[0] : commenti.at(-1)) ?? null;
}
// Paperclip server/src/routes/issues.ts:8512-8587 (heartbeat-context); untyped response fields stay free.
// Each hint is optional and tolerant: a malformed hint is dropped, it never fails the read of the issue.
// services/issues.ts:11999-12023.
exports.PaperclipCursoreCommentiSchema = zod_1.z.looseObject({
    totalComments: zod_1.z.number().int().nonnegative(),
    latestCommentId: zod_1.z.guid().nullable(),
    latestCommentAt: zod_1.z.string().nullable().optional(),
});
exports.PaperclipProgettoContestoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    name: zod_1.z.string(),
    status: zod_1.z.string(),
    targetDate: zod_1.z.string().nullable().optional(),
});
exports.PaperclipObiettivoContestoSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    title: zod_1.z.string(),
    status: zod_1.z.string(),
    level: zod_1.z.string(),
    parentId: zod_1.z.guid().nullable().optional(),
});
exports.PaperclipRiassuntoContinuazioneSchema = zod_1.z.looseObject({
    key: zod_1.z.string(),
    title: zod_1.z.string().nullable().optional(),
    body: zod_1.z.string(),
    latestRevisionId: zod_1.z.guid().optional(),
});
// Paperclip server/dist/routes/issues.js:5728-5870.
exports.PaperclipContestoTurnoSchema = zod_1.z.looseObject({
    issue: exports.PaperclipIncaricoSchema,
    ancestors: zod_1.z.array(zod_1.z.looseObject({
        id: zod_1.z.guid(),
        title: zod_1.z.string().optional(),
        status: exports.PaperclipStatoIncaricoSchema.optional(),
    })),
    wakeComment: exports.PaperclipCommentoSchema.nullable().optional(),
    commentCursor: exports.PaperclipCursoreCommentiSchema.optional().catch(undefined),
    project: exports.PaperclipProgettoContestoSchema.nullable().optional().catch(undefined),
    goal: exports.PaperclipObiettivoContestoSchema.nullable().optional().catch(undefined),
    continuationSummary: exports.PaperclipRiassuntoContinuazioneSchema.nullable().optional().catch(undefined),
});
// Paperclip docs/guides/agent-developer/heartbeat-protocol.md:12-18;
// server/dist/routes/agents.js:3368.
exports.PaperclipAgenteMeSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
});
// Paperclip server/dist/routes/issues.js:3290,10654-10659.
exports.PaperclipErroreRispostaSchema = zod_1.z.looseObject({
    error: zod_1.z.string(),
});
//# sourceMappingURL=wire-letture.js.map