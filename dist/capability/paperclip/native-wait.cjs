"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipCheckLaterOutputSchema = exports.PaperclipCheckLaterInputSchema = exports.PaperclipNativeCreateIssueInputSchema = exports.PaperclipNativeReviewInputSchema = exports.PaperclipWaitingForSchema = exports.PAPERCLIP_NATIVE_WAIT_TOOLS = void 0;
const zod_1 = require("zod");
const tools_js_1 = require("./tools.cjs");
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
exports.PAPERCLIP_NATIVE_WAIT_TOOLS = { checkLater: 'paperclip_check_later' };
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
const IssueIds = zod_1.z.array(zod_1.z.uuid()).min(1).max(20)
    .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique');
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
exports.PaperclipWaitingForSchema = zod_1.z.strictObject({ action: Text.max(2000) });
/** `paperclip_review` with the reason of a `blocked`: the tasks waited for, or the external action the agent owns. */
exports.PaperclipNativeReviewInputSchema = tools_js_1.PaperclipReviewInputSchema.extend({
    blockedByIssueIds: IssueIds.optional(),
    waitingFor: exports.PaperclipWaitingForSchema.optional(),
}).superRefine((value, ctx) => {
    if ((value.blockedByIssueIds !== undefined || value.waitingFor !== undefined) && value.status !== 'blocked') {
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'A wait reason requires status blocked' });
    }
    if (value.blockedByIssueIds?.includes(value.issueId) === true) {
        ctx.addIssue({ code: 'custom', path: ['blockedByIssueIds'], message: 'A task cannot wait for itself' });
    }
});
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
exports.PaperclipNativeCreateIssueInputSchema = tools_js_1.PaperclipCreateIssueInputSchema.extend({
    waitForChild: zod_1.z.boolean().optional(),
}).superRefine((value, ctx) => {
    if (value.waitForChild === true && (value.parentIssueId === undefined || value.assigneeRoleRef === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['waitForChild'], message: 'Waiting for a child requires parentIssueId and assigneeRoleRef' });
    }
});
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
exports.PaperclipCheckLaterInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(),
    afterSeconds: zod_1.z.number().int().min(30).max(3600),
    notes: Text.max(500),
    serviceName: Text.max(120).optional(),
});
exports.PaperclipCheckLaterOutputSchema = zod_1.z.strictObject({
    issue: tools_js_1.PaperclipIssueViewSchema,
    nextCheckAt: zod_1.z.iso.datetime({ offset: true }),
});
//# sourceMappingURL=native-wait.js.map