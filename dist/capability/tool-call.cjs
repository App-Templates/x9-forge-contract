"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallResponseSchema = exports.ToolCallErrorResponseSchema = exports.ToolCallSuccessResponseSchema = exports.ToolCallRequestSchema = void 0;
const zod_1 = require("zod");
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
exports.ToolCallRequestSchema = zod_1.z.object({
    callId: zod_1.z.string().min(1),
    tool: zod_1.z.string().min(1),
    input: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    agentId: zod_1.z.string().min(1),
    sessionId: zod_1.z.string().min(1),
    credentials: zod_1.z.record(zod_1.z.string(), zod_1.z.string()).optional(),
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
    tenantId: zod_1.z.string().min(1).optional(),
    ownerId: zod_1.z.string().min(1).optional(),
});
// -- Response variants -------------------------------------------------------
exports.ToolCallSuccessResponseSchema = zod_1.z.object({
    callId: zod_1.z.string().min(1),
    status: zod_1.z.literal('success'),
    output: zod_1.z.unknown(),
});
exports.ToolCallErrorResponseSchema = zod_1.z.object({
    callId: zod_1.z.string().min(1),
    status: zod_1.z.literal('error'),
    error: zod_1.z.string(),
    code: zod_1.z.enum(['TOOL_NOT_FOUND', 'TOOL_CALL_INVALID', 'TOOL_EXEC_FAILED']),
});
/**
 * Discriminated union on `status`. Use `.parse()` at the X9 tool-router
 * response boundary to catch silent contract violations at compile time.
 *
 * Phase 3 note: This schema is the compile-time enforcement for Bug #15
 * (silent 401 that was never caught because no type-level contract existed).
 */
exports.ToolCallResponseSchema = zod_1.z.discriminatedUnion('status', [
    exports.ToolCallSuccessResponseSchema,
    exports.ToolCallErrorResponseSchema,
]);
//# sourceMappingURL=tool-call.js.map