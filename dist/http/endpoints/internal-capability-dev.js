// eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentional: in-scope `z` is required for TS to emit portable .d.ts (see scripts/check-portable-dts.mjs).
import { z } from 'zod';
import { CapabilityAgentParamsSchema, AgentConfigSavedSchema } from "./internal-capability-agent.js";
import { DevAgentConfigSchema, DevAgentConfigStateSchema } from "../../capability/dev/config-state.js";
import { CapabilityCallIdentitySchema } from "../../capability/capability-call-identity.js";
/**
 * cap-dev per-agent routes (P04-d). Direction: Forge / X9 -> cap-dev.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), like the other `/internal/capability/agents/:agentId/*` routes.
 */
/** GET the agent's cap-dev configuration. */
export const devConfigGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: DevAgentConfigSchema,
};
/** PUT the agent's cap-dev configuration. */
export const devConfigPutContract = {
    method: 'PUT',
    path: '/internal/capability/agents/:agentId/dev/config',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: DevAgentConfigSchema,
    responseSchema: AgentConfigSavedSchema,
};
/** GET the agent's cap-dev configuration together with its reported state. */
export const devStateGetContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/dev/state',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    responseSchema: DevAgentConfigStateSchema,
};
export const DevBusinessUnitProjectEnableRequestSchema = z.strictObject({
    tenantId: CapabilityCallIdentitySchema.shape.tenantId,
    ownerId: CapabilityCallIdentitySchema.shape.ownerId,
    projectId: z.string().min(1).max(64),
});
export const DevBusinessUnitProjectEnableResponseSchema = z.strictObject({
    status: z.enum(['enabled', 'already']),
    configVersion: z.number().int().min(1),
    allowedProjectIds: z.array(z.string().min(1)).min(1),
});
/**
 * Platform → cap-dev. cap-dev composes the lead's configuration from its own deployment
 * (board = SESSION_BOARD_REPO) and adds the project; idempotent. Refusals: 403 not a
 * business unit lead or foreign scope, 409 disabled by the owner, 503 sessions switched off.
 */
export const devBusinessUnitProjectEnableContract = {
    method: 'POST',
    path: '/internal/capability/agents/:agentId/dev/business-unit-project',
    authType: 'secret',
    paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: DevBusinessUnitProjectEnableRequestSchema,
    responseSchema: DevBusinessUnitProjectEnableResponseSchema,
};
//# sourceMappingURL=internal-capability-dev.js.map