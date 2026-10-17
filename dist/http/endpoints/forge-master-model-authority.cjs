"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgeMasterModelAuthorityContract = void 0;
const index_js_1 = require("../../auth/index.cjs");
const agent_context_identity_js_1 = require("../../agent/agent-context-identity.cjs");
const agent_model_configuration_js_1 = require("../../model-router/agent-model-configuration.cjs");
/** X9 -> Factory. Forge attests its DB Master role against X9's current local source.
 * Metadata only; neither desired configuration nor caller-supplied role grants authority.
 */
exports.forgeMasterModelAuthorityContract = {
    method: 'POST',
    path: '/api/internal/factory/models/master-authority',
    authType: 'token',
    authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    bodySchema: agent_model_configuration_js_1.AgentModelSourceObservationSchema,
    responseSchema: agent_context_identity_js_1.AgentContextIdentitySchema,
};
//# sourceMappingURL=forge-master-model-authority.js.map