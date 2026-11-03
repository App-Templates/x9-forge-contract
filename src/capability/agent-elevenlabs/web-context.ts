import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from '../capability-call-context.js';
import { AgentConfigVersionSchema } from '../ricerca/agent-config.js';
import { AgentManagementRequestIdSchema } from '../../agent/agent-management.js';
import { AgentContextIdentitySchema } from '../../agent/agent-context-identity.js';
import { ElevenLabsWebViewerSchema, ElevenLabsWebAdmissionSnapshotSchema } from './web-session.js';

export const ElevenLabsWebAdmissionPhaseSchema = z.enum(['before', 'after']);
export type ElevenLabsWebAdmissionPhase = z.infer<typeof ElevenLabsWebAdmissionPhaseSchema>;

/** X9 sends correlation only; Forge reloads the authenticated attempt from its own server state. */
export const ElevenLabsWebAuthorityRequestSchema = z.object({
  requestId: AgentManagementRequestIdSchema,
  scope: CapabilityAgentScopeSchema,
  linkId: AgentManagementRequestIdSchema,
  phase: ElevenLabsWebAdmissionPhaseSchema,
}).strict();
export type ElevenLabsWebAuthorityRequest = z.infer<typeof ElevenLabsWebAuthorityRequestSchema>;

const ConfiguredOriginSchema = z.url().refine((value) => {
  if (!URL.canParse(value)) return false;
  const url = new URL(value);
  return url.protocol === 'https:' && url.username === '' && url.password === ''
    && url.pathname === '/' && url.search === '' && url.hash === '';
}, { message: 'Expected the configured HTTPS origin without user info, path, query or fragment' });

// Reuse D's declared context authority. Null remains legacy diagnostic evidence only.

/** Forge-only evidence. Parsing this snapshot never grants admission or authenticates a viewer. */
export const ElevenLabsWebAuthoritySnapshotSchema = ElevenLabsWebAuthorityRequestSchema.extend({
  viewer: ElevenLabsWebViewerSchema,
  lifecycle: ElevenLabsWebAdmissionSnapshotSchema.shape.lifecycle,
  configuredOrigin: ConfiguredOriginSchema,
  authorityVersion: AgentConfigVersionSchema,
  observedAt: z.iso.datetime({ offset: true }),
  expiresAt: z.iso.datetime({ offset: true }),
  agentIdentity: AgentContextIdentitySchema.nullable(),
}).superRefine((snapshot, ctx) => {
  const identity = snapshot.agentIdentity;
  if (identity !== null && !sameCapabilityScope({ tenantId: identity.tenantId, ownerId: identity.ownerId, agentId: identity.agentId }, snapshot.scope)) {
    ctx.addIssue({ code: 'custom', path: ['agentIdentity'], message: 'Context authority belongs to another tenant, owner or runtime agent' }); // guard:identity-scope
  }
  const duration = Date.parse(snapshot.expiresAt) - Date.parse(snapshot.observedAt);
  if (duration <= 0) ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority expiry must follow observation' });
  if (duration > 60000) ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Authority window cannot exceed sixty seconds' });
});
export type ElevenLabsWebAuthoritySnapshot = z.infer<typeof ElevenLabsWebAuthoritySnapshotSchema>;

