import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_SERIES_CREATE_TOOL,
  VIDEO_SERIES_GET_TOOL,
  VIDEO_EPISODE_CREATE_TOOL,
  VideoSeriesCreateToolInputSchema,
  VideoSeriesGetToolInputSchema,
  VideoSeriesResponseSchema,
  VideoSeriesViewSchema,
  VideoEpisodeCreateToolInputSchema,
  VideoEpisodeCreateResponseSchema,
  type VideoSeriesCreateToolInput,
  type VideoSeriesGetToolInput,
  type VideoSeriesResponse,
  type VideoEpisodeCreateToolInput,
  type VideoEpisodeCreateResponse,
} from '../../../src/capability/video/index.js';

const seriesId = '123e4567-e89b-42d3-a456-426614174000';
const series: VideoSeriesCreateToolInput = {
  title: "L'erede in grembiule",
  logline: 'Una cuoca scopre di essere erede della famiglia che la umilia.',
  language: 'it',
  totalEpisodes: 80,
  paywallEpisode: 8,
  mainSecret: 'Lia è la figlia del fondatore.',
  characters: [
    { id: 'lia', name: 'Lia', description: 'Cuoca determinata, ignara delle sue origini.' },
    { id: 'marco', name: 'Marco', description: 'Erede apparente della famiglia.' },
  ],
};
const episode: VideoEpisodeCreateToolInput = {
  seriesId,
  approverEmail: 'owner@example.com',
  mode: 'approval',
  budgetUsd: 30,
};
const response: VideoEpisodeCreateResponse = {
  seriesId,
  episodeNumber: 1,
  phase: 'golden_three',
  projectId: 'project-1',
  state: 'created',
};

describe('video_series_create input', () => {
  it('accepts L’erede in grembiule with 80 episodes, paywall at 8 and two characters', () => {
    expect(VideoSeriesCreateToolInputSchema.parse(series)).toEqual(series);
  });

  it('accepts omitted optional fields without choosing defaults', () => {
    const required: VideoSeriesCreateToolInput = {
      title: series.title,
      logline: series.logline,
      totalEpisodes: series.totalEpisodes,
      characters: series.characters,
    };
    expect(VideoSeriesCreateToolInputSchema.parse(required)).toEqual(required);
  });

  it.each([
    ['tenantId', { tenantId: 'tenant-1' }],
    ['ownerId', { ownerId: 'owner-1' }],
    ['agentId', { agentId: 'agent-1' }],
    ['zero characters', { characters: [] }],
    ['seven characters', { characters: Array.from({ length: 7 }, (_, i) => ({ ...series.characters[0], id: `person-${i}` })) }],
    ['four episodes', { totalEpisodes: 4 }],
    ['121 episodes', { totalEpisodes: 121 }],
    ['fractional episode count', { totalEpisodes: 5.5 }],
    ['paywall before episode 4', { paywallEpisode: 3 }],
    ['paywall after episode 119', { paywallEpisode: 120 }],
    ['fractional paywall episode', { paywallEpisode: 8.5 }],
    ['uppercase character id Lia', { characters: [{ ...series.characters[0], id: 'Lia' }] }],
    ['extra character field', { characters: [{ ...series.characters[0], agentId: 'agent-1' }] }],
    ['empty title', { title: '' }],
    ['long title', { title: 'x'.repeat(121) }],
    ['empty logline', { logline: '' }],
    ['long logline', { logline: 'x'.repeat(601) }],
    ['empty secret', { mainSecret: '' }],
    ['long secret', { mainSecret: 'x'.repeat(301) }],
    ['unsupported language', { language: 'fr' }],
    ['empty character name', { characters: [{ ...series.characters[0], name: '' }] }],
    ['long character name', { characters: [{ ...series.characters[0], name: 'x'.repeat(81) }] }],
    ['empty character description', { characters: [{ ...series.characters[0], description: '' }] }],
    ['long character description', { characters: [{ ...series.characters[0], description: 'x'.repeat(601) }] }],
  ])('rejects %s', (_name, patch) => {
    expect(VideoSeriesCreateToolInputSchema.safeParse({ ...series, ...patch }).success).toBe(false);
  });
});

