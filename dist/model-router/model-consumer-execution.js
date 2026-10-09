import { z } from 'zod';
import { AgentRuntimeIdentitySchema } from "../agent/agent-runtime-identity.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability/capability-call-context.js";
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentManagementReasonSchema, AgentManagementRequestIdSchema } from "../agent/agent-management.js";
import { CapabilityModelSettingsSchema, sameCapabilityModelSettings, sameModelFeatures } from "./capability-model-settings.js";
import { AgentModelBootstrapSourceVersionSchema, sameModelAgentIdentity } from "./agent-model-configuration.js";
import { ModelSlotIdSchema } from "./model-slot.js";
import { findModelConsumerDefinition } from "./model-consumers.js";
import { ModelEmbeddingRebuildSchema } from "./models-batch.js";
import { sameModelDescriptor } from "./model-catalog.js";
const Identity = AgentRuntimeIdentitySchema.extend({
    managementAgentId: AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0),
    runtimeAgentId: AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0),
    vaultAgentId: z.number().int().positive(),
}).strict();
const Scope = CapabilityAgentScopeSchema.refine(scope => Object.values(scope).every(value => value.trim().length > 0));
/** Selection is declared by the registered service, never by caller-chosen feature requirements. */
export function isRegisteredModelConsumerSelection(slotId, input) {
    const definition = findModelConsumerDefinition(slotId);
    const parsed = CapabilityModelSettingsSchema.safeParse(input);
    if (definition === undefined || !parsed.success)
        return false;
    const settings = parsed.data;
    const routing = settings.mode === 'single' ? 'single' : settings.mode === 'failover' ? 'failover' : 'tiered';
    return definition.capability === settings.capability && definition.function === settings.function && definition.routing === routing && sameModelFeatures(definition.requirements, settings.requirements);
}
function checkScope(value, ctx) {
    if (value.scope.agentId !== value.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Consumer scope names the addressed runtime' });
}
export const ModelConsumerInstallRequestSchema = z.object({
    schemaVersion: z.literal(1), identity: Identity, scope: Scope, slotId: ModelSlotIdSchema,
    configVersion: AgentConfigVersionSchema, requestId: AgentManagementRequestIdSchema,
    expectedSourceVersion: AgentModelBootstrapSourceVersionSchema, settings: CapabilityModelSettingsSchema,
}).strict().superRefine((request, ctx) => {
    checkScope(request, ctx);
    if (!isRegisteredModelConsumerSelection(request.slotId, request.settings))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Install exactly the registered consumer selection' });
});
/** Actual service/provider readback; a pending rebuild retains its previous vector space. */
export const ModelConsumerRuntimeStateSchema = z.object({
    schemaVersion: z.literal(1), identity: Identity, scope: Scope, slotId: ModelSlotIdSchema,
    sourceVersion: AgentModelBootstrapSourceVersionSchema,
    observedAt: z.iso.datetime({ offset: true }), validUntil: z.iso.datetime({ offset: true }),
    status: z.enum(['installed', 'pending', 'failed', 'unknown']),
    configVersion: AgentConfigVersionSchema.nullable(), requestId: AgentManagementRequestIdSchema.nullable(),
    settings: CapabilityModelSettingsSchema.nullable(), reason: z.string().trim().min(1).max(500).nullable(),
    embedding: ModelEmbeddingRebuildSchema.nullable(),
}).strict().superRefine((state, ctx) => {
    checkScope(state, ctx);
    if (findModelConsumerDefinition(state.slotId) === undefined)
        ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Unknown consumer cannot attest installation' });
    if (Date.parse(state.validUntil) <= Date.parse(state.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Readback validity ends after observation' });
    if ((state.status === 'installed') !== (state.reason === null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Non-installed state has a sanitized reason' });
    if (state.settings !== null && !isRegisteredModelConsumerSelection(state.slotId, state.settings))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Readback must match the registered consumer' });
    if (state.status === 'installed' && (state.settings === null || state.configVersion === null || state.requestId === null))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Installed requires actual selection, version and request' });
    if (state.embedding !== null) {
        if (state.settings?.mode !== 'single' || state.settings.function !== 'embedding' || !sameModelDescriptor(state.settings.descriptor, state.embedding.active))
            ctx.addIssue({ code: 'custom', path: ['embedding'], message: 'Readback must use the active vector space' });
        if (state.status === 'installed' && state.embedding.state !== 'completed')
            ctx.addIssue({ code: 'custom', path: ['status'], message: 'Rebuild must complete before target installation' });
    }
});
export const ModelConsumerInstallReceiptSchema = z.object({
    requestId: AgentManagementRequestIdSchema, outcome: z.enum(['installed', 'pending', 'failed']),
    state: ModelConsumerRuntimeStateSchema,
}).strict().superRefine((receipt, ctx) => {
    if (receipt.outcome === 'installed' && (receipt.state.status !== 'installed' || receipt.state.requestId !== receipt.requestId))
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Installed receipt identifies the actually completed request' });
    if (receipt.outcome !== 'installed' && receipt.state.status === 'installed')
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Pending/failed receipt must not claim target installed' });
});
/** Fresh server-held generation and authority after awaits; never trust an echoed expected generation. */
export function isModelConsumerInstallRequestCurrent(input, freshSource) {
    const request = ModelConsumerInstallRequestSchema.safeParse(input);
    const source = z.object({ identity: Identity, scope: Scope, sourceVersion: AgentModelBootstrapSourceVersionSchema }).strict().safeParse(freshSource);
    return request.success && source.success && request.data.expectedSourceVersion === source.data.sourceVersion && sameModelAgentIdentity(request.data.identity, source.data.identity) && sameCapabilityScope(request.data.scope, source.data.scope);
}
/** Confirm model-only installation, not a write, queued work or opened channel. */
export function isModelConsumerInstallConfirmed(input, observedReceipt, now = new Date()) {
    const parsed = ModelConsumerInstallRequestSchema.safeParse(input);
    const result = ModelConsumerInstallReceiptSchema.safeParse(observedReceipt);
    if (!parsed.success || !result.success)
        return false;
    const request = parsed.data;
    const receipt = result.data;
    const state = receipt.state;
    const time = now.getTime();
    if (receipt.outcome !== 'installed' || state.status !== 'installed' || !Number.isFinite(time) || time < Date.parse(state.observedAt) - 5_000 || time >= Date.parse(state.validUntil))
        return false;
    if (receipt.requestId !== request.requestId || state.requestId !== request.requestId || state.configVersion !== request.configVersion || state.slotId !== request.slotId)
        return false;
    return sameModelAgentIdentity(request.identity, state.identity) && sameCapabilityScope(request.scope, state.scope) && sameCapabilityModelSettings(request.settings, state.settings);
}
export const ModelConsumerStateRequestSchema = z.object({ identity: Identity, scope: Scope, slotId: ModelSlotIdSchema }).strict().superRefine((request, ctx) => {
    checkScope(request, ctx);
    if (findModelConsumerDefinition(request.slotId) === undefined)
        ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Read only a registered consumer' });
});
/** Shape-only interchange for Python. Cross-field/CAS/readback refinements still require canonical producer validation. */
export function modelConsumerTransportJsonSchemas() {
    return {
        install: z.toJSONSchema(ModelConsumerInstallRequestSchema), state: z.toJSONSchema(ModelConsumerRuntimeStateSchema),
        receipt: z.toJSONSchema(ModelConsumerInstallReceiptSchema), read: z.toJSONSchema(ModelConsumerStateRequestSchema),
    };
}
/** Sanitized service failure, never a raw provider body. */
export const ModelConsumerTransportErrorSchema = z.object({ ok: z.literal(false), reason: AgentManagementReasonSchema }).strict();
/** Producers check this before state/install handling; a trusted service URL does not authorize a different slot. */
export function isModelConsumerRouteRequestMatching(params, body) {
    const path = z.object({ slotId: ModelSlotIdSchema }).strict().safeParse(params);
    const request = z.union([ModelConsumerInstallRequestSchema, ModelConsumerStateRequestSchema]).safeParse(body);
    return path.success && request.success && path.data.slotId === request.data.slotId;
}
//# sourceMappingURL=model-consumer-execution.js.map