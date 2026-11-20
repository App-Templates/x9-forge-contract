import { describe, it, expect } from 'vitest';
import {
  AgentSpendDaySchema,
  ResearchAgentConfigSchema,
  ResearchCallerParamsSchema,
  ResearchRequestSchema,
  RicercaToolErrorSchema,
  SpendingCapabilitySchema,
  resolveResearchParams,
} from '../../../src/capability/ricerca/index';
import { ToolCallErrorResponseSchema } from '../../../src/capability/index';

const config = {
  agentId: 'samira',
  version: 1,
  objective: 'Diventare la cuoca più competente al mondo, studiando ogni giorno.',
  budget: { dailyUsd: 17, perResearchMaxUsd: 1.5, timezone: 'Europe/Rome' },
  models: { research: 'gpt-6.1-sol' },
  research: { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high' },
  sourceRule: 'opened_only',
} as const;

const day = {
  agentId: 'samira', capability: 'ricerca', day: '2026-11-04',
  spentUsd: 1, reservedUsd: 0, capUsd: 1, calls: 2, webCalls: 3,
  budgetStops: 0, budgetReachedAt: null, overrunAt: null,
};

const high = { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high', maxPerDossier: 7 } as const;
const low = { maxToolCalls: 5, searchContextSize: 'low', reasoningEffort: 'low' } as const;

describe('compatibility with data saved before (R-37)', () => {
  it('older requests still pass and gain no params key', () => {
    for (const req of [{ question: 'Che cos’è?', goal: 'capire', maxUsd: 0.3 }, { question: 'Che cos’è?' }]) {
      const r = ResearchRequestSchema.safeParse(req);
      expect(r.success).toBe(true);
      if (r.success) expect('params' in r.data).toBe(false);
    }
    expect(ResearchAgentConfigSchema.safeParse(config).success).toBe(true);
    for (const capability of ['ricerca', 'lab', 'video']) {
      expect(AgentSpendDaySchema.safeParse({ ...day, capability }).success).toBe(true);
    }
  });
});

describe('caller params in the request', () => {
  it('valid values pass', () => {
    const p = { maxToolCalls: 4, searchContextSize: 'medium', reasoningEffort: 'medium' };
    expect(ResearchRequestSchema.safeParse({ question: 'q', params: p }).success).toBe(true);
  });
  it('invalid values are refused', () => {
    for (const bad of [
      { maxToolCalls: 0 }, { maxToolCalls: 101 }, { maxToolCalls: 2.5 },
      { reasoningEffort: 'extreme' }, { extra: 1 },
    ]) {
      expect(ResearchCallerParamsSchema.safeParse(bad).success, JSON.stringify(bad)).toBe(false);
      expect(ResearchRequestSchema.safeParse({ question: 'q', params: bad }).success).toBe(false);
    }
  });
});

describe('resolveResearchParams', () => {
  it('takes agent values where the request is silent', () => {
    expect(resolveResearchParams(high, { maxToolCalls: 4, reasoningEffort: 'medium' })).toEqual({
      ok: true,
      params: { maxToolCalls: 4, searchContextSize: 'high', reasoningEffort: 'medium', maxPerDossier: 7 },
    });
  });
  it('absent or empty request gives the agent values', () => {
    expect(resolveResearchParams(high)).toEqual({ ok: true, params: high });
    expect(resolveResearchParams(high, {})).toEqual({ ok: true, params: high });
  });
  it('a value equal to the maximum is fine', () => {
    expect(resolveResearchParams(high, { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high' }).ok).toBe(true);
  });
  it('refuses above the agent maximum', () => {
    expect(resolveResearchParams(high, { maxToolCalls: 31 })).toEqual({ ok: false, above: ['maxToolCalls'] });
    expect(resolveResearchParams(low, { searchContextSize: 'high' })).toEqual({ ok: false, above: ['searchContextSize'] });
    expect(resolveResearchParams(low, { reasoningEffort: 'medium' })).toEqual({ ok: false, above: ['reasoningEffort'] });
    expect(resolveResearchParams(low, { reasoningEffort: 'high', maxToolCalls: 6 })).toEqual({
      ok: false, above: ['maxToolCalls', 'reasoningEffort'],
    });
  });
  it('lower levels are accepted under a higher agent level', () => {
    expect(resolveResearchParams(high, { searchContextSize: 'low', reasoningEffort: 'low' }).ok).toBe(true);
  });
});

describe('spend voice social', () => {
  it('accepts social and refuses food', () => {
    expect(SpendingCapabilitySchema.safeParse('social').success).toBe(true);
    expect(SpendingCapabilitySchema.safeParse('food').success).toBe(false);
    expect(AgentSpendDaySchema.safeParse({ ...day, capability: 'social' }).success).toBe(true);
  });
});

describe('tool errors', () => {
  it('params_above_agent is valid and the other seven remain', () => {
    expect(RicercaToolErrorSchema.safeParse('params_above_agent').success).toBe(true);
    expect(ToolCallErrorResponseSchema.safeParse({ callId: 'c', status: 'error', code: 'TOOL_EXEC_FAILED', error: 'params_above_agent' }).success).toBe(true);
    for (const e of ['invalid_request', 'not_configured', 'max_usd_above_agent', 'unknown_parent', 'unknown_research', 'not_ready', 'consulta_prima_il_quaderno']) {
      expect(RicercaToolErrorSchema.safeParse(e).success, e).toBe(true);
    }
  });
});
