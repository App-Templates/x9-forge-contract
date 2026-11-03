import { describe, expect, it } from 'vitest';
import {
  VideoBriefRequestSchema,
  VideoEngineSettingsSchema,
  VideoEngineJobSchema,
  VideoEngineJobResponseSchema,
  VideoProjectGetRequestSchema,
  type VideoBriefRequest,
  type VideoEngineSettings,
  type VideoEngineJob,
  type VideoEngineJobResponse,
  type VideoProjectGetRequest,
} from '../../../src/capability/video/index';

const identity = { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7' };
const settings: VideoEngineSettings = {
  aspectRatio: '9:16',
  provider: 'demo',
  durationSeconds: 30,
  sceneCount: 3,
  planner: 'default',
  renderer: 'ffmpeg',
  frameProvider: 'fal',
  audioSource: 'none',
};
const job: VideoEngineJob = {
  videoProjectId: 'video-1',
  identity,
  requestedBy: 'editor-3',
  presetId: 'story-split-sync',
  settings,
  budgetUsd: 12.5,
  mode: 'approval',
  name: 'Product introduction',
  brief: 'Create a short video introducing the new product.',
  externalRef: 'campaign-4',
};
const briefRequest: VideoBriefRequest = {
  identity,
  requestedBy: job.requestedBy,
  approverEmail: 'approver@example.org',
  presetId: job.presetId,
  mode: job.mode,
  budgetUsd: job.budgetUsd,
  brief: job.brief,
};
const response: VideoEngineJobResponse = { engineProjectId: 'engine-1', status: 'queued' };
const getRequest: VideoProjectGetRequest = { identity, projectId: job.videoProjectId };

describe('video engine settings', () => {
  it('accepts complete settings', () => {
    expect(VideoEngineSettingsSchema.parse(settings)).toEqual(settings);
  });

  it('accepts required settings without adding optional defaults', () => {
    const requiredSettings = { aspectRatio: '1:1', provider: 'demo', durationSeconds: 1, sceneCount: 1 };
    expect(VideoEngineSettingsSchema.parse(requiredSettings)).toEqual(requiredSettings);
  });

  it.each(['aspectRatio', 'provider', 'durationSeconds', 'sceneCount'] as const)(
    'requires %s', (key) => {
      const { [key]: _missing, ...incomplete } = settings;
      expect(VideoEngineSettingsSchema.safeParse(incomplete).success).toBe(false);
    },
  );

  it('rejects an extra settings field', () => {
    const extraSettings = { ...settings, unexpected: true };
    expect(VideoEngineSettingsSchema.safeParse(extraSettings).success).toBe(false);
    expect(VideoEngineJobSchema.safeParse({ ...job, settings: extraSettings }).success).toBe(false);
  });

  it.each(['9:16', '16:9', '1:1'])('accepts aspect ratio %s', (aspectRatio) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, aspectRatio }).success).toBe(true);
  });

  it.each(['demo', 'minimax', 'fal', 'byteplus'])('accepts provider and frame provider %s', (provider) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, provider, frameProvider: provider }).success).toBe(true);
  });

  it.each(['ffmpeg', 'remotion'])('accepts renderer %s', (renderer) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, renderer }).success).toBe(true);
  });

  it.each(['none', 'track', 'native', 'mix'])('accepts audio source %s', (audioSource) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, audioSource }).success).toBe(true);
  });

  it.each([
    { aspectRatio: '4:3' }, { provider: 'unknown' }, { frameProvider: 'unknown' },
    { renderer: 'unknown' }, { audioSource: 'unknown' },
  ])('rejects unknown setting values (%#)', (invalidSettings) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, ...invalidSettings }).success).toBe(false);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects non-positive or non-integer duration and scene count %s', (value) => {
      expect(VideoEngineSettingsSchema.safeParse({ ...settings, durationSeconds: value }).success).toBe(false);
      expect(VideoEngineSettingsSchema.safeParse({ ...settings, sceneCount: value }).success).toBe(false);
    },
  );

  it.each(['x', 'x'.repeat(64)])('accepts planner at its string limits (%#)', (planner) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, planner }).success).toBe(true);
  });

  it.each(['', 'x'.repeat(65)])('rejects planner outside its string limits (%#)', (planner) => {
    expect(VideoEngineSettingsSchema.safeParse({ ...settings, planner }).success).toBe(false);
  });
});

