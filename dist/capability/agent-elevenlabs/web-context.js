import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { ElevenLabsWebViewerSchema, ElevenLabsWebAdmissionSnapshotSchema } from "./web-session.js";
export const ElevenLabsWebAdmissionPhaseSchema = z.enum(['before', 'after']);
/** X9 sends correlation only; Forge reloads the authenticated attempt from its own server state. */
export const ElevenLabsWebAuthorityRequestSchema = z.object({
    requestId: AgentManagementRequestIdSchema,
    scope: CapabilityAgentScopeSchema,
    linkId: AgentManagementRequestIdSchema,
    phase: ElevenLabsWebAdmissionPhaseSchema,
}).strict();
const ConfiguredOriginSchema = z.url().refine((value) => {
    if (!URL.canParse(value))
        return false;
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === ''
        && url.pathname === '/' && url.search === '' && url.hash === '';
}, { message: 'Expected the configured HTTPS origin without user info, path, query or fragment' });
// Single unresolved identity slot. Replace with D's verified canonical export after coordinator integration.
const AgentContextIdentitySchema = z.null();
/** Forge-only evidence. Parsing this snapshot never grants admission or authenticates a viewer. */
export const ElevenLabsWebAuthoritySnapshotSchema = ElevenLabsWebAuthorityRequestSchema.extend({
    viewer: ElevenLabsWebViewerSchema,
    lifecycle: ElevenLabsWebAdmissionSnapshotSchema.shape.lifecycle,
    configuredOrigin: ConfiguredOriginSchema,
    authorityVersion: AgentConfigVersionSchema,
    observedAt: z.iso.datetime({ offset: true }),
    expiresAt: z.iso.datetime({ offset: true }),
    agentIdentity: AgentContextIdentitySchema,
}).superRefine((snapshot, ctx) => {
    const duration = Date.parse(snapshot.expiresAt) - Date.parse(snapshot.observedAt);
    if (duration <= 0)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority expiry must follow observation' });
    if (duration > 60000)
        ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority window cannot exceed sixty seconds' });
});
/** Correlation/freshness only. Reload on both sides of every await; this is not an admission decision. */
export function isElevenLabsWebAuthorityCurrent(rawRequest, rawSnapshot, expectedViewer, configuredOrigin, expectedVersion, now) {
    const request = ElevenLabsWebAuthorityRequestSchema.safeParse(rawRequest);
    const snapshot = ElevenLabsWebAuthoritySnapshotSchema.safeParse(rawSnapshot);
    const viewer = ElevenLabsWebViewerSchema.safeParse(expectedViewer);
    const origin = ConfiguredOriginSchema.safeParse(configuredOrigin);
    const version = AgentConfigVersionSchema.safeParse(expectedVersion);
    const time = now.getTime();
    if (!request.success || !snapshot.success || !viewer.success || !origin.success || !version.success || !Number.isFinite(time))
        return false;
    const command = request.data, evidence = snapshot.data;
    return evidence.requestId === command.requestId
        && sameCapabilityScope(evidence.scope, command.scope)
        && evidence.linkId === command.linkId
        && evidence.phase === command.phase
        && evidence.authorityVersion === version.data
        && JSON.stringify(evidence.viewer) === JSON.stringify(viewer.data)
        && new URL(evidence.configuredOrigin).origin === new URL(origin.data).origin
        && Date.parse(evidence.observedAt) <= time
        && Date.parse(evidence.expiresAt) > time;
}
/** No successful issuance is representable until the canonical agent identity is integrated. */
export const ElevenLabsWebAuthorityResponseSchema = z.object({
    ok: z.literal(false),
    request: ElevenLabsWebAuthorityRequestSchema,
    error: z.enum(['identity_unavailable', 'source_unavailable', 'admission_expired', 'identity_mismatch', 'viewer_unavailable']),
    snapshot: ElevenLabsWebAuthoritySnapshotSchema.optional(),
}).strict().superRefine((response, ctx) => {
    if ((response.error === 'identity_unavailable') !== (response.snapshot !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Only unresolved identity returns a diagnostic snapshot' });
    }
    if (response.snapshot !== undefined) {
        const request = response.request, snapshot = response.snapshot;
        if (snapshot.requestId !== request.requestId || !sameCapabilityScope(snapshot.scope, request.scope)
            || snapshot.linkId !== request.linkId || snapshot.phase !== request.phase) {
            ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Diagnostic evidence must match the server attempt' });
        }
    }
});
//# sourceMappingURL=web-context.js.map