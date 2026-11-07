import { z } from 'zod';
import { INTERNAL_TOKEN_HEADER } from "../auth/index.js";
import { CapabilityAgentScopeSchema } from "../capability/capability-call-identity.js";
import { CapabilityModelIdSchema } from "../capability/ricerca/agent-config.js";
import { CredentialKeySchema } from "../vault/credential-key.js";
import { CompleteModelIdentitySchema } from "./agent-model-configuration-values.js";
import { ModelChoiceSchema } from "./model-choice.js";
import { findModelConsumer } from "./model-consumers.js";
import { ModelSlotIdSchema } from "./model-slot.js";
import { ModelsGenerationSchema, ModelsModeSchema, modelsEtag } from "./models-generation.js";
/**
 * active with upgradedFrom: a retired model was replaced; show an "updated from" label and warning.
 * retired: a successor is being applied.
 * retired-no-successor: show a red row, keep the choice menu enabled and notify the user.
 */
export const EFFECTIVE_MODEL_SLOT_STATUSES = ['active', 'retired', 'retired-no-successor'];
export const EffectiveModelSlotStatusSchema = z.enum(EFFECTIVE_MODEL_SLOT_STATUSES);
export const EffectiveSlotRetirementReasonSchema = z.enum(['registry', 'provider-inventory', 'provider-error']);
export const EffectiveSlotRetirementSchema = z.object({
    modelId: CapabilityModelIdSchema,
    reason: EffectiveSlotRetirementReasonSchema,
    observedAt: z.iso.datetime({ offset: true }),
}).strict();
/** Own row of the agent, or the row of its preset. */
export const EFFECTIVE_SLOT_ORIGINS = ['agent', 'preset'];
export const EffectiveSlotOriginSchema = z.enum(EFFECTIVE_SLOT_ORIGINS);
/** Effective choice metadata; credential references never contain credential values. */
export const EffectiveModelSlotSchema = z.object({
    choice: ModelChoiceSchema,
    origin: EffectiveSlotOriginSchema,
    version: z.number().int().positive(),
    status: EffectiveModelSlotStatusSchema,
    upgradedFrom: z.string().min(1).max(256).optional(),
    upgradedAt: z.iso.datetime({ offset: true }).optional(),
    /** A retired model is replaced even when the previous choice was manually pinned. */
    upgradedWhilePinned: z.literal(true).optional(),
    retirement: EffectiveSlotRetirementSchema.optional(),
    credentialKey: CredentialKeySchema.nullable(),
    credentialVersion: z.number().int().positive().nullable(),
}).strict().superRefine((slot, ctx) => {
    if ((slot.credentialKey === null) !== (slot.credentialVersion === null)) {
        ctx.addIssue({ code: 'custom', path: ['credentialVersion'], message: 'Credential key and version must be present together or both null' });
    }
    if (slot.upgradedAt !== undefined && slot.upgradedFrom === undefined) {
        ctx.addIssue({ code: 'custom', path: ['upgradedAt'], message: 'Upgrade time requires the previous model' });
    }
    if (slot.upgradedWhilePinned !== undefined && slot.upgradedFrom === undefined) {
        ctx.addIssue({ code: 'custom', path: ['upgradedWhilePinned'], message: 'Pinned upgrade metadata requires the previous model' });
    }
    const retired = slot.status === 'retired' || slot.status === 'retired-no-successor';
    if (retired !== (slot.retirement !== undefined)) {
        ctx.addIssue({ code: 'custom', path: ['retirement'], message: 'Retirement metadata must be present exactly for retired statuses' });
    }
});
/** One declared agent and one generation, with choices for registered consumers only. */
export const EffectiveModelsResponseSchema = z.object({
    identity: CompleteModelIdentitySchema,
    scope: CapabilityAgentScopeSchema,
    mode: ModelsModeSchema,
    generation: ModelsGenerationSchema,
    etag: z.string().min(1).max(256),
    slots: z.record(ModelSlotIdSchema, EffectiveModelSlotSchema),
}).strict().superRefine((response, ctx) => {
    if (response.scope.agentId !== response.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['scope', 'agentId'], message: 'Model scope must name the declared runtime' });
    }
    // A failed nested generation refinement already rejects the response; do not pass it to a throwing parser.
    if (ModelsGenerationSchema.safeParse(response.generation).success && response.etag !== modelsEtag(response)) {
        ctx.addIssue({ code: 'custom', path: ['etag'], message: 'ETag must match the declared mode, identity and generation' });
    }
    for (const [slotId, slot] of Object.entries(response.slots)) {
        const consumer = findModelConsumer(slotId);
        if (consumer === undefined) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId], message: 'Unknown model consumer slot' });
            continue;
        }
        if (slot.choice.function !== consumer.function) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId, 'choice', 'function'], message: 'Model function must match the registered consumer' });
        }
        if (slot.choice.capability !== consumer.capability) {
            ctx.addIssue({ code: 'custom', path: ['slots', slotId, 'choice', 'capability'], message: 'Model capability must match the registered consumer' });
        }
    }
    if (response.mode === 'v1' && Object.keys(response.slots).length !== 0) {
        ctx.addIssue({ code: 'custom', path: ['slots'], message: 'Legacy v1 agents have no effective preset slots' });
    }
});
export const EffectiveModelsParamsSchema = z.object({
    vaultAgentId: z.string().regex(/^[1-9][0-9]{0,9}$/),
}).strict();
/**
 * Token-authenticated effective choices for the declared Vault agent.
 * If-None-Match may carry the last HTTP ETag; a match returns 304 without a body.
 * A 200 response is validated with EffectiveModelsResponseSchema.
 */
export const internalModelsEffectiveContract = {
    method: 'GET',
    path: '/internal/models/effective/:vaultAgentId',
    authType: 'token',
    authHeader: INTERNAL_TOKEN_HEADER,
    paramsSchema: EffectiveModelsParamsSchema,
    responseSchema: EffectiveModelsResponseSchema,
};
export function modelsEffectivePath(vaultAgentId) {
    const params = EffectiveModelsParamsSchema.parse({ vaultAgentId: String(vaultAgentId) });
    return internalModelsEffectiveContract.path.replace(':vaultAgentId', params.vaultAgentId);
}
//# sourceMappingURL=effective-models.js.map