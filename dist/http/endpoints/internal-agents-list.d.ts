import { z } from 'zod';
/**
 * GET /internal/agents — list all loaded agents.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-03
 *
 * Real response shape from agent-core (services/agent-core/src/index.ts:328-333):
 *   { agents: [{ agentId: string, displayName: string, ownerId: string }] }
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.listAgents()` reads `data.agents.map(a => a.agentId)`
 *   - forge-v2 factory health route checks `data.agents.some(a => a.agentId === slug)`
 *
 * NOTE: This is the current shape. Does NOT yet conform to standard
 * BridgeSuccessResponse format. Standardization tracked for 04-03.
 */
export declare const ListAgentsAgentSchema: z.ZodObject<{
    agentId: z.ZodString;
    displayName: z.ZodString;
    ownerId: z.ZodString;
}, z.core.$strip>;
export type ListAgentsAgent = z.infer<typeof ListAgentsAgentSchema>;
export declare const ListAgentsResponseSchema: z.ZodObject<{
    agents: z.ZodArray<z.ZodObject<{
        agentId: z.ZodString;
        displayName: z.ZodString;
        ownerId: z.ZodString;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type ListAgentsResponse = z.infer<typeof ListAgentsResponseSchema>;
export declare const listAgentsContract: {
    readonly method: "GET";
    readonly path: "/internal/agents";
    readonly authType: "secret";
    readonly responseSchema: z.ZodObject<{
        agents: z.ZodArray<z.ZodObject<{
            agentId: z.ZodString;
            displayName: z.ZodString;
            ownerId: z.ZodString;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-list.d.ts.map