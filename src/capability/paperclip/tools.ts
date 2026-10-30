import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { BusinessUnitLeadBirthRequestSchema, BusinessUnitLeadBirthResultSchema } from '../../organization/business-unit-lead.js';
import { DecisionRequestIdSchema } from '../../organization/decision-request.js';

const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
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
  parentId: z.uuid().optional(), ownerRoleRef: Text.optional(),
});
export const PaperclipGoalViewSchema = z.strictObject({
  id: z.uuid(), companyId: z.uuid(), title: Text, level: PaperclipGoalLevelSchema,
  parentId: z.uuid().nullable(), ownerAgentId: z.uuid().nullable(),
});
export const PaperclipCreateGoalOutputSchema = z.strictObject({ goal: PaperclipGoalViewSchema });
export const PaperclipIssueStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']);
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
export const PaperclipAssignInputSchema = z.strictObject({ issueId: z.uuid(), roleRef: Text });
export const PaperclipCreateIssueInputSchema = z.strictObject({
  title: Text, description: z.string().max(16384).optional(), assigneeRoleRef: Text.optional(),
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
export const PaperclipIssueViewSchema = z.strictObject({
  id: z.uuid(), companyId: z.uuid(), identifier: Text, title: Text,
  description: z.string().nullable(), status: PaperclipIssueStatusSchema, assigneeAgentId: z.uuid().nullable(),
  projectId: z.uuid().nullable().optional(), goalId: z.uuid().nullable().optional(),
  parentId: z.uuid().nullable().optional(),
});
export const PaperclipQueueOutputSchema = z.strictObject({ issues: z.array(PaperclipIssueViewSchema).max(100) });
export const PaperclipMutationOutputSchema = z.strictObject({ issue: PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
export const PaperclipAgentBindingSchema = z.strictObject({
  scope: CapabilityAgentScopeSchema, unitId: Text, companyId: z.uuid(), paperclipAgentId: z.uuid(),
  enabled: z.boolean(), roleAgents: z.record(Text, z.uuid()),
});
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
