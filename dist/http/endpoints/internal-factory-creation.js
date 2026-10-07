import { internalFactoryDeployContract } from "./internal-factory-deploy.js";
import { AgentCreationRequestSchema, AgentCreationResultSchema } from "../../agent/agent-creation-replay.js";
/** R2 opt-in request on the existing S2S deploy route. Legacy 1.30 contract is untouched.
 * Producers must explicitly support this shape before consumers use it; no fallback to non-idempotent deploy.
 * Authentication and ownership are checked before scoped key lookup. A conflicting intent is HTTP409.
 */
export const internalFactoryReplayableDeployContract = {
    ...internalFactoryDeployContract,
    bodySchema: AgentCreationRequestSchema,
    responseSchema: AgentCreationResultSchema,
};
//# sourceMappingURL=internal-factory-creation.js.map