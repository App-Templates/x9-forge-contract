/**
 * GET /internal/memory/console/:kind — console list endpoint metadata + params schema.
 * Direction: Forge factory-svc -> X9/memory-svc
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER)
 * Phase 18 D3 — Option A bridge extension.
 *
 * Note: This endpoint returns one of 5 different envelope shapes depending
 * on :kind path param (episodes/facts/rules/aliases/feedback). Therefore
 * it is exposed as path constant + params schema rather than a single
 * EndpointContract object (which only supports a single response schema).
 *
 * T-18-00-02 mitigation: MemoryConsoleKindSchema = z.enum([...]) enforces
 * whitelist — consumer MUST MemoryConsoleKindSchema.parse(req.params.kind),
 * no string passthrough to memory-svc.
 *
 * T-18-00-04 mitigation: memoryConsoleParamsSchema requires tenant_id +
 * agent_id non-empty — consumer enforces ownership before forwarding.
 */
import { z } from 'zod';
export declare const MemoryConsoleKindSchema: z.ZodEnum<{
    episodes: "episodes";
    facts: "facts";
    rules: "rules";
    aliases: "aliases";
    feedback: "feedback";
}>;
export type MemoryConsoleKind = z.infer<typeof MemoryConsoleKindSchema>;
export declare const memoryConsoleParamsSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    agent_id: z.ZodString;
    cursor: z.ZodOptional<z.ZodString>;
    limit: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleParams = z.infer<typeof memoryConsoleParamsSchema>;
export declare const memoryConsoleListContract: {
    readonly path: "/internal/memory/console/:kind";
    readonly method: "GET";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        tenant_id: z.ZodString;
        agent_id: z.ZodString;
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly kindSchema: z.ZodEnum<{
        episodes: "episodes";
        facts: "facts";
        rules: "rules";
        aliases: "aliases";
        feedback: "feedback";
    }>;
};
//# sourceMappingURL=memory-console.d.ts.map