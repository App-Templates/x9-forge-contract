"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAPERCLIP_RECIPIENT_FIELD_BY_TOOL = exports.PAPERCLIP_ROLE_REF_FIELDS = exports.PAPERCLIP_RECIPIENT_REFUSALS = exports.PaperclipAgentDirectorySchema = exports.PaperclipAgentDirectoryEntrySchema = exports.PaperclipColleaguesSchema = exports.PaperclipColleagueSchema = exports.PaperclipCreateGoalAgentInputSchema = exports.PaperclipCreateIssueAgentInputSchema = exports.PaperclipAssignAgentRefInputSchema = exports.PaperclipAssignAgentInputSchema = exports.PaperclipAgentIdSchema = exports.PaperclipAgentBindingSchema = exports.PaperclipMutationOutputSchema = exports.PaperclipQueueOutputSchema = exports.PaperclipIssueViewSchema = exports.PaperclipReviewRefInputSchema = exports.PaperclipCommentsRefInputSchema = exports.PaperclipAssignRefInputSchema = exports.PaperclipTakeRefInputSchema = exports.PaperclipIssueRefInputSchema = exports.PaperclipReviewInputSchema = exports.PaperclipCommentsOutputSchema = exports.PaperclipCommentViewSchema = exports.PaperclipCommentsInputSchema = exports.PaperclipCreateApprovedBusinessUnitsInputSchema = exports.PaperclipCreateBusinessUnitOutputSchema = exports.PaperclipCreateBusinessUnitInputSchema = exports.PaperclipCreateIssueInputSchema = exports.PaperclipAssignInputSchema = exports.PaperclipTakeInputSchema = exports.PaperclipIssueInputSchema = exports.PaperclipActivityOutputSchema = exports.PaperclipActivityInputSchema = exports.PaperclipSearchOutputSchema = exports.PaperclipSearchInputSchema = exports.PaperclipSearchKindSchema = exports.PaperclipQueueInputSchema = exports.PaperclipIssueStatusSchema = exports.PaperclipCreateGoalOutputSchema = exports.PaperclipGoalViewSchema = exports.PaperclipCreateGoalInputSchema = exports.PaperclipCreateProjectOutputSchema = exports.PaperclipProjectViewSchema = exports.PaperclipCreateProjectInputSchema = exports.PaperclipGoalLevelSchema = exports.PAPERCLIP_TOOLS = exports.PaperclipIssueRefSchema = exports.PaperclipIssueIdentifierSchema = exports.PAPERCLIP_ISSUE_IDENTIFIER_PATTERN = void 0;
exports.paperclipIssueRefKind = paperclipIssueRefKind;
exports.paperclipColleagueById = paperclipColleagueById;
exports.paperclipRecipientForm = paperclipRecipientForm;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const business_unit_lead_js_1 = require("../../organization/business-unit-lead.cjs");
const decision_request_js_1 = require("../../organization/decision-request.cjs");
const agent_role_js_1 = require("../../organization/agent-role.cjs");
const wire_letture_js_1 = require("../paperclip-protocollo/wire-letture.cjs");
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
exports.PAPERCLIP_ISSUE_IDENTIFIER_PATTERN = /^[A-Z][A-Z0-9]{0,15}-[0-9]{1,9}$/;
exports.PaperclipIssueIdentifierSchema = zod_1.z.string().regex(exports.PAPERCLIP_ISSUE_IDENTIFIER_PATTERN);
exports.PaperclipIssueRefSchema = zod_1.z.union([zod_1.z.uuid(), exports.PaperclipIssueIdentifierSchema]);
function paperclipIssueRefKind(ref) {
    const value = exports.PaperclipIssueRefSchema.parse(ref);
    return exports.PaperclipIssueIdentifierSchema.safeParse(value).success ? 'identifier' : 'uuid';
}
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
    parentId: zod_1.z.uuid().optional(),
    /** @deprecated Free text. Use `PaperclipCreateGoalAgentInputSchema.ownerAgentId`: Paperclip owns by id (validators/goal.ts:11). */
    ownerRoleRef: Text.optional(),
});
exports.PaperclipGoalViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), title: Text, level: exports.PaperclipGoalLevelSchema,
    parentId: zod_1.z.uuid().nullable(), ownerAgentId: zod_1.z.uuid().nullable(),
});
exports.PaperclipCreateGoalOutputSchema = zod_1.z.strictObject({ goal: exports.PaperclipGoalViewSchema });
// Una sola fonte dei sette stati: wire-letture.ts (Paperclip packages/shared/src/constants.ts:189-197).
exports.PaperclipIssueStatusSchema = wire_letture_js_1.PaperclipStatoIncaricoSchema;
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
// `comment`: nota per chi terrà l'incarico: Paperclip la scrive come commento di chi chiama e sveglia l'assegnatario.
exports.PaperclipAssignInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(),
    /** @deprecated Free text. Use `PaperclipAssignAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
    roleRef: Text,
    comment: Text.max(4000).optional(),
});
exports.PaperclipCreateIssueInputSchema = zod_1.z.strictObject({
    title: Text, description: zod_1.z.string().max(16384).optional(),
    /** @deprecated Free text. Use `PaperclipCreateIssueAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
    assigneeRoleRef: Text.optional(),
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
// Tool boundaries accept references; persisted inputs retain native UUIDs.
exports.PaperclipIssueRefInputSchema = exports.PaperclipIssueInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
exports.PaperclipTakeRefInputSchema = exports.PaperclipTakeInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
exports.PaperclipAssignRefInputSchema = exports.PaperclipAssignInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
exports.PaperclipCommentsRefInputSchema = exports.PaperclipCommentsInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
exports.PaperclipReviewRefInputSchema = exports.PaperclipReviewInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
exports.PaperclipIssueViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), identifier: Text, title: Text,
    description: zod_1.z.string().nullable(), status: exports.PaperclipIssueStatusSchema, assigneeAgentId: zod_1.z.uuid().nullable(),
    projectId: zod_1.z.uuid().nullable().optional(), goalId: zod_1.z.uuid().nullable().optional(),
});
exports.PaperclipQueueOutputSchema = zod_1.z.strictObject({ issues: zod_1.z.array(exports.PaperclipIssueViewSchema).max(100) });
exports.PaperclipMutationOutputSchema = zod_1.z.strictObject({ issue: exports.PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
exports.PaperclipAgentBindingSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, unitId: Text, companyId: zod_1.z.uuid(), paperclipAgentId: zod_1.z.uuid(),
    enabled: zod_1.z.boolean(), roleAgents: zod_1.z.record(Text, zod_1.z.uuid()),
});
/**
 * The id of a Paperclip agent. Paperclip assigns, addresses and owns by id and by nothing else: `assigneeAgentId` is a
 * guid (Paperclip packages/shared/src/validators/issue.ts:713), the owner of a goal is `ownerAgentId`, a guid
 * (validators/goal.ts:11), the lead of a project is `leadAgentId` (validators/project.ts:110). A role, a unit or a
 * display name never reaches a Paperclip body: the model writes this id and nothing else.
 */
