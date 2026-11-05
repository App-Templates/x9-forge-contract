import { describe, expect, it } from 'vitest';
import {
  VideoEngineProjectSchema,
  VideoEngineStoryStateSchema,
  VideoEngineSubtitlesPathSchema,
} from '../../../src/capability/video/index.js';

const projectId = '0123456789abcdef0123456789abcdef';
const subtitles = `/media/${projectId}/sottotitoli-0123456789abcdef.srt`;

// Handwritten saved engine document predating the typed subtitles field.
const savedProject = {
  id: projectId,
  name: 'Demo plants',
  status: 'completed',
  revision: 1,
  scenes: [{
    id: 'scene-1', title: 'Plants', narration: 'Plants speak.',
    frame_prompt: 'A garden', frame_url: `/media/${projectId}/frame-1.png`, clip_url: null,
  }],
  jobs: [{ id: 'job-1', stage: 'assemble', status: 'completed', error: null }],
  output_url: `/media/${projectId}/final.mp4`,
  spent_usd: 0,
};

describe('engine subtitles', () => {
  it('accepts the SRT path written by the engine', () => {
    expect(VideoEngineSubtitlesPathSchema.parse(subtitles)).toBe(subtitles);
  });

  it.each([
    ['engine SRT', { subtitles_url: subtitles }],
    ['null', { subtitles_url: null }],
    ['absent', {}],
  ])('accepts %s subtitles on projects and stories', (_name, fields) => {
    const story = { status: 'completed', ...fields };
    expect(VideoEngineStoryStateSchema.parse(story)).toEqual(story);
    const project = { ...savedProject, ...fields, story };
    expect(VideoEngineProjectSchema.parse(project)).toEqual(project);
  });

  // Gate mutation for SUMMARY: widening \.srt$ to \.(srt|mp4)$ must fail the MP4 case.
  it.each([
    ['MP4', `/media/${projectId}/video.mp4`],
    ['parent traversal', `/media/${projectId}/../subtitles.srt`],
    ['project without 32 hex characters', '/media/other-project/subtitles.srt'],
  ])('rejects %s subtitles', (_name, path) => {
    expect(VideoEngineSubtitlesPathSchema.safeParse(path).success).toBe(false);
    expect(VideoEngineProjectSchema.safeParse({ ...savedProject, subtitles_url: path }).success).toBe(false);
    expect(VideoEngineStoryStateSchema.safeParse({ status: 'completed', subtitles_url: path }).success).toBe(false);
    expect(VideoEngineProjectSchema.safeParse({
      ...savedProject, story: { status: 'completed', subtitles_url: path },
    }).success).toBe(false);
  });

  it('still accepts a saved engine project without subtitles_url', () => {
    expect(VideoEngineProjectSchema.parse(savedProject)).toEqual(savedProject);
  });
});
