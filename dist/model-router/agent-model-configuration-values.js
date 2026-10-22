import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability/capability-call-context.js";
import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { CapabilityModelSettingsSchema } from "./capability-model-settings.js";
import { MODEL_TIERS } from "./model-tier.js";
import { ModelSlotIdSchema } from "./model-slot.js";
export const ModelSelectionTierSchema = z.enum([...MODEL_TIERS, 'fallback', 'primary']);
export const AgentModelSelectionSchema = z.object({ slotId: ModelSlotIdSchema, settings: CapabilityModelSettingsSchema }).strict();
/** Complete declared model authority; legacy runtime mappings remain optional elsewhere. */
export const CompleteModelIdentitySchema = AgentRuntimeIdentitySchema.extend({
    managementAgentId: AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    runtimeAgentId: AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0, 'Model identity must not be blank'),
    vaultAgentId: z.number().int().positive(),
}).strict();
/** Source-neutral metadata: the store resolves this declared source and verifies its current version. */
export const AgentModelSourceSchema = z.object({
    identity: CompleteModelIdentitySchema,
    sourceVersion: AgentConfigVersionSchema,
}).strict();
/** Custom remains custom even when its descriptor equals the source's descriptor. */
export const AgentModelBindingSchema = z.discriminatedUnion('origin', [
    z.object({ slotId: ModelSlotIdSchema, origin: z.literal('master'), source: AgentModelSourceSchema }).strict(),
    z.object({ slotId: ModelSlotIdSchema, origin: z.literal('custom'), source: z.never().optional() }).strict(),
]);
/** One explicit binding per selection; scope is declared authority, never provider credentials. */
export const AgentModelsProvenanceSchema = z.object({
    scope: z.lazy(() => CapabilityAgentScopeSchema).refine(scope => [scope.agentId, scope.ownerId, scope.tenantId].every(value => value.trim().length > 0), 'Model scope must not be blank'),
    bindings: z.array(AgentModelBindingSchema).min(1).max(64),
}).strict().superRefine((value, ctx) => {
    if (new Set(value.bindings.map(binding => binding.slotId)).size !== value.bindings.length) {
        ctx.addIssue({ code: 'custom', path: ['bindings'], message: 'Duplicate model binding' });
    }
});
export const AgentModelsConfigurationSchema = z.object({
    schemaVersion: z.literal(1),
    identity: AgentRuntimeIdentitySchema.strict(),
    configVersion: AgentConfigVersionSchema,
    selections: z.array(AgentModelSelectionSchema).min(1).max(64),
    /** Absent on 1.43 legacy; malformed explicit provenance is never discarded. */
    provenance: AgentModelsProvenanceSchema.optional(),
}).strict().superRefine((config, ctx) => {
    if (new Set(config.selections.map(entry => entry.slotId)).size !== config.selections.length)
        ctx.addIssue({ code: 'custom', path: ['selections'], message: 'Duplicate model slot' });
    if (config.provenance === undefined)
        return;
    const provenance = config.provenance;
    if (!CompleteModelIdentitySchema.safeParse(config.identity).success) {
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Explicit model provenance requires complete identity' });
    }
    if (provenance.scope.agentId !== config.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['provenance', 'scope'], message: 'Model scope must name the declared runtime' });
    }
    if (provenance.bindings.length !== config.selections.length || config.selections.some(selection => !provenance.bindings.some(binding => binding.slotId === selection.slotId))) {
        ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings'], message: 'Every model selection requires exactly one binding' });
    }
    const ownIds = new Set([config.identity.managementAgentId, config.identity.runtimeAgentId]);
    const sources = [];
    for (const [index, binding] of provenance.bindings.entries()) {
        if (binding.origin !== 'master')
            continue;
        const source = binding.source.identity;
        if (ownIds.has(source.managementAgentId) || ownIds.has(source.runtimeAgentId) || source.vaultAgentId === config.identity.vaultAgentId) {
            ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings', index, 'source'], message: 'A model source cannot be the destination agent' });
        }
        if (sources.some(previous => (previous.managementAgentId === source.managementAgentId || previous.runtimeAgentId === source.runtimeAgentId || previous.managementAgentId === source.runtimeAgentId || previous.runtimeAgentId === source.managementAgentId || previous.vaultAgentId === source.vaultAgentId) && !sameModelAgentIdentity(previous, source))) {
            ctx.addIssue({ code: 'custom', path: ['provenance', 'bindings', index, 'source'], message: 'Model source identity mapping is ambiguous' });
        }
        sources.push(source);
    }
});
/** Modern store/writer boundary: provenance and all three identifiers are mandatory. */
export const AgentModelsConfigurationWithProvenanceSchema = AgentModelsConfigurationSchema.safeExtend({
    identity: CompleteModelIdentitySchema,
    provenance: AgentModelsProvenanceSchema,
});
/** Parsing returns detached metadata and supplies no source, binding or model defaults. */
export function createAgentModelsConfigurationWithProvenance(input) {
    return AgentModelsConfigurationWithProvenanceSchema.parse(input);
}
/** Compare the canonical mapping, including the optional Vault numeric identity. */
export function sameModelAgentIdentity(left, right) {
    return left.managementAgentId === right.managementAgentId && left.runtimeAgentId === right.runtimeAgentId && left.vaultAgentId === right.vaultAgentId;
}
//# sourceMappingURL=agent-model-configuration-values.js.map