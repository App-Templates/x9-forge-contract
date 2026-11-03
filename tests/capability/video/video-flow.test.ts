import { describe, it, expect } from 'vitest';
import {
  VideoBriefToolInputSchema, VideoProjectGetToolInputSchema, VideoProjectViewSchema,
  VideoEngineApproveRequestSchema, VideoEngineRunRequestSchema, VideoEngineProjectSchema, VideoEngineMediaPathSchema,
} from '../../../src/capability/video/index.js';
import {
  officinaVideoProjectGetContract, officinaVideoPlanContract, officinaVideoApproveContract, officinaVideoRunContract,
} from '../../../src/http/endpoints/officina-video.js';

const toolInput = { approverEmail: 'referente@example.com', presetId: 'demo-locale', mode: 'approval', budgetUsd: 1, brief: 'Un video breve.' };
const engineId = 'a'.repeat(32);

describe('video tools with the agent-core envelope', () => {
  it('the brief tool input carries no identity: the envelope does', () => {
    expect(VideoBriefToolInputSchema.parse(toolInput)).toEqual(toolInput);
    expect(VideoBriefToolInputSchema.safeParse({ ...toolInput, identity: { tenantId: 't', ownerId: 'o', agentId: 'a' } }).success).toBe(false);
  });
  it('requestedBy is optional in the tool input', () => {
    expect(VideoBriefToolInputSchema.parse({ ...toolInput, requestedBy: 'BU Marketing' }).requestedBy).toBe('BU Marketing');
  });
  it('project get takes only the project id', () => {
    expect(VideoProjectGetToolInputSchema.safeParse({ projectId: 'p1' }).success).toBe(true);
    expect(VideoProjectGetToolInputSchema.safeParse({ projectId: 'p1', tenantId: 't' }).success).toBe(false);
  });
  it('a project view carries state, step and the links', () => {
    const view = { projectId: 'p1', state: 'awaiting_approval', step: 'review_sent', identity: { tenantId: 't', ownerId: 'o', agentId: 'a' },
      presetId: 'demo-locale', mode: 'approval', budgetUsd: 1, spentUsd: 0, reviewUrl: 'https://staging.example.com/officina/r/x',
      createdAt: '2026-11-03T23:00:00Z', updatedAt: '2026-11-03T23:00:00Z' };
    expect(VideoProjectViewSchema.parse(view)).toEqual(view);
    expect(VideoProjectViewSchema.safeParse({ ...view, step: 'other' }).success).toBe(false);
    expect(VideoProjectViewSchema.safeParse({ ...view, reviewUrl: 'not a url' }).success).toBe(false);
  });
});

describe('engine driving contracts', () => {
  it('approve needs the stage and the revision that was shown', () => {
    expect(VideoEngineApproveRequestSchema.safeParse({ stage: 'frames', revision: 3 }).success).toBe(true);
    expect(VideoEngineApproveRequestSchema.safeParse({ stage: 'frames' }).success).toBe(false);
    expect(VideoEngineApproveRequestSchema.safeParse({ stage: 'voice', revision: 3 }).success).toBe(false);
  });
  it('run accepts only the stages the facade drives', () => {
    expect(VideoEngineRunRequestSchema.safeParse({ stage: 'assemble' }).success).toBe(true);
    expect(VideoEngineRunRequestSchema.safeParse({ stage: 'voice' }).success).toBe(false);
  });
  it('media paths stay inside one engine project', () => {
    expect(VideoEngineMediaPathSchema.safeParse(`/media/${engineId}/montaggio-1.mp4`).success).toBe(true);
    expect(VideoEngineMediaPathSchema.safeParse(`/media/${engineId}/../secret.mp4`).success).toBe(false);
    expect(VideoEngineMediaPathSchema.safeParse('/media/x/a.mp4').success).toBe(false);
  });
  it('an engine project keeps the fields the facade does not read', () => {
    const project = { id: engineId, status: 'review', revision: 5, scenes: [{ id: 's1', frame_url: `/media/${engineId}/f.png`, extra: 1 }],
      jobs: [{ stage: 'frames', status: 'completed' }], output_url: null, approvals: {} };
    expect(VideoEngineProjectSchema.parse(project)).toEqual(project);
    expect(VideoEngineProjectSchema.safeParse({ ...project, id: 'short' }).success).toBe(false);
  });
  it('contracts name the engine routes', () => {
    expect([officinaVideoProjectGetContract, officinaVideoPlanContract, officinaVideoApproveContract, officinaVideoRunContract].map(c => `${c.method} ${c.path}`))
      .toEqual(['GET /api/projects/:engineProjectId', 'POST /api/projects/:engineProjectId/plan', 'POST /api/projects/:engineProjectId/approve', 'POST /api/projects/:engineProjectId/run']);
  });
});
