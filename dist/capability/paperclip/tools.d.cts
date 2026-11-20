import { z } from 'zod';
export declare const PAPERCLIP_ISSUE_IDENTIFIER_PATTERN: RegExp;
export declare const PaperclipIssueIdentifierSchema: z.ZodString;
export declare const PaperclipIssueRefSchema: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
export type PaperclipIssueRef = z.infer<typeof PaperclipIssueRefSchema>;
export declare function paperclipIssueRefKind(ref: string): 'uuid' | 'identifier';
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
    readonly createApprovedBusinessUnits: "paperclip_create_approved_business_units";
    readonly createProject: "paperclip_create_project";
    readonly createGoal: "paperclip_create_goal";
};
export declare const PaperclipGoalLevelSchema: z.ZodEnum<{
    agent: "agent";
    company: "company";
    team: "team";
    task: "task";
}>;
export declare const PaperclipCreateProjectInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    goalIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
}, z.core.$strict>;
export declare const PaperclipProjectViewSchema: z.ZodObject<{
    id: z.ZodUUID;
    companyId: z.ZodUUID;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodString>;
    leadAgentId: z.ZodNullable<z.ZodUUID>;
    goalIds: z.ZodArray<z.ZodUUID>;
}, z.core.$strict>;
export declare const PaperclipCreateProjectOutputSchema: z.ZodObject<{
    project: z.ZodObject<{
        id: z.ZodUUID;
        companyId: z.ZodUUID;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        leadAgentId: z.ZodNullable<z.ZodUUID>;
        goalIds: z.ZodArray<z.ZodUUID>;
    }, z.core.$strict>;
}, z.core.$strict>;
export declare const PaperclipCreateGoalInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    level: z.ZodEnum<{
        agent: "agent";
        company: "company";
        team: "team";
        task: "task";
    }>;
    parentId: z.ZodOptional<z.ZodUUID>;
    /** @deprecated Free text. Use `PaperclipCreateGoalAgentInputSchema.ownerAgentId`: Paperclip owns by id (validators/goal.ts:11). */
    ownerRoleRef: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipGoalViewSchema: z.ZodObject<{
    id: z.ZodUUID;
    companyId: z.ZodUUID;
    title: z.ZodString;
    level: z.ZodEnum<{
        agent: "agent";
        company: "company";
        team: "team";
        task: "task";
    }>;
    parentId: z.ZodNullable<z.ZodUUID>;
    ownerAgentId: z.ZodNullable<z.ZodUUID>;
}, z.core.$strict>;
export declare const PaperclipCreateGoalOutputSchema: z.ZodObject<{
    goal: z.ZodObject<{
        id: z.ZodUUID;
        companyId: z.ZodUUID;
        title: z.ZodString;
        level: z.ZodEnum<{
            agent: "agent";
            company: "company";
            team: "team";
            task: "task";
        }>;
        parentId: z.ZodNullable<z.ZodUUID>;
        ownerAgentId: z.ZodNullable<z.ZodUUID>;
    }, z.core.$strict>;
}, z.core.$strict>;
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
    project: "project";
    comment: "comment";
    issue: "issue";
}>;
export declare const PaperclipSearchInputSchema: z.ZodObject<{
    query: z.ZodString;
    kinds: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        artifact: "artifact";
        document: "document";
        agent: "agent";
        project: "project";
        comment: "comment";
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
            project: "project";
            comment: "comment";
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
    /** @deprecated Free text. Use `PaperclipAssignAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipCreateIssueInputSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    /** @deprecated Free text. Use `PaperclipCreateIssueAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
    assigneeRoleRef: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
}, z.core.$strict>;
export declare const PaperclipCreateBusinessUnitInputSchema: z.ZodObject<{
    requestId: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.core.$ZodBranded<z.ZodString, "OwnerId", "out">;
    organizationId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    company: z.ZodObject<{
        companyId: z.ZodString;
        name: z.ZodString;
    }, z.core.$strict>;
    businessUnit: z.ZodObject<{
        slug: z.ZodString;
        typeId: z.ZodString;
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
export declare const PaperclipCreateApprovedBusinessUnitsInputSchema: z.ZodObject<{
    decisionRequestId: z.ZodString;
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
export declare const PaperclipIssueRefInputSchema: z.ZodObject<{
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
export declare const PaperclipTakeRefInputSchema: z.ZodObject<{
    expectedStatuses: z.ZodArray<z.ZodEnum<{
        cancelled: "cancelled";
        done: "done";
        blocked: "blocked";
        backlog: "backlog";
        todo: "todo";
        in_progress: "in_progress";
        in_review: "in_review";
    }>>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
export declare const PaperclipAssignRefInputSchema: z.ZodObject<{
    roleRef: z.ZodString;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
export declare const PaperclipCommentsRefInputSchema: z.ZodObject<{
    limit: z.ZodOptional<z.ZodNumber>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
export declare const PaperclipReviewRefInputSchema: z.ZodObject<{
    status: z.ZodEnum<{
        done: "done";
        blocked: "blocked";
        in_review: "in_review";
    }>;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
export type PaperclipIssueRefInput = z.infer<typeof PaperclipIssueRefInputSchema>;
export type PaperclipTakeRefInput = z.infer<typeof PaperclipTakeRefInputSchema>;
export type PaperclipAssignRefInput = z.infer<typeof PaperclipAssignRefInputSchema>;
export type PaperclipCommentsRefInput = z.infer<typeof PaperclipCommentsRefInputSchema>;
export type PaperclipReviewRefInput = z.infer<typeof PaperclipReviewRefInputSchema>;
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
    projectId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
    goalId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
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
        projectId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
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
        projectId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
        goalId: z.ZodOptional<z.ZodNullable<z.ZodUUID>>;
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
/**
 * The id of a Paperclip agent. Paperclip assigns, addresses and owns by id and by nothing else: `assigneeAgentId` is a
 * guid (Paperclip packages/shared/src/validators/issue.ts:713), the owner of a goal is `ownerAgentId`, a guid
 * (validators/goal.ts:11), the lead of a project is `leadAgentId` (validators/project.ts:110). A role, a unit or a
 * display name never reaches a Paperclip body: the model writes this id and nothing else.
 */
export declare const PaperclipAgentIdSchema: z.ZodGUID;
export type PaperclipAgentId = z.infer<typeof PaperclipAgentIdSchema>;
/** `paperclip_assign` with the recipient as an id (the `roleRef` form is deprecated). */
export declare const PaperclipAssignAgentInputSchema: z.ZodObject<{
    issueId: z.ZodUUID;
    assigneeAgentId: z.ZodGUID;
    comment: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const PaperclipAssignAgentRefInputSchema: z.ZodObject<{
    assigneeAgentId: z.ZodGUID;
    comment: z.ZodOptional<z.ZodString>;
    issueId: z.ZodUnion<readonly [z.ZodUUID, z.ZodString]>;
}, z.core.$strict>;
/** `paperclip_create_issue` with the assignee as an id (the `assigneeRoleRef` form is deprecated). */
export declare const PaperclipCreateIssueAgentInputSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    projectId: z.ZodOptional<z.ZodUUID>;
    goalId: z.ZodOptional<z.ZodUUID>;
    parentIssueId: z.ZodOptional<z.ZodUUID>;
    blockedByIssueIds: z.ZodOptional<z.ZodArray<z.ZodUUID>>;
    assigneeAgentId: z.ZodOptional<z.ZodGUID>;
}, z.core.$strict>;
/** `paperclip_create_goal` with the owner as an id (the `ownerRoleRef` form is deprecated). */
export declare const PaperclipCreateGoalAgentInputSchema: z.ZodObject<{
    description: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    level: z.ZodEnum<{
        agent: "agent";
        company: "company";
        team: "team";
        task: "task";
    }>;
    parentId: z.ZodOptional<z.ZodUUID>;
    ownerAgentId: z.ZodOptional<z.ZodGUID>;
}, z.core.$strict>;
/**
 * Where the id comes from. The model does not look an id up in a table of names: the server builds this list from the
 * seat registry of the company (the same source as `PaperclipAgentBindingSchema.roleAgents`, which stays server-owned and
 * never reaches a tool parameter) and shows it next to the task. The model reads `label` and writes `agentId`. `role` is
 * the X9 role of that agent: the permission to assign is decided from the role OF THE ID (decideAssignment), never from a
 * name the model typed. Paperclip's own list of agents (`GET /api/companies/:companyId/agents`) is the other source.
 */
export declare const PaperclipColleagueSchema: z.ZodObject<{
    agentId: z.ZodGUID;
    role: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        director: "director";
        "capo-bu": "capo-bu";
    }>;
    unitId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>;
export declare const PaperclipColleaguesSchema: z.ZodArray<z.ZodObject<{
    agentId: z.ZodGUID;
    role: z.ZodEnum<{
        ricerca: "ricerca";
        lab: "lab";
        director: "director";
        "capo-bu": "capo-bu";
    }>;
    unitId: z.ZodString;
    label: z.ZodString;
}, z.core.$strict>>;
export type PaperclipColleague = z.infer<typeof PaperclipColleagueSchema>;
export type PaperclipColleagues = z.infer<typeof PaperclipColleaguesSchema>;
/** Paperclip `GET /api/companies/:companyId/agents` row, read tolerantly (agents.ts:4028-4047; docs/api/agents.md:16). */
export declare const PaperclipAgentDirectoryEntrySchema: z.ZodObject<{
    id: z.ZodGUID;
    name: z.ZodString;
    role: z.ZodString;
    status: z.ZodEnum<{
        error: "error";
        active: "active";
        paused: "paused";
        running: "running";
        idle: "idle";
        pending_approval: "pending_approval";
        terminated: "terminated";
    }>;
    reportsTo: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$loose>;
export declare const PaperclipAgentDirectorySchema: z.ZodArray<z.ZodObject<{
    id: z.ZodGUID;
    name: z.ZodString;
    role: z.ZodString;
    status: z.ZodEnum<{
        error: "error";
        active: "active";
        paused: "paused";
        running: "running";
        idle: "idle";
        pending_approval: "pending_approval";
        terminated: "terminated";
    }>;
    reportsTo: z.ZodOptional<z.ZodNullable<z.ZodGUID>>;
}, z.core.$loose>>;
export type PaperclipAgentDirectoryEntry = z.infer<typeof PaperclipAgentDirectoryEntrySchema>;
export declare const PAPERCLIP_RECIPIENT_REFUSALS: readonly ["agent_not_listed"];
export type PaperclipRecipientRefusal = (typeof PAPERCLIP_RECIPIENT_REFUSALS)[number];
export type PaperclipRecipientDecision = {
    ok: true;
    colleague: PaperclipColleague;
} | {
    ok: false;
    refusal: PaperclipRecipientRefusal;
};
/** Pure: the id the model wrote must be one the server listed; an invented guid is refused, never guessed. */
export declare function paperclipColleagueById(colleagues: readonly PaperclipColleague[], agentId: string): PaperclipRecipientDecision;
/** The deprecated free-text recipient fields. Their removal is a later adoption task, after the stack has moved to ids. */
export declare const PAPERCLIP_ROLE_REF_FIELDS: readonly ["roleRef", "assigneeRoleRef", "ownerRoleRef"];
/** For each tool that names a recipient: the deprecated field and the field that replaces it. */
export declare const PAPERCLIP_RECIPIENT_FIELD_BY_TOOL: {
    readonly paperclip_assign: {
        readonly deprecated: "roleRef";
        readonly current: "assigneeAgentId";
    };
    readonly paperclip_create_issue: {
        readonly deprecated: "assigneeRoleRef";
        readonly current: "assigneeAgentId";
    };
    readonly paperclip_create_goal: {
        readonly deprecated: "ownerRoleRef";
        readonly current: "ownerAgentId";
    };
};
export type PaperclipRecipientForm = 'agent_id' | 'role_ref' | 'both' | 'none';
/** Which form of recipient a call input carries: the proof that the new form is the one used (counted by the stack's tests). */
export declare function paperclipRecipientForm(tool: keyof typeof PAPERCLIP_RECIPIENT_FIELD_BY_TOOL, input: unknown): PaperclipRecipientForm;
export type PaperclipQueueInput = z.infer<typeof PaperclipQueueInputSchema>;
export type PaperclipGoalLevel = z.infer<typeof PaperclipGoalLevelSchema>;
export type PaperclipCreateProjectInput = z.infer<typeof PaperclipCreateProjectInputSchema>;
export type PaperclipProjectView = z.infer<typeof PaperclipProjectViewSchema>;
export type PaperclipCreateProjectOutput = z.infer<typeof PaperclipCreateProjectOutputSchema>;
export type PaperclipCreateGoalInput = z.infer<typeof PaperclipCreateGoalInputSchema>;
export type PaperclipGoalView = z.infer<typeof PaperclipGoalViewSchema>;
export type PaperclipCreateGoalOutput = z.infer<typeof PaperclipCreateGoalOutputSchema>;
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
export type PaperclipCreateApprovedBusinessUnitsInput = z.infer<typeof PaperclipCreateApprovedBusinessUnitsInputSchema>;
export type PaperclipCommentsInput = z.infer<typeof PaperclipCommentsInputSchema>;
export type PaperclipCommentView = z.infer<typeof PaperclipCommentViewSchema>;
export type PaperclipCommentsOutput = z.infer<typeof PaperclipCommentsOutputSchema>;
export type PaperclipReviewInput = z.infer<typeof PaperclipReviewInputSchema>;
export type PaperclipIssueView = z.infer<typeof PaperclipIssueViewSchema>;
export type PaperclipAgentBinding = z.infer<typeof PaperclipAgentBindingSchema>;
//# sourceMappingURL=tools.d.ts.map