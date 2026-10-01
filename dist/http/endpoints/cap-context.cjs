"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapContextResponseSchema = exports.CapContextRequestSchema = exports.capContextContract = void 0;
const capability_context_js_1 = require("../../capability/capability-context.cjs");
Object.defineProperty(exports, "CapContextRequestSchema", { enumerable: true, get: function () { return capability_context_js_1.CapabilityContextRequestSchema; } });
Object.defineProperty(exports, "CapContextResponseSchema", { enumerable: true, get: function () { return capability_context_js_1.CapabilityContextResponseSchema; } });
/**
 * POST /context — what a capability knows about an agent, for the turn's context (v1.24.0).
 * Direction: X9 agent-core -> capability services that declare `context` in their manifest.
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), the same as `POST /call/:tool`.
 *
 * The capability identity is conveyed by the caller's `baseUrl`, not a path prefix.
 * @see ../../capability/capability-context.ts
 */
exports.capContextContract = {
    method: 'POST',
    path: '/context',
    authType: 'secret',
    bodySchema: capability_context_js_1.CapabilityContextRequestSchema,
    responseSchema: capability_context_js_1.CapabilityContextResponseSchema,
};
//# sourceMappingURL=cap-context.js.map