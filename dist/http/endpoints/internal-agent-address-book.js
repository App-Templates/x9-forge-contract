import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from "../../auth/auth-headers.js";
import { AgentKnowledgeAddressBookSchema, isAgentKnowledgeAddressBookCurrent } from "../../agent/agent-knowledge-address-book.js";
import { AgentChannelAccessErrorResponseSchema } from "../../agent/agent-channel-access-requests.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
export const AgentAddressBookChannelSchema = z.enum(['email', 'phone']);
export const AgentAddressBookParamsSchema = AgentManagementParamsSchema.extend({ kind: AgentAddressBookChannelSchema }).strict();
export const AgentAddressBookResponseSchema = z.object({ kind: AgentAddressBookChannelSchema, addressBook: AgentKnowledgeAddressBookSchema }).strict();
export const AgentAddressBookErrorResponseSchema = AgentChannelAccessErrorResponseSchema;
/** X9 -> Forge Conoscenza. Resolve trusted agent authority before fetching; never persist a copied allowlist.
 * Internal token authentication does not grant arbitrary owner/tenant access. This descriptor installs no handler.
 * Telegram retains its own approved-chat policy, never inferred from email or phone contacts.
 */
export const internalAgentAddressBookContract = {
    method: 'GET', path: '/internal/agents/:agentId/channels/:kind/address-book',
    authType: 'token', authHeader: INTERNAL_TOKEN_HEADER,
    paramsSchema: AgentAddressBookParamsSchema, responseSchema: AgentAddressBookResponseSchema,
    errorResponseSchema: AgentAddressBookErrorResponseSchema,
};
export function agentAddressBookPath(agentId, kind) {
    const params = AgentAddressBookParamsSchema.parse({ agentId, kind });
    return internalAgentAddressBookContract.path.replace(':agentId', params.agentId).replace(':kind', params.kind);
}
/** Correlate one response with the management route, requested door and full trusted runtime authority. */
export function isAgentAddressBookResponseForRequest(rawResponse, rawParams, rawBinding, now, maximumAgeMs = 60_000) {
    const response = AgentAddressBookResponseSchema.safeParse(rawResponse), params = AgentAddressBookParamsSchema.safeParse(rawParams);
    if (!response.success || !params.success)
        return false;
    if (response.data.kind !== params.data.kind || response.data.addressBook.identity.managementAgentId !== params.data.agentId)
        return false;
    return isAgentKnowledgeAddressBookCurrent(response.data.addressBook, rawBinding, now, maximumAgeMs);
}
//# sourceMappingURL=internal-agent-address-book.js.map