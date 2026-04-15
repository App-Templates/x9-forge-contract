import { z } from 'zod';
import { AgentIdentitySchema } from '../agent/agent-identity.js';
import { ModelTierSchema } from './model-tier.js';
import { ModelPolicySchema } from './model-policy.js';

/**
 * Per-agent override for Model Router config — cristallizza la visione
 * "clone X su Opus 4.6" (Stefano): pin a specific agent to a tier or a
 * specific model id, independent of the global mapping.
 *
 * Semantic note (D-21): an override here is equivalent to `VaultTier === 'agent'`
 * in the vault domain — but stored in the model config, not the vault (avoids
 * recursion + allows independent hot-reload).
 *
 * Invariant (D-20): must specify at least one of `policy` or `tierMapping`.
 *
 * Partial tierMapping (D-22): unlike the global `ModelTierMapping` which
 * requires all tiers, per-agent overrides may specify a subset. Tiers not
 * overridden fall back to the provider's global mapping.
 *
 * @status greenfield — consumers planned, no live endpoint yet
 * @see CONTEXT D-20, D-21, D-22
 * @see AgentIdentitySchema (branded — Phase 2)
 */
export const PerAgentModelOverrideSchema = z.object({
  agentId: AgentIdentitySchema,
  policy: ModelPolicySchema.optional(),
  tierMapping: z.record(ModelTierSchema, z.string().min(1).optional()).optional(),
}).superRefine((o, ctx) => {
  if (o.policy === undefined && o.tierMapping === undefined) {
    ctx.addIssue({
      code: 'custom',
      message: 'PerAgentModelOverride must specify at least one of: policy, tierMapping',
    });
  }
});

export type PerAgentModelOverride = z.infer<typeof PerAgentModelOverrideSchema>;
