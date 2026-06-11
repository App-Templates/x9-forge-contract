import { z } from 'zod';
/**
 * Request sent by X9 agent-core to a capability service.
 *
 * Endpoint: POST /call/:tool — mounted at the capability service root
 * (e.g. `http://cap-news:3000/call/news_digest`). The capability identity is
 * conveyed by the caller's `baseUrl`, not a path prefix — each X9 capability
 * service registers `app.post("/call/<toolName>", ...)` directly at root
 * (see `agent-x9/services/cap-<name>/src/tools/`).
 *
 * Auth: X-Internal-Secret (platform secret) — typed in Phase 3 auth contracts.
 *
 * `credentials`: per-request vault credentials injected by Forge at dispatch
 * time. Optional: not all capability calls require credentials.
 */
export const ToolCallRequestSchema = z.object({
    callId: z.string().min(1),
    tool: z.string().min(1),
    input: z.record(z.string(), z.unknown()),
    agentId: z.string().min(1),
    sessionId: z.string().min(1),
    credentials: z.record(z.string(), z.string()).optional(),
    /**
     * F-2 (v1.13.0) — Optional per-agent memory-scope identity, attached by
     * agent-core's tool-router from the dispatching agent's context.json.
     *
     * Capability services that scope state by the (tenant, owner, agent)
     * triple (memory-svc memory_capture/memory_recall) MUST prefer these
     * over process-global env (`X9_TENANT_ID`/`X9_OWNER_ID`) — the env was
     * per-process and collapsed all agents of a multi-agent runtime onto one
     * owner. Optional for backward compat: absent ⇒ consumer falls back to
     * its env defaults (single-tenant behavior unchanged).
     */
    tenantId: z.string().min(1).optional(),
    ownerId: z.string().min(1).optional(),
});
// -- Response variants -------------------------------------------------------
export const ToolCallSuccessResponseSchema = z.object({
    callId: z.string().min(1),
    status: z.literal('success'),
    output: z.unknown(),
});
export const ToolCallErrorResponseSchema = z.object({
    callId: z.string().min(1),
    status: z.literal('error'),
    error: z.string(),
    code: z.enum(['TOOL_NOT_FOUND', 'TOOL_CALL_INVALID', 'TOOL_EXEC_FAILED']),
});
/**
 * Discriminated union on `status`. Use `.parse()` at the X9 tool-router
 * response boundary to catch silent contract violations at compile time.
 *
 * Phase 3 note: This schema is the compile-time enforcement for Bug #15
 * (silent 401 that was never caught because no type-level contract existed).
 */
export const ToolCallResponseSchema = z.discriminatedUnion('status', [
    ToolCallSuccessResponseSchema,
    ToolCallErrorResponseSchema,
]);
//# sourceMappingURL=tool-call.js.map