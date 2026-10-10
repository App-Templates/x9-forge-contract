"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalAgentAddressBookContract = exports.AgentAddressBookErrorResponseSchema = exports.AgentAddressBookResponseSchema = exports.AgentAddressBookParamsSchema = exports.AgentAddressBookChannelSchema = void 0;
exports.agentAddressBookPath = agentAddressBookPath;
exports.isAgentAddressBookResponseForRequest = isAgentAddressBookResponseForRequest;
const zod_1 = require("zod");
const auth_headers_js_1 = require("../../auth/auth-headers.cjs");
const agent_knowledge_address_book_js_1 = require("../../agent/agent-knowledge-address-book.cjs");
const agent_channel_access_requests_js_1 = require("../../agent/agent-channel-access-requests.cjs");
const internal_agents_management_js_1 = require("./internal-agents-management.cjs");
exports.AgentAddressBookChannelSchema = zod_1.z.enum(['email', 'phone']);
exports.AgentAddressBookParamsSchema = internal_agents_management_js_1.AgentManagementParamsSchema.extend({ kind: exports.AgentAddressBookChannelSchema }).strict();
exports.AgentAddressBookResponseSchema = zod_1.z.object({ kind: exports.AgentAddressBookChannelSchema, addressBook: agent_knowledge_address_book_js_1.AgentKnowledgeAddressBookSchema }).strict();
exports.AgentAddressBookErrorResponseSchema = agent_channel_access_requests_js_1.AgentChannelAccessErrorResponseSchema;
/** X9 -> Forge Conoscenza. Resolve trusted agent authority before fetching; never persist a copied allowlist.
 * Internal token authentication does not grant arbitrary owner/tenant access. This descriptor installs no handler.
 * Telegram retains its own approved-chat policy, never inferred from email or phone contacts.
 */
exports.internalAgentAddressBookContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/address-book',
    authType: 'token', authHeader: auth_headers_js_1.INTERNAL_TOKEN_HEADER,
    paramsSchema: exports.AgentAddressBookParamsSchema, responseSchema: exports.AgentAddressBookResponseSchema,
    errorResponseSchema: exports.AgentAddressBookErrorResponseSchema,
};
function agentAddressBookPath(agentId, kind) {
    const params = exports.AgentAddressBookParamsSchema.parse({ agentId, kind });
    return exports.internalAgentAddressBookContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
/** Correlate one response with the management route, requested door and full trusted runtime authority. */
function isAgentAddressBookResponseForRequest(rawResponse, rawParams, rawBinding, now, maximumAgeMs = 60_000) {
    const response = exports.AgentAddressBookResponseSchema.safeParse(rawResponse), params = exports.AgentAddressBookParamsSchema.safeParse(rawParams);
    if (!response.success || !params.success)
        return false;
    if (response.data.kind !== params.data.kind || response.data.addressBook.identity.managementAgentId !== params.data.agentId)
        return false;
    return (0, agent_knowledge_address_book_js_1.isAgentKnowledgeAddressBookCurrent)(response.data.addressBook, rawBinding, now, maximumAgeMs);
}
//# sourceMappingURL=internal-agent-address-book.js.map