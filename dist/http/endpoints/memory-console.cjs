"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryConsoleListContract = exports.memoryConsoleParamsSchema = exports.MemoryConsoleKindSchema = void 0;
/**
 * GET /internal/memory/console/:kind — console list endpoint metadata + params schema.
 * Direction: Forge factory-svc -> X9/memory-svc
 * Auth: X-Internal-Secret (INTERNAL_SECRET_HEADER)
 * Phase 18 D3 — Option A bridge extension.
 *
 * Note: This endpoint returns one of 5 different envelope shapes depending
 * on :kind path param (episodes/facts/rules/aliases/feedback). Therefore
 * it is exposed as path constant + params schema rather than a single
 * EndpointContract object (which only supports a single response schema).
 *
 * T-18-00-02 mitigation: MemoryConsoleKindSchema = z.enum([...]) enforces
 * whitelist — consumer MUST MemoryConsoleKindSchema.parse(req.params.kind),
 * no string passthrough to memory-svc.
 *
 * T-18-00-04 mitigation: memoryConsoleParamsSchema requires tenant_id +
 * agent_id non-empty — consumer enforces ownership before forwarding.
 */
const zod_1 = require("zod");
const paths_js_1 = require("../../memory/paths.cjs");
exports.MemoryConsoleKindSchema = zod_1.z.enum([
    'episodes',
    'facts',
    'rules',
    'aliases',
    'feedback',
]);
exports.memoryConsoleParamsSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
    cursor: zod_1.z.string().optional(),
    limit: zod_1.z.string().optional(),
});
exports.memoryConsoleListContract = {
    path: paths_js_1.MEMORY_CONSOLE_LIST_PATH_TEMPLATE,
    method: paths_js_1.MEMORY_CONSOLE_LIST_METHOD,
    authType: 'secret',
    paramsSchema: exports.memoryConsoleParamsSchema,
    kindSchema: exports.MemoryConsoleKindSchema,
};
//# sourceMappingURL=memory-console.js.map