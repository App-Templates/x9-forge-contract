'use strict';
const assert = require('node:assert/strict');
const root = require('@x9-forge/contracts');
const router = require('@x9-forge/contracts/model-router');
const http = require('@x9-forge/contracts/http');
for (const name of ['ModelCatalogSchema', 'ModelLimitsSchema', 'CapabilityModelSettingsSchema', 'normalizeModelProvider', 'validateCapabilityModels']) {
  assert.ok(root[name], name + ' root export');
  assert.ok(router[name], name + ' model-router export');
}
assert.equal(router.normalizeModelProvider('claude'), 'anthropic');
assert.equal(router.normalizeModelProvider('gemini'), 'google');
assert.equal(router.normalizeModelProvider('https://synthetic.invalid'), null);
assert.equal(http.agentModelCatalogPath('agent-42'), '/internal/agents/agent-42/models/catalog');
assert.throws(() => http.agentModelCatalogPath('../primary'));
assert.equal(http.internalAgentModelCatalogContract.responseSchema, router.ModelCatalogSchema);
console.log('[model-catalog-smoke] 16/16 compiled CommonJS assertions passed');
