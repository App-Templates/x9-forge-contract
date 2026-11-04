import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  VIDEO_GRAPHIC_HTML_MAX_CHARS,
  VIDEO_REGIA_FILE,
  VIDEO_REGIA_GRAPHIC_FILE,
  VideoBriefRequestSchema,
  VideoBriefToolInputSchema,
  VideoEngineStoryRequestSchema,
  VideoProjectStepSchema,
  VideoRegiaDocumentSchema,
  VideoRegiaOpenResponseSchema,
  VideoRegiaRequestSchema,
  VideoRegiaResultSchema,
} from '../../../src/capability/video/index.js';
import {
  internalDevRegiaOpenContract,
  internalDevRegiaResultContract,
  internalDevRegiaResultPath,
  officinaVideoStoryContract,
} from '../../../src/http/endpoints/index.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';

const identity = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'x9' };
const toolInput = { approverEmail: 'stefano@example.com', presetId: 'singola', mode: 'approval', budgetUsd: 10, brief: 'Video sulle piante' };
const scenes = [{ text: 'Le piante parlano.', tags: ['calm'] }, { text: 'Ascoltale.' }];
const outro = { title: 'In pratica', line: 'Ogni pianta ha un ritmo.' };
const story = { scenes, graphicHtml: '<script>function render(t){}</script>', footage: ['piante-02'], outro, revision: 3 };
const sha = 'a'.repeat(64);

describe('video brief: footage chosen by the person (additive)', () => {
  it('accepts one or two archive ids, and the brief of v1.88.0 without footage', () => {
    expect(VideoBriefToolInputSchema.parse({ ...toolInput, footage: ['piante-02'] }).footage).toEqual(['piante-02']);
    expect(VideoBriefToolInputSchema.parse({ ...toolInput, footage: ['piscina-03', 'piscina-04'] }).footage).toHaveLength(2);
    expect(VideoBriefToolInputSchema.parse(toolInput).footage).toBeUndefined();
    expect(VideoBriefRequestSchema.parse({ ...toolInput, identity, requestedBy: 'x9' }).footage).toBeUndefined();
  });
  it('refuses three shots, an empty choice and anything that is not a plain id', () => {
    for (const footage of [[], ['a', 'b', 'c'], ['../etc'], ['Piante'], ['piante/02'], [''], ['x'.repeat(65)]]) {
      expect(VideoBriefToolInputSchema.safeParse({ ...toolInput, footage }).success, JSON.stringify(footage)).toBe(false);
    }
  });
  it('still lets no identity in through the tool input', () => {
    expect(VideoBriefToolInputSchema.safeParse({ ...toolInput, identity }).success).toBe(false);
  });
});

describe('video project steps', () => {
  it('adds regia and story without dropping a step of v1.88.0', () => {
    for (const step of ['queued', 'plan', 'frames', 'review_sent', 'clips', 'assemble', 'delivery_sent', 'done', 'failed', 'regia', 'story']) {
      expect(VideoProjectStepSchema.parse(step)).toBe(step);
    }
    expect(VideoProjectStepSchema.safeParse('regista').success).toBe(false);
  });
});

