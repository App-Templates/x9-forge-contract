import { z } from 'zod';
import { ChannelTypeSchema } from "../messaging/channel-type.js";
/** Canonical agent state; legacy bot status alone cannot supply these values. */
export const AgentRuntimeStateSchema = z.enum(['active', 'no-channel', 'stopped', 'error', 'unknown']);
export const AgentRuntimeChannelKindSchema = ChannelTypeSchema.or(z.literal('web'));
export const AgentRuntimeChannelStateSchema = z.enum(['loaded', 'paused', 'stopped', 'error', 'unknown']);
/** Readiness is independent of whether a channel is currently loaded. */
export const AgentRuntimeReadinessSchema = z.enum(['ready', 'not-ready', 'unknown']);
export const AgentRuntimeChannelSchema = z.object({
    channelId: z.string().min(1),
    kind: AgentRuntimeChannelKindSchema,
    state: AgentRuntimeChannelStateSchema,
    // null means unobserved, never an inferred false.
    loaded: z.boolean().nullable(),
    readiness: AgentRuntimeReadinessSchema,
    /** Observed Telegram metadata only; absence does not imply an empty authorization list. */
    botUsername: z.string().min(5).max(32).regex(/^[A-Za-z0-9_]+bot$/i).optional(),
    allowFromCount: z.number().int().nonnegative().optional(),
}).superRefine((channel, ctx) => {
    if (channel.kind !== 'telegram' && (channel.botUsername !== undefined || channel.allowFromCount !== undefined)) {
        ctx.addIssue({ code: 'custom', message: 'Telegram metadata requires a Telegram channel' });
    }
    const expected = channel.state === 'loaded' ? true
        : channel.state === 'paused' || channel.state === 'stopped' ? false
            : channel.state === 'unknown' ? null : undefined;
    if (expected !== undefined && channel.loaded !== expected) {
        ctx.addIssue({ code: 'custom', path: ['loaded'], message: 'Channel state contradicts its loading evidence' });
    }
});
/** Read validated Telegram observations without exposing authorization IDs or inferring readiness. */
export function telegramChannelMetadataOf(channel) {
    const selected = AgentRuntimeChannelSchema.safeParse(channel);
    if (!selected.success)
        return null;
    const { botUsername, allowFromCount } = selected.data;
    if (botUsername === undefined && allowFromCount === undefined)
        return null;
    return {
        ...(botUsername === undefined ? {} : { botUsername }),
        ...(allowFromCount === undefined ? {} : { allowFromCount }),
    };
}
export const AgentRuntimeLoadStateSchema = z.enum(['loaded', 'stopped', 'error', 'unknown']);
export const AgentRuntimeEvidenceSchema = z.object({
    loadState: AgentRuntimeLoadStateSchema,
    channelsComplete: z.boolean(),
    channels: z.array(AgentRuntimeChannelSchema),
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
export function deriveAgentRuntimeState(evidence) {
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
export const AgentRuntimeSnapshotSchema = AgentRuntimeEvidenceSchema.safeExtend({
    state: AgentRuntimeStateSchema,
}).superRefine((snapshot, ctx) => {
    if (snapshot.state !== deriveAgentRuntimeState(snapshot)) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Agent state is not supported by runtime evidence' });
    }
});
//# sourceMappingURL=agent-runtime-state.js.map