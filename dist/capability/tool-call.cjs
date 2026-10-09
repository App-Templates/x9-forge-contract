"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallResponseSchema = exports.ToolCallErrorResponseSchema = exports.ToolCallSuccessResponseSchema = exports.PaperclipToolCallRequestSchema = exports.ToolCallRequestSchema = void 0;
exports.toPaperclipToolCallScope = toPaperclipToolCallScope;
const zod_1 = require("zod");
const internal_memory_extract_js_1 = require("../http/endpoints/internal-memory-extract.cjs");
const agent_config_js_1 = require("./ricerca/agent-config.cjs");
const execution_context_js_1 = require("./paperclip/execution-context.cjs");
const tools_js_1 = require("./paperclip/tools.cjs");
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
    /** Authenticated end user, injected by the runtime rather than the model. */
    userId: internal_memory_extract_js_1.InternalMemoryExtractRequestSchema.shape.userId,
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
    /** Loaded applied config revision; optional for legacy capabilities. */
    configVersion: agent_config_js_1.AgentConfigVersionSchema.optional(),
    /** Server-produced ephemeral native admission; never model input or credentials. */
    executionContext: execution_context_js_1.PaperclipExecutionContextSchema.optional(),
});
/** Structural Paperclip guard. Consumers still authenticate and compare current native/readback state. */
exports.PaperclipToolCallRequestSchema = exports.ToolCallRequestSchema.strict().superRefine((call, ctx) => {
    if (!Object.values(tools_js_1.PAPERCLIP_TOOLS).includes(call.tool)) {
        ctx.addIssue({ code: 'custom', path: ['tool'], message: 'Canonical Paperclip tool required' });
    }
    const execution = call.executionContext;
    if (!execution) {
        ctx.addIssue({ code: 'custom', path: ['executionContext'], message: 'Native admission required' });
    }
    else {
        if (call.tenantId !== execution.scope.tenantId || call.ownerId !== execution.scope.ownerId
            || call.agentId !== execution.scope.agentId) {
            ctx.addIssue({ code: 'custom', path: ['executionContext', 'scope'], message: 'Dispatch scope mismatch' });
        }
        if (call.sessionId !== execution.sessionId) {
            ctx.addIssue({ code: 'custom', path: ['sessionId'], message: 'Admitted session mismatch' });
        }
        if (call.configVersion !== execution.configVersion) {
            ctx.addIssue({ code: 'custom', path: ['configVersion'], message: 'Applied revision mismatch' });
        }
    }
    const keys = Object.keys(call.credentials ?? {});
    if (keys.length !== 1 || keys[0] !== execution_context_js_1.PAPERCLIP_API_KEY || !call.credentials?.[execution_context_js_1.PAPERCLIP_API_KEY]?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['credentials'], message: 'Exactly the own native API key required' });
    }
});
/** Project a server admission matching the cap readback; does not read/select any credential. */
function toPaperclipToolCallScope(rawReadback, rawExecution) {
    if (!(0, execution_context_js_1.matchesPaperclipExecution)(rawReadback, rawExecution))
        throw new Error('Paperclip binding mismatch');
    const executionContext = execution_context_js_1.PaperclipExecutionContextSchema.parse(rawExecution);
    return {
        ...executionContext.scope,
        sessionId: executionContext.sessionId,
        configVersion: executionContext.configVersion,
        executionContext,
    };
}
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