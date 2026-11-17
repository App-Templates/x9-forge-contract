import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-identity.js";
import { AgentDaySchema } from "../ricerca/spend.js";
import { SocialVerticalIdSchema } from "./post.js";
import { SocialTrackSchema } from "./topic.js";
const IsoDateTimeSchema = z.iso.datetime({ offset: true });
/** The pipeline of one round: collect posts, transcribe, filter, verify, group into topics. */
export const SOCIAL_JOB_KINDS = ['collect', 'transcribe', 'filter', 'verify', 'group'];
export const SocialJobKindSchema = z.enum(SOCIAL_JOB_KINDS);
export const SOCIAL_JOB_STATES = ['queued', 'running', 'done', 'failed', 'cancelled'];
export const SocialJobStateSchema = z.enum(SOCIAL_JOB_STATES);
/** One job of the queue. Tenant, owner and agent on every row (R-33). */
export const SocialJobSchema = z.object({
    identity: CapabilityAgentScopeSchema,
    jobId: z.uuid(),
    kind: SocialJobKindSchema,
    state: SocialJobStateSchema,
    track: SocialTrackSchema,
    day: AgentDaySchema,
    verticalId: SocialVerticalIdSchema,
    postId: z.string().min(1).max(100).optional(),
    topicId: z.string().min(1).max(100).optional(),
    attempts: z.number().int().min(0).max(10),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    error: z.string().min(1).max(500).optional(),
}).strict().superRefine((j, ctx) => {
    if ((j.kind === 'transcribe' || j.kind === 'filter') && j.postId === undefined) {
        ctx.addIssue({ code: 'custom', path: ['postId'], message: `${j.kind} job needs postId` });
    }
    if (j.state === 'failed' && j.error === undefined) {
        ctx.addIssue({ code: 'custom', path: ['error'], message: 'failed job needs error' });
    }
    if (j.state !== 'failed' && j.error !== undefined) {
        ctx.addIssue({ code: 'custom', path: ['error'], message: 'error only with failed' });
    }
});
export const SOCIAL_ROUND_STATES = ['scheduled', 'running', 'done', 'failed', 'cap_reached'];
export const SocialRoundStateSchema = z.enum(SOCIAL_ROUND_STATES);
/** State of the day's round for one vertical (D9, D20). */
export const SocialRoundSchema = z.object({
    identity: CapabilityAgentScopeSchema,
    verticalId: SocialVerticalIdSchema,
    day: AgentDaySchema,
    track: SocialTrackSchema,
    state: SocialRoundStateSchema,
    scheduledFor: IsoDateTimeSchema,
    startedAt: IsoDateTimeSchema.optional(),
    finishedAt: IsoDateTimeSchema.optional(),
    /** D9: the Mac did not deliver and the round passed to the server. */
    handedToServerAt: IsoDateTimeSchema.optional(),
    postsSeen: z.number().int().nonnegative(),
    topicsCount: z.number().int().nonnegative(),
    spentUsd: z.number().nonnegative().finite(),
    capUsd: z.number().positive().finite().optional(),
}).strict().superRefine((r, ctx) => {
    const ended = r.state === 'done' || r.state === 'failed' || r.state === 'cap_reached';
    if (r.finishedAt !== undefined && !ended) {
        ctx.addIssue({ code: 'custom', path: ['finishedAt'], message: 'finishedAt only with done, failed or cap_reached' });
    }
    if (r.handedToServerAt !== undefined && r.track !== 'server') {
        ctx.addIssue({ code: 'custom', path: ['handedToServerAt'], message: 'handedToServerAt only on the server track' });
    }
    if (r.state === 'cap_reached' && (r.track !== 'server' || r.capUsd === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'cap_reached only on the server track with capUsd' });
    }
});
//# sourceMappingURL=queue.js.map