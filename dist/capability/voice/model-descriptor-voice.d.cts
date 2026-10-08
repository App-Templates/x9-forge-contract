import { z } from 'zod';
import type { AgentVoiceEnabledSettings } from "./agent-voice-settings.cjs";
declare const InputSchema: z.ZodObject<{
    descriptor: z.ZodObject<{
        provider: z.ZodString;
        modelId: z.ZodString;
        protocol: z.ZodEnum<{
            responses: "responses";
            "chat-completions": "chat-completions";
            messages: "messages";
            "generate-content": "generate-content";
            embeddings: "embeddings";
            speech: "speech";
            transcriptions: "transcriptions";
            realtime: "realtime";
        }>;
        adapterId: z.ZodString;
    }, z.core.$strict>;
    role: z.ZodEnum<{
        reasoning: "reasoning";
        "memory-extraction": "memory-extraction";
        embedding: "embedding";
        tts: "tts";
        transcription: "transcription";
        voice: "voice";
    }>;
    choices: z.ZodObject<{
        params: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnion<readonly [z.ZodNumber, z.ZodString, z.ZodBoolean, z.ZodArray<z.ZodString>]>>>;
        protocol: z.ZodEnum<{
            websocket: "websocket";
            webrtc: "webrtc";
            sip: "sip";
        }>;
        locale: z.ZodOptional<z.ZodString>;
        transports: z.ZodArray<z.ZodEnum<{
            web: "web";
            phone: "phone";
        }>>;
        voiceId: z.ZodString;
    }, z.core.$strict>;
    catalog: z.ZodObject<{
        version: z.ZodString;
        providers: z.ZodArray<z.ZodObject<{
            provider: z.ZodString;
            label: z.ZodString;
            protocols: z.ZodArray<z.ZodEnum<{
                websocket: "websocket";
                webrtc: "webrtc";
                sip: "sip";
            }>>;
            transports: z.ZodArray<z.ZodEnum<{
                web: "web";
                phone: "phone";
            }>>;
            models: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                label: z.ZodString;
            }, z.core.$strip>>;
            voices: z.ZodDiscriminatedUnion<[z.ZodObject<{
                kind: z.ZodLiteral<"menu">;
                options: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    label: z.ZodString;
                }, z.core.$strip>>;
            }, z.core.$strip>, z.ZodObject<{
                kind: z.ZodLiteral<"id">;
                pattern: z.ZodString;
            }, z.core.$strip>], "kind">;
        }, z.core.$strip>>;
    }, z.core.$strip>;
}, z.core.$strict>;
export type ModelDescriptorVoiceInput = z.infer<typeof InputSchema>;
export type ModelDescriptorVoiceResult = {
    ok: true;
    settings: AgentVoiceEnabledSettings;
} | {
    ok: false;
    error: 'unsupported_voice_model';
};
/**
 * Convert a voice-role model with explicit caller choices and a producer voice catalog.
 * No default model, voice, transport or media protocol is inferred. Successful settings
 * always pass the canonical catalog validator. Authorization, model access, adapter
 * availability and catalog freshness remain the consumer's responsibility.
 */
export declare function agentVoiceSettingsFromModelDescriptor(input: ModelDescriptorVoiceInput): ModelDescriptorVoiceResult;
export {};
//# sourceMappingURL=model-descriptor-voice.d.ts.map