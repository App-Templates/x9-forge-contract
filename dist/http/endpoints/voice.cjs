"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAP_VOICE_ADMIN_SWEEP_HOLDS_METHOD = exports.CAP_VOICE_ADMIN_SWEEP_HOLDS_PATH = exports.CAP_VOICE_PREPARE_CALL_METHOD = exports.CAP_VOICE_PREPARE_CALL_PATH = exports.CAP_VOICE_CALL_TOOL_PATHS = exports.CAP_VOICE_CALL_TOOL_METHOD = exports.CAP_VOICE_CALL_TOOL_PATH = exports.CAP_VOICE_CALL_START_METHOD = exports.CAP_VOICE_CALL_START_PATH = exports.CAP_VOICE_INTERNAL_POST_CALL_METHOD = exports.CAP_VOICE_INTERNAL_POST_CALL_PATH = exports.FORGE_VOICE_WEBHOOK_POST_CALL_METHOD = exports.FORGE_VOICE_WEBHOOK_POST_CALL_PATH = void 0;
const tools_js_1 = require("../../capability/voice/tools.cjs");
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
exports.FORGE_VOICE_WEBHOOK_POST_CALL_PATH = '/webhooks/elevenlabs/post-call';
exports.FORGE_VOICE_WEBHOOK_POST_CALL_METHOD = 'POST';
// -- Forge -> cap-voice internal forward -----------------------------------
exports.CAP_VOICE_INTERNAL_POST_CALL_PATH = '/internal/voice/post-call';
exports.CAP_VOICE_INTERNAL_POST_CALL_METHOD = 'POST';
// -- cap-voice call-start (outbound init, X9-initiated) --------------------
exports.CAP_VOICE_CALL_START_PATH = '/call-start';
exports.CAP_VOICE_CALL_START_METHOD = 'POST';
// -- cap-voice tool dispatch -----------------------------------------------
/**
 * Path builder for the 12 voice-tool endpoints. Accepts a `VoiceToolName`
 * so the compiler rejects unknown tool names (R-14 compile-time gate).
 */
const CAP_VOICE_CALL_TOOL_PATH = (tool) => `/call/${tool}`;
exports.CAP_VOICE_CALL_TOOL_PATH = CAP_VOICE_CALL_TOOL_PATH;
exports.CAP_VOICE_CALL_TOOL_METHOD = 'POST';
/**
 * Frozen list of all 12 concrete tool paths for introspection / registry
 * wiring. Callers that need a static enumeration (workspace generator,
 * agent-core registry writer) can iterate this instead of rebuilding the
 * list from `VoiceToolNameSchema`.
 */
exports.CAP_VOICE_CALL_TOOL_PATHS = Object.freeze(Object.fromEntries(tools_js_1.VoiceToolNameSchema.options.map((tool) => [tool, (0, exports.CAP_VOICE_CALL_TOOL_PATH)(tool)])));
// -- cap-voice voice_prepare_call (outbound brief composer, M46 VORIG-04) ------
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
exports.CAP_VOICE_PREPARE_CALL_PATH = '/call/voice_prepare_call';
exports.CAP_VOICE_PREPARE_CALL_METHOD = 'POST';
// -- cap-voice internal admin endpoints (cap-scheduler → cap-voice) ----------
/**
 * Admin endpoint: trigger hold sweep manually or via cap-scheduler cron.
 * cap-scheduler POSTs to this path every 15 minutes (ADR §10.11, D-15 sweeper).
 * Protected by INTERNAL_TOKEN_HEADER + INTERNAL_SECRET_HEADER.
 */
exports.CAP_VOICE_ADMIN_SWEEP_HOLDS_PATH = '/internal/admin/sweep-holds';
exports.CAP_VOICE_ADMIN_SWEEP_HOLDS_METHOD = 'POST';
//# sourceMappingURL=voice.js.map