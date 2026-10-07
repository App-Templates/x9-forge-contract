import { describe, expect, it } from 'vitest';
import * as agent from '../../src/agent/index.js';
import * as http from '../../src/http/endpoints/internal-agents-list.js';
import type { ZodType } from 'zod';

const row = { agentId: 'synthetic-agent', displayName: 'Synthetic', ownerId: 'synthetic-owner' };
const caps = [{ name: 'calendar', enabled: true }, { name: 'voice', enabled: false }];
const channel = { channelId: 'synthetic-telegram', kind: 'telegram', state: 'loaded', loaded: true, readiness: 'unknown' };
const source = { authority: 'x9', availability: 'available', completeness: 'complete', observedAt: '2026-10-07T12:00:00Z' };
const envelope = { agents: [{ ...row, capabilities: caps }], source };
function schema(name: string): ZodType { const value = Reflect.get(agent, name); expect(typeof value?.safeParse).toBe('function'); return value; }
function helper(name: string, input: unknown): unknown { const value = Reflect.get(agent, name); expect(typeof value).toBe('function'); return value(input); }
function selected(input: unknown, id = row.agentId): unknown { const value = Reflect.get(http, 'getListAgentsCapabilities'); expect(typeof value).toBe('function'); return value(input, id); }
function preserves(s: ZodType, input: unknown): void { const result = s.safeParse(input); expect(result.success).toBe(true); if (result.success) expect(result.data).toEqual(input); }

