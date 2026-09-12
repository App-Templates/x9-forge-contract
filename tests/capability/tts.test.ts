import { describe, it, expect } from 'vitest';
import {
  TtsProviderSchema,
  DEFAULT_TTS_PROVIDER,
  OPENAI_TTS_DEFAULT_MODEL,
  OPENAI_TTS_DEFAULT_VOICE,
} from '../../src/capability/tts/index.js';
import {
  TranscribeProviderSchema,
  DEFAULT_STT_PRIMARY_PROVIDER,
  OPENAI_STT_DEFAULT_MODEL,
} from '../../src/capability/stt/index.js';

describe('Phase 50 — capability/tts provider lane', () => {
  it('accepts exactly the two providers', () => {
    expect(TtsProviderSchema.parse('elevenlabs')).toBe('elevenlabs');
    expect(TtsProviderSchema.parse('openai')).toBe('openai');
    expect(() => TtsProviderSchema.parse('azure')).toThrow();
    expect(() => TtsProviderSchema.parse('')).toThrow();
  });

  it('default lane is elevenlabs (zero behaviour change on rollout)', () => {
    expect(DEFAULT_TTS_PROVIDER).toBe('elevenlabs');
    expect(TtsProviderSchema.parse(DEFAULT_TTS_PROVIDER)).toBe('elevenlabs');
  });

  it('OpenAI defaults match the documented model + recommended voice', () => {
    expect(OPENAI_TTS_DEFAULT_MODEL).toBe('gpt-4o-mini-tts');
    expect(OPENAI_TTS_DEFAULT_VOICE).toBe('marin');
  });
});

describe('Phase 50 — capability/stt primary-provider lane', () => {
  it('default primary is elevenlabs and is a valid TranscribeProvider', () => {
    expect(DEFAULT_STT_PRIMARY_PROVIDER).toBe('elevenlabs');
    expect(TranscribeProviderSchema.parse(DEFAULT_STT_PRIMARY_PROVIDER)).toBe('elevenlabs');
  });

  it('OpenAI primary model is gpt-transcribe', () => {
    expect(OPENAI_STT_DEFAULT_MODEL).toBe('gpt-transcribe');
  });
});
