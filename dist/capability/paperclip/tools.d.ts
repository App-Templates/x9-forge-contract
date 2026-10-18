import { z } from 'zod';
export declare const PAPERCLIP_TOOLS: {
    readonly queue: "paperclip_queue";
    readonly issue: "paperclip_issue";
    readonly take: "paperclip_take";
    readonly assign: "paperclip_assign";
    readonly createIssue: "paperclip_create_issue";
    readonly comments: "paperclip_comments";
    readonly review: "paperclip_review";
};
export declare const PaperclipIssueStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    done: "done";
    blocked: "blocked";
    backlog: "backlog";
    todo: "todo";
    in_progress: "in_progress";
    in_review: "in_review";
}>;
export declare const PaperclipQueueInputSchema: z.ZodObject<{
    statuses: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const PaperclipIssueInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
}, z.core.$strict>;
export declare const PaperclipTakeInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    expectedStatuses: z.ZodArray<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>;
}, z.core.$strict>;
export declare const PaperclipAssignInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    roleRef: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipCreateIssueInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    assigneeRoleRef: z.ZodOptional<z.ZodString>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
}, z.core.$strict>;
export declare const PaperclipCommentsInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const PaperclipCommentViewSchema: z.ZodObject<{
    id: z.ZodUUID;
    issueId: z.ZodUUID;
    authorAgentId: z.ZodNullable<z.ZodUUID>;
    body: z.ZodString;
    createdAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const PaperclipCommentsOutputSchema: z.ZodObject<{
    comments: z.ZodArray<z.ZodObject<{
        id: z.ZodUUID;
        issueId: z.ZodUUID;
        authorAgentId: z.ZodNullable<z.ZodUUID>;
        body: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipReviewInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_review: "in_review";
    }>;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipIssueViewSchema: z.ZodObject<{
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
}, z.core.$strict>;
export declare const PaperclipQueueOutputSchema: z.ZodObject<{
    issues: z.ZodArray<z.ZodObject<{
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
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipMutationOutputSchema: z.ZodObject<{
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
    }, z.core.$strict>;
}, z.core.$strict>;
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
export declare const PaperclipAgentBindingSchema: z.ZodObject<{
    scope: z.ZodObject<{
        agentId: z.ZodString;
        ownerId: z.ZodString;
        tenantId: z.ZodString;
    }, z.core.$strict>;
    unitId: z.ZodString;
    companyId: z.ZodUUID;
    paperclipAgentId: z.ZodUUID;
    enabled: z.ZodBoolean;
    roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
}, z.core.$strict>;
export type PaperclipQueueInput = z.infer<typeof PaperclipQueueInputSchema>;
export type PaperclipIssueInput = z.infer<typeof PaperclipIssueInputSchema>;
export type PaperclipTakeInput = z.infer<typeof PaperclipTakeInputSchema>;
export type PaperclipAssignInput = z.infer<typeof PaperclipAssignInputSchema>;
export type PaperclipCreateIssueInput = z.infer<typeof PaperclipCreateIssueInputSchema>;
export type PaperclipCommentsInput = z.infer<typeof PaperclipCommentsInputSchema>;
export type PaperclipCommentView = z.infer<typeof PaperclipCommentViewSchema>;
export type PaperclipCommentsOutput = z.infer<typeof PaperclipCommentsOutputSchema>;
export type PaperclipReviewInput = z.infer<typeof PaperclipReviewInputSchema>;
export type PaperclipIssueView = z.infer<typeof PaperclipIssueViewSchema>;
export type PaperclipAgentBinding = z.infer<typeof PaperclipAgentBindingSchema>;
//# sourceMappingURL=tools.d.ts.map