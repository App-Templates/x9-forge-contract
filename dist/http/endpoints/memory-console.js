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
import { MEMORY_CONSOLE_LIST_PATH_TEMPLATE, MEMORY_CONSOLE_LIST_METHOD, } from "../../memory/paths.js";
export const MemoryConsoleKindSchema = z.enum([
    'episodes',
    'facts',
    'rules',
    'aliases',
    'feedback',
]);
export const memoryConsoleParamsSchema = z.object({
    tenant_id: z.string().min(1),
    agent_id: z.string().min(1),
    cursor: z.string().optional(),
    limit: z.string().optional(),
});
export const memoryConsoleListContract = {
    path: MEMORY_CONSOLE_LIST_PATH_TEMPLATE,
    method: MEMORY_CONSOLE_LIST_METHOD,
    authType: 'secret',
    paramsSchema: memoryConsoleParamsSchema,
    kindSchema: MemoryConsoleKindSchema,
};
//# sourceMappingURL=memory-console.js.map