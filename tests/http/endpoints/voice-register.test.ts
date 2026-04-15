import { describe, it, expect } from 'vitest';
import {
  VoiceRegisterRequestSchema,
  VoiceRegisterResponseSchema,
  VoiceRegisterErrorResponseSchema,
  voiceRegisterContract,
} from '../../../src/http/endpoints/voice-register.js';

// Real fixture from voice-svc registerBodySchema (forge-v2 services/voice/src/routes/voice.ts:23-26)
const validRequest = { agentId: '1', conversationId: 'conv-abc-123' };

describe('VoiceRegisterRequestSchema', () => {
  it('parses a valid request (real fixture)', () => {
    const result = VoiceRegisterRequestSchema.parse(validRequest);
    expect(result.agentId).toBe('1');
    expect(result.conversationId).toBe('conv-abc-123');
  });

  it('rejects empty agentId', () => {
    expect(() =>
      VoiceRegisterRequestSchema.parse({ agentId: '', conversationId: 'c' }),
    ).toThrow();
  });

  it('rejects empty conversationId', () => {
    expect(() =>
      VoiceRegisterRequestSchema.parse({ agentId: '1', conversationId: '' }),
    ).toThrow();
  });

  it('rejects missing fields', () => {
    expect(() => VoiceRegisterRequestSchema.parse({ agentId: '1' })).toThrow();
    expect(() => VoiceRegisterRequestSchema.parse({ conversationId: 'c' })).toThrow();
  });
});

describe('VoiceRegisterResponseSchema', () => {
  it('parses { ok: true }', () => {
    const result = VoiceRegisterResponseSchema.parse({ ok: true });
    expect(result.ok).toBe(true);
  });

  it('rejects ok: false', () => {
    expect(() => VoiceRegisterResponseSchema.parse({ ok: false })).toThrow();
  });
});

describe('VoiceRegisterErrorResponseSchema', () => {
  it('parses a VOICE-02 duplicate error', () => {
    const result = VoiceRegisterErrorResponseSchema.parse({
      ok: false,
      error: 'VOICE-02: Duplicate registration',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('VOICE-02');
  });

  it('rejects ok: true', () => {
    expect(() => VoiceRegisterErrorResponseSchema.parse({ ok: true, error: 'x' })).toThrow();
  });
});

describe('voiceRegisterContract (X9 -> Forge, only outbound endpoint)', () => {
  it('declares POST /api/voice/register with token auth', () => {
    expect(voiceRegisterContract.method).toBe('POST');
    expect(voiceRegisterContract.path).toBe('/api/voice/register');
    expect(voiceRegisterContract.authType).toBe('token');
  });
});
