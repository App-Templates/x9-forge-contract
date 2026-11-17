"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BOARD_RESUME_NEEDS_PERSON_PREFIX = exports.BOARD_RESUME_COMMENT_PREFIX = exports.BoardResumeLogSchema = exports.BOARD_RESUME_MIN_RUNS_LEFT = exports.BOARD_RESUME_MIN_GAP_SECONDS_DEFAULT = exports.BOARD_RESUME_MAX_PER_ISSUE_DEFAULT = exports.BOARD_RESUME_AGENT_STATUSES = exports.BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS = exports.BoardHoldSkipLogSchema = exports.BoardHoldSkipReasonSchema = exports.BOARD_HOLD_SKIP_REASONS = exports.BOARD_RESUME_KEEP_TEXT = exports.BoardResumeKeepReasonSchema = exports.BOARD_RESUME_KEEP_REASONS = exports.BOARD_CLOSED_HOLD_TEXT = exports.BoardClosedHoldReasonSchema = exports.BOARD_CLOSED_HOLD_REASONS = exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_MAX = exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_MIN = exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_DEFAULT = exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MAX = exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MIN = exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_DEFAULT = exports.BoardClosedHoldCauseSchema = exports.BOARD_CLOSED_HOLD_CAUSES = exports.BoardResumeCauseSchema = exports.BOARD_RESUME_CAUSES = void 0;
exports.renderBoardHoldSkipLog = renderBoardHoldSkipLog;
exports.boardHoldSkipLogDue = boardHoldSkipLogDue;
exports.boardResumeAgentStatusAllowed = boardResumeAgentStatusAllowed;
exports.renderBoardResumeLog = renderBoardResumeLog;
exports.boardResumeComment = boardResumeComment;
exports.boardClosedHoldComment = boardClosedHoldComment;
exports.boardResumeNeedsPersonComment = boardResumeNeedsPersonComment;
exports.boardResumeCommentKind = boardResumeCommentKind;
const zod_1 = require("zod");
/**
 * Shapes of the board-operator resume of a stopped issue. This module lists and words things; it never reopens
 * anything, reads settings or decides. Only technical causes are listed (closed list): a new cause is a bridge task.
 * Production values live in the consumer's settings, never here.
 */
