import { z } from 'zod';
/**
 * The reasons Paperclip gives a wake. On the wire `reason` is a free string (Paperclip packages/shared/src/validators/agent.ts:234):
 * there is no enum to import, so these lists are what Paperclip 2026.1005.0 emits, verified in its server. A reason that is in none of them
 * is read as `other` and never refused: Paperclip's own wake diagnostics project an unknown reason the same way
 * (skills/paperclip/references/api-reference.md:316).
 */
/** Work the agent is asked to look at on its own task or card: the reasons a turn is built for. */
export declare const PAPERCLIP_WAKE_REASONS_WORK: readonly ["issue_assigned", "issue_status_changed", "issue_commented", "issue_reopened_via_comment", "issue_blockers_resolved", "issue_children_completed", "interaction_pending", "issue_unblock_requested", "issue_monitor_due", "missing_issue_comment", "issue_recovery_action_restored", "task_watchdog_stopped_subtree", "execution_review_requested", "execution_approval_requested", "execution_changes_requested", "approval_approved"];
/** Recovery and retry wakes the server emits by itself; the agent is asked for a disposition, not for new work. */
export declare const PAPERCLIP_WAKE_REASONS_RECOVERY: readonly ["issue_monitor_recovery", "issue_monitor_recovery_issue", "issue_assignment_recovery", "issue_continuation_needed", "issue_review_path_lost", "issue_disposition_repair", "run_liveness_continuation", "finish_successful_run_handoff", "issue_graph_liveness_backstop", "provider_quota_recovery", "max_turns_continuation_retry", "workspace_busy_retry", "execution_review_participant_recovery"];
/** Wakes outside the coordination between agents (timer, chat, email, goals, decisions, skill tests, board retries). */
export declare const PAPERCLIP_WAKE_REASONS_OTHER_FAMILIES: readonly ["heartbeat_timer", "issue_checked_out", "issue_tree_restored", "issue_tree_resumed", "goal_control", "chat_task_completed", "retry_failed_run", "email_received", "secret_proposal_resolved", "skill_test_run_created", "attention_auto_archived", "decision_decided", "decision_expired", "decision_cancelled"];
/** Dropped at admission, so it never wakes anybody: a mention is context, not a trigger (services/heartbeat.ts:26709-26711). */
export declare const PAPERCLIP_WAKE_REASONS_DROPPED: readonly ["issue_comment_mentioned"];
export declare const PAPERCLIP_WAKE_REASONS: readonly ["issue_assigned", "issue_status_changed", "issue_commented", "issue_reopened_via_comment", "issue_blockers_resolved", "issue_children_completed", "interaction_pending", "issue_unblock_requested", "issue_monitor_due", "missing_issue_comment", "issue_recovery_action_restored", "task_watchdog_stopped_subtree", "execution_review_requested", "execution_approval_requested", "execution_changes_requested", "approval_approved", "issue_monitor_recovery", "issue_monitor_recovery_issue", "issue_assignment_recovery", "issue_continuation_needed", "issue_review_path_lost", "issue_disposition_repair", "run_liveness_continuation", "finish_successful_run_handoff", "issue_graph_liveness_backstop", "provider_quota_recovery", "max_turns_continuation_retry", "workspace_busy_retry", "execution_review_participant_recovery", "heartbeat_timer", "issue_checked_out", "issue_tree_restored", "issue_tree_resumed", "goal_control", "chat_task_completed", "retry_failed_run", "email_received", "secret_proposal_resolved", "skill_test_run_created", "attention_auto_archived", "decision_decided", "decision_expired", "decision_cancelled"];
export declare const PaperclipWakeReasonSchema: z.ZodEnum<{
    interaction_pending: "interaction_pending";
    issue_assigned: "issue_assigned";
    issue_status_changed: "issue_status_changed";
    issue_commented: "issue_commented";
    issue_reopened_via_comment: "issue_reopened_via_comment";
    issue_blockers_resolved: "issue_blockers_resolved";
    issue_children_completed: "issue_children_completed";
    issue_unblock_requested: "issue_unblock_requested";
    issue_monitor_due: "issue_monitor_due";
    missing_issue_comment: "missing_issue_comment";
    issue_recovery_action_restored: "issue_recovery_action_restored";
    task_watchdog_stopped_subtree: "task_watchdog_stopped_subtree";
    execution_review_requested: "execution_review_requested";
    execution_approval_requested: "execution_approval_requested";
    execution_changes_requested: "execution_changes_requested";
    approval_approved: "approval_approved";
    issue_monitor_recovery: "issue_monitor_recovery";
    issue_monitor_recovery_issue: "issue_monitor_recovery_issue";
    issue_assignment_recovery: "issue_assignment_recovery";
    issue_continuation_needed: "issue_continuation_needed";
    issue_review_path_lost: "issue_review_path_lost";
    issue_disposition_repair: "issue_disposition_repair";
    run_liveness_continuation: "run_liveness_continuation";
    finish_successful_run_handoff: "finish_successful_run_handoff";
    issue_graph_liveness_backstop: "issue_graph_liveness_backstop";
    provider_quota_recovery: "provider_quota_recovery";
    max_turns_continuation_retry: "max_turns_continuation_retry";
    workspace_busy_retry: "workspace_busy_retry";
    execution_review_participant_recovery: "execution_review_participant_recovery";
    heartbeat_timer: "heartbeat_timer";
    issue_checked_out: "issue_checked_out";
    issue_tree_restored: "issue_tree_restored";
    issue_tree_resumed: "issue_tree_resumed";
    goal_control: "goal_control";
    chat_task_completed: "chat_task_completed";
    retry_failed_run: "retry_failed_run";
    email_received: "email_received";
    secret_proposal_resolved: "secret_proposal_resolved";
    skill_test_run_created: "skill_test_run_created";
    attention_auto_archived: "attention_auto_archived";
    decision_decided: "decision_decided";
    decision_expired: "decision_expired";
    decision_cancelled: "decision_cancelled";
}>;
export type PaperclipWakeReason = z.infer<typeof PaperclipWakeReasonSchema>;
/** Not Paperclip reasons: the ones the X9 stack invents for its own wakes (`x9_referent_reply`, `x9-delivery:<run>:<uuid>`, ...). */
export declare const PAPERCLIP_X9_WAKE_REASON_PREFIXES: readonly ["x9_", "x9-delivery:"];
export type PaperclipWakeReasonKind = 'paperclip' | 'x9_own' | 'other';
/** Pure: where a reason comes from. `x9_own` is not a Paperclip reason and never enters PAPERCLIP_WAKE_REASONS. */
export declare function paperclipWakeReasonKind(reason: string | null | undefined): PaperclipWakeReasonKind;
/**
 * The wake that ends the wait of a parent for its child. Paperclip sends ONE wake per agent and task, and which one depends on the
 * route that closed the child: PATCH gives `issue_children_completed` (the later wake replaces the earlier one,
 * routes/issues.ts:14478-14491), a comment that closes it gives `issue_blockers_resolved` (the first wake wins, routes/issues.ts:17943-17951).
 * A consumer handles both the same way.
 */
