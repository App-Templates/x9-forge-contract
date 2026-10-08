"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.agentVoiceSettingsFromModelDescriptor = agentVoiceSettingsFromModelDescriptor;
const zod_1 = require("zod");
const model_catalog_js_1 = require("../../model-router/model-catalog.cjs");
const agent_voice_settings_js_1 = require("./agent-voice-settings.cjs");
const EnabledSettingsSchema = agent_voice_settings_js_1.AgentVoiceSettingsSchema.options[1];
const InputSchema = zod_1.z.object({
    descriptor: model_catalog_js_1.ModelDescriptorSchema,
    role: model_catalog_js_1.ModelFunctionSchema,
    choices: EnabledSettingsSchema.omit({ mode: true, provider: true, model: true }),
    catalog: agent_voice_settings_js_1.VoiceProviderCatalogSchema,
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
function agentVoiceSettingsFromModelDescriptor(input) {
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
    if ((0, agent_voice_settings_js_1.validateAgentVoiceSettings)(settings, catalog).length > 0)
        return { ok: false, error: 'unsupported_voice_model' };
    return { ok: true, settings };
}
//# sourceMappingURL=model-descriptor-voice.js.map