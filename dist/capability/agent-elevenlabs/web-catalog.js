import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability-call-context.js";
import { AgentIdSchema } from "../../agent/agent-identity.js";
import { AgentVoiceIdSchema } from "../voice/agent-voice-settings.js";
import { ModelCatalogSchema, ModelCatalogVersionSchema, ModelDescriptorSchema, sameModelDescriptor } from "../../model-router/model-catalog.js";
const VoiceEntrySchema = z.object({
    id: AgentVoiceIdSchema, label: z.string().trim().min(1).max(120),
    access: z.enum(['available', 'unavailable', 'unknown']), reason: z.string().trim().min(1).max(500).optional(),
}).strict().refine(entry => entry.access === 'available' || entry.reason !== undefined, { message: 'Unavailable voices require a sanitized reason' });
/** Producer-discovered ElevenAgents voices, never the static TTS catalog or invented model costs. */
export const ElevenLabsWebCatalogSchema = z.object({
    scope: CapabilityAgentScopeSchema, models: ModelCatalogSchema,
    voices: z.object({
        version: ModelCatalogVersionSchema, source: z.literal('provider-api'),
        observedAt: z.iso.datetime({ offset: true }).nullable(), validUntil: z.iso.datetime({ offset: true }).nullable(),
        state: z.enum(['available', 'partial', 'unavailable', 'not-configured']), entries: z.array(VoiceEntrySchema).max(4096),
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
export function isElevenLabsWebCatalogCurrent(rawCatalog, expectedScope, managementAgentId, now) {
    const catalog = ElevenLabsWebCatalogSchema.safeParse(rawCatalog), scope = CapabilityAgentScopeSchema.safeParse(expectedScope), agentId = AgentIdSchema.safeParse(managementAgentId);
    const time = now.getTime();
    if (!catalog.success || !scope.success || !agentId.success || !Number.isFinite(time))
        return false;
    const { models, voices } = catalog.data;
    const current = (snapshot) => (snapshot.state === 'available' || snapshot.state === 'partial')
        && snapshot.observedAt !== null && snapshot.validUntil !== null
        && Date.parse(snapshot.observedAt) <= time && Date.parse(snapshot.validUntil) > time;
    return sameCapabilityScope(catalog.data.scope, scope.data) && models.agentId === agentId.data
        && models.source === 'provider-api' && current(models) && current(voices)
        && models.entries.some(entry => entry.function === 'voice' && entry.access === 'available' && entry.runtimeSupport === 'supported')
        && voices.entries.some(entry => entry.access === 'available');
}
/** Read-only validation for the existing Modelli writer; no alternate configuration or model override. */
export function isElevenLabsWebCatalogSelectionCurrent(rawCatalog, expectedScope, managementAgentId, expectedVersions, rawModel, rawVoiceId, now) {
    const catalog = ElevenLabsWebCatalogSchema.safeParse(rawCatalog), model = ModelDescriptorSchema.safeParse(rawModel), voice = AgentVoiceIdSchema.safeParse(rawVoiceId);
    const versions = z.object({ models: ModelCatalogVersionSchema, voices: ModelCatalogVersionSchema }).strict().safeParse(expectedVersions);
    if (!catalog.success || !model.success || !voice.success || !versions.success
        || !isElevenLabsWebCatalogCurrent(catalog.data, expectedScope, managementAgentId, now))
        return false;
    return versions.data.models === catalog.data.models.version && versions.data.voices === catalog.data.voices.version
        && catalog.data.models.entries.some(entry => entry.function === 'voice' && entry.access === 'available' && entry.runtimeSupport === 'supported' && sameModelDescriptor(entry, model.data))
        && catalog.data.voices.entries.some(entry => entry.id === voice.data && entry.access === 'available');
}
//# sourceMappingURL=web-catalog.js.map