import { describe, expect, it } from 'vitest';
import {
  VideoLongChapterSchema,
  VideoLongFramingSchema,
  VideoLongResearchedChapterSchema,
  VideoLongChaptersDocumentSchema,
  VideoLongChaptersSchema,
  VideoLongChaptersApproveRequestSchema,
  type VideoLongResearchedChapter,
} from '../../../src/capability/video/index.js';

const chapter = (index: number, over: Record<string, unknown> = {}): VideoLongResearchedChapter => ({
  index,
  title: `Capitolo ${index}`,
  summary: 'Il passaggio dal muto al sonoro nelle sale.',
  targetSeconds: 120,
  sourceIds: ['source-archivio'],
  frameHypotheses: [
    { description: 'La studiosa parla seduta in poltrona.', framing: 'intervista', sourceId: 'source-archivio' },
    { description: 'Partono le immagini di repertorio delle sale.', framing: 'immagini', sourceId: null },
  ],
  ...over,
});

const doc = (chapters: unknown[] = [chapter(1), chapter(2), chapter(3)]) => ({
  draftRevision: 2,
  dossierRevision: 1,
  chapters,
  usage: null,
});

const digest = 'a'.repeat(64);
const full = (over: Record<string, unknown> = {}) => ({
  ...doc(), revision: 1, status: 'da-approvare', totalSeconds: 360, digest, approvedAt: null, ...over,
});

describe('capitoli ricostruiti', () => {
  it('accetta 3 capitoli con fonti e ipotesi, una con sourceId null', () => {
    expect(VideoLongChaptersDocumentSchema.safeParse(doc()).success).toBe(true);
  });
  it('accetta i capitoli approvati con approvedAt', () => {
    expect(VideoLongChaptersSchema.safeParse(full({ status: 'approvati', approvedAt: '2026-11-25T10:00:00Z' })).success).toBe(true);
    expect(VideoLongChaptersSchema.safeParse(full()).success).toBe(true);
  });
  it('accetta tutti i valori di framing', () => {
    for (const f of ['intervista', 'immagini', 'ambiente', 'grafica']) {
      expect(VideoLongFramingSchema.safeParse(f).success).toBe(true);
    }
  });
  it('rifiuta framing drone', () => {
    const c = chapter(1, { frameHypotheses: [{ description: 'x', framing: 'drone', sourceId: null }] });
    expect(VideoLongResearchedChapterSchema.safeParse(c).success).toBe(false);
  });
  it('rifiuta capitolo con 0 ipotesi e con 7', () => {
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { frameHypotheses: [] })).success).toBe(false);
    const h = { description: 'x', framing: 'ambiente', sourceId: null };
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { frameHypotheses: Array(7).fill(h) })).success).toBe(false);
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { frameHypotheses: Array(6).fill(h) })).success).toBe(true);
  });
  it('rifiuta 11 sourceIds', () => {
    const ids = Array.from({ length: 11 }, (_, i) => `source-${i}`);
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { sourceIds: ids })).success).toBe(false);
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { sourceIds: ids.slice(0, 10) })).success).toBe(true);
  });
  it('rifiuta targetSeconds 9 e 601', () => {
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { targetSeconds: 9 })).success).toBe(false);
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(1, { targetSeconds: 601 })).success).toBe(false);
  });
  it('rifiuta indice 0 e 25', () => {
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(0)).success).toBe(false);
    expect(VideoLongResearchedChapterSchema.safeParse(chapter(25)).success).toBe(false);
  });
  it('rifiuta 0 e 25 capitoli', () => {
    expect(VideoLongChaptersDocumentSchema.safeParse(doc([])).success).toBe(false);
    const many = Array.from({ length: 25 }, (_, i) => chapter((i % 24) + 1));
    expect(VideoLongChaptersDocumentSchema.safeParse(doc(many)).success).toBe(false);
  });
  it('rifiuta digest abc e campi in più', () => {
    expect(VideoLongChaptersSchema.safeParse(full({ digest: 'abc' })).success).toBe(false);
    expect(VideoLongChaptersSchema.safeParse(full({ extra: 1 })).success).toBe(false);
    expect(VideoLongChaptersApproveRequestSchema.safeParse({ revision: 1, digest: 'abc' }).success).toBe(false);
    expect(VideoLongChaptersApproveRequestSchema.safeParse({ revision: 1, digest, extra: 1 }).success).toBe(false);
    expect(VideoLongChaptersApproveRequestSchema.safeParse({ revision: 1, digest }).success).toBe(true);
    expect(VideoLongChaptersSchema.safeParse(full({ status: 'approvata' })).success).toBe(false);
  });
  it('il capitolo della bozza senza fonti né ipotesi vale ancora', () => {
    const { sourceIds, frameHypotheses, ...plain } = chapter(1);
    void sourceIds; void frameHypotheses;
    expect(VideoLongChapterSchema.safeParse(plain).success).toBe(true);
    expect(VideoLongResearchedChapterSchema.safeParse(plain).success).toBe(false);
  });
});

// SUMMARY mutazioni: frameHypotheses.min(1) -> min(0): rosso il caso con 0 ipotesi;
// tolto 'intervista' dall'enum framing: rosso il caso dei valori di framing.
