import { z } from 'zod';
import { AgentChannelAccessBindingSchema, sameAgentChannelAccessBinding, type AgentChannelAccessBinding } from '../../agent/agent-channel-access.js';
import { AgentChannelAccessErrorResponseSchema } from '../../agent/agent-channel-access-requests.js';
import { sameCapabilityScope } from '../../capability/capability-call-context.js';
import { ElevenLabsWebPolicySchema, ElevenLabsWebPolicyChangeSchema, ElevenLabsWebPolicyResultSchema, isElevenLabsWebPolicyResultCurrent } from '../../capability/agent-elevenlabs/web-channel.js';
import { ElevenLabsWebAdmissionSnapshotSchema, ElevenLabsWebLinkSchema, isElevenLabsWebLinkCurrent } from '../../capability/agent-elevenlabs/web-session.js';
import { ElevenLabsWebCatalogSchema } from '../../capability/agent-elevenlabs/web-catalog.js';
import { ForgeAgentChannelAccessAuthorizationSchema } from './forge-agent-channel-access.js';
import { AgentPhoneParamsSchema } from './internal-agent-phone-channel.js';
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


/** Administrative evidence only. It grants neither browser admission nor a provider session. */
export const ForgeElevenLabsWebSnapshotSchema = z.object({
  binding: AgentChannelAccessBindingSchema,
  policy: ElevenLabsWebPolicySchema,
  link: ElevenLabsWebLinkSchema,
  lifecycle: ElevenLabsWebAdmissionSnapshotSchema.shape.lifecycle,
  availability: z.enum(['ready', 'off', 'paused', 'unavailable']),
  observedAt: z.iso.datetime({ offset: true }),
}).strict().superRefine((snapshot, ctx) => {
  if (!sameCapabilityScope(snapshot.binding.scope, snapshot.policy.scope)
    || !sameCapabilityScope(snapshot.binding.scope, snapshot.link.scope)) {
    ctx.addIssue({ code: 'custom', message: 'Web policy and link must belong to the full binding scope' });
  }
  if (!URL.canParse(snapshot.link.url) || !isElevenLabsWebLinkCurrent(snapshot.link, snapshot.binding.scope, new URL(snapshot.link.url).origin)) {
    ctx.addIssue({ code: 'custom', path: ['link'], message: 'Expected a stable HTTPS Forge link' });
  }
  const expected = snapshot.lifecycle !== 'active' ? 'unavailable'
    : snapshot.policy.enabled === false ? 'off' : snapshot.policy.paused ? 'paused' : null;
  if ((expected !== null && snapshot.availability !== expected)
    || (expected === null && snapshot.availability !== 'ready' && snapshot.availability !== 'unavailable')) {
    ctx.addIssue({ code: 'custom', path: ['availability'], message: 'Availability must respect lifecycle and saved policy' });
  }
});
export type ForgeElevenLabsWebSnapshot = z.infer<typeof ForgeElevenLabsWebSnapshotSchema>;

/** Scope is installed by Forge after authenticating the session and resolving the management ID. */
export const ForgeElevenLabsWebDraftSchema = ElevenLabsWebPolicyChangeSchema.omit({ scope: true }).strict();
export type ForgeElevenLabsWebDraft = z.infer<typeof ForgeElevenLabsWebDraftSchema>;

