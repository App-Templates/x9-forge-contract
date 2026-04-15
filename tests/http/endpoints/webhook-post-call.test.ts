import { describe, it, expect } from 'vitest';
import {
  PostCallPayloadSchema,
  PostCallResponseSchema,
  PostCallErrorResponseSchema,
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
