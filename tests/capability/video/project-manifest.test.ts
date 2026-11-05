import { describe, expect, it } from 'vitest';
import { VideoProjectManifestSchema, VideoProjectViewSchema } from '../../../src/capability/video/index.js';

const video = { kind: 'video', name: 'piante-01.mp4', url: 'https://video.example.com/p/piante-01.mp4' };
const srt = { kind: 'subtitles', name: 'piante-01.srt', url: 'https://video.example.com/p/piante-01.srt' };
const common = {
  version: 1,
  projectId: 'proj-1',
  presetId: 'social-faccia',
  presetTitle: 'Social con la mia faccia',
  mode: 'approval',
  brief: 'Un video sulle piante.',
  choices: { voice: 'marco', aspectRatio: '9:16', durationSeconds: 45, resolution: '1080p' },
  cost: { budgetUsd: 5, spentUsd: 1.2, estimateUsd: 1.5 },
  output: { durationSeconds: 44.5, width: 1080, height: 1920, sha256: 'a'.repeat(64) },
  createdAt: '2026-11-05T10:00:00Z',
  deliveredAt: '2026-11-05T11:00:00Z',
};
const story = {
  ...common,
  footage: ['piante-02'],
  script: { revision: 2, scenes: [{ text: 'Le piante parlano.' }], outro: { title: 'In pratica', line: 'Ogni pianta ha un ritmo.' } },
  scenes: [],
  files: [video, srt],
};
const demo = {
  ...common,
  choices: { voice: null, aspectRatio: '16:9', durationSeconds: 30, resolution: null },
  footage: null,
  script: null,
  scenes: [{ title: 'Apertura', narration: 'Benvenuti.' }, { title: 'Chiusura', narration: 'Grazie.' }],
  files: [video],
};

describe('VideoProjectManifestSchema', () => {
  it('accepts a story manifest and a demo manifest', () => {
    expect(VideoProjectManifestSchema.safeParse(story).success).toBe(true);
    expect(VideoProjectManifestSchema.safeParse(demo).success).toBe(true);
  });

  it.each([
    ['two videos', { ...story, files: [video, { ...video, name: 'b.mp4' }] }],
    ['no video', { ...story, files: [srt] }],
    ['a png file', { ...story, files: [video, { kind: 'subtitles', name: 'a.png', url: 'https://x.example.com/a.png' }] }],
    ['tenantId', { ...story, tenantId: 't1' }],
    ['approverEmail', { ...story, approverEmail: 'a@b.it' }],
    ['version 2', { ...story, version: 2 }],
    ['short sha256', { ...story, output: { ...story.output, sha256: 'abc' } }],
  ])('rejects %s', (_n, value) => {
    expect(VideoProjectManifestSchema.safeParse(value).success).toBe(false);
  });
});

describe('VideoProjectViewSchema choices and scriptRevision', () => {
  const view = {
    projectId: 'proj-1', state: 'producing', step: 'story',
    identity: { tenantId: 't1', ownerId: 'o1', agentId: 'a1' },
    presetId: 'social-faccia', mode: 'approval', budgetUsd: 5, spentUsd: 0,
    createdAt: '2026-11-05T10:00:00Z', updatedAt: '2026-11-05T10:00:00Z',
  };
  it('still accepts the 1.96.0 form and the new fields', () => {
    expect(VideoProjectViewSchema.safeParse(view).success).toBe(true);
    expect(VideoProjectViewSchema.safeParse({ ...view, choices: common.choices, scriptRevision: 2 }).success).toBe(true);
  });
  it('rejects scriptRevision 0', () => {
    expect(VideoProjectViewSchema.safeParse({ ...view, scriptRevision: 0 }).success).toBe(false);
  });
});
