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
import { VoiceProviderSchema } from '../voice/provider.js';

/** Default TCP port of cap-voice-live inside the X9 docker network. */
export const CAP_VOICE_LIVE_DEFAULT_PORT = 3217;

/**
 * Function-tool definition handed to GPT-Live `delegation.responses.tools`.
 * `parameters` is a JSON Schema object (OpenAI function-calling shape).
 */
export const VoiceLiveToolDefinitionSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  parameters: z.record(z.string(), z.unknown()),
  /** True ⇒ cap-voice-live generates a D-17 idempotency_key for the tool call. */
  mutating: z.boolean(),
});
export type VoiceLiveToolDefinition = z.infer<typeof VoiceLiveToolDefinitionSchema>;

/**
 * cap-voice → cap-voice-live: place an outbound call on the OpenAI-Live lane.
 * Everything the model needs is already rendered by cap-voice (instructions
 * with the 9 dynamic variables substituted, tool surface filtered by
 * authorized_actions). cap-voice-live never reads prompts or briefs.
 */
export const VoiceLiveCallStartRequestSchema = z.strictObject({
  /** Canonical call id (== `calls.id` in cap-voice). */
  call_id: z.string().min(1),
  /** Forge agent id, echoed on every tool call (VoiceToolCallRequest.agent_id). */
  agent_id: z.string().min(1),
  /** E.164 destination. */
  to_number: z.string().regex(/^\+[1-9]\d{7,14}$/),
  /** Display name — used only for the post-call payload `dynamic_variables.contact_name`. */
  contact_name: z.string().min(1),
  /** Fully rendered system instructions for GPT-Live (DATA-hardened per D-11). */
  instructions: z.string().min(1),
  /** Backend (delegation.responses) instructions — may equal `instructions`. */
  backend_instructions: z.string().min(1),
  /** Tool surface for this call (already filtered by cap-voice). */
  tools: z.array(VoiceLiveToolDefinitionSchema),
  /** OpenAI stock voice (e.g. "marin"). */
  voice: z.string().min(1),
  /** delegation.responses model id. */
  backend_model: z.string().min(1),
  /** BCP-47 hint for the post-call summary language (e.g. "it"). */
  locale: z.string().min(1).default('it'),
});
export type VoiceLiveCallStartRequest = z.infer<typeof VoiceLiveCallStartRequestSchema>;

export const VoiceLiveCallStartResponseSchema = z.object({
  call_id: z.string().min(1),
  provider: VoiceProviderSchema,
  /**
   * Provider-side conversation reference: for `openai_live` this is the
   * Telnyx `call_control_id` (the GPT-Live session id is only known after
   * the media stream opens). cap-voice stores it in
   * `calls.external_elevenlabs_conversation_id` for traceability.
   */
  conversation_id: z.string().min(1),
  started_at: z.string().datetime({ offset: true }),
});
export type VoiceLiveCallStartResponse = z.infer<typeof VoiceLiveCallStartResponseSchema>;

/** One transcript turn as reconstructed from GPT-Live transcript deltas. */
export const VoiceLiveTranscriptTurnSchema = z.object({
  role: z.enum(['agent', 'user']),
  message: z.string(),
  time_in_call_secs: z.number().nonnegative(),
});
export type VoiceLiveTranscriptTurn = z.infer<typeof VoiceLiveTranscriptTurnSchema>;

/** Terminal states of a live call as observed by cap-voice-live. */
export const VoiceLiveCallEndReasonSchema = z.enum([
  'completed',
  'no_answer',
  'busy',
  'failed',
  'call_initiation_failure',
  'session_expired',
  'session_error',
]);
export type VoiceLiveCallEndReason = z.infer<typeof VoiceLiveCallEndReasonSchema>;
