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
export declare const CAP_VOICE_LIVE_CALL_START_PATH: "/internal/live/call-start";
export declare const CAP_VOICE_LIVE_CALL_START_METHOD: "POST";
export declare const CAP_VOICE_LIVE_STREAM_PATH_PREFIX: "/live/stream";
/** Builds the per-call stream path (query token appended by the caller). */
export declare const CAP_VOICE_LIVE_STREAM_PATH: (callId: string) => `/live/stream/${string}`;
export declare const CAP_VOICE_LIVE_TELNYX_WEBHOOK_PATH: "/webhook/telnyx";
export declare const CAP_VOICE_LIVE_TELNYX_WEBHOOK_METHOD: "POST";
//# sourceMappingURL=voice-live.d.ts.map