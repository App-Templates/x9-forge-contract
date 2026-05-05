"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoicePrivacyMetadataSchema = exports.VoicePrivacyLevelSchema = void 0;
const zod_1 = require("zod");
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
exports.VoicePrivacyLevelSchema = zod_1.z.enum(['standard', 'sensitive', 'restricted']);
exports.VoicePrivacyMetadataSchema = zod_1.z.object({
    /** Third-party content (recipient's voice is inherently third-party). */
    third_party: zod_1.z.boolean(),
    /** Literal discriminator — always "voice_call" for this schema. */
    source_type: zod_1.z.literal('voice_call'),
    privacy_level: exports.VoicePrivacyLevelSchema,
    /** Retention class string. Mapped to concrete TTL policy consumer-side. */
    retention_class: zod_1.z.string().min(1).default('voice_transcript_default'),
    /** Jurisdiction flag — transcription allowed for this call. */
    call_transcription_allowed: zod_1.z.boolean().default(true),
    /** Jurisdiction flag — voicemail leave allowed for this call. */
    voicemail_allowed: zod_1.z.boolean().default(true),
    /** Jurisdiction flag — raw audio retention allowed (default FALSE per D-26). */
    audio_retention_allowed: zod_1.z.boolean().default(false),
    /** Jurisdiction flag — recipient must be notified of recording. */
    recipient_notice_required: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=privacy.js.map