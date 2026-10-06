"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRuntimeSnapshotSchema = exports.AgentRuntimeEvidenceSchema = exports.AgentRuntimeLoadStateSchema = exports.AgentRuntimeChannelSchema = exports.AgentRuntimeReadinessSchema = exports.AgentRuntimeChannelStateSchema = exports.AgentRuntimeChannelKindSchema = exports.AgentRuntimeStateSchema = void 0;
exports.deriveAgentRuntimeState = deriveAgentRuntimeState;
const zod_1 = require("zod");
const channel_type_js_1 = require("../messaging/channel-type.cjs");
/** Canonical agent state; legacy bot status alone cannot supply these values. */
exports.AgentRuntimeStateSchema = zod_1.z.enum(['active', 'no-channel', 'stopped', 'error', 'unknown']);
exports.AgentRuntimeChannelKindSchema = channel_type_js_1.ChannelTypeSchema.or(zod_1.z.literal('web'));
exports.AgentRuntimeChannelStateSchema = zod_1.z.enum(['loaded', 'paused', 'stopped', 'error', 'unknown']);
/** Readiness is independent of whether a channel is currently loaded. */
exports.AgentRuntimeReadinessSchema = zod_1.z.enum(['ready', 'not-ready', 'unknown']);
exports.AgentRuntimeChannelSchema = zod_1.z.object({
    channelId: zod_1.z.string().min(1),
    kind: exports.AgentRuntimeChannelKindSchema,
    state: exports.AgentRuntimeChannelStateSchema,
    // null means unobserved, never an inferred false.
    loaded: zod_1.z.boolean().nullable(),
    readiness: exports.AgentRuntimeReadinessSchema,
}).superRefine((channel, ctx) => {
    const expected = channel.state === 'loaded' ? true
        : channel.state === 'paused' || channel.state === 'stopped' ? false
            : channel.state === 'unknown' ? null : undefined;
    if (expected !== undefined && channel.loaded !== expected) {
        ctx.addIssue({ code: 'custom', path: ['loaded'], message: 'Channel state contradicts its loading evidence' });
    }
});
exports.AgentRuntimeLoadStateSchema = zod_1.z.enum(['loaded', 'stopped', 'error', 'unknown']);
exports.AgentRuntimeEvidenceSchema = zod_1.z.object({
    loadState: exports.AgentRuntimeLoadStateSchema,
    channelsComplete: zod_1.z.boolean(),
    channels: zod_1.z.array(exports.AgentRuntimeChannelSchema),
}).superRefine((evidence, ctx) => {
    const identifiers = new Set();
    for (const [index, channel] of evidence.channels.entries()) {
        if (identifiers.has(channel.channelId)) {
            ctx.addIssue({ code: 'custom', path: ['channels', index, 'channelId'], message: 'Duplicate channel identifier' });
        }
        identifiers.add(channel.channelId);
    }
    if (evidence.loadState === 'stopped' && evidence.channels.some((channel) => channel.loaded === true)) {
        ctx.addIssue({ code: 'custom', path: ['loadState'], message: 'A stopped agent cannot have a loaded channel' });
    }
});
/** Derive state from validated X9 observations, including capability-owned channels. */
function deriveAgentRuntimeState(evidence) {
    if (evidence.channels.some((channel) => channel.loaded === true))
        return 'active';
    if (evidence.loadState === 'error')
        return 'error';
    if (evidence.loadState === 'stopped')
        return 'stopped';
    if (evidence.channels.some((channel) => channel.state === 'error'))
        return 'error';
    if (evidence.loadState === 'loaded' && evidence.channelsComplete
        && evidence.channels.every((channel) => channel.loaded === false))
        return 'no-channel';
    return 'unknown';
}
exports.AgentRuntimeSnapshotSchema = exports.AgentRuntimeEvidenceSchema.safeExtend({
    state: exports.AgentRuntimeStateSchema,
}).superRefine((snapshot, ctx) => {
    if (snapshot.state !== deriveAgentRuntimeState(snapshot)) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Agent state is not supported by runtime evidence' });
    }
});
//# sourceMappingURL=agent-runtime-state.js.map