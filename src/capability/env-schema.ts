import { z } from 'zod';

/**
 * A single field in a capability's env schema, returned by GET /:cap/env-schema.
 *
 * - `secret`: heuristic flag — key contains API, KEY, SECRET, TOKEN.
 *   Used by Forge UI to mask values.
 * - `default`: only present on optional fields. Absent on required fields.
 */
export const EnvSchemaFieldSchema = z.object({
  key: z.string().min(1),
  description: z.string(),
  secret: z.boolean(),
  required: z.boolean(),
  default: z.string().optional(),
});

export type EnvSchemaField = z.infer<typeof EnvSchemaFieldSchema>;

/**
 * Full env schema document returned by GET /:cap/env-schema.
 *
 * Forge uses this to render the configuration UI for each capability.
 * X9 uses it for validation before starting a capability service.
 */
export const EnvSchemaDocSchema = z.object({
  required: z.array(EnvSchemaFieldSchema),
  optional: z.array(EnvSchemaFieldSchema),
});

export type EnvSchemaDoc = z.infer<typeof EnvSchemaDocSchema>;
