import { describe, expect, it } from 'vitest';
import {
  VideoParallelExportSchema,
  type VideoParallelCharacter,
  type VideoParallelExport,
} from '../../../src/capability/video/index.js';

// Synthetic names and content; only the D1-D7 production shapes are reproduced.
function character(prefix: string, index: number, storyLength: number): VideoParallelCharacter {
  const imageId = `img_${prefix}_${index}`;
  const sentence = 'A fictional resident repairs equipment and helps neighbors with practical tasks. ';
  return {
    characterId: `char_${prefix}_${index}`,
    name: `etl ${prefix} ${index + 1}`,
    backstory: sentence.repeat(Math.ceil(storyLength / sentence.length)).slice(0, storyLength),
    personType: { role: 'Community technician' },
    style: { toneGuidelines: 'Speak calmly and use concrete examples.' },
    appearance: {
      hairColor: 'Brown', hairStyle: 'Short', eyeColor: 'Brown', build: 'Medium',
      facialHair: null, distinguishingFeatures: null,
    },
    // Represents a 1024 x 1024 JPEG. Dimensions are not fields in the export contract.
    portraits: [{
      imageId,
      assetUrl: `http://parallel-asset-svc:4001/asset/${imageId}?tenantId=tenant-${prefix}&canonId=canon-${prefix}`,
      contentType: 'image/jpeg',
      sizeBytes: 120000 + index,
    }],
    missing: ['portraitViews', 'portraitDigest', 'voice', 'styleLabels', 'wardrobeRules', 'consent', 'version'],
  };
}

function productionFixtures(): { name: string; document: VideoParallelExport }[] {
  const salinaLengths = [851, 877, 903, 929, 955, 981, 1007, 1032];
  const salina = salinaLengths.map((length, index) => character('salina', index, length));
  const liviaBase = character('second', 0, 990);
  const livia: VideoParallelCharacter = {
    ...liviaBase,
    name: 'Livia',
    personType: { role: 'Engineer', archetype: 'engineer', ladder: 'R1' },
    appearance: { ...liviaBase.appearance, offDutyStyle: 'Linen shirts and comfortable trousers.' },
    voice: { provider: 'segnaposto', voiceId: 'voice_mvp1_08' },
  };
  const community = (prefix: string) => Array.from({ length: 8 }, (_, index) => ({
    ...character(prefix, index, 901 + index * 33),
    personType: { role: 'Engineer', archetype: 'engineer', ladder: 'R1' } as const,
  }));
  return [
    {
      name: 'Salina mista',
      document: {
        communityId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        groups: [
          { tenantId: 'tenant-salina', ownerId: 'owner-salina', characters: salina },
          { tenantId: 'tenant-second', ownerId: 'owner-second', characters: [livia] },
        ],
      },
    },
    {
      name: 'community 8 of 8',
      document: {
        communityId: '01ARZ3NDEKTSV4RRFFQ69G5FAW',
        groups: [{ tenantId: 'tenant-complete', ownerId: 'owner-complete', characters: community('complete') }],
      },
    },
    {
      name: 'draft community',
      document: {
        communityId: '01ARZ3NDEKTSV4RRFFQ69G5FAX',
        groups: [{ tenantId: 'tenant-draft', ownerId: 'owner-draft', characters: community('draft') }],
      },
    },
  ];
}

const fixtures = productionFixtures();
const salina = fixtures[0]!.document;
const first = salina.groups[0]!.characters[0]!;
const allCharacters = fixtures.flatMap(({ document }) => document.groups.flatMap((group) => group.characters));

function withFirstCharacter(patch: Record<string, unknown>) {
  return {
    ...salina,
    groups: salina.groups.map((group, groupIndex) => ({
      ...group,
      characters: group.characters.map((entry, index) => groupIndex === 0 && index === 0 ? { ...entry, ...patch } : entry),
    })),
  };
}

