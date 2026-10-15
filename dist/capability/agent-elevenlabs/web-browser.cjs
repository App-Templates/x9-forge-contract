"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebBrowserErrorResponseSchema = exports.ElevenLabsWebBrowserMetadataSchema = exports.ElevenLabsWebBrowserSessionSchema = exports.ElevenLabsWebBrowserRequestSchema = void 0;
exports.projectElevenLabsWebBrowserSession = projectElevenLabsWebBrowserSession;
exports.projectElevenLabsWebBrowserMetadata = projectElevenLabsWebBrowserMetadata;
exports.isElevenLabsWebBrowserMetadataCurrent = isElevenLabsWebBrowserMetadataCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const web_channel_js_1 = require("./web-channel.cjs");
const web_session_js_1 = require("./web-session.cjs");
const web_context_js_1 = require("./web-context.cjs");
const web_session_js_2 = require("./web-session.cjs");
/** Correlation only. Forge reloads viewer, owner, scope and admission evidence from its own server session. */
exports.ElevenLabsWebBrowserRequestSchema = zod_1.z.object({
    requestId: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.requestId, linkId: web_session_js_2.ElevenLabsWebLinkSchema.shape.linkId,
}).strict();
/** Only the admitted browser receives this short transport lease; never persist, log or include it in history. */
exports.ElevenLabsWebBrowserSessionSchema = zod_1.z.object({
    ok: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.ok,
    requestId: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.requestId, linkId: web_session_js_2.ElevenLabsWebLinkSchema.shape.linkId,
    issuedAt: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.issuedAt, expiresAt: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.expiresAt,
    signedUrl: web_session_js_2.ElevenLabsWebSessionResultSchema.shape.signedUrl,
}).strict().superRefine((lease, ctx) => {
    const duration = Date.parse(lease.expiresAt) - Date.parse(lease.issuedAt);
    if (duration <= 0 || duration > 15 * 60_000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Connection window must be positive and no longer than fifteen minutes' }); // guard:browser-window
    if (!URL.canParse(lease.signedUrl))
        return;
    const providerId = new URL(lease.signedUrl).searchParams.get('agent_id');
    if (!(0, web_session_js_2.isElevenLabsWebSignedConnectionUrl)(lease.signedUrl, providerId))
        ctx.addIssue({ code: 'custom', path: ['signedUrl'], message: 'Expected the canonical ElevenLabs signed connection format' }); // guard:browser-url
});
function projectElevenLabsWebBrowserSession(evidence) {
    const browser = exports.ElevenLabsWebBrowserRequestSchema.safeParse(evidence.browserRequest);
    const request = web_session_js_2.ElevenLabsWebSessionRequestSchema.safeParse(evidence.internalRequest);
    const result = web_session_js_2.ElevenLabsWebSessionResultSchema.safeParse(evidence.internalResult);
    if (!browser.success || !request.success || !result.success)
        return null; // guard:projection-parse
    if (browser.data.requestId !== request.data.requestId || browser.data.linkId !== request.data.linkId)
        return null; // guard:projection-request
    if (!(0, web_session_js_2.isElevenLabsWebSessionCurrent)(request.data, result.data, evidence.snapshot, evidence.viewer, evidence.configuredOrigin, evidence.now))
        return null; // guard:projection-session
    const authorityRequest = { requestId: request.data.requestId, scope: request.data.scope, linkId: request.data.linkId, phase: 'after' };
    if (!(0, web_context_js_1.isElevenLabsWebAuthorityUsable)(authorityRequest, evidence.authorityResponse, evidence.viewer, evidence.configuredOrigin, evidence.authorityVersion, evidence.agentIdentity, evidence.now))
        return null; // guard:projection-authority
    return exports.ElevenLabsWebBrowserSessionSchema.parse({ ok: true, requestId: result.data.requestId, linkId: result.data.link.linkId,
        issuedAt: result.data.issuedAt, expiresAt: result.data.expiresAt, signedUrl: result.data.signedUrl }); // guard:projection-fields
}
/** Public pre-Start data for an already authorized viewer. Never contains a provider artifact or private identity. */
exports.ElevenLabsWebBrowserMetadataSchema = zod_1.z.object({
    ok: zod_1.z.literal(true), linkId: web_session_js_2.ElevenLabsWebLinkSchema.shape.linkId,
    displayName: zod_1.z.string().trim().min(1).max(200),
    state: zod_1.z.enum(['ready', 'off', 'paused', 'unavailable']),
    observedAt: zod_1.z.iso.datetime({ offset: true }),
}).strict();
/** Fixed public failures: no provider details, scope, membership or diagnostics. */
exports.ElevenLabsWebBrowserErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum(['invalid_request', 'authentication_required', 'access_denied', 'source_unavailable', 'session_in_progress']),
}).strict();
function projectElevenLabsWebBrowserMetadata(evidence) {
    const snapshot = web_session_js_1.ElevenLabsWebAdmissionSnapshotSchema.safeParse(evidence.snapshot);
    const viewer = web_session_js_1.ElevenLabsWebViewerSchema.safeParse(evidence.viewer);
    const scope = capability_call_context_js_1.CapabilityAgentScopeSchema.safeParse(evidence.expectedScope);
    const metadata = exports.ElevenLabsWebBrowserMetadataSchema.safeParse({ ok: true, linkId: evidence.linkId,
        displayName: evidence.displayName, state: 'unavailable', observedAt: evidence.observedAt });
    if (!snapshot.success || !viewer.success || !scope.success || !metadata.success
        || !isElevenLabsWebBrowserMetadataCurrent(metadata.data, evidence.linkId, evidence.now))
        return null;
    const { policy, link, provider, lifecycle, invitation, invitationRevision } = snapshot.data;
    if (lifecycle !== 'active' || link.linkId !== metadata.data.linkId
        || !(0, web_session_js_1.isElevenLabsWebLinkCurrent)(link, scope.data, evidence.configuredOrigin)
        || Date.parse(link.createdAt) > evidence.now.getTime())
        return null; // guard:metadata-binding
    // Authorization is independent of readiness: an admitted viewer may see an off or paused channel.
    const person = viewer.data;
    const owner = person.kind === 'authenticated' && person.owner !== null
        && person.owner.tenantId === policy.scope.tenantId && person.owner.ownerId === policy.scope.ownerId;
    const invited = person.kind === 'authenticated' && policy.access === 'invited' && invitation !== null
        && (0, web_channel_js_1.isElevenLabsWebInvitationCurrent)(invitation, scope.data, person.userId, invitationRevision, evidence.now);
    if (policy.access !== 'public' && !owner && !invited)
        return null; // guard:metadata-access
    const providerAge = provider.observedAt === null ? Infinity : evidence.now.getTime() - Date.parse(provider.observedAt);
    const ready = providerAge >= 0 && providerAge < 60_000
        && (0, web_session_js_1.canAdmitElevenLabsWebViewer)(snapshot.data, scope.data, person, evidence.configuredOrigin, evidence.now);
    return { ...metadata.data, state: policy.enabled === false ? 'off' : policy.paused ? 'paused' : ready ? 'ready' : 'unavailable' };
}
/** Metadata is a short-lived display observation, never permission to mint a transport lease. */
function isElevenLabsWebBrowserMetadataCurrent(rawMetadata, expectedLinkId, now) {
    const metadata = exports.ElevenLabsWebBrowserMetadataSchema.safeParse(rawMetadata);
    const link = web_session_js_2.ElevenLabsWebLinkSchema.shape.linkId.safeParse(expectedLinkId);
    const time = now.getTime();
    if (!metadata.success || !link.success || !Number.isFinite(time) || metadata.data.linkId !== link.data)
        return false;
    const age = time - Date.parse(metadata.data.observedAt);
    return age >= 0 && age < 60_000; // guard:metadata-freshness
}
//# sourceMappingURL=web-browser.js.map