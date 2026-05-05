"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapVoicePostCallIngestResponseSchema = exports.CapVoiceIngestStatusSchema = exports.CapVoicePostCallIngestRequestSchema = void 0;
const zod_1 = require("zod");
const normalized_event_js_1 = require("./normalized-event.cjs");
/**
 * Internal post-call ingest contract — Forge voice-svc -> cap-voice.
 *
 * cap-voice mounts `POST /internal/voice/post-call` (path exported from
 * `http/endpoints/voice.ts`) protected by `X-Internal-Token`. Forge forwards
 * the normalized event and waits only for synchronous persistence ACK;
 * Memory v2 ingestion + follow-up jobs are fire-and-forget (D-24).
 *
 * @see docs/adr/ADR-cap-voice.md §5.2 (CapVoicePostCallIngestRequestSchema / ResponseSchema)
 * @see docs/adr/ADR-cap-voice.md §6.2 (internal endpoint)
 * @see docs/adr/ADR-cap-voice.md §6.5 / D-08 (ACK rule)
 */
exports.CapVoicePostCallIngestRequestSchema = zod_1.z.object({
    /** Normalized event — STRICT schema, must pass structural validation. */
    normalized_event: normalized_event_js_1.ForgeVoiceWebhookNormalizedEventSchema,
});
/** Ingest outcome discriminator. */
exports.CapVoiceIngestStatusSchema = zod_1.z.enum([
    'processed',
    'duplicate',
    'rejected',
    'deferred',
]);
exports.CapVoicePostCallIngestResponseSchema = zod_1.z.object({
    accepted: zod_1.z.boolean(),
    call_id: zod_1.z.string().min(1),
    status: exports.CapVoiceIngestStatusSchema,
    /** Populated when `accepted=false` (reason) or deferred with retry guidance. */
    error: zod_1.z.string().optional(),
});
//# sourceMappingURL=ingest.js.map