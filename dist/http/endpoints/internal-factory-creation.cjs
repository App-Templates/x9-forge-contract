"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalFactoryReplayableDeployContract = void 0;
const internal_factory_deploy_js_1 = require("./internal-factory-deploy.cjs");
const agent_creation_replay_js_1 = require("../../agent/agent-creation-replay.cjs");
/** R2 opt-in request on the existing S2S deploy route. Legacy 1.30 contract is untouched.
 * Producers must explicitly support this shape before consumers use it; no fallback to non-idempotent deploy.
 * Authentication and ownership are checked before scoped key lookup. A conflicting intent is HTTP409.
 */
exports.internalFactoryReplayableDeployContract = {
    ...internal_factory_deploy_js_1.internalFactoryDeployContract,
    bodySchema: agent_creation_replay_js_1.AgentCreationRequestSchema,
    responseSchema: agent_creation_replay_js_1.AgentCreationResultSchema,
};
//# sourceMappingURL=internal-factory-creation.js.map