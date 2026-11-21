"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnDispositionSchema = exports.TurnEndSchema = exports.TURN_DISPOSITION_TEXT = exports.TurnUnavailableCauseSchema = exports.TURN_UNAVAILABLE_CAUSES = exports.TurnFailureCauseSchema = exports.TURN_FAILURE_CAUSES = exports.TurnStopCodeSchema = exports.TURN_STOP_CODES = exports.LIMIT_WAIT_SERVICE_NAME = exports.INTERRUPTED_RETRY_SECONDS = exports.NOT_NOW_DEFAULT_RETRY_SECONDS = exports.ADMISSION_REFUSAL_CLASS = void 0;
exports.turnFailRun = turnFailRun;
exports.dispositionForTurnEnd = dispositionForTurnEnd;
exports.waitsOnLimit = waitsOnLimit;
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
exports.INTERRUPTED_RETRY_SECONDS = 1800;
exports.LIMIT_WAIT_SERVICE_NAME = 'X9 company spend cap';
const MIN_CHECK_SECONDS = 60;
const CHECK_NOTE_MAX = 500;
const MAX_CHECK_SECONDS = 86_400 * 7;
exports.TURN_STOP_CODES = ['budget_exhausted', 'run_expired'];
exports.TurnStopCodeSchema = zod_1.z.enum(exports.TURN_STOP_CODES);
exports.TURN_FAILURE_CAUSES = [
    'turn_failed',
    'outcome_uncertain',
    'restart_count_unreadable',
    // 1.288.0: a refused or restart-exhausted turn fails the run so Paperclip owns the recovery.
    'admission_refused',
    'restarts_exhausted',
];
exports.TurnFailureCauseSchema = zod_1.z.enum(exports.TURN_FAILURE_CAUSES);
exports.TURN_UNAVAILABLE_CAUSES = [
    'no_response',
    'response_not_conforming',
    'error_without_body',
    'unknown_error_code',
    'status_mismatch',
];
exports.TurnUnavailableCauseSchema = zod_1.z.enum(exports.TURN_UNAVAILABLE_CAUSES);
const FAILURE_CODE_NOTE_MAX = 200;
const FAIL_DETAIL_MAX = 2000;
exports.TURN_DISPOSITION_TEXT = {
    failedNote: (failureCode) => `Turno fallito: ${failureCode.slice(0, FAILURE_CODE_NOTE_MAX)}.`,
    uncertainNote: () => 'Esito del turno incerto: non è chiaro se il lavoro è stato fatto. Guarda cosa c\'è già su questo incarico (commenti, file, incarichi aperti) prima di rifare qualcosa.',
    restartCountNote: () => 'Turno fallito: il conteggio dei riavvii non si legge, quindi non si sa se la corsa è già stata ritentata.',
    unavailableCause: {
        no_response: 'rete, tempo scaduto, redirect o risposta illeggibile o troppo grande',
        response_not_conforming: 'risposta non conforme o di un\'altra corsa',
        error_without_body: 'errore senza corpo leggibile',
        unknown_error_code: 'codice d\'errore sconosciuto',
        status_mismatch: 'stato della risposta incoerente con il suo codice',
    },
    checkNote: (code) => `Non adesso: ${code}. Ricontrollo automatico.`,
    checkNoteWithReason: (code, message, afterSeconds) => `Non adesso: ${code}. ${message} Ricontrollo automatico tra ${Math.round(afterSeconds / 60)} minuti.`,
    stoppedNote: (code) => `Fermato a metà turno: ${code}. Il lavoro già fatto resta. Ricontrollo automatico.`,
    interruptedNote: (afterSeconds, cause) => `Turno interrotto: il servizio non ha risposto${cause === undefined ? '' : ` (${exports.TURN_DISPOSITION_TEXT.unavailableCause[cause]})`}. Prima di rifare qualcosa guarda cosa è già stato fatto su questo incarico (commenti, file, incarichi aperti) e non ripeterlo. Ricontrollo automatico tra ${Math.round(afterSeconds / 60)} minuti.`,
    notExecutedComment: () => 'Non eseguito: R&D in pausa.',
    admissionRefusedNote: (code) => `Turno rifiutato: ${code}. L'agente non può partire: il legame o l'identità vanno corretti; l'incarico resta suo e il recupero è di Paperclip.`,
    // Must start with "Turno interrotto troppe volte": cap-paperclip restarts its restart count from that comment.
    restartsExhaustedNote: () => 'Turno interrotto troppe volte: le ripartenze sono finite e non riprogrammo più il controllo. Il recupero è di Paperclip, che lo mostra al board se serve.',
    /** No longer produced since 1.288.0; kept so stored `block_for_owner` dispositions stay readable. */
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
    zod_1.z.strictObject({ kind: zod_1.z.literal('unavailable'), cause: exports.TurnUnavailableCauseSchema.optional() }),
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
        notes: zod_1.z.string().min(1).max(CHECK_NOTE_MAX),
        serviceName: wire_scritture_js_1.PaperclipControlloSchema.shape.serviceName,
    }),
    zod_1.z.strictObject({ kind: zod_1.z.literal('close_not_executed'), runSucceeds: zod_1.z.literal(true), comment: zod_1.z.string().min(1) }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('block_for_owner'),
        runSucceeds: zod_1.z.literal(true),
        action: zod_1.z.string().min(1).max(2000),
    }),
    zod_1.z.strictObject({
        kind: zod_1.z.literal('fail_run'),
        runSucceeds: zod_1.z.literal(false),
        cause: exports.TurnFailureCauseSchema,
        detail: zod_1.z.string().min(1).max(FAIL_DETAIL_MAX),
    }),
]);
/** The only way to build a valid `fail_run`: the cause and its text travel together. */
function turnFailRun(cause, failureCode) {
    const parsed = exports.TurnFailureCauseSchema.parse(cause);
    let detail;
    switch (parsed) {
        case 'turn_failed':
            detail = exports.TURN_DISPOSITION_TEXT.failedNote(failureCode ?? 'sconosciuto');
            break;
        case 'outcome_uncertain':
            detail = exports.TURN_DISPOSITION_TEXT.uncertainNote();
            break;
        case 'restart_count_unreadable':
            detail = exports.TURN_DISPOSITION_TEXT.restartCountNote();
            break;
        case 'admission_refused':
            // The refusal code is mandatory: a text without it would not say why the turn cannot start.
            detail = exports.TURN_DISPOSITION_TEXT.admissionRefusedNote(internal_agent_turn_js_1.OrganizationAdmissionRefusalCodeSchema.parse(failureCode));
            break;
        case 'restarts_exhausted':
            detail = exports.TURN_DISPOSITION_TEXT.restartsExhaustedNote();
            break;
    }
    return { kind: 'fail_run', runSucceeds: false, cause: parsed, detail };
}
/** Failed, uncertain and definitively refused ends fail the run; not-now refusals, limit stops and unavailable services never do. */
function dispositionForTurnEnd(end) {
    switch (end.kind) {
        case 'succeeded':
        case 'cancelled':
            return { kind: 'leave', runSucceeds: true };
        case 'refused': {
            if (exports.ADMISSION_REFUSAL_CLASS[end.code] === 'definitive') {
                // A definitive refusal fails the run: a `blocked` issue with only a self-owned descriptor is never woken by Paperclip.
                return turnFailRun('admission_refused', end.code);
            }
            if (end.code === 'rd_paused') {
                return { kind: 'close_not_executed', runSucceeds: true, comment: exports.TURN_DISPOSITION_TEXT.notExecutedComment() };
            }
            const afterSeconds = Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? exports.NOT_NOW_DEFAULT_RETRY_SECONDS);
            const withReason = end.code === 'budget_exhausted' && end.message !== undefined
                ? exports.TURN_DISPOSITION_TEXT.checkNoteWithReason(end.code, end.message, afterSeconds)
                : undefined;
            return {
                kind: 'check_later',
                runSucceeds: true,
                afterSeconds,
                notes: withReason !== undefined && withReason.length <= CHECK_NOTE_MAX ? withReason : exports.TURN_DISPOSITION_TEXT.checkNote(end.code),
                ...(end.code === 'budget_exhausted' ? { serviceName: exports.LIMIT_WAIT_SERVICE_NAME } : {}),
            };
        }
        case 'stopped':
            return {
                kind: 'check_later',
                runSucceeds: true,
                afterSeconds: Math.max(MIN_CHECK_SECONDS, end.retryAfterSeconds ?? exports.NOT_NOW_DEFAULT_RETRY_SECONDS),
                notes: exports.TURN_DISPOSITION_TEXT.stoppedNote(end.code),
                ...(end.code === 'budget_exhausted' ? { serviceName: exports.LIMIT_WAIT_SERVICE_NAME } : {}),
            };
        case 'unavailable':
            return {
                kind: 'check_later',
                runSucceeds: true,
                afterSeconds: exports.INTERRUPTED_RETRY_SECONDS,
                notes: exports.TURN_DISPOSITION_TEXT.interruptedNote(exports.INTERRUPTED_RETRY_SECONDS, end.cause),
            };
        case 'failed':
            return turnFailRun('turn_failed', end.failureCode);
        case 'uncertain':
            return turnFailRun('outcome_uncertain');
    }
}
/** Read the stored monitor tolerantly: Paperclip adds fields and nullable values to its policy. */
function waitsOnLimit(policy) {
    return typeof policy === 'object' && policy !== null && 'monitor' in policy
        && typeof policy.monitor === 'object' && policy.monitor !== null && 'serviceName' in policy.monitor
        && policy.monitor.serviceName === exports.LIMIT_WAIT_SERVICE_NAME;
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
                        ...(d.serviceName !== undefined ? { serviceName: d.serviceName } : {}),
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