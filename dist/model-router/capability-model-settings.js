import { z } from 'zod';
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { MODEL_TIERS, ModelTierSchema } from "./model-tier.js";
import { ModelCatalogSchema, ModelCatalogVersionSchema, ModelDescriptorSchema, ModelFeaturesSchema, ModelFunctionSchema, sameModelDescriptor } from "./model-catalog.js";
const base = {
    capability: CapabilityAgentParametersSchema.shape.capability,
    function: ModelFunctionSchema,
    catalogVersion: ModelCatalogVersionSchema,
    /** Consumer requirements; the producer must validate against its own capability requirements. */
    requirements: ModelFeaturesSchema,
    tiers: z.record(ModelTierSchema, ModelDescriptorSchema),
    fallback: ModelDescriptorSchema,
};
const AutomaticModelSettingsSchema = z.object({ ...base, mode: z.literal('automatic') }).strict();
const PinnedModelSettingsSchema = z.object({ ...base, mode: z.literal('pin'), pin: ModelDescriptorSchema }).strict().superRefine((settings, ctx) => {
    for (const tier of MODEL_TIERS) {
        if (!sameModelDescriptor(settings.pin, settings.tiers[tier]))
            ctx.addIssue({ code: 'custom', path: ['tiers', tier], message: 'Every pinned tier must use the pinned descriptor' });
    }
    if (!sameModelDescriptor(settings.pin, settings.fallback))
        ctx.addIssue({ code: 'custom', path: ['fallback'], message: 'A pin must also cover the fallback descriptor' });
});
const SingleModelSettingsSchema = z.object({
    ...base, tiers: z.never().optional(), fallback: z.never().optional(),
    mode: z.literal('single'), descriptor: ModelDescriptorSchema,
    embeddingDimensions: z.number().int().positive().optional(),
}).strict().superRefine((settings, ctx) => {
    if ((settings.function === 'embedding') !== (settings.embeddingDimensions !== undefined))
        ctx.addIssue({ code: 'custom', path: ['embeddingDimensions'], message: 'Single embedding selection requires its vector dimension only' });
});
const FailoverModelSettingsSchema = z.object({
    ...base, tiers: z.never().optional(),
    mode: z.literal('failover'), primary: ModelDescriptorSchema,
}).strict().superRefine((settings, ctx) => {
    if (settings.function === 'embedding')
        ctx.addIssue({ code: 'custom', path: ['function'], message: 'Embedding cannot fail over into a different vector space' });
});
/** Existing tiered choices remain unchanged; single and failover describe their actual executable paths. */
export const CapabilityModelSettingsSchema = z.union([AutomaticModelSettingsSchema, PinnedModelSettingsSchema, SingleModelSettingsSchema, FailoverModelSettingsSchema]);
/** The installed positions expected for one choice; never invent reasoning tiers for a single-model service. */
export function modelSettingsSelections(settings) {
    if (settings.mode === 'single')
        return [{ tier: 'primary', descriptor: settings.descriptor }];
    if (settings.mode === 'failover')
        return [{ tier: 'primary', descriptor: settings.primary }, { tier: 'fallback', descriptor: settings.fallback }];
    return [...MODEL_TIERS.map(tier => ({ tier, descriptor: settings.tiers[tier] })), { tier: 'fallback', descriptor: settings.fallback }];
}
/** Validate the selected metadata against a fresh catalog for the explicitly addressed management agent. */
export function validateCapabilityModels(input, source, agentId, now = new Date()) {
    const selected = CapabilityModelSettingsSchema.safeParse(input);
    if (!selected.success)
        return ['invalid-settings'];
    const parsed = ModelCatalogSchema.safeParse(source);
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
        const entry = catalog.entries.find(candidate => candidate.function === settings.function && sameModelDescriptor(candidate, descriptor));
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
export function sameCapabilityModelSettings(left, right) {
    const a = CapabilityModelSettingsSchema.safeParse(left);
    const b = CapabilityModelSettingsSchema.safeParse(right);
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
    return xs.length === ys.length && xs.every((selection, index) => selection.tier === ys[index]?.tier && sameModelDescriptor(selection.descriptor, ys[index].descriptor));
}
export function sameModelFeatures(left, right) {
    return left.tools === right.tools && left.stream === right.stream && left.structuredOutput === right.structuredOutput && (left.vision ?? false) === (right.vision ?? false) && (left.webSearch ?? false) === (right.webSearch ?? false);
}
//# sourceMappingURL=capability-model-settings.js.map