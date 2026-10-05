import { describe, it, expect } from 'vitest';
import {
  RICERCA_TOOLS,
  AgentSpendDaySchema,
  ResearchAgentConfigSchema,
  ResearchFindingSchema,
  ResearchRequestSchema,
  ResearchResultSchema,
  ResearchSourceSchema,
  ResearchStartOutputSchema,
  RicercaToolErrorSchema,
} from '../../../src/capability/ricerca/index';
import { ToolCallErrorResponseSchema } from '../../../src/capability/index';
import { capToolCallPath } from '../../../src/http/index';

const config = {
  agentId: 'samira',
  version: 1,
  objective: 'Diventare la cuoca più competente al mondo, studiando ogni giorno.',
  budget: { dailyUsd: 17, perResearchMaxUsd: 1.5, timezone: 'Europe/Rome' },
  models: { research: 'gpt-6.1-sol' },
  research: { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high' },
  sourceRule: 'opened_only',
} as const;

const fails = (r: { success: boolean }, label: string) => expect(r.success, label).toBe(false);

describe('cap-ricerca agent configuration (v1.28.0)', () => {
  it('a complete configuration of one agent is valid', () => {
    expect(ResearchAgentConfigSchema.safeParse(config).success).toBe(true);
  });

  it('budget, models and the source rule are product decisions: none has a default', () => {
    for (const key of ['budget', 'models', 'sourceRule', 'research', 'objective'] as const) {
      const { [key]: _gone, ...rest } = config;
      fails(ResearchAgentConfigSchema.safeParse(rest), `missing ${key}`);
    }
  });

  it('the budget is positive and one research never exceeds the day', () => {
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, dailyUsd: 0 } }), 'daily 0');
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, dailyUsd: -1 } }), 'daily < 0');
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, perResearchMaxUsd: 18 } }), 'research > day');
    // Positivity on its own (not through the per-research refine): both zero, and a zero research ceiling.
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, dailyUsd: 0, perResearchMaxUsd: 0 } }), 'both 0');
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, perResearchMaxUsd: 0 } }), 'research 0');
    expect(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, perResearchMaxUsd: 17 } }).success).toBe(true);
  });

  it('the day restarts in a real time zone', () => {
    fails(ResearchAgentConfigSchema.safeParse({ ...config, budget: { ...config.budget, timezone: 'Mars/Olympus' } }), 'tz');
  });

  it('the agent is an agent-core id; the version grows from 1', () => {
    for (const agentId of ['Samira', 'samira x', 'samira/../x', '']) fails(ResearchAgentConfigSchema.safeParse({ ...config, agentId }), agentId);
    fails(ResearchAgentConfigSchema.safeParse({ ...config, version: 0 }), 'version 0');
  });

  it('there is no project inside the capability; unknown fields are refused', () => {
    fails(ResearchAgentConfigSchema.safeParse({ ...config, projectId: 'food' }), 'projectId');
    fails(ResearchAgentConfigSchema.safeParse({ ...config, agents: ['samira'] }), 'agents');
  });

  it('tool calls per research are bounded', () => {
    fails(ResearchAgentConfigSchema.safeParse({ ...config, research: { ...config.research, maxToolCalls: 0 } }), '0');
    fails(ResearchAgentConfigSchema.safeParse({ ...config, research: { ...config.research, maxToolCalls: 101 } }), '101');
  });
});

