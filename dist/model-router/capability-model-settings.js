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
/** Additive capability configuration; existing legacy routing DTOs remain unchanged. */
export const CapabilityModelSettingsSchema = z.union([AutomaticModelSettingsSchema, PinnedModelSettingsSchema]);
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
    for (const descriptor of [...MODEL_TIERS.map(tier => settings.tiers[tier]), settings.fallback]) {
        const entry = catalog.entries.find(candidate => candidate.function === settings.function && sameModelDescriptor(candidate, descriptor));
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