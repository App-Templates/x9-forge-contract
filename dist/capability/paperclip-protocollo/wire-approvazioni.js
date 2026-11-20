import { z } from 'zod';
// Paperclip packages/shared/src/constants.ts:689-704.
export const PAPERCLIP_APPROVAL_TYPES = [
    'hire_agent', 'approve_ceo_strategy', 'budget_override_required', 'request_board_approval',
];
export const PAPERCLIP_APPROVAL_STATUSES = [
    'pending', 'revision_requested', 'approved', 'rejected', 'cancelled',
];
export const PaperclipApprovalTypeSchema = z.enum(PAPERCLIP_APPROVAL_TYPES);
export const PaperclipApprovalStatusSchema = z.enum(PAPERCLIP_APPROVAL_STATUSES);
/** server/src/services/approvals.ts:16,45-59: only these two can be approved or rejected; `cancelled` has no HTTP route. */
export const PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES = ['pending', 'revision_requested'];
// Payload of a request to the board. Paperclip does not validate it (validators/approval.ts:8 is a free record);
// the four fields come from the example in skills/paperclip/SKILL.md:316-331 and the bridge asks for them.
export const PaperclipApprovalRichiestaBoardPayloadSchema = z.looseObject({
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().min(1).max(4000),
    recommendedAction: z.string().trim().min(1).max(2000),
    risks: z.array(z.string().trim().min(1).max(500)).max(20),
});
// Created by Paperclip, never by a client: services/budgets.ts:168-191 (buildApprovalPayload), :350-410.
export const PaperclipBudgetOverridePayloadSchema = z.looseObject({
    scopeType: z.enum(['company', 'agent', 'project']),
    scopeId: z.guid(),
    scopeName: z.string(),
    metric: z.literal('billed_cents'),
    windowKind: z.enum(['calendar_month_utc', 'lifetime']),
    thresholdType: z.enum(['soft', 'hard']),
    budgetAmount: z.number().int().min(0),
    observedAmount: z.number().min(0),
    warnPercent: z.number().int().min(1).max(99),
    windowStart: z.iso.datetime({ offset: true }),
    windowEnd: z.iso.datetime({ offset: true }),
    policyId: z.guid(),
    guidance: z.string(),
});
// POST /api/companies/:companyId/approvals (routes/approvals.ts:222-275; validators/approval.ts:5-10).
// A client creates `request_board_approval` (or `approve_ceo_strategy`, a convention the server does not enforce); a
// hire goes through `/agent-hires` and `budget_override_required` is born only from a hard budget stop.
// `requestedByAgentId` is required and must be the caller's own id: Paperclip wakes that agent on approval (:319-345).
export const PaperclipApprovalCreaCorpoSchema = z.discriminatedUnion('type', [
    z.strictObject({
        type: z.literal('request_board_approval'),
        requestedByAgentId: z.guid(),
        payload: PaperclipApprovalRichiestaBoardPayloadSchema,
        issueIds: z.array(z.guid()).min(1).max(50).optional(),
    }),
    z.strictObject({
        type: z.literal('approve_ceo_strategy'),
        requestedByAgentId: z.guid(),
        payload: z.record(z.string(), z.unknown()),
        issueIds: z.array(z.guid()).min(1).max(50).optional(),
    }),
]);
// The row Paperclip answers (201) and lists: columns written in services/approvals.ts:60-69 and services/budgets.ts:383-390.
export const PaperclipApprovalSchema = z.looseObject({
    id: z.guid(),
    companyId: z.guid(),
    type: PaperclipApprovalTypeSchema,
    status: PaperclipApprovalStatusSchema,
    requestedByAgentId: z.guid().nullable(),
    requestedByUserId: z.string().nullable(),
    payload: z.record(z.string(), z.unknown()),
    decisionNote: z.string().nullable().optional(),
    decidedAt: z.string().nullable().optional(),
});
// Wake of the requester on approval: routes/approvals.ts:319-345. Only an approval wakes the requester (a rejection and a
// revision request do not: routes/approvals.ts:402-462). The env names are in the adapter contract.
export const PAPERCLIP_APPROVAL_WAKE_REASON = 'approval_approved';
export const PaperclipApprovalSvegliaContestoSchema = z.looseObject({
    source: z.literal('approval.approved'),
    approvalId: z.guid(),
    approvalStatus: z.literal('approved'),
    issueId: z.guid().nullable(),
    issueIds: z.array(z.guid()),
    taskId: z.guid().nullable(),
    wakeReason: z.literal(PAPERCLIP_APPROVAL_WAKE_REASON),
});
//# sourceMappingURL=wire-approvazioni.js.map