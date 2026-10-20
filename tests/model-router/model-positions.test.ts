import { describe, expect, it } from 'vitest';
import {
  AgentModelCustomPositionsSchema, AgentModelSlotPositionsSchema, AgentModelSlotChangeSchema, AgentModelsOverviewSchema,
  agentModelsNextBinding, agentModelsResetSelection, canonicalModelPositions, changedModelPositions, followsMasterModelPositions,
  isAgentModelsBatchPreviewCurrent, mergeMasterModelPositions, remainingCustomPositions, type CapabilityModelSettings,
} from '../../src/model-router/index.js';

// Stefano 20/10 18:45: a row stops following the Master only when changed by hand; the other rows keep following it.
const now = new Date('2026-10-20T19:00:00Z');
const model = (modelId: string) => ({ provider: 'openai', modelId, protocol: 'responses', adapterId: 'openai-responses' });
const base = { capability: 'agent-core', function: 'reasoning', catalogVersion: 'catalog-1', requirements: { tools: true, stream: true, structuredOutput: false } } as const;
const automatic = (standard: string, advanced: string, reasoning: string, fallback: string): CapabilityModelSettings =>
  ({ ...base, mode: 'automatic', tiers: { standard: model(standard), advanced: model(advanced), reasoning: model(reasoning) }, fallback: model(fallback) });
const pinned = (id: string): CapabilityModelSettings => ({ ...base, mode: 'pin', pin: model(id), tiers: { standard: model(id), advanced: model(id), reasoning: model(id) }, fallback: model(id) });
const single = (id: string): CapabilityModelSettings => ({ capability: 'voice', function: 'speech', catalogVersion: 'catalog-1', requirements: { tools: false, stream: true, structuredOutput: false }, mode: 'single', descriptor: model(id) });

describe('custom positions', () => {
  it('are unique, non-empty and in canonical order', () => {
    expect(AgentModelCustomPositionsSchema.safeParse(['reasoning']).success).toBe(true);
    expect(AgentModelCustomPositionsSchema.safeParse(['standard', 'reasoning', 'fallback']).success).toBe(true);
    expect(AgentModelCustomPositionsSchema.safeParse([]).success).toBe(false);
    expect(AgentModelCustomPositionsSchema.safeParse(['reasoning', 'standard']).success).toBe(false);
    expect(AgentModelCustomPositionsSchema.safeParse(['reasoning', 'reasoning']).success).toBe(false);
    expect(AgentModelCustomPositionsSchema.safeParse(['primary']).success).toBe(false);
    expect(canonicalModelPositions(['fallback', 'standard', 'fallback'])).toEqual(['standard', 'fallback']);
  });
  it('a record saved before per-row inheritance ({}) and a per-seat record parse', () => {
    expect(AgentModelSlotPositionsSchema.parse({})).toEqual({});
    expect(AgentModelSlotPositionsSchema.parse({ agent_chat: ['reasoning'] })).toEqual({ agent_chat: ['reasoning'] });
    expect(AgentModelSlotPositionsSchema.safeParse({ agent_chat: [] }).success).toBe(false);
  });
});

describe('changed rows', () => {
  it('names only the rows whose model changed', () => {
    expect(changedModelPositions(automatic('sol', 'sol', 'sol', 'luna'), automatic('sol', 'sol', 'astra', 'luna'))).toEqual(['reasoning']);
    expect(changedModelPositions(pinned('sol'), automatic('sol', 'sol', 'astra', 'sol'))).toEqual(['reasoning']);
    expect(changedModelPositions(automatic('a', 'b', 'c', 'd'), automatic('a', 'b', 'c', 'd'))).toEqual([]);
  });
  it('a single-model seat is one row: no positions', () => {
    expect(changedModelPositions(single('voce-1'), single('voce-2'))).toBeNull();
  });
});

describe('merge with the Master', () => {
  it('without custom rows the seat is the Master selection', () => {
    const master = automatic('nuovo', 'nuovo', 'nuovo', 'riserva');
    expect(mergeMasterModelPositions(master, automatic('a', 'b', 'astra', 'd'), [])).toBe(master);
  });
  it('a Master change reaches the rows that follow it and never the custom row', () => {
    const merged = mergeMasterModelPositions(automatic('nuovo', 'nuovo', 'nuovo', 'riserva'), automatic('sol', 'sol', 'astra', 'luna'), ['reasoning']);
    expect(merged).toEqual(automatic('nuovo', 'nuovo', 'astra', 'riserva'));
  });
  it('a pinned Master stays pinned only while every row has one model', () => {
    expect(mergeMasterModelPositions(pinned('sol'), automatic('sol', 'sol', 'astra', 'sol'), ['reasoning'])).toEqual(automatic('sol', 'sol', 'astra', 'sol'));
    expect(mergeMasterModelPositions(pinned('sol'), automatic('x', 'x', 'sol', 'x'), ['reasoning'])).toEqual(pinned('sol'));
  });
  it('keeps the Master catalog version and requirements', () => {
    const master = { ...automatic('n', 'n', 'n', 'n'), catalogVersion: 'catalog-9' } as CapabilityModelSettings;
    expect(mergeMasterModelPositions(master, automatic('s', 's', 'astra', 's'), ['reasoning']).catalogVersion).toBe('catalog-9');
  });
  it('a seat that is not tiered keeps its own selection', () => {
    expect(mergeMasterModelPositions(single('master'), single('own'), ['reasoning'])).toEqual(single('own'));
  });
});

