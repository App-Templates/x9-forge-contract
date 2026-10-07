const test = require('node:test');
const assert = require('node:assert/strict');
const a = require('@x9-forge/contracts/agent');
const h = require('@x9-forge/contracts/http');
const caps = [{ name: 'calendar', enabled: true }, { name: 'voice', enabled: false }];
const row = { agentId: 'synthetic-agent', displayName: 'Synthetic', ownerId: 'synthetic-owner' };
const channel = { channelId: 'synthetic-channel', kind: 'telegram', state: 'loaded', loaded: true, readiness: 'unknown' };
const source = { authority: 'x9', availability: 'available', completeness: 'complete', observedAt: '2026-10-07T12:00:00Z' };
function parse(schema, input) { assert.equal(typeof schema?.safeParse, 'function'); return schema.safeParse(input); }
function preserves(schema, value) { const p = parse(schema, value); assert.equal(p.success, true); assert.deepEqual(p.data, value); }
function capsOf(input) { assert.equal(typeof a.agentCapabilitiesOf, 'function'); return a.agentCapabilitiesOf(input); }
function tgOf(input) { assert.equal(typeof a.telegramChannelMetadataOf, 'function'); return a.telegramChannelMetadataOf(input); }
function selected(input, id = row.agentId) { assert.equal(typeof h.getListAgentsCapabilities, 'function'); return h.getListAgentsCapabilities(input, id); }
test('metadata consumer resolves installed CJS archive', () => assert.match(require.resolve('@x9-forge/contracts/http'), /b139-consumer\/node_modules\/@x9-forge\/contracts\/dist\/http\/index\.cjs$/));
test('metadata schema and helpers are public', () => { assert.equal(typeof a.AgentInventoryCapabilitySchema?.safeParse, 'function'); assert.equal(typeof a.AgentInventoryCapabilitiesSchema?.safeParse, 'function'); assert.equal(typeof a.agentCapabilitiesOf, 'function'); assert.equal(typeof a.telegramChannelMetadataOf, 'function'); assert.equal(typeof h.getListAgentsCapabilities, 'function'); });
for (const capabilities of [caps, [], null]) test('inventory retains observed registry ' + JSON.stringify(capabilities), () => preserves(h.ListAgentsAgentSchema, { ...row, capabilities }));
test('inventory metadata absence is legacy', () => preserves(h.ListAgentsAgentSchema, row));
const invalid = [true, 'calendar', {}, [null], [{ enabled: true }], [{ name: 'calendar' }], [{ name: '', enabled: true }], [{ name: 2, enabled: true }], [{ name: 'calendar', enabled: 'true' }], [{ name: 'calendar', enabled: true, token: 'synthetic-placeholder' }], [{ name: 'calendar', enabled: true, url: 'https://example.invalid' }]];
for (const [i, capabilities] of invalid.entries()) test('compiled registry rejects invalid ' + i, () => { assert.equal(parse(h.ListAgentsAgentSchema, { ...row, capabilities }).success, false); assert.equal(capsOf({ capabilities }), null); });
test('compiled registry selector distinguishes empty from unknown', () => { assert.deepEqual(capsOf({ capabilities: [] }), []); assert.equal(capsOf({}), null); assert.equal(capsOf({ capabilities: null }), null); assert.equal(capsOf({ registry: caps }), null); assert.equal(capsOf(null), null); });
test('compiled registry selector reads current exact enabled metadata', () => { assert.deepEqual(capsOf({ capabilities: caps }), caps); assert.deepEqual(capsOf({ capabilities: [{ name: 'other', enabled: false }] }), [{ name: 'other', enabled: false }]); });
for (const fields of [{ botUsername: 'synthetic_bot' }, { allowFromCount: 0 }, { botUsername: '', allowFromCount: 2 }]) test('compiled Telegram retains observation ' + JSON.stringify(fields), () => { preserves(a.AgentRuntimeChannelSchema, { ...channel, ...fields }); assert.deepEqual(tgOf({ ...channel, ...fields, allowFrom: ['synthetic-id'] }), fields); });
for (const [i, allowFromCount] of [-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '2', null].entries()) test('compiled Telegram rejects count ' + i, () => { assert.equal(parse(a.AgentRuntimeChannelSchema, { ...channel, allowFromCount }).success, false); assert.equal(tgOf({ ...channel, allowFromCount }), null); });
test('compiled Telegram rejects non-string bot username', () => assert.equal(parse(a.AgentRuntimeChannelSchema, { ...channel, botUsername: 3 }).success, false));
test('compiled Telegram metadata only applies to Telegram', () => { for (const kind of ['email', 'voice', 'web']) for (const fields of [{ botUsername: 'synthetic_bot' }, { allowFromCount: 2 }]) assert.equal(parse(a.AgentRuntimeChannelSchema, { ...channel, kind, ...fields }).success, false); });
test('compiled Telegram selector never infers missing metadata', () => { assert.equal(tgOf(channel), null); assert.equal(tgOf({ botUsername: 'synthetic_bot' }), null); assert.equal(tgOf({ ...channel, loaded: false, botUsername: 'synthetic_bot' }), null); });
test('compiled Telegram preserves observed zero while paused', () => preserves(a.AgentRuntimeChannelSchema, { ...channel, state: 'paused', loaded: false, allowFromCount: 0 }));
test('compiled metadata survives actual inventory runtime nesting', () => preserves(h.ListAgentsAgentSchema, { ...row, runtime: { loadState: 'loaded', channelsComplete: true, state: 'active', channels: [{ ...channel, botUsername: 'synthetic_bot', allowFromCount: 0 }] } }));
test('compiled source selection accepts exact runtime and management identities', () => { const response = { source, agents: [{ ...row, capabilities: caps, identity: { managementAgentId: '101', runtimeAgentId: row.agentId } }] }; assert.deepEqual(selected(response), caps); assert.deepEqual(selected(response, '101'), caps); assert.equal(selected(response, row.displayName), null); assert.equal(selected(response, row.ownerId), null); assert.equal(selected(response, 'missing'), null); });
for (const availability of ['unavailable', 'unknown']) test('compiled selection refuses source ' + availability, () => assert.equal(selected({ source: { ...source, availability, completeness: 'unknown', observedAt: null }, agents: [{ ...row, capabilities: caps }] }), null));
test('compiled selection refuses missing or invalid source', () => { assert.equal(selected({ agents: [{ ...row, capabilities: caps }] }), null); assert.equal(selected({ source: { ...source, observedAt: null }, agents: [{ ...row, capabilities: caps }] }), null); });
test('compiled selection preserves unknown without other-agent fallback', () => assert.equal(selected({ source, agents: [{ ...row, capabilities: null }, { ...row, agentId: 'other', capabilities: caps }] }), null));
