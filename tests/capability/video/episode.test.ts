import { describe, expect, it } from 'vitest';
import {
  VideoEpisodeContextSchema,
  VideoEpisodeCycleBeatSchema,
  VideoEpisodeEndingTypeSchema,
  VideoEpisodeEstimateSchema,
  VideoEpisodeOutcomeSchema,
  VideoSeriesPhaseSchema,
  VideoSeriesViewSchema,
} from '../../../src/capability/video/index';

const SERIES_ID = '3f2b8c1e-5d4a-4b7c-9e10-a1b2c3d4e5f6';
const PORTRAIT = {
  engineProjectId: 'a'.repeat(32),
  fileName: 'ritratto-anna.png',
  sha256: 'b'.repeat(64),
};
const MAIN_HOOK = {
  id: 'main-secret',
  description: 'Il segreto della madre di Anna',
  plantedEpisode: 1,
  lastTouchedEpisode: 1,
  status: 'open',
  isMain: true,
  paidEpisode: null,
};
const ANNA = { id: 'anna', name: 'Anna', description: 'La protagonista, 30 anni, capelli scuri', portrait: null };
const MARCO = { id: 'marco', name: 'Marco', description: 'Il marito, freddo e calcolatore', portrait: null };
const ENDING = { type: 'identity-flash', text: 'Anna riconosce la voce al telefono: è Marco.' };

const episode1 = {
  seriesId: SERIES_ID,
  seriesTitle: 'La moglie sbagliata',
  logline: 'Una donna scopre che il marito vive due vite.',
  language: 'it',
  episodeNumber: 1,
  totalEpisodes: 20,
  paywallEpisode: 8,
  previousEnding: null,
  hooks: [MAIN_HOOK],
  characters: [ANNA, MARCO],
};
const episode2 = {
  ...episode1,
  episodeNumber: 2,
  previousEnding: ENDING,
  characters: [{ ...ANNA, portrait: PORTRAIT }, MARCO],
};

const outcome = {
  phase: 'golden_three',
  cycleBeat: null,
  ending: ENDING,
  hooksOpened: [{ id: 'lettera', description: 'Una lettera mai spedita' }],
  hooksTouched: ['main-secret'],
  hooksClosed: [],
};

describe('episode context', () => {
  it('accepts episode 1 (no previous ending) and episode 2 (ending and a portrait)', () => {
    expect(VideoEpisodeContextSchema.safeParse(episode1).success).toBe(true);
    expect(VideoEpisodeContextSchema.safeParse(episode2).success).toBe(true);
  });

  it.each([
    ['episodeNumber 0', { ...episode1, episodeNumber: 0 }],
    ['totalEpisodes 4', { ...episode1, totalEpisodes: 4 }],
    ['paywallEpisode 3', { ...episode1, paywallEpisode: 3 }],
    ['7 characters', { ...episode1, characters: Array.from({ length: 7 }, (_, i) => ({ ...ANNA, id: `p-${i}` })) }],
    ['0 characters', { ...episode1, characters: [] }],
    ['hook id Main_Secret', { ...episode1, hooks: [{ ...MAIN_HOOK, id: 'Main_Secret' }] }],
    ['extra field', { ...episode1, extra: true }],
    ['fileName ../x.png', { ...episode2, characters: [{ ...ANNA, portrait: { ...PORTRAIT, fileName: '../x.png' } }] }],
    ['uppercase sha256', { ...episode2, characters: [{ ...ANNA, portrait: { ...PORTRAIT, sha256: 'B'.repeat(64) } }] }],
  ])('rejects %s', (_name, value) => {
    expect(VideoEpisodeContextSchema.safeParse(value).success).toBe(false);
  });
});

describe('episode outcome', () => {
  it('accepts a null cycle beat', () => {
    expect(VideoEpisodeOutcomeSchema.safeParse(outcome).success).toBe(true);
  });

  it('rejects an unknown ending type, 6 opened hooks and an unknown beat', () => {
    expect(VideoEpisodeOutcomeSchema.safeParse({ ...outcome, ending: { ...ENDING, type: 'cliffhanger' } }).success).toBe(false);
    const six = Array.from({ length: 6 }, (_, i) => ({ id: `gancio-${i}`, description: 'Un gancio' }));
    expect(VideoEpisodeOutcomeSchema.safeParse({ ...outcome, hooksOpened: six }).success).toBe(false);
    expect(VideoEpisodeOutcomeSchema.safeParse({ ...outcome, cycleBeat: 'slap' }).success).toBe(false);
  });
});

describe('episode estimate', () => {
  it('accepts 1.2 + 21.77 = 22.97 within the budget', () => {
    const result = VideoEpisodeEstimateSchema.safeParse({
      framesUsd: 1.2, clipsUsd: 21.77, totalUsd: 22.97, availableUsd: 40, fitsBudget: true, source: 'listino del motore',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a negative clip cost', () => {
    const result = VideoEpisodeEstimateSchema.safeParse({
      framesUsd: 1.2, clipsUsd: -1, totalUsd: 0.2, availableUsd: 40, fitsBudget: true, source: 'listino del motore',
    });
    expect(result.success).toBe(false);
  });
});

describe('enums', () => {
  it('keep the values and the order of the series skill', () => {
    expect(VideoSeriesPhaseSchema.options).toEqual([
      'golden_three', 'free_escalation', 'paywall_cliffhanger', 'central_loop', 'mid_twist', 'climax', 'finale',
    ]);
    expect(VideoEpisodeEndingTypeSchema.options).toEqual([
      'interrupted-reveal', 'incoming-threat', 'unexpected-arrival', 'impossible-choice',
      'identity-flash', 'public-humiliation-pending', 'betrayal-glimpse',
    ]);
    expect(VideoEpisodeCycleBeatSchema.options).toEqual([
      'provocation', 'humiliation_peak', 'false_confirmation', 'face_slap',
    ]);
  });
});

describe('series view', () => {
  const view = {
    seriesId: SERIES_ID,
    title: 'La moglie sbagliata',
    logline: 'Una donna scopre che il marito vive due vite.',
    language: 'it',
    totalEpisodes: 20,
    paywallEpisode: 8,
    nextEpisode: 3,
    nextPhase: 'golden_three',
    characters: [ANNA, MARCO],
    hooks: [MAIN_HOOK],
    episodes: [
      { number: 1, projectId: 'proj-1', state: 'delivered', ending: ENDING },
      { number: 2, projectId: 'proj-2', state: 'delivered', ending: null },
    ],
  };

  it('accepts a series with 2 episodes and a finished series (nextPhase null)', () => {
    expect(VideoSeriesViewSchema.safeParse(view).success).toBe(true);
    expect(VideoSeriesViewSchema.safeParse({ ...view, nextEpisode: 21, nextPhase: null }).success).toBe(true);
  });

  it('rejects nextEpisode 122', () => {
    expect(VideoSeriesViewSchema.safeParse({ ...view, nextEpisode: 122 }).success).toBe(false);
  });
});
