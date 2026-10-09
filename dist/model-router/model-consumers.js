import { z } from 'zod';
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { AGENT_CHAT_MODEL_SLOT_ID, ModelSlotIdSchema } from "./model-slot.js";
import { ModelFeaturesSchema, ModelFunctionSchema } from "./model-catalog.js";
/** Server consumer requirements, not model support, credential access or installed-agent evidence. */
export const ModelConsumerSchema = z.object({
    slotId: ModelSlotIdSchema,
    capability: CapabilityAgentParametersSchema.shape.capability,
    function: ModelFunctionSchema,
    requirements: ModelFeaturesSchema,
}).strict();
export const ModelConsumerRegistrySchema = z.array(ModelConsumerSchema).min(1).max(64)
    .refine(consumers => new Set(consumers.map(consumer => consumer.slotId)).size === consumers.length, { message: 'One server consumer for each model slot' });
export const AGENT_CORE_MODEL_CAPABILITY_ID = 'agent-core';
/** Existing complete fallback serves stream ingress; token streaming is not claimed by this metadata. */
export const AGENT_CORE_MODEL_CONSUMER = Object.freeze({
    slotId: AGENT_CHAT_MODEL_SLOT_ID, capability: AGENT_CORE_MODEL_CAPABILITY_ID, function: 'reasoning',
    requirements: Object.freeze({ tools: true, stream: false, structuredOutput: false }),
});
/** Current execution scope and change boundary; registration is not installation evidence. */
export const ModelConsumerDefinitionSchema = ModelConsumerSchema.extend({
    label: z.string().trim().min(1).max(120),
    inventoryIds: z.array(z.string().regex(/^C(?:0[1-9]|[12][0-9]|3[0-4])$/)).min(1).max(34)
        .refine(ids => new Set(ids).size === ids.length, { message: 'Unique inventory references' }),
    scope: z.enum(['agent', 'service', 'session', 'remote-agent', 'pipeline']),
    changeBoundary: z.enum(['next-turn', 'next-call', 'next-session', 'rebuild', 'remote-update']),
    routing: z.enum(['tiered', 'single', 'failover']),
    /** Existing shared choice; consumers must not silently split or overwrite its other uses. */
    linkedSelectionGroup: ModelSlotIdSchema.optional(),
}).strict();
const noFeatures = { tools: false, stream: false, structuredOutput: false };
const definitions = [
    { ...AGENT_CORE_MODEL_CONSUMER, inventoryIds: ['C01'], scope: 'agent', changeBoundary: 'next-turn', routing: 'tiered' },
    { slotId: 'agent_classifier', capability: 'agent-core', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C02'], scope: 'agent', changeBoundary: 'next-turn', routing: 'single' },
    { slotId: 'memory_extraction', capability: 'memory', function: 'memory-extraction', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C03'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'memory_embedding', capability: 'memory', function: 'embedding', requirements: { ...noFeatures }, inventoryIds: ['C04'], scope: 'service', changeBoundary: 'rebuild', routing: 'single' },
    { slotId: 'rag_embedding', capability: 'rag', function: 'embedding', requirements: { ...noFeatures }, inventoryIds: ['C05'], scope: 'service', changeBoundary: 'rebuild', routing: 'single' },
    { slotId: 'rag_claim_extraction', capability: 'rag', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C06'], scope: 'service', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'rag_llm_standard' },
    { slotId: 'rag_claim_validation', capability: 'rag', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C07'], scope: 'service', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'rag_llm_standard' },
    { slotId: 'rag_topic_synthesis', capability: 'rag', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C08'], scope: 'service', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'rag_llm_standard' },
    { slotId: 'voice_phone_live', capability: 'voice-live', function: 'voice', requirements: { ...noFeatures, stream: true }, inventoryIds: ['C09'], scope: 'session', changeBoundary: 'next-session', routing: 'single', linkedSelectionGroup: 'voice_live_audio' },
    { slotId: 'voice_phone_delegation', capability: 'voice-live', function: 'reasoning', requirements: { ...noFeatures, tools: true }, inventoryIds: ['C10'], scope: 'session', changeBoundary: 'next-session', routing: 'single', linkedSelectionGroup: 'voice_live_backend' },
    { slotId: 'voice_web_live', capability: 'voice-live', function: 'voice', requirements: { ...noFeatures, stream: true }, inventoryIds: ['C11'], scope: 'session', changeBoundary: 'next-session', routing: 'single', linkedSelectionGroup: 'voice_live_audio' },
    { slotId: 'voice_web_delegation', capability: 'voice-live', function: 'reasoning', requirements: { ...noFeatures, tools: true }, inventoryIds: ['C12'], scope: 'session', changeBoundary: 'next-session', routing: 'single', linkedSelectionGroup: 'voice_live_backend' },
    { slotId: 'voice_call_recap', capability: 'voice', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C13'], scope: 'agent', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'elevenlabs_agent_llm', capability: 'agent-elevenlabs', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C14'], scope: 'remote-agent', changeBoundary: 'remote-update', routing: 'single' },
    { slotId: 'elevenlabs_agent_tts', capability: 'agent-elevenlabs', function: 'tts', requirements: { ...noFeatures }, inventoryIds: ['C15'], scope: 'remote-agent', changeBoundary: 'remote-update', routing: 'single' },
    { slotId: 'agent_telegram_tts', capability: 'agent-core', function: 'tts', requirements: { ...noFeatures }, inventoryIds: ['C16'], scope: 'agent', changeBoundary: 'next-turn', routing: 'single' },
    { slotId: 'scheduler_tts', capability: 'scheduler', function: 'tts', requirements: { ...noFeatures }, inventoryIds: ['C17'], scope: 'agent', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'briefing_tts', capability: 'briefing', function: 'tts', requirements: { ...noFeatures }, inventoryIds: ['C18'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'stt_file', capability: 'stt', function: 'transcription', requirements: { ...noFeatures }, inventoryIds: ['C19'], scope: 'service', changeBoundary: 'next-call', routing: 'failover' },
    { slotId: 'glasses_stt', capability: 'glasses', function: 'transcription', requirements: { ...noFeatures, stream: true }, inventoryIds: ['C20'], scope: 'session', changeBoundary: 'next-session', routing: 'single' },
    { slotId: 'glasses_tts', capability: 'glasses', function: 'tts', requirements: { ...noFeatures, stream: true }, inventoryIds: ['C21'], scope: 'session', changeBoundary: 'next-session', routing: 'single' },
    { slotId: 'qa_text', capability: 'qa', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C22'], scope: 'service', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'qa_llm' },
    { slotId: 'qa_vision', capability: 'qa', function: 'reasoning', requirements: { ...noFeatures, vision: true }, inventoryIds: ['C23'], scope: 'service', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'qa_llm' },
    { slotId: 'security_vision', capability: 'security', function: 'reasoning', requirements: { ...noFeatures, vision: true, structuredOutput: true }, inventoryIds: ['C24'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'security_rules', capability: 'security', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C25'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'news_digest', capability: 'news', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C26'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'news_rules', capability: 'news', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C27'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'netatmo_rules', capability: 'netatmo', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C28'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'briefing_rules', capability: 'briefing', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C29'], scope: 'service', changeBoundary: 'next-call', routing: 'single' },
    { slotId: 'research_search', capability: 'ricerca', function: 'reasoning', requirements: { ...noFeatures, webSearch: true }, inventoryIds: ['C30'], scope: 'agent', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'research_model' },
    { slotId: 'research_structure', capability: 'ricerca', function: 'reasoning', requirements: { ...noFeatures, structuredOutput: true }, inventoryIds: ['C31'], scope: 'agent', changeBoundary: 'next-call', routing: 'single', linkedSelectionGroup: 'research_model' },
    { slotId: 'mindfulness_chat', capability: 'mindfulness', function: 'reasoning', requirements: { ...noFeatures }, inventoryIds: ['C32'], scope: 'pipeline', changeBoundary: 'next-session', routing: 'single' },
    { slotId: 'mindfulness_tts', capability: 'mindfulness', function: 'tts', requirements: { ...noFeatures }, inventoryIds: ['C33'], scope: 'pipeline', changeBoundary: 'next-session', routing: 'single' },
    { slotId: 'mindfulness_stt', capability: 'mindfulness', function: 'transcription', requirements: { ...noFeatures }, inventoryIds: ['C34'], scope: 'pipeline', changeBoundary: 'next-session', routing: 'single' },
].map(value => ModelConsumerDefinitionSchema.parse({ ...value, label: value.slotId.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ') }));
const consumers = ModelConsumerRegistrySchema.parse(definitions.map(({ slotId, capability, function: fn, requirements }) => ({ slotId, capability, function: fn, requirements })));
/** Detached reads prevent one caller from changing another caller's binding or requirements. */
export function registeredModelConsumers() { return structuredClone(consumers); }
export function registeredModelConsumerDefinitions() { return structuredClone(definitions); }
/** Exact server registration only. Unknown or malformed input never selects a default consumer. */
export function findModelConsumer(slotId) {
    const found = consumers.find(consumer => consumer.slotId === slotId);
    return found === undefined ? undefined : structuredClone(found);
}
export function findModelConsumerDefinition(slotId) {
    const found = definitions.find(consumer => consumer.slotId === slotId);
    return found === undefined ? undefined : structuredClone(found);
}
//# sourceMappingURL=model-consumers.js.map