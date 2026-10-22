import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { ModelCatalogSchema } from "../../model-router/model-catalog.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/** Metadata-only discovery scoped to the management agent and its effective credentials. */
export const internalAgentModelCatalogContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/models/catalog',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: AgentManagementParamsSchema,
    responseSchema: ModelCatalogSchema,
};
export function agentModelCatalogPath(agentId) {
    return internalAgentModelCatalogContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agent-model-catalog.js.map