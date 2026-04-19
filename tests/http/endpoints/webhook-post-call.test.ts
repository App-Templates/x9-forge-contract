import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PostCallPayloadSchema,
  PostCallResponseSchema,
  PostCallErrorResponseSchema,
  TranscriptTurnSchema,
  webhookPostCallContract,
} from '../../../src/http/endpoints/webhook-post-call.js';

// Bug #15 context — see .planning/phases/03-*/03-RESEARCH.md

// Real fixture from ElevenLabs post-call webhook (cap-voice post-call.ts:41-64)
// — Forge-forwarded shape (flat fields + agentId appended by voice-svc:112)
const forgeForwardedFixture = {
  type: 'post_call_transcription',
  status: 'done',
  conversation_id: 'conv-abc-123',
  transcript: 'Ciao, come stai?',
  analysis: { transcript_summary: 'Short greeting call' },
  dynamic_variables: { contact_name: 'Marco' },
  agentId: '1',
};

// Alternative ElevenLabs direct shape — fields nested under data.*
const nestedDataFixture = {
  type: 'post_call_transcription',
  data: {
    status: 'done',
    conversation_id: 'conv-xyz-789',
    transcript: 'Chiamata di lavoro...',
    analysis: { transcript_summary: 'Work call recap' },
    dynamic_variables: { contact_name: 'Luca' },
  },
};

describe('PostCallPayloadSchema', () => {
  it('parses the Forge-forwarded (flat) shape', () => {
    const result = PostCallPayloadSchema.parse(forgeForwardedFixture);
    expect(result.conversation_id).toBe('conv-abc-123');
    expect(result.agentId).toBe('1');
    expect(result.analysis?.transcript_summary).toBe('Short greeting call');
  });

  it('parses the ElevenLabs direct (data.*) shape', () => {
    const result = PostCallPayloadSchema.parse(nestedDataFixture);
    expect(result.data?.conversation_id).toBe('conv-xyz-789');
    expect(result.data?.analysis?.transcript_summary).toBe('Work call recap');
  });

  it('parses a minimal payload (all fields optional)', () => {
    const result = PostCallPayloadSchema.parse({});
    expect(result).toBeDefined();
  });

  it('preserves unknown fields via passthrough', () => {
    const payload: Record<string, unknown> = {
      conversation_id: 'conv-1',
      extra_field: 'preserved',
    };
    const result = PostCallPayloadSchema.parse(payload) as Record<string, unknown>;
    expect(result.extra_field).toBe('preserved');
  });

  it('rejects conversation_id when it is not a string', () => {
    expect(() => PostCallPayloadSchema.parse({ conversation_id: 123 })).toThrow();
  });

  // ---------------------------------------------------------------------------
  // 2026-04-19 regression — ElevenLabs started sending data.transcript as an
  // array of TranscriptTurn objects. The old z.string().optional() schema
  // failed these payloads and cap-voice returned HTTP 400 for every post-call
  // webhook, killing Telegram recap delivery. Transcript is now z.unknown()
  // in both root and data.* positions; consumers normalise at the boundary.
  // ---------------------------------------------------------------------------
  it('accepts transcript as array of turn objects (2026-04-19 regression)', () => {
    const payload = {
      type: 'post_call_transcription',
      status: 'done',
      conversation_id: 'conv-array-001',
      data: {
        status: 'done',
        conversation_id: 'conv-array-001',
        transcript: [
          { role: 'agent', message: 'Pronto' },
          { role: 'user', message: 'Ciao' },
        ],
        analysis: { transcript_summary: 'Greeting' },
      },
    };
    const result = PostCallPayloadSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it('accepts transcript as string in both root and data.* positions', () => {
    const rootString = PostCallPayloadSchema.safeParse({
      type: 'post_call_transcription',
      status: 'done',
      conversation_id: 'conv-str-root',
      transcript: 'Plain root string transcript',
    });
    const dataString = PostCallPayloadSchema.safeParse({
      type: 'post_call_transcription',
      data: {
        status: 'done',
        conversation_id: 'conv-str-nested',
        transcript: 'Plain nested string transcript',
      },
    });
    expect(rootString.success).toBe(true);
    expect(dataString.success).toBe(true);
  });

  it('accepts transcript as undefined (optional)', () => {
    const result = PostCallPayloadSchema.safeParse({
      type: 'post_call_transcription',
      status: 'done',
      conversation_id: 'conv-no-transcript',
    });
    expect(result.success).toBe(true);
  });
});

describe('TranscriptTurnSchema', () => {
  it('parses a minimal turn with just role', () => {
    const result = TranscriptTurnSchema.parse({ role: 'user' });
    expect(result.role).toBe('user');
  });

  it('parses a full turn with role, message, time_in_call_secs', () => {
    const result = TranscriptTurnSchema.parse({
      role: 'agent',
      message: 'hi',
      time_in_call_secs: 1.2,
    });
    expect(result.role).toBe('agent');
    expect(result.message).toBe('hi');
    expect(result.time_in_call_secs).toBe(1.2);
  });

  it('preserves unknown fields via passthrough', () => {
    const result = TranscriptTurnSchema.parse({ role: 'user', extra_field: 1 }) as Record<
      string,
      unknown
    >;
    expect(result.extra_field).toBe(1);
  });

  it('rejects a turn missing the required role field', () => {
    expect(() => TranscriptTurnSchema.parse({ message: 'x' })).toThrow();
  });
});

describe('golden fixtures — tests/fixtures/elevenlabs-post-call/*.json', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const fixturesDir = resolve(here, '../../fixtures/elevenlabs-post-call');

  const loadFixture = (name: string): unknown => {
    const raw = readFileSync(resolve(fixturesDir, name), 'utf-8');
    return JSON.parse(raw);
  };

  it('01-root-flat-string-transcript.json parses', () => {
    const fixture = loadFixture('01-root-flat-string-transcript.json');
    const result = PostCallPayloadSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it('02-data-nested-string-transcript.json parses', () => {
    const fixture = loadFixture('02-data-nested-string-transcript.json');
    const result = PostCallPayloadSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  // REGRESSION LOCK — 2026-04-19 cap-voice 400 on data.transcript array
  it('03-data-nested-array-transcript.json parses (REGRESSION LOCK)', () => {
    const fixture = loadFixture('03-data-nested-array-transcript.json');
    const result = PostCallPayloadSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });

  it('04-missing-optional-fields.json parses', () => {
    const fixture = loadFixture('04-missing-optional-fields.json');
    const result = PostCallPayloadSchema.safeParse(fixture);
    expect(result.success).toBe(true);
  });
});

describe('PostCallResponseSchema', () => {
  it('parses { received: true }', () => {
    const result = PostCallResponseSchema.parse({ received: true });
    expect(result.received).toBe(true);
  });

  it('rejects received: false', () => {
    expect(() => PostCallResponseSchema.parse({ received: false })).toThrow();
  });
});

describe('PostCallErrorResponseSchema', () => {
  it('parses an error response', () => {
    const result = PostCallErrorResponseSchema.parse({ error: 'AUTH_FAILED' });
    expect(result.error).toBe('AUTH_FAILED');
  });
});

describe('webhookPostCallContract', () => {
  it('declares POST /webhook/post-call with token auth (Bug #15 fix)', () => {
    expect(webhookPostCallContract.method).toBe('POST');
    expect(webhookPostCallContract.path).toBe('/webhook/post-call');
    expect(webhookPostCallContract.authType).toBe('token');
  });
});
