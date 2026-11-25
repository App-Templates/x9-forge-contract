import { describe, expect, it } from 'vitest';
import {
  VIDEO_LONG_MAX_SHOTS_PER_CHAPTER,
  VIDEO_LONG_MIN_SHOT_SECONDS,
  VIDEO_LONG_MAX_SHOT_SECONDS,
  VIDEO_LONG_BATCH_MAX_SCENES,
  VIDEO_LONG_BATCH_MAX_SECONDS,
  VIDEO_LONG_SPEECH_CHARS_PER_SECOND,
  VIDEO_LONG_SHOT_SUM_TOLERANCE,
  VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW,
  VideoLongShotRenderSchema,
  VideoLongShotSchema,
  VideoLongChapterShotsSchema,
  VideoLongFramesDocumentSchema,
  VideoLongFramesStatusSchema,
  VideoLongFramesSchema,
  VideoLongFramesApproveRequestSchema,
  type VideoLongShot,
  type VideoLongChapterShots,
  type VideoLongFramesDocument,
  type VideoLongFrames,
  type VideoLongFramesApproveRequest,
} from '../../../src/capability/video/index.js';

const shot = (index: number): VideoLongShot => ({
  index,
  framing: 'intervista',
  description: 'La studiosa racconta il passaggio dal muto al sonoro.',
  motion: 'Lento avvicinamento alla poltrona.',
  seconds: 10,
  render: 'clip',
  narration: 'Il suono cambia il cinema.',
  environmentAngle: 'a',
  withCharacter: true,
  sourceId: 'source-archivio',
});

const chapter = (chapterIndex: number): VideoLongChapterShots => ({
  chapterIndex,
  shots: [
    shot(1),
    { ...shot(2), framing: 'immagini', render: 'fermo', seconds: 3, narration: '', withCharacter: false },
    { ...shot(3), framing: 'ambiente', sourceId: null, withCharacter: false },
    { ...shot(4), framing: 'grafica', environmentAngle: null, withCharacter: false },
  ],
});

const doc = (): VideoLongFramesDocument => ({
  chaptersRevision: 2,
  chapters: [chapter(1), chapter(2), chapter(3)],
  usage: null,
});

const digest = 'a'.repeat(64);
const saved = (): VideoLongFrames => ({
  ...doc(),
  revision: 1,
  status: 'da-approvare',
  totalSeconds: 99,
  shotCount: 12,
  interviewShare: 30 / 99,
  warnings: [],
  digest,
  approvedAt: null,
});

