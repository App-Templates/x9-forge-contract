import { describe, expect, it } from 'vitest';
import {
  VideoBriefRequestSchema,
  VideoBriefResponseSchema,
  VideoModeSchema,
  VideoPresetIdSchema,
  VideoProjectIdSchema,
  VideoProjectStateSchema,
  type VideoBriefRequest,
  type VideoBriefResponse,
  type VideoMode,
  type VideoPresetId,
  type VideoProjectId,
  type VideoProjectState,
} from '../../../src/capability/video/index';

const identity = { tenantId: 't-1', ownerId: 'o-2', agentId: 'agent-7' };
const modes: VideoMode[] = ['approval', 'autonomous'];
const presetId: VideoPresetId = 'story-split-sync';
const projectId: VideoProjectId = 'video-1';
const states: VideoProjectState[] = [
  'created', 'planning', 'awaiting_approval', 'producing', 'delivered', 'failed',
];
const request: VideoBriefRequest = {
  identity,
  requestedBy: 'editor-3',
  approverEmail: 'approver@example.org',
  presetId,
  mode: 'approval',
  budgetUsd: 12.5,
  brief: 'Create a short video introducing the new product.',
  externalRef: 'campaign-4',
};
const response: VideoBriefResponse = {
  projectId,
  state: 'created',
  identity,
  presetId,
  mode: 'approval',
  budgetUsd: 12.5,
};

describe('video brief request', () => {
  it('accepts a complete approved brief', () => {
    expect(VideoBriefRequestSchema.parse(request)).toEqual(request);
  });

  it('allows an omitted or empty external reference without adding a default', () => {
    const { externalRef: _externalRef, ...withoutReference } = request;
    expect(VideoBriefRequestSchema.parse(withoutReference)).toEqual(withoutReference);
    expect(VideoBriefRequestSchema.safeParse({ ...request, externalRef: '' }).success).toBe(true);
  });

  it.each(['identity', 'requestedBy', 'approverEmail', 'presetId', 'mode', 'budgetUsd', 'brief'] as const)(
    'requires %s without a default', (key) => {
      const { [key]: _missing, ...incomplete } = request;
      expect(VideoBriefRequestSchema.safeParse(incomplete).success).toBe(false);
    },
  );

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('requires identity.%s', (key) => {
    const { [key]: _missing, ...incompleteIdentity } = identity;
    expect(VideoBriefRequestSchema.safeParse({ ...request, identity: incompleteIdentity }).success).toBe(false);
  });

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('rejects empty identity.%s', (key) => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, identity: { ...identity, [key]: '' } }).success).toBe(false);
  });

  it('rejects an extra request field', () => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, unexpected: true }).success).toBe(false);
  });

  it('rejects an extra identity field', () => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, identity: { ...identity, userId: 'person-9' } }).success).toBe(false);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects invalid budget %s', (budgetUsd) => {
      expect(VideoBriefRequestSchema.safeParse({ ...request, budgetUsd }).success).toBe(false);
    },
  );

  it.each(modes)('accepts mode %s', (mode) => {
    expect(VideoModeSchema.parse(mode)).toBe(mode);
    expect(VideoBriefRequestSchema.safeParse({ ...request, mode }).success).toBe(true);
  });

  it.each(['manual', 'Approval', ''])('rejects unknown mode %s', (mode) => {
    expect(VideoModeSchema.safeParse(mode).success).toBe(false);
    expect(VideoBriefRequestSchema.safeParse({ ...request, mode }).success).toBe(false);
  });

  it.each(['Story-split-sync', 'story split', '-story', 'story_sync', '', 'a'.repeat(65)])(
    'rejects invalid preset %s', (invalidPresetId) => {
      expect(VideoPresetIdSchema.safeParse(invalidPresetId).success).toBe(false);
      expect(VideoBriefRequestSchema.safeParse({ ...request, presetId: invalidPresetId }).success).toBe(false);
    },
  );

  it.each(['a', '0', 'a'.repeat(64), 'story-split-sync'])('accepts preset %s', (validPresetId) => {
    expect(VideoPresetIdSchema.parse(validPresetId)).toBe(validPresetId);
    expect(VideoBriefRequestSchema.safeParse({ ...request, presetId: validPresetId }).success).toBe(true);
  });

  it.each(['not-an-email', 'approver@', ''])('rejects invalid approver email %s', (approverEmail) => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, approverEmail }).success).toBe(false);
  });

  it('accepts string lengths at their limits', () => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, requestedBy: 'x', brief: 'x' }).success).toBe(true);
    expect(VideoBriefRequestSchema.safeParse({
      ...request, requestedBy: 'x'.repeat(256), brief: 'x'.repeat(20000), externalRef: 'x'.repeat(256),
    }).success).toBe(true);
  });

  it.each([
    { requestedBy: '' }, { requestedBy: 'x'.repeat(257) },
    { brief: '' }, { brief: 'x'.repeat(20001) }, { externalRef: 'x'.repeat(257) },
  ])('rejects string lengths outside their limits (%#)', (invalidFields) => {
    expect(VideoBriefRequestSchema.safeParse({ ...request, ...invalidFields }).success).toBe(false);
  });
});

