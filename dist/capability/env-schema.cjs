"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvSchemaDocSchema = exports.EnvSchemaFieldSchema = void 0;
const zod_1 = require("zod");
/**
 * A single field in a capability's env schema, returned by GET /env-schema
 * (capability identity is conveyed by the caller's baseUrl, not a path prefix).
 *
 * - `secret`: heuristic flag — key contains API, KEY, SECRET, TOKEN.
 *   Used by Forge UI to mask values.
 * - `default`: only present on optional fields. Absent on required fields.
 */
exports.EnvSchemaFieldSchema = zod_1.z.object({
    key: zod_1.z.string().min(1),
    description: zod_1.z.string(),
    secret: zod_1.z.boolean(),
    required: zod_1.z.boolean(),
    default: zod_1.z.string().optional(),
});
/**
 * Full env schema document returned by GET /env-schema.
 *
 * Forge uses this to render the configuration UI for each capability.
 * X9 uses it for validation before starting a capability service.
 */
exports.EnvSchemaDocSchema = zod_1.z.object({
    required: zod_1.z.array(exports.EnvSchemaFieldSchema),
    optional: zod_1.z.array(exports.EnvSchemaFieldSchema),
});
//# sourceMappingURL=env-schema.js.map