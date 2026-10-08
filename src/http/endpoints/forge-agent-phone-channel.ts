import { z } from 'zod';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { ForgeAgentChannelAccessAuthorizationSchema, ForgeAgentChannelAccessDraftSchema } from './forge-agent-channel-access.js';
import { AgentPhoneAccessPolicySchema } from '../../agent/agent-phone-channel.js';
import { AgentPhoneSnapshotSchema, AgentPhoneApplyCommandSchema, AgentPhoneApplyResultSchema,
  isAgentPhoneSnapshotCurrent } from '../../agent/agent-phone-commands.js';
import { AgentPhoneParamsSchema } from './internal-agent-phone-channel.js';

/** Authority comes from the existing server session guard; this value is never a browser input. */
export function isAgentPhoneWithinForgeAuthorization(rawSnapshot: unknown, trustedAccess: unknown, requestedAgentId: unknown): boolean {
  const snapshot = AgentPhoneSnapshotSchema.safeParse(rawSnapshot), access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(trustedAccess);
  const params = AgentPhoneParamsSchema.safeParse({ agentId: requestedAgentId });
  if (!snapshot.success || !access.success || !params.success) return false;
  const config = snapshot.data.configuration;
  if (config.identity.managementAgentId !== params.data.agentId) return false; // guard:forge-agent
  return access.data.role === 'sa' || (config.scope.ownerId === access.data.ownerId && config.scope.tenantId === access.data.tenantId);
}

/** Phone door only: no voice writer, recipient number, contact copy, provider or client authority. */
export const ForgeAgentPhoneDraftSchema = z.object({
  requestId: ForgeAgentChannelAccessDraftSchema.shape.requestId,
  expectedDesiredVersion: ForgeAgentChannelAccessDraftSchema.shape.expectedDesiredVersion,
  expectedAppliedVersion: ForgeAgentChannelAccessDraftSchema.shape.expectedAppliedVersion,
  desiredState: ForgeAgentChannelAccessDraftSchema.shape.desiredState, policy: AgentPhoneAccessPolicySchema,
  expectedNumberVersion: AgentPhoneApplyCommandSchema.shape.expectedNumberVersion,
  expectedRoutingIdentity: AgentPhoneApplyCommandSchema.shape.expectedRoutingIdentity,
}).strict().refine(draft => draft.expectedAppliedVersion === null || draft.expectedAppliedVersion <= draft.expectedDesiredVersion,
  { message: 'Expected applied version cannot exceed the saved desired version' });
export type ForgeAgentPhoneDraft = z.infer<typeof ForgeAgentPhoneDraftSchema>;

/** CAS comparison only. Producers must additionally check authorization and fresh evidence before saving. */
export function isForgeAgentPhoneDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean {
  const draft = ForgeAgentPhoneDraftSchema.safeParse(rawDraft), snapshot = AgentPhoneSnapshotSchema.safeParse(rawSnapshot);
  if (!draft.success || !snapshot.success) return false;
  const intent = draft.data, config = snapshot.data.configuration;
  if (snapshot.data.agentArchived) return false; // guard:draft-archived
  if (intent.expectedDesiredVersion !== config.desired.version || intent.expectedAppliedVersion !== (config.applied?.version ?? null)) return false; // guard:draft-versions
  if (intent.expectedNumberVersion !== config.sharedNumber.version || intent.expectedRoutingIdentity !== (config.routing?.routingIdentity ?? null)) return false; // guard:draft-routing
  return true;
}

/** Unsaved intent alongside actual evidence; a preview never asserts that Apply succeeded. */
export const ForgeAgentPhonePreviewSchema = z.object({
  requestId: ForgeAgentPhoneDraftSchema.shape.requestId, draft: ForgeAgentPhoneDraftSchema, snapshot: AgentPhoneSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId && isForgeAgentPhoneDraftForSnapshot(preview.draft, preview.snapshot),
  { message: 'Preview must echo its exact draft and current phone versions' });
export type ForgeAgentPhonePreview = z.infer<typeof ForgeAgentPhonePreviewSchema>;
export function isForgeAgentPhonePreviewForDraft(rawDraft: unknown, rawPreview: unknown, trustedAccess: unknown,
  requestedAgentId: unknown, now: number, maximumAgeMs = 60_000): boolean {
  const draft = ForgeAgentPhoneDraftSchema.safeParse(rawDraft), preview = ForgeAgentPhonePreviewSchema.safeParse(rawPreview);
  if (!draft.success || !preview.success) return false;
  const actual = preview.data;
  if (!isAgentPhoneWithinForgeAuthorization(actual.snapshot, trustedAccess, requestedAgentId)) return false; // guard:preview-authority
  const config = actual.snapshot.configuration;
  if (!isAgentPhoneSnapshotCurrent(actual.snapshot, { scope: config.scope, identity: config.identity }, now, maximumAgeMs)) return false; // guard:preview-current
  return JSON.stringify(draft.data) === JSON.stringify(actual.draft);
}

const browserAuthentication = { authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const };
export const forgeAgentPhoneSnapshotContract = {
  ...browserAuthentication, method: 'GET' as const, path: '/api/agents/:agentId/channels/phone/access' as const,
  paramsSchema: AgentPhoneParamsSchema, responseSchema: AgentPhoneSnapshotSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeAgentPhonePreviewContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/phone/access/preview' as const,
  paramsSchema: AgentPhoneParamsSchema, bodySchema: ForgeAgentPhoneDraftSchema,
  responseSchema: ForgeAgentPhonePreviewSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
export const forgeAgentPhoneApplyContract = {
  ...browserAuthentication, method: 'POST' as const, path: '/api/agents/:agentId/channels/phone/access/apply' as const,
  paramsSchema: AgentPhoneParamsSchema, bodySchema: ForgeAgentPhoneDraftSchema,
  responseSchema: AgentPhoneApplyResultSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema,
} as const;
function phonePath(template: string, agentId: string): string {
  const params = AgentPhoneParamsSchema.parse({ agentId });
  return template.replace(':agentId', encodeURIComponent(params.agentId));
}
export function forgeAgentPhonePath(agentId: string): string { return phonePath(forgeAgentPhoneSnapshotContract.path, agentId); }
export function forgeAgentPhonePreviewPath(agentId: string): string { return phonePath(forgeAgentPhonePreviewContract.path, agentId); }
export function forgeAgentPhoneApplyPath(agentId: string): string { return phonePath(forgeAgentPhoneApplyContract.path, agentId); }
