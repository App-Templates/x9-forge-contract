"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipTurnoErroreSchema = exports.PAPERCLIP_TURNO_ERRORI = exports.PaperclipTurnoRispostaSchema = exports.PaperclipTurnoRichiestaSchema = exports.PaperclipTurnoContestoSchema = void 0;
exports.incaricoDelTurno = incaricoDelTurno;
const zod_1 = require("zod");
// Campi della sveglia: Paperclip server/dist/routes/issues.js:10263-10280,10526-10552.
exports.PaperclipTurnoContestoSchema = zod_1.z.looseObject({
    taskId: zod_1.z.guid().optional(),
    issueId: zod_1.z.guid().optional(),
    wakeReason: zod_1.z.string().optional(),
    wakeCommentId: zod_1.z.guid().optional(),
    commentId: zod_1.z.guid().optional(),
});
// Corpo dell'adattatore http: server/dist/adapters/http/execute.js:9-60; docs/adapters/http.md:27-51.
// Il corpo compilato non ha companyId.
exports.PaperclipTurnoRichiestaSchema = zod_1.z.looseObject({
    runId: zod_1.z.guid(),
    agentId: zod_1.z.guid(),
    context: exports.PaperclipTurnoContestoSchema,
});
exports.PaperclipTurnoRispostaSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    runId: zod_1.z.guid(),
});
exports.PAPERCLIP_TURNO_ERRORI = [
    'feature_off',
    'segreto_non_valido',
    'richiesta_non_valida',
    'agente_sconosciuto',
    'turno_gia_aperto',
    'turno_fallito',
];
exports.PaperclipTurnoErroreSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum(exports.PAPERCLIP_TURNO_ERRORI),
});
function incaricoDelTurno(ctx) {
    return ctx.taskId ?? ctx.issueId ?? null;
}
//# sourceMappingURL=turno.js.map