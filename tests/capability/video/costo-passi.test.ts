import { describe, expect, it } from 'vitest';
import {
  VideoCostUnitSchema,
  VideoCostBasisSchema,
  VideoCostModelSchema,
  VideoCostChapterSchema,
  VideoCostEntrySchema,
  VideoCostStepSchema,
  VideoCostByStepSchema,
  type VideoCostEntry,
  type VideoCostModel,
  type VideoCostChapter,
  type VideoCostStep,
  type VideoCostByStep,
} from '../../../src/capability/video/index.js';

const entry: VideoCostEntry = {
  step: 'bozza',
  provider: 'anthropic',
  model: 'claude-sonnet-5-5',
  quantity: 2000,
  unit: 'token',
  costUsd: 0,
  basis: 'non-misurato',
  at: '2026-11-25T10:00:00Z',
};

const step: VideoCostStep = {
  step: 'bozza',
  estimatedUsd: 0,
  confirmedUsd: 0,
  entries: [entry],
};

const project: VideoCostByStep = {
  projectId: 'a'.repeat(32),
  steps: [step],
  totalUsd: 0,
  finishedSeconds: null,
  usdPerMinute: null,
};

const model: VideoCostModel = {
  step: 'bozza',
  provider: 'anthropic',
  model: 'claude-sonnet-5-5',
  quantity: 2000,
  unit: 'token',
  costUsd: 1.84,
  basis: 'stimato',
};

const chapter: VideoCostChapter = {
  chapterIndex: 1,
  costUsd: 1.84,
  seconds: 60,
  usdPerMinute: 1.84,
};

