import { z } from 'zod';
import {
  ElevenLabsWebBrowserRequestSchema, ElevenLabsWebBrowserSessionSchema,
  ElevenLabsWebBrowserMetadataSchema, ElevenLabsWebBrowserErrorResponseSchema,
} from '../../capability/agent-elevenlabs/web-browser.js';

export const ForgeElevenLabsWebParamsSchema = z.object({
  linkId: ElevenLabsWebBrowserRequestSchema.shape.linkId,
}).strict();

/** Optional session permits only an explicitly public door. Owner/invited access requires
 * a freshly revalidated server Clerk session and current server policy on every request.
 * These descriptors do not authenticate a caller or accept browser authorization evidence.
 */
const browserAccess = {
  authentication: 'optional-forge-session' as const,
  authorization: 'server-web-policy' as const,
  cacheControl: 'no-store' as const,
};
export const forgeElevenLabsWebMetadataContract = {
  ...browserAccess, method: 'GET' as const, path: '/api/parla/:linkId' as const,
  paramsSchema: ForgeElevenLabsWebParamsSchema,
  responseSchema: ElevenLabsWebBrowserMetadataSchema,
  errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
} as const;
export const forgeElevenLabsWebSessionContract = {
  ...browserAccess, method: 'POST' as const, path: '/api/parla/:linkId/session' as const,
  paramsSchema: ForgeElevenLabsWebParamsSchema,
  bodySchema: ElevenLabsWebBrowserRequestSchema,
  responseSchema: ElevenLabsWebBrowserSessionSchema,
  errorResponseSchema: ElevenLabsWebBrowserErrorResponseSchema,
} as const;
function webPath(template: string, linkId: string): string {
  const params = ForgeElevenLabsWebParamsSchema.parse({ linkId });
  return template.replace(':linkId', encodeURIComponent(params.linkId));
}
export function forgeElevenLabsWebMetadataPath(linkId: string): string {
  return webPath(forgeElevenLabsWebMetadataContract.path, linkId);
}
export function forgeElevenLabsWebSessionPath(linkId: string): string {
  return webPath(forgeElevenLabsWebSessionContract.path, linkId);
}
/** Strict path/body correlation only; no viewer, scope, policy or permission is inferred. */
export function isElevenLabsWebBrowserRequestForLink(rawRequest: unknown, rawLinkId: unknown): boolean {
  const request = ElevenLabsWebBrowserRequestSchema.safeParse(rawRequest);
  const params = ForgeElevenLabsWebParamsSchema.safeParse({ linkId: rawLinkId });
  if (!request.success || !params.success) return false;
  return request.data.linkId === params.data.linkId; // guard:browser-path-link
}
import { ElevenLabsWebInvitationListSchema, ElevenLabsWebPublicInvitationSchema,
  ElevenLabsWebInviteDraftSchema, ElevenLabsWebRevokeDraftSchema, projectElevenLabsWebInvitationList } from '../../capability/agent-elevenlabs/web-invitations.js';
import { AgentChannelAccessBindingSchema } from '../../agent/agent-channel-access.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { ForgeAgentChannelAccessAuthorizationSchema } from './forge-agent-channel-access.js';
import { AgentManagementParamsSchema } from './internal-agents-management.js';

/** Browser metadata only. Unavailable cannot masquerade as a successfully observed empty list. */
export const ForgeElevenLabsWebInvitationListResponseSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('available'), version: ElevenLabsWebInvitationListSchema.shape.version,
    observedAt: ElevenLabsWebInvitationListSchema.shape.observedAt,
    entries: z.array(ElevenLabsWebPublicInvitationSchema).max(512) }).strict(),
  z.object({ status: z.literal('unavailable') }).strict(),
]);
export type ForgeElevenLabsWebInvitationListResponse = z.infer<typeof ForgeElevenLabsWebInvitationListResponseSchema>;
/** Receipt correlation only: this never proves an authenticated session or grants a provider connection. */
export const ForgeElevenLabsWebInvitationWriteResultSchema = z.object({
  ok: z.literal(true), requestId: ElevenLabsWebInviteDraftSchema.shape.requestId, replayed: z.boolean(),
  version: ElevenLabsWebInvitationListSchema.shape.version, invitation: ElevenLabsWebPublicInvitationSchema,
}).strict().refine(result => result.invitation.revision === result.version, { message: 'Receipt and changed record revisions must agree' });
export type ForgeElevenLabsWebInvitationWriteResult = z.infer<typeof ForgeElevenLabsWebInvitationWriteResultSchema>;

