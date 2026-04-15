import { z } from 'zod';
import { ModelProviderSchema } from './model-provider.js';
import { ModelTierMappingSchema } from './model-tier-mapping.js';
import { ModelPolicySchema } from './model-policy.js';
import { PerAgentModelOverrideSchema } from './per-agent-model-override.js';

/**
 * POST /internal/model-config — Forge → X9 model config push.
 *
 * Auth: X-Internal-Secret (same direction as reloadAgentContract; D-16).
 * Endpoint is declared here but NOT implemented in Phase 6 — X9 Phase 35 wires
 * the runtime; Forge Phase 10 builds the UI.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-13, D-14, D-15, D-16
 * @see src/http/endpoints/internal-agents-reload.ts (pattern template)
 */
export const ModelPushRequestSchema = z.object({
  /**
   * Per-provider tier mappings. Provider scoping lives here, not in the mapping (D-09).
   * At least one provider must be present (deploy-time requirement); additional providers
   * are optional per-deployment. `.optional()` on inner value allows partial provider sets
   * (declared-but-absent is rejected — see refine below).
   */
  providers: z.record(ModelProviderSchema, ModelTierMappingSchema.optional())
    .refine((p) => Object.values(p).some((v) => v !== undefined), {
      message: 'ModelPushRequest.providers must include at least one provider mapping',
    }),
  /** Capability-scoped policies keyed by capability name (opaque string, not branded). */
  perCapPolicies: z.record(z.string().min(1), ModelPolicySchema).optional(),
  /** Per-agent overrides — clone X specific model config (D-20). */
  perAgentOverrides: z.array(PerAgentModelOverrideSchema).optional(),
});
export type ModelPushRequest = z.infer<typeof ModelPushRequestSchema>;

/**
 * Model push response — discriminated union on `ok` (D-14 / 06-RESEARCH
 * §Discriminated response shape). Success arm carries `applied` count and
 * optional `reloadVersion` for correlation with ModelHotReloadNotification.
 * Error arm carries a typed `code` from 4 values + human `message` + optional
 * per-capability `details[]`.
 */
export const ModelPushSuccessSchema = z.object({
  ok: z.literal(true),
  applied: z.number().int().nonnegative(),
  reloadVersion: z.string().min(1).optional(),
});

export const ModelPushErrorSchema = z.object({
  ok: z.literal(false),
  code: z.enum(['INVALID_POLICY', 'UNKNOWN_CAP', 'INVALID_MAPPING', 'INTERNAL_ERROR']),
  message: z.string().min(1),
  details: z.array(z.object({
    capName: z.string().min(1).optional(),
    reason: z.string().min(1),
  })).optional(),
});

export const ModelPushResponseSchema = z.discriminatedUnion('ok', [
  ModelPushSuccessSchema,
  ModelPushErrorSchema,
]);
export type ModelPushResponse = z.infer<typeof ModelPushResponseSchema>;

/**
 * Contract for POST /internal/model-config (D-15). Pattern mirrors
 * reloadAgentContract (Phase 4).
 */
export const pushModelConfigContract = {
  method: 'POST' as const,
  path: '/internal/model-config' as const,
  authType: 'secret' as const,
  requestSchema: ModelPushRequestSchema,
  responseSchema: ModelPushResponseSchema,
} as const;
