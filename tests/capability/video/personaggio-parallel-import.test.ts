import { describe, expect, it } from 'vitest';
import {
  VideoModelSchema,
  VideoParallelImportErrorSchema,
  VideoParallelImportRequestSchema,
  VideoParallelImportResultSchema,
} from '../../../src/capability/video/index.js';

// SUMMARY mutazioni: senza `.optional()` su origin il caso «senza origine» è rosso;
// senza `.max(4)` su viewsPresent il caso delle cinque viste è rosso.
const communityId = '01HZX9ABCDEFGHJKMNPQRSTVWX';
const sha = 'a'.repeat(64);
const minimal = { requestedBy: 'owner-1', communityId, characterId: 'char_alba3c' };
const full = { ...minimal, version: sha, name: 'Alba', modelId: 'alba-1' };
const result = {
  modelId: 'alba-1', characterId: 'char_alba3c', sourceVersion: null,
  viewsPresent: ['frontale'], viewsMissing: ['profilo'], voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z',
};
const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const saved = { id: 'giulia-1', name: 'Giulia', identity, versions: [], currentVersion: null };

describe('Parallel import request', () => {
  it('accepts minimal and full', () => {
    expect(VideoParallelImportRequestSchema.safeParse(minimal).success).toBe(true);
    expect(VideoParallelImportRequestSchema.safeParse(full).success).toBe(true);
  });
  it.each([
    ['short communityId', { communityId: 'ABC' }],
    ['characterId with space', { characterId: 'char 1' }],
    ['uppercase version', { version: 'A'.repeat(64) }],
    ['extra field', { extra: 1 }],
    ['empty requestedBy', { requestedBy: '' }],
  ])('rejects %s', (_n, patch) => {
    expect(VideoParallelImportRequestSchema.safeParse({ ...minimal, ...patch }).success).toBe(false);
  });
});

describe('Parallel import result and error', () => {
  it('accepts a valid result', () => {
    expect(VideoParallelImportResultSchema.safeParse(result).success).toBe(true);
  });
  it('rejects five views present', () => {
    const five = ['frontale', 'tre_quarti', 'profilo', 'figura_intera', 'frontale'];
    expect(VideoParallelImportResultSchema.safeParse({ ...result, viewsPresent: five }).success).toBe(false);
  });
  it('knows the error codes', () => {
    expect(VideoParallelImportErrorSchema.safeParse({ error: 'senza_consenso' }).success).toBe(true);
    expect(VideoParallelImportErrorSchema.safeParse({ error: 'altro' }).success).toBe(false);
  });
});

describe('VideoModel origin', () => {
  it('accepts a saved model without origin', () => {
    expect(VideoModelSchema.safeParse(saved).success).toBe(true);
  });
  it('accepts origin parallel with parallelRef', () => {
    const m = { ...saved, origin: 'parallel', parallelRef: { communityId, characterId: 'char_alba3c', version: null } };
    expect(VideoModelSchema.safeParse(m).success).toBe(true);
  });
  it('rejects unknown origin', () => {
    expect(VideoModelSchema.safeParse({ ...saved, origin: 'altro' }).success).toBe(false);
  });
});