// SUMMARY: adding 'zero' to VideoCostBasisSchema must make the "rejects basis: zero" case fail.
// SUMMARY: removing .optional() from models must make "accepts today's response without new fields" fail.
describe('costs by video step', () => {
  it("accepts today's response without new fields", () => {
    // R-37: the engine currently returns null duration and rate with no breakdown fields.
    expect(VideoCostByStepSchema.parse(project)).toEqual(project);
  });

  it('accepts four models and three chapters with an estimated finished rate', () => {
    const finished: VideoCostByStep = {
      ...project,
      steps: [{ ...step, estimatedUsd: 14.72, entries: [{ ...entry, basis: 'stimato', costUsd: 14.72, chapterIndex: 1 }] }],
      totalUsd: 14.72,
      finishedSeconds: 480,
      usdPerMinute: 1.84,
      models: [
        model,
        { ...model, model: 'claude-opus-5', costUsd: 1.84 },
        { ...model, step: 'fotogrammi', provider: 'openai', model: 'gpt-image-1', unit: 'image', quantity: 4, costUsd: 3.68 },
        { ...model, step: 'video', provider: 'google', model: 'veo-3', unit: 'second', quantity: 480, costUsd: 7.36 },
      ],
      chapters: [
        { ...chapter, costUsd: 3.68, seconds: 120 },
        { ...chapter, chapterIndex: 2, costUsd: 5.52, seconds: 180 },
        { ...chapter, chapterIndex: 3, costUsd: 5.52, seconds: 180 },
      ],
      usdPerMinuteBasis: 'stimato',
      unmeasuredEntries: 0,
    };
    expect(VideoCostByStepSchema.parse(finished)).toEqual(finished);
  });

  it('accepts a null rate with two unmeasured entries', () => {
    const pending: VideoCostByStep = {
      ...project,
      steps: [{ ...step, entries: [entry, { ...entry, step: 'ricerca' }] }],
      models: [{ ...model, costUsd: 0, basis: 'non-misurato' }],
      chapters: [{ ...chapter, costUsd: 0, seconds: null, usdPerMinute: null }],
      usdPerMinuteBasis: 'non-misurato',
      unmeasuredEntries: 2,
    };
    expect(VideoCostByStepSchema.parse(pending)).toEqual(pending);
    expect(VideoCostByStepSchema.safeParse({ ...pending, usdPerMinuteBasis: null }).success).toBe(true);
  });

  it('enforces chapter indices on entries and chapter totals', () => {
    for (const chapterIndex of [1, 24]) {
      expect(VideoCostEntrySchema.safeParse({ ...entry, chapterIndex }).success).toBe(true);
      expect(VideoCostChapterSchema.safeParse({ ...chapter, chapterIndex }).success).toBe(true);
    }
    for (const chapterIndex of [0, 25, 1.5, null]) {
      expect(VideoCostEntrySchema.safeParse({ ...entry, chapterIndex }).success).toBe(false);
      expect(VideoCostChapterSchema.safeParse({ ...chapter, chapterIndex }).success).toBe(false);
    }
  });

  it('accepts 60 models and rejects 61 models', () => {
    expect(VideoCostByStepSchema.safeParse({ ...project, models: Array.from({ length: 60 }, () => model) }).success).toBe(true);
    expect(VideoCostByStepSchema.safeParse({ ...project, models: Array.from({ length: 61 }, () => model) }).success).toBe(false);
  });

  it('accepts 24 chapters and rejects 25 chapters', () => {
    expect(VideoCostByStepSchema.safeParse({ ...project, chapters: Array.from({ length: 24 }, (_, index) => ({ ...chapter, chapterIndex: index + 1 })) }).success).toBe(true);
    expect(VideoCostByStepSchema.safeParse({ ...project, chapters: Array.from({ length: 25 }, () => chapter) }).success).toBe(false);
  });

  it('validates the finished rate basis and unmeasured count', () => {
    for (const usdPerMinuteBasis of ['misurato', 'stimato', 'non-misurato', null]) {
      expect(VideoCostByStepSchema.safeParse({ ...project, usdPerMinuteBasis }).success).toBe(true);
    }
    expect(VideoCostByStepSchema.safeParse({ ...project, usdPerMinuteBasis: 'boh' }).success).toBe(false);
    for (const unmeasuredEntries of [-1, 1.5, null, Infinity, NaN]) {
      expect(VideoCostByStepSchema.safeParse({ ...project, unmeasuredEntries }).success).toBe(false);
    }
  });

  it('validates model fields and rejects extra fields', () => {
    expect(VideoCostModelSchema.parse(model)).toEqual(model);
    for (const [field, max] of [['provider', 64], ['model', 100]] as const) {
      expect(VideoCostModelSchema.safeParse({ ...model, [field]: 'x'.repeat(max) }).success).toBe(true);
      expect(VideoCostModelSchema.safeParse({ ...model, [field]: '' }).success).toBe(false);
      expect(VideoCostModelSchema.safeParse({ ...model, [field]: 'x'.repeat(max + 1) }).success).toBe(false);
    }
    for (const field of ['quantity', 'costUsd']) {
      for (const value of [-1, NaN, Infinity]) {
        expect(VideoCostModelSchema.safeParse({ ...model, [field]: value }).success).toBe(false);
      }
      expect(VideoCostModelSchema.safeParse({ ...model, [field]: 0 }).success).toBe(true);
    }
    for (const invalid of [{ step: 'montaggio' }, { unit: 'euro' }, { basis: 'boh' }, { extra: true }]) {
      expect(VideoCostModelSchema.safeParse({ ...model, ...invalid }).success).toBe(false);
      expect(VideoCostByStepSchema.safeParse({ ...project, models: [{ ...model, ...invalid }] }).success).toBe(false);
    }
  });

  it('validates chapter costs, duration and rate', () => {
    expect(VideoCostChapterSchema.parse(chapter)).toEqual(chapter);
    expect(VideoCostChapterSchema.safeParse({ ...chapter, costUsd: 0, seconds: 0, usdPerMinute: 0 }).success).toBe(true);
    for (const field of ['costUsd', 'seconds', 'usdPerMinute']) {
      for (const value of [-1, NaN, Infinity]) {
        expect(VideoCostChapterSchema.safeParse({ ...chapter, [field]: value }).success).toBe(false);
        expect(VideoCostByStepSchema.safeParse({ ...project, chapters: [{ ...chapter, [field]: value }] }).success).toBe(false);
      }
    }
    expect(VideoCostChapterSchema.safeParse({ ...chapter, seconds: 1.5 }).success).toBe(false);
    expect(VideoCostChapterSchema.safeParse({ ...chapter, extra: true }).success).toBe(false);
  });

  it('accepts only bozza with an unmeasured zero cost', () => {
    expect(VideoCostByStepSchema.parse(project)).toEqual(project);
  });

  it('accepts three steps before a video is finished', () => {
    const pending: VideoCostByStep = {
      ...project,
      steps: [step, { ...step, step: 'ricerca', entries: [] }, { ...step, step: 'capitoli', entries: [] }],
    };
    expect(VideoCostByStepSchema.parse(pending)).toEqual(pending);
  });

  it('accepts a cost per minute for a finished video', () => {
    const finished = { ...project, finishedSeconds: 120, totalUsd: 2, usdPerMinute: 1 };
    expect(VideoCostByStepSchema.parse(finished)).toEqual(finished);
    expect(VideoCostByStepSchema.safeParse({ ...project, finishedSeconds: 0, usdPerMinute: 0 }).success).toBe(true);
  });

  it.each(['token', 'char', 'second', 'image', 'clip'])('accepts unit %s', (unit) => {
    expect(VideoCostUnitSchema.safeParse(unit).success).toBe(true);
    expect(VideoCostEntrySchema.safeParse({ ...entry, unit }).success).toBe(true);
  });

  it.each(['misurato', 'stimato', 'non-misurato'])('accepts basis %s', (basis) => {
    expect(VideoCostBasisSchema.safeParse(basis).success).toBe(true);
    expect(VideoCostEntrySchema.safeParse({ ...entry, basis }).success).toBe(true);
  });

  it('rejects basis: zero', () => {
    expect(VideoCostBasisSchema.safeParse('zero').success).toBe(false);
    expect(VideoCostEntrySchema.safeParse({ ...entry, basis: 'zero' }).success).toBe(false);
  });

  it('rejects unit euro', () => {
    expect(VideoCostUnitSchema.safeParse('euro').success).toBe(false);
    expect(VideoCostEntrySchema.safeParse({ ...entry, unit: 'euro' }).success).toBe(false);
  });

  it.each([-1, NaN, Infinity, -Infinity])('rejects invalid numeric value %s', (value) => {
    for (const field of ['quantity', 'costUsd']) {
      expect(VideoCostEntrySchema.safeParse({ ...entry, [field]: value }).success).toBe(false);
    }
    for (const field of ['estimatedUsd', 'confirmedUsd']) {
      expect(VideoCostStepSchema.safeParse({ ...step, [field]: value }).success).toBe(false);
    }
    for (const field of ['totalUsd', 'usdPerMinute', 'finishedSeconds']) {
      expect(VideoCostByStepSchema.safeParse({ ...project, [field]: value }).success).toBe(false);
    }
  });

  it('accepts zero and fractional consumption and costs', () => {
    expect(VideoCostEntrySchema.safeParse({ ...entry, quantity: 0 }).success).toBe(true);
    expect(VideoCostEntrySchema.safeParse({ ...entry, quantity: 0.5, costUsd: 0.01 }).success).toBe(true);
    expect(VideoCostStepSchema.safeParse({ ...step, estimatedUsd: 0.01, confirmedUsd: 0.02 }).success).toBe(true);
    expect(VideoCostByStepSchema.safeParse({ ...project, finishedSeconds: 180, totalUsd: 0.03, usdPerMinute: 0.01 }).success).toBe(true);
    expect(VideoCostByStepSchema.safeParse({ ...project, finishedSeconds: 1.5 }).success).toBe(false);
  });

  it('rejects step montaggio at both levels', () => {
    expect(VideoCostEntrySchema.safeParse({ ...entry, step: 'montaggio' }).success).toBe(false);
    expect(VideoCostStepSchema.safeParse({ ...step, step: 'montaggio' }).success).toBe(false);
  });

  it('accepts five steps and rejects six steps', () => {
    expect(VideoCostByStepSchema.safeParse({ ...project, steps: Array.from({ length: 5 }, () => step) }).success).toBe(true);
    expect(VideoCostByStepSchema.safeParse({ ...project, steps: Array.from({ length: 6 }, () => step) }).success).toBe(false);
    expect(VideoCostByStepSchema.safeParse({ ...project, steps: [] }).success).toBe(true);
  });

  it('accepts 200 entries and rejects 201 entries', () => {
    expect(VideoCostStepSchema.safeParse({ ...step, entries: Array.from({ length: 200 }, () => entry) }).success).toBe(true);
    expect(VideoCostStepSchema.safeParse({ ...step, entries: Array.from({ length: 201 }, () => entry) }).success).toBe(false);
  });

  it.each([
    ['provider', 64],
    ['model', 100],
    ['at', 40],
  ] as const)('enforces string bounds for %s', (field, max) => {
    expect(VideoCostEntrySchema.safeParse({ ...entry, [field]: '' }).success).toBe(false);
    expect(VideoCostEntrySchema.safeParse({ ...entry, [field]: 'x' }).success).toBe(true);
    expect(VideoCostEntrySchema.safeParse({ ...entry, [field]: 'x'.repeat(max) }).success).toBe(true);
    expect(VideoCostEntrySchema.safeParse({ ...entry, [field]: 'x'.repeat(max + 1) }).success).toBe(false);
  });

  it('rejects extra fields at every object level', () => {
    expect(VideoCostEntrySchema.safeParse({ ...entry, extra: true }).success).toBe(false);
    expect(VideoCostStepSchema.safeParse({ ...step, extra: true }).success).toBe(false);
    expect(VideoCostByStepSchema.safeParse({ ...project, extra: true }).success).toBe(false);
    expect(VideoCostByStepSchema.safeParse({ ...project, steps: [{ ...step, entries: [{ ...entry, extra: true }] }] }).success).toBe(false);
  });

  it('rejects an invalid project id', () => {
    expect(VideoCostByStepSchema.safeParse({ ...project, projectId: '' }).success).toBe(false);
    expect(VideoCostByStepSchema.safeParse({ ...project, projectId: 'not-a-project-id' }).success).toBe(false);
  });
});