function authorized(binding: AgentChannelAccessBinding, rawAccess: unknown, requestedAgentId: unknown): boolean {
  const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(rawAccess);
  const params = AgentPhoneParamsSchema.safeParse({ agentId: requestedAgentId });
  if (!access.success || !params.success || binding.identity.managementAgentId !== params.data.agentId) return false; // guard:admin-management
  return access.data.role === 'sa'
    || (binding.scope.ownerId === access.data.ownerId && binding.scope.tenantId === access.data.tenantId); // guard:admin-owner
}
function fresh(observedAt: string, now: number): boolean {
  const age = now - Date.parse(observedAt);
  return Number.isFinite(now) && age >= 0 && age < 60_000;
}
/** Inputs must come from current trusted server records, never a browser declaration of ownership. */
export interface ForgeElevenLabsWebProjectionInput {
  binding: unknown; trustedAccess: unknown; requestedAgentId: unknown; admission: unknown;
  configuredOrigin: unknown; observedAt: unknown; now: number;
}
export function projectForgeElevenLabsWebSnapshot(input: ForgeElevenLabsWebProjectionInput): ForgeElevenLabsWebSnapshot | undefined {
  const binding = AgentChannelAccessBindingSchema.safeParse(input.binding);
  const admission = ElevenLabsWebAdmissionSnapshotSchema.safeParse(input.admission);
  const observed = ForgeElevenLabsWebSnapshotSchema.shape.observedAt.safeParse(input.observedAt);
  if (!binding.success || !admission.success || !observed.success
    || !authorized(binding.data, input.trustedAccess, input.requestedAgentId) || !fresh(observed.data, input.now)) return undefined;
  const a = admission.data, scope = binding.data.scope;
  if (!sameCapabilityScope(scope, a.policy.scope) || !isElevenLabsWebLinkCurrent(a.link, scope, input.configuredOrigin)
    || Date.parse(a.link.createdAt) > input.now) return undefined; // guard:projection-scope
  // Same channel readiness requirements as canonical admission, without inventing an authenticated viewer.
  // Policy/invitation checks for a conversation remain in canAdmitElevenLabsWebViewer on the issuer.
  const ready = a.provider.desiredState === 'active' && a.provider.mapping !== null
    && a.provider.channel.state === 'loaded' && a.provider.channel.loaded === true
    && a.provider.channel.readiness === 'ready' && a.provider.observedAt !== null
    && fresh(a.provider.observedAt, input.now);
  const availability = a.lifecycle !== 'active' ? 'unavailable' : a.policy.enabled === false ? 'off'
    : a.policy.paused ? 'paused' : ready ? 'ready' : 'unavailable';
  const result = ForgeElevenLabsWebSnapshotSchema.safeParse({ binding: binding.data, policy: a.policy, link: a.link,
    lifecycle: a.lifecycle, availability, observedAt: observed.data });
  return result.success ? result.data : undefined;
}

