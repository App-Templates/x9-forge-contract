import { z } from 'zod';
import { CapabilityAgentScopeSchema } from '../capability/capability-call-identity.js';
import { CredentialKeySchema } from '../vault/credential-key.js';
import { ModelChoiceSchema } from './model-choice.js';
import { ModelSlotIdSchema } from './model-slot.js';
import { ModelsGenerationSchema } from './models-generation.js';

/** What agent-core tells a service about one model slot. */
export const EffectiveSlotStateSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('disabled') }).strict(),
  z.object({
    state: z.literal('configured'),
    choice: ModelChoiceSchema,
    generation: ModelsGenerationSchema,
    credentialKey: CredentialKeySchema.nullable(),
    credentialVersion: z.number().int().positive().nullable(),
    etag: z.string().min(1).max(256),
  }).strict(),
  z.object({ state: z.literal('unconfigured') }).strict(),
  z.object({ state: z.literal('unavailable') }).strict(),
  z.object({ state: z.literal('identity_mismatch'), field: z.enum(['tenantId', 'ownerId', 'agentId']) }).strict(),
  z.object({ state: z.literal('capability_disabled') }).strict(),
]);
export type EffectiveSlotState = z.infer<typeof EffectiveSlotStateSchema>;

/** The identity triple travels in the body, never in the path. */
export const EffectiveSlotReadRequestSchema = z.object({
  scope: CapabilityAgentScopeSchema,
  slotId: ModelSlotIdSchema,
}).strict();
export type EffectiveSlotReadRequest = z.infer<typeof EffectiveSlotReadRequestSchema>;

export type SlotFallback = 'v1' | 'choice' | 'last-known' | 'refuse';

/** When a service may fall back; an explicit refusal is never papered over by a cache or an invented default. */
export function slotFallback(state: EffectiveSlotState, lastKnown: { sameIdentity: boolean } | null): SlotFallback {
  switch (state.state) {
    case 'disabled': return 'v1';
    case 'configured': return 'choice';
    case 'unavailable': return lastKnown?.sameIdentity === true ? 'last-known' : 'refuse';
    case 'unconfigured':
    case 'identity_mismatch':
    case 'capability_disabled': return 'refuse';
  }
}
