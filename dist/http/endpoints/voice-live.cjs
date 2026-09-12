"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CAP_VOICE_LIVE_TELNYX_WEBHOOK_METHOD = exports.CAP_VOICE_LIVE_WEB_PAGE_PATH = exports.CAP_VOICE_LIVE_WEB_SESSION_METHOD = exports.CAP_VOICE_LIVE_WEB_SESSION_PATH = exports.CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH = exports.CAP_VOICE_LIVE_STREAM_PATH = exports.CAP_VOICE_LIVE_STREAM_PATH_PREFIX = exports.CAP_VOICE_LIVE_CALL_START_METHOD = exports.CAP_VOICE_LIVE_CALL_START_PATH = void 0;
/**
 * HTTP/WS endpoint path + method contracts for `services/cap-voice-live`
 * (Phase 50). Consumers MUST import these constants (R-14).
 *
 *   - INTERNAL  POST /internal/live/call-start  — cap-voice → cap-voice-live,
 *                                                 INTERNAL_TOKEN_HEADER auth.
 *   - PUBLIC    GET  /live/stream/:callId       — Telnyx media-stream WebSocket
 *                                                 (`stream_url`), signed `t` query.
 *   - PUBLIC    POST /webhook/telnyx            — Telnyx Call Control events,
 *                                                 Ed25519-signed.
 */
exports.CAP_VOICE_LIVE_CALL_START_PATH = '/internal/live/call-start';
exports.CAP_VOICE_LIVE_CALL_START_METHOD = 'POST';
exports.CAP_VOICE_LIVE_STREAM_PATH_PREFIX = '/live/stream';
/** Builds the per-call stream path (query token appended by the caller). */
const CAP_VOICE_LIVE_STREAM_PATH = (callId) => `${exports.CAP_VOICE_LIVE_STREAM_PATH_PREFIX}/${encodeURIComponent(callId)}`;
exports.CAP_VOICE_LIVE_STREAM_PATH = CAP_VOICE_LIVE_STREAM_PATH;
exports.CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH = '/webhook/telnyx';
// -- Web ingress (Phase 50-06): browser WebRTC session to GPT-Live, minted server-side ----
/** POST: `{ sdp }` (browser offer) → `{ session_id, sdp }` (OpenAI answer). Bearer LIVE_WEB_AUTH_TOKEN. */
exports.CAP_VOICE_LIVE_WEB_SESSION_PATH = '/live/web/session';
exports.CAP_VOICE_LIVE_WEB_SESSION_METHOD = 'POST';
/** GET: the static single-page voice client served by cap-voice-live. */
exports.CAP_VOICE_LIVE_WEB_PAGE_PATH = '/live/web/';
exports.CAP_VOICE_LIVE_TELNYX_WEBHOOK_METHOD = 'POST';
//# sourceMappingURL=voice-live.js.map