describe('engine story operation', () => {
  it('is POST /api/projects/:engineProjectId/story answering 202', () => {
    expect(officinaVideoStoryContract.method).toBe('POST');
    expect(officinaVideoStoryContract.path).toBe('/api/projects/:engineProjectId/story');
    expect(officinaVideoStoryContract.responseStatus).toBe(202);
    expect(officinaVideoStoryContract.paramsSchema.safeParse({ engineProjectId: 'f'.repeat(32) }).success).toBe(true);
    expect(officinaVideoStoryContract.paramsSchema.safeParse({ engineProjectId: '../x' }).success).toBe(false);
  });
  it('defaults the resolution to 1080p and accepts 480p and 720p', () => {
    expect(VideoEngineStoryRequestSchema.parse(story).resolution).toBe('1080p');
    expect(VideoEngineStoryRequestSchema.parse({ ...story, resolution: '480p' }).resolution).toBe('480p');
    expect(VideoEngineStoryRequestSchema.parse({ ...story, resolution: '720p' }).resolution).toBe('720p');
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, resolution: '4k' }).success).toBe(false);
  });
  it('has no footage for the pure infographic, and refuses unknown fields', () => {
    const { footage: _footage, ...pure } = story;
    expect(VideoEngineStoryRequestSchema.parse(pure).footage).toBeUndefined();
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, voiceId: 'x' }).success).toBe(false);
  });
  it('bounds the graphic at about 200 KB, the scenes at 12 and wants a revision from 1', () => {
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, graphicHtml: 'x'.repeat(VIDEO_GRAPHIC_HTML_MAX_CHARS) }).success).toBe(true);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, graphicHtml: 'x'.repeat(VIDEO_GRAPHIC_HTML_MAX_CHARS + 1) }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, graphicHtml: '' }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, scenes: Array.from({ length: 13 }, () => scenes[1]) }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, scenes: [] }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, revision: 0 }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, outro: { title: 'In pratica' } }).success).toBe(false);
    expect(VideoEngineStoryRequestSchema.safeParse({ ...story, scenes: [{ text: 'x', tags: ['[calm]'] }] }).success).toBe(false);
  });
});

