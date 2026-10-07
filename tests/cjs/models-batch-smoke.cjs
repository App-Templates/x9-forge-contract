'use strict';
const assert = require('node:assert/strict');
const root = require('@x9-forge/contracts');
const router = require('@x9-forge/contracts/model-router');
const http = require('@x9-forge/contracts/http');
const models = ['AgentModelsConfigurationSchema', 'AgentModelsStateSchema', 'AgentModelRuntimeAttestationSchema', 'AgentContextWithModelsSchema', 'AgentModelsOverviewSchema', 'AgentModelsBatchRequestSchema', 'AgentModelsBatchPreviewSchema', 'AgentModelsBatchResultSchema', 'isAgentModelApplyConfirmed', 'validateAgentModelsBatch', 'isAgentModelsBatchPreviewCurrent', 'isAgentModelsBatchResultConsistent', 'sameAgentModelsBatchRequest'];
const facade = ['forgeModelsOverviewContract', 'forgeModelsCatalogContract', 'forgeModelsPreviewContract', 'forgeModelsBatchContract', 'forgeModelsProgressContract', 'ForgeModelsAccessSchema', 'ForgeModelsProgressSchema', 'isAgentModelsOverviewWithinAccess', 'isAgentModelsBatchWithinAccess'];
for (const name of models) { assert.ok(root[name], name + ' root'); assert.ok(router[name], name + ' router'); }
for (const name of facade) assert.ok(http[name], name + ' http');
assert.equal(root.isAgentModelApplyConfirmed({}, {}, { ok: true, applied: 1 }, null), false);
assert.equal(root.AgentModelsStateSchema.safeParse({ identity: { managementAgentId: 'synthetic', runtimeAgentId: 'synthetic-runtime' }, versions: null, saved: null, runtime: null }).success, true);
assert.equal(http.forgeModelsOverviewContract.authentication, 'forge-session');
assert.equal(http.forgeModelsOverviewContract.authHeader, undefined);
console.log('[models-batch-smoke] ' + (models.length * 2 + facade.length + 4) + '/' + (models.length * 2 + facade.length + 4) + ' compiled CommonJS assertions passed');
