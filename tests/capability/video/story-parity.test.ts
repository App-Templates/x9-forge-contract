import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { VIDEO_GRAPHIC_HTML_MAX_CHARS, VideoEngineStoryRequestSchema } from '../../../src/capability/video/index.js';
import { getPortableCapabilityContracts, portableJsonSchema } from '../../../src/capability/portable-contracts.js';

/**
 * The story the engine receives is decided by `VideoEngineStoryRequestSchema` alone (Stefano 03/11: «descritta nel ponte
 * e pubblicata anche come schema JSON per Python»). The generated Python runtime must give the same verdict and the
 * same parsed value as zod on every form: a divergence is a story refused in production (tags 03/11, footage 04/11).
 */
const scene = { text: 'Le piante parlano.' };
const outro = { title: 'In pratica', line: 'Ogni pianta ha un ritmo.' };
const base = { scenes: [scene], graphicHtml: '<script>function render(t){}</script>', outro, revision: 3 };
const ws = '\t\n\u000b\f\r         　﻿';

const cases: Record<string, unknown> = {
  minimal: base,
  'voice marco': { ...base, voice: 'marco' },
  'voice stefano-pro': { ...base, voice: 'stefano-pro' },
  'tags without brackets': { ...base, scenes: [{ text: 'Uno.', tags: ['calm', 'conversational'] }, { text: 'Due.', tags: [] }] },
  'four tags': { ...base, scenes: [{ text: 'Uno.', tags: ['a', 'b-c', 'calm', 'warm'] }] },
  'footage of one shot': { ...base, footage: ['piante-02'] },
  'footage of two shots': { ...base, footage: ['piscina-03', 'piscina-04'] },
  'pure infographic, no footage': base,
  'every resolution 480p': { ...base, resolution: '480p' },
  'every resolution 720p': { ...base, resolution: '720p' },
  'every resolution 1080p': { ...base, resolution: '1080p' },
  'twelve scenes': { ...base, scenes: Array.from({ length: 12 }, () => scene) },
  'text trimmed by the contract': { ...base, scenes: [{ text: '  Ciao.\n' }], outro: { title: ' In pratica ', line: '　Riga.﻿' } },
  'text at the bound after trim': { ...base, scenes: [{ text: `${ws}${'x'.repeat(1200)}${ws}` }] },
  'non-JS whitespace is text': { ...base, scenes: [{ text: '\u001c' }] },
  'astral characters count as two': { ...base, scenes: [{ text: '😀'.repeat(600) }] },
  'graphic at the bound': { ...base, graphicHtml: 'x'.repeat(VIDEO_GRAPHIC_HTML_MAX_CHARS) },
  'large revision': { ...base, revision: Number.MAX_SAFE_INTEGER },
  // Refused by the contract: the engine must refuse them too.
  'voice uppercase': { ...base, voice: 'Marco' },
  'voice empty': { ...base, voice: '' },
  'voice too long': { ...base, voice: 'a'.repeat(65) },
  'tag with brackets': { ...base, scenes: [{ text: 'Uno.', tags: ['[calm]'] }] },
  'tag with final newline': { ...base, scenes: [{ text: 'Uno.', tags: ['calm\n'] }] },
  'tag uppercase': { ...base, scenes: [{ text: 'Uno.', tags: ['Calm'] }] },
  'five tags': { ...base, scenes: [{ text: 'Uno.', tags: ['a', 'b', 'c', 'd', 'e'] }] },
  'footage as a string': { ...base, footage: 'piante-02' },
  'footage empty': { ...base, footage: [] },
  'footage of three shots': { ...base, footage: ['a', 'b', 'c'] },
  'footage with final newline': { ...base, footage: ['piante-02\n'] },
  'footage path': { ...base, footage: ['../etc'] },
  'footage null': { ...base, footage: null },
  'no outro': { scenes: [scene], graphicHtml: base.graphicHtml, revision: 3 },
  'outro without line': { ...base, outro: { title: 'In pratica' } },
  'outro blank line': { ...base, outro: { title: 'In pratica', line: `${ws}` } },
  'outro title too long': { ...base, outro: { title: 'x'.repeat(81), line: 'r' } },
  'text only whitespace': { ...base, scenes: [{ text: ws }] },
  'text too long after trim': { ...base, scenes: [{ text: ` ${'x'.repeat(1201)} ` }] },
  'scene extra field': { ...base, scenes: [{ text: 'Uno.', voiceId: 'x' }] },
  'no scenes': { ...base, scenes: [] },
  'thirteen scenes': { ...base, scenes: Array.from({ length: 13 }, () => scene) },
  'graphic empty': { ...base, graphicHtml: '' },
  'graphic too long': { ...base, graphicHtml: 'x'.repeat(VIDEO_GRAPHIC_HTML_MAX_CHARS + 1) },
  'resolution 4k': { ...base, resolution: '4k' },
  'revision zero': { ...base, revision: 0 },
  'revision fractional': { ...base, revision: 1.5 },
  'revision as text': { ...base, revision: '3' },
  'revision boolean': { ...base, revision: true },
  'unknown field': { ...base, voiceId: 'x' },
};

