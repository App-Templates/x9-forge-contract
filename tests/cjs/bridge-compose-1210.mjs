import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(process.argv[2] ?? '.');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const require = createRequire(resolve(root, 'package.json'));
let checks = 0;
const equal = (actual, expected) => { assert.deepEqual(actual, expected); checks++; };
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const identity = { managementAgentId: 'agent-42', runtimeAgentId: 'runtime-42', vaultAgentId: 42 };
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter' };
const requirements = { tools: true, stream: true, structuredOutput: false };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'catalog-1', requirements,
  mode: 'pin', pin: descriptor, tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor };
const row = { identity, ownerId: 'owner-42', slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning',
  channelId: null, installation: 'installed', editability: 'readonly', reason: 'Current choices are not saved',
  origin: 'initial', initial: settings, default: null, saved: null, applied: null, versions: null,
  masterAgentId: null, masterConfigVersion: null, requirements, catalogVersion: 'catalog-1',
  cost: { state: 'unknown', reason: 'No attested price' }, embedding: null };
const overview = { version: 'overview-1', observedAt: '2026-10-12T00:00:00Z', rows: [row] };
for (const format of ['import', 'require']) {
  const load = async subpath => format === 'require' ? require(pkg.name + subpath.slice(1))
    : import(pathToFileURL(resolve(root, pkg.exports[subpath][format])).href);
  const [models, cap, http] = await Promise.all(['./model-router', './capability', './http'].map(load));
  equal(pkg.version, '1.47.0');
  equal(models.AgentModelsOverviewSchema.parse(overview), overview);
  equal(models.AgentModelsOverviewSchema.safeParse({ ...overview, rows: [{ ...row, editability: 'editable', reason: null }] }).success, false);
  equal(models.AgentModelsBatchRequestSchema.safeParse({ requestId: 'composition-request', previewId: 'composition-preview', overviewVersion: overview.version,
    agents: [{ identity, expectedVersion: 0, changes: [{ action: 'set', slotId: row.slotId, settings }] }] }).success, false);
  const command = { scope, requestId: 'composition-news', expectedVersion: 1, family: 'news', changes: [{ type: 'feeds.replace', feeds: [{ url: 'https://example.org/feed', category: 'science' }] }] };
  equal(cap.NewsBriefingCommandSchema.parse(command), command);
  equal(cap.NewsBriefingCommandSchema.safeParse({ ...command, changes: [{ type: 'parameter.refresh-master', key: 'hoursBack', source: { tenantId: scope.tenantId, masterId: 'master-a', version: 1, ownerId: 'foreign' } }] }).success, false);
  equal(cap.CapabilityOrdinaryStructuredCodecs['agent-elevenlabs.nativeConfig'], cap.ElevenLabsNativeConfigSchema);
  equal(http.ElevenLabsNativeBindingReadRequestSchema.parse({ requestId: 'composition-read', scope: { ...scope, userId: 'person-a' }, ref: { kind: 'binding', bindingId: 'binding-a' } }).ref.kind, 'binding');
  equal(http.CoachBrowserRequestSchema.parse({ action: 'open', requestId: 'composition-open', programRef: 'program-a', channel: 'native' }).action, 'open');
  equal(http.CoachBrowserRequestSchema.safeParse({ action: 'open', requestId: 'composition-open', programRef: 'program-a', channel: 'native', scope }).success, false);
  equal(http.newsBriefingSettingsGetContract.authType, 'secret');
  equal(http.coachBrowserContract.authType, 'forge_session');
  equal(http.coachBrowserContract.cacheControl, 'no-store');
  equal(Object.keys(http.INTERNAL_AGENT_EXECUTIONS).length, 23);
  equal(http.INTERNAL_AGENT_EXECUTIONS.scheduler_briefing_generate.settingKeys, ['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID']);
  equal(['news_digest', 'news_digest_topic', 'calendar_today', 'calendar_week', 'lab_execute'].every(key => key in http.INTERNAL_AGENT_EXECUTIONS), true);
}
console.log(`${checks}/${checks} composition checks passed across ESM/CJS from ${root}`);
