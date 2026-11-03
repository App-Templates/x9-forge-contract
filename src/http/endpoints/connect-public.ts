import { z } from 'zod';
import { ConnectScopeSchema } from '../../capability/connect/index.js';

/**
 * Public pages of the Connessioni service (cap-connect), opened from a browser.
 * Auth: none. Safety comes from the one-time link token and the single-use
 * OAuth `state` (PKCE), not from the fleet secret.
 *
 * No response ever carries a Google code, access token or refresh token.
 */

/** Path of the Google return page; used to build the registered redirect URI. */
export const CONNECT_RETURN_PATH = '/connect/return' as const;

export const OpenConnectLinkParamsSchema = z.object({
  token: z.string().min(32).max(128).regex(/^[A-Za-z0-9_-]+$/),
}).strict();
export type OpenConnectLinkParams = z.infer<typeof OpenConnectLinkParamsSchema>;

export const OpenConnectLinkErrorReasonSchema = z.enum(['expired', 'invalid', 'used']);
export type OpenConnectLinkErrorReason = z.infer<typeof OpenConnectLinkErrorReasonSchema>;

export const OpenConnectLinkResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('redirect'),
    location: z.string().url().refine((u) => u.startsWith('https://'), { message: 'location must be https' }),
  }).strict(),
  z.object({
    kind: z.literal('error'),
    reason: OpenConnectLinkErrorReasonSchema,
  }).strict(),
]);
export type OpenConnectLinkResponse = z.infer<typeof OpenConnectLinkResponseSchema>;

export const ConnectReturnQuerySchema = z.object({
  state: z.string().min(32),
  code: z.string().min(1).optional(),
  error: z.string().min(1).optional(),
}).strict();
export type ConnectReturnQuery = z.infer<typeof ConnectReturnQuerySchema>;

export const ConnectReturnErrorReasonSchema = z.enum([
  'invalid_state',
  'denied',
  'exchange_failed',
  'vault_error',
]);
export type ConnectReturnErrorReason = z.infer<typeof ConnectReturnErrorReasonSchema>;

export const ConnectReturnResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('done'),
    accountLabel: z.string().min(1).max(200).optional(),
    scopes: z.array(ConnectScopeSchema),
  }).strict(),
  z.object({
    kind: z.literal('error'),
    reason: ConnectReturnErrorReasonSchema,
  }).strict(),
]);
export type ConnectReturnResponse = z.infer<typeof ConnectReturnResponseSchema>;

export const openConnectLinkContract = {
  method: 'GET' as const,
  path: '/connect/link/:token' as const,
  authType: 'none' as const,
  paramsSchema: OpenConnectLinkParamsSchema,
  responseSchema: OpenConnectLinkResponseSchema,
} as const;

export const connectReturnContract = {
  method: 'GET' as const,
  path: CONNECT_RETURN_PATH,
  authType: 'none' as const,
  querySchema: ConnectReturnQuerySchema,
  responseSchema: ConnectReturnResponseSchema,
} as const;
