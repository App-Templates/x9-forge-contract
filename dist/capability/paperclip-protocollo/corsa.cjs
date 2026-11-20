"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipCorsaAnnullataSchema = exports.PAPERCLIP_ANNULLO_CORSA_ATTORI = exports.PaperclipCorsaSchema = exports.PAPERCLIP_ANNULLO_STATO_RICHIESTO = exports.PAPERCLIP_CORSA_STATI_FINALI = exports.PaperclipCorsaStatoSchema = exports.PAPERCLIP_CORSA_STATI = void 0;
exports.paperclipCorsaPuoScrivere = paperclipCorsaPuoScrivere;
exports.paperclipAnnulloCorsaAmmesso = paperclipAnnulloCorsaAmmesso;
exports.paperclipAnnulloCorsaConfermato = paperclipAnnulloCorsaConfermato;
const zod_1 = require("zod");
// Paperclip packages/shared/src/constants.ts:919-929 (HEARTBEAT_RUN_STATUSES).
exports.PAPERCLIP_CORSA_STATI = [
    'queued', 'scheduled_retry', 'running', 'succeeded', 'interrupted', 'failed', 'cancelled', 'timed_out',
];
exports.PaperclipCorsaStatoSchema = zod_1.z.enum(exports.PAPERCLIP_CORSA_STATI);
// Paperclip doc/execution-semantics.md:178 defines these four terminal run states.
exports.PAPERCLIP_CORSA_STATI_FINALI = ['succeeded', 'failed', 'cancelled', 'timed_out'];
// server/src/agent-run-cancellation.ts:6-13: cancellation is requested before the run becomes cancelled.
exports.PAPERCLIP_ANNULLO_STATO_RICHIESTO = 'requested';
/** GET /api/heartbeat-runs/:runId (server/src/routes/agents.ts:6969): preserves fields the bridge does not read. */
exports.PaperclipCorsaSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    agentId: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
    status: exports.PaperclipCorsaStatoSchema,
    resultJson: zod_1.z.looseObject({
        executionCancellation: zod_1.z.looseObject({ state: zod_1.z.string() }).optional(),
    }).nullable().optional(),
});
/**
 * Issue writes require a running run without a cancellation request. Paperclip revokes writes as soon as
 * cancellation is requested (agent-run-cancellation.ts:6-13: agent_run_cancelled, HTTP 403 on methods other than
 * GET/HEAD/OPTIONS). Agent writes also require a persistent run bound to that agent (doc/SPEC-implementation.md:631-634).
 * Reads remain allowed.
 */
function paperclipCorsaPuoScrivere(corsa) {
    return corsa.status === 'running'
        && corsa.resultJson?.executionCancellation?.state !== exports.PAPERCLIP_ANNULLO_STATO_RICHIESTO;
}
/** Run cancellation requires a board actor (assertBoard, routes/agents.ts:6986-7014). */
exports.PAPERCLIP_ANNULLO_CORSA_ATTORI = ['board'];
function paperclipAnnulloCorsaAmmesso(attore) {
    return attore === 'board' ? { ok: true } : { ok: false, motivo: 'solo_board' };
}
/**
 * Cancellation returns the run itself (routes/agents.ts:7014; public API 467125f returns { id, status }).
 * Only the requested run in the cancelled state confirms cancellation. Additional fields are preserved.
 */
exports.PaperclipCorsaAnnullataSchema = zod_1.z.looseObject({ id: zod_1.z.guid(), status: zod_1.z.literal('cancelled') });
function paperclipAnnulloCorsaConfermato(runIdChiesto, risposta) {
    const letto = exports.PaperclipCorsaAnnullataSchema.safeParse(risposta);
    return letto.success && letto.data.id === runIdChiesto;
}
//# sourceMappingURL=corsa.js.map