const invalidCaps: [string, unknown][] = [
  ['string', 'calendar'], ['object', { name: 'calendar', enabled: true }], ['number', 1], ['bool', false],
  ['null entry', [null]], ['array entry', [[]]], ['missing name', [{ enabled: true }]], ['missing enabled', [{ name: 'calendar' }]],
  ['empty name', [{ name: '', enabled: true }]], ['number name', [{ name: 4, enabled: true }]], ['null name', [{ name: null, enabled: true }]],
  ['string enabled', [{ name: 'calendar', enabled: 'true' }]], ['number enabled', [{ name: 'calendar', enabled: 1 }]], ['null enabled', [{ name: 'calendar', enabled: null }]],
  ['URL', [{ name: 'calendar', enabled: true, url: 'https://example.invalid' }]], ['host', [{ name: 'calendar', enabled: true, host: 'synthetic-host' }]],
  ['token', [{ name: 'calendar', enabled: true, token: 'synthetic-placeholder' }]], ['mixed validity', [caps[0], { name: 'voice', enabled: 'false' }]],
];
describe('inventory capability metadata', () => {
  it('preserves legacy row without metadata', () => preserves(http.ListAgentsAgentSchema, row));
  it.each([caps, [], null])('preserves explicit observation %#', capabilities => preserves(http.ListAgentsAgentSchema, { ...row, capabilities }));
  it('exports a strict canonical capability schema using registry fields', () => preserves(schema('AgentInventoryCapabilitySchema'), caps[0]));
  it.each(invalidCaps)('rejects malformed capability metadata %s', (_label, capabilities) => expect(http.ListAgentsAgentSchema.safeParse({ ...row, capabilities }).success).toBe(false));
  it.each(invalidCaps)('selector returns unknown for invalid %s', (_label, capabilities) => expect(helper('agentCapabilitiesOf', { ...row, capabilities })).toBeNull());
  it.each([undefined, null, 3, 'row', false, [], {}, { capabilities: null }, { registry: caps }, { runtime: { capabilities: caps } }, { agents: [{ ...row, capabilities: caps }] }])('has no fallback %#', input => expect(helper('agentCapabilitiesOf', input)).toBeNull());
  it('distinguishes known empty from missing and explicit unknown', () => { expect(helper('agentCapabilitiesOf', { capabilities: [] })).toEqual([]); expect(helper('agentCapabilitiesOf', row)).toBeNull(); expect(helper('agentCapabilitiesOf', { capabilities: null })).toBeNull(); });
  it('reads exact current values without hardcoding or inferring enabled', () => { expect(helper('agentCapabilitiesOf', { capabilities: caps })).toEqual(caps); expect(helper('agentCapabilitiesOf', { capabilities: [{ name: 'new-cap', enabled: false }] })).toEqual([{ name: 'new-cap', enabled: false }]); });
});
const invalidCounts: [string, unknown][] = [['negative', -1], ['fraction', 0.5], ['unsafe', Number.MAX_SAFE_INTEGER + 1], ['string', '2'], ['null', null], ['NaN', NaN], ['Infinity', Infinity], ['object', {}]];
const invalidNames: [string, unknown][] = [['number', 2], ['null', null], ['boolean', false], ['object', {}], ['array', []]];
describe('Telegram observed metadata on canonical channels', () => {
  it('retains legacy channels', () => preserves(agent.AgentRuntimeChannelSchema, channel));
  it.each([{ botUsername: 'synthetic_bot' }, { allowFromCount: 0 }, { botUsername: 'SyntheticBot', allowFromCount: 2 }, { botUsername: 'second_bot', allowFromCount: Number.MAX_SAFE_INTEGER }])('retains optional metadata %#', fields => preserves(agent.AgentRuntimeChannelSchema, { ...channel, ...fields }));
  it('does not equate metadata presence to readiness', () => preserves(agent.AgentRuntimeChannelSchema, { ...channel, state: 'paused', loaded: false, botUsername: 'synthetic_bot', allowFromCount: 0 }));
  it.each(invalidCounts)('rejects invalid authorization count %s', (_label, allowFromCount) => expect(agent.AgentRuntimeChannelSchema.safeParse({ ...channel, allowFromCount }).success).toBe(false));
  it.each(invalidNames)('rejects invalid username %s', (_label, botUsername) => expect(agent.AgentRuntimeChannelSchema.safeParse({ ...channel, botUsername }).success).toBe(false));
  it.each(['email', 'voice', 'web'])('rejects Telegram fields on %s', kind => { for (const fields of [{ botUsername: 'synthetic_bot' }, { allowFromCount: 2 }, { botUsername: 'synthetic_bot', allowFromCount: 2 }]) expect(agent.AgentRuntimeChannelSchema.safeParse({ ...channel, kind, ...fields }).success).toBe(false); });
  it.each(['email', 'voice', 'web'])('retains other legacy %s channel', kind => preserves(agent.AgentRuntimeChannelSchema, { ...channel, kind }));
  it('projects only username/count, never channel state or authorization IDs', () => expect(helper('telegramChannelMetadataOf', { ...channel, botUsername: 'synthetic_bot', allowFromCount: 2, allowFrom: ['synthetic-id'] })).toEqual({ botUsername: 'synthetic_bot', allowFromCount: 2 }));
  it.each([{ botUsername: 'synthetic_bot' }, { allowFromCount: 0 }])('keeps missing fields absent %#', fields => expect(helper('telegramChannelMetadataOf', { ...channel, ...fields })).toEqual(fields));
  it.each([undefined, null, 2, 'channel', [], {}, channel, { botUsername: 'synthetic_bot' }, { ...channel, kind: 'email' }, { ...channel, loaded: false, botUsername: 'synthetic_bot' }])('does not invent Telegram evidence %#', input => expect(helper('telegramChannelMetadataOf', input)).toBeNull());
  it.each(invalidCounts)('selector rejects count %s', (_label, allowFromCount) => expect(helper('telegramChannelMetadataOf', { ...channel, allowFromCount })).toBeNull());
  it.each(invalidNames)('selector rejects username %s', (_label, botUsername) => expect(helper('telegramChannelMetadataOf', { ...channel, botUsername })).toBeNull());
  it('retains metadata in the actual inventory runtime snapshot', () => preserves(http.ListAgentsAgentSchema, { ...row, runtime: { loadState: 'loaded', channelsComplete: true, state: 'active', channels: [{ ...channel, botUsername: 'synthetic_bot', allowFromCount: 0 }] } }));
});
describe('source-aware inventory capability selection', () => {
  it('reads exact runtime ID from an available source', () => expect(selected(envelope)).toEqual(caps));
  it('reads explicit management identity', () => expect(selected({ ...envelope, agents: [{ ...envelope.agents[0], identity: { managementAgentId: '101', runtimeAgentId: row.agentId } }] }, '101')).toEqual(caps));
  it('distinguishes an observed empty registry', () => expect(selected({ ...envelope, agents: [{ ...row, capabilities: [] }] })).toEqual([]));
  it.each(['unknown', 'unavailable'])('refuses non-current source %s', availability => expect(selected({ ...envelope, source: { ...source, availability, completeness: 'unknown', observedAt: null } })).toBeNull());
  it.each([undefined, null, {}, { ...source, observedAt: null }])('refuses missing/invalid source %#', current => expect(selected({ ...envelope, source: current })).toBeNull());
  it('returns unknown for missing exact agent', () => expect(selected(envelope, 'other-agent')).toBeNull());
  it('never resolves a displayName or ownerId as identity', () => { expect(selected(envelope, row.displayName)).toBeNull(); expect(selected(envelope, row.ownerId)).toBeNull(); });
  it.each([undefined, null, [], {}, { ...envelope, agents: [{ ...row, capabilities: invalidCaps[14]?.[1] }] }])('returns unknown for invalid envelope %#', input => expect(selected(input)).toBeNull());
  it.each([undefined, null])('does not fill missing metadata %#', capabilities => expect(selected({ ...envelope, agents: [{ ...row, capabilities }] })).toBeNull());
  it('does not use capabilities of a different agent', () => expect(selected({ ...envelope, agents: [{ ...row, capabilities: null }, { ...row, agentId: 'other-agent', capabilities: caps }] })).toBeNull());
  it('keeps available partial inventory evidence local to the exact row', () => expect(selected({ ...envelope, source: { ...source, completeness: 'partial' } })).toEqual(caps));
});
