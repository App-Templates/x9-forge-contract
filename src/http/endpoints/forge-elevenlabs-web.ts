import { z } from 'zod';
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