// SUMMARY: On a copy, making archetype required in the 9205 contract turns
// "accepts Salina mista" red: eight of its nine characters have no archetype.
// SUMMARY: Removing the backstory limit, imageId requirement, or portrait strictness
// turns the corresponding rejection below red. Mutations are run by the gate.
describe('Parallel production-shaped exports (D1-D7)', () => {
  it.each(fixtures)('accepts $name', ({ document }) => {
    const result = VideoParallelExportSchema.safeParse(document);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data).toEqual(document);
  });

  it('preserves 25 of 25 characters across communities of 9, 8 and 8', () => {
    expect(fixtures.map(({ document }) => document.groups.reduce((sum, group) => sum + group.characters.length, 0)))
      .toEqual([9, 8, 8]);
    expect(allCharacters).toHaveLength(25);
    expect(new Set(allCharacters.map((entry) => entry.characterId)).size).toBe(25);
    expect(salina.groups.map((group) => group.characters.length)).toEqual([8, 1]);
    expect(new Set(salina.groups.map((group) => group.tenantId)).size).toBe(2);
  });

  it('preserves the eight sparse Salina characters and the Livia placeholder', () => {
    const sparse = salina.groups[0]!.characters;
    expect(sparse.map((entry) => entry.backstory.length)).toEqual([851, 877, 903, 929, 955, 981, 1007, 1032]);
    for (const entry of sparse) {
      expect(entry.name).toMatch(/^etl /);
      expect(entry.personType?.role).toBeTruthy();
      expect(entry.style.toneGuidelines).toBeTruthy();
      expect(entry.appearance?.hairColor).toBeTruthy();
      expect(entry.personType).not.toHaveProperty('archetype');
      expect(entry.personType).not.toHaveProperty('ladder');
      for (const field of ['skinTone', 'heritage', 'offDutyStyle']) {
        expect(entry.appearance).not.toHaveProperty(field);
      }
      expect(entry).not.toHaveProperty('voice');
    }
    const livia = salina.groups[1]!.characters[0]!;
    expect(livia.name).toBe('Livia');
    expect(livia.personType).toMatchObject({ archetype: 'engineer', ladder: 'R1' });
    expect(livia.appearance?.offDutyStyle).toBeTruthy();
    expect(livia.voice).toEqual({ provider: 'segnaposto', voiceId: 'voice_mvp1_08' });
  });

  it('preserves archetypes and ladders for 8 of 8 characters in both other communities', () => {
    for (const { document } of fixtures.slice(1)) {
      const characters = document.groups.flatMap((group) => group.characters);
      expect(characters.filter((entry) => entry.personType?.archetype && entry.personType.ladder)).toHaveLength(8);
      expect(Math.max(...characters.map((entry) => entry.backstory.length))).toBe(1132);
      for (const entry of characters) {
        expect(entry.appearance).not.toHaveProperty('offDutyStyle');
        expect(entry).not.toHaveProperty('voice');
      }
    }
  });

  it('keeps 25 of 25 portraits without views, digests or loopback asset URLs', () => {
    expect(allCharacters.flatMap((entry) => entry.portraits)).toHaveLength(25);
    for (const entry of allCharacters) {
      expect(entry.portraits).toHaveLength(1);
      const portrait = entry.portraits[0]!;
      expect(portrait.contentType).toBe('image/jpeg');
      expect(portrait.assetUrl).not.toContain('127.0.0.1');
      expect(portrait).not.toHaveProperty('view');
      expect(portrait).not.toHaveProperty('sha256');
      expect(entry.missing).toEqual(expect.arrayContaining(['portraitViews', 'portraitDigest']));
    }
  });

  it('declares missing voice for 25 of 25 characters with zero real voices', () => {
    expect(allCharacters.filter((entry) => entry.voice?.provider === 'elevenlabs')).toHaveLength(0);
    expect(allCharacters.filter((entry) => entry.voice?.provider === 'segnaposto')).toHaveLength(1);
    expect(allCharacters.filter((entry) => !entry.voice)).toHaveLength(24);
    for (const entry of allCharacters) expect(entry.missing).toContain('voice');
  });

  it('accepts a future ElevenLabs voice', () => {
    const document = withFirstCharacter({
      voice: { provider: 'elevenlabs', voiceId: 'fictional-future-voice', label: 'Synthetic example' },
      missing: first.missing!.filter((field) => field !== 'voice'),
    });
    expect(VideoParallelExportSchema.safeParse(document).success).toBe(true);
  });

  it('rejects a backstory of 4001 characters', () => {
    expect(VideoParallelExportSchema.safeParse(withFirstCharacter({ backstory: 'a'.repeat(4001) })).success).toBe(false);
  });

  it('rejects a portrait without imageId', () => {
    const { imageId: _imageId, ...portrait } = first.portraits[0]!;
    expect(VideoParallelExportSchema.safeParse(withFirstCharacter({ portraits: [portrait] })).success).toBe(false);
  });

  it('rejects legacy promptHash instead of sha256 as an extra portrait field', () => {
    const portrait = first.portraits[0]!;
    expect(VideoParallelExportSchema.safeParse(withFirstCharacter({
      portraits: [{ ...portrait, sha256: 'a'.repeat(64) }],
    })).success).toBe(true);
    expect(VideoParallelExportSchema.safeParse(withFirstCharacter({
      portraits: [{ ...portrait, promptHash: 'a'.repeat(64) }],
    })).success).toBe(false);
  });
});
