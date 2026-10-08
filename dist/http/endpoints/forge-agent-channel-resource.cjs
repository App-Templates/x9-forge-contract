"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeAgentChannelResourceProgressContract = exports.forgeAgentChannelResourceContract = exports.ForgeAgentChannelResourceProgressParamsSchema = void 0;
exports.isAgentChannelResourceWithinForgeAuthorization = isAgentChannelResourceWithinForgeAuthorization;
exports.isForgeAgentChannelResourceResultForRoute = isForgeAgentChannelResourceResultForRoute;
exports.forgeAgentChannelResourcePath = forgeAgentChannelResourcePath;
exports.forgeAgentChannelResourceProgressPath = forgeAgentChannelResourceProgressPath;
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const agent_channel_resource_operation_js_1 = require("../../agent/agent-channel-resource-operation.cjs");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agent_channel_access_js_1 = require("./internal-agent-channel-access.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
/** Reuse the existing server session authority. Never parse a browser body into this trusted access argument. */
function isAgentChannelResourceWithinForgeAuthorization(rawIntent, trustedAccess) {
    const intent = agent_channel_resource_operation_js_1.AgentChannelResourceIntentSchema.safeParse(rawIntent);
    const access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    if (!intent.success || !access.success)
        return false;
    const scope = intent.data.scope;
    return access.data.role === 'sa' || (scope.ownerId === access.data.ownerId && scope.tenantId === access.data.tenantId);
}
exports.ForgeAgentChannelResourceProgressParamsSchema = internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema.extend({ requestId: agent_management_js_1.AgentManagementRequestIdSchema }).strict();
/** Resolve management/runtime/Vault identities before lookup; requestId alone never authorizes a receipt.
 * This checks route correlation, not the session authorization or current ownership after an await.
 */
function isForgeAgentChannelResourceResultForRoute(rawResult, rawParams, trustedBinding) {
    const result = agent_channel_resource_operation_js_1.AgentChannelResourceResultSchema.safeParse(rawResult);
    const params = exports.ForgeAgentChannelResourceProgressParamsSchema.safeParse(rawParams);
    if (!result.success || !params.success)
        return false;
    const actual = result.data.intent, route = params.data;
    return actual.identity.managementAgentId === route.agentId && actual.kind === route.kind
        && actual.command.requestId === route.requestId
        && (0, agent_channel_access_js_1.sameAgentChannelAccessBinding)({ scope: actual.scope, identity: actual.identity }, trustedBinding);
}
/** Browser -> existing Forge factory authority. Descriptors only: handlers must authenticate, resolve ownership,
 * persist the intent before effects, and revalidate after awaits. Provider failures are public fixed-code receipts.
 * The existing manual-token endpoint stays separate; these bodies contain no credentials or provider URLs.
 */
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
exports.forgeAgentChannelResourceContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/:kind/resource',
    paramsSchema: internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema, bodySchema: agent_channel_resource_operation_js_1.AgentChannelResourceCommandSchema,
    responseSchema: agent_channel_resource_operation_js_1.AgentChannelResourceResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeAgentChannelResourceProgressContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/:kind/resource/operations/:requestId',
    paramsSchema: exports.ForgeAgentChannelResourceProgressParamsSchema,
    responseSchema: agent_channel_resource_operation_js_1.AgentChannelResourceResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function forgeAgentChannelResourcePath(agentId, kind) {
    const params = internal_agent_channel_access_js_1.AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return exports.forgeAgentChannelResourceContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
function forgeAgentChannelResourceProgressPath(agentId, kind, requestId) {
    const params = exports.ForgeAgentChannelResourceProgressParamsSchema.parse({ agentId, kind, requestId });
    return exports.forgeAgentChannelResourceProgressContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind)
        .replace(':requestId', encodeURIComponent(params.requestId));
}
//# sourceMappingURL=forge-agent-channel-resource.js.map