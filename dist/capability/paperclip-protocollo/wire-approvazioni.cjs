"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipApprovalSvegliaContestoSchema = exports.PAPERCLIP_APPROVAL_WAKE_REASON = exports.PaperclipApprovalSchema = exports.PaperclipApprovalCreaCorpoSchema = exports.PaperclipBudgetOverridePayloadSchema = exports.PaperclipApprovalRichiestaBoardPayloadSchema = exports.PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES = exports.PaperclipApprovalStatusSchema = exports.PaperclipApprovalTypeSchema = exports.PAPERCLIP_APPROVAL_STATUSES = exports.PAPERCLIP_APPROVAL_TYPES = void 0;
const zod_1 = require("zod");
// Paperclip packages/shared/src/constants.ts:689-704.
exports.PAPERCLIP_APPROVAL_TYPES = [
    'hire_agent', 'approve_ceo_strategy', 'budget_override_required', 'request_board_approval',
];
exports.PAPERCLIP_APPROVAL_STATUSES = [
    'pending', 'revision_requested', 'approved', 'rejected', 'cancelled',
];
exports.PaperclipApprovalTypeSchema = zod_1.z.enum(exports.PAPERCLIP_APPROVAL_TYPES);
exports.PaperclipApprovalStatusSchema = zod_1.z.enum(exports.PAPERCLIP_APPROVAL_STATUSES);
/** server/src/services/approvals.ts:16,45-59: only these two can be approved or rejected; `cancelled` has no HTTP route. */
exports.PAPERCLIP_APPROVAL_RESOLVABLE_STATUSES = ['pending', 'revision_requested'];
// Payload of a request to the board. Paperclip does not validate it (validators/approval.ts:8 is a free record);
// the four fields come from the example in skills/paperclip/SKILL.md:316-331 and the bridge asks for them.
exports.PaperclipApprovalRichiestaBoardPayloadSchema = zod_1.z.looseObject({
    title: zod_1.z.string().trim().min(1).max(200),
    summary: zod_1.z.string().trim().min(1).max(4000),
    recommendedAction: zod_1.z.string().trim().min(1).max(2000),
    risks: zod_1.z.array(zod_1.z.string().trim().min(1).max(500)).max(20),
});
// Created by Paperclip, never by a client: services/budgets.ts:168-191 (buildApprovalPayload), :350-410.
exports.PaperclipBudgetOverridePayloadSchema = zod_1.z.looseObject({
    scopeType: zod_1.z.enum(['company', 'agent', 'project']),
    scopeId: zod_1.z.guid(),
    scopeName: zod_1.z.string(),
    metric: zod_1.z.literal('billed_cents'),
    windowKind: zod_1.z.enum(['calendar_month_utc', 'lifetime']),
    thresholdType: zod_1.z.enum(['soft', 'hard']),
    budgetAmount: zod_1.z.number().int().min(0),
    observedAmount: zod_1.z.number().min(0),
    warnPercent: zod_1.z.number().int().min(1).max(99),
    windowStart: zod_1.z.iso.datetime({ offset: true }),
    windowEnd: zod_1.z.iso.datetime({ offset: true }),
    policyId: zod_1.z.guid(),
    guidance: zod_1.z.string(),
});
// POST /api/companies/:companyId/approvals (routes/approvals.ts:222-275; validators/approval.ts:5-10).
// A client creates `request_board_approval` (or `approve_ceo_strategy`, a convention the server does not enforce); a
// hire goes through `/agent-hires` and `budget_override_required` is born only from a hard budget stop.
// `requestedByAgentId` is required and must be the caller's own id: Paperclip wakes that agent on approval (:319-345).
exports.PaperclipApprovalCreaCorpoSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.strictObject({
        type: zod_1.z.literal('request_board_approval'),
        requestedByAgentId: zod_1.z.guid(),
        payload: exports.PaperclipApprovalRichiestaBoardPayloadSchema,
        issueIds: zod_1.z.array(zod_1.z.guid()).min(1).max(50).optional(),
    }),
    zod_1.z.strictObject({
        type: zod_1.z.literal('approve_ceo_strategy'),
        requestedByAgentId: zod_1.z.guid(),
        payload: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
        issueIds: zod_1.z.array(zod_1.z.guid()).min(1).max(50).optional(),
    }),
]);
// The row Paperclip answers (201) and lists: columns written in services/approvals.ts:60-69 and services/budgets.ts:383-390.
exports.PaperclipApprovalSchema = zod_1.z.looseObject({
    id: zod_1.z.guid(),
    companyId: zod_1.z.guid(),
    type: exports.PaperclipApprovalTypeSchema,
    status: exports.PaperclipApprovalStatusSchema,
    requestedByAgentId: zod_1.z.guid().nullable(),
    requestedByUserId: zod_1.z.string().nullable(),
    payload: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    decisionNote: zod_1.z.string().nullable().optional(),
    decidedAt: zod_1.z.string().nullable().optional(),
});
// Wake of the requester on approval: routes/approvals.ts:319-345. Only an approval wakes the requester (a rejection and a
// revision request do not: routes/approvals.ts:402-462). The env names are in the adapter contract.
exports.PAPERCLIP_APPROVAL_WAKE_REASON = 'approval_approved';
exports.PaperclipApprovalSvegliaContestoSchema = zod_1.z.looseObject({
    source: zod_1.z.literal('approval.approved'),
    approvalId: zod_1.z.guid(),
    approvalStatus: zod_1.z.literal('approved'),
    issueId: zod_1.z.guid().nullable(),
    issueIds: zod_1.z.array(zod_1.z.guid()),
    taskId: zod_1.z.guid().nullable(),
    wakeReason: zod_1.z.literal(exports.PAPERCLIP_APPROVAL_WAKE_REASON),
});
//# sourceMappingURL=wire-approvazioni.js.map