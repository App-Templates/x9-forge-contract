"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EffectiveSlotReadRequestSchema = exports.EffectiveSlotStateSchema = void 0;
exports.effectiveSlotStateFromSlot = effectiveSlotStateFromSlot;
exports.slotFallback = slotFallback;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../capability/capability-call-identity.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const credential_key_js_1 = require("../vault/credential-key.cjs");
const credential_source_js_1 = require("../vault/credential-source.cjs");
const effective_models_js_1 = require("./effective-models.cjs");
const model_choice_js_1 = require("./model-choice.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const models_generation_js_1 = require("./models-generation.cjs");
/** What agent-core tells a service about one model slot. */
exports.EffectiveSlotStateSchema = zod_1.z.discriminatedUnion('state', [
    zod_1.z.object({ state: zod_1.z.literal('disabled') }).strict(),
    zod_1.z.object({
        state: zod_1.z.literal('configured'),
        choice: model_choice_js_1.ModelChoiceSchema,
        generation: models_generation_js_1.ModelsGenerationSchema,
        credentialKey: credential_key_js_1.CredentialKeySchema.nullable(),
        credentialVersion: zod_1.z.number().int().positive().nullable(),
        /**
         * Version of the key with its source. `revoked === true` is an urgent revocation (the service closes the
         * session at once); a higher `counter` with `revoked` false is an ordinary rotation (an open session continues).
         * `revokedThrough` is the revocation threshold: it keeps covering older versions after a later rotation.
         * Services decide with `credentialVersionRevoked(opened, credential)`.
         */
        credential: credential_source_js_1.CredentialVersionRefSchema.nullable().optional(),
        etag: zod_1.z.string().min(1).max(256),
    }).strict(),
    zod_1.z.object({ state: zod_1.z.literal('unconfigured') }).strict(),
    zod_1.z.object({ state: zod_1.z.literal('unavailable') }).strict(),
    zod_1.z.object({ state: zod_1.z.literal('identity_mismatch'), field: zod_1.z.enum(['tenantId', 'ownerId', 'agentId']) }).strict(),
    zod_1.z.object({ state: zod_1.z.literal('capability_disabled') }).strict(),
    /**
     * agent-core sends this for an effective slot with status 'retired-no-successor'.
     * The service must avoid the provider call and return an error naming the agent, slot and model.
     */
    zod_1.z.object({
        state: zod_1.z.literal('retired_no_successor'),
        modelId: agent_config_js_1.CapabilityModelIdSchema,
        reason: effective_models_js_1.EffectiveSlotRetirementReasonSchema,
    }).strict(),
]);
/** Convert the effective Vault slot into the state shared by agent-core and its services. */
function effectiveSlotStateFromSlot(slot, extra) {
    if (slot.status === 'retired-no-successor') {
        const retirement = effective_models_js_1.EffectiveSlotRetirementSchema.parse(slot.retirement);
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
exports.EffectiveSlotReadRequestSchema = zod_1.z.object({
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    slotId: model_slot_js_1.ModelSlotIdSchema,
}).strict();
/** When a service may fall back; an explicit refusal is never papered over by a cache or an invented default. */
function slotFallback(state, lastKnown) {
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