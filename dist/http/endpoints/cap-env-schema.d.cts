import { z } from 'zod';
import { EnvSchemaDocSchema } from "../../capability/env-schema.cjs";
/**
 * GET /env-schema — capability env schema discovery.
 * Direction: Forge factory-svc -> X9 capability services
 * Auth: None
 * Requirement: HTTP-09
 *
 * Response is the EnvSchemaDoc schema (already defined in Phase 1).
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 */
export declare const capEnvSchemaContract: {
    readonly method: "GET";
    readonly path: "/env-schema";
    readonly authType: "none";
    readonly responseSchema: z.ZodObject<{
        required: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            description: z.ZodString;
            secret: z.ZodBoolean;
            required: z.ZodBoolean;
            default: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        optional: z.ZodArray<z.ZodObject<{
            key: z.ZodString;
            description: z.ZodString;
            secret: z.ZodBoolean;
            required: z.ZodBoolean;
            default: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
};
export { EnvSchemaDocSchema as CapEnvSchemaResponseSchema };
export type { EnvSchemaDoc as CapEnvSchemaResponse } from "../../capability/env-schema.cjs";
//# sourceMappingURL=cap-env-schema.d.ts.map