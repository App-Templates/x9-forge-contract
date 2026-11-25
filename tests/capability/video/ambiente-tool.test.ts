import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_CHARACTER_IMPORT_TOOL,
  VIDEO_CHARACTER_LIST_TOOL,
  VIDEO_CHARACTER_OUTFIT_STYLE_TOOL,
  VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL,
  VIDEO_ENVIRONMENT_APPROVE_TOOL,
  VIDEO_ENVIRONMENT_CREATE_TOOL,
  VIDEO_ENVIRONMENT_GET_TOOL,
  VIDEO_ENVIRONMENT_LIST_TOOL,
  VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL,
  VIDEO_LONG_CHAPTERS_APPROVE_TOOL,
  VIDEO_LONG_CREATE_TOOL,
  VIDEO_LONG_RESEARCH_START_TOOL,
  VideoEnvironmentAngleAddToolInputSchema,
  VideoEnvironmentApproveToolInputSchema,
  VideoEnvironmentCreateToolInputSchema,
  VideoEnvironmentGetToolInputSchema,
  VideoEnvironmentListToolInputSchema,
  VideoEnvironmentVersionCreateToolInputSchema,
  VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS,
  VIDEO_ENVIRONMENT_APPROVE_REASONS,
  VIDEO_ENVIRONMENT_CREATE_REASONS,
  VIDEO_ENVIRONMENT_GET_REASONS,
  VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS,
  VideoEnvironmentAngleAddToolResponseSchema,
  VideoEnvironmentApproveToolResponseSchema,
  VideoEnvironmentCreateToolResponseSchema,
  VideoEnvironmentGetToolResponseSchema,
  VideoEnvironmentListToolResponseSchema,
  VideoEnvironmentVersionCreateToolResponseSchema,
  VideoLongCreateToolInputSchema,
} from '../../../src/capability/video/index.js';

const SHA = 'a'.repeat(64);
const description = { room: 'Studio con pareti scure', furniture: 'Tavolo rotondo e due poltrone', light: 'Luce calda dall\'alto' };
const angle = {
  environmentId: 'studio-podcast',
  version: 1,
  projectId: 'a'.repeat(32),
  name: 'controcampo',
  framing: 'Campo medio dal lato opposto del tavolo',
  modelId: 'livia-01',
  maxCostUsd: 0.5,
};

const inputs = [
  [VideoEnvironmentListToolInputSchema, {}],
  [VideoEnvironmentGetToolInputSchema, { environmentId: 'studio-podcast' }],
  [VideoEnvironmentCreateToolInputSchema, { name: 'Studio podcast', kind: 'studio', description }],
  [VideoEnvironmentVersionCreateToolInputSchema, { environmentId: 'studio-podcast', description }],
  [VideoEnvironmentAngleAddToolInputSchema, angle],
  [VideoEnvironmentApproveToolInputSchema, { environmentId: 'studio-podcast', version: 1, digest: SHA }],
] as const;

describe('video environment tools: names and inputs', () => {
  it('has six distinct names with the video_environment_ prefix, apart from long and character tools', () => {
    const names = [
      VIDEO_ENVIRONMENT_LIST_TOOL,
      VIDEO_ENVIRONMENT_GET_TOOL,
      VIDEO_ENVIRONMENT_CREATE_TOOL,
      VIDEO_ENVIRONMENT_VERSION_CREATE_TOOL,
      VIDEO_ENVIRONMENT_ANGLE_ADD_TOOL,
      VIDEO_ENVIRONMENT_APPROVE_TOOL,
    ];
    expect(new Set(names).size).toBe(6);
    for (const n of names) expect(n.startsWith('video_environment_')).toBe(true);
    const others = [
      VIDEO_LONG_CREATE_TOOL,
      VIDEO_LONG_RESEARCH_START_TOOL,
      VIDEO_LONG_CHAPTERS_APPROVE_TOOL,
      VIDEO_CHARACTER_LIST_TOOL,
      VIDEO_CHARACTER_IMPORT_TOOL,
      VIDEO_CHARACTER_OUTFIT_STYLE_TOOL,
    ];
    for (const n of names) expect(others).not.toContain(n);
  });

  it('accepts a valid example for every input', () => {
    for (const [schema, ok] of inputs) expect(schema.safeParse(ok).success).toBe(true);
  });

  it('has no identity or lab scope in any input', () => {
    const forbidden = ['requestedBy', 'tenantId', 'ownerId', 'agentId', 'labClientId'];
    for (const [schema] of inputs) {
      for (const k of forbidden) expect(Object.keys(schema.shape)).not.toContain(k);
    }
  });

  it('rejects an extra field on every input', () => {
    for (const [schema, ok] of inputs) {
      expect(schema.safeParse({ ...ok, extra: 1 }).success).toBe(false);
      expect(schema.safeParse({ ...ok, tenantId: 't' }).success).toBe(false);
    }
  });

  it('create rejects an empty name, an unknown kind and a description without light', () => {
    const ok = { name: 'Studio', kind: 'studio', description };
    expect(VideoEnvironmentCreateToolInputSchema.safeParse({ ...ok, name: '  ' }).success).toBe(false);
    expect(VideoEnvironmentCreateToolInputSchema.safeParse({ ...ok, kind: 'garage' }).success).toBe(false);
    const { light: _light, ...noLight } = description;
    expect(VideoEnvironmentCreateToolInputSchema.safeParse({ ...ok, description: noLight }).success).toBe(false);
  });

  it('angle_add rejects a zero or negative cost, a version out of range and an uppercase angle name', () => {
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, maxCostUsd: 0 }).success).toBe(false);
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, maxCostUsd: -1 }).success).toBe(false);
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, version: 0 }).success).toBe(false);
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, version: 51 }).success).toBe(false);
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, name: 'Controcampo' }).success).toBe(false);
  });

  it('angle_add accepts a null model for the empty background', () => {
    expect(VideoEnvironmentAngleAddToolInputSchema.safeParse({ ...angle, modelId: null }).success).toBe(true);
  });

  it('approve rejects an uppercase digest', () => {
    const ok = { environmentId: 'studio-podcast', version: 1 };
    expect(VideoEnvironmentApproveToolInputSchema.safeParse({ ...ok, digest: 'A'.repeat(64) }).success).toBe(false);
    expect(VideoEnvironmentApproveToolInputSchema.safeParse({ ...ok, digest: 'a'.repeat(63) }).success).toBe(false);
  });

  it('turns every input into a JSON schema for the manifest', () => {
    for (const [schema] of inputs) {
      const json = z.toJSONSchema(schema);
      expect(json.type).toBe('object');
    }
  });
});

