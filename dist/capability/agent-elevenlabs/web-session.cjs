"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebSessionResultSchema = exports.ElevenLabsWebSessionRequestSchema = exports.ElevenLabsWebAdmissionSnapshotSchema = exports.ElevenLabsWebViewerSchema = exports.ElevenLabsWebLinkSchema = void 0;
exports.isElevenLabsWebLinkCurrent = isElevenLabsWebLinkCurrent;
exports.canAdmitElevenLabsWebViewer = canAdmitElevenLabsWebViewer;
exports.isElevenLabsWebSignedConnectionUrl = isElevenLabsWebSignedConnectionUrl;
exports.isElevenLabsWebSessionCurrent = isElevenLabsWebSessionCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const index_js_1 = require("./index.cjs");
const web_channel_js_1 = require("./web-channel.cjs");
/** Persist once on the server; stable across retries and Web-only pauses. Never a provider share link. */
exports.ElevenLabsWebLinkSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    linkId: agent_management_js_1.AgentManagementRequestIdSchema,
    url: zod_1.z.url().max(2048),
    createdAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
/** Server-derived authenticated person and owner membership; never accepted as browser authorization. */
exports.ElevenLabsWebViewerSchema = zod_1.z.discriminatedUnion('kind', [
    zod_1.z.object({ kind: zod_1.z.literal('anonymous') }).strict(),
    zod_1.z.object({ kind: zod_1.z.literal('authenticated'), userId: capability_call_context_js_1.CapabilityPersonScopeSchema.shape.userId,
        owner: capability_call_context_js_1.CapabilityAgentScopeSchema.pick({ tenantId: true, ownerId: true }).strict().nullable(),
    }).strict(),
]);
/** Internal evidence only. Public pages must not receive mappings, policy scope or invitations. */
exports.ElevenLabsWebAdmissionSnapshotSchema = zod_1.z.object({
    policy: web_channel_js_1.ElevenLabsWebPolicySchema,
    link: exports.ElevenLabsWebLinkSchema,
    provider: index_js_1.ElevenLabsChannelStatusSchema,
    lifecycle: zod_1.z.enum(['active', 'archived', 'removed', 'unavailable']),
    invitation: web_channel_js_1.ElevenLabsWebInvitationSchema.nullable(),
    invitationRevision: agent_config_js_1.AgentConfigVersionSchema.nullable(),
}).strict().superRefine((snapshot, ctx) => {
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.policy.scope, snapshot.link.scope)
        || !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.policy.scope, snapshot.provider.scope)
        || (snapshot.invitation !== null && !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.policy.scope, snapshot.invitation.scope))) {
        ctx.addIssue({ code: 'custom', message: 'Web evidence must share the full resolved agent scope' });
    }
    if (snapshot.provider.channel.kind !== 'web')
        ctx.addIssue({ code: 'custom', path: ['provider', 'channel', 'kind'], message: 'Web evidence requires a Web channel' });
    if ((snapshot.invitation === null) !== (snapshot.invitationRevision === null))
        ctx.addIssue({ code: 'custom', path: ['invitationRevision'], message: 'Invitation record and current server revision are present together' });
});
/** Validate a server-returned URL against the actual configured Forge origin, never window.location guesses. */
function isElevenLabsWebLinkCurrent(rawLink, expectedScope, configuredOrigin) {
    const link = exports.ElevenLabsWebLinkSchema.safeParse(rawLink), scope = capability_call_context_js_1.CapabilityAgentScopeSchema.safeParse(expectedScope);
    if (!link.success || !scope.success || typeof configuredOrigin !== 'string')
        return false;
    let base, url;
    try {
        base = new URL(configuredOrigin);
        url = new URL(link.data.url);
    }
    catch {
        return false;
    }
    return base.protocol === 'https:' && base.href === base.origin + '/'
        && url.protocol === 'https:' && url.origin === base.origin
        && url.username === '' && url.password === '' && url.search === '' && url.hash === ''
        && url.pathname === '/parla/' + encodeURIComponent(link.data.linkId)
        && (0, capability_call_context_js_1.sameCapabilityScope)(link.data.scope, scope.data);
}
/**
 * Validate freshly loaded server evidence before AND after every awaited operation.
 * This helper does not authenticate an HTTP caller, install a route or mint a provider session.
 */
