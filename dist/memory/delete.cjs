"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryDeleteBySourceRefResponseSchema = exports.MemoryDeleteBySourceRefRequestSchema = exports.MEMORY_DELETE_BY_SOURCE_REF_PATH = void 0;
const zod_1 = require("zod");
/**
 * Memory delete-by-source_ref — cross-repo contract (Phase 45 §16.5 DSAR propagation).
 *
 * Called by cap-voice `/internal/admin/delete-call/:callId` to propagate a
 * DSAR / retention / admin delete into Memory v2. Deletes memory rows whose
 * `session_id` matches the opaque `source_ref` (e.g. `call:{callId}`).
 *
 * Shape is stable across X9 (producer via cap-voice admin route) and Memory v2
 * (consumer via /internal/memory/delete-by-source-ref). Enum `requested_by`
 * closes the set of legitimate callers — unknown values MUST fail parse.
 *
 * @see docs/adr/ADR-cap-voice.md §16.5 — DSAR propagation
 * @see docs/adr/ADR-memory-engine-v2.md §16 — privacy / retention
 */
/**
 * Canonical HTTP path for the Memory v2 delete-by-source-ref endpoint.
 *
 * Callers MUST import this constant and compose the URL via template literal —
 * hardcoded string literals of this path are forbidden (R-14).
 */
exports.MEMORY_DELETE_BY_SOURCE_REF_PATH = '/internal/memory/delete-by-source-ref';
/**
 * Request body — `source_ref` is the attribution key stored at ingest time
 * (voice calls use `call:{callId}`). Scope MUST include `owner_id` + `agent_id`
 * and MAY include `tenant_id` to prevent cross-tenant leakage during delete.
 *
 * `requested_by` is a closed set; new callers MUST extend the bridge enum
 * rather than bypassing it.
 */
exports.MemoryDeleteBySourceRefRequestSchema = zod_1.z.object({
    source_ref: zod_1.z.string().min(1).max(256),
    source_type: zod_1.z.string().min(1).max(64).optional(),
    tenant_id: zod_1.z.string().min(1).max(256).optional(),
    owner_id: zod_1.z.string().min(1).max(256),
    agent_id: zod_1.z.string().min(1).max(64),
    requested_by: zod_1.z.enum(['dsar', 'admin', 'retention_policy']),
});
/**
 * Response body — echoes `source_ref` plus non-negative integer counts per
 * table. `deleted_facts` / `deleted_rules` / `deleted_edges` are always
 * present (0 when no matches) so callers can distinguish "route ran, nothing
 * matched" from "route failed".
 */
exports.MemoryDeleteBySourceRefResponseSchema = zod_1.z.object({
    source_ref: zod_1.z.string(),
    deleted_facts: zod_1.z.number().int().nonnegative(),
    deleted_rules: zod_1.z.number().int().nonnegative(),
    deleted_edges: zod_1.z.number().int().nonnegative(),
    // Phase 45.2 Task 1 — additive optional fields (backward-compatible).
    // Memory v2 will populate these when it begins graph + episode GC.
    // Older memory responses without these fields still parse successfully.
    deleted_episodes: zod_1.z.number().int().nonnegative().optional().default(0),
    deleted_dedupe_keys: zod_1.z.number().int().nonnegative().optional().default(0),
});
//# sourceMappingURL=delete.js.map