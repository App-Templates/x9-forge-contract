import { z } from 'zod';
import { emailMessageCode } from "../../messaging/message-code.js";
import { ToolErrorDispositionSchema } from "../tool-call.js";
export const INBOUND_EVENT_OUTCOMES = ['commented', 'duplicate', 'refused'];
export const INBOUND_EVENT_NOT_WOKEN_REASONS = [
    'issue_closed', 'run_alive', 'daily_run_limit', 'daily_cost_limit', 'unknown',
];
/** Every inbound event leaves a comment, a deduplication key or a fixed refusal. */
export const InboundEventDispositionSchema = z.discriminatedUnion('outcome', [
    z.strictObject({
        outcome: z.literal('commented'),
        issueId: z.uuid(),
        commentId: z.uuid(),
        assigneeAgentId: z.uuid(),
        authorAgentId: z.uuid().nullable(),
        woke: z.boolean(),
        runId: z.uuid().optional(),
        notWokenReason: z.enum(INBOUND_EVENT_NOT_WOKEN_REASONS).optional(),
    }).superRefine((value, ctx) => {
        if (value.authorAgentId === value.assigneeAgentId) {
            ctx.addIssue({ code: 'custom', path: ['authorAgentId'], message: 'The author must differ from the assignee' });
        }
        if (value.woke && value.notWokenReason !== undefined) {
            ctx.addIssue({ code: 'custom', path: ['notWokenReason'], message: 'A woken event must not carry a not-woken reason' });
        }
        if (!value.woke && value.notWokenReason === undefined) {
            ctx.addIssue({ code: 'custom', path: ['notWokenReason'], message: 'A not-woken event requires a reason' });
        }
        if (!value.woke && value.runId !== undefined) {
            ctx.addIssue({ code: 'custom', path: ['runId'], message: 'A not-woken event must not carry runId' });
        }
    }),
    z.strictObject({
        outcome: z.literal('duplicate'),
        dedupeKey: z.string().min(1).max(998),
        issueId: z.uuid().optional(),
        commentId: z.uuid().optional(),
    }),
    z.strictObject({
        outcome: z.literal('refused'),
        disposition: ToolErrorDispositionSchema,
    }),
]);
/** Use the shared message code so bare and bracketed message IDs deduplicate alike. */
export function inboundEmailDedupeKey(messageId) {
    return emailMessageCode(messageId);
}
//# sourceMappingURL=inbound-event.js.map