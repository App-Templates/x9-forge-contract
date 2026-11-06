import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';
import { VideoFootageListQuerySchema, VideoFootageListSchema } from '../../../src/capability/video/index.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { officinaVideoFootageListContract } from '../../../src/http/endpoints/officina-video.js';

const identity = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const query = { ...identity, person: 'stefano' };
const hash = (c: string) => c.repeat(64);
const shots = [
  { id: 'ufficio-01', place: 'ufficio', outfit: 'felpa nera', framing: 'medio', durationSeconds: 41.2, scenes: 6, sha256: hash('a'), fileName: 'ufficio.mp4' },
  { id: 'piante-02', place: 'piante', outfit: 'felpa nera', framing: 'medio', durationSeconds: 30.5, scenes: 4, sha256: hash('b'), fileName: 'piante.mp4' },
  { id: 'piscina-03', place: 'piscina', outfit: 'maglietta grigia', framing: 'largo', group: 'piscina-03', durationSeconds: 22, scenes: 3, sha256: hash('c'), fileName: 'piscina-largo.mp4' },
  { id: 'piscina-04', place: 'piscina', outfit: 'maglietta grigia', framing: 'stretto', group: 'piscina-03', durationSeconds: 18.75, scenes: 2, sha256: hash('d'), fileName: 'piscina-stretto.mp4' },
];
const list = { person: 'stefano', shots };

describe('footage list: query', () => {
  it('accepts the identity and a person', () => {
    expect(VideoFootageListQuerySchema.safeParse(query).success).toBe(true);
  });
  it('refuses a bad person, an extra field and a missing tenant', () => {
    const { tenantId: _t, ...noTenant } = query;
    expect(VideoFootageListQuerySchema.safeParse({ ...query, person: '../x' }).success).toBe(false);
    expect(VideoFootageListQuerySchema.safeParse({ ...query, person: 'Stefano' }).success).toBe(false);
    expect(VideoFootageListQuerySchema.safeParse({ ...query, extra: 1 }).success).toBe(false);
    expect(VideoFootageListQuerySchema.safeParse(noTenant).success).toBe(false);
  });
});

describe('footage list: response', () => {
  it('accepts the four shots of today and an empty archive', () => {
    expect(VideoFootageListSchema.safeParse(list).success).toBe(true);
    expect(VideoFootageListSchema.safeParse({ person: 'stefano', shots: [] }).success).toBe(true);
  });
  it('refuses bad shots', () => {
    const one = (patch: Record<string, unknown>) => ({ person: 'stefano', shots: [{ ...shots[0], ...patch }] });
    expect(VideoFootageListSchema.safeParse(one({ framing: 'wide' })).success).toBe(false);
    expect(VideoFootageListSchema.safeParse(one({ sha256: hash('A') })).success).toBe(false);
    expect(VideoFootageListSchema.safeParse(one({ sha256: 'abc' })).success).toBe(false);
    expect(VideoFootageListSchema.safeParse(one({ scenes: -1 })).success).toBe(false);
    expect(VideoFootageListSchema.safeParse(one({ extra: 1 })).success).toBe(false);
    expect(VideoFootageListSchema.safeParse({ ...list, extra: 1 }).success).toBe(false);
  });
});

describe('footage list: catalog', () => {
  it('describes the GET transport and keeps the POST on the same path', () => {
    const { contracts, transports } = getPortableCapabilityContracts();
    expect(transports.videoEngineFootageList).toMatchObject({
      method: 'GET', path: '/api/footage', authHeader: INTERNAL_SECRET_HEADER,
      queryContract: 'videoEngineFootageListQuery', responseContract: 'videoEngineFootageList', errorContract: 'videoEngineError',
    });
    expect(transports.videoEngineFootageAdd).toMatchObject({ method: 'POST', path: '/api/footage' });
    expect(officinaVideoFootageListContract.responseStatus).toBe(200);
    for (const name of ['videoEngineFootageListQuery', 'videoEngineFootageList']) expect(contracts[name]?.supported, name).toBe(true);
  });
});

type Verdicts = Record<string, { ok: boolean; value?: unknown }>;

function pythonVerdicts(contract: string, values: Record<string, unknown>): Verdicts {
  const directory = mkdtempSync(join(tmpdir(), 'bridge-footage-list-parity-'));
  const catalogPath = join(directory, 'catalog.json');
  writeFileSync(catalogPath, JSON.stringify(getPortableCapabilityContracts()));
  execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
  const out = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_footage', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
result = {}
for name, value in json.load(sys.stdin).items():
    try:
        result[name] = dict(ok=True, value=module.validate_contract(sys.argv[2], value))
    except ValueError:
        result[name] = dict(ok=False)
print(json.dumps(result))
`, join(directory, 'x9_forge_contracts_capabilities.py'), contract], { input: JSON.stringify(values), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out) as Verdicts;
}

describe('footage list: zod and the generated Python give the same verdict', () => {
  const { tenantId: _t, ...noTenant } = query;
  const queries: Record<string, unknown> = {
    good: query, 'person path': { ...query, person: '../x' }, 'extra field': { ...query, extra: 1 }, 'no tenant': noTenant,
  };
  const python = pythonVerdicts('videoEngineFootageListQuery', queries);
  for (const [name, value] of Object.entries(queries)) {
    it(`query: ${name}`, () => {
      const zod = VideoFootageListQuerySchema.safeParse(value);
      expect(python[name]!.ok).toBe(zod.success);
      if (zod.success) expect(python[name]!.value).toEqual(zod.data);
    });
  }

  const lists: Record<string, unknown> = {
    'four shots': list, empty: { person: 'stefano', shots: [] },
    'framing wide': { person: 'stefano', shots: [{ ...shots[0], framing: 'wide' }] },
    'sha256 uppercase': { person: 'stefano', shots: [{ ...shots[0], sha256: hash('A') }] },
  };
  const pythonLists = pythonVerdicts('videoEngineFootageList', lists);
  for (const [name, value] of Object.entries(lists)) {
    it(`response: ${name}`, () => {
      const zod = VideoFootageListSchema.safeParse(value);
      expect(pythonLists[name]!.ok).toBe(zod.success);
      if (zod.success) expect(pythonLists[name]!.value).toEqual(zod.data);
    });
  }
});