describe('follows the Master on the rows that are not custom', () => {
  it('ignores the custom rows, the mode and the catalog version', () => {
    expect(followsMasterModelPositions(automatic('sol', 'sol', 'astra', 'sol'), pinned('sol'), ['reasoning'])).toBe(true);
    expect(followsMasterModelPositions({ ...automatic('sol', 'sol', 'sol', 'sol'), catalogVersion: 'other' } as CapabilityModelSettings, automatic('sol', 'sol', 'sol', 'sol'), [])).toBe(true);
  });
  it('refuses a non-custom row that differs from the Master', () => {
    expect(followsMasterModelPositions(automatic('vecchio', 'sol', 'astra', 'sol'), pinned('sol'), ['reasoning'])).toBe(false);
    expect(followsMasterModelPositions(automatic('sol', 'sol', 'astra', 'sol'), pinned('sol'), [])).toBe(false);
  });
  it('key order never decides', () => {
    const own = automatic('a', 'b', 'c', 'd'); const reordered = JSON.parse(JSON.stringify({ fallback: (own as { fallback: unknown }).fallback, ...own })) as CapabilityModelSettings;
    expect(followsMasterModelPositions(reordered, own, [])).toBe(true);
  });
});

describe('Risincronizza a row', () => {
  it('only that row goes back to the Master', () => {
    expect(remainingCustomPositions(['advanced', 'reasoning'], ['reasoning'])).toEqual(['advanced']);
    expect(remainingCustomPositions(['reasoning'], undefined)).toEqual([]);
  });
  it('on a seat saved custom as a whole, the other rows stay custom (nothing changes without a gesture)', () => {
    expect(remainingCustomPositions(null, ['reasoning'])).toEqual(['standard', 'advanced', 'fallback']);
  });
  it('the change carries its rows', () => {
    expect(AgentModelSlotChangeSchema.safeParse({ action: 'reset-master', slotId: 'agent_chat', positions: ['reasoning'] }).success).toBe(true);
    expect(AgentModelSlotChangeSchema.safeParse({ action: 'reset-master', slotId: 'agent_chat' }).success).toBe(true);
    expect(AgentModelSlotChangeSchema.safeParse({ action: 'reset-master', slotId: 'agent_chat', positions: [] }).success).toBe(false);
  });
  it('the reset selection keeps the other custom rows', () => {
    const master = automatic('nuovo', 'nuovo', 'nuovo', 'riserva'), saved = automatic('sol', 'mio', 'astra', 'luna');
    expect(agentModelsResetSelection({ origin: 'master', customPositions: ['advanced', 'reasoning'], default: master, saved }, ['reasoning'])).toEqual(automatic('nuovo', 'mio', 'nuovo', 'riserva'));
    expect(agentModelsResetSelection({ origin: 'master', customPositions: ['reasoning'], default: master, saved }, ['reasoning'])).toBe(master);
    expect(agentModelsResetSelection({ origin: 'custom', default: master, saved }, undefined)).toBe(master);
  });
});

