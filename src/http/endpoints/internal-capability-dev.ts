// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (see scripts/check-portable-dts.mjs).
import { z } from 'zod';
import { CapabilityAgentParamsSchema, AgentConfigSavedSchema } from './internal-capability-agent.js';
import { DevAgentConfigSchema, DevAgentConfigStateSchema } from '../../capability/dev/config-state.js';

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