describe('regia: cap-video -> cap-dev', () => {
  const request = {
    identity, videoProjectId: '7d3c3a52-0f7a-4d0b-9c1b-2f5d5d6f7a10', brief: 'Video sulle piante', presetId: 'singola',
    footageCandidates: ['piante-02', 'ufficio-01'],
    materials: [{ url: 'https://github.com/App-Templates/officina-video/blob/codex/officina-video-v1/presets/singola.json', note: 'preset' }],
  };
  it('names the two delivered files', () => {
    expect([VIDEO_REGIA_FILE, VIDEO_REGIA_GRAPHIC_FILE]).toEqual(['regia.json', 'grafica.html']);
  });
  it('opens on POST /internal/dev/regia with the requester identity and GitHub materials only', () => {
    expect(internalDevRegiaOpenContract).toMatchObject({ method: 'POST', path: '/internal/dev/regia', authType: 'secret' });
    expect(internalDevRegiaOpenContract.requestSchema.parse(request).identity).toEqual(identity);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, footage: ['piante-02'], recipe: 'ricetta' }).success).toBe(true);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, identity: undefined }).success).toBe(false);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, identity: { ...identity, userId: 'u' } }).success).toBe(false);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, materials: [] }).success).toBe(false);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, materials: [{ url: 'http://github.com/App-Templates/x' }] }).success).toBe(false);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, materials: [{ url: 'https://evil.example/App-Templates/x' }] }).success).toBe(false);
    expect(VideoRegiaRequestSchema.safeParse({ ...request, organizationId: 'org' }).success).toBe(false);
  });
  it('answers with the incarico number and the delivery branch', () => {
    expect(VideoRegiaOpenResponseSchema.parse({ regiaId: 12, repeated: false, repo: 'App-Templates/sessioni', branch: 'consegna/12' }).regiaId).toBe(12);
    expect(VideoRegiaOpenResponseSchema.safeParse({ regiaId: 0, repeated: false, repo: 'App-Templates/sessioni', branch: 'consegna/0' }).success).toBe(false);
  });
  it('reads the result on POST /internal/dev/regia/:regiaId/result', () => {
    expect(internalDevRegiaResultContract.method).toBe('POST');
    expect(internalDevRegiaResultPath(12)).toBe('/internal/dev/regia/12/result');
    expect(() => internalDevRegiaResultPath(0)).toThrow();
    expect(internalDevRegiaResultContract.paramsSchema.parse({ regiaId: '12' }).regiaId).toBe(12);
    expect(internalDevRegiaResultContract.paramsSchema.safeParse({ regiaId: '1e3' }).success).toBe(true);
    expect(internalDevRegiaResultContract.paramsSchema.safeParse({ regiaId: '-1' }).success).toBe(false);
    expect(internalDevRegiaResultContract.paramsSchema.safeParse({ regiaId: 'abc' }).success).toBe(false);
    expect(internalDevRegiaResultContract.requestSchema.safeParse({ identity }).success).toBe(true);
    expect(internalDevRegiaResultContract.requestSchema.safeParse({}).success).toBe(false);
  });
  it('a delivered result carries regia.json parsed and grafica.html as text with hash and size', () => {
    const delivered = {
      status: 'delivered', regiaId: 12, repo: 'App-Templates/sessioni', branch: 'consegna/12', commit: 'b'.repeat(40),
      link: 'https://github.com/App-Templates/sessioni/tree/' + 'b'.repeat(40),
      regia: { version: 1, scenes, footage: ['piante-02'], outro },
      regiaFile: { path: 'regia.json', sha256: sha, sizeBytes: 120 },
      graphicHtml: '<html></html>', graphicFile: { path: 'grafica.html', sha256: sha, sizeBytes: 13 },
    };
    expect(VideoRegiaResultSchema.parse(delivered).status).toBe('delivered');
    expect(VideoRegiaResultSchema.safeParse({ ...delivered, commit: 'main' }).success).toBe(false);
    expect(VideoRegiaResultSchema.safeParse({ ...delivered, regia: { ...delivered.regia, version: 2 } }).success).toBe(false);
    expect(VideoRegiaResultSchema.parse({ status: 'pending', regiaId: 12, boardState: 'in-lavorazione' }).status).toBe('pending');
    expect(VideoRegiaResultSchema.parse({ status: 'failed', regiaId: 12, reason: 'grafica.html mancante' }).status).toBe('failed');
    expect(VideoRegiaResultSchema.safeParse({ status: 'done', regiaId: 12 }).success).toBe(false);
  });
  it('regia.json is strict: no unknown field, no footage path, the closing is mandatory', () => {
    expect(VideoRegiaDocumentSchema.safeParse({ version: 1, scenes, outro }).success).toBe(true);
    expect(VideoRegiaDocumentSchema.safeParse({ version: 1, scenes, outro, voiceId: 'x' }).success).toBe(false);
    expect(VideoRegiaDocumentSchema.safeParse({ version: 1, scenes, outro, footage: ['/data/archivio/piante-02.mov'] }).success).toBe(false);
    expect(VideoRegiaDocumentSchema.safeParse({ version: 1, scenes }).success).toBe(false);
  });
});

describe('portable story contract for the Python engine', () => {
  it('exports videoEngineStoryRequest with its transport and validates it in generated Python', () => {
    const catalog = getPortableCapabilityContracts();
    expect(catalog.contracts.videoEngineStoryRequest).toMatchObject({ supported: true, customRefinements: 0, rules: [], gates: [] });
    expect(catalog.transports.videoEngineStory).toMatchObject({
      method: 'POST', path: '/api/projects/:engineProjectId/story', requestContract: 'videoEngineStoryRequest',
    });
    const directory = mkdtempSync(join(tmpdir(), 'bridge-video-story-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog));
    execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
    const result = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_video', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
value = json.load(sys.stdin)
module.validate_contract('videoEngineStoryRequest', value)
for bad in (dict(value, unexpected=True), dict(value, resolution='4k')):
    try:
        module.validate_contract('videoEngineStoryRequest', bad)
    except ValueError:
        pass
    else:
        raise AssertionError('accepted ' + json.dumps(bad)[:80])
print('story validated')
`, join(directory, 'x9_forge_contracts_capabilities.py')], { input: JSON.stringify(story), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    expect(result.trim()).toBe('story validated');
  });
});
