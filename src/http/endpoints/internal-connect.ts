import { z } from 'zod';
import {
  ConnectProviderSchema,
  ConnectRevokeRequestSchema,
  ConnectRevokeResponseSchema,
  ConnectScopeSchema,
  ConnectStartRequestSchema,
  ConnectStartResponseSchema,
  ConnectStateResponseSchema,
  ConnectToolPermitSchema,
} from '../../capability/connect/index.js';
import {
  PostVaultAccessTokenResponseSchema,
  VAULT_ACCESS_ERROR_CODES,
  VaultAccessScopeSchema,
  VaultConnectionParamsSchema,
} from './internal-vault-connection.js';

/**
 * /internal/connect/* — internal routes of the Connessioni service (cap-connect).
 * Direction: agent-core / X9 tool -> cap-connect.
 * Auth: X-Internal-Secret (fleet secret, INTERNAL_SECRET_HEADER).
 *
 * The state response never carries a Google token or value; the permit route
 * returns only a signed, time-limited permit for tools.
 */

/** Common error body of the Connessioni internal routes. */
export const ConnectErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string().min(1).max(500),
}).strict();
export type ConnectErrorResponse = z.infer<typeof ConnectErrorResponseSchema>;

export const ConnectStateParamsSchema = z.object({
  agentId: z.string().regex(/^[a-z0-9-]+$/),
  provider: ConnectProviderSchema,
}).strict();
export type ConnectStateParams = z.infer<typeof ConnectStateParamsSchema>;

export const IssueConnectPermitBodySchema = z.object({
  agentId: z.string().min(1),
  provider: ConnectProviderSchema,
  scopes: z.array(ConnectScopeSchema).min(1).refine((scopes) => new Set(scopes).size === scopes.length, {
    message: 'Scopes must not contain duplicates',
  }),
}).strict();
export type IssueConnectPermitBody = z.infer<typeof IssueConnectPermitBodySchema>;

export const IssueConnectPermitResponseSchema = z.discriminatedUnion('ok', [
  z.object({
    ok: z.literal(true),
    permit: ConnectToolPermitSchema,
    token: z.string().min(32),
  }).strict(),
  ConnectErrorResponseSchema,
]);
export type IssueConnectPermitResponse = z.infer<typeof IssueConnectPermitResponseSchema>;

/** Capability services (calendar, contacts, email) ask cap-connect for a short-lived access token. */
export const IssueConnectAccessTokenBodySchema = z.object({
  agentId: VaultConnectionParamsSchema.shape.agentId,
  provider: ConnectProviderSchema,
  scope: VaultAccessScopeSchema,
  personRef: z.string().min(1),
}).strict();
export type IssueConnectAccessTokenBody = z.infer<typeof IssueConnectAccessTokenBodySchema>;

export const CONNECT_ACCESS_ERROR_CODES = [
  ...VAULT_ACCESS_ERROR_CODES,
  'person_not_determinable',
  'unavailable',
] as const;
export const ConnectAccessErrorCodeSchema = z.enum(CONNECT_ACCESS_ERROR_CODES);
export type ConnectAccessErrorCode = z.infer<typeof ConnectAccessErrorCodeSchema>;

export const IssueConnectAccessTokenResponseSchema = z.discriminatedUnion('ok', [
  PostVaultAccessTokenResponseSchema,
  z.object({
    ok: z.literal(false),
    error: ConnectAccessErrorCodeSchema,
  }).strict(),
]);
export type IssueConnectAccessTokenResponse = z.infer<typeof IssueConnectAccessTokenResponseSchema>;

export const startConnectContract = {
  method: 'POST' as const,
  path: '/internal/connect/start' as const,
  authType: 'secret' as const,
  bodySchema: ConnectStartRequestSchema,
  responseSchema: ConnectStartResponseSchema,
} as const;

export const getConnectStateContract = {
  method: 'GET' as const,
  path: '/internal/connect/state/:agentId/:provider' as const,
  authType: 'secret' as const,
  paramsSchema: ConnectStateParamsSchema,
  responseSchema: ConnectStateResponseSchema,
} as const;

export const revokeConnectContract = {
  method: 'POST' as const,
  path: '/internal/connect/revoke' as const,
  authType: 'secret' as const,
  bodySchema: ConnectRevokeRequestSchema,
  responseSchema: ConnectRevokeResponseSchema,
} as const;

export const issueConnectPermitContract = {
  method: 'POST' as const,
  path: '/internal/connect/permit' as const,
  authType: 'secret' as const,
  bodySchema: IssueConnectPermitBodySchema,
  responseSchema: IssueConnectPermitResponseSchema,
} as const;

export const issueConnectAccessTokenContract = {
  method: 'POST' as const,
  path: '/internal/connect/access-token' as const,
  authType: 'secret' as const,
  bodySchema: IssueConnectAccessTokenBodySchema,
  responseSchema: IssueConnectAccessTokenResponseSchema,
} as const;
