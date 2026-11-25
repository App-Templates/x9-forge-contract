import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AssetRefSchema } from '../../../src/organization/asset.js';
import { LabQueryInputSchema } from '../../../src/capability/lab/tools.js';
import { ResearchStateSchema } from '../../../src/capability/ricerca/research.js';
import { VideoEngineRevisionSchema } from '../../../src/capability/video/engine.js';
import {
  VIDEO_LONG_RESEARCH_MAX_QUESTIONS,
  VideoLongDraftSchema,
  VideoLongResearchStartRequestSchema,
  VideoLongResearchSchema,
  VideoLongResearchRefusalSchema,
  type VideoLongResearchStartRequest,
  type VideoLongResearch,
} from '../../../src/capability/video/index.js';

const request: VideoLongResearchStartRequest = {
  draftRevision: 2,
  draftDigest: 'a'.repeat(64),
  questions: [
    'Quali innovazioni hanno reso possibile il cinema sonoro?',
    'Quali fonti documentano il passaggio dal muto al sonoro in Italia?',
    'Come sono cambiate le sale cinematografiche con il sonoro?',
  ],
  labClientId: 'studio-cinema',
  labProjectId: 'storia-del-cinema',
};

const research: VideoLongResearch = {
  projectId: 'b'.repeat(32),
  draftRevision: request.draftRevision,
  draftDigest: request.draftDigest,
  state: 'queued',
  gapsRef: null,
  researchIds: [],
  startedAt: '2026-11-25T10:00:00Z',
  finishedAt: null,
};

// SUMMARY: removing .max(VIDEO_LONG_RESEARCH_MAX_QUESTIONS) from questions
// makes the 13-question rejection test fail.
// Replacing LabQueryInputSchema.shape.question with z.string() makes the
// 2001-character question rejection test fail. Mutations run at the gate.
describe('long video research contracts', () => {
  it('accepts a real three-question request and a queued research with null gapsRef', () => {
    expect(VideoLongResearchStartRequestSchema.parse(request)).toEqual(request);
    expect(VideoLongResearchSchema.parse(research)).toEqual(research);
  });

  it('reuses lab, asset, research state and draft schemas', () => {
    expect(VIDEO_LONG_RESEARCH_MAX_QUESTIONS).toBe(12);
    expect(VideoLongResearchStartRequestSchema.shape.questions.element).toBe(LabQueryInputSchema.shape.question);
    expect(VideoLongResearchStartRequestSchema.shape.labClientId).toBe(AssetRefSchema.shape.companyId);
    expect(VideoLongResearchStartRequestSchema.shape.labProjectId).toBe(AssetRefSchema.shape.projectId);
    expect(VideoLongResearchStartRequestSchema.shape.draftRevision).toBe(VideoEngineRevisionSchema);
    expect(VideoLongResearchStartRequestSchema.shape.draftDigest).toBe(VideoLongDraftSchema.shape.digest);
    expect(VideoLongResearchSchema.shape.state).toBe(ResearchStateSchema);
  });

  it.each([0, 13])('rejects %s questions', (count) => {
    const questions = Array.from({ length: count }, (_, i) => `Question ${i + 1}?`);
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, questions }).success).toBe(false);
  });

  it.each([1, 12])('accepts %s questions', (count) => {
    const questions = Array.from({ length: count }, (_, i) => `Question ${i + 1}?`);
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, questions }).success).toBe(true);
  });

  it.each([
    ['empty', ''],
    ['whitespace', '   '],
    ['2001-character', 'x'.repeat(2001)],
  ])('rejects a %s question', (_label, question) => {
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, questions: [question] }).success).toBe(false);
  });

  it('accepts a 2000-character question and trims questions through the lab schema', () => {
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, questions: ['x'.repeat(2000)] }).success).toBe(true);
    expect(VideoLongResearchStartRequestSchema.parse({ ...request, questions: [' Question? '] }).questions).toEqual(['Question?']);
  });

  it.each([
    { draftDigest: 'abc' },
    { draftDigest: 'A'.repeat(64) },
    { draftRevision: 0 },
    { extra: true },
  ])('rejects invalid draft references or extra fields %j', (invalid) => {
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, ...invalid }).success).toBe(false);
    expect(VideoLongResearchSchema.safeParse({ ...research, ...invalid }).success).toBe(false);
  });

  it.each([
    { labClientId: '' },
    { labClientId: 'x'.repeat(65) },
    { labProjectId: '' },
    { labProjectId: 'x'.repeat(65) },
  ])('rejects invalid lab scope %j', (invalid) => {
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, ...invalid }).success).toBe(false);
  });

  it('accepts 12 research ids and rejects 13', () => {
    const researchIds = Array.from({ length: 12 }, (_, i) => `research-${i + 1}`);
    expect(VideoLongResearchSchema.safeParse({ ...research, researchIds }).success).toBe(true);
    expect(VideoLongResearchSchema.safeParse({ ...research, researchIds: [...researchIds, 'research-13'] }).success).toBe(false);
  });

  it('accepts completed research with a gaps reference and finish time', () => {
    expect(VideoLongResearchSchema.safeParse({
      ...research, state: 'completed', gapsRef: 'lab-gaps-1', researchIds: ['research-1'],
      finishedAt: '2026-11-25T10:05:00Z',
    }).success).toBe(true);
  });

  it.each([
    { projectId: 'invalid' },
    { state: 'unknown' },
    { gapsRef: 'bad' },
    { researchIds: [''] },
    { researchIds: ['x'.repeat(101)] },
    { startedAt: '' },
    { startedAt: 'x'.repeat(41) },
    { finishedAt: '' },
    { finishedAt: 'x'.repeat(41) },
  ])('rejects invalid research fields %j', (invalid) => {
    expect(VideoLongResearchSchema.safeParse({ ...research, ...invalid }).success).toBe(false);
  });

  it('exports the five refusal reasons and rejects an unknown reason', () => {
    expect(VideoLongResearchRefusalSchema.options).toEqual([
      'bozza_non_approvata', 'revisione_cambiata', 'impronta_diversa',
      'ricerca_gia_avviata', 'motore_non_disponibile',
    ]);
    expect(VideoLongResearchRefusalSchema.safeParse('unknown').success).toBe(false);
  });

  it('keeps question uniqueness in the engine and uses portable lab question validation', () => {
    expect(VideoLongResearchStartRequestSchema.safeParse({ ...request, questions: ['Question?', 'Question?'] }).success).toBe(true);
    const source = readFileSync(new URL('../../../src/capability/video/lungo-ricerca.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
    expect(source).toContain('LabQueryInputSchema');
  });
});