// Nested JSON Schema read by key in the assertions below.
type Json = { [key: string]: Json } & Record<string, unknown>;

function generatedRuntime(): string {
  const directory = mkdtempSync(join(tmpdir(), 'bridge-story-parity-'));
  const catalogPath = join(directory, 'catalog.json');
  writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
  execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
  return join(directory, 'x9_forge_contracts_capabilities.py');
}

function pythonVerdicts(module: string, values: Record<string, unknown>): Record<string, { ok: boolean; value?: unknown }> {
  const out = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_story', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
result = {}
for name, value in json.load(sys.stdin).items():
    try:
        result[name] = dict(ok=True, value=module.validate_contract('videoEngineStoryRequest', value))
    except ValueError:
        result[name] = dict(ok=False)
print(json.dumps(result))
`, module], { input: JSON.stringify(values), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out) as Record<string, { ok: boolean; value?: unknown }>;
}

describe('story contract: zod and the generated Python give the same verdict', () => {
  const module = generatedRuntime();
  const python = pythonVerdicts(module, cases);
  for (const [name, value] of Object.entries(cases)) {
    it(name, () => {
      const zod = VideoEngineStoryRequestSchema.safeParse(value);
      expect(python[name]!.ok, `${name}: zod ${zod.success}`).toBe(zod.success);
      if (zod.success) expect(python[name]!.value).toEqual(zod.data);
    });
  }

  it('the corpus covers both verdicts', () => {
    const verdicts = Object.values(cases).map(value => VideoEngineStoryRequestSchema.safeParse(value).success);
    expect(verdicts.filter(Boolean).length).toBeGreaterThanOrEqual(15);
    expect(verdicts.filter(ok => !ok).length).toBeGreaterThanOrEqual(25);
  });
});

describe('story contract: published schema', () => {
  it('carries trim as x-trim on the three trimmed texts and nowhere else', () => {
    const schema = getPortableCapabilityContracts().contracts.videoEngineStoryRequest!.schema as unknown as Json;
    expect(schema.properties.scenes.items.properties.text['x-trim']).toBe(true);
    expect(schema.properties.outro.properties.title['x-trim']).toBe(true);
    expect(schema.properties.outro.properties.line['x-trim']).toBe(true);
    expect(schema.properties.graphicHtml['x-trim']).toBeUndefined();
    expect(schema.properties.scenes.items.properties.tags.items['x-trim']).toBeUndefined();
  });

  it('the catalog shipped in dist/python is the one zod produces today', () => {
    const shipped = JSON.parse(readFileSync(resolve('dist/python/capabilities.contracts.json'), 'utf8'));
    expect(shipped.contracts.videoEngineStoryRequest).toEqual(getPortableCapabilityContracts().contracts.videoEngineStoryRequest);
    expect(shipped.transports.videoEngineStory).toEqual(getPortableCapabilityContracts().transports.videoEngineStory);
  });

  it('a trim after another check, or any other overwrite, is not portable', () => {
    const late = z.strictObject({ text: z.string().min(1).trim() });
    const lower = z.strictObject({ text: z.string().toLowerCase() });
    for (const schema of [late, lower]) {
      expect(portableJsonSchema(schema).properties).toBeDefined();
    }
    expect((portableJsonSchema(late) as unknown as Json).properties.text['x-trim']).toBeUndefined();
    expect((portableJsonSchema(lower) as unknown as Json).properties.text['x-trim']).toBeUndefined();
  });
});
