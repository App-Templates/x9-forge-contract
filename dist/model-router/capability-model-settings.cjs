"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityModelSettingsSchema = void 0;
exports.validateCapabilityModels = validateCapabilityModels;
const zod_1 = require("zod");
const parameters_js_1 = require("../capability/parameters.cjs");
const model_tier_js_1 = require("./model-tier.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const base = {
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    catalogVersion: model_catalog_js_1.ModelCatalogVersionSchema,
    /** Consumer requirements; the producer must validate against its own capability requirements. */
    requirements: model_catalog_js_1.ModelFeaturesSchema,
    tiers: zod_1.z.record(model_tier_js_1.ModelTierSchema, model_catalog_js_1.ModelDescriptorSchema),
    fallback: model_catalog_js_1.ModelDescriptorSchema,
};
const AutomaticModelSettingsSchema = zod_1.z.object({ ...base, mode: zod_1.z.literal('automatic') }).strict();
const PinnedModelSettingsSchema = zod_1.z.object({ ...base, mode: zod_1.z.literal('pin'), pin: model_catalog_js_1.ModelDescriptorSchema }).strict().superRefine((settings, ctx) => {
    for (const tier of model_tier_js_1.MODEL_TIERS) {
        if (!(0, model_catalog_js_1.sameModelDescriptor)(settings.pin, settings.tiers[tier]))
            ctx.addIssue({ code: 'custom', path: ['tiers', tier], message: 'Every pinned tier must use the pinned descriptor' });
    }
    if (!(0, model_catalog_js_1.sameModelDescriptor)(settings.pin, settings.fallback))
        ctx.addIssue({ code: 'custom', path: ['fallback'], message: 'A pin must also cover the fallback descriptor' });
});
/** Additive capability configuration; existing legacy routing DTOs remain unchanged. */
exports.CapabilityModelSettingsSchema = zod_1.z.union([AutomaticModelSettingsSchema, PinnedModelSettingsSchema]);
/** Validate the selected metadata against a fresh catalog for the explicitly addressed management agent. */
function validateCapabilityModels(input, source, agentId, now = new Date()) {
    const selected = exports.CapabilityModelSettingsSchema.safeParse(input);
    if (!selected.success)
        return ['invalid-settings'];
    const parsed = model_catalog_js_1.ModelCatalogSchema.safeParse(source);
    if (!parsed.success)
        return ['invalid-catalog'];
    const settings = selected.data;
    const catalog = parsed.data;
    if (catalog.agentId !== agentId)
        return ['agent-mismatch'];
    if (catalog.version !== settings.catalogVersion)
        return ['catalog-version-mismatch'];
    if (catalog.state !== 'available' && catalog.state !== 'partial')
        return ['catalog-unavailable'];
    const timestamp = now.getTime();
    if (!Number.isFinite(timestamp) || catalog.observedAt === null || catalog.validUntil === null || timestamp < Date.parse(catalog.observedAt) - 5_000 || timestamp >= Date.parse(catalog.validUntil))
        return ['catalog-stale'];
    const issues = new Set();
    for (const descriptor of [...model_tier_js_1.MODEL_TIERS.map(tier => settings.tiers[tier]), settings.fallback]) {
        const entry = catalog.entries.find(candidate => candidate.function === settings.function && (0, model_catalog_js_1.sameModelDescriptor)(candidate, descriptor));
        if (!entry) {
            issues.add('model-not-attested');
            continue;
        }
        if (entry.access !== 'available' || entry.runtimeSupport !== 'supported') {
            issues.add('model-unavailable');
            continue;
        }
        if ((settings.requirements.tools && !entry.features.tools) || (settings.requirements.stream && !entry.features.stream) || ((settings.requirements.structuredOutput || settings.function === 'memory-extraction') && !entry.features.structuredOutput))
            issues.add('feature-unsupported');
    }
    return [...issues];
}
//# sourceMappingURL=capability-model-settings.js.map