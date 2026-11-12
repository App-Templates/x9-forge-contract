import { describe, expect, it } from 'vitest';
import { VideoEngineJobSchema } from '../../../src/capability/video/index.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';

const ID = 'a'.repeat(32);
const job = {
  videoProjectId: 'video-1',
  identity: { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7' },
  requestedBy: 'editor-3', presetId: 'story-split-sync',
  settings: { aspectRatio: '9:16', provider: 'demo', durationSeconds: 30, sceneCount: 3 },
  budgetUsd: 12.5, mode: 'approval', name: 'Product introduction',
  brief: 'Create a short video introducing the new product.', externalRef: 'campaign-4',
};
const episode = {
  seriesId: '123e4567-e89b-42d3-a456-426614174000', seriesTitle: 'Notte a Roma', logline: 'Una notte, tre segreti.',
  language: 'it', episodeNumber: 2, totalEpisodes: 30, paywallEpisode: 10,
  previousEnding: { type: 'incoming-threat', text: 'La porta si apre.' },
  hooks: [],
  characters: [{
    id: 'anna', name: 'Anna', description: 'Fotografa di strada.',
    portrait: { engineProjectId: ID, fileName: 'ritratto-1.png', sha256: 'b'.repeat(64) },
  }],
};

describe('engine job with episode context', () => {
  it('keeps a job without episode valid and unchanged', () => {
    const parsed = VideoEngineJobSchema.parse(job);
    expect(parsed).toEqual(job);
    expect('episode' in parsed).toBe(false);
  });

  it('reads the episode back identical', () => {
    expect(VideoEngineJobSchema.parse({ ...job, episode }).episode).toEqual(episode);
  });

  it('refuses an ending type outside the contract', () => {
    const bad = { ...episode, previousEnding: { type: 'cliffhanger', text: 'x' } };
    expect(VideoEngineJobSchema.safeParse({ ...job, episode: bad }).success).toBe(false);
  });

  it('exposes the episode fields in the portable catalog', () => {
    const { contracts } = getPortableCapabilityContracts();
    const text = (name: string) => JSON.stringify(contracts[name]);
    expect(text('videoEngineJob')).toContain('"episode"');
    expect(text('videoEngineProject')).toContain('"episode_outcome"');
  });
});
