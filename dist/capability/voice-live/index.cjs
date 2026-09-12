"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceLiveCallEndReasonSchema = exports.VoiceLiveTranscriptTurnSchema = exports.VoiceLiveCallStartResponseSchema = exports.VoiceLiveCallStartRequestSchema = exports.VoiceLiveToolDefinitionSchema = exports.CAP_VOICE_LIVE_DEFAULT_PORT = void 0;
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
const zod_1 = require("zod");
const provider_js_1 = require("../voice/provider.cjs");
/** Default TCP port of cap-voice-live inside the X9 docker network. */
exports.CAP_VOICE_LIVE_DEFAULT_PORT = 3217;
/**
 * Function-tool definition handed to GPT-Live `delegation.responses.tools`.
 * `parameters` is a JSON Schema object (OpenAI function-calling shape).
 */
exports.VoiceLiveToolDefinitionSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    parameters: zod_1.z.record(zod_1.z.string(), zod_1.z.unknown()),
    /** True ⇒ cap-voice-live generates a D-17 idempotency_key for the tool call. */
    mutating: zod_1.z.boolean(),
});
/**
 * cap-voice → cap-voice-live: place an outbound call on the OpenAI-Live lane.
 * Everything the model needs is already rendered by cap-voice (instructions
 * with the 9 dynamic variables substituted, tool surface filtered by
 * authorized_actions). cap-voice-live never reads prompts or briefs.
 */
exports.VoiceLiveCallStartRequestSchema = zod_1.z.strictObject({
    /** Canonical call id (== `calls.id` in cap-voice). */
    call_id: zod_1.z.string().min(1),
    /** Forge agent id, echoed on every tool call (VoiceToolCallRequest.agent_id). */
    agent_id: zod_1.z.string().min(1),
    /** E.164 destination. */
    to_number: zod_1.z.string().regex(/^\+[1-9]\d{7,14}$/),
    /** Display name — used only for the post-call payload `dynamic_variables.contact_name`. */
    contact_name: zod_1.z.string().min(1),
    /** Fully rendered system instructions for GPT-Live (DATA-hardened per D-11). */
    instructions: zod_1.z.string().min(1),
    /** Backend (delegation.responses) instructions — may equal `instructions`. */
    backend_instructions: zod_1.z.string().min(1),
    /** Tool surface for this call (already filtered by cap-voice). */
    tools: zod_1.z.array(exports.VoiceLiveToolDefinitionSchema),
    /** OpenAI stock voice (e.g. "marin"). */
    voice: zod_1.z.string().min(1),
    /** delegation.responses model id. */
    backend_model: zod_1.z.string().min(1),
    /** BCP-47 hint for the post-call summary language (e.g. "it"). */
    locale: zod_1.z.string().min(1).default('it'),
});
exports.VoiceLiveCallStartResponseSchema = zod_1.z.object({
    call_id: zod_1.z.string().min(1),
    provider: provider_js_1.VoiceProviderSchema,
    /**
     * Provider-side conversation reference: for `openai_live` this is the
     * Telnyx `call_control_id` (the GPT-Live session id is only known after
     * the media stream opens). cap-voice stores it in
     * `calls.external_elevenlabs_conversation_id` for traceability.
     */
    conversation_id: zod_1.z.string().min(1),
    started_at: zod_1.z.string().datetime({ offset: true }),
});
/** One transcript turn as reconstructed from GPT-Live transcript deltas. */
exports.VoiceLiveTranscriptTurnSchema = zod_1.z.object({
    role: zod_1.z.enum(['agent', 'user']),
    message: zod_1.z.string(),
    time_in_call_secs: zod_1.z.number().nonnegative(),
});
/** Terminal states of a live call as observed by cap-voice-live. */
exports.VoiceLiveCallEndReasonSchema = zod_1.z.enum([
    'completed',
    'no_answer',
    'busy',
    'failed',
    'call_initiation_failure',
    'session_expired',
    'session_error',
]);
//# sourceMappingURL=index.js.map