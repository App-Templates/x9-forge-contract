import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  // brief + authorization
  VoiceCallBriefSchema,
  AuthorizedActionsSchema,
  // call lifecycle
  VoiceCallStartRequestSchema,
  VoiceCallStartResponseSchema,
  // tool surface
  VoiceToolNameSchema,
  VoiceToolStatusSchema,
  VoiceToolCallRequestSchema,
  VoiceToolCallResponseSchema,
  MUTATING_VOICE_TOOLS,
  // calendar tools
  CalendarAvailabilityRequestSchema,
  CalendarAvailabilityResponseSchema,
  CalendarConflictRequestSchema,
  CalendarConflictResponseSchema,
  CalendarHoldRequestSchema,
  CalendarHoldResponseSchema,
  CalendarHoldReleaseRequestSchema,
  CalendarHoldReleaseResponseSchema,
  // outcome / privacy
  VoiceCallOutcomeSchema,
  VoicePrivacyMetadataSchema,
  // webhook events
  ElevenLabsWebhookEventTypeSchema,
  ElevenLabsPostCallTranscriptionEventSchema,
  ElevenLabsPostCallAudioEventSchema,
  ElevenLabsCallInitiationFailureEventSchema,
  ForgeVoiceWebhookNormalizedEventSchema,
  // ingest + memory + tool log
  CapVoicePostCallIngestRequestSchema,
  CapVoicePostCallIngestResponseSchema,
  VoiceCallToolLogSchema,
  VoiceCallMemoryIngestPayloadSchema,
} from '../../../src/capability/voice/index.js';

const here = dirname(fileURLToPath(import.meta.url));
const validDir = resolve(here, 'fixtures/valid');
const invalidDir = resolve(here, 'fixtures/invalid');

const loadValid = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(validDir, name), 'utf-8'));
const loadInvalid = (name: string): unknown =>
  JSON.parse(readFileSync(resolve(invalidDir, name), 'utf-8'));

// ===========================================================================
// 1. Brief + authorization
// ===========================================================================

describe('VoiceCallBriefSchema', () => {
  it('parses a valid brief with pre-authorized slots', () => {
    const result = VoiceCallBriefSchema.safeParse(loadValid('call-brief.json'));
    expect(result.success).toBe(true);
  });

  it('rejects a brief with empty call_goal_short', () => {
    const result = VoiceCallBriefSchema.safeParse(loadInvalid('call-brief-empty-goal.json'));
    expect(result.success).toBe(false);
  });

  it('applies timezone default when absent', () => {
    const parsed = VoiceCallBriefSchema.parse({
      call_id: 'c',
      agent_id: '1',
      owner_id: 'o',
      call_goal_short: 'g',
      recipient_name: 'r',
      recipient_context: '',
    });
    expect(parsed.timezone).toBe('Europe/Rome');
  });
});

