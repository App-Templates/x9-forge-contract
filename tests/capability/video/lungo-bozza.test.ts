import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  VideoLongChapterSchema,
  VideoLongUsageSchema,
  VideoLongDraftDocumentSchema,
  VideoLongDraftStatusSchema,
  VideoLongDraftSchema,
  VideoLongDraftApproveRequestSchema,
} from '../../../src/capability/video/index.js';

const chapter = (index: number) => ({
  index,
  title: `Capitolo ${index}`,
  summary: 'Che cosa succede in questo capitolo.',
  targetSeconds: 100,
});

const usage = {
  provider: 'anthropic',
  model: 'claude-sonnet-5-5',
  inputTokens: 1200,
  outputTokens: 800,
  measured: false,
};

const document = () => ({
  logline: 'Una storia in una riga.',
  thesis: 'La tesi del video.',
  paragraphs: ['Primo paragrafo.', 'Secondo paragrafo.'],
  chapters: [chapter(1), chapter(2), chapter(3)],
  usage,
});

const digest = 'a'.repeat(64);

const draft = () => ({
  revision: 1,
  status: 'bozza' as const,
  ...document(),
  totalSeconds: 300,
  digest,
  approvedAt: null,
});

describe('lungo-bozza contracts', () => {
  it('accepts a real document and null usage', () => {
    expect(VideoLongDraftDocumentSchema.safeParse(document()).success).toBe(true);
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), usage: null }).success).toBe(true);
  });

  it('accepts a draft and an approved draft', () => {
    expect(VideoLongDraftSchema.safeParse(draft()).success).toBe(true);
    const approved = { ...draft(), status: 'approvata', approvedAt: '2026-11-25T10:00:00Z' };
    expect(VideoLongDraftSchema.safeParse(approved).success).toBe(true);
    expect(VideoLongDraftStatusSchema.safeParse('altro').success).toBe(false);
  });

  it('rejects 0 and 25 chapters', () => {
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), chapters: [] }).success).toBe(false);
    const many = Array.from({ length: 25 }, (_, i) => chapter(i + 1));
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), chapters: many }).success).toBe(false);
    const max = Array.from({ length: 24 }, (_, i) => chapter(i + 1));
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), chapters: max }).success).toBe(true);
  });

  it('rejects bad chapter fields', () => {
    expect(VideoLongChapterSchema.safeParse(chapter(0)).success).toBe(false);
    expect(VideoLongChapterSchema.safeParse(chapter(25)).success).toBe(false);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), targetSeconds: 9 }).success).toBe(false);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), targetSeconds: 10 }).success).toBe(true);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), targetSeconds: 601 }).success).toBe(false);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), targetSeconds: 600 }).success).toBe(true);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), title: '' }).success).toBe(false);
    expect(VideoLongChapterSchema.safeParse({ ...chapter(1), extra: 1 }).success).toBe(false);
  });

  it('rejects 0 and 41 paragraphs and a 1201-character paragraph', () => {
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), paragraphs: [] }).success).toBe(false);
    const many = Array.from({ length: 41 }, () => 'testo');
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), paragraphs: many }).success).toBe(false);
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), paragraphs: Array.from({ length: 40 }, () => 'testo') }).success).toBe(true);
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), paragraphs: ['x'.repeat(1201)] }).success).toBe(false);
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), paragraphs: ['x'.repeat(1200)] }).success).toBe(true);
  });

  it('rejects a malformed digest', () => {
    expect(VideoLongDraftSchema.safeParse({ ...draft(), digest: 'abc' }).success).toBe(false);
    expect(VideoLongDraftSchema.safeParse({ ...draft(), digest: 'A'.repeat(64) }).success).toBe(false);
    expect(VideoLongDraftSchema.safeParse({ ...draft(), digest: 'a'.repeat(65) }).success).toBe(false);
    expect(VideoLongDraftApproveRequestSchema.safeParse({ revision: 1, digest: 'abc' }).success).toBe(false);
    expect(VideoLongDraftApproveRequestSchema.safeParse({ revision: 1, digest: 'A'.repeat(64) }).success).toBe(false);
  });

  it('accepts the approve request and rejects a bad revision', () => {
    expect(VideoLongDraftApproveRequestSchema.safeParse({ revision: 2, digest }).success).toBe(true);
    expect(VideoLongDraftApproveRequestSchema.safeParse({ revision: 0, digest }).success).toBe(false);
    expect(VideoLongDraftApproveRequestSchema.safeParse({ revision: 2, digest, extra: 1 }).success).toBe(false);
  });

  it('rejects negative tokens and extra fields', () => {
    expect(VideoLongUsageSchema.safeParse({ ...usage, inputTokens: -1 }).success).toBe(false);
    expect(VideoLongUsageSchema.safeParse({ ...usage, outputTokens: -1 }).success).toBe(false);
    expect(VideoLongUsageSchema.safeParse({ ...usage, extra: 1 }).success).toBe(false);
    expect(VideoLongDraftDocumentSchema.safeParse({ ...document(), extra: 1 }).success).toBe(false);
    expect(VideoLongDraftSchema.safeParse({ ...draft(), extra: 1 }).success).toBe(false);
  });

  it('keeps cross-field checks out of the contract', () => {
    const source = readFileSync(new URL('../../../src/capability/video/lungo-bozza.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
