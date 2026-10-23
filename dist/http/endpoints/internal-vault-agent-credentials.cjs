"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.putAgentCredentialContract = exports.PutAgentCredentialResponseSchema = exports.PutAgentCredentialBodySchema = exports.AgentCredentialPortParamsSchema = exports.AgentCredentialPortKeySchema = exports.AGENT_CREDENTIAL_PORT_KEYS = exports.AGENT_CREDENTIAL_VAULT_SECRET_ENV = void 0;
const zod_1 = require("zod");
const auth_headers_js_1 = require("../../auth/auth-headers.cjs");
const internal_vault_connection_js_1 = require("./internal-vault-connection.cjs");
/**
 * /internal/vault/agents/:agentId/credentials/:key — per-agent Vault port for
 * the agent-level credentials a platform service writes on the agent's behalf
 * (today only the Paperclip key, written by the Forge factory `keys` step).
 * Auth: X-Internal-Secret carrying AGENT_CREDENTIAL_VAULT_SECRET.
 *
 * The response never carries the value; the tier is always `agent`.
 */
/** Env/vault name of the dedicated secret of this port (never projected into an agent). */
exports.AGENT_CREDENTIAL_VAULT_SECRET_ENV = 'AGENT_CREDENTIAL_VAULT_SECRET';
/** Closed list of keys this port accepts. */
exports.AGENT_CREDENTIAL_PORT_KEYS = ['PAPERCLIP_API_KEY'];
exports.AgentCredentialPortKeySchema = zod_1.z.enum(exports.AGENT_CREDENTIAL_PORT_KEYS);
exports.AgentCredentialPortParamsSchema = zod_1.z.strictObject({
    agentId: internal_vault_connection_js_1.VaultConnectionParamsSchema.shape.agentId,
    key: exports.AgentCredentialPortKeySchema,
});
exports.PutAgentCredentialBodySchema = zod_1.z.strictObject({
    value: zod_1.z.string().min(1).max(internal_vault_connection_js_1.VAULT_CONNECTION_VALUE_MAX_LENGTH),
});
exports.PutAgentCredentialResponseSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(true),
    key: exports.AgentCredentialPortKeySchema,
    tier: zod_1.z.literal('agent'),
});
exports.putAgentCredentialContract = {
    method: 'PUT',
    path: '/internal/vault/agents/:agentId/credentials/:key',
    authType: 'secret',
    authHeader: auth_headers_js_1.INTERNAL_SECRET_HEADER,
    secretEnv: exports.AGENT_CREDENTIAL_VAULT_SECRET_ENV,
    paramsSchema: exports.AgentCredentialPortParamsSchema,
    bodySchema: exports.PutAgentCredentialBodySchema,
    responseSchema: exports.PutAgentCredentialResponseSchema,
};
//# sourceMappingURL=internal-vault-agent-credentials.js.map