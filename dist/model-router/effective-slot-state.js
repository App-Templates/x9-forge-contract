import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability/capability-call-identity.js";
import { CapabilityModelIdSchema } from "../capability/ricerca/agent-config.js";
import { CredentialKeySchema } from "../vault/credential-key.js";
import { CredentialVersionRefSchema } from "../vault/credential-source.js";
import { EffectiveSlotRetirementReasonSchema, EffectiveSlotRetirementSchema } from "./effective-models.js";
import { ModelChoiceSchema } from "./model-choice.js";
import { ModelSlotIdSchema } from "./model-slot.js";
import { ModelsGenerationSchema } from "./models-generation.js";
/** What agent-core tells a service about one model slot. */
export const EffectiveSlotStateSchema = z.discriminatedUnion('state', [
    z.object({ state: z.literal('disabled') }).strict(),
    z.object({
        state: z.literal('configured'),
        choice: ModelChoiceSchema,
        generation: ModelsGenerationSchema,
        credentialKey: CredentialKeySchema.nullable(),
        credentialVersion: z.number().int().positive().nullable(),
        /**
         * Version of the key with its source. `revoked === true` is an urgent revocation (the service closes the
         * session at once); a higher `counter` with `revoked` false is an ordinary rotation (an open session continues).
         * `revokedThrough` is the revocation threshold: it keeps covering older versions after a later rotation.
         * Services decide with `credentialVersionRevoked(opened, credential)`.
         */
        credential: CredentialVersionRefSchema.nullable().optional(),
        etag: z.string().min(1).max(256),
    }).strict(),
    z.object({ state: z.literal('unconfigured') }).strict(),
    z.object({ state: z.literal('unavailable') }).strict(),
    z.object({ state: z.literal('identity_mismatch'), field: z.enum(['tenantId', 'ownerId', 'agentId']) }).strict(),
    z.object({ state: z.literal('capability_disabled') }).strict(),
    /**
     * agent-core sends this for an effective slot with status 'retired-no-successor'.
     * The service must avoid the provider call and return an error naming the agent, slot and model.
     */
    z.object({
        state: z.literal('retired_no_successor'),
        modelId: CapabilityModelIdSchema,
        reason: EffectiveSlotRetirementReasonSchema,
    }).strict(),
]);
/** Convert the effective Vault slot into the state shared by agent-core and its services. */
export function effectiveSlotStateFromSlot(slot, extra) {
    if (slot.status === 'retired-no-successor') {
        const retirement = EffectiveSlotRetirementSchema.parse(slot.retirement);
        return { state: 'retired_no_successor', modelId: retirement.modelId, reason: retirement.reason };
    }
    return {
        state: 'configured',
        choice: slot.choice,
        generation: extra.generation,
        credentialKey: slot.credentialKey,
        credentialVersion: slot.credentialVersion,
        ...(extra.credential === undefined ? {} : { credential: extra.credential }),
        etag: extra.etag,
    };
}
/** The identity triple travels in the body, never in the path. */
export const EffectiveSlotReadRequestSchema = z.object({
    scope: CapabilityAgentScopeSchema,
    slotId: ModelSlotIdSchema,
}).strict();
/** When a service may fall back; an explicit refusal is never papered over by a cache or an invented default. */
export function slotFallback(state, lastKnown) {
    switch (state.state) {
        case 'disabled': return 'v1';
        case 'configured': return 'choice';
        case 'retired_no_successor': return 'refuse';
        case 'unavailable': return lastKnown?.sameIdentity === true ? 'last-known' : 'refuse';
        case 'unconfigured':
        case 'identity_mismatch':
        case 'capability_disabled': return 'refuse';
    }
}
//# sourceMappingURL=effective-slot-state.js.map