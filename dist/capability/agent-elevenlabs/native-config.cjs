"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElevenLabsNativeCommandReceiptSchema = exports.ElevenLabsNativeDesiredConfigSchema = exports.ElevenLabsNativeConfigSchema = void 0;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability-call-context.cjs");
const agent_config_js_1 = require("../ricerca/agent-config.cjs");
const agent_voice_settings_js_1 = require("../voice/agent-voice-settings.cjs");
const shared_js_1 = require("../coach/shared.cjs");
const native_tools_js_1 = require("./native-tools.cjs");
const native_session_js_1 = require("./native-session.cjs");
const unit = zod_1.z.number().finite().min(0).max(1);
const voice = { voice_id: agent_voice_settings_js_1.AgentVoiceIdSchema, stability: unit, speed: zod_1.z.number().finite().min(0.25).max(4), similarity_boost: unit };
const Origin = zod_1.z.url().refine(s => { const u = new URL(s); return u.protocol === 'https:' && u.href === u.origin + '/' && u.username === '' && u.password === ''; });
/** Concrete provider fields only. Prompt content and credential values live outside this descriptor. */
exports.ElevenLabsNativeConfigSchema = zod_1.z.object({
    agent: zod_1.z.object({ first_message: zod_1.z.string().max(2000), language: agent_voice_settings_js_1.AgentVoiceLocaleSchema,
        prompt: zod_1.z.object({ llm: shared_js_1.Text128, reasoning_effort: shared_js_1.Text128, temperature: zod_1.z.number().finite().min(0).max(2),
            backup_llm_config: zod_1.z.object({ preference: zod_1.z.literal('override'), order: zod_1.z.array(shared_js_1.Text128).min(1).max(16).refine(x => new Set(x).size === x.length) }).strict(),
            cascade_timeout_seconds: zod_1.z.number().finite().positive().max(120), tools: native_tools_js_1.ElevenLabsNativeToolsSchema,
        }).strict(),
    }).strict(),
    tts: zod_1.z.object({ ...voice, model_id: agent_voice_settings_js_1.AgentVoiceModelSchema, optimize_streaming_latency: zod_1.z.number().int().min(0).max(4),
        agent_output_audio_format: shared_js_1.Text128, supported_voices: zod_1.z.array(zod_1.z.object({ ...voice, label: shared_js_1.Text128, description: zod_1.z.string().max(1000) }).strict()).max(32)
            .refine(x => new Set(x.map(v => v.label)).size === x.length),
    }).strict(),
    turn: zod_1.z.object({ turn_timeout: zod_1.z.number().finite().positive().max(120), interruption_ignore_terms: zod_1.z.array(zod_1.z.string().min(1).max(128)).max(128),
        merge_with_default_ignore_terms: zod_1.z.boolean(), silence_end_call_timeout: zod_1.z.number().int().min(-1).max(86400),
    }).strict(),
    conversation: zod_1.z.object({ max_duration_seconds: zod_1.z.number().int().positive().max(86400),
        client_events: zod_1.z.array(zod_1.z.enum(['audio', 'interruption', 'agent_response', 'user_transcript', 'agent_response_correction', 'agent_tool_response'])).max(16).refine(x => new Set(x).size === x.length),
    }).strict(),
    platform_settings: zod_1.z.object({ auth: zod_1.z.object({ enable_auth: zod_1.z.literal(true), allowlist: zod_1.z.array(Origin).min(1).max(32).refine(x => new Set(x).size === x.length), require_origin_header: zod_1.z.literal(true) }).strict() }).strict(),
}).strict();
exports.ElevenLabsNativeDesiredConfigSchema = zod_1.z.object({ scope: capability_call_context_js_1.CapabilityAgentScopeSchema, configVersion: agent_config_js_1.AgentConfigVersionSchema,
    promptBundleHash: native_session_js_1.ElevenLabsPromptBundleHashSchema, fingerprint: native_session_js_1.ElevenLabsPromptBundleHashSchema, config: exports.ElevenLabsNativeConfigSchema,
}).strict();
/** An acknowledged command is not provider readback and never marks configuration applied. */
exports.ElevenLabsNativeCommandReceiptSchema = zod_1.z.object({ requestId: shared_js_1.RefId, desired: exports.ElevenLabsNativeDesiredConfigSchema,
    acceptedAt: shared_js_1.Instant, status: zod_1.z.enum(['accepted', 'reconcile_pending', 'rejected']) }).strict();
//# sourceMappingURL=native-config.js.map