const version = {
  number: 1,
  status: 'bozza',
  description,
  angles: [{ name: 'controcampo', framing: 'Campo medio', imagePath: 'img_1.png', sha256: SHA }],
  createdAt: '2026-11-25T10:00:00Z',
  approvedAt: null,
  digest: SHA,
};
const environment = {
  id: 'studio-podcast',
  name: 'Studio podcast',
  kind: 'studio',
  identity: { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' },
  versions: [version],
  currentVersion: null,
};

const responses = [
  ['get', VideoEnvironmentGetToolResponseSchema, { status: 'trovato', environment }, VIDEO_ENVIRONMENT_GET_REASONS],
  ['create', VideoEnvironmentCreateToolResponseSchema, { status: 'creato', environment }, VIDEO_ENVIRONMENT_CREATE_REASONS],
  [
    'version_create',
    VideoEnvironmentVersionCreateToolResponseSchema,
    { status: 'versione_creata', version },
    VIDEO_ENVIRONMENT_VERSION_CREATE_REASONS,
  ],
  [
    'angle_add',
    VideoEnvironmentAngleAddToolResponseSchema,
    { status: 'angolazione_aggiunta', version },
    VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS,
  ],
  ['approve', VideoEnvironmentApproveToolResponseSchema, { status: 'approvata', version }, VIDEO_ENVIRONMENT_APPROVE_REASONS],
] as const;

// SUMMARY mutations: removing 'senza_angolazioni' from the approve reasons turns the approve rejection case red;
// making environmentId required turns the "optional" case red.
describe('environment tool responses', () => {
  it.each(responses)('%s accepts its success state and rejects a bare status', (_n, schema, ok) => {
    expect(schema.safeParse(ok).success).toBe(true);
    expect(schema.safeParse({ status: ok.status }).success).toBe(false);
  });

  it.each(responses)('%s accepts every listed reason, requires message, rejects an invented reason', (_n, schema, _ok, reasons) => {
    for (const reason of reasons) {
      expect(schema.safeParse({ status: 'rifiutata', reason, message: 'No.' }).success).toBe(true);
      expect(schema.safeParse({ status: 'rifiutata', reason }).success).toBe(false);
    }
    expect(schema.safeParse({ status: 'rifiutata', reason: 'inventato', message: 'No.' }).success).toBe(false);
  });

  it('approve can refuse an environment version without angles', () => {
    expect(
      VideoEnvironmentApproveToolResponseSchema.safeParse({ status: 'rifiutata', reason: 'senza_angolazioni', message: 'Mancano angolazioni.' })
        .success,
    ).toBe(true);
  });

  it('angle_add covers every engine code', () => {
    for (const reason of [
      'angolazione_esistente', 'angolazioni_troppe', 'modello_non_approvato', 'riferimento_alterato', 'costo_oltre_tetto',
      'budget_insufficiente', 'generazione_fallita', 'generazione_non_disponibile', 'versione_approvata',
    ]) {
      expect(VIDEO_ENVIRONMENT_ANGLE_ADD_REASONS).toContain(reason);
    }
  });

  it('list accepts an empty library', () => {
    expect(VideoEnvironmentListToolResponseSchema.safeParse({ environments: [] }).success).toBe(true);
  });
});

describe('video_long_create environment fields', () => {
  const base = {
    name: 'Podcast', family: 'essay', presetId: 'singola', aspectRatio: '16:9', durationSeconds: 600,
    modelId: null, brief: 'Una puntata.', budgetUsd: 25,
  };
  it('keeps environmentId, environmentVersion and followsProjectId optional and described', () => {
    const json = z.toJSONSchema(VideoLongCreateToolInputSchema) as {
      required?: string[];
      properties: Record<string, { description?: string }>;
    };
    for (const key of ['environmentId', 'environmentVersion', 'followsProjectId']) {
      expect(json.required ?? []).not.toContain(key);
      expect(json.properties[key]?.description).toBeTruthy();
    }
  });
  it('still accepts a project saved today, without environment or follow-up', () => {
    expect(VideoLongCreateToolInputSchema.safeParse(base).success).toBe(true);
  });
});
