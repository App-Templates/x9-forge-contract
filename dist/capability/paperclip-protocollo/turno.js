import { z } from 'zod';
import { PaperclipStatoIncaricoSchema } from "./wire-letture.js";
/**
 * The reasons Paperclip gives a wake. On the wire `reason` is a free string (Paperclip packages/shared/src/validators/agent.ts:234):
 * there is no enum to import, so these lists are what Paperclip 2026.1005.0 emits, verified in its server. A reason that is in none of them
 * is read as `other` and never refused: Paperclip's own wake diagnostics project an unknown reason the same way
 * (skills/paperclip/references/api-reference.md:316).
 */
/** Work the agent is asked to look at on its own task or card: the reasons a turn is built for. */
export const PAPERCLIP_WAKE_REASONS_WORK = [
    'issue_assigned', // routes/issues.ts:11983 (create), 14547-14587 (PATCH with a new assignee, status not backlog; reason at 14559)
    'issue_status_changed', // routes/issues.ts:14589-14620, reason at 14600 (assignee unchanged: backlog to todo, blocked to todo, closed to todo)
    'issue_commented', // routes/issues.ts:14654 (PATCH with a comment), 18084 (comment route); also the wake of a resolved card (routes/issues.ts:2720), with `interactionId`
    'issue_reopened_via_comment', // routes/issues.ts:14654, 18053
    'issue_blockers_resolved', // routes/issues.ts:14492-14530 (called at 14705, 14736): every blocker is done
    'issue_children_completed', // routes/issues.ts:14820-14823: every direct child is done or cancelled
    'interaction_pending', // routes/issues.ts:15876: a card is addressed to this agent
    'issue_unblock_requested', // services/routable-blocked.ts:28: a blocked task names this agent as the unblock owner
    'issue_monitor_due', // services/heartbeat.ts:11916, 11985: the one-shot check is due
    'missing_issue_comment', // services/heartbeat.ts:14087: the run ended without a comment; the context is `status only`
    'issue_recovery_action_restored', // routes/issues.ts:9540-9551; routes/execution-workspaces.ts:1107-1122
    'task_watchdog_stopped_subtree', // services/task-watchdogs.ts:1553: the watched subtree has stopped
    'execution_review_requested', 'execution_approval_requested', 'execution_changes_requested', // routes/issues.ts:2897-2969 (stages)
    'approval_approved', // routes/approvals.ts:325
];
/** Recovery and retry wakes the server emits by itself; the agent is asked for a disposition, not for new work. */
export const PAPERCLIP_WAKE_REASONS_RECOVERY = [
    'issue_monitor_recovery', 'issue_monitor_recovery_issue', // services/heartbeat.ts:11396-11484
    'issue_assignment_recovery', 'issue_continuation_needed', // modules/wake-queue/domain/policy.ts:250-271
    'issue_review_path_lost', // services/recovery/review-path-recovery.ts:7
    'issue_disposition_repair', // services/execution-recovery-attempt.ts:30
    'run_liveness_continuation', // services/recovery/origins.ts:10
    'finish_successful_run_handoff', // services/recovery/successful-run-handoff.ts:19
    'issue_graph_liveness_backstop', // services/recovery/service.ts:5553
    'provider_quota_recovery', 'max_turns_continuation_retry', 'workspace_busy_retry', 'execution_review_participant_recovery',
];
/** Wakes outside the coordination between agents (timer, chat, email, goals, decisions, skill tests, board retries). */
export const PAPERCLIP_WAKE_REASONS_OTHER_FAMILIES = [
    'heartbeat_timer', 'issue_checked_out', 'issue_tree_restored', 'issue_tree_resumed', 'goal_control', 'chat_task_completed',
    'retry_failed_run', 'email_received', 'secret_proposal_resolved', 'skill_test_run_created', 'attention_auto_archived',
    'decision_decided', 'decision_expired', 'decision_cancelled', // services/decision-wakeup.ts:26 (`decision_${outcome}`; outcomes in services/decisions.ts:19)
];
/** Dropped at admission, so it never wakes anybody: a mention is context, not a trigger (services/heartbeat.ts:26709-26711). */
export const PAPERCLIP_WAKE_REASONS_DROPPED = ['issue_comment_mentioned'];
export const PAPERCLIP_WAKE_REASONS = [
    ...PAPERCLIP_WAKE_REASONS_WORK, ...PAPERCLIP_WAKE_REASONS_RECOVERY, ...PAPERCLIP_WAKE_REASONS_OTHER_FAMILIES,
];
export const PaperclipWakeReasonSchema = z.enum(PAPERCLIP_WAKE_REASONS);
/** Not Paperclip reasons: the ones the X9 stack invents for its own wakes (`x9_referent_reply`, `x9-delivery:<run>:<uuid>`, ...). */
export const PAPERCLIP_X9_WAKE_REASON_PREFIXES = ['x9_', 'x9-delivery:'];
/** Pure: where a reason comes from. `x9_own` is not a Paperclip reason and never enters PAPERCLIP_WAKE_REASONS. */
export function paperclipWakeReasonKind(reason) {
    if (typeof reason !== 'string')
        return 'other';
    if (PAPERCLIP_WAKE_REASONS.includes(reason))
        return 'paperclip';
    return PAPERCLIP_X9_WAKE_REASON_PREFIXES.some(prefix => reason.startsWith(prefix)) ? 'x9_own' : 'other';
}
/**
 * The wake that ends the wait of a parent for its child. Paperclip sends ONE wake per agent and task, and which one depends on the
 * route that closed the child: PATCH gives `issue_children_completed` (the later wake replaces the earlier one,
 * routes/issues.ts:14478-14491), a comment that closes it gives `issue_blockers_resolved` (the first wake wins, routes/issues.ts:17943-17951).
 * A consumer handles both the same way.
 */
