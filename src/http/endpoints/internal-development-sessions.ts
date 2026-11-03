import { z } from 'zod';
import { AuthDeviceSignatureSchema } from '../../auth/device-signature.js';
import { CapabilityAgentScopeSchema } from '../../capability/capability-call-context.js';
import { DevelopmentSessionBindingSchema } from '../../capability/connect/development-session.js';
import {
  DevelopmentSessionConsentSchema,
  DevelopmentSessionPairingChallengeSchema,
} from '../../capability/connect/development-session-pairing.js';
import { DevelopmentSessionLeaseSchema } from '../../capability/connect/development-session-state.js';

export const DevelopmentSessionPairingParamsSchema = z.object({
  pairingId: z.string().min(1),
}).strict();

export const DevelopmentSessionParamsSchema = z.object({
  sessionId: z.string().min(1),
}).strict();

export const DevelopmentSessionStateQuerySchema = z.object({
  scope: CapabilityAgentScopeSchema,
}).strict();

export const DevelopmentSessionRevocationSchema = z.object({
  sessionId: z.string().min(1),
  status: z.literal('revoked'),
  revokedAt: z.string().datetime(),
}).strict();

/**
 * Internal routes are called by the authenticated backend after owner verification,
 * never directly by the browser. A body/query scope does not authenticate its owner.
 * The service must bind path pairingId/sessionId to trusted records and the
 * authenticated tenant/owner/agent scope, validate the registered device and its
 * signature, and consume the challenge and nonce exactly once.
 * Cloud targets reuse a registered adapter; platform/provider secrets stay outside
 * this API. Device signatures and consent do not authorize productive work without A11.
 */
export const startDevelopmentSessionPairingContract = {
  method: 'POST' as const,
  path: '/internal/connect/development-sessions/pairings' as const,
  authType: 'secret' as const,
  bodySchema: DevelopmentSessionBindingSchema,
  responseSchema: DevelopmentSessionPairingChallengeSchema,
} as const;

/** Device proof and consent require registry validation and single-use challenge/nonce consumption; A11 remains required for productive work. */
export const consentDevelopmentSessionContract = {
  method: 'POST' as const,
  path: '/connect/development-sessions/pairings/:pairingId/consent' as const,
  authType: 'device_signature' as const,
  headersSchema: AuthDeviceSignatureSchema,
  paramsSchema: DevelopmentSessionPairingParamsSchema,
  bodySchema: DevelopmentSessionConsentSchema,
  responseSchema: DevelopmentSessionLeaseSchema,
} as const;

/** Authenticated backend only, after owner verification; correlate sessionId and authenticated scope with the registry, never trust the query as authority. */
export const getDevelopmentSessionStateContract = {
  method: 'GET' as const,
  path: '/internal/connect/development-sessions/:sessionId/state' as const,
  authType: 'secret' as const,
  paramsSchema: DevelopmentSessionParamsSchema,
  querySchema: DevelopmentSessionStateQuerySchema,
  responseSchema: DevelopmentSessionLeaseSchema,
} as const;

/** Authenticated backend only, after owner verification; match sessionId and authenticated scope before revoking the trusted record. */
export const revokeDevelopmentSessionContract = {
  method: 'POST' as const,
  path: '/internal/connect/development-sessions/:sessionId/revoke' as const,
  authType: 'secret' as const,
  paramsSchema: DevelopmentSessionParamsSchema,
  bodySchema: CapabilityAgentScopeSchema,
  responseSchema: DevelopmentSessionRevocationSchema,
} as const;