describe('overview row', () => {
  const identity = { managementAgentId: 'agent-42', runtimeAgentId: 'runtime-42', vaultAgentId: 42 };
  const row = (extra: Record<string, unknown>) => ({ identity, ownerId: 'owner-42', slotId: 'agent_chat', capability: 'agent-core', function: 'reasoning', channelId: null, installation: 'installed', editability: 'editable', reason: null, origin: 'master', masterAgentId: 'master-1', masterConfigVersion: 2, requirements: base.requirements, default: pinned('sol'), saved: automatic('sol', 'sol', 'astra', 'sol'), applied: null, versions: { desired: 3, applied: null, failed: null }, catalogVersion: 'catalog-1', cost: { state: 'unknown', reason: 'No attested price' }, embedding: null, ...extra });
  const overview = (extra: Record<string, unknown>) => ({ version: 'overview-1', observedAt: now.toISOString(), rows: [row(extra)] });
  it('a Master-bound seat names its custom rows; absent means every row follows', () => {
    expect(AgentModelsOverviewSchema.safeParse(overview({ customPositions: ['reasoning'] })).success).toBe(true);
    expect(AgentModelsOverviewSchema.safeParse(overview({})).success).toBe(true);
  });
  it('custom rows never belong to a seat that does not follow the Master', () => {
    expect(AgentModelsOverviewSchema.safeParse(overview({ origin: 'custom', customPositions: ['reasoning'] })).success).toBe(false);
  });
  it('a reset preview of one row is current only with the other custom rows kept', () => {
    const custom = overview({ customPositions: ['advanced', 'reasoning'], saved: automatic('sol', 'mio', 'astra', 'sol') });
    const changes = { requestId: 'batch-request-42', overviewVersion: 'overview-1', agents: [{ identity, expectedVersion: 3, changes: [{ action: 'reset-master', slotId: 'agent_chat', positions: ['reasoning'] }] }] };
    const preview = (settings: CapabilityModelSettings) => ({ previewId: 'preview-0042', request: changes, expiresAt: new Date(now.getTime() + 60_000).toISOString(), agents: [{ identity, expectedVersion: 3, next: { schemaVersion: 1, identity, configVersion: 4, selections: [{ slotId: 'agent_chat', settings }] }, impact: ['Torna al Master: agent_chat'] }] });
    const request = { ...changes, previewId: 'preview-0042' };
    expect(isAgentModelsBatchPreviewCurrent(request, preview(automatic('sol', 'mio', 'sol', 'sol')), custom, now)).toBe(true);
    expect(isAgentModelsBatchPreviewCurrent(request, preview(pinned('sol')), custom, now)).toBe(false);
  });
});

describe('binding after a gesture', () => {
  const master = pinned('sol');
  const synced = { origin: 'master' as const, default: master, saved: master };
  it('a new agent follows the Master on every row; a Master change never makes a row custom', () => {
    expect(agentModelsNextBinding(synced, undefined)).toEqual({ origin: 'master' });
    expect(agentModelsNextBinding(synced, { action: 'reset-master', slotId: 'agent_chat', positions: ['standard', 'advanced', 'reasoning', 'fallback'] })).toEqual({ origin: 'master' });
  });
  it('changing one row by hand makes only that row custom', () => {
    expect(agentModelsNextBinding(synced, { action: 'set', slotId: 'agent_chat', settings: automatic('sol', 'sol', 'astra', 'sol') })).toEqual({ origin: 'master', customPositions: ['reasoning'] });
  });
  it('a second row adds to the first; the same model again changes nothing', () => {
    const custom = { ...synced, customPositions: ['reasoning' as const], saved: automatic('sol', 'sol', 'astra', 'sol') };
    expect(agentModelsNextBinding(custom, { action: 'set', slotId: 'agent_chat', settings: automatic('luna', 'sol', 'astra', 'sol') })).toEqual({ origin: 'master', customPositions: ['standard', 'reasoning'] });
    expect(agentModelsNextBinding(custom, { action: 'set', slotId: 'agent_chat', settings: automatic('sol', 'sol', 'astra', 'sol') })).toEqual({ origin: 'master', customPositions: ['reasoning'] });
  });
  it('Risincronizza a row gives back only that row', () => {
    const custom = { ...synced, customPositions: ['standard' as const, 'reasoning' as const], saved: automatic('luna', 'sol', 'astra', 'sol') };
    expect(agentModelsNextBinding(custom, { action: 'reset-master', slotId: 'agent_chat', positions: ['reasoning'] })).toEqual({ origin: 'master', customPositions: ['standard'] });
    expect(agentModelsNextBinding(custom, { action: 'reset-master', slotId: 'agent_chat' })).toEqual({ origin: 'master' });
  });
  it('a seat saved custom as a whole stays custom until a gesture, and a row reset keeps the others custom', () => {
    const legacy = { origin: 'custom' as const, default: master, saved: automatic('a', 'b', 'c', 'd') };
    expect(agentModelsNextBinding(legacy, undefined)).toEqual({ origin: 'custom' });
    expect(agentModelsNextBinding(legacy, { action: 'set', slotId: 'agent_chat', settings: automatic('a', 'b', 'x', 'd') })).toEqual({ origin: 'custom' });
    expect(agentModelsNextBinding(legacy, { action: 'reset-master', slotId: 'agent_chat', positions: ['reasoning'] })).toEqual({ origin: 'master', customPositions: ['standard', 'advanced', 'fallback'] });
  });
  it('a single-model seat is one row', () => {
    const voice = { origin: 'master' as const, default: single('voce-1'), saved: single('voce-1') };
    expect(agentModelsNextBinding(voice, { action: 'set', slotId: 'voice_live', settings: single('voce-2') })).toEqual({ origin: 'custom' });
    expect(agentModelsNextBinding({ ...voice, origin: 'custom' }, { action: 'reset-master', slotId: 'voice_live', positions: ['reasoning'] })).toEqual({ origin: 'master' });
  });
});
