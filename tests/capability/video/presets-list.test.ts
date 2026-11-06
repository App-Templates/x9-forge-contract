import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VideoBriefRequestSchema,
  VideoBriefToolInputSchema,
  VideoPresetIdSchema,
  VideoPresetFootageShotsSchema,
  VideoPresetSummarySchema,
  VideoPresetsListToolInputSchema,
  VideoPresetsListResponseSchema,
  type VideoPresetFootageShots,
  type VideoPresetSummary,
  type VideoPresetsListToolInput,
  type VideoPresetsListResponse,
} from '../../../src/capability/video/index.js';

const presets: VideoPresetSummary[] = [
  { id: 'singola', title: 'Singola', expectedCostUsd: 3.9, footageShots: 1 },
  { id: 'ibrido-alternato', title: 'Ibrido alternato', expectedCostUsd: 3.9, footageShots: 2 },
  { id: 'infografica-pura', title: 'Infografica pura', expectedCostUsd: 0.5, footageShots: 0 },
  { id: 'demo-locale', title: 'Demo locale', expectedCostUsd: 0, footageShots: 0 },
];

describe('video preset discovery', () => {
  it('describes presetId with video_presets_list while preserving its pattern', () => {
    const presetId = z.toJSONSchema(VideoBriefToolInputSchema).properties?.presetId;
    expect(presetId).toHaveProperty('description', expect.stringContaining('video_presets_list'));
    const pattern = z.toJSONSchema(VideoPresetIdSchema).pattern;
    expect(pattern).toBeDefined();
    expect(presetId).toHaveProperty('pattern', pattern);
  });

  it('keeps the internal brief and shared preset id without a description', () => {
    const presetId = z.toJSONSchema(VideoBriefRequestSchema).properties?.presetId;
    expect(presetId).toBeDefined();
    expect(presetId).not.toHaveProperty('description');
    expect(z.toJSONSchema(VideoPresetIdSchema)).not.toHaveProperty('description');
  });

  it('accepts no inputs and rejects model-supplied tenant identity', () => {
    const input: VideoPresetsListToolInput = {};
    expect(VideoPresetsListToolInputSchema.parse(input)).toEqual({});
    expect(VideoPresetsListToolInputSchema.safeParse({ tenantId: 't' }).success).toBe(false);
  });

  it('accepts the four preset summaries including zero cost and all shot counts', () => {
    const response: VideoPresetsListResponse = { presets };
    expect(VideoPresetsListResponseSchema.parse(response)).toEqual(response);
    for (const preset of presets) {
      expect(VideoPresetSummarySchema.parse(preset)).toEqual(preset);
    }
    const shots: VideoPresetFootageShots[] = [0, 1, 2];
    for (const count of shots) {
      expect(VideoPresetFootageShotsSchema.parse(count)).toBe(count);
    }
  });

  it.each([
    ['three shots', { footageShots: 3 }],
    ['fractional shots', { footageShots: 0.5 }],
    ['negative cost', { expectedCostUsd: -0.1 }],
    ['infinite cost', { expectedCostUsd: Infinity }],
    ['NaN cost', { expectedCostUsd: NaN }],
    ['uppercase id', { id: 'Singola' }],
    ['extra summary field', { extra: true }],
    ['empty title', { title: '' }],
    ['long title', { title: 'x'.repeat(201) }],
  ])('rejects %s', (_name, patch) => {
    const preset = { ...presets[0], ...patch };
    expect(VideoPresetSummarySchema.safeParse(preset).success).toBe(false);
    expect(VideoPresetsListResponseSchema.safeParse({ presets: [preset] }).success).toBe(false);
  });

  it('rejects an empty list and extra response fields', () => {
    expect(VideoPresetsListResponseSchema.safeParse({ presets: [] }).success).toBe(false);
    expect(VideoPresetsListResponseSchema.safeParse({ presets, extra: true }).success).toBe(false);
  });

  it('still accepts a 1.97.0 tool brief without request choices', () => {
    const brief = {
      approverEmail: 'owner@example.com',
      presetId: 'singola',
      mode: 'approval',
      budgetUsd: 5,
      brief: 'Un video per i social con il mio preset.',
    };
    expect(VideoBriefToolInputSchema.parse(brief)).toEqual(brief);
  });
});
