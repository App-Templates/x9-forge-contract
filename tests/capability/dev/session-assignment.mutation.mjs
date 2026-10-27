/**
 * Mutazione dei controlli dell'incarico di sessione (F4): ogni scenario toglie UN controllo dal sorgente, esegue il
 * file di test che lo copre e pretende che fallisca. Un mutante sopravvissuto = un controllo senza prova.
 * Uso: node tests/capability/dev/session-assignment.mutation.mjs   (dalla radice del ponte; ripristina sempre il sorgente)
 */
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const SESSION = 'src/capability/dev/session-assignment.ts';
const SESSION_TEST = 'tests/capability/dev/session-assignment.test.ts';
const ASSET = 'src/organization/asset.ts';
const ASSET_TEST = 'tests/organization/asset-session-delivery.test.ts';
const LEAD = 'src/organization/business-unit-lead.ts';
const LEAD_TEST = 'tests/organization/business-unit-lead-agent-id.test.ts';

const scenarios = [
  { id: 'link-host', file: SESSION, test: SESSION_TEST, anchor: "url.hostname !== 'github.com' || ", replacement: '' },
  { id: 'link-https', file: SESSION, test: SESSION_TEST, anchor: "url.protocol !== 'https:' || ", replacement: '' },
  { id: 'link-credentials', file: SESSION, test: SESSION_TEST, anchor: "if (url.username !== '' || url.password !== '' || url.search !== '' || url.hash !== '') return false;", replacement: '' },
  { id: 'link-raw-dot-segments', file: SESSION, test: SESSION_TEST, anchor: "if (value.includes('\\\\') || value.split('/').some((segment) => /^(?:\\.|%2e){1,2}$/i.test(segment))) return false;", replacement: '' },
  { id: 'material-tenant', file: SESSION, test: SESSION_TEST, anchor: "if (asset.tenantId !== assignment.tenantId) mismatch('material_foreign_tenant');\n    else if", replacement: 'if' },
  { id: 'material-company', file: SESSION, test: SESSION_TEST, anchor: "if (asset.companyId !== assignment.companyId) mismatch('material_foreign_company');\n    else if", replacement: 'if' },
  { id: 'material-project', file: SESSION, test: SESSION_TEST, anchor: "if (asset.projectId !== assignment.projectId) mismatch('material_foreign_project');\n    else if", replacement: 'if' },
  { id: 'material-business-unit', file: SESSION, test: SESSION_TEST, anchor: "else if (asset.buSlug !== undefined && asset.buSlug !== assignment.businessUnit.slug) mismatch('material_foreign_business_unit');", replacement: '' },
  { id: 'kind-only-code-and-design', file: SESSION, test: SESSION_TEST, anchor: "z.enum(['code', 'design'])", replacement: "z.enum(['code', 'design', 'automation', 'presentation'])" },
  { id: 'block-single-marker', file: SESSION, test: SESSION_TEST, anchor: "if (at.length > 1) return { ok: false, reason: 'multiple' };", replacement: '' },
  { id: 'block-escape-lt', file: SESSION, test: SESSION_TEST, anchor: ".replace(/</g, '\\\\u003c')", replacement: '' },
  { id: 'block-digest-shape', file: SESSION, test: SESSION_TEST, anchor: "if (!DIGEST_PATTERN.test(digest)) throw new Error('digest must be 64 lowercase hex digits');", replacement: '' },
  { id: 'block-validates-assignment', file: SESSION, test: SESSION_TEST, anchor: "if (!parsed.success) return { ok: false, reason: 'invalid_assignment' };", replacement: '' },
  { id: 'delivery-multiple-commits', file: SESSION, test: SESSION_TEST, anchor: "if (commitLines.length > 1) return { ok: false, reason: 'multiple_commits' };", replacement: '' },
  { id: 'delivery-commit-shape', file: SESSION, test: SESSION_TEST, anchor: "if (!CommitSchema.safeParse(value).success) return { ok: false, reason: 'invalid_commit' };", replacement: '' },
  { id: 'delivery-duplicate-path', file: SESSION, test: SESSION_TEST, anchor: "if (paths.has(file.data.path)) return { ok: false, reason: 'duplicate_path' };", replacement: '' },
  { id: 'delivery-too-many-files', file: SESSION, test: SESSION_TEST, anchor: "if (files.length >= DEV_SESSION_MAX_FILES) return { ok: false, reason: 'too_many_files' };", replacement: '' },
  { id: 'delivery-path-safety', file: SESSION, test: SESSION_TEST, anchor: "if (path.startsWith('/') || path.includes('\\\\')) return false;", replacement: '' },
  { id: 'result-needs-files', file: SESSION, test: SESSION_TEST, anchor: 'files: z.array(DevSessionResultFileSchema).min(1)', replacement: 'files: z.array(DevSessionResultFileSchema)' },
  { id: 'result-needs-assets', file: SESSION, test: SESSION_TEST, anchor: 'assets: z.array(AssetRefSchema).min(1)', replacement: 'assets: z.array(AssetRefSchema)' },
  { id: 'origin-all-or-none', file: ASSET, test: ASSET_TEST, anchor: "(origin.repo === undefined) === (origin.commit === undefined) && (origin.repo === undefined) === (origin.path === undefined)", replacement: 'true' },
  { id: 'origin-commit-shape', file: ASSET, test: ASSET_TEST, anchor: "commit: z.string().regex(/^[0-9a-f]{40}$/).optional(),", replacement: 'commit: z.string().optional(),' },
  { id: 'origin-path-safety', file: ASSET, test: ASSET_TEST, anchor: "(path) => !path.startsWith('/')", replacement: '(path) => path.length > 0 || !path.startsWith(\'/\')' },
  { id: 'lead-prefix', file: LEAD, test: LEAD_TEST, anchor: "if (!agentId.startsWith(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX)) return null;", replacement: '' },
  { id: 'lead-slug-shape', file: LEAD, test: LEAD_TEST, anchor: "return parsed.success ? parsed.data : null;", replacement: 'return agentId.slice(BUSINESS_UNIT_LEAD_AGENT_ID_PREFIX.length);' },
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
