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
 * Paperclip sets no time bounds on the monitor; one week is our bound, equal to retryAfterSeconds.
 */
export declare const PAPERCLIP_NATIVE_WAIT_TOOLS: {
    readonly checkLater: "paperclip_check_later";
};
export declare const PAPERCLIP_CHECK_LATER_MAX_SECONDS = 604800;
/** The single question of an «ask another agent» interaction and the limits of its texts (Paperclip answers it with free text). */
export declare const PAPERCLIP_ASK_QUESTION_ID = "detail";
export declare const PAPERCLIP_ASK_QUESTION_MAX = 2000;
export declare const PAPERCLIP_ANSWER_MAX = 4000;
/** The wake reason Paperclip gives the addressee of a pending interaction (`routes/issues.ts`). */
export declare const PAPERCLIP_INTERACTION_PENDING_WAKE = "interaction_pending";
/** The concrete action that unblocks the task, owned by the calling agent itself (Paperclip: agents name only themselves). */
export declare const PaperclipWaitingForSchema: z.ZodObject<{
    action: z.ZodString;
}, z.core.$strict>;
/** One-shot check of an async job the agent owns: Paperclip wakes it (issue_monitor_due) after afterSeconds. */
export declare const PaperclipCheckLaterSchema: z.ZodObject<{
    afterSeconds: z.ZodNumber;
    notes: z.ZodString;
    serviceName: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
/** A decision asked of another agent (resolved from `roleRef` by the consumer): Paperclip interaction + task in_review. */
export declare const PaperclipAskSchema: z.ZodObject<{
    roleRef: z.ZodString;
    question: z.ZodString;
}, z.core.$strict>;
/**
 * `paperclip_review` with every durable disposition Paperclip accepts: `blocked` with what it waits for (tasks, or the
 * external action the agent owns), or the task kept `in_progress` with a scheduled check of an async job (P-15). The
 * check lives in review, not in a tool of its own, because a new write tool needs a policy decision of the agent
 * (agent-core asks a human for unknown writes) while review is already granted to every Paperclip agent.
 */
export declare const PaperclipNativeReviewInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    comment: z.ZodOptional<z.ZodString>;
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_progress: "in_progress";
        in_review: "in_review";
    }>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    waitingFor: z.ZodOptional<z.ZodObject<{
        action: z.ZodString;
    }, z.core.$strict>>;
    checkLater: z.ZodOptional<z.ZodObject<{
        afterSeconds: z.ZodNumber;
        notes: z.ZodString;
        serviceName: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    ask: z.ZodOptional<z.ZodObject<{
        roleRef: z.ZodString;
        question: z.ZodString;
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
/** `paperclip_assign` that can also answer a question another agent put to the assignee (the comment is the answer). */
export declare const PaperclipNativeAssignInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
export declare const PaperclipNativeAssignRefInputSchema: z.ZodObject<{
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
    answersInteractionId: z.ZodOptional<z.ZodUUID>;
}, z.core.$strict>;
/** Creation body of `POST /issues/:id/interactions` (kind ask_user_questions) with an addressee and no resolverPolicy. */
export declare const PaperclipAskInteractionBodySchema: z.ZodObject<{
    kind: z.ZodLiteral<"ask_user_questions">;
    idempotencyKey: z.ZodString;
    addresseeAgentId: z.ZodUUID;
    continuationPolicy: z.ZodLiteral<"wake_assignee">;
    payload: z.ZodObject<{
        version: z.ZodLiteral<1>;
        questionSet: z.ZodObject<{
            schema: z.ZodLiteral<"paperclip.question_set.v1">;
            questions: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"detail">;
                prompt: z.ZodString;
                answerMode: z.ZodLiteral<"text">;
                required: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>;
        questions: z.ZodTuple<[z.ZodObject<{
            id: z.ZodLiteral<"detail">;
            prompt: z.ZodString;
            selectionMode: z.ZodLiteral<"single">;
            required: z.ZodLiteral<true>;
            options: z.ZodTuple<[z.ZodObject<{
                id: z.ZodLiteral<"text">;
                label: z.ZodString;
                freeText: z.ZodLiteral<true>;
            }, z.core.$strict>], null>;
        }, z.core.$strict>], null>;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Body of `POST /issues/:id/interactions/:interactionId/respond` for that question: free text, no option. */
export declare const PaperclipAnswerInteractionBodySchema: z.ZodObject<{
    answers: z.ZodTuple<[z.ZodObject<{
        questionId: z.ZodLiteral<"detail">;
        optionIds: z.ZodTuple<[], null>;
        otherText: z.ZodString;
    }, z.core.$strict>], null>;
}, z.core.$strict>;
/** `ask:<issueId>:<callId>`, at most 255 characters (throws beyond). */
export declare function paperclipAskIdempotencyKey(issueId: string, callId: string): string;
export declare function paperclipAskInteractionBody(input: {
    question: string;
    addresseeAgentId: string;
    idempotencyKey: string;
}): PaperclipAskInteractionBody;
export declare function paperclipAnswerInteractionBody(text: string): PaperclipAnswerInteractionBody;
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
export type PaperclipAsk = z.infer<typeof PaperclipAskSchema>;
export type PaperclipNativeAssignInput = z.infer<typeof PaperclipNativeAssignInputSchema>;
export type PaperclipNativeAssignRefInput = z.infer<typeof PaperclipNativeAssignRefInputSchema>;
export type PaperclipAskInteractionBody = z.infer<typeof PaperclipAskInteractionBodySchema>;
export type PaperclipAnswerInteractionBody = z.infer<typeof PaperclipAnswerInteractionBodySchema>;
export type PaperclipWaitingFor = z.infer<typeof PaperclipWaitingForSchema>;
export type PaperclipCheckLater = z.infer<typeof PaperclipCheckLaterSchema>;
export type PaperclipNativeReviewInput = z.infer<typeof PaperclipNativeReviewInputSchema>;
export type PaperclipNativeCreateIssueInput = z.infer<typeof PaperclipNativeCreateIssueInputSchema>;
export type PaperclipCheckLaterInput = z.infer<typeof PaperclipCheckLaterInputSchema>;
export type PaperclipCheckLaterOutput = z.infer<typeof PaperclipCheckLaterOutputSchema>;
//# sourceMappingURL=native-wait.d.ts.map