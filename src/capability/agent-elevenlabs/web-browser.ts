import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability-call-context.js';
import { isElevenLabsWebInvitationCurrent } from './web-channel.js';
import { ElevenLabsWebAdmissionSnapshotSchema, ElevenLabsWebViewerSchema, isElevenLabsWebLinkCurrent, canAdmitElevenLabsWebViewer } from './web-session.js';
import { isElevenLabsWebAuthorityUsable } from './web-context.js';
import { ElevenLabsWebSessionRequestSchema, ElevenLabsWebSessionResultSchema, ElevenLabsWebLinkSchema, isElevenLabsWebSessionCurrent, isElevenLabsWebSignedConnectionUrl } from './web-session.js';
/** Correlation only. Forge reloads viewer, owner, scope and admission evidence from its own server session. */
export const ElevenLabsWebBrowserRequestSchema = z.object({
  requestId: ElevenLabsWebSessionResultSchema.shape.requestId, linkId: ElevenLabsWebLinkSchema.shape.linkId,
}).strict();
export type ElevenLabsWebBrowserRequest = z.infer<typeof ElevenLabsWebBrowserRequestSchema>;
/** Only the admitted browser receives this short transport lease; never persist, log or include it in history. */
export const ElevenLabsWebBrowserSessionSchema = z.object({
  ok: ElevenLabsWebSessionResultSchema.shape.ok,
  requestId: ElevenLabsWebSessionResultSchema.shape.requestId, linkId: ElevenLabsWebLinkSchema.shape.linkId,
  issuedAt: ElevenLabsWebSessionResultSchema.shape.issuedAt, expiresAt: ElevenLabsWebSessionResultSchema.shape.expiresAt,
  signedUrl: ElevenLabsWebSessionResultSchema.shape.signedUrl,
}).strict().superRefine((lease, ctx) => {
  const duration = Date.parse(lease.expiresAt) - Date.parse(lease.issuedAt);
  if (duration <= 0 || duration > 15 * 60_000) ctx.addIssue({ code: 'custom', path: ['expiresAt'], message: 'Connection window must be positive and no longer than fifteen minutes' }); // guard:browser-window
  if (!URL.canParse(lease.signedUrl)) return;
  const providerId = new URL(lease.signedUrl).searchParams.get('agent_id');
  if (!isElevenLabsWebSignedConnectionUrl(lease.signedUrl, providerId)) ctx.addIssue({ code: 'custom', path: ['signedUrl'], message: 'Expected the canonical ElevenLabs signed connection format' }); // guard:browser-url
});
export type ElevenLabsWebBrowserSession = z.infer<typeof ElevenLabsWebBrowserSessionSchema>;
/** Not a wire request: all fields except browserRequest are freshly loaded server evidence. */
export interface ElevenLabsWebBrowserSessionEvidence {
  browserRequest: unknown; internalRequest: unknown; internalResult: unknown; snapshot: unknown; viewer: unknown;
  configuredOrigin: unknown; authorityResponse: unknown; authorityVersion: unknown; agentIdentity: unknown; now: Date;
}
export function projectElevenLabsWebBrowserSession(evidence: ElevenLabsWebBrowserSessionEvidence): ElevenLabsWebBrowserSession | null {
  const browser = ElevenLabsWebBrowserRequestSchema.safeParse(evidence.browserRequest);
  const request = ElevenLabsWebSessionRequestSchema.safeParse(evidence.internalRequest);
  const result = ElevenLabsWebSessionResultSchema.safeParse(evidence.internalResult);
  if (!browser.success || !request.success || !result.success) return null; // guard:projection-parse
  if (browser.data.requestId !== request.data.requestId || browser.data.linkId !== request.data.linkId) return null; // guard:projection-request
  if (!isElevenLabsWebSessionCurrent(request.data, result.data, evidence.snapshot, evidence.viewer, evidence.configuredOrigin, evidence.now)) return null; // guard:projection-session
  const authorityRequest = { requestId: request.data.requestId, scope: request.data.scope, linkId: request.data.linkId, phase: 'after' };
  if (!isElevenLabsWebAuthorityUsable(authorityRequest, evidence.authorityResponse, evidence.viewer, evidence.configuredOrigin,
    evidence.authorityVersion, evidence.agentIdentity, evidence.now)) return null; // guard:projection-authority
  return ElevenLabsWebBrowserSessionSchema.parse({ ok: true, requestId: result.data.requestId, linkId: result.data.link.linkId,
    issuedAt: result.data.issuedAt, expiresAt: result.data.expiresAt, signedUrl: result.data.signedUrl }); // guard:projection-fields
}

