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
export { VoiceCallBriefSchema, type VoiceCallBrief } from "./brief.cjs";
export { AuthorizedActionsSchema, type AuthorizedActions, } from "./authorized-actions.cjs";
export { VoiceCallIntentSchema, VOICE_CALL_INTENTS, type VoiceCallIntent } from "./intent.cjs";
export { VoiceCallProvenanceEntrySchema, type VoiceCallProvenanceEntry, } from "./provenance.cjs";
export { VoicePrepareCallRequestSchema, VoicePrepareCallResponseSchema, type VoicePrepareCallRequest, type VoicePrepareCallResponse, } from "./prepare-call.cjs";
export { VoiceCallStartRequestSchema, VoiceCallStartResponseSchema, type VoiceCallStartRequest, type VoiceCallStartResponse, } from "./call-start.cjs";
export { VoiceToolNameSchema, VoiceToolStatusSchema, VoiceToolCallRequestSchema, VoiceToolCallResponseSchema, MUTATING_VOICE_TOOLS, ConfirmRecipientEmailInputSchema, ConfirmRecipientEmailOutputSchema, SendRecapEmailInputSchema, SendRecapEmailOutputSchema, type VoiceToolName, type VoiceToolStatus, type VoiceToolCallRequest, type VoiceToolCallResponse, type ConfirmRecipientEmailInput, type ConfirmRecipientEmailOutput, type SendRecapEmailInput, type SendRecapEmailOutput, } from "./tools.cjs";
export { CalendarAvailabilityRequestSchema, CalendarAvailabilityResponseSchema, CalendarConflictRequestSchema, CalendarConflictResponseSchema, CalendarHoldRequestSchema, CalendarHoldResponseSchema, CalendarHoldReleaseRequestSchema, CalendarHoldReleaseResponseSchema, CalendarHoldStatusSchema, CalendarHoldReleaseStatusSchema, type CalendarInterval, type CalendarAvailabilityRequest, type CalendarAvailabilityResponse, type CalendarConflictRequest, type CalendarConflictResponse, type CalendarHoldRequest, type CalendarHoldResponse, type CalendarHoldReleaseRequest, type CalendarHoldReleaseResponse, type CalendarHoldStatus, type CalendarHoldReleaseStatus, } from "./calendar-tools.cjs";
export { VoiceCallOutcomeSchema, VoiceCallOutcomeKindSchema, VoiceRecipientSentimentSchema, VoiceRecipientSentimentLenientSchema, KnownSentiments, normalizeSentiment, type VoiceCallOutcome, type VoiceCallOutcomeKind, type VoiceRecipientSentiment, type KnownVoiceRecipientSentiment, } from "./outcome.cjs";
export { VoicePrivacyMetadataSchema, VoicePrivacyLevelSchema, type VoicePrivacyMetadata, type VoicePrivacyLevel, } from "./privacy.cjs";
export { ElevenLabsWebhookEventTypeSchema, ElevenLabsPostCallTranscriptionEventSchema, ElevenLabsPostCallAudioEventSchema, ElevenLabsCallInitiationFailureEventSchema, type ElevenLabsWebhookEventType, type ElevenLabsPostCallTranscriptionEvent, type ElevenLabsPostCallAudioEvent, type ElevenLabsCallInitiationFailureEvent, } from "./webhook-events.cjs";
export { ForgeVoiceWebhookNormalizedEventSchema, type ForgeVoiceWebhookNormalizedEvent, } from "./normalized-event.cjs";
export { CapVoicePostCallIngestRequestSchema, CapVoicePostCallIngestResponseSchema, CapVoiceIngestStatusSchema, type CapVoicePostCallIngestRequest, type CapVoicePostCallIngestResponse, type CapVoiceIngestStatus, } from "./ingest.cjs";
export { VoiceCallMemoryIngestPayloadSchema, type VoiceCallMemoryIngestPayload, } from "./memory-payload.cjs";
export { VoiceCallToolLogSchema, VoiceToolCallSourceSchema, type VoiceCallToolLog, type VoiceToolCallSource, } from "./tool-log.cjs";
//# sourceMappingURL=index.d.ts.map