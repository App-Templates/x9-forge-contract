"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeElevenLabsWebCatalogContract = exports.forgeElevenLabsWebApplyContract = exports.forgeElevenLabsWebPreviewContract = exports.forgeElevenLabsWebSnapshotContract = exports.ForgeElevenLabsWebApplyResultSchema = exports.ForgeElevenLabsWebPreviewSchema = exports.ForgeElevenLabsWebDraftSchema = exports.ForgeElevenLabsWebSnapshotSchema = exports.forgeElevenLabsWebSessionContract = exports.forgeElevenLabsWebMetadataContract = exports.ForgeElevenLabsWebParamsSchema = void 0;
exports.forgeElevenLabsWebMetadataPath = forgeElevenLabsWebMetadataPath;
exports.forgeElevenLabsWebSessionPath = forgeElevenLabsWebSessionPath;
exports.isElevenLabsWebBrowserRequestForLink = isElevenLabsWebBrowserRequestForLink;
exports.projectForgeElevenLabsWebSnapshot = projectForgeElevenLabsWebSnapshot;
exports.isForgeElevenLabsWebSnapshotCurrent = isForgeElevenLabsWebSnapshotCurrent;
exports.isForgeElevenLabsWebDraftForSnapshot = isForgeElevenLabsWebDraftForSnapshot;
exports.isForgeElevenLabsWebPreviewForDraft = isForgeElevenLabsWebPreviewForDraft;
exports.isForgeElevenLabsWebApplyResultForDraft = isForgeElevenLabsWebApplyResultForDraft;
exports.forgeElevenLabsWebSnapshotPath = forgeElevenLabsWebSnapshotPath;
exports.forgeElevenLabsWebPreviewPath = forgeElevenLabsWebPreviewPath;
exports.forgeElevenLabsWebApplyPath = forgeElevenLabsWebApplyPath;
exports.forgeElevenLabsWebCatalogPath = forgeElevenLabsWebCatalogPath;
const zod_1 = require("zod");
const agent_channel_access_js_1 = require("../../agent/agent-channel-access.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const capability_call_context_js_1 = require("../../capability/capability-call-context.cjs");
const web_channel_js_1 = require("../../capability/agent-elevenlabs/web-channel.cjs");
const web_session_js_1 = require("../../capability/agent-elevenlabs/web-session.cjs");
const web_catalog_js_1 = require("../../capability/agent-elevenlabs/web-catalog.cjs");
const forge_agent_channel_access_js_1 = require("./forge-agent-channel-access.cjs");
const internal_agent_phone_channel_js_1 = require("./internal-agent-phone-channel.cjs");
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
/** Administrative evidence only. It grants neither browser admission nor a provider session. */
exports.ForgeElevenLabsWebSnapshotSchema = zod_1.z.object({
    binding: agent_channel_access_js_1.AgentChannelAccessBindingSchema,
    policy: web_channel_js_1.ElevenLabsWebPolicySchema,
    link: web_session_js_1.ElevenLabsWebLinkSchema,
    lifecycle: web_session_js_1.ElevenLabsWebAdmissionSnapshotSchema.shape.lifecycle,
    availability: zod_1.z.enum(['ready', 'off', 'paused', 'unavailable']),
    observedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict().superRefine((snapshot, ctx) => {
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.binding.scope, snapshot.policy.scope)
        || !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.binding.scope, snapshot.link.scope)) {
        ctx.addIssue({ code: 'custom', message: 'Web policy and link must belong to the full binding scope' });
    }
    if (!URL.canParse(snapshot.link.url) || !(0, web_session_js_1.isElevenLabsWebLinkCurrent)(snapshot.link, snapshot.binding.scope, new URL(snapshot.link.url).origin)) {
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
exports.ForgeElevenLabsWebDraftSchema = web_channel_js_1.ElevenLabsWebPolicyChangeSchema.omit({ scope: true }).strict();
function authorized(binding, rawAccess, requestedAgentId) {
    const access = forge_agent_channel_access_js_1.ForgeAgentChannelAccessAuthorizationSchema.safeParse(rawAccess);
    const params = internal_agent_phone_channel_js_1.AgentPhoneParamsSchema.safeParse({ agentId: requestedAgentId });
    if (!access.success || !params.success || binding.identity.managementAgentId !== params.data.agentId)
        return false; // guard:admin-management
    return access.data.role === 'sa'
        || (binding.scope.ownerId === access.data.ownerId && binding.scope.tenantId === access.data.tenantId); // guard:admin-owner
}
function fresh(observedAt, now) {
    const age = now - Date.parse(observedAt);
    return Number.isFinite(now) && age >= 0 && age < 60_000;
}
function projectForgeElevenLabsWebSnapshot(input) {
    const binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(input.binding);
    const admission = web_session_js_1.ElevenLabsWebAdmissionSnapshotSchema.safeParse(input.admission);
    const observed = exports.ForgeElevenLabsWebSnapshotSchema.shape.observedAt.safeParse(input.observedAt);
    if (!binding.success || !admission.success || !observed.success
        || !authorized(binding.data, input.trustedAccess, input.requestedAgentId) || !fresh(observed.data, input.now))
        return undefined;
    const a = admission.data, scope = binding.data.scope;
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(scope, a.policy.scope) || !(0, web_session_js_1.isElevenLabsWebLinkCurrent)(a.link, scope, input.configuredOrigin)
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
    const result = exports.ForgeElevenLabsWebSnapshotSchema.safeParse({ binding: binding.data, policy: a.policy, link: a.link,
        lifecycle: a.lifecycle, availability, observedAt: observed.data });
    return result.success ? result.data : undefined;
}
/** Validate a browser readback against a separately reloaded binding and current session authorization. */
function isForgeElevenLabsWebSnapshotCurrent(rawSnapshot, rawBinding, access, agentId, origin, now) {
    const snapshot = exports.ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot), binding = agent_channel_access_js_1.AgentChannelAccessBindingSchema.safeParse(rawBinding);
    if (!snapshot.success || !binding.success)
        return false;
    const actual = snapshot.data;
    return (0, agent_channel_access_js_1.sameAgentChannelAccessBinding)(actual.binding, binding.data) // guard:readback-binding
        && authorized(binding.data, access, agentId) && fresh(actual.observedAt, now)
        && (0, web_session_js_1.isElevenLabsWebLinkCurrent)(actual.link, binding.data.scope, origin)
        && Date.parse(actual.link.createdAt) <= now;
}
function isForgeElevenLabsWebDraftForSnapshot(rawDraft, rawSnapshot) {
    const draft = exports.ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), snapshot = exports.ForgeElevenLabsWebSnapshotSchema.safeParse(rawSnapshot);
    return draft.success && snapshot.success && snapshot.data.lifecycle === 'active'
        && draft.data.expectedVersion === snapshot.data.policy.version;
}
exports.ForgeElevenLabsWebPreviewSchema = zod_1.z.object({
    requestId: exports.ForgeElevenLabsWebDraftSchema.shape.requestId,
    draft: exports.ForgeElevenLabsWebDraftSchema,
    snapshot: exports.ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(preview => preview.requestId === preview.draft.requestId
    && isForgeElevenLabsWebDraftForSnapshot(preview.draft, preview.snapshot), { message: 'Preview must echo the draft and its current Web policy revision' });
function isForgeElevenLabsWebPreviewForDraft(rawDraft, rawPreview, binding, access, agentId, origin, now) {
    const draft = exports.ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), preview = exports.ForgeElevenLabsWebPreviewSchema.safeParse(rawPreview);
    return draft.success && preview.success && JSON.stringify(draft.data) === JSON.stringify(preview.data.draft)
        && isForgeElevenLabsWebSnapshotCurrent(preview.data.snapshot, binding, access, agentId, origin, now);
}
exports.ForgeElevenLabsWebApplyResultSchema = zod_1.z.object({
    result: web_channel_js_1.ElevenLabsWebPolicyResultSchema,
    snapshot: exports.ForgeElevenLabsWebSnapshotSchema,
}).strict().refine(applied => JSON.stringify(applied.result.policy) === JSON.stringify(applied.snapshot.policy), { message: 'Safe readback must describe the exact canonical applied Web policy' });
/** The exact immutable command may be replayed; no later revision or replacement link is credited to it. */
function isForgeElevenLabsWebApplyResultForDraft(rawDraft, rawResult, rawBefore, binding, access, agentId, origin, now) {
    const draft = exports.ForgeElevenLabsWebDraftSchema.safeParse(rawDraft), applied = exports.ForgeElevenLabsWebApplyResultSchema.safeParse(rawResult);
    const before = exports.ForgeElevenLabsWebSnapshotSchema.safeParse(rawBefore);
    if (!draft.success || !applied.success || !before.success)
        return false;
    return isForgeElevenLabsWebSnapshotCurrent(before.data, binding, access, agentId, origin, now)
        && isForgeElevenLabsWebDraftForSnapshot(draft.data, before.data)
        && isForgeElevenLabsWebSnapshotCurrent(applied.data.snapshot, binding, access, agentId, origin, now)
        && applied.data.snapshot.lifecycle === 'active'
        && JSON.stringify(before.data.link) === JSON.stringify(applied.data.snapshot.link)
        && (0, web_channel_js_1.isElevenLabsWebPolicyResultCurrent)({ ...draft.data, scope: before.data.binding.scope }, applied.data.result);
}
const adminAccess = { authentication: 'forge-session', authorization: 'sa-or-agent-owner',
    cacheControl: 'no-store', paramsSchema: internal_agent_phone_channel_js_1.AgentPhoneParamsSchema, errorResponseSchema: agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema };
exports.forgeElevenLabsWebSnapshotContract = {
    ...adminAccess, method: 'GET', path: '/api/agents/:agentId/channels/web/access',
    responseSchema: exports.ForgeElevenLabsWebSnapshotSchema,
};
exports.forgeElevenLabsWebPreviewContract = {
    ...adminAccess, method: 'POST', path: '/api/agents/:agentId/channels/web/access/preview',
    bodySchema: exports.ForgeElevenLabsWebDraftSchema, responseSchema: exports.ForgeElevenLabsWebPreviewSchema,
};
exports.forgeElevenLabsWebApplyContract = {
    ...adminAccess, method: 'POST', path: '/api/agents/:agentId/channels/web/access/apply',
    bodySchema: exports.ForgeElevenLabsWebDraftSchema, responseSchema: exports.ForgeElevenLabsWebApplyResultSchema,
};
/** Read-only discovery for the existing Modelli writer; this contract does not install a second writer. */
exports.forgeElevenLabsWebCatalogContract = {
    ...adminAccess, method: 'GET', path: '/api/agents/:agentId/channels/web/access/catalog',
    responseSchema: web_catalog_js_1.ElevenLabsWebCatalogSchema,
};
function adminWebPath(template, id) {
    const params = internal_agent_phone_channel_js_1.AgentPhoneParamsSchema.parse({ agentId: id });
    return template.replace(':agentId', encodeURIComponent(params.agentId));
}
function forgeElevenLabsWebSnapshotPath(id) { return adminWebPath(exports.forgeElevenLabsWebSnapshotContract.path, id); }
function forgeElevenLabsWebPreviewPath(id) { return adminWebPath(exports.forgeElevenLabsWebPreviewContract.path, id); }
function forgeElevenLabsWebApplyPath(id) { return adminWebPath(exports.forgeElevenLabsWebApplyContract.path, id); }
function forgeElevenLabsWebCatalogPath(id) { return adminWebPath(exports.forgeElevenLabsWebCatalogContract.path, id); }
//# sourceMappingURL=forge-elevenlabs-web.js.map