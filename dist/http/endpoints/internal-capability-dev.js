import { CapabilityAgentParamsSchema, AgentConfigSavedSchema } from "./internal-capability-agent.js";
import { DevAgentConfigSchema, DevAgentConfigStateSchema } from "../../capability/dev/config-state.js";
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
//# sourceMappingURL=internal-capability-dev.js.map