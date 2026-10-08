"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebAuthorityResponseSchema = exports.ElevenLabsWebAuthoritySnapshotSchema = exports.ElevenLabsWebAuthorityRequestSchema = exports.ElevenLabsWebAdmissionPhaseSchema = void 0;
exports.isElevenLabsWebAuthorityCurrent = isElevenLabsWebAuthorityCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_management_js_1 = require("../../agent/agent-management.cjs");
const web_session_js_1 = require("./web-session.cjs");
exports.ElevenLabsWebAdmissionPhaseSchema = zod_1.z.enum(['before', 'after']);
/** X9 sends correlation only; Forge reloads the authenticated attempt from its own server state. */
exports.ElevenLabsWebAuthorityRequestSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema,
    linkId: agent_management_js_1.AgentManagementRequestIdSchema,
    phase: exports.ElevenLabsWebAdmissionPhaseSchema,
}).strict();
const ConfiguredOriginSchema = zod_1.z.url().refine((value) => {
    if (!URL.canParse(value))
        return false;
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === ''
        && url.pathname === '/' && url.search === '' && url.hash === '';
}, { message: 'Expected the configured HTTPS origin without user info, path, query or fragment' });
// Single unresolved identity slot. Replace with D's verified canonical export after coordinator integration.
const AgentContextIdentitySchema = zod_1.z.null();
/** Forge-only evidence. Parsing this snapshot never grants admission or authenticates a viewer. */
exports.ElevenLabsWebAuthoritySnapshotSchema = exports.ElevenLabsWebAuthorityRequestSchema.extend({
    viewer: web_session_js_1.ElevenLabsWebViewerSchema,
    lifecycle: web_session_js_1.ElevenLabsWebAdmissionSnapshotSchema.shape.lifecycle,
    configuredOrigin: ConfiguredOriginSchema,
    authorityVersion: agent_config_js_1.AgentConfigVersionSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }),
    expiresAt: zod_1.z.iso.datetime({ offset: true }),
    agentIdentity: AgentContextIdentitySchema,
}).superRefine((snapshot, ctx) => {
    const duration = Date.parse(snapshot.expiresAt) - Date.parse(snapshot.observedAt);
    if (duration <= 0)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority expiry must follow observation' });
    if (duration > 60000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority window cannot exceed sixty seconds' });
});
/** Correlation/freshness only. Reload on both sides of every await; this is not an admission decision. */
function isElevenLabsWebAuthorityCurrent(rawRequest, rawSnapshot, expectedViewer, configuredOrigin, expectedVersion, now) {
    const request = exports.ElevenLabsWebAuthorityRequestSchema.safeParse(rawRequest);
    const snapshot = exports.ElevenLabsWebAuthoritySnapshotSchema.safeParse(rawSnapshot);
    const viewer = web_session_js_1.ElevenLabsWebViewerSchema.safeParse(expectedViewer);
    const origin = ConfiguredOriginSchema.safeParse(configuredOrigin);
    const version = agent_config_js_1.AgentConfigVersionSchema.safeParse(expectedVersion);
    const time = now.getTime();
    if (!request.success || !snapshot.success || !viewer.success || !origin.success || !version.success || !Number.isFinite(time))
        return false;
    const command = request.data, evidence = snapshot.data;
    return evidence.requestId === command.requestId
        && (0, capability_call_context_js_1.sameCapabilityScope)(evidence.scope, command.scope)
        && evidence.linkId === command.linkId
        && evidence.phase === command.phase
        && evidence.authorityVersion === version.data
        && JSON.stringify(evidence.viewer) === JSON.stringify(viewer.data)
        && new URL(evidence.configuredOrigin).origin === new URL(origin.data).origin
        && Date.parse(evidence.observedAt) <= time
        && Date.parse(evidence.expiresAt) > time;
}
/** No successful issuance is representable until the canonical agent identity is integrated. */
exports.ElevenLabsWebAuthorityResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    request: exports.ElevenLabsWebAuthorityRequestSchema,
    error: zod_1.z.enum(['identity_unavailable', 'source_unavailable', 'admission_expired', 'identity_mismatch', 'viewer_unavailable']),
    snapshot: exports.ElevenLabsWebAuthoritySnapshotSchema.optional(),
}).strict().superRefine((response, ctx) => {
    if ((response.error === 'identity_unavailable') !== (response.snapshot !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Only unresolved identity returns a diagnostic snapshot' });
    }
    if (response.snapshot !== undefined) {
        const request = response.request, snapshot = response.snapshot;
        if (snapshot.requestId !== request.requestId || !(0, capability_call_context_js_1.sameCapabilityScope)(snapshot.scope, request.scope)
            || snapshot.linkId !== request.linkId || snapshot.phase !== request.phase) {
            ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Diagnostic evidence must match the server attempt' });
        }
    }
});
//# sourceMappingURL=web-context.js.map