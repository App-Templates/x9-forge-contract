import { z } from 'zod';
import { CapabilityContextRequestSchema, CapabilityContextResponseSchema } from "../../capability/capability-context.cjs";
/**
 * POST /context — what a capability knows about an agent, for the turn's context (v1.24.0).
 * Direction: X9 agent-core -> capability services that declare `context` in their manifest.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), the same as `POST /call/:tool`.
 *
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 * @see ../../capability/capability-context.ts
 */
export declare const capContextContract: {
    readonly method: "POST";
    readonly path: "/context";
    readonly authType: "secret";
    readonly bodySchema: z.ZodObject<{
        agentId: z.ZodString;
        sessionId: z.ZodString;
        channelId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    readonly responseSchema: z.ZodObject<{
        text: z.ZodNullable<z.ZodString>;
        version: z.ZodString;
    }, z.core.$strip>;
};
export { CapabilityContextRequestSchema as CapContextRequestSchema, CapabilityContextResponseSchema as CapContextResponseSchema };
export type { CapabilityContextRequest as CapContextRequest, CapabilityContextResponse as CapContextResponse } from "../../capability/capability-context.cjs";
//# sourceMappingURL=cap-context.d.ts.map