describe('video engine job', () => {
  it('accepts a complete decided job', () => {
    expect(VideoEngineJobSchema.parse(job)).toEqual(job);
  });

  it('allows an omitted or empty external reference without adding a default', () => {
    const { externalRef: _externalRef, ...withoutReference } = job;
    expect(VideoEngineJobSchema.parse(withoutReference)).toEqual(withoutReference);
    expect(VideoEngineJobSchema.safeParse({ ...job, externalRef: '' }).success).toBe(true);
  });

  it.each([
    'videoProjectId', 'identity', 'requestedBy', 'presetId', 'settings', 'budgetUsd', 'mode', 'name', 'brief',
  ] as const)('requires %s without a default', (key) => {
    const { [key]: _missing, ...incomplete } = job;
    expect(VideoEngineJobSchema.safeParse(incomplete).success).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('requires identity.%s', (key) => {
    const { [key]: _missing, ...incompleteIdentity } = identity;
    expect(VideoEngineJobSchema.safeParse({ ...job, identity: incompleteIdentity }).success).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects empty identity.%s', (key) => {
    expect(VideoEngineJobSchema.safeParse({ ...job, identity: { ...identity, [key]: '' } }).success).toBe(false);
  });

  it('rejects extra job and identity fields', () => {
    expect(VideoEngineJobSchema.safeParse({ ...job, unexpected: true }).success).toBe(false);
    expect(VideoEngineJobSchema.safeParse({ ...job, identity: { ...identity, userId: 'person-9' } }).success).toBe(false);
  });

  it.each([1, 6000])('accepts a brief of %s characters in both requests', (length) => {
    const brief = 'x'.repeat(length);
    expect(VideoEngineJobSchema.safeParse({ ...job, brief }).success).toBe(true);
    expect(VideoBriefRequestSchema.safeParse({ ...briefRequest, brief }).success).toBe(true);
  });

  it.each([0, 6001])('rejects a brief of %s characters in both requests', (length) => {
    const brief = 'x'.repeat(length);
    expect(VideoEngineJobSchema.safeParse({ ...job, brief }).success).toBe(false);
    expect(VideoBriefRequestSchema.safeParse({ ...briefRequest, brief }).success).toBe(false);
  });

  it('accepts other string lengths at their limits', () => {
    expect(VideoEngineJobSchema.safeParse({ ...job, videoProjectId: 'x', requestedBy: 'x', name: 'x' }).success).toBe(true);
    expect(VideoEngineJobSchema.safeParse({
      ...job, videoProjectId: 'x'.repeat(100), requestedBy: 'x'.repeat(256),
      name: 'x'.repeat(200), externalRef: 'x'.repeat(256),
    }).success).toBe(true);
  });

  it.each([
    { videoProjectId: '' }, { videoProjectId: 'x'.repeat(101) },
    { requestedBy: '' }, { requestedBy: 'x'.repeat(257) },
    { name: '' }, { name: 'x'.repeat(201) }, { externalRef: 'x'.repeat(257) },
    { presetId: 'Invalid Preset' }, { mode: 'manual' },
  ])('rejects invalid job fields (%#)', (invalidFields) => {
    expect(VideoEngineJobSchema.safeParse({ ...job, ...invalidFields }).success).toBe(false);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects invalid budget %s', (budgetUsd) => {
      expect(VideoEngineJobSchema.safeParse({ ...job, budgetUsd }).success).toBe(false);
    },
  );

  it('accepts autonomous mode', () => {
    expect(VideoEngineJobSchema.safeParse({ ...job, mode: 'autonomous' }).success).toBe(true);
  });
});

describe('video engine job response', () => {
  it('accepts an engine project and its status', () => {
    expect(VideoEngineJobResponseSchema.parse(response)).toEqual(response);
  });

  it('rejects an extra response field', () => {
    expect(VideoEngineJobResponseSchema.safeParse({ ...response, unexpected: true }).success).toBe(false);
  });

  it.each(['engineProjectId', 'status'] as const)('requires %s', (key) => {
    const { [key]: _missing, ...incomplete } = response;
    expect(VideoEngineJobResponseSchema.safeParse(incomplete).success).toBe(false);
  });

  it('accepts response string lengths at their limits', () => {
    expect(VideoEngineJobResponseSchema.safeParse({ engineProjectId: 'x', status: 'x' }).success).toBe(true);
    expect(VideoEngineJobResponseSchema.safeParse({ engineProjectId: 'x'.repeat(100), status: 'x'.repeat(64) }).success).toBe(true);
  });

  it.each([
    { engineProjectId: '' }, { engineProjectId: 'x'.repeat(101) },
    { status: '' }, { status: 'x'.repeat(65) },
  ])('rejects response strings outside their limits (%#)', (invalidFields) => {
    expect(VideoEngineJobResponseSchema.safeParse({ ...response, ...invalidFields }).success).toBe(false);
  });
});

describe('video project get request', () => {
  it('accepts a project id scoped to a tenant, owner and agent', () => {
    expect(VideoProjectGetRequestSchema.parse(getRequest)).toEqual(getRequest);
  });

  it.each(['identity', 'projectId'] as const)('requires %s', (key) => {
    const { [key]: _missing, ...incomplete } = getRequest;
    expect(VideoProjectGetRequestSchema.safeParse(incomplete).success).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('requires identity.%s', (key) => {
    const { [key]: _missing, ...incompleteIdentity } = identity;
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, identity: incompleteIdentity }).success).toBe(false);
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, identity: { ...identity, [key]: '' } }).success).toBe(false);
  });

  it('rejects extra request and identity fields', () => {
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, unexpected: true }).success).toBe(false);
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, identity: { ...identity, userId: 'person-9' } }).success).toBe(false);
  });

  it.each(['', 'x'.repeat(101)])('rejects a project id outside its limits (%#)', (projectId) => {
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, projectId }).success).toBe(false);
  });

  it.each(['x', 'x'.repeat(100)])('accepts a project id at its string limits (%#)', (projectId) => {
    expect(VideoProjectGetRequestSchema.safeParse({ ...getRequest, projectId }).success).toBe(true);
  });
});
