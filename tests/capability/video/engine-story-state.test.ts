import { describe, expect, it } from 'vitest';
import {
  VideoEngineProjectSchema,
  VideoEngineStoryStateSchema,
} from '../../../src/capability/video/index';

const id = '0123456789abcdef0123456789abcdef';
const baseProject = { id, status: 'draft', revision: 1, scenes: [], jobs: [] };
const story = {
  run_id: 'run-1',
  status: 'completed',
  step: 'fatto',
  preset_id: 'story-split-sync',
  resolution: '1080x1920',
  footage: [{ name: 'a.mp4' }],
  scenes: [{ id: 's1' }],
  outro: { enabled: true },
  graphic_sha256: 'a'.repeat(64),
  graphic_bytes: 1234,
  estimate: { usd: 3.2 },
  output_url: `/media/${id}/story-0123456789abcdef.mp4`,
  error: null,
  created_at: '2026-11-04T10:00:00Z',
  updated_at: '2026-11-04T10:05:00Z',
  history: [],
};

describe('VideoEngineProjectSchema story state', () => {
  it('accepts the real engine story shape and keeps extra fields', () => {
    const parsed = VideoEngineProjectSchema.parse({ ...baseProject, story });
    expect(parsed.story?.status).toBe('completed');
    expect(parsed.story?.output_url).toBe(story.output_url);
    expect(parsed.story).toMatchObject({ run_id: 'run-1', preset_id: 'story-split-sync' });
  });

  it('accepts a project without story and with story null', () => {
    expect(VideoEngineProjectSchema.safeParse(baseProject).success).toBe(true);
    expect(VideoEngineProjectSchema.safeParse({ ...baseProject, story: null }).success).toBe(true);
  });

  it('accepts interrupted with an error', () => {
    const r = VideoEngineStoryStateSchema.safeParse({ status: 'interrupted', error: 'riavvio del motore' });
    expect(r.success).toBe(true);
  });

  it('rejects an unknown status', () => {
    expect(VideoEngineStoryStateSchema.safeParse({ ...story, status: 'done' }).success).toBe(false);
    expect(VideoEngineProjectSchema.safeParse({ ...baseProject, story: { ...story, status: 'done' } }).success).toBe(false);
  });

  it('rejects an output_url outside /media', () => {
    expect(VideoEngineStoryStateSchema.safeParse({ ...story, output_url: '/tmp/x.mp4' }).success).toBe(false);
  });

  it('rejects an error longer than 1000 characters', () => {
    expect(VideoEngineStoryStateSchema.safeParse({ ...story, error: 'x'.repeat(1001) }).success).toBe(false);
    expect(VideoEngineStoryStateSchema.safeParse({ ...story, error: 'x'.repeat(1000) }).success).toBe(true);
  });
});
