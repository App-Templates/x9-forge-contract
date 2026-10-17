import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { AgentChannelResourceCommandSchema, AgentChannelResourceIntentSchema, AgentChannelResourceResultSchema } from "../../agent/agent-channel-resource-operation.js";
import { sameAgentChannelAccessBinding } from "../../agent/agent-channel-access.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentChannelAccessParamsSchema } from "./internal-agent-channel-access.js";
import { ForgeAgentChannelAccessAuthorizationSchema } from "./forge-agent-channel-access.js";
/** Reuse the existing server session authority. Never parse a browser body into this trusted access argument. */
export function isAgentChannelResourceWithinForgeAuthorization(rawIntent, trustedAccess) {
    const intent = AgentChannelResourceIntentSchema.safeParse(rawIntent);
    const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    if (!intent.success || !access.success)
        return false;
    const scope = intent.data.scope;
    return access.data.role === 'sa' || (scope.ownerId === access.data.ownerId && scope.tenantId === access.data.tenantId);
}
export const ForgeAgentChannelResourceProgressParamsSchema = AgentChannelAccessParamsSchema.extend({ requestId: AgentManagementRequestIdSchema }).strict();
/** Resolve management/runtime/Vault identities before lookup; requestId alone never authorizes a receipt.
 * This checks route correlation, not the session authorization or current ownership after an await.
 */
export function isForgeAgentChannelResourceResultForRoute(rawResult, rawParams, trustedBinding) {
    const result = AgentChannelResourceResultSchema.safeParse(rawResult);
    const params = ForgeAgentChannelResourceProgressParamsSchema.safeParse(rawParams);
    if (!result.success || !params.success)
        return false;
    const actual = result.data.intent, route = params.data;
    return actual.identity.managementAgentId === route.agentId && actual.kind === route.kind
        && actual.command.requestId === route.requestId
        && sameAgentChannelAccessBinding({ scope: actual.scope, identity: actual.identity }, trustedBinding);
}
/** Browser -> existing Forge factory authority. Descriptors only: handlers must authenticate, resolve ownership,
 * persist the intent before effects, and revalidate after awaits. Provider failures are public fixed-code receipts.
 * The existing manual-token endpoint stays separate; these bodies contain no credentials or provider URLs.
 */
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
export const forgeAgentChannelResourceContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/:kind/resource',
    paramsSchema: AgentChannelAccessParamsSchema, bodySchema: AgentChannelResourceCommandSchema,
    responseSchema: AgentChannelResourceResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export const forgeAgentChannelResourceProgressContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/:kind/resource/operations/:requestId',
    paramsSchema: ForgeAgentChannelResourceProgressParamsSchema,
    responseSchema: AgentChannelResourceResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export function forgeAgentChannelResourcePath(agentId, kind) {
    const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
    return forgeAgentChannelResourceContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
export function forgeAgentChannelResourceProgressPath(agentId, kind, requestId) {
    const params = ForgeAgentChannelResourceProgressParamsSchema.parse({ agentId, kind, requestId });
    return forgeAgentChannelResourceProgressContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind)
        .replace(':requestId', encodeURIComponent(params.requestId));
}
//# sourceMappingURL=forge-agent-channel-resource.js.map