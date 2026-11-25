import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_LONG_CREATE_TOOL,
  VIDEO_LONG_LIST_TOOL,
  VIDEO_LONG_GET_TOOL,
  VIDEO_LONG_DRAFT_PUT_TOOL,
  VIDEO_LONG_DRAFT_GET_TOOL,
  VIDEO_LONG_DRAFT_APPROVE_TOOL,
  VIDEO_LONG_COST_GET_TOOL,
  VideoLongCreateToolInputSchema,
  VideoLongListToolInputSchema,
  VideoLongGetToolInputSchema,
  VideoLongDraftPutToolInputSchema,
  VideoLongDraftGetToolInputSchema,
  VideoLongDraftApproveToolInputSchema,
  VideoLongCostGetToolInputSchema,
  VideoLongCreateToolResponseSchema,
  VideoLongListToolResponseSchema,
  VideoLongGetToolResponseSchema,
  VideoLongDraftPutToolResponseSchema,
  VideoLongDraftGetToolResponseSchema,
  VideoLongDraftApproveToolResponseSchema,
  VideoLongCostGetToolResponseSchema,
  VideoLongProjectSchema,
  VideoLongProjectListSchema,
  VideoLongDraftSchema,
  VideoCostByStepSchema,
  type VideoLongCreateToolInput,
  type VideoLongDraftPutToolInput,
  type VideoLongDraftApproveToolInput,
} from '../../../src/capability/video/index.js';

const projectId = 'a'.repeat(32);
const digest = 'b'.repeat(64);
const create: VideoLongCreateToolInput = {
  name: 'La storia del cinema',
  family: 'essay',
  presetId: 'singola',
  aspectRatio: '16:9',
  durationSeconds: 600,
  modelId: null,
  brief: 'Racconta la storia del cinema in capitoli.',
  budgetUsd: 25,
};
const put: VideoLongDraftPutToolInput = {
  projectId,
  logline: 'Un viaggio nella storia del cinema.',
  thesis: 'Il cinema cambia il nostro sguardo.',
  paragraphs: ['Le origini del cinema.', 'Il cinema contemporaneo.'],
  chapters: [
    { index: 1, title: 'Origini', summary: 'La nascita del cinema.', targetSeconds: 300 },
    { index: 2, title: 'Oggi', summary: 'Il cinema contemporaneo.', targetSeconds: 300 },
  ],
};
const approve: VideoLongDraftApproveToolInput = { projectId, revision: 1, digest };
const draft = {
  revision: 1,
  status: 'bozza',
  logline: put.logline,
  thesis: put.thesis,
  paragraphs: put.paragraphs,
  chapters: put.chapters,
  usage: null,
  totalSeconds: 600,
  digest,
  approvedAt: null,
};

const inputs = [
  { name: 'create', schema: VideoLongCreateToolInputSchema, input: create },
  { name: 'list', schema: VideoLongListToolInputSchema, input: {} },
  { name: 'get', schema: VideoLongGetToolInputSchema, input: { projectId } },
  { name: 'draft_put', schema: VideoLongDraftPutToolInputSchema, input: put },
  { name: 'draft_get', schema: VideoLongDraftGetToolInputSchema, input: { projectId } },
  { name: 'draft_approve', schema: VideoLongDraftApproveToolInputSchema, input: approve },
  { name: 'cost_get', schema: VideoLongCostGetToolInputSchema, input: { projectId } },
];

