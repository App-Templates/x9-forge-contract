import { describe, expect, it } from 'vitest';
import {
  CAP_STT_DEFAULT_PORT,
  DEFAULT_STT_PRIMARY_PROVIDER,
  OPENAI_STT_DEFAULT_MODEL,
  STT_MEDIA_MAX_DURATION_SEC,
  TranscribeMediaRequestSchema,
  TranscribeMediaUrlSchema,
  TranscribeProviderSchema,
  TranscribeRequestSchema,
  TranscribeResponseSchema,
  parseTranscribeInput,
} from '../../src/capability/stt/index';

const telegramRequest = {
  telegramFileUrl: 'https://api.telegram.org/file/bot/x.oga',
  durationSec: 60,
};
const mediaRequest = {
  mediaUrl: 'https://scontent.cdninstagram.com/v/reel.mp4',
  durationSec: 600,
};

describe('STT media input', () => {
  it('preserves the Telegram request and its 60-second limit', () => {
    expect(TranscribeRequestSchema.parse(telegramRequest)).toEqual(telegramRequest);
    expect(parseTranscribeInput(telegramRequest)).toEqual({
      ok: true, kind: 'telegram', request: telegramRequest,
    });
    const tooLong = { ...telegramRequest, durationSec: 61 };
    expect(TranscribeRequestSchema.safeParse(tooLong).success).toBe(false);
    expect(parseTranscribeInput(tooLong)).toEqual({
      ok: false, error: 'invalid_transcribe_input',
    });
  });

  it('preserves the existing Telegram handling of MIME hints and extra fields', () => {
    const raw = { ...telegramRequest, mimeType: 'audio/ogg', extra: 'legacy' };
    const request = { ...telegramRequest, mimeType: 'audio/ogg' };
    expect(TranscribeRequestSchema.parse(raw)).toEqual(request);
    expect(parseTranscribeInput(raw)).toEqual({ ok: true, kind: 'telegram', request });
  });

  it('accepts a media video up to 600 seconds with the same request', () => {
    expect(STT_MEDIA_MAX_DURATION_SEC).toBe(600);
    expect(TranscribeMediaUrlSchema.parse(mediaRequest.mediaUrl)).toBe(mediaRequest.mediaUrl);
    expect(TranscribeMediaRequestSchema.parse(mediaRequest)).toEqual(mediaRequest);
    expect(parseTranscribeInput(mediaRequest)).toEqual({
      ok: true, kind: 'media', request: mediaRequest,
    });
  });

  it('accepts zero duration, an optional MIME type and a lowercase language hint', () => {
    const request = {
      ...mediaRequest, durationSec: 0, mimeType: 'video/mp4', languageHint: 'it',
    };
    expect(TranscribeMediaRequestSchema.parse(request)).toEqual(request);
    expect(parseTranscribeInput(request)).toEqual({ ok: true, kind: 'media', request });
  });

  it('keeps signed queries intact and accepts URLs at the length limit', () => {
    const prefix = `${mediaRequest.mediaUrl}?signature=`;
    const mediaUrl = prefix + 'a'.repeat(2000 - prefix.length);
    const request = { ...mediaRequest, mediaUrl };
    expect(TranscribeMediaUrlSchema.parse(mediaUrl)).toBe(mediaUrl);
    expect(parseTranscribeInput(request)).toEqual({ ok: true, kind: 'media', request });
  });

  it.each([601, -1, 1.5])('rejects invalid media duration %s', durationSec => {
    const raw = { ...mediaRequest, durationSec };
    expect(TranscribeMediaRequestSchema.safeParse(raw).success).toBe(false);
    expect(parseTranscribeInput(raw)).toEqual({ ok: false, error: 'invalid_transcribe_input' });
  });

  it.each([
    'http://scontent.cdninstagram.com/v/reel.mp4',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'https://user:pw@host/x.mp4',
    'https://user@host/x.mp4',
    'https://:pw@host/x.mp4',
    'https://host/x.mp4#t=3',
    'https://host/x.mp4#',
    'https://host/' + 'a'.repeat(2001 - 'https://host/'.length),
    'not a URL',
    '',
  ])('rejects invalid media URL %s', mediaUrl => {
    expect(TranscribeMediaUrlSchema.safeParse(mediaUrl).success).toBe(false);
    expect(TranscribeMediaRequestSchema.safeParse({ ...mediaRequest, mediaUrl }).success).toBe(false);
    expect(parseTranscribeInput({ ...mediaRequest, mediaUrl })).toEqual({
      ok: false, error: 'invalid_transcribe_input',
    });
  });

  it.each([
    { languageHint: 'ITA' },
    { languageHint: 'IT' },
    { languageHint: 'i' },
    { languageHint: 'ita' },
    { languageHint: 'i1' },
    { mimeType: '' },
    { unknown: true },
    { tenantId: 'tenant' },
    { ownerId: 'owner' },
    { agentId: 'agent' },
  ])('rejects invalid media fields %j', fields => {
    const raw = { ...mediaRequest, ...fields };
    expect(TranscribeMediaRequestSchema.safeParse(raw).success).toBe(false);
    expect(parseTranscribeInput(raw)).toEqual({ ok: false, error: 'invalid_transcribe_input' });
  });

  it.each([
    { ...telegramRequest, mediaUrl: mediaRequest.mediaUrl },
    { ...mediaRequest, telegramFileUrl: 'invalid' },
    { telegramFileUrl: undefined, mediaUrl: undefined },
  ])('rejects ambiguous sources before either schema can discard a field: %j', raw => {
    expect(parseTranscribeInput(raw)).toEqual({
      ok: false, error: 'transcribe_source_ambiguous',
    });
  });

  it.each([{}, null, 'input', [], 42, undefined])('rejects invalid input without throwing: %j', raw => {
    expect(parseTranscribeInput(raw)).toEqual({ ok: false, error: 'invalid_transcribe_input' });
  });

  it('returns an error even when a property getter throws', () => {
    const raw = {
      get mediaUrl(): string { throw new Error('Unreadable media URL'); },
      durationSec: 600,
    };
    expect(parseTranscribeInput(raw)).toEqual({ ok: false, error: 'invalid_transcribe_input' });
  });

  it('retains the existing response shape for a 600-second transcription', () => {
    const response = { text: 'A transcribed reel.', language: 'en', durationSec: 600, provider: 'openai' };
    expect(TranscribeResponseSchema.parse(response)).toEqual(response);
  });

  it('retains existing constants and provider choices', () => {
    expect(CAP_STT_DEFAULT_PORT).toBe(4011);
    expect(DEFAULT_STT_PRIMARY_PROVIDER).toBe('elevenlabs');
    expect(OPENAI_STT_DEFAULT_MODEL).toBe('gpt-transcribe');
    expect(TranscribeProviderSchema.options).toEqual(['elevenlabs', 'openai']);
  });
});
