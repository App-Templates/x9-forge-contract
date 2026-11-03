/**
 * Mutazione dei controlli del segnale di nascita (1.75.0): ogni scenario toglie UN controllo dal sorgente, esegue il file
 * di test che lo copre e pretende che fallisca. Un mutante sopravvissuto = un controllo senza prova.
 * Uso: node tests/agent/agent-birth.mutation.mjs   (dalla radice del ponte; ripristina sempre il sorgente)
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const BIRTH = 'src/agent/agent-birth.ts';
const MANAGEMENT = 'src/agent/agent-management.ts';
const RELOAD = 'src/http/endpoints/internal-agents-reload.ts';
const CLIENT = 'src/http/bridge-client.ts';
const CONSUMERS = 'src/model-router/model-consumers.ts';
const BIRTH_TEST = 'tests/agent/agent-birth.test.ts';
const ADAPTER_TEST = 'tests/model-router/model-consumer-adapters.test.ts';

const scenarios = [
  { id: 'job-id-shape', file: BIRTH, test: BIRTH_TEST, anchor: ".regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/)", replacement: '' },
  { id: 'job-id-max', file: BIRTH, test: BIRTH_TEST, anchor: 'z.string().min(1).max(100)', replacement: 'z.string().min(1)' },
  { id: 'signal-strict', file: BIRTH, test: BIRTH_TEST, anchor: "}).strict();\nexport type AgentBirthSignal ", replacement: "});\nexport type AgentBirthSignal " },
  { id: 'receipt-strict', file: BIRTH, test: BIRTH_TEST, anchor: "}).strict();\nexport type AgentBirthModelsReceipt ", replacement: "});\nexport type AgentBirthModelsReceipt " },
  { id: 'receipt-request-id', file: BIRTH, test: BIRTH_TEST, anchor: 'requestId: AgentManagementRequestIdSchema,', replacement: 'requestId: z.string(),' },
  { id: 'birth-only-on-reload', file: MANAGEMENT, test: BIRTH_TEST, anchor: "if (command.birth !== undefined && command.action !== 'reload') {", replacement: 'if (false) {' },
  { id: 'replay-compares-birth', file: MANAGEMENT, test: BIRTH_TEST, anchor: "if (JSON.stringify(canonicalCommandValue(a.birth)) !== JSON.stringify(canonicalCommandValue(b.birth))) return false;", replacement: '' },
  { id: 'reload-body-strict', file: RELOAD, test: BIRTH_TEST, anchor: "}).strict();\nexport type ReloadAgentBody ", replacement: "});\nexport type ReloadAgentBody " },
  { id: 'reload-receipt-schema', file: RELOAD, test: BIRTH_TEST, anchor: 'birthModels: AgentBirthModelsReceiptSchema.optional(),', replacement: 'birthModels: z.unknown().optional(),' },
  { id: 'client-validates-body', file: CLIENT, test: BIRTH_TEST, anchor: 'body === undefined ? undefined : ReloadAgentBodySchema.parse(body)', replacement: 'body' },
  { id: 'client-sends-body', file: CLIENT, test: BIRTH_TEST, anchor: '...(safeBody === undefined ? {} : { body: safeBody }),', replacement: '' },
  { id: 'lab-adapter-declared', file: CONSUMERS, test: ADAPTER_TEST, anchor: "lab_digest: Object.freeze(['lab-openai-responses']),", replacement: '' },
  { id: 'adapter-membership', file: CONSUMERS, test: ADAPTER_TEST, anchor: "MODEL_CONSUMER_ADAPTER_IDS[slotId]!.includes(adapterId)", replacement: 'true' },
  { id: 'adapter-own-key', file: CONSUMERS, test: ADAPTER_TEST, anchor: '!Object.hasOwn(MODEL_CONSUMER_ADAPTER_IDS, slotId)', replacement: "!(slotId in MODEL_CONSUMER_ADAPTER_IDS)" },
];

const run = (test) => spawnSync('npx', ['vitest', 'run', test, '--testTimeout=60000'], { cwd: root, encoding: 'utf8' });
const originals = new Map();
const restore = () => { for (const [file, text] of originals) writeFileSync(join(root, file), text); };
process.on('SIGINT', () => { restore(); process.exit(130); });
process.on('SIGTERM', () => { restore(); process.exit(143); });

const survivors = [];
try {
  for (const test of new Set(scenarios.map((s) => s.test))) {
    const baseline = run(test);
    assert.equal(baseline.status, 0, `baseline must pass: ${test}\n${baseline.stdout}${baseline.stderr}`);
  }
  for (const scenario of scenarios) {
    const path = join(root, scenario.file);
    const original = originals.get(scenario.file) ?? readFileSync(path, 'utf8');
    originals.set(scenario.file, original);
    assert.equal(original.split(scenario.anchor).length, 2, `anchor must be unique: ${scenario.id}`);
    writeFileSync(path, original.replace(scenario.anchor, () => scenario.replacement));
    const result = run(scenario.test);
    writeFileSync(path, original);
    const killed = result.status !== 0 && /FAIL|Failed Tests/.test(`${result.stdout}${result.stderr}`);
    console.log(`${killed ? 'killed  ' : 'SURVIVED'} ${scenario.id}`);
    if (!killed) survivors.push(scenario.id);
  }
} finally {
  restore();
}
console.log(`${scenarios.length - survivors.length}/${scenarios.length} killed`);
if (survivors.length > 0) {
  console.error(`survivors: ${survivors.join(', ')}`);
  process.exit(1);
}
