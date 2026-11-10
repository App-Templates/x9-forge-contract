"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRetirementNoticeSchema = exports.ModelNoSuccessorNoticeSchema = exports.ModelUpgradedNoticeSchema = exports.ModelUpgradeTargetSchema = exports.MODEL_UPGRADE_TARGETS = exports.vaultModelsRetiredObservedContract = exports.RetiredObservedAckSchema = exports.RetiredModelObservationSchema = void 0;
exports.retirementSource = retirementSource;
exports.vaultModelsRetiredObservedPath = vaultModelsRetiredObservedPath;
exports.retirementNoticeKey = retirementNoticeKey;
const zod_1 = require("zod");
const index_js_1 = require("../auth/index.cjs");
const capability_call_identity_js_1 = require("../capability/capability-call-identity.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const effective_models_js_1 = require("./effective-models.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const model_succession_js_1 = require("./model-succession.cjs");
/**
 * What a service saw when a model no longer exists: the provider's catalog stopped listing it
 * (`provider-inventory`, the hourly catalog scan of agent-core). It is the only way a retirement is observed.
 * Never carries the raw provider error text or any credential.
 */
exports.RetiredModelObservationSchema = zod_1.z.object({
    scope: capability_call_identity_js_1.CapabilityAgentScopeSchema,
    slotId: model_slot_js_1.ModelSlotIdSchema,
    model: model_catalog_js_1.ModelDescriptorSchema,
    source: zod_1.z.literal('provider-inventory'),
}).strict();
/** The vault writes this as the `reason` of the notice. */
function retirementSource(observation) {
    return observation.source;
}
/**
 * `scheduled`: the vault runs its retirement pass now. `not-in-table`: the model has no row in the
 * succession table, so only a notice is produced and never an upgrade. `duplicate`: already known.
 */
exports.RetiredObservedAckSchema = zod_1.z.object({
    ok: zod_1.z.literal(true),
    outcome: zod_1.z.enum(['scheduled', 'not-in-table', 'duplicate']),
}).strict();
/** Agent-core → vault: the same observation, for the declared Vault agent. */
exports.vaultModelsRetiredObservedContract = {
    method: 'POST', path: '/internal/models/retired-observed/:vaultAgentId',
    authType: 'token', authHeader: index_js_1.INTERNAL_TOKEN_HEADER,
    paramsSchema: effective_models_js_1.EffectiveModelsParamsSchema,
    bodySchema: exports.RetiredModelObservationSchema, responseSchema: exports.RetiredObservedAckSchema,
};
function vaultModelsRetiredObservedPath(vaultAgentId) {
    const params = effective_models_js_1.EffectiveModelsParamsSchema.parse({ vaultAgentId: String(vaultAgentId) });
    return exports.vaultModelsRetiredObservedContract.path.replace(':vaultAgentId', params.vaultAgentId);
}
/** Same values as the `model_upgrade_events_target` check in Forge. */
exports.MODEL_UPGRADE_TARGETS = ['preset', 'agent'];
exports.ModelUpgradeTargetSchema = zod_1.z.enum(exports.MODEL_UPGRADE_TARGETS);
const noticeCommon = {
    target: exports.ModelUpgradeTargetSchema,
    targetId: zod_1.z.number().int().positive(),
    slotId: model_slot_js_1.ModelSlotIdSchema,
    previousVersion: zod_1.z.number().int().positive(),
    fromModel: agent_config_js_1.CapabilityModelIdSchema,
    reason: effective_models_js_1.EffectiveSlotRetirementReasonSchema,
    at: zod_1.z.iso.datetime({ offset: true }),
};
/** A retired model was replaced by its successor. */
exports.ModelUpgradedNoticeSchema = zod_1.z.object({
    kind: zod_1.z.literal('upgraded'),
    ...noticeCommon,
    toModel: agent_config_js_1.CapabilityModelIdSchema,
    whilePinned: zod_1.z.boolean(),
}).strict().refine(notice => notice.toModel !== notice.fromModel, {
    path: ['toModel'], message: 'The successor must differ from the retired model',
});
/** A retired model has no usable successor: red row and notification, choice menu stays enabled. */
exports.ModelNoSuccessorNoticeSchema = zod_1.z.object({
    kind: zod_1.z.literal('no-successor'),
    ...noticeCommon,
    cause: model_succession_js_1.NoSuccessorCauseSchema,
}).strict();
exports.ModelRetirementNoticeSchema = zod_1.z.discriminatedUnion('kind', [
    exports.ModelUpgradedNoticeSchema,
    exports.ModelNoSuccessorNoticeSchema,
]);
/**
 * One notice per row and version, the same as Forge's unique
 * `(target, target_id, slot_id, previous_version)` on `model_upgrade_events`.
 */
function retirementNoticeKey(notice) {
    return `${notice.target}:${notice.targetId}:${notice.slotId}:${notice.previousVersion}`;
}
//# sourceMappingURL=model-retirement.js.map