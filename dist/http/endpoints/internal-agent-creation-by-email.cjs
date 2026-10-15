"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentCreationByEmailContract = void 0;
const agent_creation_by_email_js_1 = require("../../agent/agent-creation-by-email.cjs");
/** agent-core -> Forge factory, X-Internal-Secret as existing internal calls.
 * Creates an agent for a recipient named only by email; the owner is resolved by the producer.
 * Error bodies use AgentCreationByEmailErrorSchema from `../../agent/agent-creation-by-email.js`:
 * no other endpoint contract carries an `errorSchema` field, so it is omitted here.
 * This adds a contract, not a route implementation.
 */
exports.internalAgentCreationByEmailContract = {
    method: 'POST',
    path: '/internal/agents/create-by-email',
    authType: 'secret',
    bodySchema: agent_creation_by_email_js_1.AgentCreationByEmailRequestSchema,
    responseSchema: agent_creation_by_email_js_1.AgentCreationByEmailResultSchema,
};
//# sourceMappingURL=internal-agent-creation-by-email.js.map