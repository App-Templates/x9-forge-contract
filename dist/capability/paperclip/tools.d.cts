import { z } from 'zod';
export declare const PAPERCLIP_TOOLS: {
    readonly queue: "paperclip_queue";
    readonly issue: "paperclip_issue";
    readonly take: "paperclip_take";
    readonly assign: "paperclip_assign";
    readonly createIssue: "paperclip_create_issue";
    readonly comments: "paperclip_comments";
    readonly review: "paperclip_review";
    readonly createBusinessUnit: "paperclip_create_business_unit";
    readonly search: "paperclip_search";
    readonly activity: "paperclip_activity";
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
export declare const PaperclipSearchKindSchema: z.ZodEnum<{
    artifact: "artifact";
    document: "document";
    agent: "agent";
    comment: "comment";
    project: "project";
    issue: "issue";
}>;
export declare const PaperclipSearchInputSchema: z.ZodObject<{
    query: z.ZodString;
    kinds: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        artifact: "artifact";
        document: "document";
        agent: "agent";
        comment: "comment";
        project: "project";
        issue: "issue";
    }>>>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const PaperclipSearchOutputSchema: z.ZodObject<{
    results: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            artifact: "artifact";
            document: "document";
            agent: "agent";
            comment: "comment";
            project: "project";
            issue: "issue";
        }>;
        id: z.ZodString;
        title: z.ZodString;
        snippet: z.ZodString;
        issueId: z.ZodOptional<z.ZodUUID>;
        updatedAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strict>;
export declare const PaperclipActivityInputSchema: z.ZodObject<{
    issueId: z.ZodOptional<z.ZodUUID>;
    since: z.ZodOptional<z.ZodISODateTime>;
    limit: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>;
export declare const PaperclipActivityOutputSchema: z.ZodObject<{
    events: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        actorAgentId: z.ZodNullable<z.ZodUUID>;
        issueId: z.ZodNullable<z.ZodUUID>;
        summary: z.ZodString;
        createdAt: z.ZodISODateTime;
    }, z.core.$strict>>;
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
export declare const PaperclipCreateBusinessUnitInputSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    company: z.ZodObject<{
        companyId: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    businessUnit: z.ZodObject<{
        slug: z.ZodString;
        name: z.ZodString;
        briefSection: z.ZodString;
        competencies: z.ZodArray<z.ZodString>;
        referents: z.ZodArray<z.ZodObject<{
            referentRef: z.ZodString;
            name: z.ZodString;
            role: z.ZodString;
            email: z.ZodEmail;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    profileTemplate: z.ZodLiteral<"capo-bu">;
    model: z.ZodObject<{
        tier: z.ZodEnum<{
            standard: "standard";
            advanced: "advanced";
            reasoning: "reasoning";
        }>;
        llmModel: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>;
    capabilities: z.ZodArray<z.ZodString>;
    paperclipParticipant: z.ZodObject<{
        participantId: z.ZodString;
        roles: z.ZodArray<z.ZodEnum<{
            lead: "lead";
            member: "member";
            reviewer: "reviewer";
            observer: "observer";
        }>>;
    }, z.core.$strict>;
    unitName: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipCreateBusinessUnitOutputSchema: z.ZodObject<{
    unitId: z.ZodString;
    paperclipAgentId: z.ZodUUID;
    agentIdentity: z.ZodObject<{
        managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
        vaultAgentId: z.ZodNumber;
    }, z.core.$strict>;
    replayed: z.ZodBoolean;
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
export type PaperclipSearchKind = z.infer<typeof PaperclipSearchKindSchema>;
export type PaperclipSearchInput = z.infer<typeof PaperclipSearchInputSchema>;
export type PaperclipSearchOutput = z.infer<typeof PaperclipSearchOutputSchema>;
export type PaperclipActivityInput = z.infer<typeof PaperclipActivityInputSchema>;
export type PaperclipActivityOutput = z.infer<typeof PaperclipActivityOutputSchema>;
export type PaperclipIssueInput = z.infer<typeof PaperclipIssueInputSchema>;
export type PaperclipTakeInput = z.infer<typeof PaperclipTakeInputSchema>;
export type PaperclipAssignInput = z.infer<typeof PaperclipAssignInputSchema>;
export type PaperclipCreateIssueInput = z.infer<typeof PaperclipCreateIssueInputSchema>;
export type PaperclipCreateBusinessUnitInput = z.infer<typeof PaperclipCreateBusinessUnitInputSchema>;
export type PaperclipCreateBusinessUnitOutput = z.infer<typeof PaperclipCreateBusinessUnitOutputSchema>;
export type PaperclipCommentsInput = z.infer<typeof PaperclipCommentsInputSchema>;
export type PaperclipCommentView = z.infer<typeof PaperclipCommentViewSchema>;
export type PaperclipCommentsOutput = z.infer<typeof PaperclipCommentsOutputSchema>;
export type PaperclipReviewInput = z.infer<typeof PaperclipReviewInputSchema>;
export type PaperclipIssueView = z.infer<typeof PaperclipIssueViewSchema>;
export type PaperclipAgentBinding = z.infer<typeof PaperclipAgentBindingSchema>;
//# sourceMappingURL=tools.d.ts.map