describe('AuthorizedActionsSchema (W-06)', () => {
  it('parses a full safe-defaults payload', () => {
    const result = AuthorizedActionsSchema.safeParse(loadValid('authorized-actions.json'));
    expect(result.success).toBe(true);
  });

  it('applies W-06 defaults: can_share_sensitive_pii=false + can_act_outside_brief=false', () => {
    const parsed = AuthorizedActionsSchema.parse({});
    expect(parsed.can_share_sensitive_pii).toBe(false);
    expect(parsed.can_act_outside_brief).toBe(false);
  });

  it('applies read-only defaults TRUE', () => {
    const parsed = AuthorizedActionsSchema.parse({});
    expect(parsed.can_search_context).toBe(true);
    expect(parsed.can_get_calendar_availability).toBe(true);
    expect(parsed.can_check_calendar_conflicts).toBe(true);
    expect(parsed.can_release_calendar_block).toBe(true);
    expect(parsed.can_draft_email).toBe(true);
    expect(parsed.can_notify_stefano).toBe(true);
  });

  it('applies mutating defaults FALSE', () => {
    const parsed = AuthorizedActionsSchema.parse({});
    expect(parsed.can_create_calendar_event).toBe(false);
    expect(parsed.can_block_calendar_slot).toBe(false);
    expect(parsed.can_send_email_recap).toBe(false);
    expect(parsed.can_create_reminder).toBe(false);
  });

  it('rejects non-boolean flag value', () => {
    const result = AuthorizedActionsSchema.safeParse(
      loadInvalid('authorized-actions-wrong-type.json'),
    );
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// 2. Call lifecycle
// ===========================================================================

describe('VoiceCallStartRequestSchema', () => {
  it('parses a valid request', () => {
    const result = VoiceCallStartRequestSchema.safeParse(loadValid('voice-call-start-request.json'));
    expect(result.success).toBe(true);
  });

  it('rejects when brief is missing', () => {
    const result = VoiceCallStartRequestSchema.safeParse(
      loadInvalid('voice-call-start-request-missing-brief.json'),
    );
    expect(result.success).toBe(false);
  });
});

describe('VoiceCallStartResponseSchema', () => {
  it('parses a valid response', () => {
    const result = VoiceCallStartResponseSchema.safeParse(
      loadValid('voice-call-start-response.json'),
    );
    expect(result.success).toBe(true);
  });

  it('rejects response missing conversation_id', () => {
    const result = VoiceCallStartResponseSchema.safeParse(
      loadInvalid('voice-call-start-response-missing-conversation-id.json'),
    );
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// 3. Tool surface + D-17 idempotency gate
// ===========================================================================

describe('VoiceToolNameSchema', () => {
  it('parses search_context (in 12-tool enum)', () => {
    expect(VoiceToolNameSchema.parse(loadValid('voice-tool-name.json'))).toBe('search_context');
  });

  it('rejects delete_everything (not in 12-tool enum)', () => {
    const result = VoiceToolNameSchema.safeParse(loadInvalid('voice-tool-name-unknown.json'));
    expect(result.success).toBe(false);
  });

  it('enum covers all 12 D-16 tools', () => {
    expect(VoiceToolNameSchema.options).toHaveLength(12);
  });
});

describe('MUTATING_VOICE_TOOLS Set (D-17)', () => {
  it('includes create_calendar_event', () => {
    expect(MUTATING_VOICE_TOOLS.has('create_calendar_event')).toBe(true);
  });

  it('excludes search_context (read-only)', () => {
    expect(MUTATING_VOICE_TOOLS.has('search_context')).toBe(false);
  });
});

describe('VoiceToolStatusSchema', () => {
  it('parses idempotency_replay', () => {
    expect(VoiceToolStatusSchema.parse(loadValid('voice-tool-status.json'))).toBe(
      'idempotency_replay',
    );
  });

  it('rejects pending (not in 5-status enum)', () => {
    const result = VoiceToolStatusSchema.safeParse(loadInvalid('voice-tool-status-unknown.json'));
    expect(result.success).toBe(false);
  });
});

describe('VoiceToolCallRequestSchema — D-17 idempotency gate', () => {
  it('parses a mutating request WITH idempotency_key', () => {
    const result = VoiceToolCallRequestSchema.safeParse(
      loadValid('voice-tool-call-request-mutating.json'),
    );
    expect(result.success).toBe(true);
  });

  it('parses a read-only request WITHOUT idempotency_key', () => {
    const result = VoiceToolCallRequestSchema.safeParse(
      loadValid('voice-tool-call-request-readonly.json'),
    );
    expect(result.success).toBe(true);
  });

  it('REJECTS a mutating request WITHOUT idempotency_key (D-17)', () => {
    const result = VoiceToolCallRequestSchema.safeParse(
      loadInvalid('voice-tool-call-request-missing-idempotency.json'),
    );
    expect(result.success).toBe(false);
    if (!result.success) {
      const hasIdempotencyIssue = result.error.issues.some((issue) =>
        issue.path.includes('idempotency_key'),
      );
      expect(hasIdempotencyIssue).toBe(true);
    }
  });
});

describe('VoiceToolCallResponseSchema', () => {
  it('parses success response', () => {
    const result = VoiceToolCallResponseSchema.safeParse(
      loadValid('voice-tool-call-response-success.json'),
    );
    expect(result.success).toBe(true);
  });

  it('parses invariant_rejected response', () => {
    const result = VoiceToolCallResponseSchema.safeParse(
      loadValid('voice-tool-call-response-error.json'),
    );
    expect(result.success).toBe(true);
  });

  it('rejects response with unknown status', () => {
    const result = VoiceToolCallResponseSchema.safeParse(
      loadInvalid('voice-tool-call-response-unknown-status.json'),
    );
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// 4. Calendar tool shapes (8 schemas)
// ===========================================================================

describe('Calendar tool schemas', () => {
  it('CalendarAvailabilityRequestSchema parses valid fixture', () => {
    expect(
      CalendarAvailabilityRequestSchema.safeParse(loadValid('calendar-availability-request.json'))
        .success,
    ).toBe(true);
  });

  it('CalendarAvailabilityRequestSchema rejects empty object', () => {
    expect(
      CalendarAvailabilityRequestSchema.safeParse(loadInvalid('calendar-availability-request-empty.json'))
        .success,
    ).toBe(false);
  });

  it('CalendarAvailabilityResponseSchema parses valid fixture', () => {
    expect(
      CalendarAvailabilityResponseSchema.safeParse(loadValid('calendar-availability-response.json'))
        .success,
    ).toBe(true);
  });

  it('CalendarAvailabilityResponseSchema rejects fixture missing slots', () => {
    expect(
      CalendarAvailabilityResponseSchema.safeParse(
        loadInvalid('calendar-availability-response-missing-slots.json'),
      ).success,
    ).toBe(false);
  });

  it('CalendarConflictRequestSchema parses valid fixture', () => {
    expect(
      CalendarConflictRequestSchema.safeParse(loadValid('calendar-conflict-request.json')).success,
    ).toBe(true);
  });

  it('CalendarConflictRequestSchema rejects empty timezone', () => {
    expect(
      CalendarConflictRequestSchema.safeParse(loadInvalid('calendar-conflict-request-bad-timezone.json'))
        .success,
    ).toBe(false);
  });

  it('CalendarConflictResponseSchema parses valid fixture', () => {
    expect(
      CalendarConflictResponseSchema.safeParse(loadValid('calendar-conflict-response.json')).success,
    ).toBe(true);
  });

  it('CalendarConflictResponseSchema rejects fixture missing has_conflict', () => {
    expect(
      CalendarConflictResponseSchema.safeParse(
        loadInvalid('calendar-conflict-response-missing-has-conflict.json'),
      ).success,
    ).toBe(false);
  });

  it('CalendarHoldRequestSchema parses valid fixture (D-17 idempotency present)', () => {
    expect(
      CalendarHoldRequestSchema.safeParse(loadValid('calendar-hold-request.json')).success,
    ).toBe(true);
  });

  it('CalendarHoldRequestSchema rejects fixture missing idempotency_key', () => {
    expect(
      CalendarHoldRequestSchema.safeParse(loadInvalid('calendar-hold-request-missing-idempotency.json'))
        .success,
    ).toBe(false);
  });

  it('CalendarHoldResponseSchema parses valid fixture (status=active)', () => {
    expect(
      CalendarHoldResponseSchema.safeParse(loadValid('calendar-hold-response.json')).success,
    ).toBe(true);
  });

  it('CalendarHoldResponseSchema rejects unknown status', () => {
    expect(
      CalendarHoldResponseSchema.safeParse(loadInvalid('calendar-hold-response-invalid-status.json'))
        .success,
    ).toBe(false);
  });

  it('CalendarHoldReleaseRequestSchema parses valid fixture', () => {
    expect(
      CalendarHoldReleaseRequestSchema.safeParse(loadValid('calendar-hold-release-request.json'))
        .success,
    ).toBe(true);
  });

  it('CalendarHoldReleaseRequestSchema rejects fixture missing hold_id', () => {
    expect(
      CalendarHoldReleaseRequestSchema.safeParse(
        loadInvalid('calendar-hold-release-request-missing-hold-id.json'),
      ).success,
    ).toBe(false);
  });

  it('CalendarHoldReleaseResponseSchema parses valid fixture', () => {
    expect(
      CalendarHoldReleaseResponseSchema.safeParse(loadValid('calendar-hold-release-response.json'))
        .success,
    ).toBe(true);
  });

  it('CalendarHoldReleaseResponseSchema rejects status=promoted (not in release enum)', () => {
    expect(
      CalendarHoldReleaseResponseSchema.safeParse(
        loadInvalid('calendar-hold-release-response-invalid-status.json'),
      ).success,
    ).toBe(false);
  });
});

// ===========================================================================
// 5. ElevenLabs lenient event schemas (external provider — passthrough)
// ===========================================================================

describe('ElevenLabsWebhookEventTypeSchema', () => {
  it('parses post_call_transcription', () => {
    expect(ElevenLabsWebhookEventTypeSchema.parse(loadValid('elevenlabs-webhook-event-type.json')))
      .toBe('post_call_transcription');
  });

  it('rejects post_call_unknown_event', () => {
    const result = ElevenLabsWebhookEventTypeSchema.safeParse(
      loadInvalid('elevenlabs-webhook-event-type-unknown.json'),
    );
    expect(result.success).toBe(false);
  });

  it('enum has exactly 3 values (D-05)', () => {
    expect(ElevenLabsWebhookEventTypeSchema.options).toHaveLength(3);
  });
});

describe('ElevenLabs event schemas are LENIENT (passthrough + unknown-tolerant)', () => {
  it('ElevenLabsPostCallTranscriptionEventSchema parses valid fixture with unknown extra fields', () => {
    const result = ElevenLabsPostCallTranscriptionEventSchema.safeParse(
      loadValid('elevenlabs-post-call-transcription.json'),
    );
    expect(result.success).toBe(true);
  });

  it('ElevenLabsPostCallAudioEventSchema parses valid fixture + passthrough extra_provider_field', () => {
    const result = ElevenLabsPostCallAudioEventSchema.safeParse(
      loadValid('elevenlabs-post-call-audio.json'),
    );
    expect(result.success).toBe(true);
  });

  it('ElevenLabsCallInitiationFailureEventSchema parses valid fixture', () => {
    const result = ElevenLabsCallInitiationFailureEventSchema.safeParse(
      loadValid('elevenlabs-call-initiation-failure.json'),
    );
    expect(result.success).toBe(true);
  });

  it('ElevenLabsPostCallTranscriptionEventSchema rejects wrong type literal', () => {
    const result = ElevenLabsPostCallTranscriptionEventSchema.safeParse(
      loadInvalid('elevenlabs-post-call-transcription-wrong-type.json'),
    );
    expect(result.success).toBe(false);
  });

  it('ElevenLabsPostCallAudioEventSchema rejects wrong type literal', () => {
    const result = ElevenLabsPostCallAudioEventSchema.safeParse(
      loadInvalid('elevenlabs-post-call-audio-wrong-type.json'),
    );
    expect(result.success).toBe(false);
  });

  it('ElevenLabsCallInitiationFailureEventSchema rejects wrong type literal', () => {
    const result = ElevenLabsCallInitiationFailureEventSchema.safeParse(
      loadInvalid('elevenlabs-call-initiation-failure-wrong-type.json'),
    );
    expect(result.success).toBe(false);
  });

  it('LENIENT proof — accepts arbitrary nested data.* shape', () => {
    const result = ElevenLabsPostCallTranscriptionEventSchema.safeParse({
      type: 'post_call_transcription',
      data: { literally_anything: [1, 2, 3], even_null: null },
    });
    expect(result.success).toBe(true);
  });
});

// ===========================================================================
// 6. Forge normalized event schema — STRICT (internal X9↔Forge boundary)
// ===========================================================================

describe('ForgeVoiceWebhookNormalizedEventSchema (STRICT)', () => {
  it('parses valid fixture (all required fields + signature_valid=true)', () => {
    const result = ForgeVoiceWebhookNormalizedEventSchema.safeParse(
      loadValid('forge-voice-webhook-normalized-event.json'),
    );
    expect(result.success).toBe(true);
  });

  it('REJECTS when agent_id is missing', () => {
    const result = ForgeVoiceWebhookNormalizedEventSchema.safeParse(
      loadInvalid('forge-normalized-missing-agent-id.json'),
    );
    expect(result.success).toBe(false);
  });

  it('REJECTS signature_valid=false (D-06 no-fallback)', () => {
    const result = ForgeVoiceWebhookNormalizedEventSchema.safeParse(
      loadInvalid('forge-normalized-signature-false.json'),
    );
    expect(result.success).toBe(false);
  });
});

// ===========================================================================
// 7. cap-voice ingest + memory handoff + tool log + outcome + privacy
// ===========================================================================

describe('CapVoicePostCallIngestRequestSchema', () => {
  it('parses valid fixture', () => {
    expect(
      CapVoicePostCallIngestRequestSchema.safeParse(
        loadValid('cap-voice-post-call-ingest-request.json'),
      ).success,
    ).toBe(true);
  });

  it('rejects fixture with no normalized_event', () => {
    expect(
      CapVoicePostCallIngestRequestSchema.safeParse(
        loadInvalid('cap-voice-post-call-ingest-request-missing-normalized.json'),
      ).success,
    ).toBe(false);
  });
});

describe('CapVoicePostCallIngestResponseSchema', () => {
  it('parses valid fixture (status=processed)', () => {
    expect(
      CapVoicePostCallIngestResponseSchema.safeParse(
        loadValid('cap-voice-post-call-ingest-response.json'),
      ).success,
    ).toBe(true);
  });

  it('rejects unknown status', () => {
    expect(
      CapVoicePostCallIngestResponseSchema.safeParse(
        loadInvalid('cap-voice-post-call-ingest-response-unknown-status.json'),
      ).success,
    ).toBe(false);
  });
});

describe('VoiceCallOutcomeSchema (16 fields per ADR §14.2)', () => {
  it('parses valid fixture', () => {
    expect(VoiceCallOutcomeSchema.safeParse(loadValid('voice-call-outcome.json')).success).toBe(
      true,
    );
  });

  it('rejects unknown recipient_sentiment', () => {
    expect(
      VoiceCallOutcomeSchema.safeParse(loadInvalid('voice-call-outcome-unknown-sentiment.json'))
        .success,
    ).toBe(false);
  });
});

describe('VoiceCallToolLogSchema', () => {
  it('parses valid fixture', () => {
    expect(
      VoiceCallToolLogSchema.safeParse(loadValid('voice-call-tool-log.json')).success,
    ).toBe(true);
  });

  it('rejects unknown tool name', () => {
    expect(
      VoiceCallToolLogSchema.safeParse(loadInvalid('voice-call-tool-log-invalid-tool.json')).success,
    ).toBe(false);
  });
});

describe('VoiceCallMemoryIngestPayloadSchema (D-21 CONTRACT-ONLY STUB)', () => {
  it('parses valid fixture with source_type=voice_call', () => {
    expect(
      VoiceCallMemoryIngestPayloadSchema.safeParse(
        loadValid('voice-call-memory-ingest-payload.json'),
      ).success,
    ).toBe(true);
  });

  it('REJECTS fixture with source_type=chat_message (literal discriminator)', () => {
    expect(
      VoiceCallMemoryIngestPayloadSchema.safeParse(
        loadInvalid('memory-payload-wrong-source-type.json'),
      ).success,
    ).toBe(false);
  });
});

describe('VoicePrivacyMetadataSchema', () => {
  it('parses valid fixture (privacy_level=standard)', () => {
    expect(
      VoicePrivacyMetadataSchema.safeParse(loadValid('voice-privacy-metadata.json')).success,
    ).toBe(true);
  });

  it('rejects invalid privacy_level', () => {
    expect(
      VoicePrivacyMetadataSchema.safeParse(loadInvalid('voice-privacy-metadata-invalid-level.json'))
        .success,
    ).toBe(false);
  });

  it('defaults audio_retention_allowed to FALSE (D-26)', () => {
    const parsed = VoicePrivacyMetadataSchema.parse({
      third_party: true,
      source_type: 'voice_call',
      privacy_level: 'standard',
    });
    expect(parsed.audio_retention_allowed).toBe(false);
  });
});
