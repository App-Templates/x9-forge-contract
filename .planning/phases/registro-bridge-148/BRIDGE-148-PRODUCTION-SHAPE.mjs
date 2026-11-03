import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const root = '/Users/admintemp/Downloads/Claude/x9-forge-contract-bridge-codex-193-2';
const data = '/Users/admintemp/Downloads/Claude/forge-v2-bacheca/piani/dati-reali-1310';
const masterText = readFileSync(data + '/stato-master.json', 'utf8');
const embeddingText = readFileSync(data + '/stato-memory-embedding.json', 'utf8');
const master = JSON.parse(masterText);
const embedding = JSON.parse(embeddingText);
const require = createRequire(import.meta.url);
const formats = [
  ['ESM', await import(root + '/dist/model-router/index.js'), await import(root + '/dist/http/index.js'), await import(root + '/dist/agent/index.js')],
  ['CJS', require(root + '/dist/model-router/index.cjs'), require(root + '/dist/http/index.cjs'), require(root + '/dist/agent/index.cjs')],
];
let count = 0;
for (const [name, router, http, agent] of formats) {
  const pending = {
    requestId: 'synthetic-real-shape-0001', kind: 'initial', desiredVersion: 1, phase: 'accepted',
    startedAt: master.initialSource.observedAt, updatedAt: master.initialSource.observedAt,
    slots: [{ slotId: 'memory_embedding', status: 'waiting' }],
  };
  assert.equal(router.AgentModelsStateSchema.safeParse(master).success, true, name + ' legacy Master');
  count++;
  assert.equal(router.AgentModelsStateSchema.safeParse({ ...master, pending }).success, true, name + ' pending Master');
  count++;
  assert.equal(http.isModelConsumerReportMatching({ slotId: 'memory_embedding' }, embedding), true, name + ' embedding report');
  count++;
  assert.equal(http.isModelConsumerReportMatching({ slotId: 'agent_classifier' }, embedding), false, name + ' mismatched report');
  count++;
  assert.equal(typeof agent.isAgentManagementCommandInProgress, 'function', name + ' public command helper');
}
const result = {
  checks: count, passed: count, formats: ['ESM', 'CJS'],
  files: {
    'stato-master.json': createHash('sha256').update(masterText).digest('hex'),
    'stato-memory-embedding.json': createHash('sha256').update(embeddingText).digest('hex'),
  },
  selections: master.initialSource.selections.length,
  excluded: master.initialSource.excludedSlots.length,
  progress: embedding.embedding.progress,
  note: 'Coordinator-captured public production shape with synthetic UUIDs; offline parsing, no live call.',
};
writeFileSync('/Users/admintemp/Documents/Codex/2026-10-08/tu-sei-codex-f-crea-in/work/registro-bridge-148/production-shape.json', JSON.stringify(result, null, 2));
console.log('Production-shape parsing: ' + count + '/' + count + '; ESM/CJS helpers 2/2; Master selections/excluded ' + result.selections + '/' + result.excluded + '; embedding 490/490.');
