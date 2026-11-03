const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const cap = require('@x9-forge/contracts/capability');
const agent = require('@x9-forge/contracts/agent');
const http = require('@x9-forge/contracts/http');
for (const key of ['parseCapabilityOrdinaryWrite', 'parseCapabilityOrdinaryCall', 'parseCapabilityOrdinaryLifecycle', 'getPortableCapabilityContracts', 'capabilityOrdinaryDeclarationOf']) {
  assert.equal(typeof cap[key], 'function', `Missing compiled capability export ${key}`);
}
for (const key of ['digestAgentWorkspace', 'projectAgentOrdinaryAuthority', 'parseAgentOrdinaryAuthorityResponse']) {
  assert.equal(typeof agent[key], 'function', `Missing compiled agent export ${key}`);
}
assert.equal(http.agentOrdinaryAuthorityContract.authType, 'secret');
assert.equal(http.agentOrdinaryAuthorityContract.path, http.agentManagementStateContract.path);
const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const configuration = { format: 'ordinary-v2', scope, capability: 'calendar', version: 1, parameters: [] };
assert.deepEqual(cap.parseCapabilityOrdinaryCall({ scope, capability: 'calendar', version: 1, values: {} }, configuration).values, {});
assert.throws(() => cap.parseCapabilityOrdinaryCall({ scope: { ...scope, ownerId: 'other' }, capability: 'calendar', version: 1, values: {} }, configuration));
assert.deepEqual(cap.capabilityOrdinaryDeclarationOf({ ordinaryParameters: { parameters: [], consumes: false, spendLedger: false } }).parameters, []);
assert.equal(cap.getPortableCapabilityContracts().contracts.authorityQuery.supported, true);
execFileSync(process.execPath, ['--input-type=module', '--eval', `
  import assert from 'node:assert/strict';
  import { parseCapabilityOrdinaryCall, getPortableCapabilityContracts } from '@x9-forge/contracts/capability';
  import { digestAgentWorkspace } from '@x9-forge/contracts/agent';
  import { agentOrdinaryAuthorityContract } from '@x9-forge/contracts/http';
  assert.equal(typeof parseCapabilityOrdinaryCall, 'function');
  assert.equal(typeof digestAgentWorkspace, 'function');
  assert.equal(agentOrdinaryAuthorityContract.authType, 'secret');
  assert.equal(getPortableCapabilityContracts().contracts.authorityResponse.supported, true);
`], { stdio: 'inherit' });
console.log('[capabilities-smoke] CJS/ESM exports and exact scoped dispatch passed');
