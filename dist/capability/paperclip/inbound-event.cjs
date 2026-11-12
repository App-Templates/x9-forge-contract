"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InboundEventDispositionSchema = exports.INBOUND_EVENT_NOT_WOKEN_REASONS = exports.INBOUND_EVENT_OUTCOMES = void 0;
exports.inboundEmailDedupeKey = inboundEmailDedupeKey;
const zod_1 = require("zod");
const message_code_js_1 = require("../../messaging/message-code.cjs");
const tool_call_js_1 = require("../tool-call.cjs");
exports.INBOUND_EVENT_OUTCOMES = ['commented', 'duplicate', 'refused'];
exports.INBOUND_EVENT_NOT_WOKEN_REASONS = [
    'issue_closed', 'run_alive', 'daily_run_limit', 'daily_cost_limit', 'unknown',
];
/** Every inbound event leaves a comment, a deduplication key or a fixed refusal. */
exports.InboundEventDispositionSchema = zod_1.z.discriminatedUnion('outcome', [
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('commented'),
        issueId: zod_1.z.uuid(),
        commentId: zod_1.z.uuid(),
        assigneeAgentId: zod_1.z.uuid(),
        authorAgentId: zod_1.z.uuid().nullable(),
        woke: zod_1.z.boolean(),
        runId: zod_1.z.uuid().optional(),
        notWokenReason: zod_1.z.enum(exports.INBOUND_EVENT_NOT_WOKEN_REASONS).optional(),
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
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('duplicate'),
        dedupeKey: zod_1.z.string().min(1).max(998),
        issueId: zod_1.z.uuid().optional(),
        commentId: zod_1.z.uuid().optional(),
    }),
    zod_1.z.strictObject({
        outcome: zod_1.z.literal('refused'),
        disposition: tool_call_js_1.ToolErrorDispositionSchema,
    }),
]);
/** Use the shared message code so bare and bracketed message IDs deduplicate alike. */
function inboundEmailDedupeKey(messageId) {
    return (0, message_code_js_1.emailMessageCode)(messageId);
}
//# sourceMappingURL=inbound-event.js.map