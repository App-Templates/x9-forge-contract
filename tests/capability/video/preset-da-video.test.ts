import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  VIDEO_PRESET_VIDEO_MAX_BYTES,
  VIDEO_PRESET_VIDEO_MAX_SECONDS,
  VIDEO_PRESET_TOTAL_MAX_SECONDS,
  VideoPresetFromVideoJobSchema,
  VideoPresetFromVideoStartRequestSchema,
  VideoPresetSaveRequestSchema,
  VideoUserPresetIdSchema,
  VideoUserPresetSchema,
} from '../../../src/capability/video/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const scene = (index: number, extra: Record<string, unknown> = {}) => ({
  index,
  durationSeconds: 4,
  framing: 'medio',
  movement: 'push-in',
  transitionIn: 'taglio',
  role: 'gancio',
  roleSource: 'stimato',
  ...extra,
});
const scenes = [scene(0), scene(1, { roleSource: 'corretto', role: 'prova' }), scene(2, { role: 'invito' })];
const preset = {
  id: 'utente-mio-stile',
  name: 'Il mio stile',
  identity,
  status: 'bozza',
  revision: 1,
  basedOn: 'singola',
  source: { durationSeconds: 30, aspectRatio: '9:16', sceneCount: 3 },
  scenes,
  createdAt: '2026-11-23T10:00:00Z',
  updatedAt: '2026-11-23T10:00:00.500Z',
};
const okPreset = (v: unknown) => VideoUserPresetSchema.safeParse(v).success;
const okUrl = (url: string) => VideoPresetFromVideoStartRequestSchema.safeParse({ url, name: 'x' }).success;
const job = { jobId: 'a'.repeat(32), status: 'queued', presetId: null, code: null, error: null };

describe('video d esempio fino a 30 minuti', () => {
  it('accepts an example video lasting 1800 seconds', () => {
    expect(okPreset({ ...preset, source: { ...preset.source, durationSeconds: 1800 } })).toBe(true);
  });

  it('rejects an example video lasting 1800.5 seconds', () => {
    expect(okPreset({ ...preset, source: { ...preset.source, durationSeconds: 1800.5 } })).toBe(false);
  });

  it('exports example video limits of 1800 seconds and 768 MiB', () => {
    expect(VIDEO_PRESET_VIDEO_MAX_SECONDS).toBe(1800);
    expect(VIDEO_PRESET_VIDEO_MAX_BYTES).toBe(768 * 1024 * 1024);
  });

  it('keeps the total preset duration limit at 120 seconds', () => {
    expect(VIDEO_PRESET_TOTAL_MAX_SECONDS).toBe(120);
  });
});

describe('preset da video', () => {
  it('accepts a real preset with estimated and corrected roles', () => {
    expect(okPreset(preset)).toBe(true);
    expect(okPreset({ ...preset, status: 'salvato', revision: 3 })).toBe(true);
  });

  it('defaults basedOn to singola', () => {
    const { basedOn: _b, ...rest } = preset;
    const parsed = VideoUserPresetSchema.parse(rest);
    expect(parsed.basedOn).toBe('singola');
  });

  it('accepts a job in every state', () => {
    for (const status of ['queued', 'downloading', 'analyzing', 'done', 'failed']) {
      expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, status }).success).toBe(true);
    }
    expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, status: 'done', presetId: 'utente-a' }).success).toBe(true);
    expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, status: 'failed', code: 'troppo_lungo', error: 'x' }).success).toBe(true);
    expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, status: 'paused' }).success).toBe(false);
    expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, jobId: 'xyz' }).success).toBe(false);
  });

  it('accepts http and https urls and rejects other schemes, spaces and long urls', () => {
    expect(okUrl('https://example.com/v.mp4')).toBe(true);
    expect(okUrl('http://example.com/v.mp4')).toBe(true);
    for (const bad of ['ftp://x', 'file:///etc/passwd', 'javascript:x', 'https://a b', `https://x.it/${'a'.repeat(1990)}`]) {
      expect(okUrl(bad)).toBe(false);
    }
  });

  it('rejects ids that are not user presets', () => {
    expect(VideoUserPresetIdSchema.safeParse('utente-a1').success).toBe(true);
    for (const bad of ['singola', 'utente-', 'utente-A']) expect(VideoUserPresetIdSchema.safeParse(bad).success).toBe(false);
    expect(okPreset({ ...preset, id: 'singola' })).toBe(false);
  });

  it('rejects bad transitions, roles and durations', () => {
    expect(okPreset({ ...preset, scenes: [scene(0, { transitionIn: 'flash' })] })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { role: 'eroe' })] })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { durationSeconds: 0 })] })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { durationSeconds: 21 })] })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { movement: 'zoom-in' })] })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { framing: 'enorme' })] })).toBe(false);
  });

  it('bounds the number of scenes: 12 yes, 13 and 0 no', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => scene(i));
    expect(okPreset({ ...preset, scenes: many(12) })).toBe(true);
    expect(okPreset({ ...preset, scenes: many(13) })).toBe(false);
    expect(okPreset({ ...preset, scenes: [] })).toBe(false);
    expect(VideoPresetSaveRequestSchema.safeParse({ revision: 1, name: 'x', basedOn: 'singola', scenes: many(13) }).success).toBe(false);
    expect(VideoPresetSaveRequestSchema.safeParse({ revision: 1, name: 'x', basedOn: 'singola', scenes: many(12) }).success).toBe(true);
  });

  it('rejects extra fields and revision 0', () => {
    expect(okPreset({ ...preset, extra: 1 })).toBe(false);
    expect(okPreset({ ...preset, scenes: [scene(0, { extra: 1 })] })).toBe(false);
    expect(okPreset({ ...preset, revision: 0 })).toBe(false);
    expect(VideoPresetSaveRequestSchema.safeParse({ revision: 0, name: 'x', basedOn: 'singola', scenes }).success).toBe(false);
    expect(VideoPresetSaveRequestSchema.safeParse({ revision: 1, name: 'x', basedOn: 'singola', scenes, extra: 1 }).success).toBe(false);
    expect(VideoPresetFromVideoStartRequestSchema.safeParse({ url: 'https://a.it/v', name: 'x', extra: 1 }).success).toBe(false);
    expect(VideoPresetFromVideoJobSchema.safeParse({ ...job, extra: 1 }).success).toBe(false);
  });

  it('does not use refine in the contract file', () => {
    const source = readFileSync(new URL('../../../src/capability/video/preset-da-video.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
