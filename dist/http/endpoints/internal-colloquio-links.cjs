"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.colloquioLinkContract = exports.ColloquioLinkRefusalSchema = exports.ColloquioLinkResponseSchema = exports.ColloquioLinkRequestSchema = exports.COLLOQUIO_LINK_REFUSALS = exports.COLLOQUIO_LINK_CODE_PATTERN = exports.COLLOQUIO_TOPIC_EXCERPT_MAX = exports.COLLOQUIO_TOPIC_SUBJECT_MAX = exports.COLLOQUIO_LINK_TTL_MS = void 0;
const zod_1 = require("zod");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const internal_project_create_js_1 = require("./internal-project-create.cjs");
/** Lifetime of a «parlane a voce» link; same as DEV_DELIVERY_LINK_TTL_MS. */
exports.COLLOQUIO_LINK_TTL_MS = 30 * 24 * 60 * 60 * 1000;
exports.COLLOQUIO_TOPIC_SUBJECT_MAX = 300;
exports.COLLOQUIO_TOPIC_EXCERPT_MAX = 500;
exports.COLLOQUIO_LINK_CODE_PATTERN = /^[A-Za-z0-9]{11}$/;
exports.COLLOQUIO_LINK_REFUSALS = ['capability_disabled', 'identity_mismatch', 'recipient_not_referente', 'unavailable'];
// Same limits as the mail references of a decision request.
const MailRefSchema = zod_1.z.string().min(1).max(998).refine((v) => v.trim().length > 0, 'Non-blank reference required');
// References cap-email already knows BEFORE sending the mail.
const ColloquioEmailRefSchema = zod_1.z.strictObject({
    threadKey: MailRefSchema.optional(),
    messageId: MailRefSchema.optional(),
}).refine((email) => email.threadKey !== undefined || email.messageId !== undefined, 'Thread key or message id required');
const ColloquioTopicSchema = zod_1.z.strictObject({
    subject: zod_1.z.string().trim().min(1).max(exports.COLLOQUIO_TOPIC_SUBJECT_MAX),
    excerpt: zod_1.z.string().trim().min(1).max(exports.COLLOQUIO_TOPIC_EXCERPT_MAX).optional(),
});
exports.ColloquioLinkRequestSchema = zod_1.z.strictObject({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    recipient: agent_channel_access_js_1.AgentChannelEmailAddressSchema,
    email: ColloquioEmailRefSchema,
    projectId: internal_project_create_js_1.ProjectIdSchema.optional(),
    topic: ColloquioTopicSchema,
});
exports.ColloquioLinkResponseSchema = zod_1.z.strictObject({
    url: zod_1.z.url().refine((url) => url.startsWith('https://'), 'https only'),
    code: zod_1.z.string().regex(exports.COLLOQUIO_LINK_CODE_PATTERN),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
});
exports.ColloquioLinkRefusalSchema = zod_1.z.strictObject({ error: zod_1.z.enum(exports.COLLOQUIO_LINK_REFUSALS) });
/**
 * Link «parlane a voce» for the referent of a mail: cap-email asks cap-colloquio.
 * cap-email calls with the bridge INTERNAL_SECRET_HEADER header (never a literal).
 * cap-colloquio compares `scope` with `params.agentId` and with the capability
 * context of the agent (sameCapabilityScope, R-33): the body is a declaration to
 * verify. A disabled or not installed capability answers `capability_disabled`;
 * a recipient that is not the referent of the project/thread answers
 * `recipient_not_referente`. The link is valid for COLLOQUIO_LINK_TTL_MS
 * (30 days, as DEV_DELIVERY_LINK_TTL_MS). For cap-email a refusal, a response that
 * does not parse or a network error mean only «no link»: the mail goes out unchanged.
 */
exports.colloquioLinkContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/colloquio/links',
    authType: 'secret',
    paramsSchema: zod_1.z.strictObject({ agentId: capability_call_context_js_1.CapabilityAgentScopeSchema.shape.agentId }),
    bodySchema: exports.ColloquioLinkRequestSchema,
    responseSchema: exports.ColloquioLinkResponseSchema,
    refusalSchema: exports.ColloquioLinkRefusalSchema,
};
//# sourceMappingURL=internal-colloquio-links.js.map