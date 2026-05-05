import { z } from 'zod';
/**
 * Standardized error response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-13.
 */
export declare const BridgeErrorResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<false>;
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>;
export type BridgeErrorResponse = z.infer<typeof BridgeErrorResponseSchema>;
/**
 * Standardized success response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-14.
 * The `data` field is typed as `unknown` in the base schema;
 * endpoint-specific schemas (Phase 4) will narrow it.
 */
export declare const BridgeSuccessResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: z.ZodUnknown;
}, z.core.$strip>;
export type BridgeSuccessResponse = z.infer<typeof BridgeSuccessResponseSchema>;
/**
 * Union response type: every bridge endpoint returns either success or error.
 */
export declare const BridgeResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    ok: z.ZodLiteral<true>;
    data: z.ZodUnknown;
}, z.core.$strip>, z.ZodObject<{
    ok: z.ZodLiteral<false>;
    code: z.ZodString;
    message: z.ZodString;
    details: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strip>], "ok">;
export type BridgeResponse = z.infer<typeof BridgeResponseSchema>;
//# sourceMappingURL=response.d.ts.map