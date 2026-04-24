import { describe, it, expect } from 'vitest';
import {
  VoiceCallBriefSchema,
  VoiceCallIntentSchema,
  VOICE_CALL_INTENTS,
  VoiceCallProvenanceEntrySchema,
  VoicePrepareCallRequestSchema,
  VoicePrepareCallResponseSchema,
} from '../../../src/capability/voice/index.js';
import {
  CAP_VOICE_PREPARE_CALL_PATH,
  CAP_VOICE_PREPARE_CALL_METHOD,
} from '../../../src/http/endpoints/voice.js';

/**
 * M46 Phase 46.0 Plan 02 — origination contracts tests.
 *
 * Covers VORIG-01 (intent enum), VORIG-02 (prepare-call request/response +
 * provenance entry). VORIG-03 (brief additive fields) and VORIG-04
 * (endpoint constants) are covered in additional describe blocks appended
 * by Plan 02 Task 2.
 */

// ---------------------------------------------------------------------------
// VORIG-01 — VoiceCallIntentSchema
// ---------------------------------------------------------------------------

describe('VoiceCallIntentSchema (VORIG-01)', () => {
  const INTENT_VALUES = [
    'reminder',
    'information',
    'sales',
    'legal',
    'logistics',
    'social',
    'other',
  ] as const;

  it('accepts all 7 declared intent values', () => {
    for (const v of INTENT_VALUES) {
      expect(VoiceCallIntentSchema.safeParse(v).success).toBe(true);
    }
  });

  it('rejects unknown and case-variant values', () => {
    expect(VoiceCallIntentSchema.safeParse('marketing').success).toBe(false);
    expect(VoiceCallIntentSchema.safeParse('').success).toBe(false);
    expect(VoiceCallIntentSchema.safeParse('REMINDER').success).toBe(false);
  });

  it('VOICE_CALL_INTENTS preserves declared order', () => {
    expect([...VOICE_CALL_INTENTS]).toEqual([...INTENT_VALUES]);
  });

  it('VOICE_CALL_INTENTS has exactly 7 entries', () => {
    expect(VOICE_CALL_INTENTS.length).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// VORIG-02 — VoiceCallProvenanceEntrySchema
// ---------------------------------------------------------------------------

describe('VoiceCallProvenanceEntrySchema (VORIG-02 / D-03)', () => {
  it('accepts minimal shape with only source', () => {
    expect(
      VoiceCallProvenanceEntrySchema.safeParse({ source: 'strategic_file' }).success,
    ).toBe(true);
  });

  it('accepts full shape with all optional fields', () => {
    expect(
      VoiceCallProvenanceEntrySchema.safeParse({
        source: 'memory_v2',
        ref_id: 'm-42',
        summary: 'prev call notes',
        timestamp: '2026-04-24T10:00:00+02:00',
      }).success,
    ).toBe(true);
  });

  it('rejects empty source', () => {
    expect(VoiceCallProvenanceEntrySchema.safeParse({ source: '' }).success).toBe(false);
  });

  it('enforces summary max 500 chars', () => {
    const long = 'x'.repeat(501);
    expect(
      VoiceCallProvenanceEntrySchema.safeParse({ source: 's', summary: long }).success,
    ).toBe(false);
  });

  it('accepts summary at exactly 500 chars (boundary)', () => {
    const exact = 'x'.repeat(500);
    expect(
      VoiceCallProvenanceEntrySchema.safeParse({ source: 's', summary: exact }).success,
    ).toBe(true);
  });

  it('rejects non-datetime timestamp', () => {
    expect(
      VoiceCallProvenanceEntrySchema.safeParse({
        source: 's',
        timestamp: 'not-a-date',
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VORIG-02 — VoicePrepareCallRequestSchema
// ---------------------------------------------------------------------------

describe('VoicePrepareCallRequestSchema (VORIG-02)', () => {
  it('accepts minimal valid request', () => {
    expect(
      VoicePrepareCallRequestSchema.safeParse({
        call_id: 'c1',
        raw_instruction: 'chiama Marco',
      }).success,
    ).toBe(true);
  });

  it('accepts request with optional requested_contact', () => {
    expect(
      VoicePrepareCallRequestSchema.safeParse({
        call_id: 'c1',
        raw_instruction: 'chiama Marco',
        requested_contact: 'Marco Rossi',
      }).success,
    ).toBe(true);
  });

  it('rejects missing call_id', () => {
    expect(VoicePrepareCallRequestSchema.safeParse({ raw_instruction: 'x' }).success).toBe(
      false,
    );
  });

  it('rejects missing raw_instruction', () => {
    expect(VoicePrepareCallRequestSchema.safeParse({ call_id: 'c1' }).success).toBe(false);
  });

  it('rejects empty call_id', () => {
    expect(
      VoicePrepareCallRequestSchema.safeParse({ call_id: '', raw_instruction: 'x' }).success,
    ).toBe(false);
  });

  it('rejects empty raw_instruction', () => {
    expect(
      VoicePrepareCallRequestSchema.safeParse({ call_id: 'c1', raw_instruction: '' }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VORIG-02 — VoicePrepareCallResponseSchema
// ---------------------------------------------------------------------------

describe('VoicePrepareCallResponseSchema (VORIG-02)', () => {
  // Minimal VoiceCallBrief — only required fields. timezone + constraints
  // receive Zod defaults on parse.
  const minimalBrief = {
    call_id: 'c1',
    agent_id: '1',
    owner_id: 'o1',
    call_goal_short: 'remind',
    recipient_name: 'Marco',
    recipient_context: '',
  };

  // AuthorizedActionsSchema has defaults for every field, so {} is valid
  // — Zod coerces it to the full defaults object (6 TRUE read-only flags,
  // 11 FALSE mutating flags).
  const minimalAuthActions = {};

  const minimalValidResponse = {
    brief: minimalBrief,
    authorized_actions: minimalAuthActions,
    intent: 'reminder' as const,
    provenance: [{ source: 'strategic_file' }],
  };

  it('accepts minimal valid response with brief + authorized_actions + intent + provenance', () => {
    const result = VoicePrepareCallResponseSchema.safeParse(minimalValidResponse);
    expect(result.success).toBe(true);
  });

  it('accepts response with optional intent_confidence + preview_markdown', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        intent_confidence: 0.85,
        preview_markdown: '**Marco**\nRemind about meeting',
      }).success,
    ).toBe(true);
  });

  it('rejects intent_confidence > 1', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        intent_confidence: 1.5,
      }).success,
    ).toBe(false);
  });

  it('rejects intent_confidence < 0', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        intent_confidence: -0.1,
      }).success,
    ).toBe(false);
  });

  it('rejects intent outside enum', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        intent: 'marketing',
      }).success,
    ).toBe(false);
  });

  it('rejects missing provenance array', () => {
    const { provenance, ...withoutProvenance } = minimalValidResponse;
    void provenance;
    expect(VoicePrepareCallResponseSchema.safeParse(withoutProvenance).success).toBe(false);
  });

  it('accepts empty provenance array (edge case for legacy compose)', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        provenance: [],
      }).success,
    ).toBe(true);
  });

  it('rejects provenance entry with empty source', () => {
    expect(
      VoicePrepareCallResponseSchema.safeParse({
        ...minimalValidResponse,
        provenance: [{ source: '' }],
      }).success,
    ).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VORIG-03 — VoiceCallBriefSchema backward-compat + additive fields
// ---------------------------------------------------------------------------

describe('VoiceCallBriefSchema backward compat (VORIG-03)', () => {
  const legacyBrief = {
    call_id: 'c1',
    agent_id: '1',
    owner_id: 'o1',
    call_goal_short: 'Remind about meeting',
    recipient_name: 'Marco',
    recipient_context: 'Works at ACME',
    recipient_email: 'marco@acme.it',
  };

  it('parses existing brief without any M46 fields (non-breaking)', () => {
    const result = VoiceCallBriefSchema.safeParse(legacyBrief);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.intent).toBeUndefined();
      expect(result.data.memory_context).toBeUndefined();
      expect(result.data.relationship_context).toBeUndefined();
      expect(result.data.provenance).toBeUndefined();
    }
  });

  it('parses brief with all 4 M46 optional fields', () => {
    const full = {
      ...legacyBrief,
      intent: 'reminder',
      memory_context: 'Previous call went well',
      relationship_context: 'Close friend since 2020',
      provenance: [
        { source: 'strategic_file' },
        { source: 'memory_v2', ref_id: 'm-1' },
      ],
    };
    expect(VoiceCallBriefSchema.safeParse(full).success).toBe(true);
  });

  it('rejects intent outside VoiceCallIntentSchema enum', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...legacyBrief, intent: 'marketing' }).success,
    ).toBe(false);
  });
});