describe('long frames and narration', () => {
  it('accepts three chapters of four shots including a three-second local still', () => {
    expect(VideoLongFramesDocumentSchema.parse(doc())).toEqual(doc());
    expect(VideoLongShotRenderSchema.options).toEqual(['clip', 'fermo']);
    expect(VideoLongFramesStatusSchema.options).toEqual(['da-approvare', 'approvati']);
  });

  it('accepts saved frames and approval with revision and digest', () => {
    expect(VideoLongFramesSchema.parse(saved())).toEqual(saved());
    const approved: VideoLongFrames = { ...saved(), status: 'approvati', approvedAt: '2026-11-25T10:00:00Z' };
    expect(VideoLongFramesSchema.parse(approved)).toEqual(approved);
    const approval: VideoLongFramesApproveRequest = { revision: 1, digest };
    expect(VideoLongFramesApproveRequestSchema.parse(approval)).toEqual(approval);
  });

  it.each([
    ['index', 0], ['index', 81], ['index', 1.5],
    ['seconds', 1], ['seconds', 16], ['seconds', 2.5],
    ['description', ''], ['description', 'x'.repeat(1501)],
    ['motion', ''], ['motion', 'x'.repeat(401)],
    ['narration', 'x'.repeat(1201)],
    ['framing', 'drone'], ['render', 'video'], ['environmentAngle', 'Frontale'],
    ['withCharacter', 'true'], ['sourceId', ''], ['extra', true],
  ])('rejects invalid shot %s: %s', (field, value) => {
    expect(VideoLongShotSchema.safeParse({ ...shot(1), [field]: value }).success).toBe(false);
  });

  it('accepts shot field boundaries', () => {
    for (const seconds of [2, 15]) {
      expect(VideoLongShotSchema.safeParse({
        ...shot(80), seconds, render: 'fermo', description: 'x'.repeat(1500),
        motion: 'x'.repeat(400), narration: 'x'.repeat(1200),
      }).success).toBe(true);
    }
  });

  it.each([0, 81])('rejects %i shots in a chapter', (count) => {
    const shots = Array.from({ length: count }, (_, i) => shot((i % 80) + 1));
    expect(VideoLongChapterShotsSchema.safeParse({ chapterIndex: 1, shots }).success).toBe(false);
  });

  it.each([0, 25])('rejects %i chapters', (count) => {
    const chapters = Array.from({ length: count }, (_, i) => chapter((i % 24) + 1));
    expect(VideoLongFramesDocumentSchema.safeParse({ ...doc(), chapters }).success).toBe(false);
  });

  it.each([0, 25, 1.5])('rejects chapterIndex %s', (chapterIndex) => {
    expect(VideoLongChapterShotsSchema.safeParse(chapter(chapterIndex)).success).toBe(false);
  });

  it('accepts maximum chapter and shot counts without imposing batch limits on the document', () => {
    const chapters = Array.from({ length: 24 }, (_, i) => ({
      chapterIndex: i + 1,
      shots: Array.from({ length: 80 }, (_, j) => shot(j + 1)),
    }));
    expect(VideoLongFramesDocumentSchema.safeParse({ ...doc(), chapters }).success).toBe(true);
  });

  it.each([
    ['digest', 'abc'], ['digest', 'A'.repeat(64)],
    ['interviewShare', 1.1], ['interviewShare', -0.1],
    ['warnings', Array(21).fill('Warning')], ['warnings', ['']], ['warnings', ['x'.repeat(201)]],
    ['totalSeconds', 9], ['totalSeconds', 1201], ['totalSeconds', 10.5],
    ['shotCount', 0], ['shotCount', 1921], ['shotCount', 1.5],
    ['status', 'approvata'], ['revision', 0], ['chaptersRevision', 0],
    ['approvedAt', ''], ['approvedAt', 'x'.repeat(41)], ['extra', true],
  ])('rejects invalid saved field %s: %s', (field, value) => {
    expect(VideoLongFramesSchema.safeParse({ ...saved(), [field]: value }).success).toBe(false);
  });

  it('accepts saved field boundaries and measured usage', () => {
    for (const [totalSeconds, shotCount, interviewShare] of [[10, 1, 0], [1200, 1920, 1]]) {
      expect(VideoLongFramesSchema.safeParse({
        ...saved(), totalSeconds, shotCount, interviewShare,
        warnings: Array(20).fill('x'.repeat(200)), approvedAt: 'x'.repeat(40),
        usage: { provider: 'director', model: 'model', inputTokens: 10, outputTokens: 20, measured: true },
      }).success).toBe(true);
    }
  });

  it('rejects unknown document and chapter fields and invalid approval requests', () => {
    expect(VideoLongFramesDocumentSchema.safeParse({ ...doc(), extra: true }).success).toBe(false);
    expect(VideoLongChapterShotsSchema.safeParse({ ...chapter(1), extra: true }).success).toBe(false);
    for (const request of [
      { revision: 1, digest: 'abc' }, { revision: 0, digest },
      { revision: 1, digest, extra: true }, { revision: 1 }, { digest },
    ]) {
      expect(VideoLongFramesApproveRequestSchema.safeParse(request).success).toBe(false);
    }
  });

  it('exports the agreed production limits and working estimates', () => {
    expect({
      VIDEO_LONG_MAX_SHOTS_PER_CHAPTER, VIDEO_LONG_MIN_SHOT_SECONDS, VIDEO_LONG_MAX_SHOT_SECONDS,
      VIDEO_LONG_BATCH_MAX_SCENES, VIDEO_LONG_BATCH_MAX_SECONDS, VIDEO_LONG_SPEECH_CHARS_PER_SECOND,
      VIDEO_LONG_SHOT_SUM_TOLERANCE, VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW,
    }).toEqual({
      VIDEO_LONG_MAX_SHOTS_PER_CHAPTER: 80, VIDEO_LONG_MIN_SHOT_SECONDS: 2, VIDEO_LONG_MAX_SHOT_SECONDS: 15,
      VIDEO_LONG_BATCH_MAX_SCENES: 16, VIDEO_LONG_BATCH_MAX_SECONDS: 120, VIDEO_LONG_SPEECH_CHARS_PER_SECOND: 15,
      VIDEO_LONG_SHOT_SUM_TOLERANCE: 0.1, VIDEO_LONG_MAX_SECONDS_WITHOUT_INTERVIEW: 50,
    });
  });
});

// SUMMARY mutations (gate execution): seconds.max(60) makes the seconds=16 case fail;
// removing 'fermo' from the render enum makes the three-second local still case fail.
