import { z } from 'zod';
import { MemoryCorrectiveActionSchema } from './enums.js';

// Re-export for consumers that import everything from corrective-action only
export { MemoryCorrectiveActionSchema };

/**
 * MemoryActorTypeSchema — who performed the corrective action.
 *
 * - `forge_user`: authenticated Forge owner performing a manual correction.
 * - `forge_superadmin`: Stefano / platform superadmin (SUPERADMIN_CLERK_ID).
 * - `system`: automated pipeline (retention sweeper, privacy scanner, etc.).
 */
export const MemoryActorTypeSchema = z.enum(['forge_user', 'forge_superadmin', 'system']);
export type MemoryActorType = z.infer<typeof MemoryActorTypeSchema>;

/**
 * MemoryTargetTypeSchema — which memory table the correction targets.
 *
 * - `episode`: `memory_episodes` row.
 * - `fact`: `memory_facts` row.
 * - `rule`: `memory_rules` row.
 * - `entity`: `memory_entities` row.
 * - `alias`: entity alias entry.
 */
export const MemoryTargetTypeSchema = z.enum(['episode', 'fact', 'rule', 'entity', 'alias']);
export type MemoryTargetType = z.infer<typeof MemoryTargetTypeSchema>;

/**
 * MemoryCorrectiveActionRequestSchema — body of `POST /internal/memory/correct`.
 *
 * See ADR-memory-engine-v2.md §20.3 L1730-1749.
 *
 * Field order matches the ADR payload order for reviewer diff clarity.
 *
 * - `tenant_id`: isolates the request to the correct tenant shard.
 * - `owner_id`: owner of the agent (Forge `owner.id` cast to string).
 * - `agent_id`: agent slug / ID whose memory is being corrected.
 * - `user_id`: optional — present when the correction targets a user-scoped entry.
 * - `actor_type`: who is performing the action (see `MemoryActorTypeSchema`).
 * - `actor_id`: Clerk user ID of the actor (or "system" for automated actions).
 * - `action`: corrective action to apply (see `MemoryCorrectiveActionSchema`).
 * - `target_type`: which memory table the `target_id` belongs to.
 * - `target_id`: UUID of the row to correct.
 * - `reason`: optional human-readable justification (max 1000 chars). Stored in
 *   `memory_feedback.reason` for audit trail.
 */
export const MemoryCorrectiveActionRequestSchema = z.object({
  tenant_id: z.string().min(1),
  owner_id: z.string().min(1),
  agent_id: z.string().min(1),
  user_id: z.string().optional(),
  actor_type: MemoryActorTypeSchema,
  actor_id: z.string().min(1),
  action: MemoryCorrectiveActionSchema,
  target_type: MemoryTargetTypeSchema,
  target_id: z.string().min(1),
  /** 40.6: destination entity ID for merge_entity action. Required when action=merge_entity. */
  destination_entity_id: z.string().uuid().optional(),
  reason: z.string().max(1000).optional(),
});
export type MemoryCorrectiveActionRequest = z.infer<typeof MemoryCorrectiveActionRequestSchema>;

/**
 * MemoryCorrectiveActionResponseSchema — response body of `POST /internal/memory/correct`.
 *
 * See ADR-memory-engine-v2.md §20.3.
 *
 * - `ok`: always `true` on success (discriminant for bridge HTTP envelope pattern).
 * - `feedback_id`: UUID of the `memory_feedback` row written by the atomic transaction.
 *   Consumer (factory) returns this to the Forge UI for in-place confirmation display.
 */
export const MemoryCorrectiveActionResponseSchema = z.object({
  ok: z.literal(true),
  feedback_id: z.string().uuid(),
});
export type MemoryCorrectiveActionResponse = z.infer<typeof MemoryCorrectiveActionResponseSchema>;