exports.PaperclipAgentIdSchema = zod_1.z.guid();
/** `paperclip_assign` with the recipient as an id (the `roleRef` form is deprecated). */
exports.PaperclipAssignAgentInputSchema = zod_1.z.strictObject({
    issueId: zod_1.z.uuid(), assigneeAgentId: exports.PaperclipAgentIdSchema, comment: Text.max(4000).optional(),
});
exports.PaperclipAssignAgentRefInputSchema = exports.PaperclipAssignAgentInputSchema.extend({ issueId: exports.PaperclipIssueRefSchema });
/** `paperclip_create_issue` with the assignee as an id (the `assigneeRoleRef` form is deprecated). */
exports.PaperclipCreateIssueAgentInputSchema = exports.PaperclipCreateIssueInputSchema.omit({ assigneeRoleRef: true })
    .extend({ assigneeAgentId: exports.PaperclipAgentIdSchema.optional() });
/** `paperclip_create_goal` with the owner as an id (the `ownerRoleRef` form is deprecated). */
exports.PaperclipCreateGoalAgentInputSchema = exports.PaperclipCreateGoalInputSchema.omit({ ownerRoleRef: true })
    .extend({ ownerAgentId: exports.PaperclipAgentIdSchema.optional() });
/**
 * Where the id comes from. The model does not look an id up in a table of names: the server builds this list from the
 * seat registry of the company (the same source as `PaperclipAgentBindingSchema.roleAgents`, which stays server-owned and
 * never reaches a tool parameter) and shows it next to the task. The model reads `label` and writes `agentId`. `role` is
 * the X9 role of that agent: the permission to assign is decided from the role OF THE ID (decideAssignment), never from a
 * name the model typed. Paperclip's own list of agents (`GET /api/companies/:companyId/agents`) is the other source.
 */
