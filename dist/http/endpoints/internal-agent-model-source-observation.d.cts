import { z } from 'zod';
/** Local loaded generation, available before priming without querying aggregate consumer state.
 * This observation grants no Master role; producers must recheck the generation after awaits.
 */
export declare const internalAgentModelSourceObservationContract: {
    readonly method: "GET";
    readonly path: "/internal/agents/:agentId/models/local-source";
    readonly authType: "secret";
    readonly authHeader: "X-Internal-Secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        identity: z.ZodObject<{
            managementAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            runtimeAgentId: z.core.$ZodBranded<z.ZodString, "AgentId", "out">;
            vaultAgentId: z.ZodNumber;
        }, z.core.$strict>;
        scope: z.ZodObject<{
            agentId: z.ZodString;
            ownerId: z.ZodString;
            tenantId: z.ZodString;
        }, z.core.$strict>;
        sourceVersion: z.ZodString;
        observedAt: z.ZodISODateTime;
        validUntil: z.ZodISODateTime;
    }, z.core.$strict>;
};
export declare function agentModelSourceObservationPath(agentId: string): string;
//# sourceMappingURL=internal-agent-model-source-observation.d.ts.map