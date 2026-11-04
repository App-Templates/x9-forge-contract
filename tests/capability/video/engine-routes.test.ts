import { describe, expect, it } from 'vitest';
import {
  VideoEngineApproveRequestSchema,
  VideoEngineRouteApproveRequestSchema,
  VideoEngineRoutePlanRequestSchema,
  VideoEngineRouteRunRequestSchema,
  VideoEngineRunRequestSchema,
} from '../../../src/capability/video/index.js';
import {
  officinaVideoApproveContract,
  officinaVideoPlanContract,
  officinaVideoRunContract,
} from '../../../src/http/endpoints/officina-video.js';

const ID = 'a'.repeat(32);

describe('engine route bodies', () => {
  it('accepts every facade body', () => {
    for (const stage of ['plan', 'frames', 'final'] as const) {
      const body = VideoEngineApproveRequestSchema.parse({ stage, revision: 2 });
      expect(VideoEngineRouteApproveRequestSchema.safeParse(body).success).toBe(true);
    }
    for (const stage of ['frames', 'clips', 'assemble'] as const) {
      for (const body of [{ stage }, { stage, revision: 4 }]) {
        const facade = VideoEngineRunRequestSchema.parse(body);
        expect(VideoEngineRouteRunRequestSchema.safeParse(facade).success).toBe(true);
      }
    }
    expect(VideoEngineRoutePlanRequestSchema.safeParse({}).success).toBe(true);
  });

  it('accepts the recipe bodies', () => {
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'voice', revision: 3, quote_id: ID }).success).toBe(true);
    expect(VideoEngineRouteApproveRequestSchema.safeParse({ stage: 'references', revision: 2 }).success).toBe(true);
    expect(VideoEngineRoutePlanRequestSchema.safeParse({ quote_id: ID, retry_authorization_id: ID, revision: 1 }).success).toBe(true);
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'animatic', scene_ids: [ID] }).success).toBe(true);
  });

  it('rejects malformed bodies', () => {
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'story' }).success).toBe(false);
    expect(VideoEngineRouteApproveRequestSchema.safeParse({ stage: 'story', revision: 1 }).success).toBe(false);
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'voice', quote_id: 'abc' }).success).toBe(false);
    expect(VideoEngineRoutePlanRequestSchema.safeParse({ quote_id: 'abc' }).success).toBe(false);
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'voice', extra: 1 }).success).toBe(false);
    expect(VideoEngineRoutePlanRequestSchema.safeParse({ extra: 1 }).success).toBe(false);
    expect(VideoEngineRouteApproveRequestSchema.safeParse({ stage: 'plan' }).success).toBe(false);
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'clips', scene_ids: Array.from({ length: 33 }, () => ID) }).success).toBe(false);
    expect(VideoEngineRouteRunRequestSchema.safeParse({ stage: 'clips', scene_ids: Array.from({ length: 32 }, () => ID) }).success).toBe(true);
  });

  it('wires the contracts', () => {
    expect(officinaVideoPlanContract.requestSchema).toBe(VideoEngineRoutePlanRequestSchema);
    expect(officinaVideoPlanContract.responseStatus).toBe(200);
    expect(officinaVideoApproveContract.requestSchema).toBe(VideoEngineRouteApproveRequestSchema);
    expect(officinaVideoApproveContract.responseStatus).toBe(200);
    expect(officinaVideoRunContract.requestSchema).toBe(VideoEngineRouteRunRequestSchema);
    expect(officinaVideoRunContract.responseStatus).toBe(202);
  });
});
