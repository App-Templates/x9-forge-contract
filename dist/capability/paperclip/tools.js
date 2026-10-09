import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
export const PAPERCLIP_TOOLS = {
    queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
};
export const PaperclipIssueStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']);
const Statuses = z.array(PaperclipIssueStatusSchema).min(1).max(7)
    .refine(values => new Set(values).size === values.length, 'Statuses must be unique');
export const PaperclipQueueInputSchema = z.strictObject({
    statuses: Statuses.optional(), limit: z.number().int().min(1).max(100).optional(),
});
export const PaperclipIssueInputSchema = z.strictObject({ issueId: z.uuid() });
export const PaperclipTakeInputSchema = z.strictObject({ issueId: z.uuid(), expectedStatuses: Statuses });
export const PaperclipAssignInputSchema = z.strictObject({ issueId: z.uuid(), roleRef: Text });
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