import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { AgentModelSourceObservationSchema } from "../../model-router/agent-model-configuration.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
export const internalAgentModelSourceObservationContract = {
    method: 'GET',
    path: '/internal/agents/:agentId/models/local-source',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: AgentManagementParamsSchema,
    responseSchema: AgentModelSourceObservationSchema,
};
export function agentModelSourceObservationPath(agentId) {
    return internalAgentModelSourceObservationContract.path.replace(':agentId', AgentManagementParamsSchema.parse({ agentId }).agentId);
}
//# sourceMappingURL=internal-agent-model-source-observation.js.map