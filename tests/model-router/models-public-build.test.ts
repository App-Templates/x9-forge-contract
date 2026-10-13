import {execFileSync} from 'node:child_process';
import {expect, it} from 'vitest';
it('loads the published ESM and CJS entrypoints with the same versions, targets and authenticated ports', () => {
  const program = `
    import assert from 'node:assert/strict';
    import {createRequire} from 'node:module';
    const require = createRequire(import.meta.url);
    const routers = [await import('./dist/index.js'), await import('./dist/model-router/index.js'), require('./dist/index.cjs'), require('./dist/model-router/index.cjs')];
    const versions = [];
    for (const router of routers) {
      for (const name of ['modelCatalogContentVersion','modelConfigurationContentVersion','modelsVersion','withCatalogVersion']) assert.equal(typeof router[name], 'function');
      assert.deepEqual(router.ModelsTargetSchema.parse({scope:'stack'}), {scope:'stack'});
      assert.equal(router.ModelsTargetSchema.safeParse({scope:'stack',agentId:'synthetic-agent'}).success, false);
      assert.equal(router.AgentModelOverviewRowSchema.shape.heirs.isOptional(), true);
      versions.push(router.modelsVersion({catalogVersion:'synthetic-catalog',configurationVersion:'synthetic-configuration'}));
    }
    assert.equal(new Set(versions).size, 1);
    const secret = require('./dist/auth/index.cjs').INTERNAL_SECRET_HEADER;
    for (const http of [await import('./dist/http/index.js'), require('./dist/http/index.cjs')]) {
      assert.equal(http.internalModelsApplyContract.authHeader, secret);
      assert.equal(http.internalModelsApplyJobContract.authHeader, secret);
      assert.equal(http.internalModelsApplyContract.path, '/internal/models/apply');
      assert.equal(http.internalModelsApplyJobContract.path, '/internal/models/apply/:requestId');
      assert.equal(http.ModelsApplyHeirSchema.safeParse('synthetic-agent').success, true);
    }
    process.stdout.write('6/6 public surfaces PASS');
  `;
  expect(execFileSync(process.execPath, ['--input-type=module', '-e', program], {cwd: process.cwd(), encoding: 'utf8'})).toBe('6/6 public surfaces PASS');
});
