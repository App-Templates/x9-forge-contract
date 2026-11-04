import { describe, expect, it } from 'vitest';
import {
  VideoEngineErrorSchema,
  VideoEngineHealthSchema,
  type VideoEngineError,
  type VideoEngineHealth,
} from '../../../src/capability/video/index.js';
import * as contracts from '../../../src/http/endpoints/officina-video.js';

describe('engine error and health contracts', () => {
  it.each<VideoEngineError>([
    { error: 'Preventivo 5.01 USD oltre…', operation_state: 'rejected', code: 'story_over_budget' },
    { error: 'Errore interno del motore locale.', operation_state: 'uncertain', code: 'internal_error' },
    { error: 'Token interno non valido.', operation_state: 'rejected', code: 'request_rejected' },
  ])('preserves the engine error $code', (body) => {
    expect(VideoEngineErrorSchema.parse(body)).toEqual(body);
  });

  it('accepts omitted or null error metadata and every operation state', () => {
    for (const operation_state of [undefined, null, 'rejected', 'pending', 'uncertain']) {
      for (const code of [undefined, null, 'request_rejected']) {
        const body = { error: 'Request failed.', operation_state, code };
        expect(VideoEngineErrorSchema.parse(body)).toEqual(body);
      }
    }
    expect(VideoEngineErrorSchema.parse({ error: 'Request failed.' })).toEqual({ error: 'Request failed.' });
    expect(VideoEngineErrorSchema.safeParse({ error: 'e'.repeat(2000), code: 'c'.repeat(64) }).success).toBe(true);
  });

  it.each([
    {},
    { operation_state: 'rejected', code: 'request_rejected' },
    { error: 'Request failed.', operation_state: 'done' },
    { error: 'Request failed.', extra: true },
    { error: '' },
    { error: 'e'.repeat(2001) },
    { error: null },
    { error: 42 },
    { error: 'Request failed.', operation_state: 42 },
    { error: 'Request failed.', code: '' },
    { error: 'Request failed.', code: 'c'.repeat(65) },
    { error: 'Request failed.', code: 42 },
  ])('rejects malformed engine errors: %j', (body) => {
    expect(VideoEngineErrorSchema.safeParse(body).success).toBe(false);
  });

  it('preserves health details beyond the required probe fields', () => {
    const body: VideoEngineHealth = {
      ok: true,
      ffmpeg: true,
      ffprobe: true,
      paid_enabled: false,
      providers: { demo: true },
      vimax: { ok: true },
      remotion: { ok: false },
      voice: { ok: true },
      cloud_voice: { ok: false },
    };
    expect(VideoEngineHealthSchema.parse(body)).toEqual(body);
    expect(VideoEngineHealthSchema.parse({ ok: false, ffmpeg: false, ffprobe: false })).toEqual({
      ok: false, ffmpeg: false, ffprobe: false,
    });
    expect(VideoEngineHealthSchema.safeParse({ ...body, paid_enabled: true }).success).toBe(true);
  });

  it.each([
    { ok: true, ffprobe: true },
    { ffmpeg: true, ffprobe: true },
    { ok: true, ffmpeg: true },
    { ok: 'true', ffmpeg: true, ffprobe: true },
    { ok: true, ffmpeg: 'true', ffprobe: true },
    { ok: true, ffmpeg: true, ffprobe: 'true' },
    { ok: true, ffmpeg: true, ffprobe: true, paid_enabled: 'false' },
    { ok: true, ffmpeg: true, ffprobe: true, paid_enabled: null },
  ])('rejects malformed engine health: %j', (body) => {
    expect(VideoEngineHealthSchema.safeParse(body).success).toBe(false);
  });

  it('wires the error schema to every exported officinaVideo contract', () => {
    const exportedContracts = Object.entries(contracts).filter(([name]) => name.startsWith('officinaVideo'));
    expect(exportedContracts.length).toBeGreaterThan(0);
    for (const [name, contract] of exportedContracts) {
      expect(contract, name).toHaveProperty('errorSchema', VideoEngineErrorSchema);
    }
  });

  it('wires the health response schema and HTTP status', () => {
    expect(contracts.officinaVideoHealthContract.responseSchema).toBe(VideoEngineHealthSchema);
    expect(contracts.officinaVideoHealthContract.responseStatus).toBe(200);
  });
});
