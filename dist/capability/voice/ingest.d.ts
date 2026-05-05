import { z } from 'zod';
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
export declare const CapVoicePostCallIngestRequestSchema: z.ZodObject<{
    normalized_event: z.ZodObject<{
        call_id: z.ZodString;
        agent_id: z.ZodString;
        owner_id: z.ZodString;
        tenant_id: z.ZodString;
        conversation_id: z.ZodString;
        event_type: z.ZodEnum<{
            post_call_transcription: "post_call_transcription";
            post_call_audio: "post_call_audio";
            call_initiation_failure: "call_initiation_failure";
        }>;
        received_at: z.ZodString;
        forwarded_at: z.ZodOptional<z.ZodString>;
        raw_event_hash: z.ZodString;
        signature_valid: z.ZodLiteral<true>;
        provider: z.ZodLiteral<"elevenlabs">;
        payload: z.ZodUnknown;
        failure_reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export type CapVoicePostCallIngestRequest = z.infer<typeof CapVoicePostCallIngestRequestSchema>;
/** Ingest outcome discriminator. */
export declare const CapVoiceIngestStatusSchema: z.ZodEnum<{
    rejected: "rejected";
    processed: "processed";
    duplicate: "duplicate";
    deferred: "deferred";
}>;
export type CapVoiceIngestStatus = z.infer<typeof CapVoiceIngestStatusSchema>;
export declare const CapVoicePostCallIngestResponseSchema: z.ZodObject<{
    accepted: z.ZodBoolean;
    call_id: z.ZodString;
    status: z.ZodEnum<{
        rejected: "rejected";
        processed: "processed";
        duplicate: "duplicate";
        deferred: "deferred";
    }>;
    error: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CapVoicePostCallIngestResponse = z.infer<typeof CapVoicePostCallIngestResponseSchema>;
//# sourceMappingURL=ingest.d.ts.map