import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { officinaVideoApproveContract, officinaVideoHealthContract, officinaVideoJobContract, officinaVideoPlanContract, officinaVideoProjectGetContract, officinaVideoRunContract } from '../../../src/http/endpoints/officina-video.js';
import { VideoEngineJobResponseSchema, VideoEngineJobSchema, VideoEngineMediaPathSchema } from '../../../src/capability/video/engine.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';

describe('officina video transports', () => {
  it('3206 endpoint contracts reuse the engine job schemas', () => {
    expect(officinaVideoJobContract).toMatchObject({ method: 'POST', path: '/api/jobs', requestSchema: VideoEngineJobSchema, responseSchema: VideoEngineJobResponseSchema });
    expect(officinaVideoHealthContract).toMatchObject({ method: 'GET', path: '/api/health' });
    expect(officinaVideoJobContract.paramsSchema.safeParse({ extra: 1 }).success).toBe(false);
    expect(officinaVideoHealthContract.paramsSchema.safeParse({}).success).toBe(true);
  });

  it('3206 catalog publishes method, path and secret header for both calls', () => {
    const { transports } = getPortableCapabilityContracts();
    expect(transports.videoEngineJob).toMatchObject({ method: 'POST', path: '/api/jobs', authHeader: INTERNAL_SECRET_HEADER });
    expect(transports.videoEngineHealth).toMatchObject({ method: 'GET', path: '/api/health', authHeader: INTERNAL_SECRET_HEADER });
    expect(transports.videoEngineJob).not.toHaveProperty('queryContract');
    expect(transports.videoEngineHealth).not.toHaveProperty('queryContract');
  });

  it('3206 generated Python resolves the transports', () => {
    const directory = mkdtempSync(join(tmpdir(), 'bridge-video-transport-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
    execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'),
      '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
    const result = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_video', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
print(json.dumps([module.portable_transport('videoEngineJob', {}), module.portable_transport('videoEngineHealth', {})]))
`, join(directory, 'x9_forge_contracts_capabilities.py')], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    expect(JSON.parse(result)).toEqual([
      { method: 'POST', path: '/api/jobs', authHeader: INTERNAL_SECRET_HEADER },
      { method: 'GET', path: '/api/health', authHeader: INTERNAL_SECRET_HEADER },
    ]);
  });

  it('3304 catalog carries the whole engine call set with request, response and error contracts', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    const expected = {
      videoEngineProjectGet: [officinaVideoProjectGetContract, undefined, 'videoEngineProject'],
      videoEnginePlan: [officinaVideoPlanContract, 'videoEnginePlanRequest', 'videoEngineProject'],
      videoEngineApprove: [officinaVideoApproveContract, 'videoEngineApproveRequest', 'videoEngineProject'],
      videoEngineRun: [officinaVideoRunContract, 'videoEngineRunRequest', 'videoEngineProject'],
    } as const;
    for (const [name, [contract, request, response]] of Object.entries(expected)) {
      expect(transports[name]).toMatchObject({ method: contract.method, path: contract.path, authHeader: INTERNAL_SECRET_HEADER, responseContract: response, errorContract: 'videoEngineError' });
      expect(transports[name]!.requestContract).toBe(request);
    }
    expect(transports.videoEngineHealth).toMatchObject({ responseContract: 'videoEngineHealth' });
    for (const name of Object.keys(transports).filter(key => key.startsWith('videoEngine'))) {
      expect(transports[name]!.errorContract, name).toBe('videoEngineError');
      for (const key of ['requestContract', 'responseContract', 'errorContract'] as const) {
        const target = transports[name]![key];
        if (target) expect(contracts[target]?.supported, `${name}.${key}`).toBe(true);
      }
    }
    expect(transports.authority).not.toHaveProperty('errorContract');
  });

  it('3304 media transport describes the same path as VideoEngineMediaPathSchema', () => {
    const { transports } = getPortableCapabilityContracts();
    const media = transports.videoEngineMedia!;
    expect(media).toMatchObject({ method: 'GET', path: '/media/:engineProjectId/:file', authHeader: INTERNAL_SECRET_HEADER, errorContract: 'videoEngineError' });
    const params = media.paramsSchema as { properties: Record<string, { pattern: string }>; additionalProperties: boolean };
    expect(params.additionalProperties).toBe(false);
    const id = new RegExp(params.properties.engineProjectId!.pattern);
    const file = new RegExp(params.properties.file!.pattern);
    const id32 = 'a'.repeat(32);
    const samples = [
      [id32, 'clip_1.mp4'], [id32, 'a-b.zip'], [id32, 'frame.PNG'], [id32, 'a.exe'], [id32, '../x.mp4'],
      ['a'.repeat(31), 'x.png'], ['A'.repeat(32), 'x.png'], [id32, 'a/b.png'], [id32, '.mp4'],
    ] as const;
    for (const [project, name] of samples) {
      const fromPath = VideoEngineMediaPathSchema.safeParse(media.path.replace(':engineProjectId', project).replace(':file', name)).success;
      expect(id.test(project) && file.test(name), `${project}/${name}`).toBe(fromPath);
    }
  });
});
