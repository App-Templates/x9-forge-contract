import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_LONG_MAX_CHAPTERS,
  VIDEO_LONG_RESEARCH_START_TOOL,
  VIDEO_LONG_RESEARCH_GET_TOOL,
  VIDEO_LONG_DOSSIER_GET_TOOL,
  VIDEO_LONG_CHAPTERS_PUT_TOOL,
  VIDEO_LONG_CHAPTERS_GET_TOOL,
  VIDEO_LONG_CHAPTERS_APPROVE_TOOL,
  VIDEO_LONG_CREATE_TOOL,
  VIDEO_LONG_LIST_TOOL,
  VIDEO_LONG_GET_TOOL,
  VIDEO_LONG_DRAFT_PUT_TOOL,
  VIDEO_LONG_DRAFT_GET_TOOL,
  VIDEO_LONG_DRAFT_APPROVE_TOOL,
  VIDEO_LONG_COST_GET_TOOL,
  VideoLongResearchRefusalSchema,
  VideoLongResearchStartToolInputSchema,
  VideoLongResearchGetToolInputSchema,
  VideoLongDossierGetToolInputSchema,
  VideoLongChaptersPutToolInputSchema,
  VideoLongChaptersGetToolInputSchema,
  VideoLongChaptersApproveToolInputSchema,
  VideoLongResearchStartToolResponseSchema,
  VideoLongChaptersPutToolResponseSchema,
  VideoLongChaptersApproveToolResponseSchema,
  VideoLongResearchGetToolResponseSchema,
  VideoLongDossierGetToolResponseSchema,
  VideoLongChaptersGetToolResponseSchema,
  VideoLongResearchSchema,
  VideoLongDossierSchema,
  VideoLongChaptersSchema,
} from '../../../src/capability/video/index.js';

const projectId = 'a'.repeat(32);
const digest = 'b'.repeat(64);
const start = {
  projectId,
  draftRevision: 2,
  draftDigest: digest,
  questions: ['Quali innovazioni hanno reso possibile il cinema sonoro?'],
};
const chapter = {
  index: 1,
  title: 'Le origini',
  summary: 'Dai fratelli Lumière al primo cinema.',
  targetSeconds: 60,
  sourceIds: ['src-1'],
  frameHypotheses: [{ description: 'Archivio di una sala del 1900.', framing: 'immagini', sourceId: 'src-1' }],
};
const put = { projectId, draftRevision: 2, dossierRevision: 1, chapters: [chapter] };
const approve = { projectId, revision: 1, digest };
const research = {
  projectId,
  draftRevision: 2,
  draftDigest: digest,
  state: 'queued',
  gapsRef: null,
  researchIds: [],
  startedAt: '2026-11-25T10:00:00Z',
  finishedAt: null,
};
const chapters = {
  draftRevision: 2,
  dossierRevision: 1,
  chapters: [chapter],
  usage: null,
  revision: 1,
  status: 'da-approvare',
  totalSeconds: 60,
  digest,
  approvedAt: null,
};
const dossier = {
  draftRevision: 2,
  researchIds: [],
  sources: [],
  claims: [],
  costUsd: null,
  revision: 1,
  digest,
  recordedAt: '2026-11-25T10:05:00Z',
};

const inputs = {
  start: VideoLongResearchStartToolInputSchema,
  researchGet: VideoLongResearchGetToolInputSchema,
  dossierGet: VideoLongDossierGetToolInputSchema,
  put: VideoLongChaptersPutToolInputSchema,
  chaptersGet: VideoLongChaptersGetToolInputSchema,
  approve: VideoLongChaptersApproveToolInputSchema,
};

