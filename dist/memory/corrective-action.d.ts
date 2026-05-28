import { z } from 'zod';
import { MemoryCorrectiveActionSchema } from "./enums.js";
export { MemoryCorrectiveActionSchema };
/**
 * MemoryActorTypeSchema — who performed the corrective action.
 *
 * - `forge_user`: authenticated Forge owner performing a manual correction.
 * - `forge_superadmin`: Stefano / platform superadmin (SUPERADMIN_CLERK_ID).
 * - `system`: automated pipeline (retention sweeper, privacy scanner, etc.).
 */
export declare const MemoryActorTypeSchema: z.ZodEnum<{
    system: "system";
    forge_user: "forge_user";
    forge_superadmin: "forge_superadmin";
}>;
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
export declare const MemoryTargetTypeSchema: z.ZodEnum<{
    episode: "episode";
    fact: "fact";
    rule: "rule";
    entity: "entity";
    alias: "alias";
}>;
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
export declare const MemoryCorrectiveActionRequestSchema: z.ZodObject<{
    tenant_id: z.ZodString;
    owner_id: z.ZodString;
    agent_id: z.ZodString;
    user_id: z.ZodOptional<z.ZodString>;
    actor_type: z.ZodEnum<{
        system: "system";
        forge_user: "forge_user";
        forge_superadmin: "forge_superadmin";
    }>;
    actor_id: z.ZodString;
    action: z.ZodEnum<{
        invalidate: "invalidate";
        forget: "forget";
        redact: "redact";
        pin: "pin";
        promote: "promote";
        demote: "demote";
        merge_entity: "merge_entity";
        split_entity: "split_entity";
        mark_sensitive: "mark_sensitive";
        change_retention: "change_retention";
    }>;
    target_type: z.ZodEnum<{
        episode: "episode";
        fact: "fact";
        rule: "rule";
        entity: "entity";
        alias: "alias";
    }>;
    target_id: z.ZodString;
    destination_entity_id: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
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
export declare const MemoryCorrectiveActionResponseSchema: z.ZodObject<{
    ok: z.ZodLiteral<true>;
    feedback_id: z.ZodString;
}, z.core.$strip>;
export type MemoryCorrectiveActionResponse = z.infer<typeof MemoryCorrectiveActionResponseSchema>;
//# sourceMappingURL=corrective-action.d.ts.map