/** Trusted existing Forge session, freshly resolved full binding and source only; never browser authority. */
export function isElevenLabsWebInvitationWithinForgeAuthorization(rawList: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean {
  const list = ElevenLabsWebInvitationListSchema.safeParse(rawList), access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
  const params = AgentManagementParamsSchema.safeParse({ agentId: requestedAgentId });
  if (!list.success || !access.success || !params.success) return false; // guard:http-invite-auth-parse
  if (list.data.identity.managementAgentId !== params.data.agentId) return false; // guard:http-invite-management
  return access.data.role === 'sa' // guard:http-invite-sa
    || (list.data.scope.ownerId === access.data.ownerId && list.data.scope.tenantId === access.data.tenantId); // guard:http-invite-owner
}
/** Null means the producer must return an error/unavailable state, never an invented empty source. */
export function projectForgeElevenLabsWebInvitations(rawList: unknown, trustedAccess: unknown, requestedAgentId: unknown, now: number): ForgeElevenLabsWebInvitationListResponse | null {
  if (!isElevenLabsWebInvitationWithinForgeAuthorization(rawList, trustedAccess, requestedAgentId)) return null; // guard:http-invite-project-auth
  const list = ElevenLabsWebInvitationListSchema.parse(rawList);
  const binding = AgentChannelAccessBindingSchema.parse({ scope: list.scope, identity: list.identity });
  const entries = projectElevenLabsWebInvitationList(list, binding, now);
  if (entries === null) return null; // guard:http-invite-project-source
  return ForgeElevenLabsWebInvitationListResponseSchema.parse({ status: 'available', version: list.version, observedAt: list.observedAt, entries }); // guard:http-invite-project-filter
}
export function isForgeElevenLabsWebInvitationResultForDraft(action: unknown, rawDraft: unknown, rawResult: unknown): boolean {
  if (action !== 'invite' && action !== 'revoke') return false; // guard:http-invite-action
  const draft = (action === 'invite' ? ElevenLabsWebInviteDraftSchema : ElevenLabsWebRevokeDraftSchema).safeParse(rawDraft);
  const result = ForgeElevenLabsWebInvitationWriteResultSchema.safeParse(rawResult);
  if (!draft.success || !result.success) return false; // guard:http-invite-result-parse
  const intent = draft.data, actual = result.data;
  if (actual.requestId !== intent.requestId || actual.version !== intent.expectedVersion + 1) return false; // guard:http-invite-result-correlation
  if ('email' in intent) return actual.invitation.email === intent.email
    && (actual.invitation.status === 'active' || actual.invitation.status === 'pending-registration'); // guard:http-invite-result-created
  return actual.invitation.invitationId === intent.invitationId && actual.invitation.status === 'revoked'; // guard:http-invite-result-revoked
}

const browserAuthentication = { authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const };
export const forgeElevenLabsWebInvitationsContract = {
  ...browserAuthentication, method: 'GET' as const, path: '/api/agents/:agentId/channels/web/invitations' as const,
  paramsSchema: AgentManagementParamsSchema, responseSchema: ForgeElevenLabsWebInvitationListResponseSchema,
  errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeElevenLabsWebInviteContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/web/invitations' as const,
  paramsSchema: AgentManagementParamsSchema, bodySchema: ElevenLabsWebInviteDraftSchema,
  responseSchema: ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeElevenLabsWebRevokeContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/web/invitations/revoke' as const,
  paramsSchema: AgentManagementParamsSchema, bodySchema: ElevenLabsWebRevokeDraftSchema,
  responseSchema: ForgeElevenLabsWebInvitationWriteResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
function invitationPath(template: string, agentId: string): string {
  return template.replace(':agentId', encodeURIComponent(AgentManagementParamsSchema.parse({ agentId }).agentId));
}
export function forgeElevenLabsWebInvitationsPath(agentId: string): string { return invitationPath(forgeElevenLabsWebInvitationsContract.path, agentId); }
export function forgeElevenLabsWebRevokePath(agentId: string): string { return invitationPath(forgeElevenLabsWebRevokeContract.path, agentId); }
