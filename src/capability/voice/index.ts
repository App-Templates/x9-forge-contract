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
export { VoiceCallBriefSchema, type VoiceCallBrief } from './brief.js';
export {
  AuthorizedActionsSchema,
  type AuthorizedActions,
} from './authorized-actions.js';

// -- Call lifecycle (2 schemas) --------------------------------------------
export {
  VoiceCallStartRequestSchema,
  VoiceCallStartResponseSchema,
  type VoiceCallStartRequest,
  type VoiceCallStartResponse,
} from './call-start.js';

// -- Tool surface (4 schemas + 1 runtime helper) ---------------------------
export {
  VoiceToolNameSchema,
  VoiceToolStatusSchema,
  VoiceToolCallRequestSchema,
  VoiceToolCallResponseSchema,
  MUTATING_VOICE_TOOLS,
  type VoiceToolName,
  type VoiceToolStatus,
  type VoiceToolCallRequest,
  type VoiceToolCallResponse,
} from './tools.js';

// -- Calendar tool shapes (8 schemas + 2 supporting enums) -----------------
export {
  CalendarAvailabilityRequestSchema,
  CalendarAvailabilityResponseSchema,
  CalendarConflictRequestSchema,
  CalendarConflictResponseSchema,
  CalendarHoldRequestSchema,
  CalendarHoldResponseSchema,
  CalendarHoldReleaseRequestSchema,
  CalendarHoldReleaseResponseSchema,
  CalendarHoldStatusSchema,
  CalendarHoldReleaseStatusSchema,
  type CalendarInterval,
  type CalendarAvailabilityRequest,
  type CalendarAvailabilityResponse,
  type CalendarConflictRequest,
  type CalendarConflictResponse,
  type CalendarHoldRequest,
  type CalendarHoldResponse,
  type CalendarHoldReleaseRequest,
  type CalendarHoldReleaseResponse,
  type CalendarHoldStatus,
  type CalendarHoldReleaseStatus,
} from './calendar-tools.js';

// -- Outcome (1 schema + supporting enums) ---------------------------------
export {
  VoiceCallOutcomeSchema,
  VoiceCallOutcomeKindSchema,
  VoiceRecipientSentimentSchema,
  type VoiceCallOutcome,
  type VoiceCallOutcomeKind,
  type VoiceRecipientSentiment,
} from './outcome.js';

// -- Privacy (1 schema + supporting enum) ----------------------------------
export {
  VoicePrivacyMetadataSchema,
  VoicePrivacyLevelSchema,
  type VoicePrivacyMetadata,
  type VoicePrivacyLevel,
} from './privacy.js';

// -- ElevenLabs webhook events (4 schemas — 1 enum + 3 lenient events) -----
export {
  ElevenLabsWebhookEventTypeSchema,
  ElevenLabsPostCallTranscriptionEventSchema,
  ElevenLabsPostCallAudioEventSchema,
  ElevenLabsCallInitiationFailureEventSchema,
  type ElevenLabsWebhookEventType,
  type ElevenLabsPostCallTranscriptionEvent,
  type ElevenLabsPostCallAudioEvent,
  type ElevenLabsCallInitiationFailureEvent,
} from './webhook-events.js';

// -- Forge normalized event (1 schema — STRICT) ----------------------------
export {
  ForgeVoiceWebhookNormalizedEventSchema,
  type ForgeVoiceWebhookNormalizedEvent,
} from './normalized-event.js';

// -- cap-voice ingest (2 schemas + status enum) ----------------------------
export {
  CapVoicePostCallIngestRequestSchema,
  CapVoicePostCallIngestResponseSchema,
  CapVoiceIngestStatusSchema,
  type CapVoicePostCallIngestRequest,
  type CapVoicePostCallIngestResponse,
  type CapVoiceIngestStatus,
} from './ingest.js';

// -- Memory v2 handoff (1 schema — STUB per D-21) --------------------------
export {
  VoiceCallMemoryIngestPayloadSchema,
  type VoiceCallMemoryIngestPayload,
} from './memory-payload.js';

// -- Tool log (1 schema + supporting enum) ---------------------------------
export {
  VoiceCallToolLogSchema,
  VoiceToolCallSourceSchema,
  type VoiceCallToolLog,
  type VoiceToolCallSource,
} from './tool-log.js';