describe('video_series_get input and series response', () => {
  it('accepts a series UUID and rejects invalid ids and model identity', () => {
    const input: VideoSeriesGetToolInput = { seriesId };
    expect(VideoSeriesGetToolInputSchema.parse(input)).toEqual(input);
    expect(VideoSeriesGetToolInputSchema.safeParse({ seriesId: 'serie-1' }).success).toBe(false);
    expect(VideoSeriesGetToolInputSchema.safeParse({ seriesId, tenantId: 'tenant-1' }).success).toBe(false);
  });

  it('reuses the series view as the response for create and get', () => {
    expect(VideoSeriesResponseSchema).toBe(VideoSeriesViewSchema);
    const view: VideoSeriesResponse = {
      seriesId,
      title: series.title,
      logline: series.logline,
      language: 'it',
      totalEpisodes: 80,
      paywallEpisode: 8,
      nextEpisode: 1,
      nextPhase: 'golden_three',
      characters: series.characters.map(character => ({ ...character, portrait: null })),
      hooks: [],
      episodes: [],
    };
    expect(VideoSeriesResponseSchema.parse(view)).toEqual(view);
  });
});

describe('video_episode_create input', () => {
  it('accepts approval mode and a 30 USD budget without a brief', () => {
    expect(VideoEpisodeCreateToolInputSchema.parse(episode)).toEqual(episode);
  });

  it('accepts an episode brief and duration', () => {
    const input = { ...episode, brief: 'Lia incontra Marco.', durationSeconds: 90 };
    expect(VideoEpisodeCreateToolInputSchema.parse(input)).toEqual(input);
  });

  it.each([
    ['invalid seriesId', { seriesId: 'serie-1' }],
    ['zero budget', { budgetUsd: 0 }],
    ['negative budget', { budgetUsd: -1 }],
    ['infinite budget', { budgetUsd: Infinity }],
    ['181 second duration', { durationSeconds: 181 }],
    ['duration below 5 seconds', { durationSeconds: 4 }],
    ['fractional duration', { durationSeconds: 90.5 }],
    ['agentId in più', { agentId: 'agent-1' }],
    ['tenantId', { tenantId: 'tenant-1' }],
    ['ownerId', { ownerId: 'owner-1' }],
    ['empty brief', { brief: '' }],
    ['long brief', { brief: 'x'.repeat(2001) }],
    ['invalid approver email', { approverEmail: 'owner' }],
    ['invalid mode', { mode: 'automatic' }],
  ])('rejects %s', (_name, patch) => {
    expect(VideoEpisodeCreateToolInputSchema.safeParse({ ...episode, ...patch }).success).toBe(false);
  });
});

describe('video_episode_create response', () => {
  it('accepts the golden_three phase and created state', () => {
    expect(VideoEpisodeCreateResponseSchema.parse(response)).toEqual(response);
  });

  it.each([
    ['paywall phase', { phase: 'paywall' }],
    ['episode zero', { episodeNumber: 0 }],
    ['episode 121', { episodeNumber: 121 }],
    ['fractional episode', { episodeNumber: 1.5 }],
    ['invalid series id', { seriesId: 'serie-1' }],
    ['empty project id', { projectId: '' }],
    ['invalid state', { state: 'ready' }],
    ['extra field', { extra: true }],
  ])('rejects %s', (_name, patch) => {
    expect(VideoEpisodeCreateResponseSchema.safeParse({ ...response, ...patch }).success).toBe(false);
  });
});

describe('series tool registry contracts', () => {
  it('exports the three tool names', () => {
    expect(VIDEO_SERIES_CREATE_TOOL).toBe('video_series_create');
    expect(VIDEO_SERIES_GET_TOOL).toBe('video_series_get');
    expect(VIDEO_EPISODE_CREATE_TOOL).toBe('video_episode_create');
  });

  it.each([
    [VIDEO_SERIES_CREATE_TOOL, VideoSeriesCreateToolInputSchema],
    [VIDEO_SERIES_GET_TOOL, VideoSeriesGetToolInputSchema],
    [VIDEO_EPISODE_CREATE_TOOL, VideoEpisodeCreateToolInputSchema],
  ])('forbids additional properties in the JSON schema of %s', (_name, schema) => {
    expect(z.toJSONSchema(schema).additionalProperties).toBe(false);
  });

  it('describes the optional narrative choices for the model in Italian', () => {
    const create = z.toJSONSchema(VideoSeriesCreateToolInputSchema).properties;
    expect(create?.paywallEpisode).toHaveProperty('description', 'episodio del muro a pagamento; assente: 8 o il penultimo');
    expect(create?.mainSecret).toHaveProperty('description', 'il segreto principale, svelato al climax');
    const input = z.toJSONSchema(VideoEpisodeCreateToolInputSchema).properties;
    expect(input?.brief).toHaveProperty('description', 'cosa deve succedere in questo episodio; assente: lo decide il copione dalla serie');
  });
});
