import { z } from 'zod';
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
