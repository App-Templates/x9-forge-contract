import { z } from 'zod';
/** Shared capability dispatch URL; consumers must not duplicate the route literal. */
export declare const CapToolCallParamsSchema: z.ZodObject<{
    tool: z.ZodString;
}, z.core.$strip>;
/** agent-core -> capability, authenticated by INTERNAL_SECRET_HEADER. */
export declare const capToolCallContract: {
    readonly method: "POST";
    readonly path: "/call/:tool";
    readonly authType: "secret";
    readonly paramsSchema: z.ZodObject<{
        tool: z.ZodString;
    }, z.core.$strip>;
    readonly bodySchema: z.ZodObject<{
        callId: z.ZodString;
        tool: z.ZodString;
        input: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        agentId: z.ZodString;
        sessionId: z.ZodString;
        userId: z.ZodOptional<z.ZodString>;
        credentials: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
        tenantId: z.ZodOptional<z.ZodString>;
        ownerId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
};
export declare function capToolCallPath(tool: string): string;
//# sourceMappingURL=cap-tool-call.d.ts.map