import { z } from 'zod';
export declare const PAPERCLIP_TOOLS: {
    readonly queue: "paperclip_queue";
    readonly issue: "paperclip_issue";
    readonly take: "paperclip_take";
    readonly assign: "paperclip_assign";
};
export declare const PaperclipIssueStatusSchema: z.ZodEnum<{
    done: "done";
    backlog: "backlog";
    todo: "todo";
    in_progress: "in_progress";
    in_review: "in_review";
    blocked: "blocked";
    cancelled: "cancelled";
}>;
export declare const PaperclipQueueInputSchema: z.ZodObject<{
    statuses: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        done: "done";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
        blocked: "blocked";
        cancelled: "cancelled";
    }>>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const PaperclipIssueInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
}, z.core.$strict>;
export declare const PaperclipTakeInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    expectedStatuses: z.ZodArray<z.ZodEnum<{
        done: "done";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
        blocked: "blocked";
        cancelled: "cancelled";
    }>>;
}, z.core.$strict>;
export declare const PaperclipAssignInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    roleRef: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipIssueViewSchema: z.ZodObject<{
    id: z.ZodUUID;
    companyId: z.ZodUUID;
    identifier: z.ZodString;
    title: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    status: z.ZodEnum<{
        done: "done";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
        blocked: "blocked";
        cancelled: "cancelled";
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
            done: "done";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
            blocked: "blocked";
            cancelled: "cancelled";
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
            done: "done";
            backlog: "backlog";
            todo: "todo";
            in_progress: "in_progress";
            in_review: "in_review";
            blocked: "blocked";
            cancelled: "cancelled";
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
export type PaperclipIssueView = z.infer<typeof PaperclipIssueViewSchema>;
export type PaperclipAgentBinding = z.infer<typeof PaperclipAgentBindingSchema>;
//# sourceMappingURL=tools.d.ts.map