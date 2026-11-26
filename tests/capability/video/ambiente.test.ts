import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CapabilityAgentScopeSchema } from '../../../src/capability/capability-call-identity.js';
import {
  VIDEO_ENVIRONMENT_KINDS,
  VIDEO_ENVIRONMENT_MAX_ANGLES,
  VIDEO_ENVIRONMENT_MAX_VERSIONS,
  VIDEO_ENVIRONMENT_MAX_PER_AGENT,
  VideoEnvironmentSchema,
  VideoEnvironmentListSchema,
  VideoEnvironmentAngleSchema,
  VideoEnvironmentVersionSchema,
  VideoEnvironmentNameSchema,
  VideoEnvironmentVersionParamSchema,
  VideoEnvironmentCreateRequestSchema,
  VideoEnvironmentVersionCreateRequestSchema,
  VideoEnvironmentApproveRequestSchema,
  VideoEnvironmentAngleRequestSchema,
  VideoEnvironmentScopeQuerySchema,
  type VideoEnvironment,
  type VideoEnvironmentAngleRequest,
} from '../../../src/capability/video/index.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const description = {
  room: 'Studio podcast con pareti in legno e pannelli acustici grigi.',
  furniture: 'Tavolo rotondo in rovere, due poltrone blu e microfoni neri.',
  light: 'Luce principale calda a sinistra, riempimento freddo a destra.',
};
const angles = [
  { name: 'frontale', framing: 'Vista frontale, ottica 35 mm, luce chiave a sinistra.', imagePath: 'frontale.png', sha256: 'a'.repeat(64) },
  { name: 'laterale', framing: 'Vista laterale destra, ottica 50 mm, chiave sul lato opposto.', imagePath: 'laterale.jpg', sha256: 'b'.repeat(64) },
  { name: 'campo-largo', framing: 'Campo largo, ottica 24 mm, chiave a sinistra del tavolo.', imagePath: 'campo-largo.jpeg', sha256: 'c'.repeat(64) },
];
const environment: VideoEnvironment = {
  id: 'studio-podcast',
  name: 'Studio podcast',
  kind: 'studio',
  identity,
  versions: [{ number: 1, status: 'approvata', description, angles, createdAt: '2026-11-25T10:00:00Z', approvedAt: '2026-11-25T10:05:00.123Z', digest: 'd'.repeat(64) }],
  currentVersion: 1,
};
const version = environment.versions[0];
const angleRequest: VideoEnvironmentAngleRequest = {
  projectId: 'a'.repeat(32), name: 'tre-quarti', framing: 'Ottica 50 mm, tre quarti da sinistra.', modelId: 'marco', maxCostUsd: 0.5,
};

