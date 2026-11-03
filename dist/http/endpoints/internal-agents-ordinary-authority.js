import { AgentOrdinaryAuthorityQuerySchema, AgentOrdinaryAuthoritySchema } from "../../agent/ordinary-authority.js";
import { agentManagementStateContract, agentManagementPath } from "./internal-agents-management.js";
/** Internal services only. The Core handler requires configured authentication before reading retained state. */
export const agentOrdinaryAuthorityContract = {
    ...agentManagementStateContract,
    querySchema: AgentOrdinaryAuthorityQuerySchema,
    responseSchema: AgentOrdinaryAuthoritySchema,
};
export function agentOrdinaryAuthorityPath(managementAgentId, query) {
    const parsed = AgentOrdinaryAuthorityQuerySchema.parse(query);
    const params = new URLSearchParams(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
    return `${agentManagementPath(managementAgentId)}?${params.toString()}`;
}
//# sourceMappingURL=internal-agents-ordinary-authority.js.map