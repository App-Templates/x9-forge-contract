import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { BusinessUnitLeadBirthRequestSchema, BusinessUnitLeadBirthResultSchema } from '../../organization/business-unit-lead.js';

const Text = z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
export const PAPERCLIP_TOOLS = {
  queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
  createIssue: 'paperclip_create_issue', comments: 'paperclip_comments', review: 'paperclip_review',
  createBusinessUnit: 'paperclip_create_business_unit',
} as const;
export const PaperclipIssueStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']);
const Statuses = z.array(PaperclipIssueStatusSchema).min(1).max(7)
  .refine(values => new Set(values).size === values.length, 'Statuses must be unique');
export const PaperclipQueueInputSchema = z.strictObject({
  statuses: Statuses.optional(), limit: z.number().int().min(1).max(100).optional(),
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
export type PaperclipQueueInput = z.infer<typeof PaperclipQueueInputSchema>;
export type PaperclipIssueInput = z.infer<typeof PaperclipIssueInputSchema>;
export type PaperclipTakeInput = z.infer<typeof PaperclipTakeInputSchema>;
export type PaperclipAssignInput = z.infer<typeof PaperclipAssignInputSchema>;
export type PaperclipCreateIssueInput = z.infer<typeof PaperclipCreateIssueInputSchema>;
export type PaperclipCreateBusinessUnitInput = z.infer<typeof PaperclipCreateBusinessUnitInputSchema>;
export type PaperclipCreateBusinessUnitOutput = z.infer<typeof PaperclipCreateBusinessUnitOutputSchema>;
export type PaperclipCommentsInput = z.infer<typeof PaperclipCommentsInputSchema>;
export type PaperclipCommentView = z.infer<typeof PaperclipCommentViewSchema>;
export type PaperclipCommentsOutput = z.infer<typeof PaperclipCommentsOutputSchema>;
export type PaperclipReviewInput = z.infer<typeof PaperclipReviewInputSchema>;
export type PaperclipIssueView = z.infer<typeof PaperclipIssueViewSchema>;
export type PaperclipAgentBinding = z.infer<typeof PaperclipAgentBindingSchema>;
