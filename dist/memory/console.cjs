"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryConsoleFeedbackResponseSchema = exports.MemoryConsoleAliasesResponseSchema = exports.MemoryConsoleRulesResponseSchema = exports.MemoryConsoleFactsResponseSchema = exports.MemoryConsoleEpisodesResponseSchema = exports.MemoryConsoleFeedbackSchema = exports.MemoryConsoleAliasSchema = exports.MemoryConsoleRuleSchema = exports.MemoryConsoleFactSchema = exports.MemoryConsoleEpisodeSchema = exports.makeListResponseSchema = void 0;
const zod_1 = require("zod");
/**
 * makeListResponseSchema — generic helper for Memory Console list endpoints.
 *
 * Wraps any row schema in the standard `{ ok: true, entries: T[], nextCursor: string | null }`
 * envelope. Matches the factory reply shape (research §2) and memory-svc output (Plan 36.6-01 Task 2).
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 *
 * Usage:
 * ```ts
 * const EpisodesResponseSchema = makeListResponseSchema(MemoryConsoleEpisodeSchema);
 * const parsed = EpisodesResponseSchema.safeParse(body);
 * ```
 */
const makeListResponseSchema = (row) => zod_1.z.object({
    ok: zod_1.z.literal(true),
    entries: zod_1.z.array(row),
    nextCursor: zod_1.z.string().nullable(),
});
exports.makeListResponseSchema = makeListResponseSchema;
/**
 * MemoryConsoleEpisodeSchema — read-shape for `memory_episodes` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.2, §22 Phase 5.
 *
 * Projected columns only — no `content_raw` (PII guard for redacted rows), no `content_hash`,
 * no `metadata` jsonb (UI does not render raw jsonb). `contentSummary` MAY be `'[redacted]'`
 * sentinel for rows with `privacy_level='secret'`; the schema tolerates this — enforcement is
 * upstream (memory-svc projection step).
 */
exports.MemoryConsoleEpisodeSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string(),
    ownerId: zod_1.z.string().nullable(),
    agentId: zod_1.z.string().nullable(),
    userId: zod_1.z.string().nullable(),
    createdAt: zod_1.z.string(), // ISO timestamp
    contentType: zod_1.z.string(),
    privacyLevel: zod_1.z.string(),
    contentSummary: zod_1.z.string().nullable(), // '[redacted]' for secret rows
    status: zod_1.z.string(), // 'active' | 'invalidated' | 'forgotten' | 'redacted'
});
/**
 * MemoryConsoleFactSchema — read-shape for `memory_facts` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.3, §22 Phase 5.
 *
 * Projected columns from `services/memory/src/db/schema.ts:128-169`.
 * Heavy numerical fields (`confidence`, `adjustedConfidence`, `salience`) are omitted from
 * the console read-shape — they are internal signals not surfaced in the governance UI.
 */
exports.MemoryConsoleFactSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    subjectEntityId: zod_1.z.string().nullable(),
    predicate: zod_1.z.string(),
    objectValue: zod_1.z.string(),
    privacyLevel: zod_1.z.string(),
    status: zod_1.z.string(),
    createdAt: zod_1.z.string(), // ISO timestamp
});
/**
 * MemoryConsoleRuleSchema — read-shape for `memory_rules` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.4, §22 Phase 5.
 *
 * Projected columns from `services/memory/src/db/schema.ts:172-204`.
 * `rulePayload` jsonb is omitted — UI displays `ruleText` (human-readable form) only.
 */
exports.MemoryConsoleRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    ruleText: zod_1.z.string(),
    privacyLevel: zod_1.z.string(),
    priority: zod_1.z.number().int(),
    status: zod_1.z.string(),
    createdAt: zod_1.z.string(), // ISO timestamp
});
/**
 * MemoryConsoleAliasSchema — read-shape for entity alias entries in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.5, §22 Phase 5.
 *
 * Entity aliases are stored as projections: `alias` is the human-readable name variant,
 * `canonicalEntityId` is the `memory_entities.id` it resolves to.
 * No `privacyLevel` column — aliases inherit from the canonical entity (research §8).
 */
exports.MemoryConsoleAliasSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    alias: zod_1.z.string(),
    canonicalEntityId: zod_1.z.string(),
    createdAt: zod_1.z.string(), // ISO timestamp
});
/**
 * MemoryConsoleFeedbackSchema — read-shape for `memory_feedback` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.7, §22 Phase 5.
 *
 * All 14 columns from `services/memory/src/db/schema.ts:267-282`.
 * `beforeSnapshot` / `afterSnapshot` are stored as jsonb and returned as opaque records —
 * the UI renders them as a diff display; the bridge does not prescribe their internal shape.
 */
exports.MemoryConsoleFeedbackSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    tenantId: zod_1.z.string(),
    ownerId: zod_1.z.string(),
    agentId: zod_1.z.string(),
    userId: zod_1.z.string().nullable(),
    actorType: zod_1.z.string(),
    actorId: zod_1.z.string(),
    action: zod_1.z.string(),
    targetType: zod_1.z.string(),
    targetId: zod_1.z.string(),
    reason: zod_1.z.string().nullable(),
    beforeSnapshot: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable(),
    afterSnapshot: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()).nullable(),
    createdAt: zod_1.z.string(), // ISO timestamp
});
// ---------------------------------------------------------------------------
// Pre-baked list-response schemas — one per row type
// ---------------------------------------------------------------------------
/**
 * MemoryConsoleEpisodesResponseSchema — list envelope for `memory_episodes` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
exports.MemoryConsoleEpisodesResponseSchema = (0, exports.makeListResponseSchema)(exports.MemoryConsoleEpisodeSchema);
/**
 * MemoryConsoleFactsResponseSchema — list envelope for `memory_facts` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
exports.MemoryConsoleFactsResponseSchema = (0, exports.makeListResponseSchema)(exports.MemoryConsoleFactSchema);
/**
 * MemoryConsoleRulesResponseSchema — list envelope for `memory_rules` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
exports.MemoryConsoleRulesResponseSchema = (0, exports.makeListResponseSchema)(exports.MemoryConsoleRuleSchema);
/**
 * MemoryConsoleAliasesResponseSchema — list envelope for entity alias console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
exports.MemoryConsoleAliasesResponseSchema = (0, exports.makeListResponseSchema)(exports.MemoryConsoleAliasSchema);
/**
 * MemoryConsoleFeedbackResponseSchema — list envelope for `memory_feedback` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
exports.MemoryConsoleFeedbackResponseSchema = (0, exports.makeListResponseSchema)(exports.MemoryConsoleFeedbackSchema);
//# sourceMappingURL=console.js.map