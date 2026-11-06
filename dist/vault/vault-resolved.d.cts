import { z } from 'zod';
export declare const VaultResolvedEntrySchema: z.ZodObject<{
    key: z.ZodString;
    value: z.ZodString;
    tier: z.ZodEnum<{
        owner: "owner";
        agent: "agent";
        platform: "platform";
        preset: "preset";
    }>;
    secret: z.ZodBoolean;
}, z.core.$strict>;
export type VaultResolvedEntry = z.infer<typeof VaultResolvedEntrySchema>;
export declare const VaultResolvedResponseSchema: z.ZodObject<{
    agentId: z.ZodNumber;
    entries: z.ZodArray<z.ZodObject<{
        key: z.ZodString;
        value: z.ZodString;
        tier: z.ZodEnum<{
            owner: "owner";
            agent: "agent";
            platform: "platform";
            preset: "preset";
        }>;
        secret: z.ZodBoolean;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type VaultResolvedResponse = z.infer<typeof VaultResolvedResponseSchema>;
export declare const internalVaultResolvedContract: {
    readonly method: "GET";
    readonly path: "/api/internal/vault/agents/:agentId/resolved";
    readonly authType: "token";
    readonly authHeader: "X-Internal-Token";
    readonly responseSchema: z.ZodObject<{
        agentId: z.ZodNumber;
        entries: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            value: z.ZodString;
            tier: z.ZodEnum<{
                owner: "owner";
                agent: "agent";
                platform: "platform";
                preset: "preset";
            }>;
            secret: z.ZodBoolean;
        }, z.core.$strict>>;
    }, z.core.$strict>;
};
export declare function vaultResolvedPath(vaultAgentId: number): string;
/**
 * The only provider keys the primary agent reads from Forge.
 * Infrastructure credentials remain in the stack environment (R-17).
 */
export declare const PRIMARY_FORGE_PROVIDER_KEYS: readonly ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_API_KEY", "ELEVENLABS_API_KEY"];
//# sourceMappingURL=vault-resolved.d.ts.map