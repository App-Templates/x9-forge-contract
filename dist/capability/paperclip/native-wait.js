import { z } from 'zod';
import { PaperclipCreateIssueInputSchema, PaperclipIssueViewSchema, PaperclipReviewInputSchema } from "./tools.js";
/**
 * Native waits of the P6 «C» variant (PROTOCOLLO-PAPERCLIP-P6.md): what a task waits for is declared to Paperclip, never
 * kept by X9 (P-04, P-05, P-15). Additive: the existing tool inputs and PAPERCLIP_TOOLS are unchanged; a consumer exposes
 * these schemas only behind its own experimental flag.
 *
 * Paperclip 2026.1005.0 semantics these schemas follow:
 * - entering `blocked` needs unresolved blockers, a pending interaction/approval or an `unblockDescriptor`, and an agent
 *   may name only itself as the unblock owner (`routes/issues.ts` PATCH, 422/403);
 * - a parent that truly waits on a child models it with blockers, `parentId` alone is not a dependency
 *   (`doc/execution-semantics.md` «Blockers»); `POST /issues/:id/children` with `blockParentUntilDone` adds the blocker;
 * - an async external job owned by the assignee is a one-shot monitor (`executionPolicy.monitor.nextCheckAt`, notes up to
 *   500 characters, serviceName up to 120), consumed by an `issue_monitor_due` wake.
 */
export const PAPERCLIP_NATIVE_WAIT_TOOLS = { checkLater: 'paperclip_check_later' };
const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const IssueIds = z.array(z.uuid()).min(1).max(20)
    .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique');
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
export const PaperclipWaitingForSchema = z.strictObject({ action: Text.max(2000) });
/** One-shot check of an async job the agent owns: Paperclip wakes it (issue_monitor_due) after afterSeconds. */
export const PaperclipCheckLaterSchema = z.strictObject({
    afterSeconds: z.number().int().min(30).max(3600),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
});
/**
 * `paperclip_review` with every durable disposition Paperclip accepts: `blocked` with what it waits for (tasks, or the
 * external action the agent owns), or the task kept `in_progress` with a scheduled check of an async job (P-15). The
 * check lives in review, not in a tool of its own, because a new write tool needs a policy decision of the agent
 * (agent-core asks a human for unknown writes) while review is already granted to every Paperclip agent.
 */
export const PaperclipNativeReviewInputSchema = PaperclipReviewInputSchema.extend({
    status: z.enum(['in_review', 'done', 'blocked', 'in_progress']),
    blockedByIssueIds: IssueIds.optional(),
    waitingFor: PaperclipWaitingForSchema.optional(),
    checkLater: PaperclipCheckLaterSchema.optional(),
}).superRefine((value, ctx) => {
    if ((value.blockedByIssueIds !== undefined || value.waitingFor !== undefined) && value.status !== 'blocked') {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'A wait reason requires status blocked' });
    }
    if ((value.checkLater !== undefined) !== (value.status === 'in_progress')) {
        ctx.addIssue({ code: 'custom', path: ['checkLater'], message: 'Status in_progress is kept only with checkLater, and checkLater only with in_progress' });
    }
    if (value.blockedByIssueIds?.includes(value.issueId) === true) {
        ctx.addIssue({ code: 'custom', path: ['blockedByIssueIds'], message: 'A task cannot wait for itself' });
    }
});
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
export const PaperclipNativeCreateIssueInputSchema = PaperclipCreateIssueInputSchema.extend({
    waitForChild: z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeRoleRef === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeRoleRef' });
    }
});
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
export const PaperclipCheckLaterInputSchema = z.strictObject({
    issueId: z.uuid(),
    afterSeconds: z.number().int().min(30).max(3600),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
});
export const PaperclipCheckLaterOutputSchema = z.strictObject({
    issue: PaperclipIssueViewSchema,
    nextCheckAt: z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=native-wait.js.map