// SUMMARY mutations: adding labClientId to the research_start input turns the
// "no identity in inputs" case red; removing .omit({ usage: true }) turns the
// "usage written by the model" case red. Mutations run at the gate.
describe('long video research tools', () => {
  it('has six distinct names with the video_long_ prefix, none shared with lungo-tool', () => {
    const names = [
      VIDEO_LONG_RESEARCH_START_TOOL,
      VIDEO_LONG_RESEARCH_GET_TOOL,
      VIDEO_LONG_DOSSIER_GET_TOOL,
      VIDEO_LONG_CHAPTERS_PUT_TOOL,
      VIDEO_LONG_CHAPTERS_GET_TOOL,
      VIDEO_LONG_CHAPTERS_APPROVE_TOOL,
    ];
    const existing = [
      VIDEO_LONG_CREATE_TOOL,
      VIDEO_LONG_LIST_TOOL,
      VIDEO_LONG_GET_TOOL,
      VIDEO_LONG_DRAFT_PUT_TOOL,
      VIDEO_LONG_DRAFT_GET_TOOL,
      VIDEO_LONG_DRAFT_APPROVE_TOOL,
      VIDEO_LONG_COST_GET_TOOL,
    ];
    expect(new Set(names).size).toBe(6);
    for (const name of names) {
      expect(name.startsWith('video_long_')).toBe(true);
      expect(existing).not.toContain(name);
    }
  });

  it('accepts real inputs', () => {
    expect(inputs.start.parse(start)).toEqual(start);
    expect(inputs.researchGet.parse({ projectId })).toEqual({ projectId });
    expect(inputs.dossierGet.parse({ projectId })).toEqual({ projectId });
    expect(inputs.put.parse(put)).toEqual(put);
    expect(inputs.chaptersGet.parse({ projectId })).toEqual({ projectId });
    expect(inputs.approve.parse(approve)).toEqual(approve);
  });

  it('has no identity or lab scope in any input', () => {
    const forbidden = ['requestedBy', 'tenantId', 'ownerId', 'agentId', 'labClientId', 'labProjectId'];
    for (const schema of Object.values(inputs)) {
      for (const key of forbidden) expect(Object.keys(schema.shape)).not.toContain(key);
    }
    expect(inputs.start.safeParse({ ...start, labClientId: 'studio' }).success).toBe(false);
    expect(inputs.start.safeParse({ ...start, labProjectId: 'storia' }).success).toBe(false);
  });

  it.each([
    ['0 questions', { questions: [] }],
    ['13 questions', { questions: Array.from({ length: 13 }, (_, i) => `Domanda ${i + 1}?`) }],
    ['uppercase digest', { draftDigest: 'B'.repeat(64) }],
    ['draftRevision 0', { draftRevision: 0 }],
    ['extra field', { extra: true }],
  ])('research_start rejects %s', (_label, patch) => {
    expect(inputs.start.safeParse({ ...start, ...patch }).success).toBe(false);
  });

  it('research_start accepts 12 questions', () => {
    const questions = Array.from({ length: 12 }, (_, i) => `Domanda ${i + 1}?`);
    expect(inputs.start.safeParse({ ...start, questions }).success).toBe(true);
  });

  it('chapters_put rejects usage written by the model', () => {
    const usage = { provider: 'p', model: 'm', inputTokens: 1, outputTokens: 1, measured: true };
    expect(inputs.put.safeParse({ ...put, usage }).success).toBe(false);
    expect(inputs.put.safeParse({ ...put, usage: null }).success).toBe(false);
  });

  it('chapters_put bounds the chapter count', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => ({ ...chapter, index: i + 1 }));
    expect(inputs.put.safeParse({ ...put, chapters: [] }).success).toBe(false);
    expect(inputs.put.safeParse({ ...put, chapters: many(VIDEO_LONG_MAX_CHAPTERS) }).success).toBe(true);
    expect(inputs.put.safeParse({ ...put, chapters: many(VIDEO_LONG_MAX_CHAPTERS + 1) }).success).toBe(false);
  });

  it('chapters_approve rejects an uppercase digest', () => {
    expect(inputs.approve.safeParse({ ...approve, digest: 'B'.repeat(64) }).success).toBe(false);
  });

  it('read responses reuse the base schemas', () => {
    expect(VideoLongResearchGetToolResponseSchema).toBe(VideoLongResearchSchema);
    expect(VideoLongDossierGetToolResponseSchema).toBe(VideoLongDossierSchema);
    expect(VideoLongChaptersGetToolResponseSchema).toBe(VideoLongChaptersSchema);
    expect(VideoLongResearchGetToolResponseSchema.safeParse(research).success).toBe(true);
    expect(VideoLongDossierGetToolResponseSchema.safeParse(dossier).success).toBe(true);
    expect(VideoLongChaptersGetToolResponseSchema.safeParse(chapters).success).toBe(true);
  });

  it.each([
    ['research_start', VideoLongResearchStartToolResponseSchema, { status: 'avviata', research }],
    ['chapters_put', VideoLongChaptersPutToolResponseSchema, { status: 'salvati', chapters }],
    ['chapters_approve', VideoLongChaptersApproveToolResponseSchema, { status: 'approvati', chapters }],
  ])('%s response: success, refusal needs message, invented reason rejected', (_n, schema, ok) => {
    expect(schema.safeParse(ok).success).toBe(true);
    const reason = (schema.options[1].shape.reason.options as readonly string[])[0];
    expect(schema.safeParse({ status: 'rifiutata', reason, message: 'Motivo.' }).success).toBe(true);
    expect(schema.safeParse({ status: 'rifiutata', reason }).success).toBe(false);
    expect(schema.safeParse({ status: 'rifiutata', reason: 'inventato', message: 'x' }).success).toBe(false);
  });

  it('research_start reasons include every engine refusal code', () => {
    const reasons = VideoLongResearchStartToolResponseSchema.options[1].shape.reason.options as readonly string[];
    for (const code of VideoLongResearchRefusalSchema.options) expect(reasons).toContain(code);
    expect(reasons).toEqual(expect.arrayContaining(['progetto_sconosciuto', 'richiesta_non_valida', 'lab_non_collegato']));
  });

  it('exposes the exact reasons for put and approve', () => {
    expect(VideoLongChaptersPutToolResponseSchema.options[1].shape.reason.options).toEqual([
      'bozza_non_approvata', 'dossier_non_trovato', 'revisione_cambiata', 'dossier_cambiato',
      'capitoli_non_validi', 'durata_fuori_misura', 'progetto_sconosciuto', 'motore_non_disponibile',
    ]);
    expect(VideoLongChaptersApproveToolResponseSchema.options[1].shape.reason.options).toEqual([
      'revisione_superata', 'dossier_cambiato', 'impronta_diversa', 'bozza_non_approvata',
      'capitoli_non_trovati', 'progetto_sconosciuto', 'motore_non_disponibile',
    ]);
  });

  it('converts every input to JSON Schema for the manifest', () => {
    for (const schema of Object.values(inputs)) {
      expect(() => z.toJSONSchema(schema)).not.toThrow();
    }
  });
});
