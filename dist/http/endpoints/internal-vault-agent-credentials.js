import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/auth-headers.js";
import { VaultConnectionParamsSchema, VAULT_CONNECTION_VALUE_MAX_LENGTH } from "./internal-vault-connection.js";
/**
 * /internal/vault/agents/:agentId/credentials/:key — per-agent Vault port for
 * the agent-level credentials a platform service writes on the agent's behalf
 * (today only the Paperclip key, written by the Forge factory `keys` step).
 * Auth: X-Internal-Secret carrying AGENT_CREDENTIAL_VAULT_SECRET.
 *
 * The response never carries the value; the tier is always `agent`.
 */
/** Env/vault name of the dedicated secret of this port (never projected into an agent). */
export const AGENT_CREDENTIAL_VAULT_SECRET_ENV = 'AGENT_CREDENTIAL_VAULT_SECRET';
/** Closed list of keys this port accepts. */
export const AGENT_CREDENTIAL_PORT_KEYS = ['PAPERCLIP_API_KEY'];
export const AgentCredentialPortKeySchema = z.enum(AGENT_CREDENTIAL_PORT_KEYS);
export const AgentCredentialPortParamsSchema = z.strictObject({
    agentId: VaultConnectionParamsSchema.shape.agentId,
    key: AgentCredentialPortKeySchema,
});
export const PutAgentCredentialBodySchema = z.strictObject({
    value: z.string().min(1).max(VAULT_CONNECTION_VALUE_MAX_LENGTH),
});
export const PutAgentCredentialResponseSchema = z.strictObject({
    ok: z.literal(true),
    key: AgentCredentialPortKeySchema,
    tier: z.literal('agent'),
});
export const putAgentCredentialContract = {
    method: 'PUT',
    path: '/internal/vault/agents/:agentId/credentials/:key',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    secretEnv: AGENT_CREDENTIAL_VAULT_SECRET_ENV,
    paramsSchema: AgentCredentialPortParamsSchema,
    bodySchema: PutAgentCredentialBodySchema,
    responseSchema: PutAgentCredentialResponseSchema,
};
//# sourceMappingURL=internal-vault-agent-credentials.js.map