import { describe, it, expect } from 'vitest';
import {
  TranscribeRequestSchema,
  TranscribeResponseSchema,
  SttProviderEnum,
} from '../schema.js';

describe('TranscribeRequestSchema', () => {
  it('Test 1: accepts valid transcribe request', () => {
    const result = TranscribeRequestSchema.safeParse({
      telegramFileUrl: 'https://api.telegram.org/file/bot123/voice.ogg',
      durationSec: 20,
      mimeType: 'audio/ogg',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.telegramFileUrl).toBe(
        'https://api.telegram.org/file/bot123/voice.ogg'
      );
      expect(result.data.durationSec).toBe(20);
      expect(result.data.mimeType).toBe('audio/ogg');
    }
  });

  it('Test 2: rejects empty object (missing required telegramFileUrl)', () => {
    const result = TranscribeRequestSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path.join('.'));
      expect(fields).toContain('telegramFileUrl');
    }
  });
});

describe('TranscribeResponseSchema', () => {
  it('Test 3: accepts valid response with all fields', () => {
    const result = TranscribeResponseSchema.safeParse({
      text: 'ciao',
      language: 'it',
      durationSec: 20,
      provider: 'elevenlabs',
      confidence: 0.92,
    });
    expect(result.success).toBe(true);
  });

  it('Test 3b: rejects invalid provider', () => {
    const result = TranscribeResponseSchema.safeParse({
      text: 'ciao',
      language: 'it',
      durationSec: 20,
      provider: 'gibberish',
    });
    expect(result.success).toBe(false);
  });
});

describe('SttProviderEnum', () => {
  it('Test 4: options deep-equals ordered fallback chain', () => {
    expect(SttProviderEnum.options).toEqual(['elevenlabs', 'openai']);
  });
});
