import { describe, expect, it } from 'vitest';
import {
  VIDEO_PRESET_FROM_VIDEO_TOOL,
  VideoPresetFromVideoToolInputSchema,
  VideoPresetFromVideoToolResponseSchema,
  VideoPresetFromVideoToolStatusInputSchema,
} from '../../../src/capability/video/index.js';

const input = { url: 'https://example.com/example.mp4', name: 'My preset' };
const jobId = 'a'.repeat(32);
const ready = {
  status: 'pronto',
  presetId: 'utente-mio-stile',
  scenes: 3,
  studioUrl: 'https://studio.example.com/preset/utente-mio-stile',
};

describe('preset da video tool', () => {
  it('keeps the tool name stable', () => {
    expect(VIDEO_PRESET_FROM_VIDEO_TOOL).toBe('video_preset_da_url');
  });

  it.each(['http://example.com/example.mp4', 'https://example.com/example.mp4'])(
    'accepts an example video URL: %s',
    (url) => {
      expect(VideoPresetFromVideoToolInputSchema.parse({ ...input, url })).toEqual({ ...input, url });
    },
  );

  // Mutation for the gate: adding agentId to the input must fail the agentId case.
  it.each(['tenantId', 'ownerId', 'agentId', 'identity'])('niente identità: rejects %s', (field) => {
    const value = field === 'identity'
      ? { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' }
      : 'scope-1';
    expect(VideoPresetFromVideoToolInputSchema.safeParse({ ...input, [field]: value }).success).toBe(false);
    expect(VideoPresetFromVideoToolStatusInputSchema.safeParse({ jobId, [field]: value }).success).toBe(false);
  });

  it.each(['ftp://example.com/v.mp4', 'file:///video.mp4', 'javascript:video', 'example.com/v.mp4', 'https://a b'])(
    'rejects an invalid video URL: %s',
    (url) => {
      expect(VideoPresetFromVideoToolInputSchema.safeParse({ ...input, url }).success).toBe(false);
    },
  );

  it('trims the name and enforces its length after trimming', () => {
    expect(VideoPresetFromVideoToolInputSchema.parse({ ...input, name: '  My preset  ' }).name).toBe('My preset');
    expect(VideoPresetFromVideoToolInputSchema.parse({ ...input, name: 'x'.repeat(80) }).name).toHaveLength(80);
    for (const name of ['', '   ', 'x'.repeat(81)]) {
      expect(VideoPresetFromVideoToolInputSchema.safeParse({ ...input, name }).success).toBe(false);
    }
  });

  it('requires both input fields and rejects unknown fields', () => {
    for (const invalid of [{ url: input.url }, { name: input.name }, { ...input, extra: true }]) {
      expect(VideoPresetFromVideoToolInputSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('accepts the started and ready response branches', () => {
    expect(VideoPresetFromVideoToolResponseSchema.parse({ status: 'avviato', jobId })).toEqual({ status: 'avviato', jobId });
    expect(VideoPresetFromVideoToolResponseSchema.parse(ready)).toEqual(ready);
  });

  it.each([
    'url_non_valida',
    'video_troppo_lungo',
    'video_troppo_grande',
    'rete_interna',
    'non_e_un_video',
    'motore_non_disponibile',
  ])('accepts the rejected response with reason %s', (reason) => {
    const response = { status: 'rifiutato', reason, message: 'The example video cannot be analyzed.' };
    expect(VideoPresetFromVideoToolResponseSchema.parse(response)).toEqual(response);
  });

  it('rejects unknown statuses, reasons, missing fields and extra fields', () => {
    for (const invalid of [
      { status: 'sconosciuto', jobId },
      { status: 'avviato' },
      { status: 'avviato', jobId, extra: true },
      { status: 'rifiutato', reason: 'unknown', message: 'Failure' },
      { status: 'rifiutato', reason: 'url_non_valida' },
      { status: 'rifiutato', reason: 'url_non_valida', message: 'Failure', extra: true },
      { status: 'pronto', presetId: ready.presetId, scenes: ready.scenes },
      { ...ready, studioUrl: 123 },
      { ...ready, extra: true },
    ]) {
      expect(VideoPresetFromVideoToolResponseSchema.safeParse(invalid).success).toBe(false);
    }
  });

  it('reuses the production job id and user preset constraints', () => {
    expect(VideoPresetFromVideoToolStatusInputSchema.parse({ jobId })).toEqual({ jobId });
    for (const invalid of [{}, { jobId: 'invalid' }, { jobId, extra: true }]) {
      expect(VideoPresetFromVideoToolStatusInputSchema.safeParse(invalid).success).toBe(false);
    }
    expect(VideoPresetFromVideoToolResponseSchema.safeParse({ status: 'avviato', jobId: 'invalid' }).success).toBe(false);
    expect(VideoPresetFromVideoToolResponseSchema.safeParse({ ...ready, presetId: 'singola' }).success).toBe(false);
    for (const scenes of [1, 12]) {
      expect(VideoPresetFromVideoToolResponseSchema.safeParse({ ...ready, scenes }).success).toBe(true);
    }
    for (const scenes of [0, 13, 1.5, '3']) {
      expect(VideoPresetFromVideoToolResponseSchema.safeParse({ ...ready, scenes }).success).toBe(false);
    }
  });
});
