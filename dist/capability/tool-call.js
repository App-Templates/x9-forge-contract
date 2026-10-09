import { z } from 'zod';
import { InternalMemoryExtractRequestSchema } from "../http/endpoints/internal-memory-extract.js";
import { AgentConfigVersionSchema } from "./ricerca/agent-config.js";
import { PaperclipExecutionContextSchema, matchesPaperclipExecution, PAPERCLIP_API_KEY, } from "./paperclip/execution-context.js";
import { PAPERCLIP_TOOLS } from "./paperclip/tools.js";
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
    /** Authenticated end user, injected by the runtime rather than the model. */
    userId: InternalMemoryExtractRequestSchema.shape.userId,
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
    /** Loaded applied config revision; optional for legacy capabilities. */
    configVersion: AgentConfigVersionSchema.optional(),
    /** Server-produced ephemeral native admission; never model input or credentials. */
    executionContext: PaperclipExecutionContextSchema.optional(),
});
/** Structural Paperclip guard. Consumers still authenticate and compare current native/readback state. */
export const PaperclipToolCallRequestSchema = ToolCallRequestSchema.strict().superRefine((call, ctx) => {
    if (!Object.values(PAPERCLIP_TOOLS).includes(call.tool)) {
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
    if (keys.length !== 1 || keys[0] !== PAPERCLIP_API_KEY || !call.credentials?.[PAPERCLIP_API_KEY]?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['credentials'], message: 'Exactly the own native API key required' });
    }
});
/** Project a server admission matching the cap readback; does not read/select any credential. */
export function toPaperclipToolCallScope(rawReadback, rawExecution) {
    if (!matchesPaperclipExecution(rawReadback, rawExecution))
        throw new Error('Paperclip binding mismatch');
    const executionContext = PaperclipExecutionContextSchema.parse(rawExecution);
    return {
        ...executionContext.scope,
        sessionId: executionContext.sessionId,
        configVersion: executionContext.configVersion,
        executionContext,
    };
}
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