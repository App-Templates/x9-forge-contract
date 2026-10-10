"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaperclipAgentBindingSchema = exports.PaperclipMutationOutputSchema = exports.PaperclipQueueOutputSchema = exports.PaperclipIssueViewSchema = exports.PaperclipAssignInputSchema = exports.PaperclipTakeInputSchema = exports.PaperclipIssueInputSchema = exports.PaperclipQueueInputSchema = exports.PaperclipIssueStatusSchema = exports.PAPERCLIP_TOOLS = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const Text = zod_1.z.string().min(1).max(4096).refine(value => value.trim().length > 0, 'Non-blank text required');
exports.PAPERCLIP_TOOLS = {
    queue: 'paperclip_queue', issue: 'paperclip_issue', take: 'paperclip_take', assign: 'paperclip_assign',
};
exports.PaperclipIssueStatusSchema = zod_1.z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'blocked', 'cancelled']);
const Statuses = zod_1.z.array(exports.PaperclipIssueStatusSchema).min(1).max(7)
    .refine(values => new Set(values).size === values.length, 'Statuses must be unique');
exports.PaperclipQueueInputSchema = zod_1.z.strictObject({
    statuses: Statuses.optional(), limit: zod_1.z.number().int().min(1).max(100).optional(),
});
exports.PaperclipIssueInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid() });
exports.PaperclipTakeInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid(), expectedStatuses: Statuses });
exports.PaperclipAssignInputSchema = zod_1.z.strictObject({ issueId: zod_1.z.uuid(), roleRef: Text });
exports.PaperclipIssueViewSchema = zod_1.z.strictObject({
    id: zod_1.z.uuid(), companyId: zod_1.z.uuid(), identifier: Text, title: Text,
    description: zod_1.z.string().nullable(), status: exports.PaperclipIssueStatusSchema, assigneeAgentId: zod_1.z.uuid().nullable(),
});
exports.PaperclipQueueOutputSchema = zod_1.z.strictObject({ issues: zod_1.z.array(exports.PaperclipIssueViewSchema).max(100) });
exports.PaperclipMutationOutputSchema = zod_1.z.strictObject({ issue: exports.PaperclipIssueViewSchema });
/** Server-owned mapping. Credentials and an active native run never come from tool parameters. */
exports.PaperclipAgentBindingSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, unitId: Text, companyId: zod_1.z.uuid(), paperclipAgentId: zod_1.z.uuid(),
    enabled: zod_1.z.boolean(), roleAgents: zod_1.z.record(Text, zod_1.z.uuid()),
});
//# sourceMappingURL=tools.js.map