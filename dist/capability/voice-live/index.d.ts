/**
 * cap-voice-live contracts — sub-path `@x9-forge/contracts/capability/voice-live`.
 *
 * Phase 50 (2026-09-12). `services/cap-voice-live` is the media bridge between
 * a Telnyx PSTN leg and an OpenAI GPT-Live-1 session. It owns NO business
 * logic: cap-voice composes the brief, renders the prompt, decides the tool
 * surface and reconciles the outcome; cap-voice-live dials, relays audio,
 * executes model tool-calls by POSTing to cap-voice `/call/<tool>`, and posts
 * the transcript back to cap-voice at session end.
 *
 * Consumers:
 *   - agent-x9/services/cap-voice/src/providers/openai-live.ts   (request/response)
 *   - agent-x9/services/cap-voice-live/src/routes/call-start.ts  (request validation)
 *   - agent-x9/services/cap-voice-live/src/manifest.ts           (port)
 *
 * STRICT (internal X9 boundary, R-14): no `.passthrough()`.
 */
import { z } from 'zod';
/** Default TCP port of cap-voice-live inside the X9 docker network. */
export declare const CAP_VOICE_LIVE_DEFAULT_PORT = 3217;
/**
 * Function-tool definition handed to GPT-Live `delegation.responses.tools`.
 * `parameters` is a JSON Schema object (OpenAI function-calling shape).
 */
export declare const VoiceLiveToolDefinitionSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
    mutating: z.ZodBoolean;
}, z.core.$strip>;
export type VoiceLiveToolDefinition = z.infer<typeof VoiceLiveToolDefinitionSchema>;
/**
 * cap-voice → cap-voice-live: place an outbound call on the OpenAI-Live lane.
 * Everything the model needs is already rendered by cap-voice (instructions
 * with the 9 dynamic variables substituted, tool surface filtered by
 * authorized_actions). cap-voice-live never reads prompts or briefs.
 */
export declare const VoiceLiveCallStartRequestSchema: z.ZodObject<{
    /** Canonical call id (== `calls.id` in cap-voice). */
    call_id: z.ZodString;
    /** Forge agent id, echoed on every tool call (VoiceToolCallRequest.agent_id). */
    agent_id: z.ZodString;
    /** E.164 destination. */
    to_number: z.ZodString;
    /** Display name — used only for the post-call payload `dynamic_variables.contact_name`. */
    contact_name: z.ZodString;
    /** Fully rendered system instructions for GPT-Live (DATA-hardened per D-11). */
    instructions: z.ZodString;
    /** Backend (delegation.responses) instructions — may equal `instructions`. */
    backend_instructions: z.ZodString;
    /** Tool surface for this call (already filtered by cap-voice). */
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        mutating: z.ZodBoolean;
    }, z.core.$strip>>;
    /** OpenAI stock voice (e.g. "marin"). */
    voice: z.ZodString;
    /** delegation.responses model id. */
    backend_model: z.ZodString;
    /** BCP-47 hint for the post-call summary language (e.g. "it"). */
    locale: z.ZodDefault<z.ZodString>;
}, z.core.$strict>;
export type VoiceLiveCallStartRequest = z.infer<typeof VoiceLiveCallStartRequestSchema>;
export declare const VoiceLiveCallStartResponseSchema: z.ZodObject<{
    call_id: z.ZodString;
    provider: z.ZodEnum<{
        elevenlabs: "elevenlabs";
        openai_live: "openai_live";
    }>;
    conversation_id: z.ZodString;
    started_at: z.ZodString;
}, z.core.$strip>;
export type VoiceLiveCallStartResponse = z.infer<typeof VoiceLiveCallStartResponseSchema>;
/** One transcript turn as reconstructed from GPT-Live transcript deltas. */
export declare const VoiceLiveTranscriptTurnSchema: z.ZodObject<{
    role: z.ZodEnum<{
        agent: "agent";
        user: "user";
    }>;
    message: z.ZodString;
    time_in_call_secs: z.ZodNumber;
}, z.core.$strip>;
export type VoiceLiveTranscriptTurn = z.infer<typeof VoiceLiveTranscriptTurnSchema>;
/** Terminal states of a live call as observed by cap-voice-live. */
export declare const VoiceLiveCallEndReasonSchema: z.ZodEnum<{
    no_answer: "no_answer";
    call_initiation_failure: "call_initiation_failure";
    completed: "completed";
    busy: "busy";
    failed: "failed";
    session_expired: "session_expired";
    session_error: "session_error";
}>;
export type VoiceLiveCallEndReason = z.infer<typeof VoiceLiveCallEndReasonSchema>;
//# sourceMappingURL=index.d.ts.map