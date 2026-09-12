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
export const CAP_VOICE_LIVE_CALL_START_PATH = '/internal/live/call-start' as const;
export const CAP_VOICE_LIVE_CALL_START_METHOD = 'POST' as const;

export const CAP_VOICE_LIVE_STREAM_PATH_PREFIX = '/live/stream' as const;
/** Builds the per-call stream path (query token appended by the caller). */
export const CAP_VOICE_LIVE_STREAM_PATH = (callId: string): `/live/stream/${string}` =>
  `${CAP_VOICE_LIVE_STREAM_PATH_PREFIX}/${encodeURIComponent(callId)}` as `/live/stream/${string}`;

export const CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH = '/webhook/telnyx' as const;

// -- Web ingress (Phase 50-06): browser WebRTC session to GPT-Live, minted server-side ----
/** POST: `{ sdp }` (browser offer) → `{ session_id, sdp }` (OpenAI answer). Bearer LIVE_WEB_AUTH_TOKEN. */
export const CAP_VOICE_LIVE_WEB_SESSION_PATH = '/live/web/session' as const;
export const CAP_VOICE_LIVE_WEB_SESSION_METHOD = 'POST' as const;
/** GET: the static single-page voice client served by cap-voice-live. */
export const CAP_VOICE_LIVE_WEB_PAGE_PATH = '/live/web/' as const;
export const CAP_VOICE_LIVE_TELNYX_WEBHOOK_METHOD = 'POST' as const;
