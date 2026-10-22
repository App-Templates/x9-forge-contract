import { z } from 'zod';
/**
 * Privacy metadata attached to every voice-call artifact (transcript,
 * outcome, memory ingestion payload). Per ADR §16 / D-26.
 *
 * `source_type` is a literal `"voice_call"` to discriminate against other
 * memory source types (chat, doc, rag).
 *
 * `privacy_level`:
 *   - standard — normal retention, projectable to Qdrant;
 *   - sensitive — restricted; no Qdrant projection by default; review required;
 *   - restricted — legal/medical/financial content; no projection, retention-minimal.
 *
 * Audio retention is OFF by default per ADR §16.4 (do not store raw audio).
 * Jurisdiction flags (`call_transcription_allowed`, `voicemail_allowed`,
 * `audio_retention_allowed`, `recipient_notice_required`) follow conservative
 * defaults and are overridden per-tenant policy.
 */
export declare const VoicePrivacyLevelSchema: z.ZodEnum<{
    standard: "standard";
    sensitive: "sensitive";
    restricted: "restricted";
}>;
export type VoicePrivacyLevel = z.infer<typeof VoicePrivacyLevelSchema>;
export declare const VoicePrivacyMetadataSchema: z.ZodObject<{
    third_party: z.ZodBoolean;
    source_type: z.ZodLiteral<"voice_call">;
    privacy_level: z.ZodEnum<{
        standard: "standard";
        sensitive: "sensitive";
        restricted: "restricted";
    }>;
    retention_class: z.ZodDefault<z.ZodString>;
    call_transcription_allowed: z.ZodDefault<z.ZodBoolean>;
    voicemail_allowed: z.ZodDefault<z.ZodBoolean>;
    audio_retention_allowed: z.ZodDefault<z.ZodBoolean>;
    recipient_notice_required: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type VoicePrivacyMetadata = z.infer<typeof VoicePrivacyMetadataSchema>;
//# sourceMappingURL=privacy.d.ts.map