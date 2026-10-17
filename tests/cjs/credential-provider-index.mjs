import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const mode = process.argv[2];
assert.ok(mode === 'esm' || mode === 'cjs');
const agent = mode === 'esm' ? await import('../../dist/agent/index.js')
  : createRequire(import.meta.url)(fileURLToPath(new URL('../../dist/agent/index.cjs', import.meta.url)));
const additions = ['GOOGLE_CONTACTS_CLIENT_ID', 'GOOGLE_CONTACTS_CLIENT_SECRET', 'GOOGLE_CONTACTS_REFRESH_TOKEN',
  'NETATMO_CLIENT_ID', 'NETATMO_CLIENT_SECRET', 'NETATMO_REFRESH_TOKEN', 'NETATMO_ACCESS_TOKEN', 'NETATMO_PASSWORD'];
let passed = 0;
for (const key of additions) {
  assert.ok(agent.KNOWN_CREDENTIAL_KEYS.includes(key), `Known key: ${key}`);
  passed++;
  assert.ok(Object.hasOwn(agent.AgentCredentialsSchema.shape, key), `Explicit field: ${key}`);
  const field = agent.AgentCredentialsSchema.shape[key];
  assert.equal(field.safeParse(undefined).success, true);
  assert.equal(field.safeParse('synthetic-provider-value').success, true);
  assert.equal(field.safeParse(7).success, false);
  passed++;
}
for (const key of ['GOOGLE_CALENDAR_CLIENT_ID', ...additions]) {
  const entry = agent.getAgentCredentialServiceMetadata(key);
  assert.ok(entry, `Canonical metadata: ${key}`);
  assert.equal(entry.key, key);
  assert.equal(entry.kind, 'credential');
  assert.equal(entry.secret, !key.endsWith('_CLIENT_ID'));
  assert.deepEqual(entry.service, { type: 'commercial', id: key.startsWith('NETATMO_') ? 'netatmo' : 'google' });
  assert.equal(agent.AgentCredentialServiceMetadataSchema.safeParse(entry).success, true);
  assert.equal(agent.AgentCredentialServiceSchema.safeParse(entry.service).success, true);
  assert.deepEqual(Object.keys(entry).sort(), ['key', 'kind', 'label', 'secret', 'service']);
  passed++;
}
console.log(JSON.stringify({ mode, passed, total: 25 }));
