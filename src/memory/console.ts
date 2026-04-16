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
export const makeListResponseSchema = <T extends z.ZodTypeAny>(row: T) =>
  z.object({
    ok: z.literal(true),
    entries: z.array(row),
    nextCursor: z.string().nullable(),
  });

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
export const MemoryConsoleEpisodeSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  ownerId: z.string().nullable(),
  agentId: z.string().nullable(),
  userId: z.string().nullable(),
  createdAt: z.string(), // ISO timestamp
  contentType: z.string(),
  privacyLevel: z.string(),
  contentSummary: z.string().nullable(), // '[redacted]' for secret rows
  status: z.string(), // 'active' | 'invalidated' | 'forgotten' | 'redacted'
});
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
export const MemoryConsoleFactSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  ownerId: z.string(),
  agentId: z.string(),
  subjectEntityId: z.string().nullable(),
  predicate: z.string(),
  objectValue: z.string(),
  privacyLevel: z.string(),
  status: z.string(),
  createdAt: z.string(), // ISO timestamp
});
export type MemoryConsoleFact = z.infer<typeof MemoryConsoleFactSchema>;

/**
 * MemoryConsoleRuleSchema — read-shape for `memory_rules` rows in the Memory Console.
 *
 * See ADR-memory-engine-v2.md §8.4, §22 Phase 5.
 *
 * Projected columns from `services/memory/src/db/schema.ts:172-204`.
 * `rulePayload` jsonb is omitted — UI displays `ruleText` (human-readable form) only.
 */
export const MemoryConsoleRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  ownerId: z.string(),
  agentId: z.string(),
  ruleText: z.string(),
  privacyLevel: z.string(),
  priority: z.number().int(),
  status: z.string(),
  createdAt: z.string(), // ISO timestamp
});
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
export const MemoryConsoleAliasSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  ownerId: z.string(),
  agentId: z.string(),
  alias: z.string(),
  canonicalEntityId: z.string(),
  createdAt: z.string(), // ISO timestamp
});
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
export const MemoryConsoleFeedbackSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string(),
  ownerId: z.string(),
  agentId: z.string(),
  userId: z.string().nullable(),
  actorType: z.string(),
  actorId: z.string(),
  action: z.string(),
  targetType: z.string(),
  targetId: z.string(),
  reason: z.string().nullable(),
  beforeSnapshot: z.record(z.string(), z.unknown()).nullable(),
  afterSnapshot: z.record(z.string(), z.unknown()).nullable(),
  createdAt: z.string(), // ISO timestamp
});
export type MemoryConsoleFeedback = z.infer<typeof MemoryConsoleFeedbackSchema>;

// ---------------------------------------------------------------------------
// Pre-baked list-response schemas — one per row type
// ---------------------------------------------------------------------------

/**
 * MemoryConsoleEpisodesResponseSchema — list envelope for `memory_episodes` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export const MemoryConsoleEpisodesResponseSchema = makeListResponseSchema(
  MemoryConsoleEpisodeSchema,
);
export type MemoryConsoleEpisodesResponse = z.infer<typeof MemoryConsoleEpisodesResponseSchema>;

/**
 * MemoryConsoleFactsResponseSchema — list envelope for `memory_facts` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export const MemoryConsoleFactsResponseSchema = makeListResponseSchema(MemoryConsoleFactSchema);
export type MemoryConsoleFactsResponse = z.infer<typeof MemoryConsoleFactsResponseSchema>;

/**
 * MemoryConsoleRulesResponseSchema — list envelope for `memory_rules` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export const MemoryConsoleRulesResponseSchema = makeListResponseSchema(MemoryConsoleRuleSchema);
export type MemoryConsoleRulesResponse = z.infer<typeof MemoryConsoleRulesResponseSchema>;

/**
 * MemoryConsoleAliasesResponseSchema — list envelope for entity alias console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export const MemoryConsoleAliasesResponseSchema = makeListResponseSchema(
  MemoryConsoleAliasSchema,
);
export type MemoryConsoleAliasesResponse = z.infer<typeof MemoryConsoleAliasesResponseSchema>;

/**
 * MemoryConsoleFeedbackResponseSchema — list envelope for `memory_feedback` console reads.
 *
 * See ADR-memory-engine-v2.md §22 Phase 5.
 */
export const MemoryConsoleFeedbackResponseSchema = makeListResponseSchema(
  MemoryConsoleFeedbackSchema,
);
export type MemoryConsoleFeedbackResponse = z.infer<typeof MemoryConsoleFeedbackResponseSchema>;