/** Refused at admission; dead for an infrastructure fault with no changes; interrupted by a restart or an unavailable service. */
exports.BOARD_RESUME_CAUSES = ['refused_turn', 'stranded_infrastructure', 'interrupted_turn'];
exports.BoardResumeCauseSchema = zod_1.z.enum(exports.BOARD_RESUME_CAUSES);
/** The last run died from an infrastructure fault, either without changes or after writing. */
exports.BOARD_CLOSED_HOLD_CAUSES = ['closed_hold_infrastructure', 'closed_hold_after_writes'];
exports.BoardClosedHoldCauseSchema = zod_1.z.enum(exports.BOARD_CLOSED_HOLD_CAUSES);
/** Older holds need a person; the five-day ceiling prevents reopening week-old holds in bulk. */
exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_DEFAULT = 259_200;
exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MIN = 3_600;
exports.BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MAX = 432_000;
/** Remaining closed holds wait for the next consumer round (round_cap_reached). */
exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_DEFAULT = 3;
exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_MIN = 1;
exports.BOARD_CLOSED_HOLD_MAX_PER_ROUND_MAX = 20;
exports.BOARD_CLOSED_HOLD_REASONS = [
    'other_recovery_action',
    'no_blocked_hold',
    'already_resolved',
    'issue_changed',
    'hold_too_old',
    'run_not_found',
    'run_not_infrastructure_failure',
    'activity_unreadable',
    'binding_not_verified',
    'paperclip_no_change',
    'paperclip_refused',
    'round_cap_reached',
];
exports.BoardClosedHoldReasonSchema = zod_1.z.enum(exports.BOARD_CLOSED_HOLD_REASONS);
/** A reason added to the list without a sentence here does not compile. */
exports.BOARD_CLOSED_HOLD_TEXT = {
    other_recovery_action: "C'è un'altra azione di recupero sull'incarico: non lo riapro.",
    no_blocked_hold: "Non risulta un fermo già chiuso con esito bloccato: non riapro l'incarico.",
    already_resolved: "L'incarico è già risolto: non lo riapro.",
    issue_changed: "L'incarico è cambiato o un agente ha scritto dopo il fermo: non lo riapro.",
    hold_too_old: "Il fermo è troppo vecchio: serve una persona per riaprire l'incarico.",
    run_not_found: "Non trovo la corsa che ha causato il fermo: non riapro l'incarico.",
    run_not_infrastructure_failure: "La corsa non risulta interrotta da un guasto dell'infrastruttura: non riapro l'incarico.",
    activity_unreadable: "Non riesco a leggere l'attività dell'incarico: non lo riapro.",
    binding_not_verified: "Non posso verificare il legame tra azienda, incarico e agente: non riapro l'incarico.",
    paperclip_no_change: "Paperclip non ha applicato la ripresa: l'incarico resta fermo.",
    paperclip_refused: "Paperclip ha rifiutato la ripresa: l'incarico resta fermo.",
    round_cap_reached: "Il tetto di riaperture dei fermi chiusi per questo giro è raggiunto: aspetto il prossimo giro.",
};
exports.BOARD_RESUME_KEEP_REASONS = [
    'cause_not_recognised',
    'cause_disabled',
    'open_blockers',
    'declared_wait',
    'person_touched',
    'run_in_flight',
    'daily_cap_reached',
    'daily_cap_unreadable',
    'max_resumes_reached',
    'too_soon',
    'history_unreadable',
    'trace_failed',
    'agent_error_not_cleared',
    'agent_not_available',
];
exports.BoardResumeKeepReasonSchema = zod_1.z.enum(exports.BOARD_RESUME_KEEP_REASONS);
/** A reason added to the list without a sentence here does not compile. */
exports.BOARD_RESUME_KEEP_TEXT = {
    cause_not_recognised: "La causa del fermo non è tra quelle tecniche note: non riapro l'incarico.",
    cause_disabled: "La ripartenza automatica per questa causa è spenta: non riapro l'incarico.",
    open_blockers: "L'incarico aspetta altri incarichi: non lo riapro.",
    declared_wait: "L'incarico dichiara un'attesa: non lo riapro.",
    person_touched: "Una persona ha scritto sull'incarico dopo il fermo: lo lascio a lei.",
    run_in_flight: "Sull'incarico c'è una corsa in corso: non lo riapro.",
    daily_cap_reached: "Il tetto di corse del giorno è raggiunto: non riapro l'incarico.",
    daily_cap_unreadable: "Non riesco a leggere il tetto di corse del giorno: non riapro l'incarico.",
    max_resumes_reached: "Ho già riaperto questo incarico il massimo di volte: non lo riapro più da solo.",
    too_soon: "L'ultima riapertura è troppo recente: aspetto prima di riaprire ancora.",
    history_unreadable: "Non riesco a leggere la storia dell'incarico: non lo riapro.",
    trace_failed: "Non sono riuscito a scrivere il commento sull'incarico: senza traccia non lo riapro.",
    agent_error_not_cleared: "L'agente è ancora in errore: non riapro l'incarico.",
    agent_not_available: "L'agente è fermo per una ragione che non è un guasto tecnico (in pausa, terminato, in attesa di approvazione o in uno stato che non conosco): non riapro l'incarico.",
};
exports.BOARD_HOLD_SKIP_REASONS = [...exports.BOARD_RESUME_KEEP_REASONS, ...exports.BOARD_CLOSED_HOLD_REASONS];
exports.BoardHoldSkipReasonSchema = zod_1.z.enum(exports.BOARD_HOLD_SKIP_REASONS);
/** Strict identified log entry with a closed reason and a required UTC timestamp. */
exports.BoardHoldSkipLogSchema = zod_1.z.strictObject({
    companyId: zod_1.z.uuid(),
    issueIdentifier: zod_1.z.string().min(1).max(64),
    paperclipAgentId: zod_1.z.uuid(),
    reason: exports.BoardHoldSkipReasonSchema,
    at: zod_1.z.iso.datetime(),
});
function renderBoardHoldSkipLog(log) {
    const parsed = exports.BoardHoldSkipLogSchema.parse(log);
    return `fermo_non_riaperto azienda=${parsed.companyId} incarico=${parsed.issueIdentifier} agente=${parsed.paperclipAgentId} motivo=${parsed.reason} ora=${parsed.at}`;
}
exports.BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS = 3_600;
/** The consumer owns history and selects the previous entry for the same issue. */
function boardHoldSkipLogDue(previous, reason, nowMs) {
    return previous === undefined || previous.reason !== reason
        || nowMs - Date.parse(previous.at) >= exports.BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS * 1_000;
}
/** Paperclip v2026.1005.0 isAgentStatusInvokable: /app/packages/shared/dist/agent-eligibility.js:1-10. */
exports.BOARD_RESUME_AGENT_STATUSES = ['active', 'idle', 'running', 'error'];
function boardResumeAgentStatusAllowed(status) {
    return exports.BOARD_RESUME_AGENT_STATUSES.some((allowed) => allowed === status);
}
exports.BOARD_RESUME_MAX_PER_ISSUE_DEFAULT = 2;
exports.BOARD_RESUME_MIN_GAP_SECONDS_DEFAULT = 1800;
/** Runs of the day that must remain for a reopen: the wake and its disposition. */
exports.BOARD_RESUME_MIN_RUNS_LEFT = 2;
const COMMENT_MAX = 500;
/** Strict: no secret and no free text can enter the log line (R-33). */
exports.BoardResumeLogSchema = zod_1.z
    .strictObject({
    companyId: zod_1.z.uuid(),
    issueIdentifier: zod_1.z.string().min(1).max(64),
    paperclipAgentId: zod_1.z.uuid(),
    runtimeAgentId: zod_1.z.string().min(1).max(200).optional(),
    cause: zod_1.z.enum([...exports.BOARD_RESUME_CAUSES, ...exports.BOARD_CLOSED_HOLD_CAUSES]),
    attempt: zod_1.z.number().int().min(1),
    max: zod_1.z.number().int().min(1),
    at: zod_1.z.iso.datetime().optional(),
})
    .refine((log) => log.attempt <= log.max, { message: 'attempt must not exceed max', path: ['attempt'] });
