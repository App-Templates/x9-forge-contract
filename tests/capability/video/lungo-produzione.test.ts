import { describe, expect, it } from 'vitest';
import {
  VideoCostBasisSchema,
  VideoLongVoiceSettingsSchema,
  VideoLongProductionSettingsSchema,
  VideoLongRunStageSchema,
  VideoLongRunStatusSchema,
  VideoLongRunQuoteRequestSchema,
  VideoLongRunQuoteSchema,
  VideoLongRunRequestSchema,
  VideoLongRunRefusalSchema,
  VideoLongRunStageStateSchema,
  VideoLongFrameImageSchema,
  VideoLongChapterFramesSchema,
  VideoLongChapterFramesApproveRequestSchema,
  VideoLongChapterVideoSchema,
  VideoLongChapterRunSchema,
  VideoLongFinalVideoSchema,
  VideoLongJoinRequestSchema,
  VideoLongProductionSchema,
  type VideoLongVoiceSettings,
  type VideoLongProductionSettings,
  type VideoLongRunQuoteRequest,
  type VideoLongRunQuote,
  type VideoLongRunRequest,
  type VideoLongRunStage,
  type VideoLongRunStatus,
  type VideoLongRunRefusal,
  type VideoLongRunStageState,
  type VideoLongFrameImage,
  type VideoLongChapterFrames,
  type VideoLongChapterFramesApproveRequest,
  type VideoLongChapterVideo,
  type VideoLongChapterRun,
  type VideoLongFinalVideo,
  type VideoLongJoinRequest,
  type VideoLongProduction,
} from '../../../src/capability/video/index.js';
import { VideoCostBasisSchema as ProductionCostBasisSchema } from '../../../src/capability/video/lungo-produzione.js';

const sha256 = 'a'.repeat(64);
const quoteId = 'b'.repeat(32);
const at = '2026-11-25T10:00:00Z';
const voice: VideoLongVoiceSettings = { provider: 'elevenlabs', model: 'eleven_multilingual_v2', voice: 'narrator' };
const settings: VideoLongProductionSettings = {
  frameProvider: 'fal', frameModel: null, clipProvider: 'minimax', clipModel: 'video-01',
  voice, subtitles: 'morbidi',
};
const quoteRequest: VideoLongRunQuoteRequest = { chapterIndex: 1, stage: 'fotogrammi' };
const quote: VideoLongRunQuote = {
  id: quoteId, ...quoteRequest, units: 80, unit: 'image', estimatedUsd: 4,
  reserveUsd: 5, remainingBudgetUsd: 100, tariffDate: '2026-11-25', tariffFresh: true,
  expiresAt: '2026-11-25T10:15:00Z',
};
const run: VideoLongRunRequest = { ...quoteRequest, quoteId, framesRevision: 2 };
const stage: VideoLongRunStage = 'fotogrammi';
const status: VideoLongRunStatus = 'in-corso';
const refusal: VideoLongRunRefusal = 'esito_incerto';
const state: VideoLongRunStageState = {
  stage, status, done: 13, total: 80, reused: 3, estimatedUsd: 4, confirmedUsd: null,
};
const image: VideoLongFrameImage = {
  shotIndex: 1, imagePath: 'chapter-1_frame_1.png', sha256, similarity: 0.92, status: 'approvato',
};
const frames: VideoLongChapterFrames = {
  chapterIndex: 1, revision: 2, status: 'approvati', digest: sha256,
  frames: Array.from({ length: 80 }, (_, i) => ({ ...image, shotIndex: i + 1 })), approvedAt: at,
};
const approval: VideoLongChapterFramesApproveRequest = { revision: 2, digest: sha256 };
const chapterVideo: VideoLongChapterVideo = { path: 'chapter-1.mp4', sha256, seconds: 180 };
const chapter: VideoLongChapterRun = {
  chapterIndex: 1, batches: 5,
  stages: [
    { ...state, status: 'approvato', done: 80, confirmedUsd: 3.85 },
    { ...state, stage: 'voce', status: 'completo', done: 1, total: 1, reused: 0, confirmedUsd: 1 },
    { ...state, stage: 'clip', status: 'completo', done: 80, confirmedUsd: 40 },
    { ...state, stage: 'montaggio', status: 'completo', done: 1, total: 1, reused: 0, estimatedUsd: 0, confirmedUsd: 0 },
  ],
  chapterVideo,
};
const finalVideo: VideoLongFinalVideo = {
  path: 'essay-final.mp4', sha256, seconds: 540, aspectRatio: '16:9',
  chapters: [
    { index: 1, startSeconds: 0, seconds: 180 },
    { index: 2, startSeconds: 180, seconds: 180 },
    { index: 3, startSeconds: 360, seconds: 180 },
  ],
  subtitles: true, createdAt: at,
};
const join: VideoLongJoinRequest = { framesRevision: 2 };
const production: VideoLongProduction = {
  projectId: 'c'.repeat(32), settings,
  chapters: [1, 2, 3].map((chapterIndex) => ({
    ...chapter, chapterIndex, chapterVideo: { ...chapterVideo, path: `chapter-${chapterIndex}.mp4` },
  })),
  finalVideo, updatedAt: at,
};

