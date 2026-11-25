import { describe, expect, it } from 'vitest';
import { WikiOriginSchema, WikiPageSlugSchema, WikiSourceIdSchema } from '../../../src/capability/lab/wiki.js';
import { ResearchCostSchema, ResearchIdSchema } from '../../../src/capability/ricerca/research.js';
import {
  VIDEO_LONG_MAX_SOURCES,
  VIDEO_LONG_MAX_CLAIMS,
  VideoLongSourceSchema,
  VideoLongClaimSchema,
  VideoLongDossierDocumentSchema,
  VideoLongDossierSchema,
  type VideoLongSource,
  type VideoLongClaim,
  type VideoLongDossierDocument,
  type VideoLongDossier,
} from '../../../src/capability/video/index.js';

const sources: VideoLongSource[] = [
  {
    id: 'source-archivio', title: 'Il passaggio al cinema sonoro',
    url: 'https://example.org/archivio/cinema-sonoro', publisher: 'Archivio del cinema',
    excerpt: 'La sincronizzazione fra suono e immagine richiese nuovi apparati nelle sale.',
    origin: 'web', labPageSlug: 'cinema-sonoro', retrievedAt: '2026-11-25T10:00:00Z',
  },
  {
    id: 'source-sale', title: 'Censimento delle sale cinematografiche',
    url: 'https://example.org/dataset/sale', publisher: 'Istituto di ricerca',
    excerpt: 'Il censimento documenta la progressiva conversione degli impianti di proiezione.',
    origin: 'dataset', labPageSlug: null, retrievedAt: '2026-11-25T10:01:00Z',
  },
  {
    id: 'source-intervista', title: null, url: null, publisher: null,
    excerpt: 'Secondo la testimonianza raccolta, la sala conservò gli apparati precedenti.',
    origin: 'human', labPageSlug: 'testimonianze-sale', retrievedAt: '2026-11-25T10:02:00Z',
  },
];

const claims: VideoLongClaim[] = [
  { id: 'claim-1', text: 'Il sonoro richiese nuovi apparati nelle sale.', sourceIds: ['source-archivio'], attributed: false },
  { id: 'claim-2', text: 'La conversione delle sale fu progressiva.', sourceIds: ['source-sale'], attributed: false },
  { id: 'claim-3', text: 'Il testimone ricorda la conservazione dei vecchi apparati.', sourceIds: ['source-intervista'], attributed: true },
  { id: 'claim-4', text: 'Le fonti documentano cambiamenti tecnici nelle sale.', sourceIds: ['source-archivio', 'source-sale'], attributed: false },
];

const document: VideoLongDossierDocument = {
  draftRevision: 2, researchIds: ['research-cinema', 'research-sale'], sources, claims, costUsd: 0.035,
};
const dossier: VideoLongDossier = {
  ...document, revision: 1, digest: 'a1'.repeat(32), recordedAt: '2026-11-25T10:05:00Z',
};

