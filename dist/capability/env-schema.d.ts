import { z } from 'zod';
/**
 * A single field in a capability's env schema, returned by GET /env-schema
 * (capability identity is conveyed by the caller's baseUrl, not a path prefix).
 *
 * - `secret`: heuristic flag — key contains API, KEY, SECRET, TOKEN.
 *   Used by Forge UI to mask values.
 * - `default`: only present on optional fields. Absent on required fields.
 */
export declare const EnvSchemaFieldSchema: z.ZodObject<{
    key: z.ZodString;
    description: z.ZodString;
    secret: z.ZodBoolean;
    required: z.ZodBoolean;
    default: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EnvSchemaField = z.infer<typeof EnvSchemaFieldSchema>;
/**
 * Full env schema document returned by GET /env-schema.
 *
 * Forge uses this to render the configuration UI for each capability.
 * X9 uses it for validation before starting a capability service.
 */
export declare const EnvSchemaDocSchema: z.ZodObject<{
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
export type EnvSchemaDoc = z.infer<typeof EnvSchemaDocSchema>;
//# sourceMappingURL=env-schema.d.ts.map