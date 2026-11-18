import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { BusinessUnitLeadBirthRequestSchema, BusinessUnitLeadBirthResultSchema } from '../../organization/business-unit-lead.js';
import { DecisionRequestIdSchema } from '../../organization/decision-request.js';
import { AgentRoleSchema } from '../../organization/agent-role.js';
import { PaperclipStatoIncaricoSchema } from '../paperclip-protocollo/wire-letture.js';

const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
export const PAPERCLIP_ISSUE_IDENTIFIER_PATTERN = /^[A-Z][A-Z0-9]{0,15}-[0-9]{1,9}$/;
export const PaperclipIssueIdentifierSchema = z.string().regex(PAPERCLIP_ISSUE_IDENTIFIER_PATTERN);
export const PaperclipIssueRefSchema = z.union([z.uuid(), PaperclipIssueIdentifierSchema]);
export type PaperclipIssueRef = z.infer<typeof PaperclipIssueRefSchema>;

export function paperclipIssueRefKind(ref: string): 'uuid' | 'identifier' {
  const value = PaperclipIssueRefSchema.parse(ref);
  return PaperclipIssueIdentifierSchema.safeParse(value).success ? 'identifier' : 'uuid';
}

export const PAPERCLIP_TOOLS = {
  queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
  createIssue: 'paperclip_create_issue', comments: 'paperclip_comments', review: 'paperclip_review',
  createBusinessUnit: 'paperclip_create_business_unit', search: 'paperclip_search', activity: 'paperclip_activity',
  createApprovedBusinessUnits: 'paperclip_create_approved_business_units',
  createProject: 'paperclip_create_project', createGoal: 'paperclip_create_goal',
} as const;
export const PaperclipGoalLevelSchema = z.enum(['company', 'team', 'agent', 'task']);
export const PaperclipCreateProjectInputSchema = z.strictObject({
  name: Text.max(200), description: z.string().max(16384).optional(),
  goalIds: z.array(z.uuid()).max(20)
    .refine(values => new Set(values).size === values.length, 'Goal IDs must be unique').optional(),
});
export const PaperclipProjectViewSchema = z.strictObject({
  id: z.uuid(), companyId: z.uuid(), name: Text, description: z.string().nullable(),
  leadAgentId: z.uuid().nullable(), goalIds: z.array(z.uuid()).max(50),
});
export const PaperclipCreateProjectOutputSchema = z.strictObject({ project: PaperclipProjectViewSchema });
export const PaperclipCreateGoalInputSchema = z.strictObject({
  title: Text.max(200), description: z.string().max(16384).optional(), level: PaperclipGoalLevelSchema,
  parentId: z.uuid().optional(),
  /** @deprecated Free text. Use `PaperclipCreateGoalAgentInputSchema.ownerAgentId`: Paperclip owns by id (validators/goal.ts:11). */
  ownerRoleRef: Text.optional(),
});
export const PaperclipGoalViewSchema = z.strictObject({
  id: z.uuid(), companyId: z.uuid(), title: Text, level: PaperclipGoalLevelSchema,
  parentId: z.uuid().nullable(), ownerAgentId: z.uuid().nullable(),
});
export const PaperclipCreateGoalOutputSchema = z.strictObject({ goal: PaperclipGoalViewSchema });
// Una sola fonte dei sette stati: wire-letture.ts (Paperclip packages/shared/src/constants.ts:189-197).
export const PaperclipIssueStatusSchema = PaperclipStatoIncaricoSchema;
const Statuses = z.array(PaperclipIssueStatusSchema).min(1).max(7)
  .refine(values => new Set(values).size === values.length, 'Statuses must be unique');
