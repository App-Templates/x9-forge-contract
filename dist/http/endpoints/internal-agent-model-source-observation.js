import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { AgentModelSourceObservationSchema } from "../../model-router/agent-model-configuration.js";
import { ModelConsumerStateRequestSchema, ModelConsumerRuntimeStateSchema } from "../../model-router/model-consumer-execution.js";
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
/** Personal voice sessions resolve the executing primary on the server, never from a guessed agent ID. */
export const internalPrimaryModelSourceObservationContract = {
    method: 'GET',
    path: '/internal/models/primary/local-source',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    responseSchema: AgentModelSourceObservationSchema,
};
/** cap-voice observes the server value used by its outgoing GPT-Live phone dispatcher. */
export const internalPhoneBackendModelSourceContract = {
    method: 'POST',
    path: '/internal/live/phone-backend-source',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    requestSchema: ModelConsumerStateRequestSchema.refine(value => value.slotId === 'voice_phone_delegation'),
    responseSchema: ModelConsumerRuntimeStateSchema,
};
//# sourceMappingURL=internal-agent-model-source-observation.js.map