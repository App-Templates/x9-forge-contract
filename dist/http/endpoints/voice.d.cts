import type { VoiceToolName } from "../../capability/voice/tools.cjs";
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
export declare const FORGE_VOICE_WEBHOOK_POST_CALL_PATH: "/webhooks/elevenlabs/post-call";
export declare const FORGE_VOICE_WEBHOOK_POST_CALL_METHOD: "POST";
export declare const CAP_VOICE_INTERNAL_POST_CALL_PATH: "/internal/voice/post-call";
export declare const CAP_VOICE_INTERNAL_POST_CALL_METHOD: "POST";
export declare const CAP_VOICE_CALL_START_PATH: "/call-start";
export declare const CAP_VOICE_CALL_START_METHOD: "POST";
/**
 * Path builder for the 12 voice-tool endpoints. Accepts a `VoiceToolName`
 * so the compiler rejects unknown tool names (R-14 compile-time gate).
 */
export declare const CAP_VOICE_CALL_TOOL_PATH: (tool: VoiceToolName) => `/call/${VoiceToolName}`;
export declare const CAP_VOICE_CALL_TOOL_METHOD: "POST";
/**
 * Frozen list of all 12 concrete tool paths for introspection / registry
 * wiring. Callers that need a static enumeration (workspace generator,
 * agent-core registry writer) can iterate this instead of rebuilding the
 * list from `VoiceToolNameSchema`.
 */
export declare const CAP_VOICE_CALL_TOOL_PATHS: Readonly<Record<VoiceToolName, string>>;
/**
 * M46 Phase 46.0 — structured-brief composer endpoint. cap-voice accepts a
 * `VoicePrepareCallRequest` (`raw_instruction` + `call_id` +
 * `requested_contact?`) and returns a `VoicePrepareCallResponse`
 * (server-composed `VoiceCallBrief` + `AuthorizedActions` + classified
 * intent + provenance chain). R-14: callers MUST import this constant
 * — no hardcoded `'/call/voice_prepare_call'` literals anywhere in X9 or
 * Forge v2.
 *
 * @see @x9-forge/contracts/capability/voice prepare-call.ts
 * @see .planning/phases/46.0-bridge-voice-origination/46.0-CONTEXT.md §D-05
 */
export declare const CAP_VOICE_PREPARE_CALL_PATH: "/call/voice_prepare_call";
export declare const CAP_VOICE_PREPARE_CALL_METHOD: "POST";
/**
 * Admin endpoint: trigger hold sweep manually or via cap-scheduler cron.
 * cap-scheduler POSTs to this path every 15 minutes (ADR §10.11, D-15 sweeper).
 * Protected by INTERNAL_TOKEN_HEADER + INTERNAL_SECRET_HEADER.
 */
export declare const CAP_VOICE_ADMIN_SWEEP_HOLDS_PATH: "/internal/admin/sweep-holds";
export declare const CAP_VOICE_ADMIN_SWEEP_HOLDS_METHOD: "POST";
//# sourceMappingURL=voice.d.ts.map