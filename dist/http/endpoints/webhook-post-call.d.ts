import { z } from 'zod';
/**
 * Single turn in an ElevenLabs transcript array. Passthrough to tolerate
 * provider-side schema additions — consumers narrow as needed.
 *
 * Exported as a type hint for consumers (e.g. cap-voice normalizeTranscript).
 * NOT enforced at PostCallPayloadSchema parse time: transcript is
 * `z.unknown()` there so the schema never rejects a shape drift at the
 * provider boundary.
 */
export declare const TranscriptTurnSchema: z.ZodObject<{
    role: z.ZodString;
    message: z.ZodOptional<z.ZodString>;
    time_in_call_secs: z.ZodOptional<z.ZodNumber>;
}, z.core.$loose>;
export type TranscriptTurn = z.infer<typeof TranscriptTurnSchema>;
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
export declare const PostCallPayloadSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodString>;
    conversation_id: z.ZodOptional<z.ZodString>;
    transcript: z.ZodOptional<z.ZodUnknown>;
    analysis: z.ZodOptional<z.ZodObject<{
        transcript_summary: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    dynamic_variables: z.ZodOptional<z.ZodObject<{
        contact_name: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>>;
    data: z.ZodOptional<z.ZodObject<{
        status: z.ZodOptional<z.ZodString>;
        conversation_id: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodUnknown>;
        analysis: z.ZodOptional<z.ZodObject<{
            transcript_summary: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        dynamic_variables: z.ZodOptional<z.ZodObject<{
            contact_name: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
    }, z.core.$loose>>;
    agentId: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type PostCallPayload = z.infer<typeof PostCallPayloadSchema>;
export declare const PostCallResponseSchema: z.ZodObject<{
    received: z.ZodLiteral<true>;
}, z.core.$strip>;
export type PostCallResponse = z.infer<typeof PostCallResponseSchema>;
export declare const PostCallErrorResponseSchema: z.ZodObject<{
    error: z.ZodString;
}, z.core.$strip>;
export type PostCallErrorResponse = z.infer<typeof PostCallErrorResponseSchema>;
export declare const webhookPostCallContract: {
    readonly method: "POST";
    readonly path: "/webhook/post-call";
    /** Token auth for Forge-forwarded requests. Direct ElevenLabs uses HMAC (not bridge scope). */
    readonly authType: "token";
    readonly bodySchema: z.ZodObject<{
        type: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
        conversation_id: z.ZodOptional<z.ZodString>;
        transcript: z.ZodOptional<z.ZodUnknown>;
        analysis: z.ZodOptional<z.ZodObject<{
            transcript_summary: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        dynamic_variables: z.ZodOptional<z.ZodObject<{
            contact_name: z.ZodOptional<z.ZodString>;
        }, z.core.$loose>>;
        data: z.ZodOptional<z.ZodObject<{
            status: z.ZodOptional<z.ZodString>;
            conversation_id: z.ZodOptional<z.ZodString>;
            transcript: z.ZodOptional<z.ZodUnknown>;
            analysis: z.ZodOptional<z.ZodObject<{
                transcript_summary: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>>;
            dynamic_variables: z.ZodOptional<z.ZodObject<{
                contact_name: z.ZodOptional<z.ZodString>;
            }, z.core.$loose>>;
        }, z.core.$loose>>;
        agentId: z.ZodOptional<z.ZodString>;
    }, z.core.$loose>;
    readonly responseSchema: z.ZodObject<{
        received: z.ZodLiteral<true>;
    }, z.core.$strip>;
};
//# sourceMappingURL=webhook-post-call.d.ts.map