import { z } from 'zod';
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
export declare const PAPERCLIP_NATIVE_WAIT_TOOLS: {
    readonly checkLater: "paperclip_check_later";
};
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
export declare const PaperclipWaitingForSchema: z.ZodObject<{
    action: z.ZodString;
}, z.core.$strict>;
/** `paperclip_review` with the reason of a `blocked`: the tasks waited for, or the external action the agent owns. */
export declare const PaperclipNativeReviewInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_review: "in_review";
    }>;
    comment: z.ZodOptional<z.ZodString>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitingFor: z.ZodOptional<z.ZodObject<{
        action: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** `paperclip_create_issue` that also declares the wait: the parent stays blocked until this child is done. */
export declare const PaperclipNativeCreateIssueInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeRoleRef: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitForChild: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strict>;
/** One-shot Paperclip monitor on a task the agent owns, for an async job it will check later (no recurring interval). */
export declare const PaperclipCheckLaterInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    afterSeconds: z.ZodNumber;
    notes: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipCheckLaterOutputSchema: z.ZodObject<{
    issue: z.ZodObject<{
        id: z.ZodUUID;
        companyId: z.ZodUUID;
        identifier: z.ZodString;
        title: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        status: z.ZodEnum<{
            cancelled: "cancelled";
            done: "done";
            blocked: "blocked";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
        }>;
        assigneeAgentId: z.ZodNullable<z.ZodUUID>;
        projectId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
    }, z.core.$strict>;
    nextCheckAt: z.ZodISODateTime;
}, z.core.$strict>;
export type PaperclipWaitingFor = z.infer<typeof PaperclipWaitingForSchema>;
export type PaperclipNativeReviewInput = z.infer<typeof PaperclipNativeReviewInputSchema>;
export type PaperclipNativeCreateIssueInput = z.infer<typeof PaperclipNativeCreateIssueInputSchema>;
export type PaperclipCheckLaterInput = z.infer<typeof PaperclipCheckLaterInputSchema>;
export type PaperclipCheckLaterOutput = z.infer<typeof PaperclipCheckLaterOutputSchema>;
//# sourceMappingURL=native-wait.d.ts.map