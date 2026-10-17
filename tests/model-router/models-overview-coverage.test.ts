import { describe, expect, it } from 'vitest';
import { AgentModelsOverviewSchema, AgentModelOverviewRowSchema, validateAgentModelsBatch } from '../../src/model-router/models-batch.js';
import { AgentModelBindingSchema } from '../../src/model-router/agent-model-configuration.js';
import { isAgentModelsOverviewWithinAccess } from '../../src/http/endpoints/forge-models.js';

const now = new Date('2026-10-09T13:00:00Z');
const identity = { managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a', vaultAgentId: 41 };
const other = { managementAgentId: 'agent-b', runtimeAgentId: 'runtime-b', vaultAgentId: 42 };
const descriptor = { provider: 'openai', modelId: 'synthetic-model', protocol: 'responses', adapterId: 'synthetic-adapter' };
const requirements = { tools: true, stream: true, structuredOutput: false };
const settings = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'catalog-1', requirements, mode: 'pin', pin: descriptor, tiers: { standard: descriptor, advanced: descriptor, reasoning: descriptor }, fallback: descriptor };
const row = () => ({ identity: { ...identity }, ownerId: 'owner-a', slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning', channelId: null, installation: 'installed', editability: 'editable', reason: null, origin: 'custom', masterAgentId: null, masterConfigVersion: null, requirements, default: null, saved: settings, applied: null, versions: { desired: 3, applied: null, failed: null }, catalogVersion: 'catalog-1', cost: { state: 'unknown', reason: 'No observed price' }, embedding: null });
const coverage = (status = 'complete') => ({ identity: { ...identity }, ownerId: 'owner-a', status, missingSlots: [] as string[], reason: status === 'complete' ? null : 'Source incomplete' });
const overview = () => ({ version: 'overview-1', observedAt: now.toISOString(), rows: [row()], coverage: [coverage()] });
const unknownRow = () => ({ ...row(), origin: 'unknown', editability: 'readonly', reason: 'Provenance unavailable' });
const request = { requestId: 'request-0001', overviewVersion: 'overview-1', agents: [{ identity, expectedVersion: 3, changes: [{ action: 'set', slotId: 'agent_chat', settings }] }] };
const catalog = { agentId: 'agent-a', version: 'catalog-1', sourceVersion: 'source-1', source: 'provider-api', observedAt: now.toISOString(), validUntil: '2026-10-09T13:01:00Z', state: 'available', entries: [{ ...descriptor, function: 'reasoning', label: 'Synthetic', access: 'available', runtimeSupport: 'supported', features: { tools: true, stream: true, structuredOutput: true } }] };

describe('read overview coverage', () => {
  it('keeps old responses valid without inventing coverage', () => { const { coverage: _coverage, ...legacy } = overview(); const parsed = AgentModelsOverviewSchema.parse(legacy); expect(parsed).not.toHaveProperty('coverage'); });
  it('accepts complete data and attested zero separately', () => { expect(AgentModelsOverviewSchema.safeParse(overview()).success).toBe(true); expect(AgentModelsOverviewSchema.safeParse({ ...overview(), rows: [] }).success).toBe(true); });
  it.each(['partial', 'unavailable'])('represents %s without claiming zero', status => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [coverage(status)] }).success).toBe(true); });
  it('accepts unknown origin only in the read projection', () => { expect(AgentModelOverviewRowSchema.safeParse(unknownRow()).success).toBe(true); expect(AgentModelBindingSchema.safeParse({ slotId: 'agent_chat', origin: 'unknown', source: null }).success).toBe(false); });
  it.each([{ editability: 'editable', reason: null }, { masterAgentId: 'master-a' }, { masterConfigVersion: 2 }, { reason: '   ' }])('rejects unqualified unknown provenance %j', patch => { expect(AgentModelOverviewRowSchema.safeParse({ ...unknownRow(), ...patch }).success).toBe(false); });
  it('rejects non-public extra fields in coverage', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(), internalUrl: 'synthetic' }] }).success).toBe(false); });
  it.each(['partial', 'unavailable'])('rejects missing reason for %s', status => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(status), reason: null }] }).success).toBe(false); });
  it.each(['partial', 'unavailable'])('requires a meaningful reason for %s', status => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(status), reason: '  ' }] }).success).toBe(false); });
  it.each([{ missingSlots: ['news_digest'] }, { reason: 'Incomplete' }])('complete cannot carry incomplete evidence %j', patch => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(), ...patch }] }).success).toBe(false); });
  it('I01 rejects mismatching runtime in coverage at the same owner', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(), identity: { ...identity, runtimeAgentId: 'different' } }] }).success).toBe(false); });
  it('I02 rejects absent versus present vault identity', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(), identity: { managementAgentId: 'agent-a', runtimeAgentId: 'runtime-a' } }] }).success).toBe(false); });
  it('rejects mismatching coverage owner and duplicate logical agents', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage(), ownerId: 'owner-b' }] }).success).toBe(false); expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [coverage(), coverage()] }).success).toBe(false); });
  it('I03 rejects cross namespace collision involving coverage-only agents', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [coverage(), { ...coverage(), identity: { ...other, runtimeAgentId: 'agent-a' } }] }).success).toBe(false); });
  it('I03 rejects shared vault on distinct coverage-only agents', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), rows: [], coverage: [coverage(), { ...coverage(), identity: { ...other, vaultAgentId: 41 } }] }).success).toBe(false); });
  it('I03 rejects shared vault on distinct row-only agents', () => { const { coverage: _coverage, ...legacy } = overview(); expect(AgentModelsOverviewSchema.safeParse({ ...legacy, rows: [row(), { ...row(), identity: { ...other, vaultAgentId: 41 } }] }).success).toBe(false); });
  it('I04 rejects duplicate missing slots', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage('partial'), missingSlots: ['news_digest', 'news_digest'] }] }).success).toBe(false); });
  it('I04 rejects a slot both present and missing', () => { expect(AgentModelsOverviewSchema.safeParse({ ...overview(), coverage: [{ ...coverage('partial'), missingSlots: ['agent_chat'] }] }).success).toBe(false); });
  it('checks access for an owner present only in coverage', () => { const value = { ...overview(), rows: [], coverage: [{ ...coverage(), ownerId: 'owner-b' }] }; expect(isAgentModelsOverviewWithinAccess(value, { role: 'owner', ownerId: 'owner-a' })).toBe(false); expect(isAgentModelsOverviewWithinAccess(value, { role: 'sa' })).toBe(true); });
});

