"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceToolCallSourceSchema = exports.VoiceCallToolLogSchema = exports.VoiceCallMemoryIngestPayloadSchema = exports.CapVoiceIngestStatusSchema = exports.CapVoicePostCallIngestResponseSchema = exports.CapVoicePostCallIngestRequestSchema = exports.ForgeVoiceWebhookNormalizedEventSchema = exports.ElevenLabsCallInitiationFailureEventSchema = exports.ElevenLabsPostCallAudioEventSchema = exports.ElevenLabsPostCallTranscriptionEventSchema = exports.ElevenLabsWebhookEventTypeSchema = exports.VoicePrivacyLevelSchema = exports.VoicePrivacyMetadataSchema = exports.normalizeSentiment = exports.KnownSentiments = exports.VoiceRecipientSentimentLenientSchema = exports.VoiceRecipientSentimentSchema = exports.VoiceCallOutcomeKindSchema = exports.VoiceCallOutcomeSchema = exports.CalendarHoldReleaseStatusSchema = exports.CalendarHoldStatusSchema = exports.CalendarHoldReleaseResponseSchema = exports.CalendarHoldReleaseRequestSchema = exports.CalendarHoldResponseSchema = exports.CalendarHoldRequestSchema = exports.CalendarConflictResponseSchema = exports.CalendarConflictRequestSchema = exports.CalendarAvailabilityResponseSchema = exports.CalendarAvailabilityRequestSchema = exports.SendRecapEmailOutputSchema = exports.SendRecapEmailInputSchema = exports.ConfirmRecipientEmailOutputSchema = exports.ConfirmRecipientEmailInputSchema = exports.MUTATING_VOICE_TOOLS = exports.VoiceToolCallResponseSchema = exports.VoiceToolCallRequestSchema = exports.VoiceToolStatusSchema = exports.VoiceToolNameSchema = exports.VoiceCallStartResponseSchema = exports.VoiceCallStartRequestSchema = exports.VoicePrepareCallResponseSchema = exports.VoicePrepareCallRequestSchema = exports.VoiceCallProvenanceEntrySchema = exports.VOICE_CALL_INTENTS = exports.VoiceCallIntentSchema = exports.AuthorizedActionsSchema = exports.VoiceCallBriefSchema = void 0;
// -- Brief + authorization (2 schemas) -------------------------------------
var brief_js_1 = require("./brief.cjs");
Object.defineProperty(exports, "VoiceCallBriefSchema", { enumerable: true, get: function () { return brief_js_1.VoiceCallBriefSchema; } });
var authorized_actions_js_1 = require("./authorized-actions.cjs");
Object.defineProperty(exports, "AuthorizedActionsSchema", { enumerable: true, get: function () { return authorized_actions_js_1.AuthorizedActionsSchema; } });
// -- M46 origination (intent enum + provenance + prepare-call request/response) ----
// VORIG-01 (intent) + VORIG-02 (prepare-call) + VORIG-03 (provenance) per Phase 46.0.
// provenance.ts is a separate module (not co-located in prepare-call.ts) to
// avoid a module-initialization cycle with brief.ts — see 46.0-RESEARCH §12 pitfall #2.
var intent_js_1 = require("./intent.cjs");
Object.defineProperty(exports, "VoiceCallIntentSchema", { enumerable: true, get: function () { return intent_js_1.VoiceCallIntentSchema; } });
Object.defineProperty(exports, "VOICE_CALL_INTENTS", { enumerable: true, get: function () { return intent_js_1.VOICE_CALL_INTENTS; } });
var provenance_js_1 = require("./provenance.cjs");
Object.defineProperty(exports, "VoiceCallProvenanceEntrySchema", { enumerable: true, get: function () { return provenance_js_1.VoiceCallProvenanceEntrySchema; } });
var prepare_call_js_1 = require("./prepare-call.cjs");
Object.defineProperty(exports, "VoicePrepareCallRequestSchema", { enumerable: true, get: function () { return prepare_call_js_1.VoicePrepareCallRequestSchema; } });
Object.defineProperty(exports, "VoicePrepareCallResponseSchema", { enumerable: true, get: function () { return prepare_call_js_1.VoicePrepareCallResponseSchema; } });
// -- Call lifecycle (2 schemas) --------------------------------------------
var call_start_js_1 = require("./call-start.cjs");
Object.defineProperty(exports, "VoiceCallStartRequestSchema", { enumerable: true, get: function () { return call_start_js_1.VoiceCallStartRequestSchema; } });
Object.defineProperty(exports, "VoiceCallStartResponseSchema", { enumerable: true, get: function () { return call_start_js_1.VoiceCallStartResponseSchema; } });
// -- Tool surface (4 schemas + 1 runtime helper + confirm_recipient_email pair + send_recap_email pair) ---
var tools_js_1 = require("./tools.cjs");
Object.defineProperty(exports, "VoiceToolNameSchema", { enumerable: true, get: function () { return tools_js_1.VoiceToolNameSchema; } });
Object.defineProperty(exports, "VoiceToolStatusSchema", { enumerable: true, get: function () { return tools_js_1.VoiceToolStatusSchema; } });
Object.defineProperty(exports, "VoiceToolCallRequestSchema", { enumerable: true, get: function () { return tools_js_1.VoiceToolCallRequestSchema; } });
Object.defineProperty(exports, "VoiceToolCallResponseSchema", { enumerable: true, get: function () { return tools_js_1.VoiceToolCallResponseSchema; } });
Object.defineProperty(exports, "MUTATING_VOICE_TOOLS", { enumerable: true, get: function () { return tools_js_1.MUTATING_VOICE_TOOLS; } });
Object.defineProperty(exports, "ConfirmRecipientEmailInputSchema", { enumerable: true, get: function () { return tools_js_1.ConfirmRecipientEmailInputSchema; } });
Object.defineProperty(exports, "ConfirmRecipientEmailOutputSchema", { enumerable: true, get: function () { return tools_js_1.ConfirmRecipientEmailOutputSchema; } });
Object.defineProperty(exports, "SendRecapEmailInputSchema", { enumerable: true, get: function () { return tools_js_1.SendRecapEmailInputSchema; } });
Object.defineProperty(exports, "SendRecapEmailOutputSchema", { enumerable: true, get: function () { return tools_js_1.SendRecapEmailOutputSchema; } });
// -- Calendar tool shapes (8 schemas + 2 supporting enums) -----------------
var calendar_tools_js_1 = require("./calendar-tools.cjs");
Object.defineProperty(exports, "CalendarAvailabilityRequestSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarAvailabilityRequestSchema; } });
Object.defineProperty(exports, "CalendarAvailabilityResponseSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarAvailabilityResponseSchema; } });
Object.defineProperty(exports, "CalendarConflictRequestSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarConflictRequestSchema; } });
Object.defineProperty(exports, "CalendarConflictResponseSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarConflictResponseSchema; } });
Object.defineProperty(exports, "CalendarHoldRequestSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldRequestSchema; } });
Object.defineProperty(exports, "CalendarHoldResponseSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldResponseSchema; } });
Object.defineProperty(exports, "CalendarHoldReleaseRequestSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldReleaseRequestSchema; } });
Object.defineProperty(exports, "CalendarHoldReleaseResponseSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldReleaseResponseSchema; } });
Object.defineProperty(exports, "CalendarHoldStatusSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldStatusSchema; } });
Object.defineProperty(exports, "CalendarHoldReleaseStatusSchema", { enumerable: true, get: function () { return calendar_tools_js_1.CalendarHoldReleaseStatusSchema; } });
// -- Outcome (1 schema + supporting enums) ---------------------------------
var outcome_js_1 = require("./outcome.cjs");
Object.defineProperty(exports, "VoiceCallOutcomeSchema", { enumerable: true, get: function () { return outcome_js_1.VoiceCallOutcomeSchema; } });
Object.defineProperty(exports, "VoiceCallOutcomeKindSchema", { enumerable: true, get: function () { return outcome_js_1.VoiceCallOutcomeKindSchema; } });
Object.defineProperty(exports, "VoiceRecipientSentimentSchema", { enumerable: true, get: function () { return outcome_js_1.VoiceRecipientSentimentSchema; } });
Object.defineProperty(exports, "VoiceRecipientSentimentLenientSchema", { enumerable: true, get: function () { return outcome_js_1.VoiceRecipientSentimentLenientSchema; } });
Object.defineProperty(exports, "KnownSentiments", { enumerable: true, get: function () { return outcome_js_1.KnownSentiments; } });
Object.defineProperty(exports, "normalizeSentiment", { enumerable: true, get: function () { return outcome_js_1.normalizeSentiment; } });
// -- Privacy (1 schema + supporting enum) ----------------------------------
var privacy_js_1 = require("./privacy.cjs");
Object.defineProperty(exports, "VoicePrivacyMetadataSchema", { enumerable: true, get: function () { return privacy_js_1.VoicePrivacyMetadataSchema; } });
Object.defineProperty(exports, "VoicePrivacyLevelSchema", { enumerable: true, get: function () { return privacy_js_1.VoicePrivacyLevelSchema; } });
// -- ElevenLabs webhook events (4 schemas — 1 enum + 3 lenient events) -----
var webhook_events_js_1 = require("./webhook-events.cjs");
Object.defineProperty(exports, "ElevenLabsWebhookEventTypeSchema", { enumerable: true, get: function () { return webhook_events_js_1.ElevenLabsWebhookEventTypeSchema; } });
Object.defineProperty(exports, "ElevenLabsPostCallTranscriptionEventSchema", { enumerable: true, get: function () { return webhook_events_js_1.ElevenLabsPostCallTranscriptionEventSchema; } });
Object.defineProperty(exports, "ElevenLabsPostCallAudioEventSchema", { enumerable: true, get: function () { return webhook_events_js_1.ElevenLabsPostCallAudioEventSchema; } });
Object.defineProperty(exports, "ElevenLabsCallInitiationFailureEventSchema", { enumerable: true, get: function () { return webhook_events_js_1.ElevenLabsCallInitiationFailureEventSchema; } });
// -- Forge normalized event (1 schema — STRICT) ----------------------------
var normalized_event_js_1 = require("./normalized-event.cjs");
Object.defineProperty(exports, "ForgeVoiceWebhookNormalizedEventSchema", { enumerable: true, get: function () { return normalized_event_js_1.ForgeVoiceWebhookNormalizedEventSchema; } });
// -- cap-voice ingest (2 schemas + status enum) ----------------------------
var ingest_js_1 = require("./ingest.cjs");
Object.defineProperty(exports, "CapVoicePostCallIngestRequestSchema", { enumerable: true, get: function () { return ingest_js_1.CapVoicePostCallIngestRequestSchema; } });
Object.defineProperty(exports, "CapVoicePostCallIngestResponseSchema", { enumerable: true, get: function () { return ingest_js_1.CapVoicePostCallIngestResponseSchema; } });
Object.defineProperty(exports, "CapVoiceIngestStatusSchema", { enumerable: true, get: function () { return ingest_js_1.CapVoiceIngestStatusSchema; } });
// -- Memory v2 handoff (1 schema — STUB per D-21) --------------------------
var memory_payload_js_1 = require("./memory-payload.cjs");
Object.defineProperty(exports, "VoiceCallMemoryIngestPayloadSchema", { enumerable: true, get: function () { return memory_payload_js_1.VoiceCallMemoryIngestPayloadSchema; } });
// -- Tool log (1 schema + supporting enum) ---------------------------------
var tool_log_js_1 = require("./tool-log.cjs");
Object.defineProperty(exports, "VoiceCallToolLogSchema", { enumerable: true, get: function () { return tool_log_js_1.VoiceCallToolLogSchema; } });
Object.defineProperty(exports, "VoiceToolCallSourceSchema", { enumerable: true, get: function () { return tool_log_js_1.VoiceToolCallSourceSchema; } });
//# sourceMappingURL=index.js.map