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
export { VoiceCallBriefSchema, type VoiceCallBrief } from "./brief.js";
export { AuthorizedActionsSchema, type AuthorizedActions, } from "./authorized-actions.js";
export { VoiceCallIntentSchema, VOICE_CALL_INTENTS, type VoiceCallIntent } from "./intent.js";
export { VoiceCallProvenanceEntrySchema, type VoiceCallProvenanceEntry, } from "./provenance.js";
export { VoicePrepareCallRequestSchema, VoicePrepareCallResponseSchema, type VoicePrepareCallRequest, type VoicePrepareCallResponse, } from "./prepare-call.js";
export { VoiceCallStartRequestSchema, VoiceCallStartResponseSchema, type VoiceCallStartRequest, type VoiceCallStartResponse, } from "./call-start.js";
export { VoiceToolNameSchema, VoiceToolStatusSchema, VoiceToolCallRequestSchema, VoiceToolCallResponseSchema, MUTATING_VOICE_TOOLS, ConfirmRecipientEmailInputSchema, ConfirmRecipientEmailOutputSchema, SendRecapEmailInputSchema, SendRecapEmailOutputSchema, type VoiceToolName, type VoiceToolStatus, type VoiceToolCallRequest, type VoiceToolCallResponse, type ConfirmRecipientEmailInput, type ConfirmRecipientEmailOutput, type SendRecapEmailInput, type SendRecapEmailOutput, } from "./tools.js";
export { CalendarAvailabilityRequestSchema, CalendarAvailabilityResponseSchema, CalendarConflictRequestSchema, CalendarConflictResponseSchema, CalendarHoldRequestSchema, CalendarHoldResponseSchema, CalendarHoldReleaseRequestSchema, CalendarHoldReleaseResponseSchema, CalendarHoldStatusSchema, CalendarHoldReleaseStatusSchema, type CalendarInterval, type CalendarAvailabilityRequest, type CalendarAvailabilityResponse, type CalendarConflictRequest, type CalendarConflictResponse, type CalendarHoldRequest, type CalendarHoldResponse, type CalendarHoldReleaseRequest, type CalendarHoldReleaseResponse, type CalendarHoldStatus, type CalendarHoldReleaseStatus, } from "./calendar-tools.js";
export { VoiceCallOutcomeSchema, VoiceCallOutcomeKindSchema, VoiceRecipientSentimentSchema, VoiceRecipientSentimentLenientSchema, KnownSentiments, normalizeSentiment, type VoiceCallOutcome, type VoiceCallOutcomeKind, type VoiceRecipientSentiment, type KnownVoiceRecipientSentiment, } from "./outcome.js";
export { VoicePrivacyMetadataSchema, VoicePrivacyLevelSchema, type VoicePrivacyMetadata, type VoicePrivacyLevel, } from "./privacy.js";
export { ElevenLabsWebhookEventTypeSchema, ElevenLabsPostCallTranscriptionEventSchema, ElevenLabsPostCallAudioEventSchema, ElevenLabsCallInitiationFailureEventSchema, type ElevenLabsWebhookEventType, type ElevenLabsPostCallTranscriptionEvent, type ElevenLabsPostCallAudioEvent, type ElevenLabsCallInitiationFailureEvent, } from "./webhook-events.js";
export { ForgeVoiceWebhookNormalizedEventSchema, type ForgeVoiceWebhookNormalizedEvent, } from "./normalized-event.js";
export { CapVoicePostCallIngestRequestSchema, CapVoicePostCallIngestResponseSchema, CapVoiceIngestStatusSchema, type CapVoicePostCallIngestRequest, type CapVoicePostCallIngestResponse, type CapVoiceIngestStatus, } from "./ingest.js";
export { VoiceCallMemoryIngestPayloadSchema, type VoiceCallMemoryIngestPayload, } from "./memory-payload.js";
export { VoiceCallToolLogSchema, VoiceToolCallSourceSchema, type VoiceCallToolLog, type VoiceToolCallSource, } from "./tool-log.js";
//# sourceMappingURL=index.d.ts.map