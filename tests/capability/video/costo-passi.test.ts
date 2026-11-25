import { describe, expect, it } from 'vitest';
import {
  VideoCostUnitSchema,
  VideoCostBasisSchema,
  VideoCostEntrySchema,
  VideoCostStepSchema,
  VideoCostByStepSchema,
  type VideoCostEntry,
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

// SUMMARY: adding 'zero' to VideoCostBasisSchema must make the "rejects basis: zero" case fail.
describe('costs by video step', () => {
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
