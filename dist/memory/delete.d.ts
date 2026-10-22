import { z } from 'zod';
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
export declare const MEMORY_DELETE_BY_SOURCE_REF_PATH: "/internal/memory/delete-by-source-ref";
/**
 * Request body — `source_ref` is the attribution key stored at ingest time
 * (voice calls use `call:{callId}`). Scope MUST include `owner_id` + `agent_id`
 * and MAY include `tenant_id` to prevent cross-tenant leakage during delete.
 *
 * `requested_by` is a closed set; new callers MUST extend the bridge enum
 * rather than bypassing it.
 */
export declare const MemoryDeleteBySourceRefRequestSchema: z.ZodObject<{
    source_ref: z.ZodString;
    source_type: z.ZodOptional<z.ZodString>;
    tenant_id: z.ZodOptional<z.ZodString>;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    requested_by: z.ZodEnum<{
        admin: "admin";
        dsar: "dsar";
        retention_policy: "retention_policy";
    }>;
}, z.core.$strip>;
export type MemoryDeleteBySourceRefRequest = z.infer<typeof MemoryDeleteBySourceRefRequestSchema>;
/**
 * Response body — echoes `source_ref` plus non-negative integer counts per
 * table. `deleted_facts` / `deleted_rules` / `deleted_edges` are always
 * present (0 when no matches) so callers can distinguish "route ran, nothing
 * matched" from "route failed".
 */
export declare const MemoryDeleteBySourceRefResponseSchema: z.ZodObject<{
    source_ref: z.ZodString;
    deleted_facts: z.ZodNumber;
    deleted_rules: z.ZodNumber;
    deleted_edges: z.ZodNumber;
    deleted_episodes: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    deleted_dedupe_keys: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type MemoryDeleteBySourceRefResponse = z.infer<typeof MemoryDeleteBySourceRefResponseSchema>;
//# sourceMappingURL=delete.d.ts.map