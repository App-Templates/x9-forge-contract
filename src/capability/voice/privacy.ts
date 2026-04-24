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
export const VoicePrivacyLevelSchema = z.enum(['standard', 'sensitive', 'restricted']);
export type VoicePrivacyLevel = z.infer<typeof VoicePrivacyLevelSchema>;

export const VoicePrivacyMetadataSchema = z.object({
  /** Third-party content (recipient's voice is inherently third-party). */
  third_party: z.boolean(),
  /** Literal discriminator — always "voice_call" for this schema. */
  source_type: z.literal('voice_call'),
  privacy_level: VoicePrivacyLevelSchema,
  /** Retention class string. Mapped to concrete TTL policy consumer-side. */
  retention_class: z.string().min(1).default('voice_transcript_default'),
  /** Jurisdiction flag — transcription allowed for this call. */
  call_transcription_allowed: z.boolean().default(true),
  /** Jurisdiction flag — voicemail leave allowed for this call. */
  voicemail_allowed: z.boolean().default(true),
  /** Jurisdiction flag — raw audio retention allowed (default FALSE per D-26). */
  audio_retention_allowed: z.boolean().default(false),
  /** Jurisdiction flag — recipient must be notified of recording. */
  recipient_notice_required: z.boolean().default(false),
});
export type VoicePrivacyMetadata = z.infer<typeof VoicePrivacyMetadataSchema>;
