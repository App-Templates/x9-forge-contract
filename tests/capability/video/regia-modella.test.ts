import { describe, expect, it } from 'vitest';
import {
  VIDEO_MODEL_REGIA_MIN_SHOTS,
  VIDEO_MODEL_REGIA_MAX_SHOTS,
  VideoModelRegiaDocumentSchema,
  VideoModelShotSchema,
  VideoRegiaDocumentSchema,
  VideoRegiaResultSchema,
  VideoStoryRegiaDocumentSchema,
  type VideoModelRegiaDocument,
  type VideoModelShot,
  type VideoStoryRegiaDocument,
} from '../../../src/capability/video/index.js';

const room = 'A bright dressing room with a full-length mirror.';
const shots: VideoModelShot[] = [
  {
    title: 'Getting ready', location: 'Dressing room', environment: room, interior: true,
    action: 'The model checks her outfit in the mirror.', camera: 'Medium static shot',
    wardrobe: 'base', durationSeconds: 6,
  },
  {
    title: 'The new look', location: 'Dressing room', environment: room, interior: true,
    action: 'The model turns to show the new outfit.', camera: 'Full body slow push in',
    wardrobe: 'look', durationSeconds: 6,
  },
  {
    title: 'Going out', location: 'Terrace', environment: 'A terrace in warm evening light.', interior: false,
    action: 'The model walks towards a table.', camera: 'Wide tracking shot',
    wardrobe: 'look', durationSeconds: 6,
  },
];
const direction: VideoModelRegiaDocument = {
  version: 2, shots, outfitNote: 'An evening look for an aperitif.', caption: 'Provo questo look per un aperitivo',
};
const story: VideoStoryRegiaDocument = {
  version: 1,
  scenes: [{ text: 'Le piante parlano.', tags: ['calm'] }, { text: 'Ascoltale.' }],
  footage: ['piante-02'],
  outro: { title: 'In pratica', line: 'Ogni pianta ha un ritmo.' },
};

describe('fixed-model regia document', () => {
  it('accepts three shots with and without an outfit note', () => {
    expect(VideoModelRegiaDocumentSchema.parse(direction)).toEqual(direction);
    const { outfitNote: _note, ...withoutNote } = direction;
    expect(VideoRegiaDocumentSchema.parse(withoutNote)).toEqual(withoutNote);
    expect([VIDEO_MODEL_REGIA_MIN_SHOTS, VIDEO_MODEL_REGIA_MAX_SHOTS]).toEqual([3, 8]);
    expect(VideoModelRegiaDocumentSchema.parse({ ...direction, shots: Array.from({ length: 8 }, () => shots[0]) }).shots).toHaveLength(8);
  });

  it.each([2, 9])('refuses %i shots', (count) => {
    // SUMMARY mutation: changing max(8) to max(9) must make the 9-shot case fail.
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, shots: Array.from({ length: count }, () => shots[0]) }).success).toBe(false);
  });

  it.each([1, 16, 4.5])('refuses durationSeconds %s', (durationSeconds) => {
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, shots: [{ ...shots[0], durationSeconds }, ...shots.slice(1)] }).success).toBe(false);
  });

  it.each([2, 15])('accepts durationSeconds boundary %i', (durationSeconds) => {
    expect(VideoModelShotSchema.parse({ ...shots[0], durationSeconds }).durationSeconds).toBe(durationSeconds);
  });

  it.each([
    { wardrobe: 'altro' },
    { location: 'Dressing\nroom' },
    { location: 'Dressing\rroom' },
    { interior: 'true' },
    { extra: 'unexpected' },
  ])('refuses invalid shot fields %j', (fields) => {
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, shots: [{ ...shots[0], ...fields }, ...shots.slice(1)] }).success).toBe(false);
  });

  it.each([
    ['title', 120], ['location', 100], ['environment', 350], ['action', 350], ['camera', 200],
  ] as const)('bounds shot text %s', (field, maximum) => {
    expect(VideoModelShotSchema.safeParse({ ...shots[0], [field]: '' }).success).toBe(false);
    expect(VideoModelShotSchema.safeParse({ ...shots[0], [field]: 'x'.repeat(maximum) }).success).toBe(true);
    expect(VideoModelShotSchema.safeParse({ ...shots[0], [field]: 'x'.repeat(maximum + 1) }).success).toBe(false);
  });

  it.each([['caption', 200], ['outfitNote', 700]] as const)('trims and bounds document text %s', (field, maximum) => {
    expect(VideoModelRegiaDocumentSchema.parse({ ...direction, [field]: ' text ' })[field]).toBe('text');
    expect(VideoModelRegiaDocumentSchema.safeParse({ ...direction, [field]: ' ' }).success).toBe(false);
    expect(VideoModelRegiaDocumentSchema.safeParse({ ...direction, [field]: 'x'.repeat(maximum) }).success).toBe(true);
    expect(VideoModelRegiaDocumentSchema.safeParse({ ...direction, [field]: 'x'.repeat(maximum + 1) }).success).toBe(false);
  });

  it('trims the shot title and location', () => {
    expect(VideoModelShotSchema.parse({ ...shots[0], title: ' Title ', location: ' Room ' })).toMatchObject({ title: 'Title', location: 'Room' });
    for (const field of ['title', 'location']) {
      expect(VideoModelShotSchema.safeParse({ ...shots[0], [field]: ' ' }).success).toBe(false);
    }
  });

  it('requires a caption and refuses extra document fields', () => {
    const { caption: _caption, ...withoutCaption } = direction;
    expect(VideoRegiaDocumentSchema.safeParse(withoutCaption).success).toBe(false);
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, extra: true }).success).toBe(false);
  });

  it('selects by version and preserves the story document unchanged', () => {
    expect(VideoStoryRegiaDocumentSchema.parse(story)).toEqual(story);
    expect(VideoRegiaDocumentSchema.parse(story)).toEqual(story);
    const { footage: _footage, ...withoutFootage } = story;
    expect(VideoRegiaDocumentSchema.parse(withoutFootage)).toEqual(withoutFootage);
    expect(VideoRegiaDocumentSchema.parse(direction)).toEqual(direction);
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, version: 1 }).success).toBe(false);
    expect(VideoRegiaDocumentSchema.safeParse({ ...story, version: 2 }).success).toBe(false);
    expect(VideoRegiaDocumentSchema.safeParse({ ...direction, version: 3 }).success).toBe(false);
  });

  it('delivers v2 together with grafica.html and requires the graphic file', () => {
    const delivered = {
      status: 'delivered', regiaId: 12, repo: 'App-Templates/sessioni', branch: 'consegna/12',
      commit: 'b'.repeat(40), link: 'https://github.com/App-Templates/sessioni/tree/' + 'b'.repeat(40),
      regia: direction,
      regiaFile: { path: 'regia.json', sha256: 'a'.repeat(64), sizeBytes: 120 },
      graphicHtml: '<script>function render(t){}</script>',
      graphicFile: { path: 'grafica.html', sha256: 'c'.repeat(64), sizeBytes: 36 },
    };
    expect(VideoRegiaResultSchema.parse(delivered)).toEqual(delivered);
    const { graphicFile: _graphic, ...withoutGraphicFile } = delivered;
    expect(VideoRegiaResultSchema.safeParse(withoutGraphicFile).success).toBe(false);
  });
});
