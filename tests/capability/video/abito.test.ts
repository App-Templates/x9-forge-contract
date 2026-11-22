import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import {
  VIDEO_OUTFIT_MAX_BYTES, VIDEO_OUTFIT_MEDIA_TYPES, VideoOutfitProductionCreatedSchema, VideoOutfitProductionQuerySchema,
} from '../../../src/capability/video/abito.js';
import * as videoIndex from '../../../src/capability/video/index.js';
import { officinaVideoOutfitProductionCreateContract } from '../../../src/http/endpoints/officina-video.js';

const query = {
  tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1',
  videoProjectId: 'video-1', name: 'Camminata', model: 'kling-4-edit', resolution: '720p',
  budgetUsd: '8', fileName: 'camminata.mp4',
};
const created = { engineProjectId: 'a'.repeat(32), sourceSha256: 'b'.repeat(64), durationSeconds: 12 };

describe('outfit production contract', () => {
  it('accepts a valid query, with and without description', () => {
    expect(VideoOutfitProductionQuerySchema.safeParse(query).success).toBe(true);
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, description: 'giacca di pelle nera' }).success).toBe(true);
  });

  it('rejects extra keys', () => {
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, extra: 'x' }).success).toBe(false);
  });

  it('requires the full identity', () => {
    for (const key of ['tenantId', 'ownerId', 'agentId']) {
      const { [key]: _omitted, ...rest } = query as Record<string, string>;
      expect(VideoOutfitProductionQuerySchema.safeParse(rest).success, key).toBe(false);
    }
  });

  it('rejects a model or resolution outside the list', () => {
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, model: 'altro' }).success).toBe(false);
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, resolution: '4k' }).success).toBe(false);
  });

  it('accepts .mov and .MP4 and rejects .avi', () => {
    for (const fileName of ['a.mov', 'B.MP4', 'c.MOV']) {
      expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, fileName }).success, fileName).toBe(true);
    }
    for (const fileName of ['a.avi', 'a.mp4.exe', '../a.mp4']) {
      expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, fileName }).success, fileName).toBe(false);
    }
  });

  it('rejects a malformed budget', () => {
    for (const budgetUsd of ['abc', '-1', '1.234', '', '0', '1e3']) {
      expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, budgetUsd }).success, budgetUsd).toBe(false);
    }
  });

  it('rejects a name that is empty or over 120 characters, and a description over 500', () => {
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, name: ' ' }).success).toBe(false);
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, name: 'x'.repeat(121) }).success).toBe(false);
    expect(VideoOutfitProductionQuerySchema.safeParse({ ...query, description: 'x'.repeat(501) }).success).toBe(false);
  });

  it('validates the response: duration 3..15, strict, well-formed ids', () => {
    expect(VideoOutfitProductionCreatedSchema.safeParse(created).success).toBe(true);
    for (const durationSeconds of [3, 15, 7.5]) expect(VideoOutfitProductionCreatedSchema.safeParse({ ...created, durationSeconds }).success).toBe(true);
    for (const durationSeconds of [2, 16, 2.99]) expect(VideoOutfitProductionCreatedSchema.safeParse({ ...created, durationSeconds }).success, String(durationSeconds)).toBe(false);
    expect(VideoOutfitProductionCreatedSchema.safeParse({ ...created, extra: 1 }).success).toBe(false);
    expect(VideoOutfitProductionCreatedSchema.safeParse({ ...created, engineProjectId: 'xyz' }).success).toBe(false);
    expect(VideoOutfitProductionCreatedSchema.safeParse({ ...created, sourceSha256: 'b'.repeat(63) }).success).toBe(false);
  });

  it('publishes the route and is in the portable registry', () => {
    expect(officinaVideoOutfitProductionCreateContract).toMatchObject({
      method: 'POST', path: '/api/produzioni-abito', responseStatus: 201,
      bodyMediaTypes: VIDEO_OUTFIT_MEDIA_TYPES, maxBodyBytes: VIDEO_OUTFIT_MAX_BYTES,
    });
    expect(VIDEO_OUTFIT_MAX_BYTES).toBe(64 * 1024 * 1024);
    const { contracts, transports } = getPortableCapabilityContracts();
    const transport = transports.videoEngineOutfitProductionCreate;
    expect(transport).toMatchObject({
      method: 'POST', path: '/api/produzioni-abito', authHeader: INTERNAL_SECRET_HEADER,
      queryContract: 'videoEngineOutfitProductionQuery', responseContract: 'videoEngineOutfitProductionCreated',
      errorContract: 'videoEngineError', bodyMediaTypes: VIDEO_OUTFIT_MEDIA_TYPES, maxBodyBytes: VIDEO_OUTFIT_MAX_BYTES,
    });
    expect(contracts.videoEngineOutfitProductionQuery).toBeDefined();
    expect(contracts.videoEngineOutfitProductionCreated).toBeDefined();
  });

  it('is exported from the video index', () => {
    expect(videoIndex.VideoOutfitProductionQuerySchema).toBe(VideoOutfitProductionQuerySchema);
    expect(videoIndex.VIDEO_OUTFIT_MAX_SECONDS).toBe(15);
  });
});
