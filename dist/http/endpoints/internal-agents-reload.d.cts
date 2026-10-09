import { z } from 'zod';
/**
 * POST /internal/agents/:agentId/reload — reload a running agent.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-01
 *
 * agent-core validates agentId via AGENT_ID_SCHEMA regex test (alphanumeric + dash).
 * Response: `{ ok: true, agentId }` on success, `{ ok: false, error }` on failure.
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.reload(agentId)` via createBridgeClient<'secret'>
 */
export declare const ReloadAgentParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export type ReloadAgentParams = z.infer<typeof ReloadAgentParamsSchema>;
export declare const ReloadAgentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    agentId: z.ZodString;
    telegram: z.ZodOptional<z.ZodLiteral<"skipped">>;
    capabilityAttestations: z.ZodOptional<z.ZodArray<z.ZodObject<{
        capability: z.ZodLiteral<"paperclip">;
        readback: z.ZodObject<{
            scope: z.ZodObject<{
                agentId: z.ZodString;
                ownerId: z.ZodString;
                tenantId: z.ZodString;
            }, z.core.$strict>;
            unitId: z.ZodString;
            companyId: z.ZodUUID;
            paperclipAgentId: z.ZodUUID;
            enabled: z.ZodBoolean;
            roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
            callerRoleRef: z.ZodString;
            provisioningRevision: z.ZodNumber;
            provenance: z.ZodObject<{
                source: z.ZodLiteral<"native_operator_inventory">;
                inventoryFingerprint: z.ZodString;
            }, z.core.$strict>;
            appliedVersion: z.ZodNumber;
            registryFingerprint: z.ZodString;
            configFingerprint: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>>;
}, z.core.$strip>;
export type ReloadAgentResponse = z.infer<typeof ReloadAgentResponseSchema>;
export declare const ReloadAgentErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type ReloadAgentErrorResponse = z.infer<typeof ReloadAgentErrorResponseSchema>;
export declare const reloadAgentContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/reload";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        agentId: z.ZodString;
        telegram: z.ZodOptional<z.ZodLiteral<"skipped">>;
        capabilityAttestations: z.ZodOptional<z.ZodArray<z.ZodObject<{
            capability: z.ZodLiteral<"paperclip">;
            readback: z.ZodObject<{
                scope: z.ZodObject<{
                    agentId: z.ZodString;
                    ownerId: z.ZodString;
                    tenantId: z.ZodString;
                }, z.core.$strict>;
                unitId: z.ZodString;
                companyId: z.ZodUUID;
                paperclipAgentId: z.ZodUUID;
                enabled: z.ZodBoolean;
                roleAgents: z.ZodRecord<z.ZodString, z.ZodUUID>;
                callerRoleRef: z.ZodString;
                provisioningRevision: z.ZodNumber;
                provenance: z.ZodObject<{
                    source: z.ZodLiteral<"native_operator_inventory">;
                    inventoryFingerprint: z.ZodString;
                }, z.core.$strict>;
                appliedVersion: z.ZodNumber;
                registryFingerprint: z.ZodString;
                configFingerprint: z.ZodString;
            }, z.core.$strict>;
        }, z.core.$strict>>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-reload.d.ts.map