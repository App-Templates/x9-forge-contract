"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelConsumerTransportErrorSchema = exports.ModelConsumerStateRequestSchema = exports.ModelConsumerInstallReceiptSchema = exports.ModelConsumerRuntimeStateSchema = exports.ModelConsumerInstallRequestSchema = void 0;
exports.isRegisteredModelConsumerSelection = isRegisteredModelConsumerSelection;
exports.isModelConsumerInstallRequestCurrent = isModelConsumerInstallRequestCurrent;
exports.isModelConsumerInstallConfirmed = isModelConsumerInstallConfirmed;
exports.modelConsumerTransportJsonSchemas = modelConsumerTransportJsonSchemas;
exports.isModelConsumerRouteRequestMatching = isModelConsumerRouteRequestMatching;
const zod_1 = require("zod");
const agent_runtime_identity_js_1 = require("../agent/agent-runtime-identity.cjs");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const capability_model_settings_js_1 = require("./capability-model-settings.cjs");
const agent_model_configuration_js_1 = require("./agent-model-configuration.cjs");
const model_slot_js_1 = require("./model-slot.cjs");
const model_consumers_js_1 = require("./model-consumers.cjs");
const models_batch_js_1 = require("./models-batch.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
const Identity = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.extend({
    managementAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.managementAgentId.refine(value => value.trim().length > 0),
    runtimeAgentId: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.shape.runtimeAgentId.refine(value => value.trim().length > 0),
    vaultAgentId: zod_1.z.number().int().positive(),
}).strict();
const Scope = capability_call_context_js_1.CapabilityAgentScopeSchema.refine(scope => Object.values(scope).every(value => value.trim().length > 0));
/** Selection is declared by the registered service, never by caller-chosen feature requirements. */
function isRegisteredModelConsumerSelection(slotId, input) {
    const definition = (0, model_consumers_js_1.findModelConsumerDefinition)(slotId);
    const parsed = capability_model_settings_js_1.CapabilityModelSettingsSchema.safeParse(input);
    if (definition === undefined || !parsed.success)
        return false;
    const settings = parsed.data;
    const routing = settings.mode === 'single' ? 'single' : settings.mode === 'failover' ? 'failover' : 'tiered';
    return definition.capability === settings.capability && definition.function === settings.function && definition.routing === routing && (0, capability_model_settings_js_1.sameModelFeatures)(definition.requirements, settings.requirements);
}
function checkScope(value, ctx) {
    if (value.scope.agentId !== value.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['scope'], message: 'Consumer scope names the addressed runtime' });
}
exports.ModelConsumerInstallRequestSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1), identity: Identity, scope: Scope, slotId: model_slot_js_1.ModelSlotIdSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema, requestId: agent_management_js_1.AgentManagementRequestIdSchema,
    expectedSourceVersion: agent_model_configuration_js_1.AgentModelBootstrapSourceVersionSchema, settings: capability_model_settings_js_1.CapabilityModelSettingsSchema,
}).strict().superRefine((request, ctx) => {
    checkScope(request, ctx);
    if (!isRegisteredModelConsumerSelection(request.slotId, request.settings))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Install exactly the registered consumer selection' });
});
/** Actual service/provider readback; a pending rebuild retains its previous vector space. */
exports.ModelConsumerRuntimeStateSchema = zod_1.z.object({
    schemaVersion: zod_1.z.literal(1), identity: Identity, scope: Scope, slotId: model_slot_js_1.ModelSlotIdSchema,
    sourceVersion: agent_model_configuration_js_1.AgentModelBootstrapSourceVersionSchema,
    observedAt: zod_1.z.iso.datetime({ offset: true }), validUntil: zod_1.z.iso.datetime({ offset: true }),
    status: zod_1.z.enum(['installed', 'pending', 'failed', 'unknown', 'observed']),
    configVersion: agent_config_js_1.AgentConfigVersionSchema.nullable(), requestId: agent_management_js_1.AgentManagementRequestIdSchema.nullable(),
    settings: capability_model_settings_js_1.CapabilityModelSettingsSchema.nullable(), reason: zod_1.z.string().trim().min(1).max(500).nullable(),
    embedding: models_batch_js_1.ModelEmbeddingRebuildSchema.nullable(),
}).strict().superRefine((state, ctx) => {
    checkScope(state, ctx);
    if ((0, model_consumers_js_1.findModelConsumerDefinition)(state.slotId) === undefined)
        ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Unknown consumer cannot attest installation' });
    if (Date.parse(state.validUntil) <= Date.parse(state.observedAt))
        ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Readback validity ends after observation' });
    if ((state.status === 'installed') !== (state.reason === null))
        ctx.addIssue({ code: 'custom', path: ['reason'], message: 'Non-installed state has a sanitized reason' });
    if (state.settings !== null && !isRegisteredModelConsumerSelection(state.slotId, state.settings))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Readback must match the registered consumer' });
    if (state.status === 'installed' && (state.settings === null || state.configVersion === null || state.requestId === null))
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Installed requires actual selection, version and request' });
    // Positive legacy readback carries no Forge installation authority.
    if (state.status === 'observed' && state.settings === null)
        ctx.addIssue({ code: 'custom', path: ['settings'], message: 'Observed requires actual legacy selection' });
    if (state.status === 'observed' && state.configVersion !== null)
        ctx.addIssue({ code: 'custom', path: ['configVersion'], message: 'Observed cannot claim an installed config version' });
    if (state.status === 'observed' && state.requestId !== null)
        ctx.addIssue({ code: 'custom', path: ['requestId'], message: 'Observed cannot claim an installation request' });
    if (state.embedding !== null) {
        if (state.settings?.mode !== 'single' || state.settings.function !== 'embedding' || !(0, model_catalog_js_1.sameModelDescriptor)(state.settings.descriptor, state.embedding.active))
            ctx.addIssue({ code: 'custom', path: ['embedding'], message: 'Readback must use the active vector space' });
        if (state.status === 'installed' && state.embedding.state !== 'completed')
            ctx.addIssue({ code: 'custom', path: ['status'], message: 'Rebuild must complete before target installation' });
    }
});
exports.ModelConsumerInstallReceiptSchema = zod_1.z.object({
    requestId: agent_management_js_1.AgentManagementRequestIdSchema, outcome: zod_1.z.enum(['installed', 'pending', 'failed']),
    state: exports.ModelConsumerRuntimeStateSchema,
}).strict().superRefine((receipt, ctx) => {
    if (receipt.outcome === 'installed' && (receipt.state.status !== 'installed' || receipt.state.requestId !== receipt.requestId))
        ctx.addIssue({ code: 'custom', path: ['state'], message: 'Installed receipt identifies the actually completed request' });
    if (receipt.outcome !== 'installed' && receipt.state.status === 'installed')
        ctx.addIssue({ code: 'custom', path: ['outcome'], message: 'Pending/failed receipt must not claim target installed' });
});
/** Fresh server-held generation and authority after awaits; never trust an echoed expected generation. */
function isModelConsumerInstallRequestCurrent(input, freshSource) {
    const request = exports.ModelConsumerInstallRequestSchema.safeParse(input);
    const source = zod_1.z.object({ identity: Identity, scope: Scope, sourceVersion: agent_model_configuration_js_1.AgentModelBootstrapSourceVersionSchema }).strict().safeParse(freshSource);
    return request.success && source.success && request.data.expectedSourceVersion === source.data.sourceVersion && (0, agent_model_configuration_js_1.sameModelAgentIdentity)(request.data.identity, source.data.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(request.data.scope, source.data.scope);
}
/** Confirm model-only installation, not a write, queued work or opened channel. */
function isModelConsumerInstallConfirmed(input, observedReceipt, now = new Date()) {
    const parsed = exports.ModelConsumerInstallRequestSchema.safeParse(input);
    const result = exports.ModelConsumerInstallReceiptSchema.safeParse(observedReceipt);
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
    return (0, agent_model_configuration_js_1.sameModelAgentIdentity)(request.identity, state.identity) && (0, capability_call_context_js_1.sameCapabilityScope)(request.scope, state.scope) && (0, capability_model_settings_js_1.sameCapabilityModelSettings)(request.settings, state.settings);
}
exports.ModelConsumerStateRequestSchema = zod_1.z.object({ identity: Identity, scope: Scope, slotId: model_slot_js_1.ModelSlotIdSchema }).strict().superRefine((request, ctx) => {
    checkScope(request, ctx);
    if ((0, model_consumers_js_1.findModelConsumerDefinition)(request.slotId) === undefined)
        ctx.addIssue({ code: 'custom', path: ['slotId'], message: 'Read only a registered consumer' });
});
/** Shape-only interchange for Python. Cross-field/CAS/readback refinements still require canonical producer validation. */
function modelConsumerTransportJsonSchemas() {
    return {
        install: zod_1.z.toJSONSchema(exports.ModelConsumerInstallRequestSchema), state: zod_1.z.toJSONSchema(exports.ModelConsumerRuntimeStateSchema),
        receipt: zod_1.z.toJSONSchema(exports.ModelConsumerInstallReceiptSchema), read: zod_1.z.toJSONSchema(exports.ModelConsumerStateRequestSchema),
    };
}
/** Sanitized service failure, never a raw provider body. */
exports.ModelConsumerTransportErrorSchema = zod_1.z.object({ ok: zod_1.z.literal(false), reason: agent_management_js_1.AgentManagementReasonSchema }).strict();
/** Producers check this before state/install handling; a trusted service URL does not authorize a different slot. */
function isModelConsumerRouteRequestMatching(params, body) {
    const path = zod_1.z.object({ slotId: model_slot_js_1.ModelSlotIdSchema }).strict().safeParse(params);
    const request = zod_1.z.union([exports.ModelConsumerInstallRequestSchema, exports.ModelConsumerStateRequestSchema]).safeParse(body);
    return path.success && request.success && path.data.slotId === request.data.slotId;
}
//# sourceMappingURL=model-consumer-execution.js.map