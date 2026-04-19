import type { VoiceToolName } from '../../capability/voice/tools.js';
import { VoiceToolNameSchema } from '../../capability/voice/tools.js';

/**
 * HTTP endpoint path + method contracts for the CAP-Voice v2.2 runtime.
 *
 * Consumers (Forge voice-svc, cap-voice, agent-core) MUST import these
 * constants instead of hardcoded `/webhook/*` / `/internal/*` / `/call/*`
 * strings (R-14 non-negotiable).
 *
 * Path rationale (from ADR §6.1 / §6.2):
 *   - PUBLIC  /webhooks/elevenlabs/post-call — Forge voice-svc ingress,
 *                                              HMAC-validated.
 *   - INTERNAL /internal/voice/post-call     — Forge -> cap-voice forward,
 *                                              X-Internal-Token auth.
 *   - RUNTIME  /call-start                    — cap-voice outbound-call init,
 *                                              X-Internal-Secret auth.
 *   - RUNTIME  /call/<tool_name>              — ElevenLabs / internal invoker
 *                                              tool dispatch per D-16.
 *
 * @see docs/adr/ADR-cap-voice.md §6 (webhook topology)
 * @see docs/adr/ADR-cap-voice.md §13.1 / D-16 (12-tool surface)
 */

// -- Forge voice-svc public webhook path (ElevenLabs ingress) --------------

export const FORGE_VOICE_WEBHOOK_POST_CALL_PATH = '/webhooks/elevenlabs/post-call' as const;
export const FORGE_VOICE_WEBHOOK_POST_CALL_METHOD = 'POST' as const;

// -- Forge -> cap-voice internal forward -----------------------------------

export const CAP_VOICE_INTERNAL_POST_CALL_PATH = '/internal/voice/post-call' as const;
export const CAP_VOICE_INTERNAL_POST_CALL_METHOD = 'POST' as const;

// -- cap-voice call-start (outbound init, X9-initiated) --------------------

export const CAP_VOICE_CALL_START_PATH = '/call-start' as const;
export const CAP_VOICE_CALL_START_METHOD = 'POST' as const;

// -- cap-voice tool dispatch -----------------------------------------------

/**
 * Path builder for the 12 voice-tool endpoints. Accepts a `VoiceToolName`
 * so the compiler rejects unknown tool names (R-14 compile-time gate).
 */
export const CAP_VOICE_CALL_TOOL_PATH = (tool: VoiceToolName): `/call/${VoiceToolName}` =>
  `/call/${tool}` as const;

export const CAP_VOICE_CALL_TOOL_METHOD = 'POST' as const;

/**
 * Frozen list of all 12 concrete tool paths for introspection / registry
 * wiring. Callers that need a static enumeration (workspace generator,
 * agent-core registry writer) can iterate this instead of rebuilding the
 * list from `VoiceToolNameSchema`.
 */
export const CAP_VOICE_CALL_TOOL_PATHS: Readonly<Record<VoiceToolName, string>> = Object.freeze(
  Object.fromEntries(
    VoiceToolNameSchema.options.map((tool) => [tool, CAP_VOICE_CALL_TOOL_PATH(tool)]),
  ) as Record<VoiceToolName, string>,
);
