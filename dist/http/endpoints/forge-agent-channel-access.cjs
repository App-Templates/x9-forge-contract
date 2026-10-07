"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeAgentChannelAccessApplyContract = exports.forgeAgentChannelAccessPreviewContract = exports.forgeAgentChannelAccessSnapshotContract = exports.ForgeAgentChannelAccessPreviewSchema = exports.ForgeAgentChannelAccessDraftSchema = exports.ForgeAgentChannelAccessAuthorizationSchema = void 0;
exports.isAgentChannelAccessWithinForgeAuthorization = isAgentChannelAccessWithinForgeAuthorization;
exports.isForgeAgentChannelAccessDraftForSnapshot = isForgeAgentChannelAccessDraftForSnapshot;
exports.isForgeAgentChannelAccessPreviewForDraft = isForgeAgentChannelAccessPreviewForDraft;
exports.forgeAgentChannelAccessPath = forgeAgentChannelAccessPath;
exports.forgeAgentChannelAccessPreviewPath = forgeAgentChannelAccessPreviewPath;
exports.forgeAgentChannelAccessApplyPath = forgeAgentChannelAccessApplyPath;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../../capability/ricerca/agent-config.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_channel_configuration_js_1 = require("../../agent/agent-channel-configuration.cjs");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agent_channel_access_js_1 = require("./internal-agent-channel-access.cjs");
/** Server-derived session access, never accepted as a browser body or authorization header. */
exports.ForgeAgentChannelAccessAuthorizationSchema = zod_1.z.discriminatedUnion('role', [
    zod_1.z.object({ role: zod_1.z.literal('sa') }).strict(),
    zod_1.z.object({ role: zod_1.z.literal('owner'), ownerId: agent_identity_js_1.OwnerIdSchema, tenantId: capability_call_context_js_1.CapabilityAgentScopeSchema.shape.tenantId }).strict(),
]);
function isAgentChannelAccessWithinForgeAuthorization(rawSnapshot, trustedAccess) {
    const snapshot = agent_channel_access_requests_js_1.AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot), access = exports.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    if (!snapshot.success || !access.success)
        return false;
    const scope = snapshot.data.configuration.scope;
    return access.data.role === 'sa' || (scope.ownerId === access.data.ownerId && scope.tenantId === access.data.tenantId);
}
/** Unsaved door intent. The existing Forge writer assigns the next version after CAS;
 * no URL, resource, credentials or client-declared identity is part of this body.
 */
exports.ForgeAgentChannelAccessDraftSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, expectedDesiredVersion: agent_config_js_1.AgentConfigVersionSchema,
    expectedAppliedVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(), desiredState: agent_channel_configuration_js_1.AgentChannelDesiredStateSchema,
    policy: agent_channel_access_js_1.AgentChannelAccessPolicySchema, requestChanges: agent_channel_access_requests_js_1.AgentChannelAccessRequestChangesSchema.nullable(),
}).strict().refine(draft => draft.expectedAppliedVersion === null || draft.expectedAppliedVersion <= draft.expectedDesiredVersion, { message: 'Expected applied version cannot exceed the saved desired version' });
/** Pre-save validation against the resolved server snapshot. Producers also check scope, authority and freshness. */
function isForgeAgentChannelAccessDraftForSnapshot(rawDraft, rawSnapshot) {
    const draft = exports.ForgeAgentChannelAccessDraftSchema.safeParse(rawDraft), snapshot = agent_channel_access_requests_js_1.AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot);
    if (!draft.success || !snapshot.success)
        return false;
    const intent = draft.data, current = snapshot.data, config = current.configuration;
    if (intent.policy.kind !== config.kind || intent.expectedDesiredVersion !== config.desired.version
        || intent.expectedAppliedVersion !== (config.applied?.version ?? null))
        return false;
    const changes = intent.requestChanges;
    if (changes === null)
        return true;
    if (current.requests.status !== 'available' || current.requests.queue.version !== changes.expectedQueueVersion)
        return false;
    const queue = current.requests.queue;
    return changes.operations.every(operation => {
        const request = queue.requests.find(entry => entry.requestId === operation.requestId);
        if (!request)
            return false;
        if (operation.action === 'ignore')
            return true;
        return intent.policy.kind === 'telegram' && intent.policy.chats.some(chat => chat.chatId === request.chatId && chat.type === request.type);
    });
}
/** Preview echoes the draft alongside actual evidence; it cannot assert a successful application. */
exports.ForgeAgentChannelAccessPreviewSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, draft: exports.ForgeAgentChannelAccessDraftSchema, snapshot: agent_channel_access_requests_js_1.AgentChannelAccessSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId && isForgeAgentChannelAccessDraftForSnapshot(preview.draft, preview.snapshot), { message: 'Preview must match its draft and the current scoped door version' });
function isForgeAgentChannelAccessPreviewForDraft(rawDraft, rawPreview) {
    const draft = exports.ForgeAgentChannelAccessDraftSchema.safeParse(rawDraft), preview = exports.ForgeAgentChannelAccessPreviewSchema.safeParse(rawPreview);
    return draft.success && preview.success && JSON.stringify(draft.data) === JSON.stringify(preview.data.draft);
}
/** Browser -> Forge. Existing session and ownership guards install the handlers; no S2S header is exposed. */
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
exports.forgeAgentChannelAccessSnapshotContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/:kind/access',
    paramsSchema: internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema, responseSchema: agent_channel_access_requests_js_1.AgentChannelAccessSnapshotSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeAgentChannelAccessPreviewContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/:kind/access/preview',
    paramsSchema: internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema, bodySchema: exports.ForgeAgentChannelAccessDraftSchema,
    responseSchema: exports.ForgeAgentChannelAccessPreviewSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeAgentChannelAccessApplyContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/:kind/access/apply',
    paramsSchema: internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema, bodySchema: exports.ForgeAgentChannelAccessDraftSchema,
    responseSchema: agent_channel_access_requests_js_1.AgentChannelAccessApplyResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function doorPath(template, agentId, kind) {
    const params = internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return template.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
function forgeAgentChannelAccessPath(agentId, kind) { return doorPath(exports.forgeAgentChannelAccessSnapshotContract.path, agentId, kind); }
function forgeAgentChannelAccessPreviewPath(agentId, kind) { return doorPath(exports.forgeAgentChannelAccessPreviewContract.path, agentId, kind); }
function forgeAgentChannelAccessApplyPath(agentId, kind) { return doorPath(exports.forgeAgentChannelAccessApplyContract.path, agentId, kind); }
//# sourceMappingURL=forge-agent-channel-access.js.map