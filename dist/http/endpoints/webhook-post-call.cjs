"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookPostCallContract = exports.PostCallErrorResponseSchema = exports.PostCallResponseSchema = exports.PostCallPayloadSchema = exports.TranscriptTurnSchema = void 0;
const zod_1 = require("zod");
/**
 * POST /webhook/post-call — ElevenLabs post-call webhook (direct or Forge-forwarded).
 * Direction: Forge voice-svc -> X9 cap-voice (cross-repo, Bug #15 endpoint)
 * Auth: X-Internal-Token (when forwarded by Forge; direct ElevenLabs uses HMAC signature)
 * Requirement: HTTP-07
 *
 * This is the Bug #15 endpoint: Forge voice-svc MUST include X-Internal-Token
 * when forwarding post-call webhooks to X9 cap-voice. Missing token caused
 * silent 401s and lost call recaps in production (Phase 21.1).
 *
 * The bridge contract types the FORGE-FORWARDED shape (with agentId appended by
 * voice-svc). Direct ElevenLabs webhooks use HMAC auth (not typed by bridge —
 * external provider).
 *
 * Real PostCallPayload from cap-voice (services/cap-voice/src/webhooks/post-call.ts:41-64):
 * ElevenLabs nests fields at root OR under `data.*` — both shapes accepted.
 *
 * `transcript` is intentionally free-form (`unknown`). ElevenLabs returns it as
 * `string` in some deployments and as `TranscriptTurn[]` in others (observed
 * 2026-04-19: cap-voice HTTP 400 regression on `data.transcript` array shape).
 * Consumers MUST normalize at the boundary; cap-voice does this via
 * `normalizeTranscript()` in services/cap-voice/src/webhooks/post-call.ts.
 * TranscriptTurnSchema is exported as a type hint only — it is NOT enforced
 * at parse time.
 */
/** Analysis sub-object from ElevenLabs post-call payload. */
const PostCallAnalysisSchema = zod_1.z
    .object({
    transcript_summary: zod_1.z.string().optional(),
})
    .passthrough();
/** Dynamic variables from ElevenLabs post-call payload. */
const PostCallDynamicVarsSchema = zod_1.z
    .object({
    contact_name: zod_1.z.string().optional(),
})
    .passthrough();
/**
 * Single turn in an ElevenLabs transcript array. Passthrough to tolerate
 * provider-side schema additions — consumers narrow as needed.
 *
 * Exported as a type hint for consumers (e.g. cap-voice normalizeTranscript).
 * NOT enforced at PostCallPayloadSchema parse time: transcript is
 * `z.unknown()` there so the schema never rejects a shape drift at the
 * provider boundary.
 */
exports.TranscriptTurnSchema = zod_1.z
    .object({
    role: zod_1.z.string(),
    message: zod_1.z.string().optional(),
    time_in_call_secs: zod_1.z.number().optional(),
})
    .passthrough();
/**
 * Post-call webhook payload. ElevenLabs sends fields at root level or nested
 * under `data.*` — the schema accepts both patterns.
 *
 * When forwarded by Forge voice-svc, `agentId` is appended to the body
 * (forge-v2 services/voice/src/routes/voice.ts:112).
 *
 * `transcript` is free-form (`string | TranscriptTurn[] | object | undefined`)
 * — normalise at consumer boundary (see TranscriptTurnSchema + top-of-file
 * JSDoc). Structural fields keep strict typing.
 */
exports.PostCallPayloadSchema = zod_1.z
    .object({
    type: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    conversation_id: zod_1.z.string().optional(),
    transcript: zod_1.z.unknown().optional(),
    analysis: PostCallAnalysisSchema.optional(),
    dynamic_variables: PostCallDynamicVarsSchema.optional(),
    data: zod_1.z
        .object({
        status: zod_1.z.string().optional(),
        conversation_id: zod_1.z.string().optional(),
        transcript: zod_1.z.unknown().optional(),
        analysis: PostCallAnalysisSchema.optional(),
        dynamic_variables: PostCallDynamicVarsSchema.optional(),
    })
        .passthrough()
        .optional(),
    /** Added by Forge voice-svc when forwarding (voice.ts:112). */
    agentId: zod_1.z.string().optional(),
})
    .passthrough();
exports.PostCallResponseSchema = zod_1.z.object({
    received: zod_1.z.literal(true),
});
exports.PostCallErrorResponseSchema = zod_1.z.object({
    error: zod_1.z.string(),
});
exports.webhookPostCallContract = {
    method: 'POST',
    path: '/webhook/post-call',
    /** Token auth for Forge-forwarded requests. Direct ElevenLabs uses HMAC (not bridge scope). */
    authType: 'token',
    bodySchema: exports.PostCallPayloadSchema,
    responseSchema: exports.PostCallResponseSchema,
};
//# sourceMappingURL=webhook-post-call.js.map