// SUMMARY: removing .max(VIDEO_ENVIRONMENT_MAX_ANGLES) must fail the eleven-angle case; putting 8 back must fail the nine and ten-angle cases.
// Mutations and acceptance are run by the gate, not by this worker.
describe('environment library', () => {
  it('accepts a production podcast studio approved with three angles', () => {
    expect(VideoEnvironmentSchema.parse(environment)).toEqual(environment);
  });

  it('accepts a draft with zero angles and no approved version', () => {
    const draft = { ...environment, versions: [{ ...version, status: 'bozza', angles: [], approvedAt: null }], currentVersion: null };
    expect(VideoEnvironmentSchema.parse(draft)).toEqual(draft);
  });

  it('accepts up to ten angles and rejects eleven angles', () => {
    const withAngles = (length: number) => ({ ...version, angles: Array.from({ length }, (_, i) => ({ ...angles[0], name: `angle-${i}`, imagePath: `angle-${i}.png` })) });
    expect(VideoEnvironmentVersionSchema.safeParse(withAngles(8)).success).toBe(true);
    expect(VideoEnvironmentVersionSchema.safeParse(withAngles(9)).success).toBe(true);
    expect(VideoEnvironmentVersionSchema.safeParse(withAngles(10)).success).toBe(true);
    expect(VideoEnvironmentVersionSchema.safeParse(withAngles(11)).success).toBe(false);
  });

  it.each(['../frontale.png', 'studio/frontale.png', '/frontale.png', 'frontale.gif'])('rejects image path %s', (imagePath) => {
    expect(VideoEnvironmentAngleSchema.safeParse({ ...angles[0], imagePath }).success).toBe(false);
  });

  it.each([
    { id: 'Studio' }, { id: '../studio' }, { id: 'a'.repeat(49) },
    { kind: 'drone' }, { extra: true }, { currentVersion: 0 }, { currentVersion: 51 },
    { identity: { ownerId: 'owner-1', agentId: 'agent-1' } },
  ])('rejects invalid environment fields %#', (patch) => {
    expect(VideoEnvironmentSchema.safeParse({ ...environment, ...patch }).success).toBe(false);
  });

  it.each([
    { number: 0 }, { number: 51 }, { number: 1.5 }, { status: 'pubblicata' },
    { digest: 'abc' }, { createdAt: 'today' }, { approvedAt: '' }, { extra: true },
  ])('rejects invalid version fields %#', (patch) => {
    expect(VideoEnvironmentVersionSchema.safeParse({ ...version, ...patch }).success).toBe(false);
  });

  it.each([
    { sha256: 'abc' }, { sha256: 'A'.repeat(64) }, { name: 'Frontale' },
    { name: 'a'.repeat(41) }, { framing: '' }, { framing: 'a'.repeat(301) }, { extra: true },
  ])('rejects invalid angle fields %#', (patch) => {
    expect(VideoEnvironmentAngleSchema.safeParse({ ...angles[0], ...patch }).success).toBe(false);
  });

  it('bounds versions and per-agent lists', () => {
    expect(VideoEnvironmentSchema.safeParse({ ...environment, versions: Array.from({ length: 50 }, () => version) }).success).toBe(true);
    expect(VideoEnvironmentSchema.safeParse({ ...environment, versions: Array.from({ length: 51 }, () => version) }).success).toBe(false);
    expect(VideoEnvironmentListSchema.safeParse({ environments: [] }).success).toBe(true);
    expect(VideoEnvironmentListSchema.safeParse({ environments: Array.from({ length: 200 }, () => environment) }).success).toBe(true);
    expect(VideoEnvironmentListSchema.safeParse({ environments: Array.from({ length: 201 }, () => environment) }).success).toBe(false);
    expect(VideoEnvironmentListSchema.safeParse({ environments: [], extra: true }).success).toBe(false);
  });

  it('validates creation, version creation and approval bodies strictly', () => {
    const create = { name: environment.name, kind: environment.kind, description };
    expect(VideoEnvironmentCreateRequestSchema.parse(create)).toEqual(create);
    expect(VideoEnvironmentVersionCreateRequestSchema.parse({ description })).toEqual({ description });
    expect(VideoEnvironmentApproveRequestSchema.parse({ digest: version.digest })).toEqual({ digest: version.digest });
    expect(VideoEnvironmentCreateRequestSchema.safeParse({ ...create, extra: true }).success).toBe(false);
    expect(VideoEnvironmentVersionCreateRequestSchema.safeParse({ description, extra: true }).success).toBe(false);
    expect(VideoEnvironmentApproveRequestSchema.safeParse({ digest: 'abc' }).success).toBe(false);
    expect(VideoEnvironmentApproveRequestSchema.safeParse({ digest: version.digest, extra: true }).success).toBe(false);
    for (const field of ['room', 'furniture', 'light']) {
      for (const value of ['', ' ', 'a'.repeat(301)]) {
        expect(VideoEnvironmentCreateRequestSchema.safeParse({ ...create, description: { ...description, [field]: value } }).success).toBe(false);
      }
    }
    expect(VideoEnvironmentCreateRequestSchema.safeParse({ ...create, description: { ...description, extra: true } }).success).toBe(false);
  });

  it('accepts angle generation with a model or an empty background', () => {
    expect(VideoEnvironmentAngleRequestSchema.parse(angleRequest)).toEqual(angleRequest);
    expect(VideoEnvironmentAngleRequestSchema.parse({ ...angleRequest, modelId: null }).modelId).toBeNull();
  });

  it.each([
    { maxCostUsd: 0 }, { maxCostUsd: -1 }, { maxCostUsd: Infinity }, { maxCostUsd: NaN },
    { projectId: 'abc' }, { name: 'Tre-quarti' }, { framing: '' }, { modelId: 'Marco' }, { identity },
  ])('rejects invalid angle requests %#', (patch) => {
    expect(VideoEnvironmentAngleRequestSchema.safeParse({ ...angleRequest, ...patch }).success).toBe(false);
  });

  it('requires both a cost-owning project and an explicit model choice', () => {
    const { projectId: _projectId, ...withoutProject } = angleRequest;
    const { modelId: _modelId, ...withoutModel } = angleRequest;
    expect(VideoEnvironmentAngleRequestSchema.safeParse(withoutProject).success).toBe(false);
    expect(VideoEnvironmentAngleRequestSchema.safeParse(withoutModel).success).toBe(false);
  });

  it('exports limits, trims names and reuses the identity query', () => {
    expect(VIDEO_ENVIRONMENT_KINDS).toEqual(['studio', 'esterno', 'documentario']);
    expect(VIDEO_ENVIRONMENT_MAX_ANGLES).toBe(10);
    expect(VIDEO_ENVIRONMENT_MAX_VERSIONS).toBe(50);
    expect(VIDEO_ENVIRONMENT_MAX_PER_AGENT).toBe(200);
    expect(VideoEnvironmentScopeQuerySchema).toBe(CapabilityAgentScopeSchema);
    expect(VideoEnvironmentScopeQuerySchema.parse(identity)).toEqual(identity);
    expect(VideoEnvironmentNameSchema.parse(' Studio ')).toBe('Studio');
    for (const name of ['', ' ', 'a'.repeat(81)]) expect(VideoEnvironmentNameSchema.safeParse(name).success).toBe(false);
    for (const param of ['1', '50', '99']) expect(VideoEnvironmentVersionParamSchema.safeParse(param).success).toBe(true);
    for (const param of ['0', '01', '100', '../1']) expect(VideoEnvironmentVersionParamSchema.safeParse(param).success).toBe(false);
  });

  it('keeps the source portable without custom refinements', () => {
    const source = readFileSync(new URL('../../../src/capability/video/ambiente.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
