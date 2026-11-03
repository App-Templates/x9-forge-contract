import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { getPortableCapabilityContracts } from '../../../src/capability/portable-contracts.js';
import type { VideoEngineJob, VideoEngineJobResponse } from '../../../src/capability/video/engine.js';

const job: VideoEngineJob = {
  videoProjectId: 'video-1',
  identity: { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' },
  requestedBy: 'editor-1',
  presetId: 'demo-locale',
  settings: { aspectRatio: '9:16', provider: 'demo', durationSeconds: 10, sceneCount: 2 },
  budgetUsd: 1.5,
  mode: 'approval',
  name: 'Product introduction',
  brief: 'Introduce the product in a short video.',
  externalRef: 'campaign-1',
};
const response: VideoEngineJobResponse = { engineProjectId: 'engine-1', status: 'queued' };

describe('portable video contracts', () => {
  it('3203 exports supported video contracts and rejects extra fields in generated Python', () => {
    const catalog = getPortableCapabilityContracts();
    for (const name of ['videoEngineJob', 'videoEngineJobResponse']) {
      expect(catalog.contracts[name], name).toMatchObject({
        supported: true, customRefinements: 0, rules: [], gates: [],
      });
      expect(catalog.contracts[name]!.schema).not.toBeNull();
    }

    const directory = mkdtempSync(join(tmpdir(), 'bridge-video-portable-'));
    const catalogPath = join(directory, 'catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog));
    execFileSync('node', [resolve('scripts/generate-portable-capability-contracts.mjs'),
      '--catalog', catalogPath, '--output', directory], { stdio: 'pipe' });
    const result = execFileSync('python3', ['-B', '-c', `
import importlib.util, json, sys
spec = importlib.util.spec_from_file_location('generated_video', sys.argv[1])
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
values = json.load(sys.stdin)
for name, value in values.items():
    assert module.validate_contract(name, value) == value
    try:
        module.validate_contract(name, dict(value, unexpected=True))
    except ValueError:
        pass
    else:
        raise AssertionError(name + ' accepted an extra field')
print('video contracts validated')
`, join(directory, 'x9_forge_contracts_capabilities.py')], {
      input: JSON.stringify({ videoEngineJob: job, videoEngineJobResponse: response }),
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'],
    });
    expect(result.trim()).toBe('video contracts validated');
  });
});
