import { z } from 'zod';
import { CapabilityAgentScopeSchema } from "../capability-call-context.js";
import { AgentConfigVersionSchema } from "../ricerca/agent-config.js";
import { AgentVoiceIdSchema, AgentVoiceLocaleSchema, AgentVoiceModelSchema } from "../voice/agent-voice-settings.js";
import { Text128, RefId, Instant } from "../coach/shared.js";
import { ElevenLabsNativeToolsSchema } from "./native-tools.js";
import { ElevenLabsPromptBundleHashSchema } from "./native-session.js";
const unit = z.number().finite().min(0).max(1);
const voice = { voice_id: AgentVoiceIdSchema, stability: unit, speed: z.number().finite().min(0.25).max(4), similarity_boost: unit };
const Origin = z.url().refine(s => { const u = new URL(s); return u.protocol === 'https:' && u.href === u.origin + '/' && u.username === '' && u.password === ''; });
/** Concrete provider fields only. Prompt content and credential values live outside this descriptor. */
export const ElevenLabsNativeConfigSchema = z.object({
    agent: z.object({ first_message: z.string().max(2000), language: AgentVoiceLocaleSchema,
        prompt: z.object({ llm: Text128, reasoning_effort: Text128, temperature: z.number().finite().min(0).max(2),
            backup_llm_config: z.object({ preference: z.literal('override'), order: z.array(Text128).min(1).max(16).refine(x => new Set(x).size === x.length) }).strict(),
            cascade_timeout_seconds: z.number().finite().positive().max(120), tools: ElevenLabsNativeToolsSchema,
        }).strict(),
    }).strict(),
    tts: z.object({ ...voice, model_id: AgentVoiceModelSchema, optimize_streaming_latency: z.number().int().min(0).max(4),
        agent_output_audio_format: Text128, supported_voices: z.array(z.object({ ...voice, label: Text128, description: z.string().max(1000) }).strict()).max(32)
            .refine(x => new Set(x.map(v => v.label)).size === x.length),
    }).strict(),
    turn: z.object({ turn_timeout: z.number().finite().positive().max(120), interruption_ignore_terms: z.array(z.string().min(1).max(128)).max(128),
        merge_with_default_ignore_terms: z.boolean(), silence_end_call_timeout: z.number().int().min(-1).max(86400),
    }).strict(),
    conversation: z.object({ max_duration_seconds: z.number().int().positive().max(86400),
        client_events: z.array(z.enum(['audio', 'interruption', 'agent_response', 'user_transcript', 'agent_response_correction', 'agent_tool_response'])).max(16).refine(x => new Set(x).size === x.length),
    }).strict(),
    platform_settings: z.object({ auth: z.object({ enable_auth: z.literal(true), allowlist: z.array(Origin).min(1).max(32).refine(x => new Set(x).size === x.length), require_origin_header: z.literal(true) }).strict() }).strict(),
}).strict();
export const ElevenLabsNativeDesiredConfigSchema = z.object({ scope: CapabilityAgentScopeSchema, configVersion: AgentConfigVersionSchema,
    promptBundleHash: ElevenLabsPromptBundleHashSchema, fingerprint: ElevenLabsPromptBundleHashSchema, config: ElevenLabsNativeConfigSchema,
}).strict();
/** An acknowledged command is not provider readback and never marks configuration applied. */
export const ElevenLabsNativeCommandReceiptSchema = z.object({ requestId: RefId, desired: ElevenLabsNativeDesiredConfigSchema,
    acceptedAt: Instant, status: z.enum(['accepted', 'reconcile_pending', 'rejected']) }).strict();
//# sourceMappingURL=native-config.js.map