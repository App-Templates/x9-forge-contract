"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeAgentPhoneApplyContract = exports.forgeAgentPhonePreviewContract = exports.forgeAgentPhoneSnapshotContract = exports.ForgeAgentPhonePreviewSchema = exports.ForgeAgentPhoneDraftSchema = void 0;
exports.isAgentPhoneWithinForgeAuthorization = isAgentPhoneWithinForgeAuthorization;
exports.isForgeAgentPhoneDraftForSnapshot = isForgeAgentPhoneDraftForSnapshot;
exports.isForgeAgentPhonePreviewForDraft = isForgeAgentPhonePreviewForDraft;
exports.forgeAgentPhonePath = forgeAgentPhonePath;
exports.forgeAgentPhonePreviewPath = forgeAgentPhonePreviewPath;
exports.forgeAgentPhoneApplyPath = forgeAgentPhoneApplyPath;
const zod_1 = require("zod");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
const agent_phone_channel_js_1 = require("../../agent/agent-phone-channel.cjs");
const agent_phone_commands_js_1 = require("../../agent/agent-phone-commands.cjs");
const internal_agent_phone_channel_js_1 = require("./internal-agent-phone-channel.cjs");
/** Authority comes from the existing server session guard; this value is never a browser input. */
function isAgentPhoneWithinForgeAuthorization(rawSnapshot, trustedAccess, requestedAgentId) {
    const snapshot = agent_phone_commands_js_1.AgentPhoneSnapshotSchema.safeParse(rawSnapshot), access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = internal_agent_phone_channel_js_1.AgentPhoneParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!snapshot.success || !access.success || !params.success)
        return false;
    const config = snapshot.data.configuration;
    if (config.identity.managementAgentId !== params.data.agentId)
        return false; // guard:forge-agent
    return access.data.role === 'sa' || (config.scope.ownerId === access.data.ownerId && config.scope.tenantId === access.data.tenantId);
}
/** Phone door only: no voice writer, recipient number, contact copy, provider or client authority. */
exports.ForgeAgentPhoneDraftSchema = zod_1.z.object({
    requestId: forge_agent_channel_access_js_1.ForgeAgentChannelAccessDraftSchema.shape.requestId,
    expectedDesiredVersion: forge_agent_channel_access_js_1.ForgeAgentChannelAccessDraftSchema.shape.expectedDesiredVersion,
    expectedAppliedVersion: forge_agent_channel_access_js_1.ForgeAgentChannelAccessDraftSchema.shape.expectedAppliedVersion,
    desiredState: forge_agent_channel_access_js_1.ForgeAgentChannelAccessDraftSchema.shape.desiredState, policy: agent_phone_channel_js_1.AgentPhoneAccessPolicySchema,
    expectedNumberVersion: agent_phone_commands_js_1.AgentPhoneApplyCommandSchema.shape.expectedNumberVersion,
    expectedRoutingIdentity: agent_phone_commands_js_1.AgentPhoneApplyCommandSchema.shape.expectedRoutingIdentity,
}).strict().refine(draft => draft.expectedAppliedVersion === null || draft.expectedAppliedVersion <= draft.expectedDesiredVersion, { message: 'Expected applied version cannot exceed the saved desired version' });
/** CAS comparison only. Producers must additionally check authorization and fresh evidence before saving. */
function isForgeAgentPhoneDraftForSnapshot(rawDraft, rawSnapshot) {
    const draft = exports.ForgeAgentPhoneDraftSchema.safeParse(rawDraft), snapshot = agent_phone_commands_js_1.AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
    if (!draft.success || !snapshot.success)
        return false;
    const intent = draft.data, config = snapshot.data.configuration;
    if (snapshot.data.agentArchived)
        return false; // guard:draft-archived
    if (intent.expectedDesiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null))
        return false; // guard:draft-versions
    if (intent.expectedNumberVersion !== config.sharedNumber.version || intent.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null))
        return false; // guard:draft-routing
    return true;
}
/** Unsaved intent alongside actual evidence; a preview never asserts that Apply succeeded. */
exports.ForgeAgentPhonePreviewSchema = zod_1.z.object({
    requestId: exports.ForgeAgentPhoneDraftSchema.shape.requestId, draft: exports.ForgeAgentPhoneDraftSchema, snapshot: agent_phone_commands_js_1.AgentPhoneSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId && isForgeAgentPhoneDraftForSnapshot(preview.draft, preview.snapshot), { message: 'Preview must echo its exact draft and current phone versions' });
function isForgeAgentPhonePreviewForDraft(rawDraft, rawPreview, trustedAccess, requestedAgentId, now, maximumAgeMs = 60_000) {
    const draft = exports.ForgeAgentPhoneDraftSchema.safeParse(rawDraft), preview = exports.ForgeAgentPhonePreviewSchema.safeParse(rawPreview);
    if (!draft.success || !preview.success)
        return false;
    const actual = preview.data;
    if (!isAgentPhoneWithinForgeAuthorization(actual.snapshot, trustedAccess, requestedAgentId))
        return false; // guard:preview-authority
    const config = actual.snapshot.configuration;
    if (!(0, agent_phone_commands_js_1.isAgentPhoneSnapshotCurrent)(actual.snapshot, { scope: config.scope, identity: config.identity }, now, maximumAgeMs))
        return false; // guard:preview-current
    return JSON.stringify(draft.data) === JSON.stringify(actual.draft);
}
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
exports.forgeAgentPhoneSnapshotContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/phone/access',
    paramsSchema: internal_agent_phone_channel_js_1.AgentPhoneParamsSchema, responseSchema: agent_phone_commands_js_1.AgentPhoneSnapshotSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeAgentPhonePreviewContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/phone/access/preview',
    paramsSchema: internal_agent_phone_channel_js_1.AgentPhoneParamsSchema, bodySchema: exports.ForgeAgentPhoneDraftSchema,
    responseSchema: exports.ForgeAgentPhonePreviewSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeAgentPhoneApplyContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/phone/access/apply',
    paramsSchema: internal_agent_phone_channel_js_1.AgentPhoneParamsSchema, bodySchema: exports.ForgeAgentPhoneDraftSchema,
    responseSchema: agent_phone_commands_js_1.AgentPhoneApplyResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function phonePath(template, agentId) {
    const params = internal_agent_phone_channel_js_1.AgentPhoneParamsSchema.parse({ agentId });
    return template.replace(':agentId', encodeURIComponent(params.agentId));
}
function forgeAgentPhonePath(agentId) { return phonePath(exports.forgeAgentPhoneSnapshotContract.path, agentId); }
function forgeAgentPhonePreviewPath(agentId) { return phonePath(exports.forgeAgentPhonePreviewContract.path, agentId); }
function forgeAgentPhoneApplyPath(agentId) { return phonePath(exports.forgeAgentPhoneApplyContract.path, agentId); }
//# sourceMappingURL=forge-agent-phone-channel.js.map