const objects = [
  ['voice settings', VideoLongVoiceSettingsSchema, voice],
  ['production settings', VideoLongProductionSettingsSchema, settings],
  ['quote request', VideoLongRunQuoteRequestSchema, quoteRequest],
  ['quote', VideoLongRunQuoteSchema, quote],
  ['run request', VideoLongRunRequestSchema, run],
  ['stage state', VideoLongRunStageStateSchema, state],
  ['frame image', VideoLongFrameImageSchema, image],
  ['chapter frames', VideoLongChapterFramesSchema, frames],
  ['frame approval', VideoLongChapterFramesApproveRequestSchema, approval],
  ['chapter video', VideoLongChapterVideoSchema, chapterVideo],
  ['chapter run', VideoLongChapterRunSchema, chapter],
  ['final video', VideoLongFinalVideoSchema, finalVideo],
  ['join request', VideoLongJoinRequestSchema, join],
  ['production', VideoLongProductionSchema, production],
] as const;

describe('long chapter production contracts', () => {
  it.each(objects)('accepts production-shaped %s', (_name, schema, value) => {
    expect(schema.parse(value)).toEqual(value);
  });

  it.each(objects)('rejects an extra field in %s', (_name, schema, value) => {
    expect(schema.safeParse({ ...value, extra: true }).success).toBe(false);
  });

  it('accepts stage, status and refusal vocabularies', () => {
    expect(VideoLongRunStageSchema.parse(stage)).toBe(stage);
    expect(VideoLongRunStageSchema.options).toEqual(['fotogrammi', 'voce', 'clip', 'montaggio']);
    expect(VideoLongRunStatusSchema.parse(status)).toBe(status);
    expect(VideoLongRunStatusSchema.options).toEqual(['da-fare', 'in-corso', 'da-approvare', 'approvato', 'completo', 'fallito']);
    expect(VideoLongRunRefusalSchema.parse(refusal)).toBe(refusal);
    expect(VideoLongRunRefusalSchema.options).toEqual([
      'piano_non_approvato', 'fotogrammi_non_approvati', 'preventivo_scaduto', 'preventivo_diverso',
      'tetto_superato', 'tariffa_scaduta', 'fornitore_non_pronto', 'tappa_gia_in_corso',
      'esito_incerto', 'progetto_sconosciuto', 'motore_non_disponibile',
    ]);
    expect(ProductionCostBasisSchema).toBe(VideoCostBasisSchema);
  });

  it('accepts an expired unknown tariff without representing it as free', () => {
    const expired = { ...quote, estimatedUsd: null, reserveUsd: null, tariffFresh: false };
    expect(VideoLongRunQuoteSchema.parse(expired)).toEqual(expired);
  });

  it('accepts unstarted and interrupted production without fabricated measurements', () => {
    expect(VideoLongProductionSchema.parse({
      ...production, settings: null, chapters: [], finalVideo: null,
    }).chapters).toEqual([]);
    expect(VideoLongChapterRunSchema.parse({ ...chapter, chapterVideo: null }).chapterVideo).toBeNull();
    expect(VideoLongChapterFramesSchema.parse({
      ...frames, status: 'da-approvare', approvedAt: null, frames: [],
    }).approvedAt).toBeNull();
    expect(VideoLongFrameImageSchema.parse({ ...image, similarity: null }).similarity).toBeNull();
  });

  it('accepts all supported provider and subtitle choices', () => {
    for (const provider of ['elevenlabs', 'openai']) {
      expect(VideoLongVoiceSettingsSchema.safeParse({ ...voice, provider }).success).toBe(true);
    }
    for (const provider of ['fal', 'byteplus', 'minimax']) {
      expect(VideoLongProductionSettingsSchema.safeParse({
        ...settings, frameProvider: provider, frameModel: 'image-model', clipProvider: provider, subtitles: 'nessuno',
      }).success).toBe(true);
    }
  });

  it.each([
    ['provider', 'altro'], ['model', ''], ['model', 'm'.repeat(101)],
    ['voice', ''], ['voice', 'v'.repeat(81)],
  ])('rejects invalid voice %s: %s', (field, value) => {
    expect(VideoLongVoiceSettingsSchema.safeParse({ ...voice, [field]: value }).success).toBe(false);
  });

  it.each([
    ['frameProvider', 'altro'], ['clipProvider', 'altro'], ['subtitles', 'impressi'],
    ['frameModel', ''], ['frameModel', 'm'.repeat(101)],
    ['clipModel', ''], ['clipModel', 'm'.repeat(101)], ['clipModel', null],
    ['voice', { ...voice, provider: 'altro' }],
  ])('rejects invalid settings %s: %s', (field, value) => {
    expect(VideoLongProductionSettingsSchema.safeParse({ ...settings, [field]: value }).success).toBe(false);
  });

  it.each([0, 25, 1.5])('rejects chapterIndex %s throughout production', (chapterIndex) => {
    for (const [schema, value] of [
      [VideoLongRunQuoteRequestSchema, quoteRequest], [VideoLongRunQuoteSchema, quote],
      [VideoLongRunRequestSchema, run], [VideoLongChapterFramesSchema, frames],
      [VideoLongChapterRunSchema, chapter],
    ] as const) {
      expect(schema.safeParse({ ...value, chapterIndex }).success).toBe(false);
    }
    expect(VideoLongFinalVideoSchema.safeParse({
      ...finalVideo, chapters: [{ index: chapterIndex, startSeconds: 0, seconds: 180 }],
    }).success).toBe(false);
  });

  it('rejects unknown stages, states and refusal reasons', () => {
    expect(VideoLongRunStageSchema.safeParse('unione').success).toBe(false);
    expect(VideoLongRunStatusSchema.safeParse('finito').success).toBe(false);
    expect(VideoLongRunRefusalSchema.safeParse('boh').success).toBe(false);
  });

  it('rejects a run without a quote (avvio senza preventivo)', () => {
    expect(VideoLongRunRequestSchema.safeParse({
      chapterIndex: 1, stage: 'fotogrammi', framesRevision: 2,
    }).success).toBe(false);
  });

  it.each(['b'.repeat(31), 'b'.repeat(33), 'g'.repeat(32)])('rejects malformed quote id %s', (id) => {
    expect(VideoLongRunRequestSchema.safeParse({ ...run, quoteId: id }).success).toBe(false);
    expect(VideoLongRunQuoteSchema.safeParse({ ...quote, id }).success).toBe(false);
  });

  it.each([
    ['units', -1], ['units', 1.5], ['unit', 'minute'],
    ['estimatedUsd', -0.01], ['reserveUsd', -0.01], ['remainingBudgetUsd', -0.01],
    ['estimatedUsd', Infinity], ['tariffDate', '25/11/2026'], ['tariffFresh', 'false'],
    ['expiresAt', ''], ['expiresAt', 'x'.repeat(41)],
  ])('rejects invalid quote %s: %s', (field, value) => {
    expect(VideoLongRunQuoteSchema.safeParse({ ...quote, [field]: value }).success).toBe(false);
  });

  it.each([
    ['done', -1], ['done', 1.5], ['total', -1], ['total', 1.5],
    ['reused', -1], ['reused', 1.5], ['estimatedUsd', -1], ['confirmedUsd', -1],
  ])('rejects invalid stage progress %s: %s', (field, value) => {
    expect(VideoLongRunStageStateSchema.safeParse({ ...state, [field]: value }).success).toBe(false);
  });

  it.each([0, 11, 1.5])('rejects %s chapter batches', (batches) => {
    expect(VideoLongChapterRunSchema.safeParse({ ...chapter, batches }).success).toBe(false);
  });

  it('rejects a chapter with three stages', () => {
    expect(VideoLongChapterRunSchema.safeParse({ ...chapter, stages: chapter.stages.slice(0, 3) }).success).toBe(false);
  });

  it('rejects a chapter with five stages', () => {
    expect(VideoLongChapterRunSchema.safeParse({ ...chapter, stages: [...chapter.stages, state] }).success).toBe(false);
  });

  it.each([
    ['shotIndex', 0], ['shotIndex', 81], ['shotIndex', 1.5],
    ['similarity', 1.2], ['similarity', -0.1], ['status', 'verde'],
    ['imagePath', '../frame.png'], ['imagePath', 'frame.gif'],
    ['sha256', 'a'.repeat(63)], ['sha256', 'g'.repeat(64)],
  ])('rejects invalid frame %s: %s', (field, value) => {
    expect(VideoLongFrameImageSchema.safeParse({ ...image, [field]: value }).success).toBe(false);
  });

  it.each([0, 1.5])('rejects invalid revision %s', (revision) => {
    expect(VideoLongChapterFramesSchema.safeParse({ ...frames, revision }).success).toBe(false);
    expect(VideoLongChapterFramesApproveRequestSchema.safeParse({ ...approval, revision }).success).toBe(false);
    expect(VideoLongRunRequestSchema.safeParse({ ...run, framesRevision: revision }).success).toBe(false);
    expect(VideoLongJoinRequestSchema.safeParse({ framesRevision: revision }).success).toBe(false);
  });

  it('requires both revision and digest to approve chapter frames', () => {
    for (const value of [{ revision: 2 }, { digest: sha256 }, { ...approval, digest: 'a'.repeat(63) }]) {
      expect(VideoLongChapterFramesApproveRequestSchema.safeParse(value).success).toBe(false);
    }
    expect(VideoLongChapterFramesSchema.safeParse({ ...frames, digest: 'invalid' }).success).toBe(false);
    expect(VideoLongChapterFramesSchema.safeParse({ ...frames, status: 'approvato' }).success).toBe(false);
    expect(VideoLongChapterFramesSchema.safeParse({ ...frames, approvedAt: '' }).success).toBe(false);
  });

  it.each([
    ['path', '../final.mp4'], ['path', 'final..mp4'], ['path', 'final.webm'],
    ['path', `${'x'.repeat(101)}.mp4`], ['seconds', 0], ['seconds', -1],
    ['sha256', 'bad'],
  ])('rejects invalid chapter and final video %s: %s', (field, value) => {
    expect(VideoLongChapterVideoSchema.safeParse({ ...chapterVideo, [field]: value }).success).toBe(false);
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, [field]: value }).success).toBe(false);
  });

  it('rejects a portrait final and invalid final timeline fields', () => {
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, aspectRatio: '9:16' }).success).toBe(false);
    for (const timeline of [
      { index: 1, startSeconds: -1, seconds: 180 },
      { index: 1, startSeconds: 0, seconds: 0 },
      { index: 1, startSeconds: 0, seconds: 180, extra: true },
    ]) {
      expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, chapters: [timeline] }).success).toBe(false);
    }
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, chapters: [] }).success).toBe(false);
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, createdAt: '' }).success).toBe(false);
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, subtitles: 'morbidi' }).success).toBe(false);
    expect(VideoLongProductionSchema.safeParse({ ...production, projectId: '' }).success).toBe(false);
    expect(VideoLongProductionSchema.safeParse({ ...production, updatedAt: '' }).success).toBe(false);
  });

  it('bounds frame and chapter arrays without applying a one-batch limit', () => {
    expect(VideoLongChapterFramesSchema.safeParse({ ...frames, frames: [...frames.frames, image] }).success).toBe(false);
    const chapters = Array.from({ length: 24 }, (_, i) => ({ ...chapter, chapterIndex: i + 1 }));
    expect(VideoLongProductionSchema.safeParse({ ...production, chapters }).success).toBe(true);
    expect(VideoLongProductionSchema.safeParse({ ...production, chapters: [...chapters, chapter] }).success).toBe(false);
    const timeline = Array.from({ length: 24 }, (_, i) => ({ index: i + 1, startSeconds: i * 180, seconds: 180 }));
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, chapters: timeline, seconds: 4320 }).success).toBe(true);
    expect(VideoLongFinalVideoSchema.safeParse({ ...finalVideo, chapters: [...timeline, timeline[0]] }).success).toBe(false);
  });

  it('accepts inclusive field boundaries and measured zero spend', () => {
    expect(VideoLongVoiceSettingsSchema.safeParse({ ...voice, model: 'm'.repeat(100), voice: 'v'.repeat(80) }).success).toBe(true);
    expect(VideoLongProductionSettingsSchema.safeParse({ ...settings, frameModel: 'm'.repeat(100), clipModel: 'm'.repeat(100) }).success).toBe(true);
    expect(VideoLongRunQuoteSchema.safeParse({ ...quote, chapterIndex: 24, units: 0, estimatedUsd: 0, reserveUsd: 0, remainingBudgetUsd: 0 }).success).toBe(true);
    expect(VideoLongRunStageStateSchema.safeParse({ ...state, done: 0, total: 0, reused: 0, estimatedUsd: 0, confirmedUsd: 0 }).success).toBe(true);
    for (const batches of [1, 10]) {
      expect(VideoLongChapterRunSchema.safeParse({ ...chapter, chapterIndex: 24, batches }).success).toBe(true);
    }
    for (const similarity of [0, 1]) {
      expect(VideoLongFrameImageSchema.safeParse({ ...image, shotIndex: 80, similarity }).success).toBe(true);
    }
    expect(VideoLongChapterVideoSchema.safeParse({ ...chapterVideo, path: `${'x'.repeat(100)}.mp4`, seconds: 0.1 }).success).toBe(true);
  });
});

// SUMMARY mutations (gate execution): making quoteId optional makes
// "avvio senza preventivo" fail; replacing stages.length(4) with stages.min(1)
// makes "rejects a chapter with three stages" fail. Not executed by this worker.
