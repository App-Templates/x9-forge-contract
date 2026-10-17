"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentOrdinaryAuthorityContract = void 0;
exports.agentOrdinaryAuthorityPath = agentOrdinaryAuthorityPath;
const ordinary_authority_js_1 = require("../../agent/ordinary-authority.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
/** Internal services only. The Core handler requires configured authentication before reading retained state. */
exports.agentOrdinaryAuthorityContract = {
    ...internal_agents_management_js_1.agentManagementStateContract,
    querySchema: ordinary_authority_js_1.AgentOrdinaryAuthorityQuerySchema,
    responseSchema: ordinary_authority_js_1.AgentOrdinaryAuthoritySchema,
};
function agentOrdinaryAuthorityPath(managementAgentId, query) {
    const parsed = ordinary_authority_js_1.AgentOrdinaryAuthorityQuerySchema.parse(query);
    const params = new URLSearchParams(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
    return `${(0, internal_agents_management_js_1.agentManagementPath)(managementAgentId)}?${params.toString()}`;
}
//# sourceMappingURL=internal-agents-ordinary-authority.js.map