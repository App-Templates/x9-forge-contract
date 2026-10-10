import { z } from 'zod';
import { AgentChannelAccessBindingSchema, sameAgentChannelAccessBinding } from "../../agent/agent-channel-access.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { sameCapabilityScope } from "../../capability/capability-call-context.js";
import { ElevenLabsWebPolicySchema, ElevenLabsWebPolicyChangeSchema, ElevenLabsWebPolicyResultSchema, isElevenLabsWebPolicyResultCurrent } from "../../capability/agent-elevenlabs/web-channel.js";
import { ElevenLabsWebAdmissionSnapshotSchema, ElevenLabsWebLinkSchema, isElevenLabsWebLinkCurrent } from "../../capability/agent-elevenlabs/web-session.js";
import { ElevenLabsWebCatalogSchema } from "../../capability/agent-elevenlabs/web-catalog.js";
import { ForgeAgentChannelAccessAuthorizationSchema } from "./forge-agent-channel-access.js";
import { AgentPhoneParamsSchema } from "./internal-agent-phone-channel.js";
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
/** Scope is installed by Forge after authenticating the session and resolving the management ID. */
export const ForgeElevenLabsWebDraftSchema = ElevenLabsWebPolicyChangeSchema.omit({ scope: true }).strict();
function authorized(binding, rawAccess, requestedAgentId) {
    const access = ForgeAgentChannelAccessAuthorizationSchema.safeParse(rawAccess);
    const params = AgentPhoneParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!access.success || !params.success || binding.identity.managementAgentId !== params.data.agentId)
        return false; // guard:admin-management
    return access.data.role === 'sa'
        || (binding.scope.ownerId === access.data.ownerId && binding.scope.tenantId === access.data.tenantId); // guard:admin-owner
}
function fresh(observedAt, now) {
    const age = now - Date.parse(observedAt);
    return Number.isFinite(now) && age >= 0 && age < 60_000;
}
export function projectForgeElevenLabsWebSnapshot(input) {
    const binding = AgentChannelAccessBindingSchema.safeParse(input.binding);
    const admission = ElevenLabsWebAdmissionSnapshotSchema.safeParse(input.admission);
    const observed = ForgeElevenLabsWebSnapshotSchema.shape.observedAt.safeParse(input.observedAt);
    if (!binding.success || !admission.success || !observed.success
        || !authorized(binding.data, input.trustedAccess, input.requestedAgentId) || !fresh(observed.data, input.now))
        return undefined;
    const a = admission.data, scope = binding.data.scope;
    if (!sameCapabilityScope(scope, a.policy.scope) || !isElevenLabsWebLinkCurrent(a.link, scope, input.configuredOrigin)
        || Date.parse(a.link.createdAt) > input.now)
        return undefined; // guard:projection-scope
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
export function isForgeElevenLabsWebSnapshotCurrent(rawSnapshot, rawBinding, access, agentId, origin, now) {
    const snapshot = ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot), binding = AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!snapshot.success || !binding.success)
        return false;
    const actual = snapshot.data;
    return sameAgentChannelAccessBinding(actual.binding, binding.data) // guard:readback-binding
        && authorized(binding.data, access, agentId) && fresh(actual.observedAt, now)
        && isElevenLabsWebLinkCurrent(actual.link, binding.data.scope, origin)
        && Date.parse(actual.link.createdAt) <= now;
}
export function isForgeElevenLabsWebDraftForSnapshot(rawDraft, rawSnapshot) {
    const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), snapshot = ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot);
    return draft.success && snapshot.success && snapshot.data.lifecycle === 'active'
        && draft.data.expectedVersion === snapshot.data.policy.version;
}
export const ForgeElevenLabsWebPreviewSchema = z.object({
    requestId: ForgeElevenLabsWebDraftSchema.shape.requestId,
    draft: ForgeElevenLabsWebDraftSchema,
    snapshot: ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId
    && isForgeElevenLabsWebDraftForSnapshot(preview.draft, preview.snapshot), { message: 'Preview must echo the draft and its current Web policy revision' });
export function isForgeElevenLabsWebPreviewForDraft(rawDraft, rawPreview, binding, access, agentId, origin, now) {
    const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), preview = ForgeElevenLabsWebPreviewSchema.safeParse(rawPreview);
    return draft.success && preview.success && JSON.stringify(draft.data) === JSON.stringify(preview.data.draft)
        && isForgeElevenLabsWebSnapshotCurrent(preview.data.snapshot, binding, access, agentId, origin, now);
}
export const ForgeElevenLabsWebApplyResultSchema = z.object({
    result: ElevenLabsWebPolicyResultSchema,
    snapshot: ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(applied => JSON.stringify(applied.result.policy) === JSON.stringify(applied.snapshot.policy), { message: 'Safe readback must describe the exact canonical applied Web policy' });
/** The exact immutable command may be replayed; no later revision or replacement link is credited to it. */
export function isForgeElevenLabsWebApplyResultForDraft(rawDraft, rawResult, rawBefore, binding, access, agentId, origin, now) {
    const draft = ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), applied = ForgeElevenLabsWebApplyResultSchema.safeParse(rawResult);
    const before = ForgeElevenLabsWebSnapshotSchema.safeParse(rawBefore);
    if (!draft.success || !applied.success || !before.success)
        return false;
    return isForgeElevenLabsWebSnapshotCurrent(before.data, binding, access, agentId, origin, now)
        && isForgeElevenLabsWebDraftForSnapshot(draft.data, before.data)
        && isForgeElevenLabsWebSnapshotCurrent(applied.data.snapshot, binding, access, agentId, origin, now)
        && applied.data.snapshot.lifecycle === 'active'
        && JSON.stringify(before.data.link) === JSON.stringify(applied.data.snapshot.link)
        && isElevenLabsWebPolicyResultCurrent({ ...draft.data, scope: before.data.binding.scope }, applied.data.result);
}
const adminAccess = { authentication: 'forge-session', authorization: 'sa-or-agent-owner',
    cacheControl: 'no-store', paramsSchema: AgentPhoneParamsSchema, errorResponseSchema: AgentChannelAccessErrorResponseSchema };
export const forgeElevenLabsWebSnapshotContract = {
    ...adminAccess, method: 'GET', path: '/api/agents/:agentId/channels/web/access',
    responseSchema: ForgeElevenLabsWebSnapshotSchema,
};
export const forgeElevenLabsWebPreviewContract = {
    ...adminAccess, method: 'POST', path: '/api/agents/:agentId/channels/web/access/preview',
    bodySchema: ForgeElevenLabsWebDraftSchema, responseSchema: ForgeElevenLabsWebPreviewSchema,
};
export const forgeElevenLabsWebApplyContract = {
    ...adminAccess, method: 'POST', path: '/api/agents/:agentId/channels/web/access/apply',
    bodySchema: ForgeElevenLabsWebDraftSchema, responseSchema: ForgeElevenLabsWebApplyResultSchema,
};
/** Read-only discovery for the existing Modelli writer; this contract does not install a second writer. */
export const forgeElevenLabsWebCatalogContract = {
    ...adminAccess, method: 'GET', path: '/api/agents/:agentId/channels/web/access/catalog',
    responseSchema: ElevenLabsWebCatalogSchema,
};
function adminWebPath(template, id) {
    const params = AgentPhoneParamsSchema.parse({ agentId: id });
    return template.replace(':agentId', encodeURIComponent(params.agentId));
}
export function forgeElevenLabsWebSnapshotPath(id) { return adminWebPath(forgeElevenLabsWebSnapshotContract.path, id); }
export function forgeElevenLabsWebPreviewPath(id) { return adminWebPath(forgeElevenLabsWebPreviewContract.path, id); }
export function forgeElevenLabsWebApplyPath(id) { return adminWebPath(forgeElevenLabsWebApplyContract.path, id); }
export function forgeElevenLabsWebCatalogPath(id) { return adminWebPath(forgeElevenLabsWebCatalogContract.path, id); }
//# sourceMappingURL=forge-elevenlabs-web.js.map