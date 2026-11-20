import { z } from 'zod';
export declare const PAPERCLIP_APPROVAL_TYPES: readonly ["hire_agent", "approve_ceo_strategy", "budget_override_required", "request_board_approval"];
export declare const PAPERCLIP_APPROVAL_STATUSES: readonly ["pending", "revision_requested", "approved", "rejected", "cancelled"];
export declare const PaperclipApprovalTypeSchema: z.ZodEnum<{
    hire_agent: "hire_agent";
    approve_ceo_strategy: "approve_ceo_strategy";
    budget_override_required: "budget_override_required";
    request_board_approval: "request_board_approval";
}>;
export declare const PaperclipApprovalStatusSchema: z.ZodEnum<{
    cancelled: "cancelled";
    pending: "pending";
    approved: "approved";
    rejected: "rejected";
    revision_requested: "revision_requested";
}>;
export type PaperclipApprovalType = z.infer<typeof PaperclipApprovalTypeSchema>;
export type PaperclipApprovalStatus = z.infer<typeof PaperclipApprovalStatusSchema>;
/** server/src/services/approvals.ts:16,45-59: only these two can be approved or rejected; `cancelled` has no HTTP route. */
export declare const PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES: readonly ["pending", "revision_requested"];
export declare const PaperclipApprovalRichiestaBoardPayloadSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    recommendedAction: z.ZodString;
    risks: z.ZodArray<z.ZodString>;
}, z.core.$loose>;
export declare const PaperclipBudgetOverridePayloadSchema: z.ZodObject<{
    scopeType: z.ZodEnum<{
        agent: "agent";
        company: "company";
        project: "project";
    }>;
    scopeId: z.ZodGUID;
    scopeName: z.ZodString;
    metric: z.ZodLiteral<"billed_cents">;
    windowKind: z.ZodEnum<{
        calendar_month_utc: "calendar_month_utc";
        lifetime: "lifetime";
    }>;
    thresholdType: z.ZodEnum<{
        soft: "soft";
        hard: "hard";
    }>;
    budgetAmount: z.ZodNumber;
    observedAmount: z.ZodNumber;
    warnPercent: z.ZodNumber;
    windowStart: z.ZodISODateTime;
    windowEnd: z.ZodISODateTime;
    policyId: z.ZodGUID;
    guidance: z.ZodString;
}, z.core.$loose>;
export declare const PaperclipApprovalCreaCorpoSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    type: z.ZodLiteral<"request_board_approval">;
    requestedByAgentId: z.ZodGUID;
    payload: z.ZodObject<{
        title: z.ZodString;
        summary: z.ZodString;
        recommendedAction: z.ZodString;
        risks: z.ZodArray<z.ZodString>;
    }, z.core.$loose>;
    issueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
}, z.core.$strict>, z.ZodObject<{
    type: z.ZodLiteral<"approve_ceo_strategy">;
    requestedByAgentId: z.ZodGUID;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    issueIds: z.ZodOptional<z.ZodArray<z.ZodGUID>>;
}, z.core.$strict>], "type">;
export declare const PaperclipApprovalSchema: z.ZodObject<{
    id: z.ZodGUID;
    companyId: z.ZodGUID;
    type: z.ZodEnum<{
        hire_agent: "hire_agent";
        approve_ceo_strategy: "approve_ceo_strategy";
        budget_override_required: "budget_override_required";
        request_board_approval: "request_board_approval";
    }>;
    status: z.ZodEnum<{
        cancelled: "cancelled";
        pending: "pending";
        approved: "approved";
        rejected: "rejected";
        revision_requested: "revision_requested";
    }>;
    requestedByAgentId: z.ZodNullable<z.ZodGUID>;
    requestedByUserId: z.ZodNullable<z.ZodString>;
    payload: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    decisionNote: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    decidedAt: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.core.$loose>;
export declare const PAPERCLIP_APPROVAL_WAKE_REASON: "approval_approved";
export declare const PaperclipApprovalSvegliaContestoSchema: z.ZodObject<{
    source: z.ZodLiteral<"approval.approved">;
    approvalId: z.ZodGUID;
    approvalStatus: z.ZodLiteral<"approved">;
    issueId: z.ZodNullable<z.ZodGUID>;
    issueIds: z.ZodArray<z.ZodGUID>;
    taskId: z.ZodNullable<z.ZodGUID>;
    wakeReason: z.ZodLiteral<"approval_approved">;
}, z.core.$loose>;
export type PaperclipApprovalCreaCorpo = z.infer<typeof PaperclipApprovalCreaCorpoSchema>;
export type PaperclipApproval = z.infer<typeof PaperclipApprovalSchema>;
export type PaperclipApprovalSvegliaContesto = z.infer<typeof PaperclipApprovalSvegliaContestoSchema>;
//# sourceMappingURL=wire-approvazioni.d.ts.map