"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BridgeResponseSchema = exports.BridgeSuccessResponseSchema = exports.BridgeErrorResponseSchema = void 0;
const zod_1 = require("zod");
/**
 * Standardized error response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-13.
 */
exports.BridgeErrorResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    code: zod_1.z.string().min(1),
    message: zod_1.z.string(),
    details: zod_1.z.unknown().optional(),
});
/**
 * Standardized success response shape for all bridge HTTP endpoints.
 * Requirement: HTTP-14.
 * The `data` field is typed as `unknown` in the base schema;
 * endpoint-specific schemas (Phase 4) will narrow it.
 */
exports.BridgeSuccessResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    data: zod_1.z.unknown(),
});
/**
 * Union response type: every bridge endpoint returns either success or error.
 */
exports.BridgeResponseSchema = zod_1.z.discriminatedUnion('ok', [
    exports.BridgeSuccessResponseSchema,
    exports.BridgeErrorResponseSchema,
]);
//# sourceMappingURL=response.js.map