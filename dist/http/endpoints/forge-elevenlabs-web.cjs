"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeElevenLabsWebRevokeContract = exports.forgeElevenLabsWebInviteContract = exports.forgeElevenLabsWebInvitationsContract = exports.ForgeElevenLabsWebInvitationWriteResultSchema = exports.ForgeElevenLabsWebInvitationListResponseSchema = exports.forgeElevenLabsWebSessionContract = exports.forgeElevenLabsWebMetadataContract = exports.ForgeElevenLabsWebParamsSchema = void 0;
exports.forgeElevenLabsWebMetadataPath = forgeElevenLabsWebMetadataPath;
exports.forgeElevenLabsWebSessionPath = forgeElevenLabsWebSessionPath;
exports.isElevenLabsWebBrowserRequestForLink = isElevenLabsWebBrowserRequestForLink;
exports.isElevenLabsWebInvitationWithinForgeAuthorization = isElevenLabsWebInvitationWithinForgeAuthorization;
exports.projectForgeElevenLabsWebInvitations = projectForgeElevenLabsWebInvitations;
exports.isForgeElevenLabsWebInvitationResultForDraft = isForgeElevenLabsWebInvitationResultForDraft;
exports.forgeElevenLabsWebInvitationsPath = forgeElevenLabsWebInvitationsPath;
exports.forgeElevenLabsWebRevokePath = forgeElevenLabsWebRevokePath;
const zod_1 = require("zod");
const web_browser_js_1 = require("../../capability/agent-elevenlabs/web-browser.cjs");
exports.ForgeElevenLabsWebParamsSchema = zod_1.z.object({
    linkId: web_browser_js_1.ElevenLabsWebBrowserRequestSchema.shape.linkId,
}).strict();
/** Optional session permits only an explicitly public door. Owner/invited access requires
 * a freshly revalidated server Clerk session and current server policy on every request.
 * These descriptors do not authenticate a caller or accept browser authorization evidence.
 */
