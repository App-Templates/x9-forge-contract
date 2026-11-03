import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as esm from '@x9-forge/contracts/agent';
const require = createRequire(import.meta.url);
const cjs = require('@x9-forge/contracts/agent');
let passed = 0;
for (const [format, mod] of [['ESM', esm], ['CJS', cjs]]) {
  const base = { agentId: 'runtime-a', ownerId: 'owner-a', tenantId: 'tenant-a', identity: { managementAgentId: 'forge-a', runtimeAgentId: 'runtime-a', vaultAgentId: 17 }, role: 'erede', masterAgentId: 'runtime-master' };
  for (const name of ['AgentContextIdentitySchema', 'createAgentContextIdentity', 'AgentContextWithIdentitySchema', 'AgentContextWithIdentityWriteSchema']) { assert.notEqual(mod[name], undefined, `${format} export ${name}`); passed++; }
  assert.deepEqual(mod.createAgentContextIdentity(base), base); passed++;
  const invalid = { ...base, identity: { ...base.identity, runtimeAgentId: 'other-agent' } };
  assert.throws(() => mod.createAgentContextIdentity(invalid)); passed++;
  assert.equal(mod.AgentContextIdentitySchema.safeParse({ ...base, masterAgentId: 'runtime-a' }).success, false); passed++;
  const full = { ...base, credentials: {}, llmConfig: { provider: 'openai', model: 'fixture' }, telegramAllowFrom: [], displayName: 'Fixture', workspacePath: '/fixture', registryPath: '/fixture' };
  assert.deepEqual(mod.AgentContextWithIdentityWriteSchema.parse(full), full); passed++;
  const result = mod.createAgentContextIdentity(base); result.identity.vaultAgentId = 99;
  assert.equal(base.identity.vaultAgentId, 17); passed++;
}
process.stdout.write(JSON.stringify({ passed, total: 18 }) + '\n');
