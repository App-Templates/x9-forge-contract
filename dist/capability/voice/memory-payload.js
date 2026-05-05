import { z } from 'zod';
import { VoicePrivacyMetadataSchema } from "./privacy.js";
import { VoiceCallOutcomeSchema } from "./outcome.js";
/**
 * Payload cap-voice POSTs to Memory v2 `/internal/memory/ingest` for async
 * voice-call fact extraction.
 *
 * **PHASE 42 = CONTRACT-ONLY STUB** per D-21.
 * Memory v2 does NOT yet have a `source_type="voice_call"` extractor branch
 * (Phase 43 scope per D-22). cap-voice posts this payload; Memory v2's
 * existing ingest endpoint accepts it (`sourceType` is `z.string()` at line
 * 35 of `services/memory/src/routes/internal-ingest.ts`), but no extraction
 * happens until Phase 43.
 *
 * Skip rules (D-23): cap-voice MUST NOT post this payload when
 *   - `outcome=wrong_number`, OR
 *   - transcript is empty / below min length, OR
 *   - the webhook was `call_initiation_failure`, OR
 *   - privacy policy forbids retention, OR
 *   - recipient explicitly requested no storage.
 *
 * @see docs/adr/ADR-cap-voice.md §15 (Memory v2 ingestion)
 * @see docs/adr/ADR-cap-voice.md §15.5 (skip rules)
 * @see docs/adr/ADR-cap-voice.md §16 (privacy and retention)
 */
export const VoiceCallMemoryIngestPayloadSchema = z.object({
    /** Literal discriminator. Memory v2 branches on this in Phase 43. */
    source_type: z.literal('voice_call'),
    /** Canonical source reference. Convention: `call:{call_id}`. */
    source_ref: z.string().min(1),
    call_id: z.string().min(1),
    agent_id: z.string().min(1),
    owner_id: z.string().min(1),
    tenant_id: z.string().min(1).optional(),
    /** Full transcript (post-normalization, UTF-8 text). */
    transcript: z.string(),
    /** Transcript metadata — duration, speakers, language. Passthrough for provider drift. */
    transcript_metadata: z
        .object({
        duration_sec: z.number().nonnegative().optional(),
        speaker_turns: z.number().int().nonnegative().optional(),
        language: z.string().min(1).optional(),
    })
        .passthrough(),
    /**
     * Raw ElevenLabs analysis payload (hint only, per D-20). Memory v2 may
     * use this as context but MUST NOT treat it as canonical.
     */
    analysis_raw_from_elevenlabs: z.unknown().optional(),
    /** Reconciled outcome — canonical per D-09. */
    outcome_reconciled: VoiceCallOutcomeSchema,
    /** Privacy envelope (retention_class, privacy_level, jurisdiction flags). */
    privacy: VoicePrivacyMetadataSchema,
    /** RFC-3339 — when cap-voice asserted this fact (usually call end time). */
    asserted_at: z.string().datetime({ offset: true }),
    /** RFC-3339 — when the observed fact happened (usually call start time). */
    source_observed_at: z.string().datetime({ offset: true }),
});
//# sourceMappingURL=memory-payload.js.map