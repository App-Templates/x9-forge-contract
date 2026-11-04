// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (see scripts/check-portable-dts.mjs).
import { z } from 'zod';
import { CapabilityAgentParamsSchema, AgentConfigSavedSchema } from './internal-capability-agent.js';
import { DevAgentConfigSchema, DevAgentConfigStateSchema } from '../../capability/dev/config-state.js';
import { CapabilityCallIdentitySchema } from '../../capability/capability-call-identity.js';

/**
 * cap-dev per-agent routes (P04-d). Direction: Forge / X9 -> cap-dev.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 */

/** GET the agent's cap-dev configuration. */
export const devConfigGetContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/dev/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: DevAgentConfigSchema,
} as const;

/** PUT the agent's cap-dev configuration. */
export const devConfigPutContract = {
  method: 'PUT' as const,
  path: '/internal/capability/agents/:agentId/dev/config' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: DevAgentConfigSchema,
  responseSchema: AgentConfigSavedSchema,
} as const;

/** GET the agent's cap-dev configuration together with its reported state. */
export const devStateGetContract = {
  method: 'GET' as const,
  path: '/internal/capability/agents/:agentId/dev/state' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  responseSchema: DevAgentConfigStateSchema,
} as const;

export const DevBusinessUnitProjectEnableRequestSchema = z.strictObject({
  tenantId: CapabilityCallIdentitySchema.shape.tenantId,
  ownerId: CapabilityCallIdentitySchema.shape.ownerId,
  projectId: z.string().min(1).max(64),
});
export type DevBusinessUnitProjectEnableRequest = z.infer<typeof DevBusinessUnitProjectEnableRequestSchema>;

export const DevBusinessUnitProjectEnableResponseSchema = z.strictObject({
  status: z.enum(['enabled', 'already']),
  configVersion: z.number().int().min(1),
  allowedProjectIds: z.array(z.string().min(1)).min(1),
});
export type DevBusinessUnitProjectEnableResponse = z.infer<typeof DevBusinessUnitProjectEnableResponseSchema>;

/**
 * Platform → cap-dev. cap-dev composes the lead's configuration from its own deployment
 * (board = SESSION_BOARD_REPO) and adds the project; idempotent. Refusals: 403 not a
 * business unit lead or foreign scope, 409 disabled by the owner, 503 sessions switched off.
 */
export const devBusinessUnitProjectEnableContract = {
  method: 'POST' as const,
  path: '/internal/capability/agents/:agentId/dev/business-unit-project' as const,
  authType: 'secret' as const,
  paramsSchema: CapabilityAgentParamsSchema,
  bodySchema: DevBusinessUnitProjectEnableRequestSchema,
  responseSchema: DevBusinessUnitProjectEnableResponseSchema,
} as const;