function renderBoardResumeLog(log) {
    const base = `incarico_ripreso azienda=${log.companyId} incarico=${log.issueIdentifier} agente=${log.paperclipAgentId} causa=${log.cause} n=${log.attempt}/${log.max}`;
    const identified = log.runtimeAgentId === undefined ? base : `${base} identita=${log.runtimeAgentId}`;
    return log.at === undefined ? identified : `${identified} ora=${log.at}`;
}
exports.BOARD_RESUME_COMMENT_PREFIX = 'Ripartenza automatica (operatore di board): ';
exports.BOARD_RESUME_NEEDS_PERSON_PREFIX = 'Serve una persona: ';
const CAUSE_WORDS = {
    refused_turn: "il turno era stato rifiutato all'ammissione",
    stranded_infrastructure: "il turno è morto per un guasto dell'infrastruttura senza modifiche",
    interrupted_turn: 'il turno è stato interrotto da un riavvio o da un servizio non disponibile',
};
function boardResumeComment(input) {
    const text = `${exports.BOARD_RESUME_COMMENT_PREFIX}${CAUSE_WORDS[input.cause]}; riapertura ${input.attempt} di ${input.max}. Prima di rifare qualcosa guarda cosa è già stato fatto su questo incarico e non ripeterlo.`;
    return text.slice(0, COMMENT_MAX);
}
const CLOSED_HOLD_CAUSE_WORDS = {
    closed_hold_infrastructure: "il turno precedente è morto per un guasto dell'infrastruttura senza modifiche. Prima di agire controlla cosa è già stato fatto sull'incarico e non ripeterlo.",
    closed_hold_after_writes: "il turno precedente è stato interrotto DOPO aver scritto. Rileggi i commenti e lo stato dell'incarico prima di agire e non ripetere le modifiche già fatte.",
};
function boardClosedHoldComment(input) {
    const text = `${exports.BOARD_RESUME_COMMENT_PREFIX}riapertura ${input.attempt} di ${input.max}; ${CLOSED_HOLD_CAUSE_WORDS[input.cause]}`;
    return text.slice(0, COMMENT_MAX);
}
function boardResumeNeedsPersonComment(input) {
    return `${exports.BOARD_RESUME_NEEDS_PERSON_PREFIX}ho già riaperto questo incarico ${input.max} volte e si è fermato di nuovo: non lo riapro più da solo.`;
}
function boardResumeCommentKind(body) {
    if (body.startsWith(exports.BOARD_RESUME_COMMENT_PREFIX))
        return 'resume';
    if (body.startsWith(exports.BOARD_RESUME_NEEDS_PERSON_PREFIX))
        return 'needs_person';
    return null;
}
//# sourceMappingURL=board-resume.js.map