/** Validate a browser readback against a separately reloaded binding and current session authorization. */
export function isForgeElevenLabsWebSnapshotCurrent(rawSnapshot: unknown, rawBinding: unknown, access: unknown,
  agentId: unknown, origin: unknown, now: number): boolean {
  const snapshot = ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot), binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
  if (!snapshot.success || !binding.success) return false;
  const actual = snapshot.data;
  return sameAgentChannelAccessBinding(actual.binding, binding.data) // guard:readback-binding
    && authorized(binding.data, access, agentId) && fresh(actual.observedAt, now)
    && isElevenLabsWebLinkCurrent(actual.link, binding.data.scope, origin)
    && Date.parse(actual.link.createdAt) <= now;
}
export function isForgeElevenLabsWebDraftForSnapshot(rawDraft: unknown, rawSnapshot: unknown): boolean {
  const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), snapshot = ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot);
  return draft.success && snapshot.success && snapshot.data.lifecycle === 'active'
    && draft.data.expectedVersion === snapshot.data.policy.version;
}
export const ForgeElevenLabsWebPreviewSchema = z.object({
  requestId: ForgeElevenLabsWebDraftSchema.shape.requestId,
  draft: ForgeElevenLabsWebDraftSchema,
  snapshot: ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId
  && isForgeElevenLabsWebDraftForSnapshot(preview.draft, preview.snapshot),
{ message: 'Preview must echo the draft and its current Web policy revision' });
export type ForgeElevenLabsWebPreview = z.infer<typeof ForgeElevenLabsWebPreviewSchema>;
export function isForgeElevenLabsWebPreviewForDraft(rawDraft: unknown, rawPreview: unknown, binding: unknown,
  access: unknown, agentId: unknown, origin: unknown, now: number): boolean {
  const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), preview = ForgeElevenLabsWebPreviewSchema.safeParse(rawPreview);
  return draft.success && preview.success && JSON.stringify(draft.data) === JSON.stringify(preview.data.draft)
    && isForgeElevenLabsWebSnapshotCurrent(preview.data.snapshot, binding, access, agentId, origin, now);
}
export const ForgeElevenLabsWebApplyResultSchema = z.object({
  result: ElevenLabsWebPolicyResultSchema,
  snapshot: ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(applied => JSON.stringify(applied.result.policy) === JSON.stringify(applied.snapshot.policy),
{ message: 'Safe readback must describe the exact canonical applied Web policy' });
export type ForgeElevenLabsWebApplyResult = z.infer<typeof ForgeElevenLabsWebApplyResultSchema>;
/** The exact immutable command may be replayed; no later revision or replacement link is credited to it. */
export function isForgeElevenLabsWebApplyResultForDraft(rawDraft: unknown, rawResult: unknown, rawBefore: unknown,
  binding: unknown, access: unknown, agentId: unknown, origin: unknown, now: number): boolean {
  const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), applied = ForgeElevenLabsWebApplyResultSchema.safeParse(rawResult);
  const before = ForgeElevenLabsWebSnapshotSchema.safeParse(rawBefore);
  if (!draft.success || !applied.success || !before.success) return false;
  return isForgeElevenLabsWebSnapshotCurrent(before.data, binding, access, agentId, origin, now)
    && isForgeElevenLabsWebDraftForSnapshot(draft.data, before.data)
    && isForgeElevenLabsWebSnapshotCurrent(applied.data.snapshot, binding, access, agentId, origin, now)
    && applied.data.snapshot.lifecycle === 'active'
    && JSON.stringify(before.data.link) === JSON.stringify(applied.data.snapshot.link)
    && isElevenLabsWebPolicyResultCurrent({ ...draft.data, scope: before.data.binding.scope }, applied.data.result);
}

const adminAccess = { authentication: 'forge-session' as const, authorization: 'sa-or-agent-owner' as const,
  cacheControl: 'no-store' as const, paramsSchema: AgentPhoneParamsSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema };
export const forgeElevenLabsWebSnapshotContract = {
  ...adminAccess, method: 'GET' as const, path: '/api/agents/:agentId/channels/web/access' as const,
  responseSchema: ForgeElevenLabsWebSnapshotSchema,
} as const;
export const forgeElevenLabsWebPreviewContract = {
  ...adminAccess, method: 'POST' as const, path: '/api/agents/:agentId/channels/web/access/preview' as const,
  bodySchema: ForgeElevenLabsWebDraftSchema, responseSchema: ForgeElevenLabsWebPreviewSchema,
} as const;
export const forgeElevenLabsWebApplyContract = {
  ...adminAccess, method: 'POST' as const, path: '/api/agents/:agentId/channels/web/access/apply' as const,
  bodySchema: ForgeElevenLabsWebDraftSchema, responseSchema: ForgeElevenLabsWebApplyResultSchema,
} as const;
/** Read-only discovery for the existing Modelli writer; this contract does not install a second writer. */
export const forgeElevenLabsWebCatalogContract = {
  ...adminAccess, method: 'GET' as const, path: '/api/agents/:agentId/channels/web/access/catalog' as const,
  responseSchema: ElevenLabsWebCatalogSchema,
} as const;
function adminWebPath(template: string, id: string): string {
  const params = AgentPhoneParamsSchema.parse({ agentId: id });
  return template.replace(':agentId', encodeURIComponent(params.agentId));
}
export function forgeElevenLabsWebSnapshotPath(id: string): string { return adminWebPath(forgeElevenLabsWebSnapshotContract.path, id); }
export function forgeElevenLabsWebPreviewPath(id: string): string { return adminWebPath(forgeElevenLabsWebPreviewContract.path, id); }
export function forgeElevenLabsWebApplyPath(id: string): string { return adminWebPath(forgeElevenLabsWebApplyContract.path, id); }
export function forgeElevenLabsWebCatalogPath(id: string): string { return adminWebPath(forgeElevenLabsWebCatalogContract.path, id); }
