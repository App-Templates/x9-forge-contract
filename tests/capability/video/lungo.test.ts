import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-identity.js';
import { VideoEngineIdSchema } from '../../../src/capability/video/engine.js';
import {
  VIDEO_LONG_MIN_SECONDS,
  VIDEO_LONG_MAX_SECONDS,
  VIDEO_LONG_MAX_CHAPTERS,
  VideoLongProjectIdSchema,
  VideoLongFamilySchema,
  VideoLongStepSchema,
  VideoLongStepStatusSchema,
  VideoLongStepStateSchema,
  VideoLongScopeQuerySchema,
  VideoLongCreateRequestSchema,
  VideoLongProjectSchema,
  VideoLongProjectListSchema,
  type VideoLongCreateRequest,
  type VideoLongProject,
} from '../../../src/capability/video/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const request: VideoLongCreateRequest = {
  requestedBy: 'stefano',
  name: 'La storia del cinema',
  family: 'essay',
  presetId: 'singola',
  aspectRatio: '16:9',
  durationSeconds: 600,
  modelId: 'marco',
  brief: 'Racconta la storia del cinema in cinque capitoli, con Marco come presentatore.',
  budgetUsd: 25,
};
const { requestedBy: _requestedBy, ...projectFields } = request;
const project: VideoLongProject = {
  id: 'a'.repeat(32),
  identity,
  ...projectFields,
  steps: [
    { step: 'bozza', status: 'da-approvare' },
    { step: 'ricerca', status: 'da-fare' },
    { step: 'capitoli', status: 'da-fare' },
    { step: 'fotogrammi', status: 'da-fare' },
    { step: 'video', status: 'da-fare' },
  ],
  createdAt: '2026-11-25T10:00:00Z',
};

