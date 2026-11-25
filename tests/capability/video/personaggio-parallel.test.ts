import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  VIDEO_MODEL_REF_MAX_BYTES,
  VIDEO_PARALLEL_MAX_BACKSTORY,
  VIDEO_PARALLEL_MAX_PORTRAITS,
  VideoModelRefKindSchema,
  VideoParallelCharacterSchema,
  VideoParallelExportErrorSchema,
  VideoParallelExportQuerySchema,
  VideoParallelExportSchema,
  VideoParallelViewSchema,
  type VideoParallelCharacter,
} from '../../../src/capability/video/index.js';

const portrait = {
  imageId: 'img_etl-1',
  assetUrl: 'http://parallel-prod-asset-svc:4001/asset/img_etl-1?tenantId=salina&canonId=salina',
  contentType: 'image/jpeg',
  sizeBytes: 120000,
};
const minimal: VideoParallelCharacter = {
  characterId: 'char_alba3c',
  name: 'etl',
  backstory: 'Lavora a Salina e conosce la comunità.',
  style: { toneGuidelines: 'Parla con tono diretto e concreto.' },
  portraits: [{ ...portrait, contentType: 'image/jpeg' }],
};
const full: VideoParallelCharacter = {
  ...minimal,
  characterId: 'char_livia',
  name: 'Livia',
  portraits: [{ ...minimal.portraits[0]!, view: 'tre_quarti', sha256: 'a'.repeat(64) }],
  personType: {
    role: 'Engineer', archetype: 'engineer', ladder: 'R3',
    hobbies: ['Reading'], motivations: ['Helping the community'], flaws: ['Impatience'], languages: ['Italian'],
  },
  appearance: {
    hairColor: 'Brown', hairStyle: 'Short', eyeColor: 'Brown', build: 'Athletic',
    facialHair: null, distinguishingFeatures: 'Freckles', skinTone: 'Olive', heritage: 'Italian',
    offDutyStyle: 'Comfortable linen clothes in muted colors.',
  },
  style: {
    toneGuidelines: 'Parla con calma e precisione.', styleTags: ['minimal'], wardrobeRules: ['Prefer linen'],
  },
  voice: { provider: 'segnaposto', voiceId: 'voice_pending_assignment', label: null },
  consent: { scope: 'officina-video', grantedBy: 'owner-salina', grantedAt: '2026-11-25T10:00:00Z', revokedAt: null },
  version: 'b'.repeat(64),
  missing: ['voice'],
};
const communityId = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const group = { tenantId: 'salina', ownerId: 'owner-salina', characters: [minimal] };
const ok = (value: unknown) => VideoParallelCharacterSchema.safeParse(value).success;

