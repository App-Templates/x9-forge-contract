import { z } from 'zod';
import { InternalMemoryExtractRequestSchema } from "../http/endpoints/internal-memory-extract.js";
import { OrganizationToolCallContextSchema, ToolCallReceiptSchema, } from "../organization/tool-call-correlation.js";
import { CapabilityOrdinaryCallSnapshotSchema } from "./ordinary-configuration.js";
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
    organization: OrganizationToolCallContextSchema.optional(),
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
    /**
     * Numeric Vault id of the dispatching agent (`identity.vaultAgentId`),
     * injected by the runtime, never by the model. Lets capability services ask
     * the Vault for an access token on behalf of the right agent.
     */
    vaultAgentId: z.number().int().positive().optional(),
    /**
     * Attested person of the turn (the actor the connection belongs to),
     * injected by the runtime, never by the model and never inside `input`.
     */
    personRef: z.string().min(1).optional(),
    /** Server-owned next_apply snapshot; never selected from model input. */
    ordinaryConfiguration: CapabilityOrdinaryCallSnapshotSchema.optional(),
}).superRefine((call, ctx) => {
    const scope = call.ordinaryConfiguration?.scope;
    if (scope && (scope.agentId !== call.agentId || scope.tenantId !== call.tenantId || scope.ownerId !== call.ownerId))
        ctx.addIssue({ code: 'custom', path: ['ordinaryConfiguration', 'scope'], message: 'Ordinary snapshot belongs to another call scope' });
});
// -- Response variants -------------------------------------------------------
export const TOOL_ERROR_MODEL_REASON_MAX_CHARS = 400;
// Il solo testo di un errore di capacità che il runtime può mostrare al modello: codice e spiegazione scritti dal servizio, mai dati dell'upstream.
export const ToolErrorModelReasonSchema = z.string()
    .min(1)
    .max(TOOL_ERROR_MODEL_REASON_MAX_CHARS)
    .regex(/^[a-z][a-z0-9_]{2,63}(: [^\u0000-\u001f\u007f]+)?$/)
    .refine((reason) => !/[\u0000-\u001f\u007f]/.test(reason)
    && !reason.includes('://')
    && !/Bearer /i.test(reason)
    && !/[A-Za-z0-9+/=]{32,}/.test(reason));
export function toolErrorModelReasonOf(body) {
    try {
        if (typeof body !== 'object' || body === null
            || !('status' in body) || body.status !== 'error'
            || !('modelReason' in body))
            return undefined;
        const parsed = ToolErrorModelReasonSchema.safeParse(body.modelReason);
        return parsed.success ? parsed.data : undefined;
    }
    catch {
        // Untrusted objects may throw when their properties are read.
        return undefined;
    }
}
export const ToolCallSuccessResponseSchema = z.object({
    callId: z.string().min(1),
    status: z.literal('success'),
    output: z.unknown(),
    receipt: ToolCallReceiptSchema.optional(),
});
export const ToolCallErrorResponseSchema = z.object({
    callId: z.string().min(1),
    status: z.literal('error'),
    error: z.string(),
    code: z.enum(['TOOL_NOT_FOUND', 'TOOL_CALL_INVALID', 'TOOL_EXEC_FAILED']),
    modelReason: ToolErrorModelReasonSchema.optional(),
    receipt: ToolCallReceiptSchema.optional(),
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