describe('writer coverage is scoped to the requested agents', () => {
  it.each(['partial', 'unavailable'])('W01/W02 permits A while unrelated B is %s', status => { const value = { ...overview(), coverage: [coverage(), { ...coverage(status), identity: other }] }; expect(validateAgentModelsBatch(request, value, [catalog], now)).toEqual([]); });
  it('W03 permits A while unrelated B is unknown and not installed', () => { const value = { ...overview(), rows: [row(), { ...unknownRow(), identity: other, installation: 'unknown' }], coverage: [coverage(), { ...coverage('partial'), identity: other }] }; expect(validateAgentModelsBatch(request, value, [catalog], now)).toEqual([]); });
  it.each(['partial', 'unavailable'])('W04 rejects requested A with %s coverage', status => { expect(validateAgentModelsBatch(request, { ...overview(), coverage: [coverage(status)] }, [catalog], now)).toContain('slot-unavailable'); });
  it('rejects requested unknown origin', () => { expect(validateAgentModelsBatch(request, { ...overview(), rows: [unknownRow()] }, [catalog], now)).toContain('slot-readonly'); });
  it('preserves existing writer validation for old producers', () => { const { coverage: _coverage, ...legacy } = overview(); expect(validateAgentModelsBatch(request, legacy, [catalog], now)).toEqual([]); });
  it('rejects globally malformed unrelated identity', () => { expect(validateAgentModelsBatch(request, { ...overview(), coverage: [coverage(), { ...coverage(), identity: { ...other, runtimeAgentId: 'agent-a' } }] }, [catalog], now)).toEqual(['invalid-overview']); });
});