// SUMMARY: changing sourceIds.min(1) to min(0) makes
// "rejects a claim without sources" fail.
// Removing costUsd.nullable() makes "accepts an unmeasured cost" fail.
// Mutations, acceptance and type checks run at the gate.
describe('long video research dossier contracts', () => {
  it('accepts a dossier with three sources, four claims and a human source without a URL', () => {
    expect(VideoLongDossierSchema.parse(dossier)).toEqual(dossier);
    expect(VideoLongDossierDocumentSchema.parse(document)).toEqual(document);
  });

  it('reuses lab identifiers, origins, research identifiers and cost validation', () => {
    expect(VIDEO_LONG_MAX_SOURCES).toBe(60);
    expect(VIDEO_LONG_MAX_CLAIMS).toBe(200);
    expect(VideoLongSourceSchema.shape.id).toBe(WikiSourceIdSchema);
    expect(VideoLongSourceSchema.shape.origin).toBe(WikiOriginSchema);
    expect(VideoLongSourceSchema.shape.labPageSlug.unwrap()).toBe(WikiPageSlugSchema);
    expect(VideoLongClaimSchema.shape.sourceIds.element).toBe(WikiSourceIdSchema);
    expect(VideoLongDossierDocumentSchema.shape.researchIds.element).toBe(ResearchIdSchema);
    expect(VideoLongDossierDocumentSchema.shape.costUsd.unwrap()).toBe(ResearchCostSchema.shape.usd);
  });

  it('accepts sixty sources and rejects sixty-one', () => {
    const atLimit = Array.from({ length: 60 }, (_, i) => ({ ...sources[0], id: `source-${i}` }));
    expect(VideoLongDossierSchema.safeParse({ ...dossier, sources: atLimit }).success).toBe(true);
    expect(VideoLongDossierSchema.safeParse({ ...dossier, sources: [...atLimit, sources[0]] }).success).toBe(false);
  });

  it('accepts two hundred claims and rejects two hundred and one', () => {
    const atLimit = Array.from({ length: 200 }, (_, i) => ({ ...claims[0], id: `claim-${i}` }));
    expect(VideoLongDossierSchema.safeParse({ ...dossier, claims: atLimit }).success).toBe(true);
    expect(VideoLongDossierSchema.safeParse({ ...dossier, claims: [...atLimit, claims[0]] }).success).toBe(false);
  });

  it('rejects a claim without sources', () => {
    expect(VideoLongDossierSchema.safeParse({
      ...dossier, claims: [{ ...claims[2], sourceIds: [] }],
    }).success).toBe(false);
  });

  it('accepts five sources for a claim and rejects six', () => {
    const sourceIds = Array.from({ length: 5 }, (_, i) => `source-${i}`);
    expect(VideoLongClaimSchema.safeParse({ ...claims[0], sourceIds }).success).toBe(true);
    expect(VideoLongDossierSchema.safeParse({
      ...dossier, claims: [{ ...claims[0], sourceIds: [...sourceIds, 'source-6'] }],
    }).success).toBe(false);
  });

  it.each([
    { id: '' }, { id: 'x'.repeat(101) },
    { title: '' }, { title: 'x'.repeat(501) },
    { url: 'not-a-url' }, { url: `https://example.org/${'x'.repeat(2000)}` },
    { publisher: '' }, { publisher: 'x'.repeat(201) },
    { excerpt: '' }, { excerpt: 'x'.repeat(601) },
    { origin: 'rete' }, { labPageSlug: 'Invalid slug' },
    { retrievedAt: '' }, { retrievedAt: 'x'.repeat(41) }, { extra: true },
  ])('rejects invalid source fields %j', (invalid) => {
    expect(VideoLongDossierSchema.safeParse({ ...dossier, sources: [{ ...sources[0], ...invalid }] }).success).toBe(false);
  });

  it.each([
    { id: '' }, { id: 'x'.repeat(65) }, { text: '' }, { text: 'x'.repeat(601) },
    { sourceIds: [''] }, { sourceIds: ['x'.repeat(101)] }, { attributed: 'true' }, { extra: true },
  ])('rejects invalid claim fields %j', (invalid) => {
    expect(VideoLongDossierSchema.safeParse({ ...dossier, claims: [{ ...claims[0], ...invalid }] }).success).toBe(false);
  });

  it('accepts source and claim text at their limits', () => {
    expect(VideoLongSourceSchema.safeParse({
      ...sources[0], title: 'x'.repeat(500), publisher: 'x'.repeat(200), excerpt: 'x'.repeat(600),
      url: `https://example.org/${'x'.repeat(1980)}`, retrievedAt: 'x'.repeat(40),
    }).success).toBe(true);
    expect(VideoLongClaimSchema.safeParse({ ...claims[0], id: 'x'.repeat(64), text: 'x'.repeat(600) }).success).toBe(true);
  });

  it.each([
    { revision: 0 }, { revision: 1.5 }, { draftRevision: 0 }, { draftRevision: 1.5 },
    { digest: 'A1'.repeat(32) }, { digest: 'g'.repeat(64) }, { digest: 'a'.repeat(63) },
    { recordedAt: '' }, { recordedAt: 'x'.repeat(41) },
    { researchIds: [''] }, { researchIds: ['x'.repeat(101)] },
    { costUsd: -0.01 }, { costUsd: Infinity }, { costUsd: -Infinity }, { costUsd: NaN },
    { extra: true },
  ])('rejects invalid dossier fields %j', (invalid) => {
    expect(VideoLongDossierSchema.safeParse({ ...dossier, ...invalid }).success).toBe(false);
  });

  it('rejects extra fields in a dossier document', () => {
    expect(VideoLongDossierDocumentSchema.safeParse({ ...document, extra: true }).success).toBe(false);
  });

  it('accepts twelve research identifiers and rejects thirteen', () => {
    const researchIds = Array.from({ length: 12 }, (_, i) => `research-${i}`);
    expect(VideoLongDossierSchema.safeParse({ ...dossier, researchIds }).success).toBe(true);
    expect(VideoLongDossierSchema.safeParse({ ...dossier, researchIds: [...researchIds, 'research-13'] }).success).toBe(false);
  });

  it('accepts an unmeasured cost', () => {
    expect(VideoLongDossierSchema.parse({ ...dossier, costUsd: null }).costUsd).toBeNull();
    expect(VideoLongDossierDocumentSchema.parse({ ...document, costUsd: null }).costUsd).toBeNull();
  });

  it('accepts a measured zero cost and empty collections', () => {
    expect(VideoLongDossierSchema.safeParse({
      ...dossier, costUsd: 0, researchIds: [], sources: [], claims: [],
    }).success).toBe(true);
  });

  it('leaves source reference consistency to the engine', () => {
    expect(VideoLongDossierSchema.safeParse({
      ...dossier, claims: [{ ...claims[2], sourceIds: ['source-not-in-dossier'] }],
    }).success).toBe(true);
  });
});