describe('cap-ricerca research and result (v1.28.0)', () => {
  it('a research asks a bounded question, optionally following an earlier one; the agent comes from the call', () => {
    expect(ResearchRequestSchema.safeParse({ question: 'Come si stabilizza una hollandaise?' }).success).toBe(true);
    expect(ResearchRequestSchema.safeParse({ question: 'Perché impazzisce?', parentResearchId: 'r-1', maxUsd: 0.5 }).success).toBe(true);
    fails(ResearchRequestSchema.safeParse({ question: '' }), 'empty');
    fails(ResearchRequestSchema.safeParse({ question: 'x'.repeat(2001) }), 'long');
    fails(ResearchRequestSchema.safeParse({ question: 'q', maxUsd: 0 }), 'maxUsd 0');
    fails(ResearchRequestSchema.safeParse({ question: 'q', agentId: 'other' }), 'agent in the body');
  });

  it('sources are only http(s) addresses', () => {
    expect(ResearchSourceSchema.safeParse({ url: 'https://example.org/a', opened: true }).success).toBe(true);
    for (const url of ['file:///etc/passwd', 'javascript:alert(1)', 'data:text/html,x', 'ftp://h/x', 'not a url', 'https://e.org/' + 'a'.repeat(2000)]) {
      fails(ResearchSourceSchema.safeParse({ url, opened: true }), url.slice(0, 20));
    }
  });

  it('every finding comes from the web and cites at least one source', () => {
    expect(ResearchFindingSchema.safeParse({ text: 'Il tuorlo emulsiona fino a 65 °C.', sourceUrls: ['https://e.org/a'], origin: 'web' }).success).toBe(true);
    fails(ResearchFindingSchema.safeParse({ text: 't', sourceUrls: [], origin: 'web' }), 'no source');
    fails(ResearchFindingSchema.safeParse({ text: 't', sourceUrls: ['https://e.org/a'], origin: 'human' }), 'origin');
  });

  it('a result carries the agent, findings, the next questions and the true cost', () => {
    const result = {
      researchId: 'r-2', agentId: 'samira', state: 'completed', question: 'q', parentResearchId: 'r-1',
      findings: [{ text: 't', sourceUrls: ['https://e.org/a'], origin: 'web' }],
      newQuestions: ['E con il burro chiarificato?'],
      sources: [{ url: 'https://e.org/a', opened: true }],
      cost: { usd: 0.34, inputTokens: 80000, outputTokens: 9000, webCalls: 4, uncertain: false },
    };
    expect(ResearchResultSchema.safeParse(result).success).toBe(true);
    fails(ResearchResultSchema.safeParse({ ...result, cost: { ...result.cost, usd: -0.1 } }), 'negative cost');
    fails(ResearchResultSchema.safeParse({ ...result, state: 'done' }), 'state');
    fails(ResearchResultSchema.safeParse({ ...result, newQuestions: Array(21).fill('q') }), '21 questions');
  });

  it('the start answers with an id and a state', () => {
    expect(ResearchStartOutputSchema.safeParse({ researchId: 'r-1', state: 'queued' }).success).toBe(true);
  });
});

describe('cap-ricerca spend, tools and errors (v1.28.0)', () => {
  const day = { agentId: 'samira', capability: 'ricerca', day: '2026-10-05', spentUsd: 12.4, reservedUsd: 1.5, capUsd: 17, calls: 30, webCalls: 110, budgetStops: 1 };

  it('a day of spend is per agent and per capability, dated, never negative', () => {
    expect(AgentSpendDaySchema.safeParse(day).success).toBe(true);
    fails(AgentSpendDaySchema.safeParse({ ...day, day: '05/10/2026' }), 'date format');
    fails(AgentSpendDaySchema.safeParse({ ...day, day: '2026-13-45' }), 'not a calendar date');
    fails(AgentSpendDaySchema.safeParse({ ...day, spentUsd: -1 }), 'negative');
    fails(AgentSpendDaySchema.safeParse({ ...day, capUsd: 0 }), 'cap 0');
    fails(AgentSpendDaySchema.safeParse({ ...day, capability: 'voice' }), 'capability');
  });

  it('tool names are exported, so callers build the path from the contract', () => {
    expect(RICERCA_TOOLS).toEqual({ start: 'research_start', status: 'research_status', result: 'research_result' });
    expect(capToolCallPath(RICERCA_TOOLS.start)).toBe('/call/research_start');
  });

  it('tool errors use the bridge tool-call codes, with the reason as the error text', () => {
    for (const reason of RicercaToolErrorSchema.options) {
      expect(ToolCallErrorResponseSchema.safeParse({ callId: 'c', status: 'error', code: 'TOOL_EXEC_FAILED', error: reason }).success).toBe(true);
    }
    fails(RicercaToolErrorSchema.safeParse('RESEARCH_REFUSED'), 'old code');
  });
});
