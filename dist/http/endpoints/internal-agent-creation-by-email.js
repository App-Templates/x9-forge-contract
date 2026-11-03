import { AgentCreationByEmailRequestSchema, AgentCreationByEmailResultSchema, } from "../../agent/agent-creation-by-email.js";
/** agent-core -> Forge factory, X-Internal-Secret as existing internal calls.
 * Creates an agent for a recipient named only by email; the owner is resolved by the producer.
 * Error bodies use AgentCreationByEmailErrorSchema from `../../agent/agent-creation-by-email.js`:
 * no other endpoint contract carries an `errorSchema` field, so it is omitted here.
 * This adds a contract, not a route implementation.
 */
export const internalAgentCreationByEmailContract = {
    method: 'POST',
    path: '/internal/agents/create-by-email',
    authType: 'secret',
    bodySchema: AgentCreationByEmailRequestSchema,
    responseSchema: AgentCreationByEmailResultSchema,
};
//# sourceMappingURL=internal-agent-creation-by-email.js.map