export declare const PAPERCLIP_WAKE_REASONS_END_OF_CHILD_WAIT: readonly ["issue_blockers_resolved", "issue_children_completed"];
export declare function paperclipWakeEndsChildWait(reason: string | null | undefined): boolean;
/** Paperclip packages/shared/src/constants.ts:896-904 and validators/agent.ts:228-232. */
export declare const PAPERCLIP_WAKE_SOURCES: readonly ["timer", "assignment", "on_demand", "automation"];
export declare const PAPERCLIP_WAKE_TRIGGER_DETAILS: readonly ["manual", "ping", "callback", "system"];
/**
 * The environment variables Paperclip documents for an agent run (docs/guides/agent-developer/how-agents-work.md:19-37;
 * `PAPERCLIP_LINKED_ISSUE_IDS`: docs/deploy/environment-variables.md:206, docs/guides/agent-developer/handling-approvals.md:66): names only.
 * The adapters inject them; the injection itself is not in the Paperclip snapshot, so no value is described here.
 */
export declare const PAPERCLIP_ENV_NAMES: readonly ["PAPERCLIP_AGENT_ID", "PAPERCLIP_COMPANY_ID", "PAPERCLIP_API_URL", "PAPERCLIP_API_KEY", "PAPERCLIP_RUN_ID", "PAPERCLIP_TASK_ID", "PAPERCLIP_WAKE_REASON", "PAPERCLIP_WAKE_COMMENT_ID", "PAPERCLIP_APPROVAL_ID", "PAPERCLIP_APPROVAL_STATUS", "PAPERCLIP_LINKED_ISSUE_IDS"];
/** The one that is a secret: never in a prompt, a comment, a document or a log (skills/paperclip/SKILL.md:20). */
export declare const PAPERCLIP_ENV_SECRET_NAMES: readonly ["PAPERCLIP_API_KEY"];
export declare const PAPERCLIP_MOTIVO_COMMENTO_MANCANTE: "missing_issue_comment";
export declare const PAPERCLIP_COMMENTO_OBBLIGATORIO_STATI: readonly ["satisfied", "retry_queued", "retry_exhausted"];
export declare const PAPERCLIP_RECUPERO_INTENTI: readonly ["status_only"];
export declare const PAPERCLIP_COMMENTO_MANCANTE_RITENTATIVI = 1;
/** An issue as the wake context summarizes it (services/issues.ts:9181-9208; services/heartbeat.ts:5688-5698). */
export declare const PaperclipTurnoIncaricoSintesiSchema: z.ZodObject<{
    id: z.ZodGUID;
    identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    title: z.ZodString;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
    summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export declare const PaperclipTurnoContestoSchema: z.ZodObject<{
    taskId: z.ZodOptional<z.ZodGUID>;
    issueId: z.ZodOptional<z.ZodGUID>;
    wakeReason: z.ZodOptional<z.ZodString>;
    wakeCommentId: z.ZodOptional<z.ZodGUID>;
    commentId: z.ZodOptional<z.ZodGUID>;
    recoveryIntent: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
        status_only: "status_only";
    }>>>;
    allowDeliverableWork: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    allowDocumentUpdates: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    resumeRequiresNormalModel: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    source: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    wakeSource: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
        timer: "timer";
        assignment: "assignment";
        on_demand: "on_demand";
        automation: "automation";
    }>>>;
    wakeTriggerDetail: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
        system: "system";
        callback: "callback";
        manual: "manual";
        ping: "ping";
    }>>>;
    resolvedBlockerIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
    blockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
    completedChildIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
    childIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
    childIssueSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        title: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>>>;
    childIssueSummaryTruncated: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    onboardingCompletion: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    dependencyBlockedInteraction: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
    unresolvedBlockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
    unresolvedBlockerCount: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
    unresolvedBlockerSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodGUID;
        identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        title: z.ZodString;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
        summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    }, z.core.$loose>>>>;
    interactionId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
    interactionKind: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    interactionStatus: z.ZodCatch<z.ZodOptional<z.ZodString>>;
    taskWatchdog: z.ZodCatch<z.ZodOptional<z.ZodObject<{
        watchedIssueId: z.ZodGUID;
        stopFingerprint: z.ZodString;
    }, z.core.$loose>>>;
}, z.core.$loose>;
export type PaperclipTurnoContesto = z.infer<typeof PaperclipTurnoContestoSchema>;
export declare function paperclipTurnoSoloDisposizione(ctx: PaperclipTurnoContesto): boolean;
export declare const PaperclipTurnoRichiestaSchema: z.ZodObject<{
    runId: z.ZodGUID;
    agentId: z.ZodGUID;
    context: z.ZodObject<{
        taskId: z.ZodOptional<z.ZodGUID>;
        issueId: z.ZodOptional<z.ZodGUID>;
        wakeReason: z.ZodOptional<z.ZodString>;
        wakeCommentId: z.ZodOptional<z.ZodGUID>;
        commentId: z.ZodOptional<z.ZodGUID>;
        recoveryIntent: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
            status_only: "status_only";
        }>>>;
        allowDeliverableWork: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        allowDocumentUpdates: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        resumeRequiresNormalModel: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        source: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        wakeSource: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
            timer: "timer";
            assignment: "assignment";
            on_demand: "on_demand";
            automation: "automation";
        }>>>;
        wakeTriggerDetail: z.ZodCatch<z.ZodOptional<z.ZodEnum<{
            system: "system";
            callback: "callback";
            manual: "manual";
            ping: "ping";
        }>>>;
        resolvedBlockerIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
        blockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
        completedChildIssueId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
        childIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
        childIssueSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodGUID;
            identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            title: z.ZodString;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>>;
        childIssueSummaryTruncated: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        onboardingCompletion: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        dependencyBlockedInteraction: z.ZodCatch<z.ZodOptional<z.ZodBoolean>>;
        unresolvedBlockerIssueIds: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodGUID>>>;
        unresolvedBlockerCount: z.ZodCatch<z.ZodOptional<z.ZodNumber>>;
        unresolvedBlockerSummaries: z.ZodCatch<z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodGUID;
            identifier: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            title: z.ZodString;
            status: z.ZodEnum<{
                cancelled: "cancelled";
                done: "done";
                blocked: "blocked";
                backlog: "backlog";
                todo: "todo";
                in_progress: "in_progress";
                in_review: "in_review";
            }>;
            assigneeAgentId: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
            summary: z.ZodOptional<z.ZodNullable<z.ZodString>>;
        }, z.core.$loose>>>>;
        interactionId: z.ZodCatch<z.ZodOptional<z.ZodGUID>>;
        interactionKind: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        interactionStatus: z.ZodCatch<z.ZodOptional<z.ZodString>>;
        taskWatchdog: z.ZodCatch<z.ZodOptional<z.ZodObject<{
            watchedIssueId: z.ZodGUID;
            stopFingerprint: z.ZodString;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
}, z.core.$loose>;
export type PaperclipTurnoRichiesta = z.infer<typeof PaperclipTurnoRichiestaSchema>;
export declare const PaperclipTurnoRispostaSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    runId: z.ZodGUID;
}, z.core.$strict>;
export type PaperclipTurnoRisposta = z.infer<typeof PaperclipTurnoRispostaSchema>;
export declare const PAPERCLIP_TURNO_ERRORI: readonly ["feature_off", "segreto_non_valido", "richiesta_non_valida", "agente_sconosciuto", "turno_gia_aperto", "turno_fallito"];
export declare const PaperclipTurnoErroreSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodEnum<{
        feature_off: "feature_off";
        segreto_non_valido: "segreto_non_valido";
        richiesta_non_valida: "richiesta_non_valida";
        agente_sconosciuto: "agente_sconosciuto";
        turno_gia_aperto: "turno_gia_aperto";
        turno_fallito: "turno_fallito";
    }>;
}, z.core.$strict>;
export type PaperclipTurnoErrore = z.infer<typeof PaperclipTurnoErroreSchema>;
export declare function incaricoDelTurno(ctx: PaperclipTurnoContesto): string | null;
//# sourceMappingURL=turno.d.ts.map