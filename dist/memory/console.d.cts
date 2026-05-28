import { z } from 'zod';
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
export declare const makeListResponseSchema: <T extends z.ZodTypeAny>(row: T) => z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<T>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
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
export declare const MemoryConsoleEpisodeSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodNullable<z.ZodString>;
    agentId: z.ZodNullable<z.ZodString>;
    userId: z.ZodNullable<z.ZodString>;
    createdAt: z.ZodString;
    contentType: z.ZodString;
    privacyLevel: z.ZodString;
    contentSummary: z.ZodNullable<z.ZodString>;
    status: z.ZodString;
}, z.core.$strip>;
export type MemoryConsoleEpisode = z.infer<typeof MemoryConsoleEpisodeSchema>;
/**
 * MemoryConsoleFactSchema — read-shape for `memory_facts` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.3, §22 Phase 5.
 *
 * Projected columns from `services/memory/src/db/schema.ts:128-169`.
 * Heavy numerical fields (`confidence`, `adjustedConfidence`, `salience`) are omitted from
 * the console read-shape — they are internal signals not surfaced in the governance UI.
 */
export declare const MemoryConsoleFactSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    subjectEntityId: z.ZodNullable<z.ZodString>;
    predicate: z.ZodString;
    objectValue: z.ZodString;
    privacyLevel: z.ZodString;
    status: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type MemoryConsoleFact = z.infer<typeof MemoryConsoleFactSchema>;
/**
 * MemoryConsoleRuleSchema — read-shape for `memory_rules` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.4, §22 Phase 5.
 *
 * Projected columns from `services/memory/src/db/schema.ts:172-204`.
 * `rulePayload` jsonb is omitted — UI displays `ruleText` (human-readable form) only.
 */
export declare const MemoryConsoleRuleSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    ruleText: z.ZodString;
    privacyLevel: z.ZodString;
    priority: z.ZodNumber;
    status: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type MemoryConsoleRule = z.infer<typeof MemoryConsoleRuleSchema>;
/**
 * MemoryConsoleAliasSchema — read-shape for entity alias entries in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.5, §22 Phase 5.
 *
 * Entity aliases are stored as projections: `alias` is the human-readable name variant,
 * `canonicalEntityId` is the `memory_entities.id` it resolves to.
 * No `privacyLevel` column — aliases inherit from the canonical entity (research §8).
 */
export declare const MemoryConsoleAliasSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    alias: z.ZodString;
    canonicalEntityId: z.ZodString;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type MemoryConsoleAlias = z.infer<typeof MemoryConsoleAliasSchema>;
/**
 * MemoryConsoleFeedbackSchema — read-shape for `memory_feedback` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.7, §22 Phase 5.
 *
 * All 14 columns from `services/memory/src/db/schema.ts:267-282`.
 * `beforeSnapshot` / `afterSnapshot` are stored as jsonb and returned as opaque records —
 * the UI renders them as a diff display; the bridge does not prescribe their internal shape.
 */
export declare const MemoryConsoleFeedbackSchema: z.ZodObject<{
    id: z.ZodString;
    tenantId: z.ZodString;
    ownerId: z.ZodString;
    agentId: z.ZodString;
    userId: z.ZodNullable<z.ZodString>;
    actorType: z.ZodString;
    actorId: z.ZodString;
    action: z.ZodString;
    targetType: z.ZodString;
    targetId: z.ZodString;
    reason: z.ZodNullable<z.ZodString>;
    beforeSnapshot: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    afterSnapshot: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    createdAt: z.ZodString;
}, z.core.$strip>;
export type MemoryConsoleFeedback = z.infer<typeof MemoryConsoleFeedbackSchema>;
/**
 * MemoryConsoleEpisodesResponseSchema — list envelope for `memory_episodes` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export declare const MemoryConsoleEpisodesResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodNullable<z.ZodString>;
        agentId: z.ZodNullable<z.ZodString>;
        userId: z.ZodNullable<z.ZodString>;
        createdAt: z.ZodString;
        contentType: z.ZodString;
        privacyLevel: z.ZodString;
        contentSummary: z.ZodNullable<z.ZodString>;
        status: z.ZodString;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleEpisodesResponse = z.infer<typeof MemoryConsoleEpisodesResponseSchema>;
/**
 * MemoryConsoleFactsResponseSchema — list envelope for `memory_facts` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export declare const MemoryConsoleFactsResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        subjectEntityId: z.ZodNullable<z.ZodString>;
        predicate: z.ZodString;
        objectValue: z.ZodString;
        privacyLevel: z.ZodString;
        status: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleFactsResponse = z.infer<typeof MemoryConsoleFactsResponseSchema>;
/**
 * MemoryConsoleRulesResponseSchema — list envelope for `memory_rules` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export declare const MemoryConsoleRulesResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        ruleText: z.ZodString;
        privacyLevel: z.ZodString;
        priority: z.ZodNumber;
        status: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleRulesResponse = z.infer<typeof MemoryConsoleRulesResponseSchema>;
/**
 * MemoryConsoleAliasesResponseSchema — list envelope for entity alias console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export declare const MemoryConsoleAliasesResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        alias: z.ZodString;
        canonicalEntityId: z.ZodString;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleAliasesResponse = z.infer<typeof MemoryConsoleAliasesResponseSchema>;
/**
 * MemoryConsoleFeedbackResponseSchema — list envelope for `memory_feedback` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export declare const MemoryConsoleFeedbackResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    entries: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        tenantId: z.ZodString;
        ownerId: z.ZodString;
        agentId: z.ZodString;
        userId: z.ZodNullable<z.ZodString>;
        actorType: z.ZodString;
        actorId: z.ZodString;
        action: z.ZodString;
        targetType: z.ZodString;
        targetId: z.ZodString;
        reason: z.ZodNullable<z.ZodString>;
        beforeSnapshot: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        afterSnapshot: z.ZodNullable<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
        createdAt: z.ZodString;
    }, z.core.$strip>>;
    nextCursor: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export type MemoryConsoleFeedbackResponse = z.infer<typeof MemoryConsoleFeedbackResponseSchema>;
//# sourceMappingURL=console.d.ts.map