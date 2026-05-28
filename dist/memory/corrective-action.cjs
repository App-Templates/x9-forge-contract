"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryCorrectiveActionResponseSchema = exports.MemoryCorrectiveActionRequestSchema = exports.MemoryTargetTypeSchema = exports.MemoryActorTypeSchema = exports.MemoryCorrectiveActionSchema = void 0;
const zod_1 = require("zod");
const enums_js_1 = require("./enums.cjs");
Object.defineProperty(exports, "MemoryCorrectiveActionSchema", { enumerable: true, get: function () { return enums_js_1.MemoryCorrectiveActionSchema; } });
/**
 * MemoryActorTypeSchema — who performed the corrective action.
 *
 * - `forge_user`: authenticated Forge owner performing a manual correction.
 * - `forge_superadmin`: Stefano / platform superadmin (SUPERADMIN_CLERK_ID).
 * - `system`: automated pipeline (retention sweeper, privacy scanner, etc.).
 */
exports.MemoryActorTypeSchema = zod_1.z.enum(['forge_user', 'forge_superadmin', 'system']);
/**
 * MemoryTargetTypeSchema — which memory table the correction targets.
 *
 * - `episode`: `memory_episodes` row.
 * - `fact`: `memory_facts` row.
 * - `rule`: `memory_rules` row.
 * - `entity`: `memory_entities` row.
 * - `alias`: entity alias entry.
 */
exports.MemoryTargetTypeSchema = zod_1.z.enum(['episode', 'fact', 'rule', 'entity', 'alias']);
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
exports.MemoryCorrectiveActionRequestSchema = zod_1.z.object({
    tenant_id: zod_1.z.string().min(1),
    owner_id: zod_1.z.string().min(1),
    agent_id: zod_1.z.string().min(1),
    user_id: zod_1.z.string().optional(),
    actor_type: exports.MemoryActorTypeSchema,
    actor_id: zod_1.z.string().min(1),
    action: enums_js_1.MemoryCorrectiveActionSchema,
    target_type: exports.MemoryTargetTypeSchema,
    target_id: zod_1.z.string().min(1),
    /** 40.6: destination entity ID for merge_entity action. Required when action=merge_entity. */
    destination_entity_id: zod_1.z.string().uuid().optional(),
    reason: zod_1.z.string().max(1000).optional(),
});
/**
 * MemoryCorrectiveActionResponseSchema — response body of `POST /internal/memory/correct`.
 *
 * See ADR-memory-engine-v2.md §20.3.
 *
 * - `ok`: always `true` on success (discriminant for bridge HTTP envelope pattern).
 * - `feedback_id`: UUID of the `memory_feedback` row written by the atomic transaction.
 *   Consumer (factory) returns this to the Forge UI for in-place confirmation display.
 */
exports.MemoryCorrectiveActionResponseSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    feedback_id: zod_1.z.string().uuid(),
});
//# sourceMappingURL=corrective-action.js.map