// SUMMARY: Making voice required turns "accepts the minimal character" red.
// SUMMARY: Removing max(VIDEO_PARALLEL_MAX_PORTRAITS) turns "rejects nine portraits" red.
describe('Parallel character export', () => {
  it('accepts the minimal character', () => {
    expect(VideoParallelCharacterSchema.parse(minimal)).toEqual(minimal);
  });

  it('accepts the full character', () => {
    expect(VideoParallelCharacterSchema.parse(full)).toEqual(full);
    expect(ok({ ...full, voice: { provider: 'elevenlabs', voiceId: 'assigned' } })).toBe(true);
  });

  it('accepts explicit nulls only where declared', () => {
    expect(ok({ ...minimal, voice: null, consent: null, appearance: {}, personType: { role: null } })).toBe(true);
    expect(ok({ ...minimal, portraits: [{ ...portrait, view: null }] })).toBe(true);
    for (const field of ['version', 'missing', 'appearance', 'personType']) {
      expect(ok({ ...minimal, [field]: null }), field).toBe(false);
    }
  });

  it.each(['characterId', 'name', 'backstory', 'style', 'portraits'] as const)('requires %s', (field) => {
    const candidate: Record<string, unknown> = { ...minimal };
    delete candidate[field];
    expect(ok(candidate)).toBe(false);
  });

  it('requires tone guidelines and a role when personType is present', () => {
    expect(ok({ ...minimal, style: {} })).toBe(false);
    expect(ok({ ...minimal, personType: {} })).toBe(false);
  });

  it.each(['', 'a'.repeat(4001)])('rejects invalid backstory length %#', (backstory) => {
    expect(ok({ ...minimal, backstory })).toBe(false);
  });

  it('accepts maximum backstory and eight portraits', () => {
    expect(VIDEO_PARALLEL_MAX_BACKSTORY).toBe(4000);
    expect(VIDEO_PARALLEL_MAX_PORTRAITS).toBe(8);
    expect(ok({ ...minimal, backstory: 'a'.repeat(4000), portraits: Array(8).fill(portrait) })).toBe(true);
  });

  it('rejects no portraits', () => {
    expect(ok({ ...minimal, portraits: [] })).toBe(false);
  });

  it('rejects nine portraits', () => {
    expect(ok({ ...minimal, portraits: Array(9).fill(portrait) })).toBe(false);
  });

  it.each([
    { sha256: 'A'.repeat(64) }, { sha256: 'a'.repeat(63) }, { view: 'laterale' },
    { contentType: 'image/gif' }, { imageId: 'IMAGE' }, { imageId: 'a'.repeat(65) },
    { assetUrl: 'not-a-url' }, { assetUrl: `https://example.com/${'a'.repeat(2000)}` },
    { sizeBytes: 0 }, { sizeBytes: 1.5 }, { sizeBytes: VIDEO_MODEL_REF_MAX_BYTES + 1 },
  ])('rejects an invalid portrait %#', (extra) => {
    expect(ok({ ...minimal, portraits: [{ ...portrait, ...extra }] })).toBe(false);
  });

  it('reuses model views and accepts portrait byte boundaries and PNG', () => {
    expect(VideoParallelViewSchema).toBe(VideoModelRefKindSchema);
    for (const view of VideoModelRefKindSchema.options) {
      for (const sizeBytes of [1, VIDEO_MODEL_REF_MAX_BYTES]) {
        expect(ok({ ...minimal, portraits: [{ ...portrait, contentType: 'image/png', view, sizeBytes }] })).toBe(true);
      }
    }
  });

  it.each([
    { characterId: 'char/etl' }, { characterId: '' }, { characterId: 'a'.repeat(101) },
    { name: '' }, { name: 'a'.repeat(201) },
    { voice: { provider: 'openai', voiceId: 'voice-1' } },
    { voice: { provider: 'segnaposto', voiceId: '' } },
    { missing: ['unknown'] }, { missing: Array(8).fill('voice') },
    { version: 'B'.repeat(64) }, { version: 'a'.repeat(63) },
    { style: { toneGuidelines: '' } }, { style: { toneGuidelines: 'a'.repeat(801) } },
    { style: { ...minimal.style, styleTags: Array(21).fill('tag') } },
    { style: { ...minimal.style, styleTags: ['a'.repeat(41)] } },
    { style: { ...minimal.style, wardrobeRules: [''] } },
    { personType: { role: null, archetype: 'hero' } },
    { personType: { role: null, ladder: 'R6' } },
    { personType: { role: null, hobbies: Array(21).fill('Reading') } },
    { personType: { role: null, languages: ['a'.repeat(201)] } },
    { appearance: { hairColor: 'a'.repeat(201) } },
    { appearance: { skinTone: 'a'.repeat(41) } },
    { appearance: { heritage: 'a'.repeat(101) } },
    { appearance: { offDutyStyle: 'a'.repeat(601) } },
    { consent: { ...full.consent, scope: 'other' } },
    { consent: { ...full.consent, revokedAt: '' } },
  ])('rejects invalid character fields %#', (extra) => {
    expect(ok({ ...minimal, ...extra })).toBe(false);
  });

  it('rejects extra fields at every character object boundary', () => {
    expect(ok({ ...minimal, extra: true })).toBe(false);
    expect(ok({ ...minimal, portraits: [{ ...portrait, extra: true }] })).toBe(false);
    for (const field of ['style', 'personType', 'appearance', 'voice', 'consent'] as const) {
      expect(ok({ ...full, [field]: { ...full[field], extra: true } }), field).toBe(false);
    }
  });

  it('accepts query and export with explicit tenant and owner groups', () => {
    expect(VideoParallelExportQuerySchema.parse({ communityId })).toEqual({ communityId });
    const response = { communityId, groups: [group, { ...group, tenantId: 'salina-second' }] };
    expect(VideoParallelExportSchema.parse(response)).toEqual(response);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [] }).success).toBe(true);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [{ ...group, characters: [] }] }).success).toBe(true);
  });

  it.each(['A'.repeat(25), 'A'.repeat(27), 'a'.repeat(26)])('rejects invalid community ids %#', (invalidId) => {
    expect(VideoParallelExportQuerySchema.safeParse({ communityId: invalidId }).success).toBe(false);
    expect(VideoParallelExportSchema.safeParse({ communityId: invalidId, groups: [] }).success).toBe(false);
  });

  it('bounds exports to ten groups and fifty characters per group', () => {
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: Array(10).fill(group) }).success).toBe(true);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: Array(11).fill(group) }).success).toBe(false);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [{ ...group, characters: Array(50).fill(minimal) }] }).success).toBe(true);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [{ ...group, characters: Array(51).fill(minimal) }] }).success).toBe(false);
  });

  it.each([
    { tenantId: '' }, { ownerId: '' }, { tenantId: undefined }, { ownerId: undefined },
    { tenantId: 'a'.repeat(257) }, { ownerId: 'a'.repeat(257) }, { extra: true },
  ])('rejects invalid export groups %#', (extra) => {
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [{ ...group, ...extra }] }).success).toBe(false);
  });

  it('rejects extra query and response fields', () => {
    expect(VideoParallelExportQuerySchema.safeParse({ communityId, extra: true }).success).toBe(false);
    expect(VideoParallelExportSchema.safeParse({ communityId, groups: [], extra: true }).success).toBe(false);
  });

  it('accepts only declared export errors', () => {
    for (const error of ['comunita_non_trovata', 'comunita_non_pronta', 'non_autorizzato']) {
      expect(VideoParallelExportErrorSchema.parse({ error })).toEqual({ error });
    }
    expect(VideoParallelExportErrorSchema.safeParse({ error: 'unknown' }).success).toBe(false);
    expect(VideoParallelExportErrorSchema.safeParse({ error: 'non_autorizzato', extra: true }).success).toBe(false);
  });

  it('keeps the source portable without cross-field refinements', () => {
    const source = readFileSync(new URL('../../../src/capability/video/personaggio-parallel.ts', import.meta.url), 'utf8');
    expect(source).not.toContain('.refine(');
    expect(source).not.toContain('superRefine');
  });
});