/** Correlation/freshness only. Reload on both sides of every await; this is not an admission decision. */
export function isElevenLabsWebAuthorityCurrent(rawRequest: unknown, rawSnapshot: unknown, expectedViewer: unknown, configuredOrigin: unknown, expectedVersion: unknown, now: Date): boolean {
  const request = ElevenLabsWebAuthorityRequestSchema.safeParse(rawRequest);
  const snapshot = ElevenLabsWebAuthoritySnapshotSchema.safeParse(rawSnapshot);
  const viewer = ElevenLabsWebViewerSchema.safeParse(expectedViewer);
  const origin = ConfiguredOriginSchema.safeParse(configuredOrigin);
  const version = AgentConfigVersionSchema.safeParse(expectedVersion);
  const time = now.getTime();
  if (!request.success || !snapshot.success || !viewer.success || !origin.success || !version.success || !Number.isFinite(time)) return false;
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

/** Legacy closed failures remain valid; diagnostics never grant authority. */
const ElevenLabsWebAuthorityFailureSchema = z.object({
  ok: z.literal(false),
  request: ElevenLabsWebAuthorityRequestSchema,
  error: z.enum(['identity_unavailable', 'source_unavailable', 'admission_expired', 'identity_mismatch', 'viewer_unavailable']),
  snapshot: ElevenLabsWebAuthoritySnapshotSchema.optional(),
}).strict().superRefine((response, ctx) => {
  if ((response.error === 'identity_unavailable') !== (response.snapshot !== undefined)) {
    ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Only unresolved identity returns a diagnostic snapshot' });
  }
  if (response.snapshot?.agentIdentity != null) ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Unresolved identity cannot publish resolved authority' }); // guard:failure-identity
  if (response.snapshot !== undefined) {
    const request = response.request, snapshot = response.snapshot;
    if (snapshot.requestId !== request.requestId || !sameCapabilityScope(snapshot.scope, request.scope)
      || snapshot.linkId !== request.linkId || snapshot.phase !== request.phase) {
      ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Diagnostic evidence must match the server attempt' });
    }
  }
});
/** Successful authority is scoped evidence only, not provider mapping or permission to issue a session. */
const ElevenLabsWebResolvedAuthoritySnapshotSchema = ElevenLabsWebAuthoritySnapshotSchema.safeExtend({
  agentIdentity: AgentContextIdentitySchema,
}).superRefine((snapshot, ctx) => {
  if (snapshot.lifecycle !== 'active') ctx.addIssue({ code: 'custom', path: ['lifecycle'], message: 'Only an active agent can provide usable web authority' }); // guard:success-lifecycle
});
const ElevenLabsWebAuthoritySuccessSchema = z.object({
  ok: z.literal(true), request: ElevenLabsWebAuthorityRequestSchema, snapshot: ElevenLabsWebResolvedAuthoritySnapshotSchema,
}).strict().superRefine((response, ctx) => {
  const request = response.request, snapshot = response.snapshot;
  if (snapshot.requestId !== request.requestId || !sameCapabilityScope(snapshot.scope, request.scope)
    || snapshot.linkId !== request.linkId || snapshot.phase !== request.phase) {
    ctx.addIssue({ code: 'custom', path: ['snapshot'], message: 'Successful evidence must match the server attempt' }); // guard:success-correlation
  }
});
export const ElevenLabsWebAuthorityResponseSchema = z.discriminatedUnion('ok', [ElevenLabsWebAuthorityFailureSchema, ElevenLabsWebAuthoritySuccessSchema]);
export type ElevenLabsWebAuthorityResponse = z.infer<typeof ElevenLabsWebAuthorityResponseSchema>;

/** Canonical identity and current correlation only. Expected identity is reloaded from the producer's server authority,
 * never the browser. The issuer must separately recheck policy, invitation, link and provider mapping before/after await.
 * The legacy current helper remains correlation-only and does not turn a null diagnostic into usable authority.
 */
export function isElevenLabsWebAuthorityUsable(rawRequest: unknown, rawResponse: unknown, expectedViewer: unknown, configuredOrigin: unknown, expectedVersion: unknown, expectedIdentity: unknown, now: Date): boolean {
  const response = ElevenLabsWebAuthorityResponseSchema.safeParse(rawResponse);
  const identity = AgentContextIdentitySchema.safeParse(expectedIdentity);
  if (!response.success || !response.data.ok || !identity.success) return false; // guard:usable-parse
  return isElevenLabsWebAuthorityCurrent(rawRequest, response.data.snapshot, expectedViewer, configuredOrigin, expectedVersion, now)
    && JSON.stringify(response.data.snapshot.agentIdentity) === JSON.stringify(identity.data); // guard:usable-identity
}
