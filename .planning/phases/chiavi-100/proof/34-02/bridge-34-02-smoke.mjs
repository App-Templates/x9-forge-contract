import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
const [root, format] = process.argv.slice(2);
const agent = format === 'esm'
  ? await import(pathToFileURL(`${root}/dist/agent/index.js`))
  : createRequire(import.meta.url)(`${root}/dist/agent/index.cjs`);
assert.ok(agent.KNOWN_CREDENTIAL_KEYS.includes('NETATMO_EMAIL'), 'known key');
assert.ok(Object.hasOwn(agent.AgentCredentialsSchema.shape, 'NETATMO_EMAIL'), 'explicit schema');
assert.equal(agent.AgentCredentialsSchema.shape.NETATMO_EMAIL.isOptional(), true, 'optional');
assert.equal(agent.AgentCredentialsSchema.shape.NETATMO_EMAIL.safeParse('synthetic@example.invalid').success, true, 'string');
assert.equal(agent.AgentCredentialsSchema.shape.NETATMO_EMAIL.safeParse(123).success, false, 'non-string');
assert.deepEqual(agent.getAgentCredentialServiceMetadata('NETATMO_EMAIL'), {
  key:'NETATMO_EMAIL',label:'Indirizzo email account Netatmo',kind:'credential',secret:false,service:{type:'commercial',id:'netatmo'},
}, 'canonical public account metadata');
assert.equal(agent.getAgentCredentialServiceMetadata('NETATMO_UNKNOWN_KEY'), null, 'unknown key');
const previous = JSON.parse(readFileSync('/private/tmp/codex-a-chiavi-completamento/proofs/34-02/baseline-metadata.json', 'utf8'));
const current = Object.fromEntries(Object.entries(agent.AGENT_CREDENTIAL_SERVICE_METADATA).filter(([key]) => key !== 'NETATMO_EMAIL'));
assert.deepEqual(current, previous, 'all previous metadata unchanged');
console.log(`[${format}] 8/8 checks; ${Object.keys(current).length}/${Object.keys(previous).length} previous metadata unchanged; ${Object.keys(agent.AGENT_CREDENTIAL_SERVICE_METADATA).length} canonical fields`);
