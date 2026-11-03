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
/**
 * v1.75.0 — optional body. A deploy job that is at its `reload-agent-core` step for an agent born WITH models sends
 * `birth`; every other caller (Applica, restore, token rotation, enable/disable) sends no body, as before.
 */
export declare const ReloadAgentBodySchema: z.ZodObject<{
    birth: z.ZodOptional<z.ZodObject<{
        deployJobId: z.ZodString;
        configVersion: z.ZodNumber;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type ReloadAgentBody = z.infer<typeof ReloadAgentBodySchema>;
export declare const ReloadAgentResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    agentId: z.ZodString;
    telegram: z.ZodOptional<z.ZodLiteral<"skipped">>;
    birthModels: z.ZodOptional<z.ZodObject<{
        requestId: z.ZodString;
        configVersion: z.ZodNumber;
    }, z.core.$strict>>;
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
    /** Optional body (v1.75.0); a request without body stays valid. */
    readonly bodySchema: z.ZodObject<{
        birth: z.ZodOptional<z.ZodObject<{
            deployJobId: z.ZodString;
            configVersion: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>;
    readonly responseSchema: z.ZodObject<{
        ok: z.ZodLiteral<true>;
        agentId: z.ZodString;
        telegram: z.ZodOptional<z.ZodLiteral<"skipped">>;
        birthModels: z.ZodOptional<z.ZodObject<{
            requestId: z.ZodString;
            configVersion: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strip>;
};
//# sourceMappingURL=internal-agents-reload.d.ts.map