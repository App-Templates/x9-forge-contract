"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelChoiceSchema = void 0;
exports.toModelChoice = toModelChoice;
exports.toCapabilityModelSettings = toCapabilityModelSettings;
const zod_1 = require("zod");
const parameters_js_1 = require("../capability/parameters.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
/** Same fields as CapabilityModelSettings, without the catalog version and the consumer requirements. */
const choiceBase = {
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    tiers: zod_1.z.record(model_tier_js_1.ModelTierSchema, model_catalog_js_1.ModelDescriptorSchema),
    fallback: model_catalog_js_1.ModelDescriptorSchema,
};
const AutomaticChoiceSchema = zod_1.z.object({ ...choiceBase, mode: zod_1.z.literal('automatic') }).strict();
const PinnedChoiceSchema = zod_1.z.object({ ...choiceBase, mode: zod_1.z.literal('pin'), pin: model_catalog_js_1.ModelDescriptorSchema }).strict().superRefine(capability_model_settings_js_1.refinePinnedTiers);
const SingleChoiceSchema = zod_1.z.object({
    ...choiceBase, tiers: zod_1.z.never().optional(), fallback: zod_1.z.never().optional(),
    mode: zod_1.z.literal('single'), descriptor: model_catalog_js_1.ModelDescriptorSchema,
    embeddingDimensions: zod_1.z.number().int().positive().optional(),
}).strict().superRefine(capability_model_settings_js_1.refineSingleEmbedding);
const FailoverChoiceSchema = zod_1.z.object({
    ...choiceBase, tiers: zod_1.z.never().optional(),
    mode: zod_1.z.literal('failover'), primary: model_catalog_js_1.ModelDescriptorSchema,
}).strict().superRefine(capability_model_settings_js_1.refineFailoverFunction);
/** A model choice that is valid for a preset row and for an agent, not tied to a catalog version. */
exports.ModelChoiceSchema = zod_1.z.union([AutomaticChoiceSchema, PinnedChoiceSchema, SingleChoiceSchema, FailoverChoiceSchema]);
/** Detached copy of the settings without `catalogVersion` and `requirements`. */
function toModelChoice(settings) {
    const { catalogVersion: _catalogVersion, requirements: _requirements, ...choice } = structuredClone(settings);
    return exports.ModelChoiceSchema.parse(choice);
}
/** Adds the catalog version and requirements back and re-validates with the full settings schema. */
function toCapabilityModelSettings(choice, extra) {
    return capability_model_settings_js_1.CapabilityModelSettingsSchema.parse({ ...structuredClone(choice), catalogVersion: extra.catalogVersion, requirements: structuredClone(extra.requirements) });
}
//# sourceMappingURL=model-choice.js.map