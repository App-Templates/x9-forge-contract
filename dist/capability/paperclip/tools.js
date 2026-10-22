import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { BusinessUnitLeadBirthRequestSchema, BusinessUnitLeadBirthResultSchema } from "../../organization/business-unit-lead.js";
const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
export const PAPERCLIP_TOOLS = {
    queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
    createIssue: 'paperclip_create_issue', comments: 'paperclip_comments', review: 'paperclip_review',
    createBusinessUnit: 'paperclip_create_business_unit', search: 'paperclip_search', activity: 'paperclip_activity',
    createProject: 'paperclip_create_project', createGoal: 'paperclip_create_goal',
};
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
    parentIssueId: z.uuid().optional(),
    blockedByIssueIds: z.array(z.uuid()).max(20)
        .refine(values => new Set(values).size === values.length, 'Blocking issue IDs must be unique').optional(),
});
export const PaperclipCreateBusinessUnitInputSchema = BusinessUnitLeadBirthRequestSchema.extend({ unitName: Text });
export const PaperclipCreateBusinessUnitOutputSchema = z.strictObject({
    unitId: Text, paperclipAgentId: z.uuid(),
    agentIdentity: BusinessUnitLeadBirthResultSchema.shape.agentIdentity, replayed: z.boolean(),
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
});
export const PaperclipQueueOutputSchema = z.strictObject({ issues: z.array(PaperclipIssueViewSchema).max(100) });
export const PaperclipMutationOutputSchema = z.strictObject({ issue: PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
export const PaperclipAgentBindingSchema = z.strictObject({
    scope: CapabilityAgentScopeSchema, unitId: Text, companyId: z.uuid(), paperclipAgentId: z.uuid(),
    enabled: z.boolean(), roleAgents: z.record(Text, z.uuid()),
});
//# sourceMappingURL=tools.js.map