export const PaperclipQueueInputSchema = z.strictObject({
  statuses: Statuses.optional(), limit: z.number().int().min(1).max(100).optional(),
});
export const PaperclipSearchKindSchema = z.enum(['issue', 'comment', 'document', 'artifact', 'agent', 'project']);
export const PaperclipSearchInputSchema = z.strictObject({
  query: Text.max(256),
  kinds: z.array(PaperclipSearchKindSchema).min(1)
    .refine(values => new Set(values).size === values.length, 'Search kinds must be unique').optional(),
  limit: z.number().int().min(1).max(50).optional(),
});
export const PaperclipSearchOutputSchema = z.strictObject({
  results: z.array(z.strictObject({
    kind: PaperclipSearchKindSchema, id: Text, title: Text, snippet: z.string().max(1024),
    issueId: z.uuid().optional(), updatedAt: z.iso.datetime({ offset: true }),
  })).max(50),
});
export const PaperclipActivityInputSchema = z.strictObject({
  issueId: z.uuid().optional(), since: z.iso.datetime({ offset: true }).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export const PaperclipActivityOutputSchema = z.strictObject({
  events: z.array(z.strictObject({
    id: Text, type: Text, actorAgentId: z.uuid().nullable(), issueId: z.uuid().nullable(),
    summary: z.string().max(1024), createdAt: z.iso.datetime({ offset: true }),
  })).max(100),
});
export const PaperclipIssueInputSchema = z.strictObject({ issueId: z.uuid() });
export const PaperclipTakeInputSchema = z.strictObject({ issueId: z.uuid(), expectedStatuses: Statuses });
// `comment`: nota per chi terrà l'incarico: Paperclip la scrive come commento di chi chiama e sveglia l'assegnatario.
export const PaperclipAssignInputSchema = z.strictObject({
  issueId: z.uuid(),
  /** @deprecated Free text. Use `PaperclipAssignAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
  roleRef: Text,
  comment: Text.max(4000).optional(),
});
export const PaperclipCreateIssueInputSchema = z.strictObject({
  title: Text, description: z.string().max(16384).optional(),
  /** @deprecated Free text. Use `PaperclipCreateIssueAgentInputSchema.assigneeAgentId`: Paperclip assigns by id (validators/issue.ts:713). */
  assigneeRoleRef: Text.optional(),
  projectId: z.uuid().optional(), goalId: z.uuid().optional(),
  parentIssueId: z.uuid().optional(),
  blockedByIssueIds: z.array(z.uuid()).max(20)
    .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique').optional(),
});
export const PaperclipCreateBusinessUnitInputSchema = BusinessUnitLeadBirthRequestSchema.extend({ unitName: Text });
export const PaperclipCreateBusinessUnitOutputSchema = z.strictObject({
  unitId: Text, paperclipAgentId: z.uuid(),
  agentIdentity: BusinessUnitLeadBirthResultSchema.shape.agentIdentity, replayed: z.boolean(),
});
export const PaperclipCreateApprovedBusinessUnitsInputSchema = z.strictObject({
  decisionRequestId: DecisionRequestIdSchema,
});
export const PaperclipCommentsInputSchema = z.strictObject({
  issueId: z.uuid(), limit: z.number().int().min(1).max(50).optional(),
});
export const PaperclipCommentViewSchema = z.strictObject({
  id: z.uuid(), issueId: z.uuid(), authorAgentId: z.uuid().nullable(),
  body: z.string().max(16384), createdAt: z.iso.datetime({ offset: true }),
});
export const PaperclipCommentsOutputSchema = z.strictObject({ comments: z.array(PaperclipCommentViewSchema).max(50) });
export const PaperclipReviewInputSchema = z.strictObject({
  issueId: z.uuid(), status: z.enum(['in_review', 'done', 'blocked']), comment: Text.optional(),
});
// Tool boundaries accept references; persisted inputs retain native UUIDs.
export const PaperclipIssueRefInputSchema = PaperclipIssueInputSchema.extend({ issueId: PaperclipIssueRefSchema });
export const PaperclipTakeRefInputSchema = PaperclipTakeInputSchema.extend({ issueId: PaperclipIssueRefSchema });
export const PaperclipAssignRefInputSchema = PaperclipAssignInputSchema.extend({ issueId: PaperclipIssueRefSchema });
export const PaperclipCommentsRefInputSchema = PaperclipCommentsInputSchema.extend({ issueId: PaperclipIssueRefSchema });
export const PaperclipReviewRefInputSchema = PaperclipReviewInputSchema.extend({ issueId: PaperclipIssueRefSchema });
export type PaperclipIssueRefInput = z.infer<typeof PaperclipIssueRefInputSchema>;
export type PaperclipTakeRefInput = z.infer<typeof PaperclipTakeRefInputSchema>;
export type PaperclipAssignRefInput = z.infer<typeof PaperclipAssignRefInputSchema>;
export type PaperclipCommentsRefInput = z.infer<typeof PaperclipCommentsRefInputSchema>;
export type PaperclipReviewRefInput = z.infer<typeof PaperclipReviewRefInputSchema>;

export const PaperclipIssueViewSchema = z.strictObject({
  id: z.uuid(), companyId: z.uuid(), identifier: Text, title: Text,
  description: z.string().nullable(), status: PaperclipIssueStatusSchema, assigneeAgentId: z.uuid().nullable(),
  projectId: z.uuid().nullable().optional(), goalId: z.uuid().nullable().optional(),
});
export const PaperclipQueueOutputSchema = z.strictObject({ issues: z.array(PaperclipIssueViewSchema).max(100) });
export const PaperclipMutationOutputSchema = z.strictObject({ issue: PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
export const PaperclipAgentBindingSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema, unitId: Text, companyId: z.uuid(), paperclipAgentId: z.uuid(),
  enabled: z.boolean(), roleAgents: z.record(Text, z.uuid()),
});
/**
 * The id of a Paperclip agent. Paperclip assigns, addresses and owns by id and by nothing else: `assigneeAgentId` is a
 * guid (Paperclip packages/shared/src/validators/issue.ts:713), the owner of a goal is `ownerAgentId`, a guid
 * (validators/goal.ts:11), the lead of a project is `leadAgentId` (validators/project.ts:110). A role, a unit or a
 * display name never reaches a Paperclip body: the model writes this id and nothing else.
 */
export const PaperclipAgentIdSchema = z.guid();
export type PaperclipAgentId = z.infer<typeof PaperclipAgentIdSchema>;

/** `paperclip_assign` with the recipient as an id (the `roleRef` form is deprecated). */
export const PaperclipAssignAgentInputSchema = z.strictObject({
  issueId: z.uuid(), assigneeAgentId: PaperclipAgentIdSchema, comment: Text.max(4000).optional(),
});
export const PaperclipAssignAgentRefInputSchema = PaperclipAssignAgentInputSchema.extend({ issueId: PaperclipIssueRefSchema });
/** `paperclip_create_issue` with the assignee as an id (the `assigneeRoleRef` form is deprecated). */
export const PaperclipCreateIssueAgentInputSchema = PaperclipCreateIssueInputSchema.omit({ assigneeRoleRef: true })
  .extend({ assigneeAgentId: PaperclipAgentIdSchema.optional() });
/** `paperclip_create_goal` with the owner as an id (the `ownerRoleRef` form is deprecated). */
export const PaperclipCreateGoalAgentInputSchema = PaperclipCreateGoalInputSchema.omit({ ownerRoleRef: true })
  .extend({ ownerAgentId: PaperclipAgentIdSchema.optional() });

/**
 * Where the id comes from. The model does not look an id up in a table of names: the server builds this list from the
 * seat registry of the company (the same source as `PaperclipAgentBindingSchema.roleAgents`, which stays server-owned and
 * never reaches a tool parameter) and shows it next to the task. The model reads `label` and writes `agentId`. `role` is
 * the X9 role of that agent: the permission to assign is decided from the role OF THE ID (decideAssignment), never from a
 * name the model typed. Paperclip's own list of agents (`GET /api/companies/:companyId/agents`) is the other source.
 */
export const PaperclipColleagueSchema = z.strictObject({
  agentId: PaperclipAgentIdSchema, role: AgentRoleSchema, unitId: Text, label: Text.max(200),
});
export const PaperclipColleaguesSchema = z.array(PaperclipColleagueSchema).max(200)
  .refine(values => new Set(values.map(value => value.agentId)).size === values.length, 'Colleague agent IDs must be unique');
export type PaperclipColleague = z.infer<typeof PaperclipColleagueSchema>;
export type PaperclipColleagues = z.infer<typeof PaperclipColleaguesSchema>;

/** Paperclip `GET /api/companies/:companyId/agents` row, read tolerantly (agents.ts:4028-4047; docs/api/agents.md:16). */
export const PaperclipAgentDirectoryEntrySchema = z.looseObject({
  id: PaperclipAgentIdSchema, name: z.string(), role: z.string(),
  status: z.enum(['active', 'paused', 'idle', 'running', 'error', 'pending_approval', 'terminated']),
  reportsTo: PaperclipAgentIdSchema.nullable().optional(),
});
export const PaperclipAgentDirectorySchema = z.array(PaperclipAgentDirectoryEntrySchema);
export type PaperclipAgentDirectoryEntry = z.infer<typeof PaperclipAgentDirectoryEntrySchema>;

export const PAPERCLIP_RECIPIENT_REFUSALS = ['agent_not_listed'] as const;
export type PaperclipRecipientRefusal = (typeof PAPERCLIP_RECIPIENT_REFUSALS)[number];
export type PaperclipRecipientDecision =
  | { ok: true; colleague: PaperclipColleague }
  | { ok: false; refusal: PaperclipRecipientRefusal };

/** Pure: the id the model wrote must be one the server listed; an invented guid is refused, never guessed. */
export function paperclipColleagueById(colleagues: readonly PaperclipColleague[], agentId: string): PaperclipRecipientDecision {
  const colleague = colleagues.find(value => value.agentId === agentId);
  return colleague === undefined ? { ok: false, refusal: 'agent_not_listed' } : { ok: true, colleague };
}

/** The deprecated free-text recipient fields. Their removal is a later adoption task, after the stack has moved to ids. */
export const PAPERCLIP_ROLE_REF_FIELDS = ['roleRef', 'assigneeRoleRef', 'ownerRoleRef'] as const;
/** For each tool that names a recipient: the deprecated field and the field that replaces it. */
export const PAPERCLIP_RECIPIENT_FIELD_BY_TOOL = {
  [PAPERCLIP_TOOLS.assign]: { deprecated: 'roleRef', current: 'assigneeAgentId' },
  [PAPERCLIP_TOOLS.createIssue]: { deprecated: 'assigneeRoleRef', current: 'assigneeAgentId' },
  [PAPERCLIP_TOOLS.createGoal]: { deprecated: 'ownerRoleRef', current: 'ownerAgentId' },
} as const;

export type PaperclipRecipientForm = 'agent_id' | 'role_ref' | 'both' | 'none';

/** Which form of recipient a call input carries: the proof that the new form is the one used (counted by the stack's tests). */
export function paperclipRecipientForm(tool: keyof typeof PAPERCLIP_RECIPIENT_FIELD_BY_TOOL, input: unknown): PaperclipRecipientForm {
  const fields = PAPERCLIP_RECIPIENT_FIELD_BY_TOOL[tool];
  const record: Record<string, unknown> = typeof input === 'object' && input !== null ? { ...input } : {};
  const hasId = record[fields.current] !== undefined;
  const hasRole = record[fields.deprecated] !== undefined;
  if (hasId && hasRole) return 'both';
  return hasId ? 'agent_id' : hasRole ? 'role_ref' : 'none';
}

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
