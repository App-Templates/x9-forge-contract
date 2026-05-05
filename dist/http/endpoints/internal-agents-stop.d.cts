import { z } from 'zod';
/**
 * POST /internal/agents/:agentId/stop — stop a running agent.
 * Direction: Forge factory-svc -> X9 agent-core
 * Auth: X-Internal-Secret
 * Requirement: HTTP-02
 *
 * Structurally identical to /internal/agents/:agentId/reload for params +
 * response shape. agent-core validates agentId via the same AGENT_ID_SCHEMA
 * regex.
 *
 * Consumers:
 *   - forge-v2 factory `X9Client.stop(agentId)` via createBridgeClient<'secret'>
 */
export declare const StopAgentParamsSchema: z.ZodObject<{
    agentId: z.ZodString;
}, z.core.$strip>;
export type StopAgentParams = z.infer<typeof StopAgentParamsSchema>;
export declare const StopAgentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    agentId: z.ZodString;
}, z.core.$strip>;
export type StopAgentResponse = z.infer<typeof StopAgentResponseSchema>;
export declare const StopAgentErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export type StopAgentErrorResponse = z.infer<typeof StopAgentErrorResponseSchema>;
export declare const stopAgentContract: {
    readonly method: "POST";
    readonly path: "/internal/agents/:agentId/stop";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        agentId: z.ZodString;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        agentId: z.ZodString;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-stop.d.ts.map