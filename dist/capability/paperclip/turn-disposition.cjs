"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnDispositionSchema = exports.TurnEndSchema = exports.TURN_DISPOSITION_TEXT = exports.TurnStopCodeSchema = exports.TURN_STOP_CODES = exports.NOT_NOW_DEFAULT_RETRY_SECONDS = exports.ADMISSION_REFUSAL_CLASS = void 0;
exports.dispositionForTurnEnd = dispositionForTurnEnd;
exports.paperclipBodyForDisposition = paperclipBodyForDisposition;
const zod_1 = require("zod");
const internal_agent_turn_js_1 = require("../../http/endpoints/internal-agent-turn.cjs");
const wire_scritture_js_1 = require("../paperclip-protocollo/wire-scritture.cjs");
/** A code added to ORGANIZATION_ADMISSION_REFUSAL_CODES without a class here does not compile. */
exports.ADMISSION_REFUSAL_CLASS = {
    organization_context_missing: 'definitive',
    organization_context_invalid: 'definitive',
    organization_attempt_invalid: 'definitive',
    run_correlation_mismatch: 'definitive',
    issuer_not_authorized: 'definitive',
    context_expired: 'definitive',
    organization_binding_unavailable: 'not_now',
    organization_binding_missing: 'definitive',
    organization_binding_ambiguous: 'definitive',
    tenant_mismatch: 'definitive',
    owner_mismatch: 'definitive',
    agent_identity_mismatch: 'definitive',
    agent_target_mismatch: 'definitive',
    organization_admission_unavailable: 'not_now',
    organization_tenant_unknown: 'definitive',
    budget_exhausted: 'not_now',
    rd_paused: 'not_now',
};
exports.NOT_NOW_DEFAULT_RETRY_SECONDS = 3600;
const MIN_CHECK_SECONDS = 60;
const MAX_CHECK_SECONDS = 86_400 * 7;
exports.TURN_STOP_CODES = ['budget_exhausted', 'run_expired'];
exports.TurnStopCodeSchema = zod_1.z.enum(exports.TURN_STOP_CODES);
exports.TURN_DISPOSITION_TEXT = {
    checkNote: (code) => `Non adesso: ${code}. Ricontrollo automatico.`,
    stoppedNote: (code) => `Fermato a metà turno: ${code}. Il lavoro già fatto resta. Ricontrollo automatico.`,
    notExecutedComment: () => 'Non eseguito: R&D in pausa.',
    unblockAction: (code) => `Turno rifiutato: ${code}. Correggere il legame o l'identità dell'agente, poi commentare qui per riaprire.`,
};
exports.TurnEndSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('succeeded') }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('refused'),
        code: internal_agent_turn_js_1.OrganizationAdmissionRefusalCodeSchema,
        message: zod_1.z.string().min(1).max(2000).optional(),
        retryAfterSeconds: zod_1.z.number().int().min(1).max(MAX_CHECK_SECONDS).optional(),
    }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('failed'), failureCode: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('uncertain') }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('unavailable') }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('cancelled') }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('stopped'),
        code: exports.TurnStopCodeSchema,
        retryAfterSeconds: zod_1.z.number().int().min(1).max(MAX_CHECK_SECONDS).optional(),
    }),
]);
exports.TurnDispositionSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.strictObject({ kind: zod_1.z.literal('leave'), runSucceeds: zod_1.z.literal(true) }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('check_later'),
        runSucceeds: zod_1.z.literal(true),
        afterSeconds: zod_1.z.number().int().min(MIN_CHECK_SECONDS).max(MAX_CHECK_SECONDS),
        notes: zod_1.z.string().min(1).max(500),
    }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('close_not_executed'), runSucceeds: zod_1.z.literal(true), comment: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('block_for_owner'),
        runSucceeds: zod_1.z.literal(true),
        action: zod_1.z.string().min(1).max(2000),
    }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('fail_run'), runSucceeds: zod_1.z.literal(false) }),
]);
/** Only failed, uncertain and unavailable ends fail the run; refusals and limit stops never do. */
function dispositionForTurnEnd(end) {
    switch (end.kind) {
        case 'succeeded':
        case 'cancelled':
            return { kind: 'leave', runSucceeds: true };
        case 'refused': {
            if (exports.ADMISSION_REFUSAL_CLASS[end.code] === 'definitive') {
                return { kind: 'block_for_owner', runSucceeds: true, action: exports.TURN_DISPOSITION_TEXT.unblockAction(end.code) };
            }
            if (end.code === 'rd_paused') {
                return { kind: 'close_not_executed', runSucceeds: true, comment: exports.TURN_DISPOSITION_TEXT.notExecutedComment() };
            }
            return {
                kind: 'check_later',
                runSucceeds: true,
                afterSeconds: Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? exports.NOT_NOW_DEFAULT_RETRY_SECONDS),
                notes: exports.TURN_DISPOSITION_TEXT.checkNote(end.code),
            };
        }
        case 'stopped':
            return {
                kind: 'check_later',
                runSucceeds: true,
                afterSeconds: Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? exports.NOT_NOW_DEFAULT_RETRY_SECONDS),
                notes: exports.TURN_DISPOSITION_TEXT.stoppedNote(end.code),
            };
        case 'failed':
        case 'uncertain':
        case 'unavailable':
            return { kind: 'fail_run', runSucceeds: false };
    }
}
/** The write to make on the Paperclip issue, or null when nothing is written. The time enters only from `ctx.now`. */
function paperclipBodyForDisposition(d, ctx) {
    let body;
    switch (d.kind) {
        case 'leave':
        case 'fail_run':
            return null;
        case 'check_later':
            body = {
                status: 'in_progress',
                executionPolicy: {
                    ...(ctx.currentExecutionPolicy ?? {}),
                    monitor: {
                        nextCheckAt: new Date(ctx.now.getTime() + d.afterSeconds * 1000).toISOString(),
                        notes: d.notes,
                    },
                },
            };
            break;
        case 'close_not_executed':
            body = { status: 'done', comment: d.comment };
            break;
        case 'block_for_owner':
            body = { status: 'blocked', unblockDescriptor: { owner: { agentId: ctx.agentId }, action: d.action } };
            break;
    }
    return wire_scritture_js_1.PaperclipDisposizioneCorpoSchema.parse(body);
}
//# sourceMappingURL=turn-disposition.js.map