"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsWebCatalogSchema = void 0;
exports.isElevenLabsWebCatalogCurrent = isElevenLabsWebCatalogCurrent;
exports.isElevenLabsWebCatalogSelectionCurrent = isElevenLabsWebCatalogSelectionCurrent;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_identity_js_1 = require("../../agent/agent-identity.cjs");
const agent_voice_settings_js_1 = require("../voice/agent-voice-settings.cjs");
const model_catalog_js_1 = require("../../model-router/model-catalog.cjs");
const VoiceEntrySchema = zod_1.z.object({
    id: agent_voice_settings_js_1.AgentVoiceIdSchema, label: zod_1.z.string().trim().min(1).max(120),
    access: zod_1.z.enum(['available', 'unavailable', 'unknown']), reason: zod_1.z.string().trim().min(1).max(500).optional(),
}).strict().refine(entry => entry.access === 'available' || entry.reason !== undefined, { message: 'Unavailable voices require a sanitized reason' });
/** Producer-discovered ElevenAgents voices, never the static TTS catalog or invented model costs. */
exports.ElevenLabsWebCatalogSchema = zod_1.z.object({
    scope: capability_call_context_js_1.CapabilityAgentScopeSchema, models: model_catalog_js_1.ModelCatalogSchema,
    voices: zod_1.z.object({
        version: model_catalog_js_1.ModelCatalogVersionSchema, source: zod_1.z.literal('provider-api'),
        observedAt: zod_1.z.iso.datetime({ offset: true }).nullable(), validUntil: zod_1.z.iso.datetime({ offset: true }).nullable(),
        state: zod_1.z.enum(['available', 'partial', 'unavailable', 'not-configured']), entries: zod_1.z.array(VoiceEntrySchema).max(4096),
    }).strict().superRefine((voices, ctx) => {
        if ((voices.observedAt === null) !== (voices.validUntil === null)
            || ((voices.state === 'available' || voices.state === 'partial') && voices.observedAt === null)
            || (voices.observedAt !== null && voices.validUntil !== null && Date.parse(voices.validUntil) <= Date.parse(voices.observedAt))) {
            ctx.addIssue({ code: 'custom', path: ['validUntil'], message: 'Voice discovery requires a coherent observation and expiry window' });
        }
        const ids = voices.entries.map(entry => entry.id);
        if (new Set(ids).size !== ids.length)
            ctx.addIssue({ code: 'custom', path: ['entries'], message: 'Duplicate provider voice id' });
    }),
}).strict();
/** Runtime scope and management id are separately server-resolved and may differ. */
function isElevenLabsWebCatalogCurrent(rawCatalog, expectedScope, managementAgentId, now) {
    const catalog = exports.ElevenLabsWebCatalogSchema.safeParse(rawCatalog), scope = capability_call_context_js_1.CapabilityAgentScopeSchema.safeParse(expectedScope), agentId = agent_identity_js_1.AgentIdSchema.safeParse(managementAgentId);
    const time = now.getTime();
    if (!catalog.success || !scope.success || !agentId.success || !Number.isFinite(time))
        return false;
    const { models, voices } = catalog.data;
    const current = (snapshot) => (snapshot.state === 'available' || snapshot.state === 'partial')
        && snapshot.observedAt !== null && snapshot.validUntil !== null
        && Date.parse(snapshot.observedAt) <= time && Date.parse(snapshot.validUntil) > time;
    return (0, capability_call_context_js_1.sameCapabilityScope)(catalog.data.scope, scope.data) && models.agentId === agentId.data
        && models.source === 'provider-api' && current(models) && current(voices)
        && models.entries.some(entry => entry.function === 'voice' && entry.access === 'available' && entry.runtimeSupport === 'supported')
        && voices.entries.some(entry => entry.access === 'available');
}
/** Read-only validation for the existing Modelli writer; no alternate configuration or model override. */
function isElevenLabsWebCatalogSelectionCurrent(rawCatalog, expectedScope, managementAgentId, expectedVersions, rawModel, rawVoiceId, now) {
    const catalog = exports.ElevenLabsWebCatalogSchema.safeParse(rawCatalog), model = model_catalog_js_1.ModelDescriptorSchema.safeParse(rawModel), voice = agent_voice_settings_js_1.AgentVoiceIdSchema.safeParse(rawVoiceId);
    const versions = zod_1.z.object({ models: model_catalog_js_1.ModelCatalogVersionSchema, voices: model_catalog_js_1.ModelCatalogVersionSchema }).strict().safeParse(expectedVersions);
    if (!catalog.success || !model.success || !voice.success || !versions.success
        || !isElevenLabsWebCatalogCurrent(catalog.data, expectedScope, managementAgentId, now))
        return false;
    return versions.data.models === catalog.data.models.version && versions.data.voices === catalog.data.voices.version
        && catalog.data.models.entries.some(entry => entry.function === 'voice' && entry.access === 'available' && entry.runtimeSupport === 'supported' && (0, model_catalog_js_1.sameModelDescriptor)(entry, model.data))
        && catalog.data.voices.entries.some(entry => entry.id === voice.data && entry.access === 'available');
}
//# sourceMappingURL=web-catalog.js.map