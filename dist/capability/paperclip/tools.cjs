"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipAgentBindingSchema = exports.PaperclipMutationOutputSchema = exports.PaperclipQueueOutputSchema = exports.PaperclipIssueViewSchema = exports.PaperclipReviewInputSchema = exports.PaperclipCommentsOutputSchema = exports.PaperclipCommentViewSchema = exports.PaperclipCommentsInputSchema = exports.PaperclipCreateApprovedBusinessUnitsInputSchema = exports.PaperclipCreateBusinessUnitOutputSchema = exports.PaperclipCreateBusinessUnitInputSchema = exports.PaperclipCreateIssueInputSchema = exports.PaperclipAssignInputSchema = exports.PaperclipTakeInputSchema = exports.PaperclipIssueInputSchema = exports.PaperclipActivityOutputSchema = exports.PaperclipActivityInputSchema = exports.PaperclipSearchOutputSchema = exports.PaperclipSearchInputSchema = exports.PaperclipSearchKindSchema = exports.PaperclipQueueInputSchema = exports.PaperclipIssueStatusSchema = exports.PaperclipCreateGoalOutputSchema = exports.PaperclipGoalViewSchema = exports.PaperclipCreateGoalInputSchema = exports.PaperclipCreateProjectOutputSchema = exports.PaperclipProjectViewSchema = exports.PaperclipCreateProjectInputSchema = exports.PaperclipGoalLevelSchema = exports.PAPERCLIP_TOOLS = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
exports.PAPERCLIP_TOOLS = {
    queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
    createIssue: 'paperclip_create_issue', comments: 'paperclip_comments', review: 'paperclip_review',
    createBusinessUnit: 'paperclip_create_business_unit', search: 'paperclip_search', activity: 'paperclip_activity',
    createApprovedBusinessUnits: 'paperclip_create_approved_business_units',
    createProject: 'paperclip_create_project', createGoal: 'paperclip_create_goal',
};
exports.PaperclipGoalLevelSchema = zod_1.z.enum(['company', 'team', 'agent', 'task']);
exports.PaperclipCreateProjectInputSchema = zod_1.z.strictObject({
    name: Text.max(200), description: zod_1.z.string().max(16384).optional(),
    goalIds: zod_1.z.array(zod_1.z.uuid()).max(20)
        .refine(values => new Set(values).size === values.length, 'Goal IDs must be unique').optional(),
});
exports.PaperclipProjectViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), name: Text, description: zod_1.z.string().nullable(),
    leadAgentId: zod_1.z.uuid().nullable(), goalIds: zod_1.z.array(zod_1.z.uuid()).max(50),
});
exports.PaperclipCreateProjectOutputSchema = zod_1.z.strictObject({ project: exports.PaperclipProjectViewSchema });
exports.PaperclipCreateGoalInputSchema = zod_1.z.strictObject({
    title: Text.max(200), description: zod_1.z.string().max(16384).optional(), level: exports.PaperclipGoalLevelSchema,
    parentId: zod_1.z.uuid().optional(), ownerRoleRef: Text.optional(),
});
exports.PaperclipGoalViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), title: Text, level: exports.PaperclipGoalLevelSchema,
    parentId: zod_1.z.uuid().nullable(), ownerAgentId: zod_1.z.uuid().nullable(),
});
exports.PaperclipCreateGoalOutputSchema = zod_1.z.strictObject({ goal: exports.PaperclipGoalViewSchema });
exports.PaperclipIssueStatusSchema = zod_1.z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']);
const Statuses = zod_1.z.array(exports.PaperclipIssueStatusSchema).min(1).max(7)
    .refine(values => new Set(values).size === values.length, 'Statuses must be unique');