describe('video brief response', () => {
  it('accepts the project and preserves the brief scope and settings', () => {
    expect(VideoBriefResponseSchema.parse(response)).toEqual(response);
  });

  it.each(['projectId', 'state', 'identity', 'presetId', 'mode', 'budgetUsd'] as const)(
    'requires %s without a default', (key) => {
      const { [key]: _missing, ...incomplete } = response;
      expect(VideoBriefResponseSchema.safeParse(incomplete).success).toBe(false);
    },
  );

  it.each(['tenantId', 'ownerId', 'agentId'] as const)('requires identity.%s', (key) => {
    const { [key]: _missing, ...incompleteIdentity } = identity;
    expect(VideoBriefResponseSchema.safeParse({ ...response, identity: incompleteIdentity }).success).toBe(false);
  });

  it('rejects extra response and identity fields', () => {
    expect(VideoBriefResponseSchema.safeParse({ ...response, unexpected: true }).success).toBe(false);
    expect(VideoBriefResponseSchema.safeParse({ ...response, identity: { ...identity, userId: 'person-9' } }).success).toBe(false);
  });

  it.each(states)('accepts project state %s', (state) => {
    expect(VideoProjectStateSchema.parse(state)).toBe(state);
    expect(VideoBriefResponseSchema.safeParse({ ...response, state }).success).toBe(true);
  });

  it('rejects an unknown project state', () => {
    expect(VideoProjectStateSchema.safeParse('queued').success).toBe(false);
    expect(VideoBriefResponseSchema.safeParse({ ...response, state: 'queued' }).success).toBe(false);
  });

  it.each(['x', 'x'.repeat(100)])('accepts a project id within its limits (%#)', (validProjectId) => {
    expect(VideoProjectIdSchema.parse(validProjectId)).toBe(validProjectId);
    expect(VideoBriefResponseSchema.safeParse({ ...response, projectId: validProjectId }).success).toBe(true);
  });

  it.each(['', 'x'.repeat(101)])('rejects a project id outside its limits (%#)', (invalidProjectId) => {
    expect(VideoProjectIdSchema.safeParse(invalidProjectId).success).toBe(false);
    expect(VideoBriefResponseSchema.safeParse({ ...response, projectId: invalidProjectId }).success).toBe(false);
  });

  it.each(modes)('accepts mode %s', (mode) => {
    expect(VideoBriefResponseSchema.safeParse({ ...response, mode }).success).toBe(true);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    'rejects invalid budget %s', (budgetUsd) => {
      expect(VideoBriefResponseSchema.safeParse({ ...response, budgetUsd }).success).toBe(false);
    },
  );

  it('rejects an invalid preset or mode', () => {
    expect(VideoBriefResponseSchema.safeParse({ ...response, presetId: 'Invalid Preset' }).success).toBe(false);
    expect(VideoBriefResponseSchema.safeParse({ ...response, mode: 'manual' }).success).toBe(false);
  });
});
