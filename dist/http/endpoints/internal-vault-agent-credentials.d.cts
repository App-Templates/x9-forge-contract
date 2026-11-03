import { z } from 'zod';
/**
 * /internal/vault/agents/:agentId/credentials/:key — per-agent Vault port for
 * the agent-level credentials a platform service writes on the agent's behalf
 * (today only the Paperclip key, written by the Forge factory `keys` step).
 * Auth: X-Internal-Secret carrying AGENT_CREDENTIAL_VAULT_SECRET.
 *
 * The response never carries the value; the tier is always `agent`.
 */
/** Env/vault name of the dedicated secret of this port (never projected into an agent). */
export declare const AGENT_CREDENTIAL_VAULT_SECRET_ENV: "AGENT_CREDENTIAL_VAULT_SECRET";
/** Closed list of keys this port accepts. */
export declare const AGENT_CREDENTIAL_PORT_KEYS: readonly ["PAPERCLIP_API_KEY"];
export declare const AgentCredentialPortKeySchema: z.ZodEnum<{
    PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
}>;
export type AgentCredentialPortKey = z.infer<typeof AgentCredentialPortKeySchema>;
export declare const AgentCredentialPortParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
    key: z.ZodEnum<{
        PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
    }>;
}, z.core.$strict>;
export type AgentCredentialPortParams = z.infer<typeof AgentCredentialPortParamsSchema>;
export declare const PutAgentCredentialBodySchema: z.ZodObject<{
    value: z.ZodString;
}, z.core.$strict>;
export type PutAgentCredentialBody = z.infer<typeof PutAgentCredentialBodySchema>;
export declare const PutAgentCredentialResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    key: z.ZodEnum<{
        PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
    }>;
    tier: z.ZodLiteral<"agent">;
}, z.core.$strict>;
export type PutAgentCredentialResponse = z.infer<typeof PutAgentCredentialResponseSchema>;
export declare const putAgentCredentialContract: {
    readonly method: "PUT";
    readonly path: "/internal/vault/agents/:agentId/credentials/:key";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly secretEnv: "AGENT_CREDENTIAL_VAULT_SECRET";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
        key: z.ZodEnum<{
            PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
        }>;
    }, z.core.$strict>;
    readonly bodySchema: z.ZodObject<{
        value: z.ZodString;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        key: z.ZodEnum<{
            PAPERCLIP_API_KEY: "PAPERCLIP_API_KEY";
        }>;
        tier: z.ZodLiteral<"agent">;
    }, z.core.$strict>;
};
//# sourceMappingURL=internal-vault-agent-credentials.d.ts.map