/** Public pre-Start data for an already authorized viewer. Never contains a provider artifact or private identity. */
export const ElevenLabsWebBrowserMetadataSchema = z.object({
  ok: z.literal(true), linkId: ElevenLabsWebLinkSchema.shape.linkId,
  displayName: z.string().trim().min(1).max(200),
  state: z.enum(['ready', 'off', 'paused', 'unavailable']),
  observedAt: z.iso.datetime({ offset: true }),
}).strict();
export type ElevenLabsWebBrowserMetadata = z.infer<typeof ElevenLabsWebBrowserMetadataSchema>;
/** Fixed public failures: no provider details, scope, membership or diagnostics. */
export const ElevenLabsWebBrowserErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.enum(['invalid_request', 'authentication_required', 'access_denied', 'source_unavailable', 'session_in_progress']),
}).strict();
export type ElevenLabsWebBrowserErrorResponse = z.infer<typeof ElevenLabsWebBrowserErrorResponseSchema>;
/** Server-only freshly resolved evidence. Calling this pure projection never authenticates a caller or starts an attempt. */
export interface ElevenLabsWebBrowserMetadataEvidence {
  linkId: unknown; expectedScope: unknown; snapshot: unknown; viewer: unknown; configuredOrigin: unknown;
  displayName: unknown; observedAt: unknown; now: Date;
}
export function projectElevenLabsWebBrowserMetadata(evidence: ElevenLabsWebBrowserMetadataEvidence): ElevenLabsWebBrowserMetadata | null {
  const snapshot = ElevenLabsWebAdmissionSnapshotSchema.safeParse(evidence.snapshot);
  const viewer = ElevenLabsWebViewerSchema.safeParse(evidence.viewer);
  const scope = CapabilityAgentScopeSchema.safeParse(evidence.expectedScope);
  const metadata = ElevenLabsWebBrowserMetadataSchema.safeParse({ ok: true, linkId: evidence.linkId,
    displayName: evidence.displayName, state: 'unavailable', observedAt: evidence.observedAt });
  if (!snapshot.success || !viewer.success || !scope.success || !metadata.success
    || !isElevenLabsWebBrowserMetadataCurrent(metadata.data, evidence.linkId, evidence.now)) return null;
  const { policy, link, provider, lifecycle, invitation, invitationRevision } = snapshot.data;
  if (lifecycle !== 'active' || link.linkId !== metadata.data.linkId
    || !isElevenLabsWebLinkCurrent(link, scope.data, evidence.configuredOrigin)
    || Date.parse(link.createdAt) > evidence.now.getTime()) return null; // guard:metadata-binding
  // Authorization is independent of readiness: an admitted viewer may see an off or paused channel.
  const person = viewer.data;
  const owner = person.kind === 'authenticated' && person.owner !== null
    && person.owner.tenantId === policy.scope.tenantId && person.owner.ownerId === policy.scope.ownerId;
  const invited = person.kind === 'authenticated' && policy.access === 'invited' && invitation !== null
    && isElevenLabsWebInvitationCurrent(invitation, scope.data, person.userId, invitationRevision, evidence.now);
  if (policy.access !== 'public' && !owner && !invited) return null; // guard:metadata-access
  const providerAge = provider.observedAt === null ? Infinity : evidence.now.getTime() - Date.parse(provider.observedAt);
  const ready = providerAge >= 0 && providerAge < 60_000
    && canAdmitElevenLabsWebViewer(snapshot.data, scope.data, person, evidence.configuredOrigin, evidence.now);
  return { ...metadata.data, state: policy.enabled === false ? 'off' : policy.paused ? 'paused' : ready ? 'ready' : 'unavailable' };
}
/** Metadata is a short-lived display observation, never permission to mint a transport lease. */
export function isElevenLabsWebBrowserMetadataCurrent(rawMetadata: unknown, expectedLinkId: unknown, now: Date): boolean {
  const metadata = ElevenLabsWebBrowserMetadataSchema.safeParse(rawMetadata);
  const link = ElevenLabsWebLinkSchema.shape.linkId.safeParse(expectedLinkId);
  const time = now.getTime();
  if (!metadata.success || !link.success || !Number.isFinite(time) || metadata.data.linkId !== link.data) return false;
  const age = time - Date.parse(metadata.data.observedAt);
  return age >= 0 && age < 60_000; // guard:metadata-freshness
}
