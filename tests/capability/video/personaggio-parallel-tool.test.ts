import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  VIDEO_CHARACTER_IMPORT_REASONS,
  VIDEO_CHARACTER_IMPORT_TOOL,
  VIDEO_CHARACTER_LIST_TOOL,
  VIDEO_CHARACTER_OUTFIT_STYLE_REASONS,
  VIDEO_CHARACTER_OUTFIT_STYLE_TOOL,
  VIDEO_OUTFIT_STYLE_MAX_REQUEST,
  VideoCharacterImportToolInputSchema,
  VideoCharacterImportToolResponseSchema,
  VideoCharacterListToolInputSchema,
  VideoCharacterListToolResponseSchema,
  VideoCharacterOutfitStyleToolInputSchema,
  VideoCharacterOutfitStyleToolResponseSchema,
  VideoOutfitProductionQuerySchema,
  VideoOutfitStyleResultSchema,
} from '../../../src/capability/video/index.js';

const COMMUNITY = '01HZX3K9Q4N5R6S7T8V9W0XYZA';
const SHA = 'a'.repeat(64);

const item = (extra: Record<string, unknown> = {}) => ({
  characterId: 'livia_01',
  name: 'Livia',
  version: SHA,
  consent: 'valido',
  viewsDeclared: ['frontale'],
  portraitCount: 1,
  voiceAssigned: false,
  missing: ['portraitViews'],
  alreadyImportedAs: null,
  ...extra,
});
const list = (characters: unknown[]) => ({ status: 'elenco', communityId: COMMUNITY, characters });

describe('video character tools: names and inputs', () => {
  it('has three distinct names with the video_character_ prefix', () => {
    const names = [VIDEO_CHARACTER_LIST_TOOL, VIDEO_CHARACTER_IMPORT_TOOL, VIDEO_CHARACTER_OUTFIT_STYLE_TOOL];
    expect(new Set(names).size).toBe(3);
    for (const n of names) expect(n.startsWith('video_character_')).toBe(true);
  });

  it('has no identity or lab scope in any input', () => {
    const forbidden = ['requestedBy', 'tenantId', 'ownerId', 'agentId', 'labClientId'];
    for (const s of [VideoCharacterListToolInputSchema, VideoCharacterImportToolInputSchema, VideoCharacterOutfitStyleToolInputSchema]) {
      for (const k of forbidden) expect(Object.keys(s.shape)).not.toContain(k);
    }
    expect(Object.keys(VideoCharacterListToolInputSchema.shape)).not.toContain('modelId');
    expect(Object.keys(VideoCharacterImportToolInputSchema.shape)).not.toContain('modelId');
    expect(Object.keys(VideoCharacterOutfitStyleToolInputSchema.shape)).toContain('modelId');
  });

  it('rejects a communityId that is not a ULID', () => {
    expect(VideoCharacterListToolInputSchema.safeParse({ communityId: 'abc' }).success).toBe(false);
    expect(VideoCharacterListToolInputSchema.safeParse({ communityId: COMMUNITY.toLowerCase() }).success).toBe(false);
    expect(VideoCharacterListToolInputSchema.safeParse({ communityId: COMMUNITY }).success).toBe(true);
  });

  it('import rejects an uppercase version and an extra field', () => {
    const ok = { communityId: COMMUNITY, characterId: 'livia_01', version: SHA, name: 'Livia' };
    expect(VideoCharacterImportToolInputSchema.safeParse(ok).success).toBe(true);
    expect(VideoCharacterImportToolInputSchema.safeParse({ ...ok, version: SHA.toUpperCase() }).success).toBe(false);
    expect(VideoCharacterImportToolInputSchema.safeParse({ ...ok, requestedBy: 'x' }).success).toBe(false);
    expect(VideoCharacterImportToolInputSchema.safeParse({ ...ok, modelId: 'livia' }).success).toBe(false);
    expect(VideoCharacterImportToolInputSchema.safeParse({ communityId: COMMUNITY, characterId: 'c' }).success).toBe(true);
  });

  it('outfit rejects empty, 301 characters and modelId with capitals', () => {
    const ok = { modelId: 'livia', request: 'abito da sera' };
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse(ok).success).toBe(true);
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse({ ...ok, request: '   ' }).success).toBe(false);
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse({ ...ok, request: 'a'.repeat(VIDEO_OUTFIT_STYLE_MAX_REQUEST) }).success).toBe(true);
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse({ ...ok, request: 'a'.repeat(301) }).success).toBe(false);
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse({ ...ok, modelId: 'Livia' }).success).toBe(false);
    expect(VideoCharacterOutfitStyleToolInputSchema.safeParse({ ...ok, tenantId: 't' }).success).toBe(false);
  });

  it('converts all three inputs to JSON Schema', () => {
    for (const s of [VideoCharacterListToolInputSchema, VideoCharacterImportToolInputSchema, VideoCharacterOutfitStyleToolInputSchema]) {
      expect(() => z.toJSONSchema(s)).not.toThrow();
    }
  });
});