function canAdmitElevenLabsWebViewer(rawSnapshot, expectedScope, rawViewer, configuredOrigin, now) {
    const snapshot = exports.ElevenLabsWebAdmissionSnapshotSchema.safeParse(rawSnapshot), viewer = exports.ElevenLabsWebViewerSchema.safeParse(rawViewer);
    const time = now.getTime();
    if (!snapshot.success || !viewer.success || !Number.isFinite(time))
        return false;
    const { policy, link, provider, lifecycle, invitation, invitationRevision } = snapshot.data;
    if (!isElevenLabsWebLinkCurrent(link, expectedScope, configuredOrigin))
        return false;
    if (lifecycle !== 'active' || policy.enabled === false || policy.paused || provider.desiredState !== 'active'
        || provider.mapping === null || provider.channel.state !== 'loaded' || provider.channel.loaded !== true
        || provider.channel.readiness !== 'ready' || provider.observedAt === null
        || Date.parse(provider.observedAt) > time || Date.parse(link.createdAt) > time)
        return false;
    if (policy.access === 'public')
        return true;
    if (viewer.data.kind !== 'authenticated')
        return false;
    const person = viewer.data;
    if (person.owner !== null && person.owner.tenantId === policy.scope.tenantId && person.owner.ownerId === policy.scope.ownerId)
        return true;
    return policy.access === 'invited' && invitation !== null
        && (0, web_channel_js_1.isElevenLabsWebInvitationCurrent)(invitation, policy.scope, person.userId, invitationRevision, now);
}
/** Secret-auth S2S only: Forge installs viewer from its session, X9 re-resolves scope and all evidence. */
exports.ElevenLabsWebSessionRequestSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    linkId: agent_management_js_1.AgentManagementRequestIdSchema, viewer: exports.ElevenLabsWebViewerSchema,
}).strict();
/** Internal mint readback. Only the signed transport artifact/window belongs in the public facade. */
exports.ElevenLabsWebSessionResultSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), requestId: agent_management_js_1.AgentManagementRequestIdSchema, scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    link: exports.ElevenLabsWebLinkSchema, policyVersion: agent_config_js_1.AgentConfigVersionSchema,
    mapping: index_js_1.ElevenLabsAgentMappingSchema, viewer: exports.ElevenLabsWebViewerSchema,
    invitation: web_channel_js_1.ElevenLabsWebInvitationSchema.nullable(), invitationRevision: agent_config_js_1.AgentConfigVersionSchema.nullable(),
    issuedAt: zod_1.z.iso.datetime({ offset: true }), expiresAt: zod_1.z.iso.datetime({ offset: true }),
    signedUrl: zod_1.z.url().max(4096),
}).strict().superRefine((result, ctx) => {
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(result.scope, result.mapping.scope) || !(0, capability_call_context_js_1.sameCapabilityScope)(result.scope, result.link.scope)
        || (result.invitation !== null && !(0, capability_call_context_js_1.sameCapabilityScope)(result.scope, result.invitation.scope)))
        ctx.addIssue({ code: 'custom', message: 'Mint evidence must share the full scope' });
    if ((result.invitation === null) !== (result.invitationRevision === null))
        ctx.addIssue({ code: 'custom', message: 'Mint invitation and revision are present together' });
    const duration = Date.parse(result.expiresAt) - Date.parse(result.issuedAt);
    if (duration <= 0 || duration > 15 * 60 * 1000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Provider connection window must be positive and no longer than fifteen minutes' });
    if (!isElevenLabsWebSignedConnectionUrl(result.signedUrl, result.mapping.providerAgentId)) {
        ctx.addIssue({ code: 'custom', path: ['signedUrl'], message: 'Expected a signed ElevenLabs conversation connection for the bound resource' });
    }
});
/** Reuses C3 transport validation. A valid URL is a bearer format, never evidence of admission or resource privacy. */
function isElevenLabsWebSignedConnectionUrl(rawUrl, expectedProviderAgentId) {
    const parsed = exports.ElevenLabsWebSessionResultSchema.shape.signedUrl.safeParse(rawUrl);
    const provider = index_js_1.ElevenLabsProviderAgentIdSchema.safeParse(expectedProviderAgentId);
    if (!parsed.success || !provider.success || !URL.canParse(parsed.data))
        return false;
    const url = new URL(parsed.data);
    return url.protocol === 'wss:' && url.host === 'api.elevenlabs.io' && url.pathname === '/v1/convai/conversation'
        && url.username === '' && url.password === '' && url.hash === ''
        && url.searchParams.getAll('agent_id').length === 1 && url.searchParams.get('agent_id') === provider.data
        && url.searchParams.getAll('conversation_signature').length === 1 && !!url.searchParams.get('conversation_signature');
}
/**
 * Recheck completion against NEW server evidence/viewer. Pause/revoke blocks new issuance; an already
 * delivered provider bearer URL or established conversation cannot be revoked by this validation helper.
 */
function isElevenLabsWebSessionCurrent(rawRequest, rawResult, currentSnapshot, currentViewer, configuredOrigin, now) {
    const request = exports.ElevenLabsWebSessionRequestSchema.safeParse(rawRequest), result = exports.ElevenLabsWebSessionResultSchema.safeParse(rawResult);
    const snapshot = exports.ElevenLabsWebAdmissionSnapshotSchema.safeParse(currentSnapshot), viewer = exports.ElevenLabsWebViewerSchema.safeParse(currentViewer);
    const time = now.getTime();
    if (!request.success || !result.success || !snapshot.success || !viewer.success || !Number.isFinite(time))
        return false;
    const command = request.data, lease = result.data, current = snapshot.data;
    return canAdmitElevenLabsWebViewer(current, command.scope, viewer.data, configuredOrigin, now)
        && lease.requestId === command.requestId && (0, capability_call_context_js_1.sameCapabilityScope)(lease.scope, command.scope)
        && command.linkId === current.link.linkId && JSON.stringify(lease.link) === JSON.stringify(current.link)
        && lease.policyVersion === current.policy.version && current.provider.mapping !== null
        && (0, index_js_1.sameElevenLabsMapping)(lease.mapping, current.provider.mapping)
        && JSON.stringify(command.viewer) === JSON.stringify(viewer.data) && JSON.stringify(lease.viewer) === JSON.stringify(viewer.data)
        && JSON.stringify(lease.invitation) === JSON.stringify(current.invitation) && lease.invitationRevision === current.invitationRevision
        && Date.parse(lease.issuedAt) <= time && Date.parse(lease.expiresAt) > time;
}
//# sourceMappingURL=web-session.js.map