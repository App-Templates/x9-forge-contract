/**
 * Voice capability contracts — sub-path `@x9-forge/contracts/capability/voice`.
 *
 * Cross-repo contracts for the CAP-Voice v2.2 runtime:
 *   - X9 cap-voice ↔ Forge voice-svc (post-call ingest, registration)
 *   - ElevenLabs webhook events (lenient external inputs)
 *   - Forge normalized events (strict internal boundary)
 *   - 12-tool voice surface (D-16) + calendar tool input/output shapes
 *   - Call outcome / tool log / memory ingest payload / privacy metadata
 *
 * 27 canonical schemas per ADR-cap-voice.md §5.2 / D-04.
 *
 * @see docs/adr/ADR-cap-voice.md
 * @see .planning/phases/42-cap-voice-v2.2-foundation-shadow/
 */
// -- Brief + authorization (2 schemas) -------------------------------------
export { VoiceCallBriefSchema } from "./brief.js";
export { AuthorizedActionsSchema, } from "./authorized-actions.js";
// -- M46 origination (intent enum + provenance + prepare-call request/response) ----
// VORIG-01 (intent) + VORIG-02 (prepare-call) + VORIG-03 (provenance) per Phase 46.0.
// provenance.ts is a separate module (not co-located in prepare-call.ts) to
// avoid a module-initialization cycle with brief.ts — see 46.0-RESEARCH §12 pitfall #2.
export { VoiceCallIntentSchema, VOICE_CALL_INTENTS } from "./intent.js";
export { VoiceCallProvenanceEntrySchema, } from "./provenance.js";
export { VoicePrepareCallRequestSchema, VoicePrepareCallResponseSchema, } from "./prepare-call.js";
// -- Call lifecycle (2 schemas) --------------------------------------------
export { VoiceCallStartRequestSchema, VoiceCallStartResponseSchema, } from "./call-start.js";
// -- Tool surface (4 schemas + 1 runtime helper + confirm_recipient_email pair + send_recap_email pair) ---
export { VoiceToolNameSchema, VoiceToolStatusSchema, VoiceToolCallRequestSchema, VoiceToolCallResponseSchema, MUTATING_VOICE_TOOLS, ConfirmRecipientEmailInputSchema, ConfirmRecipientEmailOutputSchema, SendRecapEmailInputSchema, SendRecapEmailOutputSchema, } from "./tools.js";
// -- Calendar tool shapes (8 schemas + 2 supporting enums) -----------------
export { CalendarAvailabilityRequestSchema, CalendarAvailabilityResponseSchema, CalendarConflictRequestSchema, CalendarConflictResponseSchema, CalendarHoldRequestSchema, CalendarHoldResponseSchema, CalendarHoldReleaseRequestSchema, CalendarHoldReleaseResponseSchema, CalendarHoldStatusSchema, CalendarHoldReleaseStatusSchema, } from "./calendar-tools.js";
// -- Outcome (1 schema + supporting enums) ---------------------------------
export { VoiceCallOutcomeSchema, VoiceCallOutcomeKindSchema, VoiceRecipientSentimentSchema, VoiceRecipientSentimentLenientSchema, KnownSentiments, normalizeSentiment, } from "./outcome.js";
// -- Privacy (1 schema + supporting enum) ----------------------------------
export { VoicePrivacyMetadataSchema, VoicePrivacyLevelSchema, } from "./privacy.js";
// -- ElevenLabs webhook events (4 schemas — 1 enum + 3 lenient events) -----
export { ElevenLabsWebhookEventTypeSchema, ElevenLabsPostCallTranscriptionEventSchema, ElevenLabsPostCallAudioEventSchema, ElevenLabsCallInitiationFailureEventSchema, } from "./webhook-events.js";
// -- Forge normalized event (1 schema — STRICT) ----------------------------
export { ForgeVoiceWebhookNormalizedEventSchema, } from "./normalized-event.js";
// -- cap-voice ingest (2 schemas + status enum) ----------------------------
export { CapVoicePostCallIngestRequestSchema, CapVoicePostCallIngestResponseSchema, CapVoiceIngestStatusSchema, } from "./ingest.js";
// -- Memory v2 handoff (1 schema — STUB per D-21) --------------------------
export { VoiceCallMemoryIngestPayloadSchema, } from "./memory-payload.js";
// -- Tool log (1 schema + supporting enum) ---------------------------------
export { VoiceCallToolLogSchema, VoiceToolCallSourceSchema, } from "./tool-log.js";
//# sourceMappingURL=index.js.map