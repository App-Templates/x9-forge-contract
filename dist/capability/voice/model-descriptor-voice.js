import { z } from 'zod';
import { ModelDescriptorSchema, ModelFunctionSchema } from "../../model-router/model-catalog.js";
import { AgentVoiceSettingsSchema, VoiceProviderCatalogSchema, validateAgentVoiceSettings, } from "./agent-voice-settings.js";
const EnabledSettingsSchema = AgentVoiceSettingsSchema.options[1];
const InputSchema = z.object({
    descriptor: ModelDescriptorSchema,
    role: ModelFunctionSchema,
    choices: EnabledSettingsSchema.omit({ mode: true, provider: true, model: true }),
    catalog: VoiceProviderCatalogSchema,
}).strict();
/** Explicit producer compatibility; API protocols are distinct from media protocols. */
const PROVIDER_ROWS = [
    { modelProvider: 'openai', apiProtocols: ['realtime'], voiceProvider: 'openai_live' },
    { modelProvider: 'elevenlabs', apiProtocols: ['speech', 'realtime'], voiceProvider: 'elevenlabs' },
];
/**
 * Convert a voice-role model with explicit caller choices and a producer voice catalog.
 * No default model, voice, transport or media protocol is inferred. Successful settings
 * always pass the canonical catalog validator. Authorization, model access, adapter
 * availability and catalog freshness remain the consumer's responsibility.
 */
export function agentVoiceSettingsFromModelDescriptor(input) {
    const parsed = InputSchema.safeParse(input);
    if (!parsed.success)
        return { ok: false, error: 'unsupported_voice_model' };
    const { descriptor, role, choices, catalog } = parsed.data;
    if (role !== 'voice')
        return { ok: false, error: 'unsupported_voice_model' };
    const row = PROVIDER_ROWS.find(candidate => candidate.modelProvider === descriptor.provider);
    if (!row || !row.apiProtocols.includes(descriptor.protocol))
        return { ok: false, error: 'unsupported_voice_model' };
    const settings = EnabledSettingsSchema.parse({
        ...choices,
        mode: 'voice',
        provider: row.voiceProvider,
        model: descriptor.modelId,
    });
    if (validateAgentVoiceSettings(settings, catalog).length > 0)
        return { ok: false, error: 'unsupported_voice_model' };
    return { ok: true, settings };
}
//# sourceMappingURL=model-descriptor-voice.js.map