exports.PaperclipColleagueSchema = zod_1.z.strictObject({
    agentId: exports.PaperclipAgentIdSchema, role: agent_role_js_1.AgentRoleSchema, unitId: Text, label: Text.max(200),
});
exports.PaperclipColleaguesSchema = zod_1.z.array(exports.PaperclipColleagueSchema).max(200)
    .refine(values => new Set(values.map(value => value.agentId)).size === values.length, 'Colleague agent IDs must be unique');
/** Paperclip `GET /api/companies/:companyId/agents` row, read tolerantly (agents.ts:4028-4047; docs/api/agents.md:16). */
exports.PaperclipAgentDirectoryEntrySchema = zod_1.z.looseObject({
    id: exports.PaperclipAgentIdSchema, name: zod_1.z.string(), role: zod_1.z.string(),
    status: zod_1.z.enum(['active', 'paused', 'idle', 'running', 'error', 'pending_approval', 'terminated']),
    reportsTo: exports.PaperclipAgentIdSchema.nullable().optional(),
});
exports.PaperclipAgentDirectorySchema = zod_1.z.array(exports.PaperclipAgentDirectoryEntrySchema);
exports.PAPERCLIP_RECIPIENT_REFUSALS = ['agent_not_listed'];
/** Pure: the id the model wrote must be one the server listed; an invented guid is refused, never guessed. */
function paperclipColleagueById(colleagues, agentId) {
    const colleague = colleagues.find(value => value.agentId === agentId);
    return colleague === undefined ? { ok: false, refusal: 'agent_not_listed' } : { ok: true, colleague };
}
/** The deprecated free-text recipient fields. Their removal is a later adoption task, after the stack has moved to ids. */
exports.PAPERCLIP_ROLE_REF_FIELDS = ['roleRef', 'assigneeRoleRef', 'ownerRoleRef'];
/** For each tool that names a recipient: the deprecated field and the field that replaces it. */
exports.PAPERCLIP_RECIPIENT_FIELD_BY_TOOL = {
    [exports.PAPERCLIP_TOOLS.assign]: { deprecated: 'roleRef', current: 'assigneeAgentId' },
    [exports.PAPERCLIP_TOOLS.createIssue]: { deprecated: 'assigneeRoleRef', current: 'assigneeAgentId' },
    [exports.PAPERCLIP_TOOLS.createGoal]: { deprecated: 'ownerRoleRef', current: 'ownerAgentId' },
};
/** Which form of recipient a call input carries: the proof that the new form is the one used (counted by the stack's tests). */
function paperclipRecipientForm(tool, input) {
    const fields = exports.PAPERCLIP_RECIPIENT_FIELD_BY_TOOL[tool];
    const record = typeof input === 'object' && input !== null ? { ...input } : {};
    const hasId = record[fields.current] !== undefined;
    const hasRole = record[fields.deprecated] !== undefined;
    if (hasId && hasRole)
        return 'both';
    return hasId ? 'agent_id' : hasRole ? 'role_ref' : 'none';
}
//# sourceMappingURL=tools.js.map