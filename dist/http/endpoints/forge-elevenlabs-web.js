import { z } from 'zod';
import { ElevenLabsWebBrowserRequestSchema, ElevenLabsWebBrowserSessionSchema, ElevenLabsWebBrowserMetadataSchema, ElevenLabsWebBrowserErrorResponseSchema, } from "../../capability/agent-elevenlabs/web-browser.js";
export const ForgeElevenLabsWebParamsSchema = z.object({
    linkId: ElevenLabsWebBrowserRequestSchema.shape.linkId,
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
export const forgeElevenLabsWebMetadataContract = {
    ...browserAccess, method: 'GET', path: '/api/parla/:linkId',
    paramsSchema: ForgeElevenLabsWebParamsSchema,
    responseSchema: ElevenLabsWebBrowserMetadataSchema,
    errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
};
export const forgeElevenLabsWebSessionContract = {
    ...browserAccess, method: 'POST', path: '/api/parla/:linkId/session',
    paramsSchema: ForgeElevenLabsWebParamsSchema,
    bodySchema: ElevenLabsWebBrowserRequestSchema,
    responseSchema: ElevenLabsWebBrowserSessionSchema,
    errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
};
function webPath(template, linkId) {
    const params = ForgeElevenLabsWebParamsSchema.parse({ linkId });
    return template.replace(':linkId', encodeURIComponent(params.linkId));
}
export function forgeElevenLabsWebMetadataPath(linkId) {
    return webPath(forgeElevenLabsWebMetadataContract.path, linkId);
}
export function forgeElevenLabsWebSessionPath(linkId) {
    return webPath(forgeElevenLabsWebSessionContract.path, linkId);
}
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export function isElevenLabsWebBrowserRequestForLink(rawRequest, rawLinkId) {
    const request = ElevenLabsWebBrowserRequestSchema.safeParse(rawRequest);
    const params = ForgeElevenLabsWebParamsSchema.safeParse({ linkId: rawLinkId });
    if (!request.success || !params.success)
        return false;
    return request.data.linkId === params.data.linkId; // guard:browser-path-link
}
import { ElevenLabsWebInvitationListSchema, ElevenLabsWebPublicInvitationSchema, ElevenLabsWebInviteDraftSchema, ElevenLabsWebRevokeDraftSchema, projectElevenLabsWebInvitationList } from "../../capability/agent-elevenlabs/web-invitations.js";
import { AgentChannelAccessBindingSchema } from "../../agent/agent-channel-access.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { ForgeAgentChannelAccessAuthorizationSchema } from "./forge-agent-channel-access.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/** Browser metadata only. Unavailable cannot masquerade as a successfully observed empty list. */
export const ForgeElevenLabsWebInvitationListResponseSchema = z.discriminatedUnion('status', [
    z.object({ status: z.literal('available'), version: ElevenLabsWebInvitationListSchema.shape.version,
        observedAt: ElevenLabsWebInvitationListSchema.shape.observedAt,
        entries: z.array(ElevenLabsWebPublicInvitationSchema).max(512) }).strict(),
    z.object({ status: z.literal('unavailable') }).strict(),
]);
/** Receipt correlation only: this never proves an authenticated session or grants a provider connection. */
export const ForgeElevenLabsWebInvitationWriteResultSchema = z.object({
    ok: z.literal(true), requestId: ElevenLabsWebInviteDraftSchema.shape.requestId, replayed: z.boolean(),
    version: ElevenLabsWebInvitationListSchema.shape.version, invitation: ElevenLabsWebPublicInvitationSchema,
}).strict().refine(result => result.invitation.revision === result.version, { message: 'Receipt and changed record revisions must agree' });
/** Trusted existing Forge session, freshly resolved full binding and source only; never browser authority. */
export function isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId) {
    const list = ElevenLabsWebInvitationListSchema.safeParse(rawList), access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
    const params = AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!list.success || !access.success || !params.success)
        return false; // guard:http-invite-auth-parse
    if (list.data.identity.managementAgentId !== params.data.agentId)
        return false; // guard:http-invite-management
    return access.data.role === 'sa' // guard:http-invite-sa
        || (list.data.scope.ownerId === access.data.ownerId && list.data.scope.tenantId === access.data.tenantId); // guard:http-invite-owner
}
/** Null means the producer must return an error/unavailable state, never an invented empty source. */
export function projectForgeElevenLabsWebInvitations(rawList, trustedAccess, requestedAgentId, now) {
    if (!isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId))
        return null; // guard:http-invite-project-auth
    const list = ElevenLabsWebInvitationListSchema.parse(rawList);
    const binding = AgentChannelAccessBindingSchema.parse({ scope: list.scope, identity: list.identity });
    const entries = projectElevenLabsWebInvitationList(list, binding, now);
    if (entries === null)
        return null; // guard:http-invite-project-source
    return ForgeElevenLabsWebInvitationListResponseSchema.parse({ status: 'available', version: list.version, observedAt: list.observedAt, entries }); // guard:http-invite-project-filter
}
export function isForgeElevenLabsWebInvitationResultForDraft(action, rawDraft, rawResult) {
    if (action !== 'invite' && action !== 'revoke')
        return false; // guard:http-invite-action
    const draft = (action === 'invite' ? ElevenLabsWebInviteDraftSchema : ElevenLabsWebRevokeDraftSchema).safeParse(rawDraft);
    const result = ForgeElevenLabsWebInvitationWriteResultSchema.safeParse(rawResult);
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
export const forgeElevenLabsWebInvitationsContract = {
    ...browserAuthentication, method: 'GET', path: '/api/agents/:agentId/channels/web/invitations',
    paramsSchema: AgentManagementParamsSchema, responseSchema: ForgeElevenLabsWebInvitationListResponseSchema,
    errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export const forgeElevenLabsWebInviteContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/web/invitations',
    paramsSchema: AgentManagementParamsSchema, bodySchema: ElevenLabsWebInviteDraftSchema,
    responseSchema: ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
export const forgeElevenLabsWebRevokeContract = {
    ...browserAuthentication, method: 'POST', path: '/api/agents/:agentId/channels/web/invitations/revoke',
    paramsSchema: AgentManagementParamsSchema, bodySchema: ElevenLabsWebRevokeDraftSchema,
    responseSchema: ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
};
function invitationPath(template, agentId) {
    return template.replace(':agentId', encodeURIComponent(AgentManagementParamsSchema.parse({ agentId }).agentId));
}
export function forgeElevenLabsWebInvitationsPath(agentId) { return invitationPath(forgeElevenLabsWebInvitationsContract.path, agentId); }
export function forgeElevenLabsWebRevokePath(agentId) { return invitationPath(forgeElevenLabsWebRevokeContract.path, agentId); }
//# sourceMappingURL=forge-elevenlabs-web.js.map