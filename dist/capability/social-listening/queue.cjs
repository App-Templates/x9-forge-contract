"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialRoundSchema = exports.SOCIAL_ROUND_ENDED_STATES = exports.SocialRoundStateSchema = exports.SOCIAL_ROUND_STATES = exports.SocialJobSchema = exports.SocialJobStateSchema = exports.SOCIAL_JOB_STATES = exports.SocialJobKindSchema = exports.SOCIAL_JOB_KINDS = void 0;
exports.socialRoundEnded = socialRoundEnded;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
const post_js_1 = require("./post.cjs");
const topic_js_1 = require("./topic.cjs");
const IsoDateTimeSchema = zod_1.z.iso.datetime({ offset: true });
/** The pipeline of one round: collect posts, transcribe, filter, verify, group into topics. */
exports.SOCIAL_JOB_KINDS = ['collect', 'transcribe', 'filter', 'verify', 'group'];
exports.SocialJobKindSchema = zod_1.z.enum(exports.SOCIAL_JOB_KINDS);
exports.SOCIAL_JOB_STATES = ['queued', 'running', 'done', 'failed', 'cancelled'];
exports.SocialJobStateSchema = zod_1.z.enum(exports.SOCIAL_JOB_STATES);
/** One job of the queue. Tenant, owner and agent on every row (R-33). */
exports.SocialJobSchema = zod_1.z.object({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    jobId: zod_1.z.uuid(),
    kind: exports.SocialJobKindSchema,
    state: exports.SocialJobStateSchema,
    track: topic_js_1.SocialTrackSchema,
    day: spend_js_1.AgentDaySchema,
    verticalId: post_js_1.SocialVerticalIdSchema,
    postId: zod_1.z.string().min(1).max(100).optional(),
    topicId: zod_1.z.string().min(1).max(100).optional(),
    attempts: zod_1.z.number().int().min(0).max(10),
    createdAt: IsoDateTimeSchema,
    updatedAt: IsoDateTimeSchema,
    error: zod_1.z.string().min(1).max(500).optional(),
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
exports.SOCIAL_ROUND_STATES = ['scheduled', 'running', 'done', 'failed', 'cap_reached'];
exports.SocialRoundStateSchema = zod_1.z.enum(exports.SOCIAL_ROUND_STATES);
exports.SOCIAL_ROUND_ENDED_STATES = ['done', 'failed', 'cap_reached'];
function socialRoundEnded(state) {
    return exports.SOCIAL_ROUND_ENDED_STATES.some(endedState => state === endedState);
}
/** State of the day's round for one vertical (D9, D20). */
exports.SocialRoundSchema = zod_1.z.object({
    identity: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    verticalId: post_js_1.SocialVerticalIdSchema,
    day: spend_js_1.AgentDaySchema,
    track: topic_js_1.SocialTrackSchema,
    state: exports.SocialRoundStateSchema,
    scheduledFor: IsoDateTimeSchema,
    startedAt: IsoDateTimeSchema.optional(),
    finishedAt: IsoDateTimeSchema.optional(),
    /** D9: the Mac did not deliver and the round passed to the server. */
    handedToServerAt: IsoDateTimeSchema.optional(),
    postsSeen: zod_1.z.number().int().nonnegative(),
    topicsCount: zod_1.z.number().int().nonnegative(),
    spentUsd: zod_1.z.number().nonnegative().finite(),
    capUsd: zod_1.z.number().positive().finite().optional(),
    /** When the end-of-round message (D21) was sent; absent until sent and on rounds saved before. */
    noticeSentAt: IsoDateTimeSchema.optional(),
}).strict().superRefine((r, ctx) => {
    const ended = socialRoundEnded(r.state);
    if (r.finishedAt !== undefined && !ended) {
        ctx.addIssue({ code: 'custom', path: ['finishedAt'], message: 'finishedAt only with done, failed or cap_reached' });
    }
    if (r.handedToServerAt !== undefined && r.track !== 'server') {
        ctx.addIssue({ code: 'custom', path: ['handedToServerAt'], message: 'handedToServerAt only on the server track' });
    }
    if (r.state === 'cap_reached' && (r.track !== 'server' || r.capUsd === undefined)) {
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'cap_reached only on the server track with capUsd' });
    }
    if (r.noticeSentAt !== undefined && !ended) {
        ctx.addIssue({ code: 'custom', path: ['noticeSentAt'], message: 'noticeSentAt only with done, failed or cap_reached' });
    }
});
//# sourceMappingURL=queue.js.map