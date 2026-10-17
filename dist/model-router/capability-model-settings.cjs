"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityModelSettingsSchema = void 0;
exports.modelSettingsSelections = modelSettingsSelections;
exports.validateCapabilityModels = validateCapabilityModels;
exports.sameCapabilityModelSettings = sameCapabilityModelSettings;
exports.sameModelFeatures = sameModelFeatures;
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
const SingleModelSettingsSchema = zod_1.z.object({
    ...base, tiers: zod_1.z.never().optional(), fallback: zod_1.z.never().optional(),
    mode: zod_1.z.literal('single'), descriptor: model_catalog_js_1.ModelDescriptorSchema,
    embeddingDimensions: zod_1.z.number().int().positive().optional(),
}).strict().superRefine((settings, ctx) => {
    if ((settings.function === 'embedding') !== (settings.embeddingDimensions !== undefined))
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Single embedding selection requires its vector dimension only' });
});
const FailoverModelSettingsSchema = zod_1.z.object({
    ...base, tiers: zod_1.z.never().optional(),
    mode: zod_1.z.literal('failover'), primary: model_catalog_js_1.ModelDescriptorSchema,
}).strict().superRefine((settings, ctx) => {
    if (settings.function === 'embedding')
        ctx.addIssue({ code: 'custom', path: ['function'], message: 'Embedding cannot fail over into a different vector space' });
});
/** Existing tiered choices remain unchanged; single and failover describe their actual executable paths. */
exports.CapabilityModelSettingsSchema = zod_1.z.union([AutomaticModelSettingsSchema, PinnedModelSettingsSchema, SingleModelSettingsSchema, FailoverModelSettingsSchema]);
/** The installed positions expected for one choice; never invent reasoning tiers for a single-model service. */
function modelSettingsSelections(settings) {
    if (settings.mode === 'single')
        return [{ tier: 'primary', descriptor: settings.descriptor }];
    if (settings.mode === 'failover')
        return [{ tier: 'primary', descriptor: settings.primary }, { tier: 'fallback', descriptor: settings.fallback }];
    return [...model_tier_js_1.MODEL_TIERS.map(tier => ({ tier, descriptor: settings.tiers[tier] })), { tier: 'fallback', descriptor: settings.fallback }];
}
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
    for (const { descriptor } of modelSettingsSelections(settings)) {
        const entry = catalog.entries.find(candidate => candidate.function === settings.function && (0, model_catalog_js_1.sameModelDescriptor)(candidate, descriptor));
        if (!entry) {
            issues.add('model-not-attested');
            continue;
        }
        if (entry.access !== 'available' || entry.runtimeSupport !== 'supported') {
            issues.add('model-unavailable');
            continue;
        }
        if (settings.mode === 'single' && settings.function === 'embedding' && entry.embeddingDimensions !== settings.embeddingDimensions)
            issues.add('embedding-dimension-mismatch');
        if ((settings.requirements.vision === true && entry.features.vision !== true) || (settings.requirements.webSearch === true && entry.features.webSearch !== true) || (settings.requirements.tools && !entry.features.tools) || (settings.requirements.stream && !entry.features.stream) || ((settings.requirements.structuredOutput || settings.function === 'memory-extraction') && !entry.features.structuredOutput))
            issues.add('feature-unsupported');
    }
    return [...issues];
}
/** Canonical settings equivalence independent of object key order; no origins or versions are inferred. */
function sameCapabilityModelSettings(left, right) {
    const a = exports.CapabilityModelSettingsSchema.safeParse(left);
    const b = exports.CapabilityModelSettingsSchema.safeParse(right);
    if (!a.success || !b.success)
        return false;
    const x = a.data;
    const y = b.data;
    if (x.capability !== y.capability || x.function !== y.function || x.catalogVersion !== y.catalogVersion || x.mode !== y.mode)
        return false;
    if (!sameModelFeatures(x.requirements, y.requirements))
        return false;
    if (x.mode === 'single' && y.mode === 'single' && x.embeddingDimensions !== y.embeddingDimensions)
        return false;
    const xs = modelSettingsSelections(x);
    const ys = modelSettingsSelections(y);
    return xs.length === ys.length && xs.every((selection, index) => selection.tier === ys[index]?.tier && (0, model_catalog_js_1.sameModelDescriptor)(selection.descriptor, ys[index].descriptor));
}
function sameModelFeatures(left, right) {
    return left.tools === right.tools && left.stream === right.stream && left.structuredOutput === right.structuredOutput && (left.vision ?? false) === (right.vision ?? false) && (left.webSearch ?? false) === (right.webSearch ?? false);
}
//# sourceMappingURL=capability-model-settings.js.map