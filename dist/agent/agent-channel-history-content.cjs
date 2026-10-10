"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentChannelHistoryTranscriptResponseSchema = exports.AgentChannelHistoryTranscriptTurnSchema = void 0;
exports.isAgentChannelHistoryTranscriptCurrent = isAgentChannelHistoryTranscriptCurrent;
const zod_1 = require("zod");
const agent_channel_access_js_1 = require("./agent-channel-access.cjs");
const agent_channel_history_js_1 = require("./agent-channel-history.cjs");
const agent_management_js_1 = require("./agent-management.cjs");
const time = zod_1.z.iso.datetime({ offset: true });
/** Plain conversation text only. Never HTML, provider envelopes, tool arguments or system prompts. */
exports.AgentChannelHistoryTranscriptTurnSchema = zod_1.z.object({
    speaker: zod_1.z.enum(['user', 'assistant']), text: zod_1.z.string().min(1).max(65_536),
    offsetSeconds: zod_1.z.number().finite().nonnegative().nullable(),
}).strict();
const fields = {
    kind: agent_channel_history_js_1.AgentChannelHistoryKindSchema, entryId: agent_management_js_1.AgentManagementRequestIdSchema, conversationId: agent_management_js_1.AgentManagementRequestIdSchema,
};
const available = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({ ...fields, status: zod_1.z.literal('available'), observedAt: time,
    subject: zod_1.z.string().max(998).nullable(), turns: zod_1.z.array(exports.AgentChannelHistoryTranscriptTurnSchema).min(1).max(2048),
}).superRefine((content, ctx) => {
    if (content.kind !== 'email' && content.subject !== null)
        ctx.addIssue({ code: 'custom', path: ['subject'], message: 'Only email has a message subject' });
    if (content.turns.reduce((size, turn) => size + turn.text.length, 0) > 262_144)
        ctx.addIssue({ code: 'custom', path: ['turns'], message: 'Transcript exceeds the bounded plain-text response' });
    let previous = 0;
    for (const turn of content.turns)
        if (turn.offsetSeconds !== null) {
            if (turn.offsetSeconds < previous)
                ctx.addIssue({ code: 'custom', path: ['turns'], message: 'Conversation offsets must be chronological' });
            previous = turn.offsetSeconds;
        }
});
const absent = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeExtend({ ...fields,
    status: agent_channel_history_js_1.AgentChannelHistoryContentStateSchema.exclude(['available']), observedAt: time.nullable(),
});
exports.AgentChannelHistoryTranscriptResponseSchema = zod_1.z.discriminatedUnion('status', [available, absent]);
/** Correlation only: the producer authenticates, reloads the exact stored entry and rechecks current authority.
 * A missing/expired/unretained transcript never becomes an empty successful conversation.
 */
function isAgentChannelHistoryTranscriptCurrent(rawContent, rawBinding, rawKind, rawEntryId, rawEntry, now, maximumAgeMs = 60_000) {
    const content = exports.AgentChannelHistoryTranscriptResponseSchema.safeParse(rawContent), binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    const kind = agent_channel_history_js_1.AgentChannelHistoryKindSchema.safeParse(rawKind), id = agent_management_js_1.AgentManagementRequestIdSchema.safeParse(rawEntryId);
    const stored = agent_channel_history_js_1.AgentChannelHistoryEntrySchema.safeParse(rawEntry);
    if (!content.success || !binding.success || !kind.success || !id.success || !stored.success
        || !Number.isFinite(now) || !Number.isFinite(maximumAgeMs) || maximumAgeMs <= 0)
        return false;
    const actual = content.data, entry = stored.data;
    if (!(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: actual.scope, identity: actual.identity }, binding.data)
        || !(0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: entry.scope, identity: entry.identity }, binding.data))
        return false; // guard:transcript-binding
    if (actual.kind !== kind.data || entry.kind !== kind.data || actual.entryId !== id.data || entry.entryId !== id.data
        || actual.conversationId !== entry.conversationId || actual.status !== entry.content.transcript)
        return false;
    if (actual.observedAt === null)
        return false;
    const observed = Date.parse(actual.observedAt), age = now - observed;
    return age >= 0 && age < maximumAgeMs && Date.parse(entry.startedAt) <= observed
        && (entry.endedAt === null || Date.parse(entry.endedAt) <= observed);
}
//# sourceMappingURL=agent-channel-history-content.js.map