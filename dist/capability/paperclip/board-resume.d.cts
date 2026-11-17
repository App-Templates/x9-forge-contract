import { z } from 'zod';
/**
 * Shapes of the board-operator resume of a stopped issue. This module lists and words things; it never reopens
 * anything, reads settings or decides. Only technical causes are listed (closed list): a new cause is a bridge task.
 * Production values live in the consumer's settings, never here.
 */
/** Refused at admission; dead for an infrastructure fault with no changes; interrupted by a restart or an unavailable service. */
export declare const BOARD_RESUME_CAUSES: readonly ["refused_turn", "stranded_infrastructure", "interrupted_turn"];
export declare const BoardResumeCauseSchema: z.ZodEnum<{
    refused_turn: "refused_turn";
    stranded_infrastructure: "stranded_infrastructure";
    interrupted_turn: "interrupted_turn";
}>;
export type BoardResumeCause = z.infer<typeof BoardResumeCauseSchema>;
/** The last run died from an infrastructure fault, either without changes or after writing. */
export declare const BOARD_CLOSED_HOLD_CAUSES: readonly ["closed_hold_infrastructure", "closed_hold_after_writes"];
export declare const BoardClosedHoldCauseSchema: z.ZodEnum<{
    closed_hold_infrastructure: "closed_hold_infrastructure";
    closed_hold_after_writes: "closed_hold_after_writes";
}>;
export type BoardClosedHoldCause = z.infer<typeof BoardClosedHoldCauseSchema>;
/** Older holds need a person; the five-day ceiling prevents reopening week-old holds in bulk. */
export declare const BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_DEFAULT = 259200;
export declare const BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MIN = 3600;
export declare const BOARD_CLOSED_HOLD_MAX_AGE_SECONDS_MAX = 432000;
/** Remaining closed holds wait for the next consumer round (round_cap_reached). */
export declare const BOARD_CLOSED_HOLD_MAX_PER_ROUND_DEFAULT = 3;
export declare const BOARD_CLOSED_HOLD_MAX_PER_ROUND_MIN = 1;
export declare const BOARD_CLOSED_HOLD_MAX_PER_ROUND_MAX = 20;
export declare const BOARD_CLOSED_HOLD_REASONS: readonly ["other_recovery_action", "no_blocked_hold", "already_resolved", "issue_changed", "hold_too_old", "run_not_found", "run_not_infrastructure_failure", "activity_unreadable", "binding_not_verified", "paperclip_no_change", "paperclip_refused", "round_cap_reached"];
export declare const BoardClosedHoldReasonSchema: z.ZodEnum<{
    other_recovery_action: "other_recovery_action";
    no_blocked_hold: "no_blocked_hold";
    already_resolved: "already_resolved";
    issue_changed: "issue_changed";
    hold_too_old: "hold_too_old";
    run_not_found: "run_not_found";
    run_not_infrastructure_failure: "run_not_infrastructure_failure";
    activity_unreadable: "activity_unreadable";
    binding_not_verified: "binding_not_verified";
    paperclip_no_change: "paperclip_no_change";
    paperclip_refused: "paperclip_refused";
    round_cap_reached: "round_cap_reached";
}>;
export type BoardClosedHoldReason = z.infer<typeof BoardClosedHoldReasonSchema>;
/** A reason added to the list without a sentence here does not compile. */
export declare const BOARD_CLOSED_HOLD_TEXT: {
    readonly other_recovery_action: "C'è un'altra azione di recupero sull'incarico: non lo riapro.";
    readonly no_blocked_hold: "Non risulta un fermo già chiuso con esito bloccato: non riapro l'incarico.";
    readonly already_resolved: "L'incarico è già risolto: non lo riapro.";
    readonly issue_changed: "L'incarico è cambiato o un agente ha scritto dopo il fermo: non lo riapro.";
    readonly hold_too_old: "Il fermo è troppo vecchio: serve una persona per riaprire l'incarico.";
    readonly run_not_found: "Non trovo la corsa che ha causato il fermo: non riapro l'incarico.";
    readonly run_not_infrastructure_failure: "La corsa non risulta interrotta da un guasto dell'infrastruttura: non riapro l'incarico.";
    readonly activity_unreadable: "Non riesco a leggere l'attività dell'incarico: non lo riapro.";
    readonly binding_not_verified: "Non posso verificare il legame tra azienda, incarico e agente: non riapro l'incarico.";
    readonly paperclip_no_change: "Paperclip non ha applicato la ripresa: l'incarico resta fermo.";
    readonly paperclip_refused: "Paperclip ha rifiutato la ripresa: l'incarico resta fermo.";
    readonly round_cap_reached: "Il tetto di riaperture dei fermi chiusi per questo giro è raggiunto: aspetto il prossimo giro.";
};
export declare const BOARD_RESUME_KEEP_REASONS: readonly ["cause_not_recognised", "cause_disabled", "open_blockers", "declared_wait", "person_touched", "run_in_flight", "daily_cap_reached", "daily_cap_unreadable", "max_resumes_reached", "too_soon", "history_unreadable", "trace_failed", "agent_error_not_cleared", "agent_not_available"];
export declare const BoardResumeKeepReasonSchema: z.ZodEnum<{
    cause_not_recognised: "cause_not_recognised";
    cause_disabled: "cause_disabled";
    open_blockers: "open_blockers";
    declared_wait: "declared_wait";
    person_touched: "person_touched";
    run_in_flight: "run_in_flight";
    daily_cap_reached: "daily_cap_reached";
    daily_cap_unreadable: "daily_cap_unreadable";
    max_resumes_reached: "max_resumes_reached";
    too_soon: "too_soon";
    history_unreadable: "history_unreadable";
    trace_failed: "trace_failed";
    agent_error_not_cleared: "agent_error_not_cleared";
    agent_not_available: "agent_not_available";
}>;
export type BoardResumeKeepReason = z.infer<typeof BoardResumeKeepReasonSchema>;
/** A reason added to the list without a sentence here does not compile. */
export declare const BOARD_RESUME_KEEP_TEXT: {
    readonly cause_not_recognised: "La causa del fermo non è tra quelle tecniche note: non riapro l'incarico.";
    readonly cause_disabled: "La ripartenza automatica per questa causa è spenta: non riapro l'incarico.";
    readonly open_blockers: "L'incarico aspetta altri incarichi: non lo riapro.";
    readonly declared_wait: "L'incarico dichiara un'attesa: non lo riapro.";
    readonly person_touched: "Una persona ha scritto sull'incarico dopo il fermo: lo lascio a lei.";
    readonly run_in_flight: "Sull'incarico c'è una corsa in corso: non lo riapro.";
    readonly daily_cap_reached: "Il tetto di corse del giorno è raggiunto: non riapro l'incarico.";
    readonly daily_cap_unreadable: "Non riesco a leggere il tetto di corse del giorno: non riapro l'incarico.";
    readonly max_resumes_reached: "Ho già riaperto questo incarico il massimo di volte: non lo riapro più da solo.";
    readonly too_soon: "L'ultima riapertura è troppo recente: aspetto prima di riaprire ancora.";
    readonly history_unreadable: "Non riesco a leggere la storia dell'incarico: non lo riapro.";
    readonly trace_failed: "Non sono riuscito a scrivere il commento sull'incarico: senza traccia non lo riapro.";
    readonly agent_error_not_cleared: "L'agente è ancora in errore: non riapro l'incarico.";
    readonly agent_not_available: "L'agente è fermo per una ragione che non è un guasto tecnico (in pausa, terminato, in attesa di approvazione o in uno stato che non conosco): non riapro l'incarico.";
};
/** Paperclip v2026.1005.0 isAgentStatusInvokable: /app/packages/shared/dist/agent-eligibility.js:1-10. */
export declare const BOARD_RESUME_AGENT_STATUSES: readonly ["active", "idle", "running", "error"];
export declare function boardResumeAgentStatusAllowed(status: string | null | undefined): boolean;
export declare const BOARD_RESUME_MAX_PER_ISSUE_DEFAULT = 2;
export declare const BOARD_RESUME_MIN_GAP_SECONDS_DEFAULT = 1800;
/** Runs of the day that must remain for a reopen: the wake and its disposition. */
export declare const BOARD_RESUME_MIN_RUNS_LEFT = 2;
/** Strict: no secret and no free text can enter the log line (R-33). */
export declare const BoardResumeLogSchema: z.ZodObject<{
    companyId: z.ZodUUID;
    issueIdentifier: z.ZodString;
    paperclipAgentId: z.ZodUUID;
    runtimeAgentId: z.ZodOptional<z.ZodString>;
    cause: z.ZodEnum<{
        refused_turn: "refused_turn";
        stranded_infrastructure: "stranded_infrastructure";
        interrupted_turn: "interrupted_turn";
        closed_hold_infrastructure: "closed_hold_infrastructure";
        closed_hold_after_writes: "closed_hold_after_writes";
    }>;
    attempt: z.ZodNumber;
    max: z.ZodNumber;
    at: z.ZodOptional<z.ZodISODateTime>;
}, z.core.$strict>;
export type BoardResumeLog = z.infer<typeof BoardResumeLogSchema>;
export declare function renderBoardResumeLog(log: BoardResumeLog): string;
export declare const BOARD_RESUME_COMMENT_PREFIX = "Ripartenza automatica (operatore di board): ";
export declare const BOARD_RESUME_NEEDS_PERSON_PREFIX = "Serve una persona: ";
export declare function boardResumeComment(input: {
    cause: BoardResumeCause;
    attempt: number;
    max: number;
}): string;
export declare function boardClosedHoldComment(input: {
    cause: BoardClosedHoldCause;
    attempt: number;
    max: number;
}): string;
export declare function boardResumeNeedsPersonComment(input: {
    max: number;
}): string;
export declare function boardResumeCommentKind(body: string): 'resume' | 'needs_person' | null;
//# sourceMappingURL=board-resume.d.ts.map