const browserAccess = {
    authentication: 'optional-forge-session',
    authorization: 'server-web-policy',
    cacheControl: 'no-store',
};
exports.forgeElevenLabsWebMetadataContract = {
    ...browserAccess, method: 'GET', path: '/api/parla/:linkId',
    paramsSchema: exports.ForgeElevenLabsWebParamsSchema,
    responseSchema: web_browser_js_1.ElevenLabsWebBrowserMetadataSchema,
    errorResponseSchema: web_browser_js_1.ElevenLabsWebBrowserErrorResponseSchema,
};
exports.forgeElevenLabsWebSessionContract = {
    ...browserAccess, method: 'POST', path: '/api/parla/:linkId/session',
    paramsSchema: exports.ForgeElevenLabsWebParamsSchema,
    bodySchema: web_browser_js_1.ElevenLabsWebBrowserRequestSchema,
    responseSchema: web_browser_js_1.ElevenLabsWebBrowserSessionSchema,
    errorResponseSchema: web_browser_js_1.ElevenLabsWebBrowserErrorResponseSchema,
};
function webPath(template, linkId) {
    const params = exports.ForgeElevenLabsWebParamsSchema.parse({ linkId });
    return template.replace(':linkId', encodeURIComponent(params.linkId));
}
function forgeElevenLabsWebMetadataPath(linkId) {
    return webPath(exports.forgeElevenLabsWebMetadataContract.path, linkId);
}
function forgeElevenLabsWebSessionPath(linkId) {
    return webPath(exports.forgeElevenLabsWebSessionContract.path, linkId);
}
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
function isElevenLabsWebBrowserRequestForLink(rawRequest, rawLinkId) {
    const request = web_browser_js_1.ElevenLabsWebBrowserRequestSchema.safeParse(rawRequest);
    const params = exports.ForgeElevenLabsWebParamsSchema.safeParse({ linkId: rawLinkId });
    if (!request.success || !params.success)
        return false;
    return request.data.linkId === params.data.linkId; // guard:browser-path-link
}
const web_invitations_js_1 = require("../../capability/agent-elevenlabs/web-invitations.cjs");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Browser metadata only. Unavailable cannot masquerade as a successfully observed empty list. */
exports.ForgeElevenLabsWebInvitationListResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({ status: zod_1.z.literal('available'), version: web_invitations_js_1.ElevenLabsWebInvitationListSchema.shape.version,
        observedAt: web_invitations_js_1.ElevenLabsWebInvitationListSchema.shape.observedAt,
        entries: zod_1.z.array(web_invitations_js_1.ElevenLabsWebPublicInvitationSchema).max(512) }).strict(),
    zod_1.z.object({ status: zod_1.z.literal('unavailable') }).strict(),
]);
/** Receipt correlation only: this never proves an authenticated session or grants a provider connection. */
exports.ForgeElevenLabsWebInvitationWriteResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: web_invitations_js_1.ElevenLabsWebInviteDraftSchema.shape.requestId, replayed: zod_1.z.boolean(),
    version: web_invitations_js_1.ElevenLabsWebInvitationListSchema.shape.version, invitation: web_invitations_js_1.ElevenLabsWebPublicInvitationSchema,
}).strict().refine(result => result.invitation.revision === result.version, { message: 'Receipt and changed record revisions must agree' });
/** Trusted existing Forge session, freshly resolved full binding and source only; never browser authority. */
function isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId) {
    const list = web_invitations_js_1.ElevenLabsWebInvitationListSchema.safeParse(rawList), access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = internal_agents_management_js_1.AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!list.success || !access.success || !params.success)
        return false; // guard:http-invite-auth-parse
    if (list.data.identity.managementAgentId !== params.data.agentId)
        return false; // guard:http-invite-management
    return access.data.role === 'sa' // guard:http-invite-sa
        || (list.data.scope.ownerId === access.data.ownerId && list.data.scope.tenantId === access.data.tenantId); // guard:http-invite-owner
}
/** Null means the producer must return an error/unavailable state, never an invented empty source. */
function projectForgeElevenLabsWebInvitations(rawList, trustedAccess, requestedAgentId, now) {
    if (!isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId))
        return null; // guard:http-invite-project-auth
    const list = web_invitations_js_1.ElevenLabsWebInvitationListSchema.parse(rawList);
    const binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.parse({ scope: list.scope, identity: list.identity });
    const entries = (0, web_invitations_js_1.projectElevenLabsWebInvitationList)(list, binding, now);
    if (entries === null)
        return null; // guard:http-invite-project-source
    return exports.ForgeElevenLabsWebInvitationListResponseSchema.parse({ status: 'available', version: list.version, observedAt: list.observedAt, entries }); // guard:http-invite-project-filter
}
function isForgeElevenLabsWebInvitationResultForDraft(action, rawDraft, rawResult) {
    if (action !== 'invite' && action !== 'revoke')
        return false; // guard:http-invite-action
    const draft = (action === 'invite' ? web_invitations_js_1.ElevenLabsWebInviteDraftSchema : web_invitations_js_1.ElevenLabsWebRevokeDraftSchema).safeParse(rawDraft);
    const result = exports.ForgeElevenLabsWebInvitationWriteResultSchema.safeParse(rawResult);
    if (!draft.success || !result.success)
        return false; // guard:http-invite-result-parse
    const intent = draft.data, actual = result.data;
    if (actual.requestId !== intent.requestId || actual.version !== intent.expectedVersion + 1)
        return false; // guard:http-invite-result-correlation
    if ('email' in intent)
        return actual.invitation.email === intent.email
            && (actual.invitation.status === 'active' || actual.invitation.status === 'pending-registration'); // guard:http-invite-result-created
    return actual.invitation.invitationId === intent.invitationId && actual.invitation.status === 'revoked'; // guard:http-invite-result-revoked
}
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
exports.forgeElevenLabsWebInvitationsContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/web/invitations',
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, responseSchema: exports.ForgeElevenLabsWebInvitationListResponseSchema,
    errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeElevenLabsWebInviteContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/web/invitations',
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, bodySchema: web_invitations_js_1.ElevenLabsWebInviteDraftSchema,
    responseSchema: exports.ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
exports.forgeElevenLabsWebRevokeContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/web/invitations/revoke',
    paramsSchema: internal_agents_management_js_1.AgentManagementParamsSchema, bodySchema: web_invitations_js_1.ElevenLabsWebRevokeDraftSchema,
    responseSchema: exports.ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema,
};
function invitationPath(template, agentId) {
    return template.replace(':agentId', encodeURIComponent(internal_agents_management_js_1.AgentManagementParamsSchema.parse({ agentId }).agentId));
}
function forgeElevenLabsWebInvitationsPath(agentId) { return invitationPath(exports.forgeElevenLabsWebInvitationsContract.path, agentId); }
function forgeElevenLabsWebRevokePath(agentId) { return invitationPath(exports.forgeElevenLabsWebRevokeContract.path, agentId); }
//# sourceMappingURL=forge-elevenlabs-web.js.map