exports.PaperclipQueueInputSchema = zod_1.z.strictObject({
    statuses: Statuses.optional(), limit: zod_1.z.number().int().min(1).max(100).optional(),
});
exports.PaperclipSearchKindSchema = zod_1.z.enum(['issue', 'comment', 'document', 'artifact', 'agent', 'project']);
exports.PaperclipSearchInputSchema = zod_1.z.strictObject({
    query: Text.max(256),
    kinds: zod_1.z.array(exports.PaperclipSearchKindSchema).min(1)
        .refine(values => new Set(values).size === values.length, 'Search kinds must be unique').optional(),
    limit: zod_1.z.number().int().min(1).max(50).optional(),
});
exports.PaperclipSearchOutputSchema = zod_1.z.strictObject({
    results: zod_1.z.array(zod_1.z.strictObject({
        kind: exports.PaperclipSearchKindSchema, id: Text, title: Text, snippet: zod_1.z.string().max(1024),
        issueId: zod_1.z.uuid().optional(), updatedAt: zod_1.z.iso.datetime({ offset: true }),
    })).max(50),
});
exports.PaperclipActivityInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid().optional(), since: zod_1.z.iso.datetime({ offset: true }).optional(),
    limit: zod_1.z.number().int().min(1).max(100).optional(),
});
exports.PaperclipActivityOutputSchema = zod_1.z.strictObject({
    events: zod_1.z.array(zod_1.z.strictObject({
        id: Text, type: Text, actorAgentId: zod_1.z.uuid().nullable(), issueId: zod_1.z.uuid().nullable(),
        summary: zod_1.z.string().max(1024), createdAt: zod_1.z.iso.datetime({ offset: true }),
    })).max(100),
});
exports.PaperclipIssueInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid() });
exports.PaperclipTakeInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid(), expectedStatuses: Statuses });
exports.PaperclipAssignInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid(), roleRef: Text });
exports.PaperclipCreateIssueInputSchema = zod_1.z.strictObject({
    title: Text, description: zod_1.z.string().max(16384).optional(), assigneeRoleRef: Text.optional(),
    projectId: zod_1.z.uuid().optional(), goalId: zod_1.z.uuid().optional(),
    parentIssueId: zod_1.z.uuid().optional(),
    blockedByIssueIds: zod_1.z.array(zod_1.z.uuid()).max(20)
        .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique').optional(),
});
exports.PaperclipCreateBusinessUnitInputSchema = business_unit_lead_js_1.BusinessUnitLeadBirthRequestSchema.extend({ unitName: Text });
exports.PaperclipCreateBusinessUnitOutputSchema = zod_1.z.strictObject({
    unitId: Text, paperclipAgentId: zod_1.z.uuid(),
    agentIdentity: business_unit_lead_js_1.BusinessUnitLeadBirthResultSchema.shape.agentIdentity, replayed: zod_1.z.boolean(),
});
exports.PaperclipCreateApprovedBusinessUnitsInputSchema = zod_1.z.strictObject({
    decisionRequestId: decision_request_js_1.DecisionRequestIdSchema,
});
exports.PaperclipCommentsInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(), limit: zod_1.z.number().int().min(1).max(50).optional(),
});
exports.PaperclipCommentViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), issueId: zod_1.z.uuid(), authorAgentId: zod_1.z.uuid().nullable(),
    body: zod_1.z.string().max(16384), createdAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.PaperclipCommentsOutputSchema = zod_1.z.strictObject({ comments: zod_1.z.array(exports.PaperclipCommentViewSchema).max(50) });
exports.PaperclipReviewInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(), status: zod_1.z.enum(['in_review', 'done', 'blocked']), comment: Text.optional(),
});
exports.PaperclipIssueViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), identifier: Text, title: Text,
    description: zod_1.z.string().nullable(), status: exports.PaperclipIssueStatusSchema, assigneeAgentId: zod_1.z.uuid().nullable(),
    projectId: zod_1.z.uuid().nullable().optional(), goalId: zod_1.z.uuid().nullable().optional(),
    parentId: zod_1.z.uuid().nullable().optional(),
});
exports.PaperclipQueueOutputSchema = zod_1.z.strictObject({ issues: zod_1.z.array(exports.PaperclipIssueViewSchema).max(100) });
exports.PaperclipMutationOutputSchema = zod_1.z.strictObject({ issue: exports.PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
exports.PaperclipAgentBindingSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, unitId: Text, companyId: zod_1.z.uuid(), paperclipAgentId: zod_1.z.uuid(),
    enabled: zod_1.z.boolean(), roleAgents: zod_1.z.record(Text, zod_1.z.uuid()),
});
//# sourceMappingURL=tools.js.map