describe('VoiceCallBriefSchema bounds (VORIG-03)', () => {
  const base = {
    call_id: 'c1',
    agent_id: '1',
    owner_id: 'o1',
    call_goal_short: 'x',
    recipient_name: 'M',
    recipient_context: '',
  };

  it('accepts memory_context at 2000 chars', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, memory_context: 'x'.repeat(2000) }).success,
    ).toBe(true);
  });

  it('rejects memory_context at 2001 chars', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, memory_context: 'x'.repeat(2001) }).success,
    ).toBe(false);
  });

  it('accepts relationship_context at 500 chars', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, relationship_context: 'x'.repeat(500) })
        .success,
    ).toBe(true);
  });

  it('rejects relationship_context at 501 chars', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, relationship_context: 'x'.repeat(501) })
        .success,
    ).toBe(false);
  });

  it('accepts provenance array with valid entries', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, provenance: [{ source: 'cap_contacts' }] })
        .success,
    ).toBe(true);
  });

  it('rejects provenance entry with empty source', () => {
    expect(
      VoiceCallBriefSchema.safeParse({ ...base, provenance: [{ source: '' }] }).success,
    ).toBe(false);
  });

  it('accepts brief with all 7 valid intent values', () => {
    for (const intent of VOICE_CALL_INTENTS) {
      expect(VoiceCallBriefSchema.safeParse({ ...base, intent }).success).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// VORIG-04 — CAP_VOICE_PREPARE_CALL_PATH + METHOD endpoint constants
// ---------------------------------------------------------------------------

describe('CAP_VOICE_PREPARE_CALL_PATH + METHOD (VORIG-04)', () => {
  it('path equals /call/voice_prepare_call', () => {
    expect(CAP_VOICE_PREPARE_CALL_PATH).toBe('/call/voice_prepare_call');
  });

  it('method is POST', () => {
    expect(CAP_VOICE_PREPARE_CALL_METHOD).toBe('POST');
  });

  it('path is readonly `as const` literal type', () => {
    // TypeScript-level check: the constant's value is structurally equal
    // to the literal. Runtime equality guards against future accidental
    // mutation (TypeScript would catch it at compile time).
    const expected: '/call/voice_prepare_call' = '/call/voice_prepare_call';
    expect(CAP_VOICE_PREPARE_CALL_PATH).toBe(expected);
  });
});