export const PAPERCLIP_WAKE_REASONS_END_OF_CHILD_WAIT = ['issue_blockers_resolved', 'issue_children_completed'];
export function paperclipWakeEndsChildWait(reason) {
    return PAPERCLIP_WAKE_REASONS_END_OF_CHILD_WAIT.includes(reason);
}
/** Paperclip packages/shared/src/constants.ts:896-904 and validators/agent.ts:228-232. */
export const PAPERCLIP_WAKE_SOURCES = ['timer', 'assignment', 'on_demand', 'automation'];
export const PAPERCLIP_WAKE_TRIGGER_DETAILS = ['manual', 'ping', 'callback', 'system'];
/**
 * The environment variables Paperclip documents for an agent run (docs/guides/agent-developer/how-agents-work.md:19-37;
 * `PAPERCLIP_LINKED_ISSUE_IDS`: docs/deploy/environment-variables.md:206, docs/guides/agent-developer/handling-approvals.md:66): names only.
 * The adapters inject them; the injection itself is not in the Paperclip snapshot, so no value is described here.
 */
export const PAPERCLIP_ENV_NAMES = [
    'PAPERCLIP_AGENT_ID', 'PAPERCLIP_COMPANY_ID', 'PAPERCLIP_API_URL', 'PAPERCLIP_API_KEY', 'PAPERCLIP_RUN_ID',
    'PAPERCLIP_TASK_ID', 'PAPERCLIP_WAKE_REASON', 'PAPERCLIP_WAKE_COMMENT_ID', 'PAPERCLIP_APPROVAL_ID', 'PAPERCLIP_APPROVAL_STATUS',
    'PAPERCLIP_LINKED_ISSUE_IDS',
];
/** The one that is a secret: never in a prompt, a comment, a document or a log (skills/paperclip/SKILL.md:20). */
export const PAPERCLIP_ENV_SECRET_NAMES = ['PAPERCLIP_API_KEY'];
export const PAPERCLIP_MOTIVO_COMMENTO_MANCANTE = 'missing_issue_comment';
export const PAPERCLIP_COMMENTO_OBBLIGATORIO_STATI = [
    'satisfied',
    'retry_queued',
    'retry_exhausted',
];
export const PAPERCLIP_RECUPERO_INTENTI = ['status_only'];
export const PAPERCLIP_COMMENTO_MANCANTE_RITENTATIVI = 1;
/** A hint of the wake context is optional and tolerant: a malformed value is dropped, it never fails the turn. */
function hint(schema) {
    return schema.optional().catch(undefined);
}
/** An issue as the wake context summarizes it (services/issues.ts:9181-9208; services/heartbeat.ts:5688-5698). */
export const PaperclipTurnoIncaricoSintesiSchema = z.looseObject({
    id: z.guid(), identifier: z.string().nullable().optional(), title: z.string(), status: PaperclipStatoIncaricoSchema,
    assigneeAgentId: z.guid().nullable().optional(), summary: z.string().nullable().optional(),
});
// Campi della sveglia: Paperclip server/dist/routes/issues.js:10263-10280,10526-10552.
export const PaperclipTurnoContestoSchema = z.looseObject({
    taskId: z.guid().optional(),
    issueId: z.guid().optional(),
    wakeReason: z.string().optional(),
    wakeCommentId: z.guid().optional(),
    commentId: z.guid().optional(),
    recoveryIntent: z.enum(PAPERCLIP_RECUPERO_INTENTI).optional().catch(undefined),
    allowDeliverableWork: z.boolean().optional().catch(undefined),
    allowDocumentUpdates: z.boolean().optional().catch(undefined),
    resumeRequiresNormalModel: z.boolean().optional().catch(undefined),
    // Who and why (services/heartbeat.ts:7173-7183; routes/issues.ts:14829-14835 for `source`).
    source: hint(z.string()),
    wakeSource: hint(z.enum(PAPERCLIP_WAKE_SOURCES)),
    wakeTriggerDetail: hint(z.enum(PAPERCLIP_WAKE_TRIGGER_DETAILS)),
    // issue_blockers_resolved (routes/issues.ts:14522-14529).
    resolvedBlockerIssueId: hint(z.guid()),
    blockerIssueIds: hint(z.array(z.guid())),
    // issue_children_completed (routes/issues.ts:14829-14835; services/issues.ts:9209-9218): at most 20 summaries.
    completedChildIssueId: hint(z.guid()),
    childIssueIds: hint(z.array(z.guid())),
    childIssueSummaries: hint(z.array(PaperclipTurnoIncaricoSintesiSchema).max(20)),
    childIssueSummaryTruncated: hint(z.boolean()),
    onboardingCompletion: hint(z.boolean()),
    // A comment on a task whose blockers are still open runs in a bounded mode (services/heartbeat.ts:27997-28018).
    dependencyBlockedInteraction: hint(z.boolean()),
    unresolvedBlockerIssueIds: hint(z.array(z.guid())),
    unresolvedBlockerCount: hint(z.number().int().nonnegative()),
    unresolvedBlockerSummaries: hint(z.array(PaperclipTurnoIncaricoSintesiSchema)),
    // A resolved card wakes the assignee with `issue_commented` (routes/issues.ts:2714-2745;
    // kept only for `mutation: interaction`, services/heartbeat.ts:7194-7230).
    interactionId: hint(z.guid()),
    interactionKind: hint(z.string()),
    interactionStatus: hint(z.string()),
    // `taskId` and `issueId` are the watchdog's review task; the watched issue is inside `taskWatchdog` (services/task-watchdogs.ts:679-735).
    taskWatchdog: hint(z.looseObject({ watchedIssueId: z.guid(), stopFingerprint: z.string() })),
});
export function paperclipTurnoSoloDisposizione(ctx) {
    return ctx.recoveryIntent === 'status_only' || ctx.allowDeliverableWork === false;
}
// Corpo dell'adattatore http: server/dist/adapters/http/execute.js:9-60; docs/adapters/http.md:27-51.
// Il corpo compilato non ha companyId.
export const PaperclipTurnoRichiestaSchema = z.looseObject({
    runId: z.guid(),
    agentId: z.guid(),
    context: PaperclipTurnoContestoSchema,
});
export const PaperclipTurnoRispostaSchema = z.strictObject({
    ok: z.literal(true),
    runId: z.guid(),
});
export const PAPERCLIP_TURNO_ERRORI = [
    'feature_off',
    'segreto_non_valido',
    'richiesta_non_valida',
    'agente_sconosciuto',
    'turno_gia_aperto',
    'turno_fallito',
];
export const PaperclipTurnoErroreSchema = z.strictObject({
    ok: z.literal(false),
    error: z.enum(PAPERCLIP_TURNO_ERRORI),
});
export function incaricoDelTurno(ctx) {
    return ctx.taskId ?? ctx.issueId ?? null;
}
//# sourceMappingURL=turno.js.map