describe('video character list response', () => {
  it('accepts a character as the 25 of today: one portrait, no views, all views missing', () => {
    const r = VideoCharacterListToolResponseSchema.safeParse(list([item({ viewsDeclared: [], missing: ['portraitViews', 'voice'] })]));
    expect(r.success).toBe(true);
  });

  it('rejects backstory and portrait addresses (strict)', () => {
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ backstory: 'storia' })])).success).toBe(false);
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ assetUrl: 'https://x.example/a.png' })])).success).toBe(false);
  });

  it('rejects an unknown consent and more than 50 characters', () => {
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ consent: 'forse' })])).success).toBe(false);
    expect(VideoCharacterListToolResponseSchema.safeParse(list(Array.from({ length: 50 }, () => item()))).success).toBe(true);
    expect(VideoCharacterListToolResponseSchema.safeParse(list(Array.from({ length: 51 }, () => item()))).success).toBe(false);
  });

  it('bounds portraitCount and requires a lowercase model id when already imported', () => {
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ portraitCount: 9 })])).success).toBe(false);
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ alreadyImportedAs: 'Livia' })])).success).toBe(false);
    expect(VideoCharacterListToolResponseSchema.safeParse(list([item({ alreadyImportedAs: 'livia', version: null })])).success).toBe(true);
  });

  it('refuses with a known reason and a message only', () => {
    const base = { status: 'rifiutata', message: 'no' };
    for (const reason of ['parallel_non_collegato', 'comunita_non_trovata', 'comunita_non_pronta', 'non_autorizzato', 'nessun_gruppo_per_te', 'parallel_non_disponibile', 'motore_non_disponibile']) {
      expect(VideoCharacterListToolResponseSchema.safeParse({ ...base, reason }).success).toBe(true);
    }
    expect(VideoCharacterListToolResponseSchema.safeParse({ ...base, reason: 'altro' }).success).toBe(false);
    expect(VideoCharacterListToolResponseSchema.safeParse({ status: 'rifiutata', reason: 'non_autorizzato' }).success).toBe(false);
  });
});

describe('video character import and outfit responses', () => {
  it('import reasons are exactly the nine allowed', () => {
    expect([...VIDEO_CHARACTER_IMPORT_REASONS].sort()).toEqual([
      'aspetto_incompleto', 'comunita_non_trovata', 'fonte_non_disponibile', 'motore_non_disponibile',
      'nome_esistente', 'personaggio_gia_importato', 'personaggio_non_trovato', 'ritratto_illeggibile', 'senza_consenso',
    ]);
    for (const reason of VIDEO_CHARACTER_IMPORT_REASONS) {
      expect(VideoCharacterImportToolResponseSchema.safeParse({ status: 'rifiutata', reason, message: 'm' }).success).toBe(true);
    }
    expect(VideoCharacterImportToolResponseSchema.safeParse({ status: 'rifiutata', reason: 'non_da_parallel', message: 'm' }).success).toBe(false);
  });

  it('import success carries the engine result', () => {
    const result = {
      modelId: 'livia', characterId: 'livia_01', sourceVersion: SHA,
      viewsPresent: ['frontale'], viewsMissing: ['profilo'], voiceAssigned: false, importedAt: '2026-11-25T10:00:00Z',
    };
    expect(VideoCharacterImportToolResponseSchema.safeParse({ status: 'importato', result }).success).toBe(true);
    expect(VideoCharacterImportToolResponseSchema.safeParse({ status: 'importato', result: { ...result, extra: 1 } }).success).toBe(false);
  });

  it('outfit reasons are exactly the four allowed', () => {
    expect([...VIDEO_CHARACTER_OUTFIT_STYLE_REASONS].sort()).toEqual([
      'modello_sconosciuto', 'motore_non_disponibile', 'non_da_parallel', 'richiesta_non_valida',
    ]);
    for (const reason of VIDEO_CHARACTER_OUTFIT_STYLE_REASONS) {
      expect(VideoCharacterOutfitStyleToolResponseSchema.safeParse({ status: 'rifiutata', reason, message: 'm' }).success).toBe(true);
    }
    expect(VideoCharacterOutfitStyleToolResponseSchema.safeParse({ status: 'rifiutata', reason: 'senza_consenso', message: 'm' }).success).toBe(false);
  });

  it('outfit result keeps constraints verbatim and caps description at 500 like the outfit schema', () => {
    const constraints = ['Niente Jeans, MAI sneakers.', 'Colori: Blu/Nero; tessuti naturali!'];
    const ok = { description: 'a'.repeat(500), constraints, rules: 'complete' };
    const r = VideoOutfitStyleResultSchema.parse(ok);
    expect(r.constraints).toEqual(constraints);
    expect(VideoOutfitStyleResultSchema.safeParse({ ...ok, description: 'a'.repeat(501) }).success).toBe(false);
    expect(VideoOutfitStyleResultSchema.safeParse({ ...ok, rules: 'altro' }).success).toBe(false);
    expect(VideoCharacterOutfitStyleToolResponseSchema.safeParse({ status: 'composta', ...ok }).success).toBe(true);
    expect(VideoCharacterOutfitStyleToolResponseSchema.safeParse({ status: 'composta', ...ok, description: 'a'.repeat(501) }).success).toBe(false);
    const production = VideoOutfitProductionQuerySchema.shape.description.unwrap();
    expect(production.safeParse('a'.repeat(500)).success).toBe(true);
    expect(production.safeParse('a'.repeat(501)).success).toBe(false);
  });
});
