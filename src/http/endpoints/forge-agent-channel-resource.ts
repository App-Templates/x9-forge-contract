import type { z } from 'zod';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { AgentChannelResourceCommandSchema, AgentChannelResourceIntentSchema, AgentChannelResourceResultSchema } from '../../agent/agent-channel-resource-operation.js';
import { sameAgentChannelAccessBinding } from '../../agent/agent-channel-access.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { AgentChannelAccessParamsSchema } from './internal-agent-channel-access.js';
import { ForgeAgentChannelAccessAuthorizationSchema } from './forge-agent-channel-access.js';

/** Reuse the existing server session authority. Never parse a browser body into this trusted access argument. */
export function isAgentChannelResourceWithinForgeAuthorization(rawIntent: unknown, trustedAccess: unknown): boolean {
  const intent = AgentChannelResourceIntentSchema.safeParse(rawIntent);
  const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
  if (!intent.success || !access.success) return false;
  const scope = intent.data.scope;
  return access.data.role === 'sa' || (scope.ownerId === access.data.ownerId && scope.tenantId === access.data.tenantId);
}

export const ForgeAgentChannelResourceProgressParamsSchema = AgentChannelAccessParamsSchema.extend({ requestId: AgentManagementRequestIdSchema }).strict();
export type ForgeAgentChannelResourceProgressParams = z.infer<typeof ForgeAgentChannelResourceProgressParamsSchema>;

/** Resolve management/runtime/Vault identities before lookup; requestId alone never authorizes a receipt.
 * This checks route correlation, not the session authorization or current ownership after an await.
 */
export function isForgeAgentChannelResourceResultForRoute(rawResult: unknown, rawParams: unknown, trustedBinding: unknown): boolean {
  const result = AgentChannelResourceResultSchema.safeParse(rawResult);
  const params = ForgeAgentChannelResourceProgressParamsSchema.safeParse(rawParams);
  if (!result.success || !params.success) return false;
  const actual = result.data.intent, route = params.data;
  return actual.identity.managementAgentId === route.agentId && actual.kind === route.kind
    && actual.command.requestId === route.requestId
    && sameAgentChannelAccessBinding({ scope: actual.scope, identity: actual.identity }, trustedBinding);
}

/** Browser -> existing Forge factory authority. Descriptors only: handlers must authenticate, resolve ownership,
 * persist the intent before effects, and revalidate after awaits. Provider failures are public fixed-code receipts.
 * The existing manual-token endpoint stays separate; these bodies contain no credentials or provider URLs.
 */
const browserAuthentication = { authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const };
export const forgeAgentChannelResourceContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/:kind/resource' as const,
  paramsSchema: AgentChannelAccessParamsSchema, bodySchema: AgentChannelResourceCommandSchema,
  responseSchema: AgentChannelResourceResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeAgentChannelResourceProgressContract = {
  ...browserAuthentication, method: 'GET' as const, path: '/api/agents/:agentId/channels/:kind/resource/operations/:requestId' as const,
  paramsSchema: ForgeAgentChannelResourceProgressParamsSchema,
  responseSchema: AgentChannelResourceResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export function forgeAgentChannelResourcePath(agentId: string, kind: string): string {
  const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
  return forgeAgentChannelResourceContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
export function forgeAgentChannelResourceProgressPath(agentId: string, kind: string, requestId: string): string {
  const params = ForgeAgentChannelResourceProgressParamsSchema.parse({ agentId, kind, requestId });
  return forgeAgentChannelResourceProgressContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind)
    .replace(':requestId', encodeURIComponent(params.requestId));
}
