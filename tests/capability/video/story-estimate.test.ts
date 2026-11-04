import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { VideoEngineStoryEstimateSchema } from '../../../src/capability/video/index.js';
import { officinaVideoStoryEstimateContract, officinaVideoStoryContract } from '../../../src/http/endpoints/index.js';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import { INTERNAL_SECRET_HEADER } from '../../../src/auth/auth-headers.js';

/** Third test of 04/11: email 1 said «about 3.90, ceiling 5», the engine then refused 5.01. The estimate is now a call. */
const estimate = {
  estimateUsd: 5.01, voiceUsd: 0.12, lipSyncUsd: 4.84, estimatedSeconds: 36.3, characters: 980,
  availableUsd: 5, serverAvailableUsd: 40, fitsBudget: false, source: 'voce 0,08 USD/1000 caratteri ×1,5; Sync 3 8 USD/min',
};

describe('engine story estimate', () => {
  it('is POST /api/projects/:engineProjectId/story/estimate answering 200, with the body of the story', () => {
    expect(officinaVideoStoryEstimateContract).toMatchObject({ method: 'POST', path: '/api/projects/:engineProjectId/story/estimate', responseStatus: 200 });
    expect(officinaVideoStoryEstimateContract.requestSchema).toBe(officinaVideoStoryContract.requestSchema);
    expect(officinaVideoStoryEstimateContract.paramsSchema.safeParse({ engineProjectId: 'f'.repeat(32) }).success).toBe(true);
    expect(officinaVideoStoryEstimateContract.paramsSchema.safeParse({ engineProjectId: '../x' }).success).toBe(false);
  });

  it('answers the figures, the two remaining ceilings and whether the story would start', () => {
    expect(VideoEngineStoryEstimateSchema.parse(estimate)).toEqual(estimate);
    expect(VideoEngineStoryEstimateSchema.parse({ ...estimate, serverAvailableUsd: null }).serverAvailableUsd).toBeNull();
    for (const bad of [{ ...estimate, estimateUsd: -1 }, { ...estimate, characters: 1.5 }, { ...estimate, fitsBudget: 'no' },
      { ...estimate, extra: 1 }, { ...estimate, source: '' }, { ...estimate, estimateUsd: Number.POSITIVE_INFINITY }]) {
      expect(VideoEngineStoryEstimateSchema.safeParse(bad).success, JSON.stringify(bad).slice(0, 60)).toBe(false);
    }
    const { availableUsd: _a, ...missing } = estimate;
    expect(VideoEngineStoryEstimateSchema.safeParse(missing).success).toBe(false);
  });

  it('is in the portable catalog with its transport, and the generated Python resolves and validates it', () => {
    const catalog = getPortableCapabilityContracts();
    expect(catalog.contracts.videoEngineStoryEstimate).toMatchObject({ supported: true, customRefinements: 0, rules: [], gates: [] });
    expect(catalog.transports.videoEngineStoryEstimate).toMatchObject({
      method: 'POST', path: '/api/projects/:engineProjectId/story/estimate', authHeader: INTERNAL_SECRET_HEADER,
      requestContract: 'videoEngineStoryRequest', responseContract: 'videoEngineStoryEstimate',
    });
    const directory = mkdtempSync(join(tmpdir(), 'bridge-story-estimate-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog));
    execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'), '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
    const out = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_estimate', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
value = json.load(sys.stdin)
assert module.validate_contract('videoEngineStoryEstimate', value) == value
try:
    module.validate_contract('videoEngineStoryEstimate', dict(value, fitsBudget=None))
except ValueError:
    pass
else:
    raise AssertionError('accepted a null verdict')
print(module.portable_transport('videoEngineStoryEstimate', {'engineProjectId': 'f' * 32})['path'])
`, join(directory, 'x9_forge_contracts_capabilities.py')], { input: JSON.stringify(estimate), encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    expect(out.trim()).toBe(`/api/projects/${'f'.repeat(32)}/story/estimate`);
  });
});
