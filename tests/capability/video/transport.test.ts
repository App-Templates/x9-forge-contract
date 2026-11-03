import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { officinaVideoHealthContract, officinaVideoJobContract } from '../../../src/http/endpoints/officina-video.js';
import { VideoEngineJobResponseSchema, VideoEngineJobSchema } from '../../../src/capability/video/engine.js';
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
});
