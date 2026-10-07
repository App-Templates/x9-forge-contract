const assert = require('node:assert/strict');
const path = require('node:path');
const expected = process.argv[2];
assert.equal(require.resolve('@x9-forge/contracts/agent'), path.join(expected, 'dist/agent/index.cjs'));
const agent = require('@x9-forge/contracts/agent');
const pair = { managementAgentId: 'forge-alice', runtimeAgentId: 'alice' };
const results = [];
function probe(name, test) {
  try { test(); results.push({ name, passed: true }); }
  catch (error) { results.push({ name, passed: false, errorName: error.name }); }
}
function selected(value) { assert.equal(typeof agent.vaultAgentIdOf, 'function'); return agent.vaultAgentIdOf(value); }
probe('explicit field retained', () => assert.deepEqual(agent.AgentRuntimeIdentitySchema.parse({ ...pair, vaultAgentId: 42 }), { ...pair, vaultAgentId: 42 }));
probe('zero rejected', () => assert.equal(agent.AgentRuntimeIdentitySchema.safeParse({ ...pair, vaultAgentId: 0 }).success, false));
probe('negative rejected', () => assert.equal(agent.AgentRuntimeIdentitySchema.safeParse({ ...pair, vaultAgentId: -1 }).success, false));
probe('fraction rejected', () => assert.equal(agent.AgentRuntimeIdentitySchema.safeParse({ ...pair, vaultAgentId: 1.5 }).success, false));
probe('numeric string rejected', () => assert.equal(agent.AgentRuntimeIdentitySchema.safeParse({ ...pair, vaultAgentId: '42' }).success, false));
probe('legacy pair preserved', () => assert.deepEqual(agent.AgentRuntimeIdentitySchema.safeParse(pair).data, pair));
probe('explicit vault selector', () => assert.equal(selected({ identity: { ...pair, vaultAgentId: 42 } }), 42));
probe('missing identity is null', () => assert.equal(selected({}), null));
probe('numeric management is not a vault ID', () => assert.equal(selected({ identity: { ...pair, managementAgentId: '42' } }), null));
probe('numeric runtime is not a vault ID', () => assert.equal(selected({ agentId: '42', identity: { ...pair, runtimeAgentId: '42' } }), null));
probe('noncanonical sources ignored', () => assert.equal(selected({ vaultAgentId: 99, channelConfigurations: [{ identity: { ...pair, vaultAgentId: 88 } }] }), null));
probe('next context is fresh', () => { assert.equal(selected({ identity: { ...pair, vaultAgentId: 41 } }), 41); assert.equal(selected({ identity: { ...pair, vaultAgentId: 82 } }), 82); assert.equal(selected({ identity: pair }), null); });
const passed = results.filter(result => result.passed).length;
process.stdout.write(JSON.stringify({ passed, total: results.length, results }));
process.exitCode = passed === results.length ? 0 : 1;
