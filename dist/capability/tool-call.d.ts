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
export declare const ToolCallRequestSchema: z.ZodObject<{
    callId: z.ZodString;
    tool: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    agentId: z.ZodString;
    sessionId: z.ZodString;
    credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
}, z.core.$strip>;
export type ToolCallRequest = z.infer<typeof ToolCallRequestSchema>;
export declare const ToolCallSuccessResponseSchema: z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"success">;
    output: z.ZodUnknown;
}, z.core.$strip>;
export declare const ToolCallErrorResponseSchema: z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"error">;
    error: z.ZodString;
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
    }>;
}, z.core.$strip>;
/**
 * Discriminated union on `status`. Use `.parse()` at the X9 tool-router
 * response boundary to catch silent contract violations at compile time.
 *
 * Phase 3 note: This schema is the compile-time enforcement for Bug #15
 * (silent 401 that was never caught because no type-level contract existed).
 */
export declare const ToolCallResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"success">;
    output: z.ZodUnknown;
}, z.core.$strip>, z.ZodObject<{
    callId: z.ZodString;
    status: z.ZodLiteral<"error">;
    error: z.ZodString;
    code: z.ZodEnum<{
        TOOL_NOT_FOUND: "TOOL_NOT_FOUND";
        TOOL_CALL_INVALID: "TOOL_CALL_INVALID";
        TOOL_EXEC_FAILED: "TOOL_EXEC_FAILED";
    }>;
}, z.core.$strip>], "status">;
export type ToolCallSuccessResponse = z.infer<typeof ToolCallSuccessResponseSchema>;
export type ToolCallErrorResponse = z.infer<typeof ToolCallErrorResponseSchema>;
export type ToolCallResponse = z.infer<typeof ToolCallResponseSchema>;
//# sourceMappingURL=tool-call.d.ts.map