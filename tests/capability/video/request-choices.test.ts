import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VideoAspectRatioSchema,
  VideoBriefRequestSchema,
  VideoBriefToolInputSchema,
  VideoEngineSettingsSchema,
  VideoEngineStoryRequestSchema,
  VideoRequestChoicesSchema,
  VideoResolutionSchema,
  VideoStoryResolutionSchema,
} from '../../../src/capability/video/index.js';

const identity = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'x9' };
const toolInput = { approverEmail: 'stefano@example.com', presetId: 'singola', mode: 'approval', budgetUsd: 10, brief: 'Video sulle piante' };
const choices = { voice: 'marco', aspectRatio: '9:16', durationSeconds: 30, resolution: '720p' };
const story = {
  scenes: [{ text: 'Le piante parlano.' }],
  graphicHtml: '<script>function render(t){}</script>',
  outro: { title: 'In pratica', line: 'Ogni pianta ha un ritmo.' },
  revision: 3,
};

describe('video brief: choices per request (additive)', () => {
  it('accepts the four choices, and the brief of v1.96.0 without them', () => {
    const parsed = VideoBriefRequestSchema.parse({ ...toolInput, identity, requestedBy: 'x9', ...choices });
    expect(parsed).toMatchObject(choices);
    expect(VideoBriefToolInputSchema.parse({ ...toolInput, ...choices })).toMatchObject(choices);
    const old = VideoBriefRequestSchema.parse({ ...toolInput, identity, requestedBy: 'x9' });
    expect(old.voice).toBeUndefined();
    expect(old.resolution).toBeUndefined();
  });

  it('refuses a wrong format, resolution, duration or voice id', () => {
    const bad: Array<Record<string, unknown>> = [
      { aspectRatio: '4:5' },
      { resolution: '4k' },
      { durationSeconds: 4 },
      { durationSeconds: 181 },
      { durationSeconds: 12.5 },
      { voice: 'Marco' },
      { voice: 'etz1gLgQTuQIYLCRkFJh' },
    ];
    for (const extra of bad) {
      expect(VideoBriefToolInputSchema.safeParse({ ...toolInput, ...extra }).success, JSON.stringify(extra)).toBe(false);
    }
  });

  it('keeps the four properties optional in the JSON schema of the tool', () => {
    const json = z.toJSONSchema(VideoBriefToolInputSchema) as { properties: Record<string, unknown>; required?: string[] };
    for (const key of ['voice', 'aspectRatio', 'durationSeconds', 'resolution']) {
      expect(json.properties).toHaveProperty(key);
      expect(json.required ?? []).not.toContain(key);
    }
  });

  it('shares the same enum objects with the engine settings and the story', () => {
    expect(VideoEngineSettingsSchema.shape.aspectRatio).toBe(VideoAspectRatioSchema);
    expect(VideoStoryResolutionSchema).toBe(VideoResolutionSchema);
  });
});

describe('VideoRequestChoicesSchema', () => {
  it('accepts null voice and resolution', () => {
    expect(VideoRequestChoicesSchema.parse({ ...choices, voice: null, resolution: null }).voice).toBeNull();
  });
  it('refuses an extra field and a missing one', () => {
    expect(VideoRequestChoicesSchema.safeParse({ ...choices, extra: 1 }).success).toBe(false);
    const { durationSeconds: _omit, ...missing } = choices;
    expect(VideoRequestChoicesSchema.safeParse(missing).success).toBe(false);
  });
});

describe('story voice', () => {
  it('accepts a catalogue voice id and refuses a provider-like one', () => {
    expect(VideoEngineStoryRequestSchema.parse({ ...story, voice: 'marco' }).voice).toBe('marco');
    expect(VideoEngineStoryRequestSchema.parse(story).voice).toBeUndefined();
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, voice: 'Marco' }).success).toBe(false);
  });
});
