import { z } from 'zod';
import { OwnerIdSchema } from '../../agent/agent-identity.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { AgentConfigVersionSchema } from '../../capability/ricerca/agent-config.js';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { AgentChannelDesiredStateSchema } from '../../agent/agent-channel-configuration.js';
import { AgentChannelAccessPolicySchema } from '../../agent/agent-channel-access.js';
import { AgentChannelAccessRequestChangesSchema, AgentChannelAccessSnapshotSchema, AgentChannelAccessApplyResultSchema, AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { AgentChannelAccessParamsSchema } from './internal-agent-channel-access.js';

/** Server-derived session access, never accepted as a browser body or authorization header. */
export const ForgeAgentChannelAccessAuthorizationSchema = z.discriminatedUnion('role', [
  z.object({ role: z.literal('sa') }).strict(),
  z.object({ role: z.literal('owner'), ownerId: OwnerIdSchema, tenantId: CapabilityAgentScopeSchema.shape.tenantId }).strict(),
]);
export type ForgeAgentChannelAccessAuthorization = z.infer<typeof ForgeAgentChannelAccessAuthorizationSchema>;
export function isAgentChannelAccessWithinForgeAuthorization(rawSnapshot: unknown, trustedAccess: unknown): boolean {
  const snapshot = AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot), access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
  if (!snapshot.success || !access.success) return false;
  const scope = snapshot.data.configuration.scope;
  return access.data.role === 'sa' || (scope.ownerId === access.data.ownerId && scope.tenantId === access.data.tenantId);
}

/** Unsaved door intent. The existing Forge writer assigns the next version after CAS;
 * no URL, resource, credentials or client-declared identity is part of this body.
 */
export const ForgeAgentChannelAccessDraftSchema = z.object({
  requestId: AgentManagementRequestIdSchema, expectedDesiredVersion: AgentConfigVersionSchema,
  expectedAppliedVersion: AgentConfigVersionSchema.nullable(), desiredState: AgentChannelDesiredStateSchema,
  policy: AgentChannelAccessPolicySchema, requestChanges: AgentChannelAccessRequestChangesSchema.nullable(),
}).strict().refine(draft => draft.expectedAppliedVersion === null || draft.expectedAppliedVersion <= draft.expectedDesiredVersion,
  { message: 'Expected applied version cannot exceed the saved desired version' });
export type ForgeAgentChannelAccessDraft = z.infer<typeof ForgeAgentChannelAccessDraftSchema>;

/** Pre-save validation against the resolved server snapshot. Producers also check scope, authority and freshness. */
export function isForgeAgentChannelAccessDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean {
  const draft = ForgeAgentChannelAccessDraftSchema.safeParse(rawDraft), snapshot = AgentChannelAccessSnapshotSchema.safeParse(rawSnapshot);
  if (!draft.success || !snapshot.success) return false;
  const intent = draft.data, current = snapshot.data, config = current.configuration;
  if (intent.policy.kind !== config.kind || intent.expectedDesiredVersion !== config.desired.version
    || intent.expectedAppliedVersion !== (config.applied?.version ?? null)) return false;
  const changes = intent.requestChanges;
  if (changes === null) return true;
  if (current.requests.status !== 'available' || current.requests.queue.version !== changes.expectedQueueVersion) return false;
  const queue = current.requests.queue;
  return changes.operations.every(operation => {
    const request = queue.requests.find(entry => entry.requestId === operation.requestId);
    if (!request) return false;
    if (operation.action === 'ignore') return true;
    return intent.policy.kind === 'telegram' && intent.policy.chats.some(chat => chat.chatId === request.chatId && chat.type === request.type);
  });
}

/** Preview echoes the draft alongside actual evidence; it cannot assert a successful application. */
export const ForgeAgentChannelAccessPreviewSchema = z.object({
  requestId: AgentManagementRequestIdSchema, draft: ForgeAgentChannelAccessDraftSchema, snapshot: AgentChannelAccessSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId && isForgeAgentChannelAccessDraftForSnapshot(preview.draft, preview.snapshot),
  { message: 'Preview must match its draft and the current scoped door version' });
export type ForgeAgentChannelAccessPreview = z.infer<typeof ForgeAgentChannelAccessPreviewSchema>;
export function isForgeAgentChannelAccessPreviewForDraft(rawDraft: unknown, rawPreview: unknown): boolean {
  const draft = ForgeAgentChannelAccessDraftSchema.safeParse(rawDraft), preview = ForgeAgentChannelAccessPreviewSchema.safeParse(rawPreview);
  return draft.success && preview.success && JSON.stringify(draft.data) === JSON.stringify(preview.data.draft);
}

/** Browser -> Forge. Existing session and ownership guards install the handlers; no S2S header is exposed. */
const browserAuthentication = { authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const };
export const forgeAgentChannelAccessSnapshotContract = {
  ...browserAuthentication, method: 'GET' as const, path: '/api/agents/:agentId/channels/:kind/access' as const,
  paramsSchema: AgentChannelAccessParamsSchema, responseSchema: AgentChannelAccessSnapshotSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeAgentChannelAccessPreviewContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/:kind/access/preview' as const,
  paramsSchema: AgentChannelAccessParamsSchema, bodySchema: ForgeAgentChannelAccessDraftSchema,
  responseSchema: ForgeAgentChannelAccessPreviewSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeAgentChannelAccessApplyContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/:kind/access/apply' as const,
  paramsSchema: AgentChannelAccessParamsSchema, bodySchema: ForgeAgentChannelAccessDraftSchema,
  responseSchema: AgentChannelAccessApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
function doorPath(template: string, agentId: string, kind: string): string {
  const params = AgentChannelAccessParamsSchema.parse({ agentId, kind });
  return template.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
export function forgeAgentChannelAccessPath(agentId: string, kind: string): string { return doorPath(forgeAgentChannelAccessSnapshotContract.path, agentId, kind); }
export function forgeAgentChannelAccessPreviewPath(agentId: string, kind: string): string { return doorPath(forgeAgentChannelAccessPreviewContract.path, agentId, kind); }
export function forgeAgentChannelAccessApplyPath(agentId: string, kind: string): string { return doorPath(forgeAgentChannelAccessApplyContract.path, agentId, kind); }