// SUMMARY: removing the duration maximum must fail the 1201 case;
// removing modelId nullability must fail the "senza personaggio" case.
// SUMMARY: removing environmentId.optional() must fail the saved-project compatibility case.
describe('long video projects', () => {
  it('reads a project saved today without environment or follow-up fields', () => {
    expect(project).not.toHaveProperty('environmentId');
    expect(project).not.toHaveProperty('environmentVersion');
    expect(project).not.toHaveProperty('followsProjectId');
    expect(VideoLongProjectSchema.parse(project)).toEqual(project);
  });

  it('accepts an environment pinned to a version and a preceding project', () => {
    const fields = { environmentId: 'studio-podcast', environmentVersion: 1, followsProjectId: 'b'.repeat(32) };
    expect(VideoLongProjectSchema.parse({ ...project, ...fields })).toEqual({ ...project, ...fields });
    expect(VideoLongCreateRequestSchema.parse({ ...request, ...fields })).toEqual({ ...request, ...fields });
  });

  it.each([
    { environmentVersion: 0 },
    { environmentId: 'Studio' },
    { followsProjectId: 'abc' },
  ])('rejects invalid environment and follow-up fields %#', (fields) => {
    expect(VideoLongProjectSchema.safeParse({ ...project, ...fields }).success).toBe(false);
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, ...fields }).success).toBe(false);
  });

  it('accepts a real 600-second essay request and a project with five steps', () => {
    expect(VideoLongCreateRequestSchema.parse(request)).toEqual(request);
    expect(VideoLongProjectSchema.parse(project)).toEqual(project);
  });

  it('accepts a project senza personaggio', () => {
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, modelId: null }).success).toBe(true);
    expect(VideoLongProjectSchema.safeParse({ ...project, modelId: null }).success).toBe(true);
  });

  it('exports limits and reuses engine ids and agent scope', () => {
    expect(VIDEO_LONG_MIN_SECONDS).toBe(120);
    expect(VIDEO_LONG_MAX_SECONDS).toBe(1200);
    expect(VIDEO_LONG_MAX_CHAPTERS).toBe(24);
    expect(VideoLongProjectIdSchema).toBe(VideoEngineIdSchema);
    expect(VideoLongScopeQuerySchema).toBe(CapabilityAgentScopeSchema);
    expect(VideoLongScopeQuerySchema.parse(identity)).toEqual(identity);
  });

  it.each([120, 1200])('accepts duration boundary %s', (durationSeconds) => {
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, durationSeconds }).success).toBe(true);
  });

  it.each([119, 1201, 600.5])('rejects invalid duration %s', (durationSeconds) => {
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, durationSeconds }).success).toBe(false);
    expect(VideoLongProjectSchema.safeParse({ ...project, durationSeconds }).success).toBe(false);
  });

  it.each([
    { family: 'documentario' },
    { modelId: 'Marco' },
    { budgetUsd: 0 },
    { budgetUsd: -1 },
    { budgetUsd: NaN },
    { budgetUsd: Infinity },
    { brief: '' },
    { brief: 'a'.repeat(6001) },
    { name: '' },
    { name: 'a'.repeat(201) },
    { presetId: 'Singola' },
    { aspectRatio: '4:3' },
    { extra: true },
  ])('rejects invalid shared fields %#', (invalid) => {
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, ...invalid }).success).toBe(false);
    expect(VideoLongProjectSchema.safeParse({ ...project, ...invalid }).success).toBe(false);
  });

  it('bounds requestedBy and requires an explicit modelId', () => {
    expect(VideoLongCreateRequestSchema.safeParse({ ...request, requestedBy: 'a'.repeat(256) }).success).toBe(true);
    for (const requestedBy of ['', 'a'.repeat(257)]) {
      expect(VideoLongCreateRequestSchema.safeParse({ ...request, requestedBy }).success).toBe(false);
    }
    const { modelId: _modelId, ...withoutModel } = request;
    expect(VideoLongCreateRequestSchema.safeParse(withoutModel).success).toBe(false);
  });

  it('accepts all families, steps and statuses and rejects unknown values', () => {
    for (const family of ['essay', 'podcast', 'brand', 'microdrama']) {
      expect(VideoLongFamilySchema.safeParse(family).success).toBe(true);
    }
    for (const step of ['bozza', 'ricerca', 'capitoli', 'fotogrammi', 'video']) {
      expect(VideoLongStepSchema.safeParse(step).success).toBe(true);
    }
    for (const status of ['da-fare', 'in-corso', 'da-approvare', 'approvato', 'fallito']) {
      expect(VideoLongStepStatusSchema.safeParse(status).success).toBe(true);
    }
    expect(VideoLongStepSchema.safeParse('montaggio').success).toBe(false);
    expect(VideoLongStepStatusSchema.safeParse('completato').success).toBe(false);
    expect(VideoLongStepStateSchema.safeParse({ step: 'bozza', status: 'da-fare', extra: true }).success).toBe(false);
  });

  it('rejects four or six steps and invalid project metadata', () => {
    for (const steps of [project.steps.slice(0, 4), [...project.steps, project.steps[0]]]) {
      expect(VideoLongProjectSchema.safeParse({ ...project, steps }).success).toBe(false);
    }
    for (const invalid of [{ id: 'marco' }, { createdAt: '' }, { createdAt: 'a'.repeat(41) }]) {
      expect(VideoLongProjectSchema.safeParse({ ...project, ...invalid }).success).toBe(false);
    }
    expect(VideoLongProjectSchema.safeParse({ ...project, createdAt: 'a'.repeat(40) }).success).toBe(true);
    for (const field of ['tenantId', 'ownerId', 'agentId']) {
      const incomplete: Record<string, string> = { ...identity };
      delete incomplete[field];
      expect(VideoLongScopeQuerySchema.safeParse(incomplete).success).toBe(false);
      expect(VideoLongProjectSchema.safeParse({ ...project, identity: incomplete }).success).toBe(false);
    }
    expect(VideoLongScopeQuerySchema.safeParse({ ...identity, extra: true }).success).toBe(false);
  });

  it('bounds project lists at 200 and rejects extra list fields', () => {
    expect(VideoLongProjectListSchema.safeParse({ projects: [] }).success).toBe(true);
    expect(VideoLongProjectListSchema.safeParse({ projects: Array.from({ length: 200 }, () => project) }).success).toBe(true);
    expect(VideoLongProjectListSchema.safeParse({ projects: Array.from({ length: 201 }, () => project) }).success).toBe(false);
    expect(VideoLongProjectListSchema.safeParse({ projects: [project], extra: true }).success).toBe(false);
  });

  it('keeps the contract portable without custom refinements', () => {
    const source = readFileSync(new URL('../../../src/capability/video/lungo.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
