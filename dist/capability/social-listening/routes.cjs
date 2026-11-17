"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socialRoundReadContract = exports.SocialRoundReadResponseSchema = exports.SocialRoundQuerySchema = void 0;
exports.readSocialGenericJob = readSocialGenericJob;
exports.readSocialGenericOutput = readSocialGenericOutput;
exports.socialRoundPath = socialRoundPath;
exports.selectSocialRound = selectSocialRound;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability-call-identity.cjs");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const spend_js_1 = require("../ricerca/spend.cjs");
const job_io_js_1 = require("./job-io.cjs");
const post_js_1 = require("./post.cjs");
const queue_js_1 = require("./queue.cjs");
/** Decode generic channel data only for the exact social queue job and trusted scope. */
function readSocialGenericJob(generic, queueJob) {
    if (generic.capability !== 'social-listening')
        return { ok: false, error: 'not_social_job' };
    const scope = capability_call_identity_js_1.CapabilityAgentScopeSchema.safeParse(generic.scope);
    if (!scope.success || !(0, capability_call_context_js_1.sameCapabilityScope)(scope.data, queueJob.identity)) {
        return { ok: false, error: 'foreign_scope' };
    }
    if (generic.kind !== queueJob.kind)
        return { ok: false, error: 'kind_mismatch' };
    const parsed = job_io_js_1.SocialJobInputSchema.safeParse(generic.input);
    if (!parsed.success)
        return { ok: false, error: 'invalid_input' };
    const input = parsed.data;
    if (input.kind !== queueJob.kind)
        return { ok: false, error: 'kind_mismatch' };
    if (('postId' in input && input.postId !== queueJob.postId)
        || ('topicId' in input && input.topicId !== queueJob.topicId)
        || ('verticalId' in input && input.verticalId !== queueJob.verticalId)) {
        return { ok: false, error: 'input_mismatch' };
    }
    return { ok: true, input };
}
/** The service attaches identity from the queue job; identity never comes from the executor. */
function readSocialGenericOutput(queueJob, output) {
    const parsed = job_io_js_1.SocialJobResultSchema.safeParse(output);
    if (!parsed.success)
        return { ok: false, error: 'invalid_result' };
    const match = (0, job_io_js_1.socialJobResultMatches)(queueJob, parsed.data);
    if (!match.ok)
        return match;
    return { ok: true, result: parsed.data };
}
/** Build the read-only round path for a validated agent id. */
function socialRoundPath(agentId) {
    return `/internal/capability/agents/${agent_config_js_1.CapabilityAgentIdSchema.parse(agentId)}/social-listening/round`;
}
exports.SocialRoundQuerySchema = zod_1.z.strictObject({
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    verticalId: post_js_1.SocialVerticalIdSchema,
    day: spend_js_1.AgentDaySchema,
});
exports.SocialRoundReadResponseSchema = zod_1.z.strictObject({ round: queue_js_1.SocialRoundSchema.nullable() });
/** Accept a complete round response only within the requested scope, vertical and day. */
function selectSocialRound(raw, query) {
    const request = exports.SocialRoundQuerySchema.safeParse(query);
    const response = exports.SocialRoundReadResponseSchema.safeParse(raw);
    if (!request.success || !response.success)
        return { ok: false, error: 'invalid_response' };
    const { round } = response.data;
    if (round === null)
        return { ok: true, round: null };
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(round.identity, request.data.scope))
        return { ok: false, error: 'foreign_scope' };
    if (round.verticalId !== request.data.verticalId || round.day !== request.data.day) {
        return { ok: false, error: 'round_mismatch' };
    }
    return { ok: true, round };
}
/**
 * The internal secret travels in the {@link INTERNAL_SECRET_HEADER} header.
 * The service must compare path agentId with scope.agentId and authorize that scope.
 * Reading an absent round returns null and never creates or enqueues work.
 */
exports.socialRoundReadContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/social-listening/round',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({ agentId: agent_config_js_1.CapabilityAgentIdSchema }),
    querySchema: exports.SocialRoundQuerySchema,
    responseSchema: exports.SocialRoundReadResponseSchema,
};
//# sourceMappingURL=routes.js.map