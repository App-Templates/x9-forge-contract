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
export declare const BOARD_HOLD_SKIP_REASONS: readonly ["cause_not_recognised", "cause_disabled", "open_blockers", "declared_wait", "person_touched", "run_in_flight", "daily_cap_reached", "daily_cap_unreadable", "max_resumes_reached", "too_soon", "history_unreadable", "trace_failed", "agent_error_not_cleared", "agent_not_available", "other_recovery_action", "no_blocked_hold", "already_resolved", "issue_changed", "hold_too_old", "run_not_found", "run_not_infrastructure_failure", "activity_unreadable", "binding_not_verified", "paperclip_no_change", "paperclip_refused", "round_cap_reached"];
export declare const BoardHoldSkipReasonSchema: z.ZodEnum<{
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
export type BoardHoldSkipReason = z.infer<typeof BoardHoldSkipReasonSchema>;
/** Strict identified log entry with a closed reason and a required UTC timestamp. */
export declare const BoardHoldSkipLogSchema: z.ZodObject<{
    companyId: z.ZodUUID;
    issueIdentifier: z.ZodString;
    paperclipAgentId: z.ZodUUID;
    reason: z.ZodEnum<{
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
    at: z.ZodISODateTime;
}, z.core.$strict>;
export type BoardHoldSkipLog = z.infer<typeof BoardHoldSkipLogSchema>;
export declare function renderBoardHoldSkipLog(log: BoardHoldSkipLog): string;
export declare const BOARD_HOLD_SKIP_LOG_REPEAT_SECONDS = 3600;
/** The consumer owns history and selects the previous entry for the same issue. */
export declare function boardHoldSkipLogDue(previous: Pick<BoardHoldSkipLog, 'reason' | 'at'> | undefined, reason: BoardHoldSkipReason, nowMs: number): boolean;
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
/**
 * Declaration of the observed outcome of a CLOSED hold, for Paperclip's `POST /issues/:id/recovery-actions/resolve`
 * (`executionReconciliation`). Never `completed`: an automatic operator cannot know that. Source: Paperclip
 * v2026.1005.0 execution-recovery-resolution.js:14-74.
 */
export declare const BOARD_RECONCILIATION_OUTCOMES: readonly ["not_performed", "mixed"];
export declare const BoardReconciliationOutcomeSchema: z.ZodEnum<{
    not_performed: "not_performed";
    mixed: "mixed";
}>;
export type BoardReconciliationOutcome = z.infer<typeof BoardReconciliationOutcomeSchema>;
/** Run states in which the provider is certainly stopped (execution-recovery-resolution.js:39). */
export declare const BOARD_RECONCILIATION_FINISHED_RUN_STATUSES: readonly ["failed", "interrupted", "timed_out", "cancelled"];
export declare const BOARD_RECONCILIATION_EVIDENCE_MIN = 20;
export declare const BOARD_RECONCILIATION_EVIDENCE_MAX = 12000;
/** Facts the consumer has read; the declaration is derived only from them. */
export declare const BoardClosedHoldFactsSchema: z.ZodObject<{
    cause: z.ZodEnum<{
        closed_hold_infrastructure: "closed_hold_infrastructure";
        closed_hold_after_writes: "closed_hold_after_writes";
    }>;
    runId: z.ZodUUID;
    runStatus: z.ZodString;
    runErrorCode: z.ZodNullable<z.ZodString>;
    commentsByRun: z.ZodNumber;
    writes: z.ZodArray<z.ZodObject<{
        action: z.ZodString;
        count: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type BoardClosedHoldFacts = z.infer<typeof BoardClosedHoldFactsSchema>;
export declare const BoardReconciliationSchema: z.ZodObject<{
    runId: z.ZodUUID;
    providerStopped: z.ZodLiteral<true>;
    actionOutcome: z.ZodEnum<{
        not_performed: "not_performed";
        mixed: "mixed";
    }>;
    outcomeEvidence: z.ZodString;
}, z.core.$strict>;
export type BoardReconciliation = z.infer<typeof BoardReconciliationSchema>;
/** Builds the true declaration; throws when the facts do not support it (never declares what is not known). */
export declare function boardClosedHoldReconciliation(facts: BoardClosedHoldFacts): BoardReconciliation;
/**
 * Reading side of the declaration: Paperclip puts one `{recoveryActionId, decision}` per resolved recovery action in
 * the resume context (`recoveryOutcomes`; execution-continuation.js:296-302). Only the named fields of `decision`
 * are read and shown; extra fields written by Paperclip or by a person are dropped.
 */
export declare const BOARD_RECOVERY_OUTCOME_VALUES: readonly ["completed", "not_performed", "mixed"];
export type BoardRecoveryOutcomeValue = (typeof BOARD_RECOVERY_OUTCOME_VALUES)[number];
export declare const BOARD_RECOVERY_OUTCOME_WORDS: {
    readonly completed: "eseguito";
    readonly not_performed: "non eseguito";
    readonly mixed: "eseguito in parte";
};
export declare const BoardRecoveryOutcomeSchema: z.ZodObject<{
    decision: z.ZodObject<{
        runId: z.ZodGUID;
        providerStopped: z.ZodLiteral<true>;
        actionOutcome: z.ZodEnum<{
            completed: "completed";
            not_performed: "not_performed";
            mixed: "mixed";
        }>;
        outcomeEvidence: z.ZodString;
        recordedAt: z.ZodCatch<z.ZodOptional<z.ZodISODateTime>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type BoardRecoveryOutcome = z.infer<typeof BoardRecoveryOutcomeSchema>;
export declare const BOARD_RECOVERY_OUTCOMES_SHOWN_MAX = 3;
export declare const BOARD_RECOVERY_OUTCOME_EVIDENCE_SHOWN_MAX = 1500;
export declare const BOARD_RECOVERY_OUTCOMES_OPEN = "<<<esiti-turni-caduti>>>";
export declare const BOARD_RECOVERY_OUTCOMES_CLOSE = "<<<fine-esiti>>>";
/** Text block for the boss with the recorded outcomes of fallen turns; null when no entry is valid. Pure, never throws. */
export declare function boardRecoveryOutcomesBlock(raw: unknown): string | null;
/** Paperclip refusals of the resolve call, closed list (execution-recovery-resolution.js:18-74). */
export declare const BOARD_RECONCILE_REFUSALS: readonly ["provider_not_stopped", "execution_not_settled", "owner_or_source_changed", "run_mismatch", "workspace_repair_required", "other_active_action", "action_not_found", "bad_request", "other_refusal"];
export declare const BoardReconcileRefusalSchema: z.ZodEnum<{
    provider_not_stopped: "provider_not_stopped";
    execution_not_settled: "execution_not_settled";
    owner_or_source_changed: "owner_or_source_changed";
    run_mismatch: "run_mismatch";
    workspace_repair_required: "workspace_repair_required";
    other_active_action: "other_active_action";
    action_not_found: "action_not_found";
    bad_request: "bad_request";
    other_refusal: "other_refusal";
}>;
export type BoardReconcileRefusal = z.infer<typeof BoardReconcileRefusalSchema>;
export declare const BOARD_RECONCILE_REFUSAL_TEXT: {
    readonly provider_not_stopped: "Paperclip non considera fermo il turno: non riapro.";
    readonly execution_not_settled: "Paperclip non ha ancora chiuso l'esecuzione del turno: riprovo al prossimo giro.";
    readonly owner_or_source_changed: "L'incarico ha cambiato responsabile o origine: non riapro.";
    readonly run_mismatch: "Il turno dichiarato non è quello dell'azione di recupero: non riapro.";
    readonly workspace_repair_required: "Serve prima riparare lo spazio di lavoro: non riapro.";
    readonly other_active_action: "C'è già un'altra azione di recupero attiva sull'incarico: non riapro.";
    readonly action_not_found: "L'azione di recupero non esiste più: non riapro.";
    readonly bad_request: "Paperclip ha rifiutato la richiesta perché malformata: non riapro.";
    readonly other_refusal: "Paperclip ha rifiutato la riapertura per un motivo non previsto: non riapro.";
};
/** Status first (404, 400), then the exact message (trimmed, case-sensitive); anything else fails closed. */
export declare function boardReconcileRefusalCode(status: number, message: string | null | undefined): BoardReconcileRefusal;
export declare const BoardReconcileRefusalLogSchema: z.ZodObject<{
    companyId: z.ZodUUID;
    issueIdentifier: z.ZodString;
    paperclipAgentId: z.ZodUUID;
    status: z.ZodNumber;
    code: z.ZodEnum<{
        provider_not_stopped: "provider_not_stopped";
        execution_not_settled: "execution_not_settled";
        owner_or_source_changed: "owner_or_source_changed";
        run_mismatch: "run_mismatch";
        workspace_repair_required: "workspace_repair_required";
        other_active_action: "other_active_action";
        action_not_found: "action_not_found";
        bad_request: "bad_request";
        other_refusal: "other_refusal";
    }>;
    at: z.ZodISODateTime;
}, z.core.$strict>;
export type BoardReconcileRefusalLog = z.infer<typeof BoardReconcileRefusalLogSchema>;
export declare function renderBoardReconcileRefusalLog(log: BoardReconcileRefusalLog): string;
//# sourceMappingURL=board-resume.d.ts.map