// SUMMARY: adding requestedBy to create must fail "nessuna identità negli ingressi";
// removing .omit({ usage: true }) must fail "usage scritto dal modello".
// Acceptance, type checks and these mutations are run by the gate.
describe('long video tools', () => {
  it('keeps seven distinct video_long_ tool names stable', () => {
    const names = [
      VIDEO_LONG_CREATE_TOOL, VIDEO_LONG_LIST_TOOL, VIDEO_LONG_GET_TOOL,
      VIDEO_LONG_DRAFT_PUT_TOOL, VIDEO_LONG_DRAFT_GET_TOOL,
      VIDEO_LONG_DRAFT_APPROVE_TOOL, VIDEO_LONG_COST_GET_TOOL,
    ];
    expect(names).toEqual([
      'video_long_create', 'video_long_list', 'video_long_get',
      'video_long_draft_put', 'video_long_draft_get',
      'video_long_draft_approve', 'video_long_cost_get',
    ]);
    expect(new Set(names).size).toBe(7);
    for (const name of names) expect(name.startsWith('video_long_')).toBe(true);
  });

  it.each(inputs)('accepts production-shaped $name input and rejects extra fields', ({ schema, input }) => {
    expect(schema.parse(input)).toEqual(input);
    expect(schema.safeParse({ ...input, extra: true }).success).toBe(false);
  });

  it.each(inputs)('nessuna identità negli ingressi: $name', ({ schema, input }) => {
    for (const field of ['requestedBy', 'tenantId', 'ownerId', 'agentId', 'identity']) {
      expect(schema.shape).not.toHaveProperty(field);
      const value = field === 'identity'
        ? { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' }
        : 'scope-1';
      expect(schema.safeParse({ ...input, [field]: value }).success).toBe(false);
    }
  });

  it.each([
    { durationSeconds: 119 }, { family: 'unknown' }, { brief: '' }, { extra: true },
  ])('rejects invalid create input %#', (patch) => {
    expect(VideoLongCreateToolInputSchema.safeParse({ ...create, ...patch }).success).toBe(false);
  });

  it('accepts inherited duration boundaries and an explicit character', () => {
    for (const durationSeconds of [120, 1200]) {
      expect(VideoLongCreateToolInputSchema.safeParse({ ...create, durationSeconds, modelId: 'marco' }).success).toBe(true);
    }
    expect(VideoLongCreateToolInputSchema.safeParse({ ...create, durationSeconds: 1201 }).success).toBe(false);
  });

  it('rejects usage scritto dal modello, including null', () => {
    for (const usage of [null, {
      provider: 'anthropic', model: 'claude-sonnet-5-5',
      inputTokens: 1200, outputTokens: 800, measured: false,
    }]) {
      expect(VideoLongDraftPutToolInputSchema.safeParse({ ...put, usage }).success).toBe(false);
    }
  });

  it('rejects 0 and 41 paragraphs while accepting 1 and 40', () => {
    for (const count of [0, 41]) {
      expect(VideoLongDraftPutToolInputSchema.safeParse({
        ...put, paragraphs: Array.from({ length: count }, () => 'Testo della bozza.'),
      }).success).toBe(false);
    }
    for (const count of [1, 40]) {
      expect(VideoLongDraftPutToolInputSchema.safeParse({
        ...put, paragraphs: Array.from({ length: count }, () => 'Testo della bozza.'),
      }).success).toBe(true);
    }
  });

  it('reuses project id, revision and lowercase digest constraints', () => {
    for (const schema of [
      VideoLongGetToolInputSchema, VideoLongDraftGetToolInputSchema, VideoLongCostGetToolInputSchema,
    ]) {
      expect(schema.safeParse({}).success).toBe(false);
      expect(schema.safeParse({ projectId: 'invalid' }).success).toBe(false);
    }
    expect(VideoLongDraftPutToolInputSchema.safeParse({ ...put, projectId: 'invalid' }).success).toBe(false);
    for (const patch of [
      { projectId: 'invalid' }, { revision: 0 }, { revision: 1.5 },
      { digest: 'B'.repeat(64) }, { digest: 'abc' }, { digest: 'b'.repeat(65) },
    ]) {
      expect(VideoLongDraftApproveToolInputSchema.safeParse({ ...approve, ...patch }).success).toBe(false);
    }
    expect(VideoLongDraftApproveToolInputSchema.safeParse({ projectId, revision: 1 }).success).toBe(false);
  });

  it('reuses the production response schemas', () => {
    expect(VideoLongCreateToolResponseSchema).toBe(VideoLongProjectSchema);
    expect(VideoLongGetToolResponseSchema).toBe(VideoLongProjectSchema);
    expect(VideoLongListToolResponseSchema).toBe(VideoLongProjectListSchema);
    expect(VideoLongDraftGetToolResponseSchema).toBe(VideoLongDraftSchema);
    expect(VideoLongCostGetToolResponseSchema).toBe(VideoCostByStepSchema);
  });

  it('accepts saved and approved drafts', () => {
    const saved = { status: 'salvata', draft };
    expect(VideoLongDraftPutToolResponseSchema.parse(saved)).toEqual(saved);
    const approved = {
      status: 'approvata',
      draft: { ...draft, status: 'approvata', approvedAt: '2026-11-25T10:00:00Z' },
    };
    expect(VideoLongDraftApproveToolResponseSchema.parse(approved)).toEqual(approved);
  });

  it.each([
    {
      name: 'put', schema: VideoLongDraftPutToolResponseSchema, success: 'salvata',
      reasons: ['somma_capitoli', 'indici_non_consecutivi', 'gia_approvata', 'progetto_sconosciuto', 'motore_non_disponibile'],
      otherReason: 'bozza_mancante',
    },
    {
      name: 'approve', schema: VideoLongDraftApproveToolResponseSchema, success: 'approvata',
      reasons: ['bozza_mancante', 'revisione_cambiata', 'impronta_diversa', 'gia_approvata', 'progetto_sconosciuto', 'motore_non_disponibile'],
      otherReason: 'somma_capitoli',
    },
  ])('requires message for each rejected $name reason and rejects malformed branches', ({ schema, reasons, success, otherReason }) => {
    for (const reason of reasons) {
      const response = { status: 'rifiutata', reason, message: 'La richiesta non può essere completata.' };
      expect(schema.parse(response)).toEqual(response);
      expect(schema.safeParse({ status: 'rifiutata', reason }).success).toBe(false);
      expect(schema.safeParse({ ...response, message: 123 }).success).toBe(false);
      expect(schema.safeParse({ ...response, extra: true }).success).toBe(false);
    }
    for (const invalid of [
      { status: 'rifiutata', reason: 'unknown', message: 'Errore' },
      { status: 'rifiutata', reason: otherReason, message: 'Errore' },
      { status: 'unknown', draft }, { status: success },
      { status: success, draft: { ...draft, digest: 'invalid' } },
      { status: success, draft, extra: true },
    ]) {
      expect(schema.safeParse(invalid).success).toBe(false);
    }
  });

  it.each(inputs)('exports manifest-compatible JSON Schema for $name', ({ schema }) => {
    const json = z.toJSONSchema(schema);
    expect(json.type).toBe('object');
    expect(json.additionalProperties).toBe(false);
    expect(json.description).toBeTruthy();
    expect(json.properties).toBeDefined();
    for (const field of ['requestedBy', 'tenantId', 'ownerId', 'agentId', 'identity']) {
      expect(json.properties).not.toHaveProperty(field);
    }
  });
});
