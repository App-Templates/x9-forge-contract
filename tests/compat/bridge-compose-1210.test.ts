import { expect, it } from 'vitest';
import * as models from '../../src/model-router/index.js';
import * as packagedModels from '@x9-forge/contracts/model-router';
import * as capability from '@x9-forge/contracts/capability';
import * as http from '@x9-forge/contracts/http';
import { nativeConfig } from '../capability/native-fixtures.js';

const identity = { managementAgentId: 'agent-42', runtimeAgentId: 'runtime-42', vaultAgentId: 42 };
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter' };
const requirements = { tools: true, stream: true, structuredOutput: false };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'catalog-1', requirements,
  mode: 'pin', pin: descriptor, tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor };
const initialRow = { identity, ownerId: 'owner-42', slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning',
  channelId: null, installation: 'installed', editability: 'readonly', reason: 'Current choices are not saved',
  origin: 'initial', initial: settings, default: null, saved: null, applied: null, versions: null,
  masterAgentId: null, masterConfigVersion: null, requirements, catalogVersion: 'catalog-1',
  cost: { state: 'unknown', reason: 'No attested price' }, embedding: null };
const overview = { version: 'overview-1', observedAt: '2026-10-12T00:00:00Z', rows: [initialRow] };
const batch = { requestId: 'composition-request', previewId: 'composition-preview', overviewVersion: overview.version,
  agents: [{ identity, expectedVersion: 1, changes: [{ action: 'set', slotId: initialRow.slotId, settings }] }] };
const scope = { tenantId: 'tenant-a', ownerId: 'owner-a', agentId: 'agent-a' };
const newsCommand = { scope, requestId: 'composition-news', expectedVersion: 1, family: 'news',
  changes: [{ type: 'feeds.replace', feeds: [{ url: 'https://example.org/feed', category: 'science' }] }] };

it('imports initial models, News/Briefing, Native and Coach from one compiled package', () => {
  expect(packagedModels.AgentModelsOverviewSchema.parse(overview)).toEqual(overview);
  expect(capability.NewsBriefingCommandSchema.parse(newsCommand)).toEqual(newsCommand);
  expect(capability.CapabilityOrdinaryStructuredCodecs['agent-elevenlabs.nativeConfig']).toBe(capability.ElevenLabsNativeConfigSchema);
  expect(capability.CapabilityOrdinaryValueSchema.parse(nativeConfig)).toEqual(nativeConfig);
  expect(http.ElevenLabsNativeBindingReadRequestSchema.parse({ requestId: 'composition-read', scope: { ...scope, userId: 'person-a' }, ref: { kind: 'binding', bindingId: 'binding-a' } }).ref.kind).toBe('binding');
  expect(http.CoachBrowserRequestSchema.parse({ action: 'open', requestId: 'composition-open', programRef: 'program-a', channel: 'native' }).action).toBe('open');
  expect(http.newsBriefingSettingsGetContract.authType).toBe('secret');
  expect(http.coachBrowserContract.authType).toBe('forge_session');
});

it.each([['source', models], ['package', packagedModels]] as const)('%s keeps initial observations read-only with C and F present', (_name, api) => {
  expect(api.AgentModelsOverviewSchema.safeParse(overview).success).toBe(true);
  expect(api.AgentModelsOverviewSchema.safeParse({ ...overview, rows: [{ ...initialRow, editability: 'editable', reason: null }] }).success).toBe(false);
  expect(api.AgentModelsOverviewSchema.safeParse({ ...overview, rows: [{ ...initialRow, editability: 'editable' }] }).success).toBe(false);
  expect(api.AgentModelsBatchRequestSchema.safeParse({ ...batch, agents: [{ ...batch.agents[0], expectedVersion: 0 }] }).success).toBe(false);
  expect(api.validateAgentModelsBatch(batch, overview, [], new Date(overview.observedAt))).toContain('slot-readonly');
});

it('retains all eighteen base dispatch actions and the five C additions', () => {
  const base = ['scheduler_voice_call', 'scheduler_telegram_text', 'scheduler_telegram_voice', 'scheduler_briefing_generate',
    'research_execute', 'glasses_session_admit', 'websocket_session_admit', 'voice_web_session_admit',
    'voice_calendar_week', 'voice_calendar_create', 'voice_calendar_update', 'voice_calendar_delete', 'voice_email_send',
    'voice_contacts_search', 'voice_schedule_create', 'security_light_on_group', 'security_light_on', 'security_come_home'];
  const additions = ['news_digest', 'news_digest_topic', 'calendar_today', 'calendar_week', 'lab_execute'];
  expect(Object.keys(http.INTERNAL_AGENT_EXECUTIONS).sort()).toEqual([...base, ...additions].sort());
  expect(http.INTERNAL_AGENT_EXECUTIONS.scheduler_briefing_generate.settingKeys).toEqual(['TTS_PROVIDER', 'ELEVENLABS_MODEL_ID']);
  expect(http.InternalAgentToolDispatchRequestSchema.safeParse({ requestId: 'composition-news-dispatch', identity: scope,
    execution: 'news_digest', input: { feeds: [{ url: 'https://example.org/feed', category: 'science', weight: 2 }], promptStyle: 'technical' } }).success).toBe(true);
});

it('retains C Master scope and F authenticated native/browser boundaries together', () => {
  const source = { tenantId: scope.tenantId, ownerId: 'foreign', masterId: 'master-a', version: 1 };
  expect(capability.NewsBriefingCommandSchema.safeParse({ ...newsCommand, changes: [{ type: 'parameter.refresh-master', key: 'hoursBack', source }] }).success).toBe(false);
  expect(capability.CapabilityOrdinaryValueSchema.safeParse({ ...nativeConfig, platform_settings: { auth: { ...nativeConfig.platform_settings.auth, enable_auth: false } } }).success).toBe(false);
  expect(http.CoachBrowserRequestSchema.safeParse({ action: 'open', requestId: 'composition-open', programRef: 'program-a', channel: 'native', scope }).success).toBe(false);
});
