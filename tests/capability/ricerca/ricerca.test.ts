import { describe, it, expect } from 'vitest';
import {
  RICERCA_TOOLS,
  ProjectSpendDaySchema,
  ResearchFindingSchema,
  ResearchProjectConfigSchema,
  ResearchRequestSchema,
  ResearchResultSchema,
  ResearchSourceSchema,
  ResearchStartOutputSchema,
} from '../../../src/capability/ricerca/index';
import { capToolCallPath } from '../../../src/http/index';

const project = {
  projectId: 'food-samira',
  version: 1,
  name: 'Progetto food',
  objective: 'Diventare la cuoca più competente al mondo, studiando ogni giorno.',
  budget: { dailyUsd: 17, perResearchMaxUsd: 1.5, timezone: 'Europe/Rome' },
  models: { research: 'gpt-6.1-sol' },
  research: { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high' },
  sourceRule: 'opened_only',
  agents: ['samira'],
} as const;

const fails = (r: { success: boolean }, label: string) => expect(r.success, label).toBe(false);

describe('cap-ricerca project config (v1.28.0)', () => {
  it('a complete project part is valid', () => {
    expect(ResearchProjectConfigSchema.safeParse(project).success).toBe(true);
  });

  it('budget, models and the source rule are product decisions: none has a default', () => {
    for (const key of ['budget', 'models', 'sourceRule', 'research', 'agents'] as const) {
      const { [key]: _gone, ...rest } = project;
      fails(ResearchProjectConfigSchema.safeParse(rest), `missing ${key}`);
    }
  });

  it('the budget is positive and one research never exceeds the day', () => {
    fails(ResearchProjectConfigSchema.safeParse({ ...project, budget: { ...project.budget, dailyUsd: 0 } }), 'daily 0');
    fails(ResearchProjectConfigSchema.safeParse({ ...project, budget: { ...project.budget, dailyUsd: -1 } }), 'daily < 0');
    fails(ResearchProjectConfigSchema.safeParse({ ...project, budget: { ...project.budget, perResearchMaxUsd: 18 } }), 'research > day');
    expect(ResearchProjectConfigSchema.safeParse({ ...project, budget: { ...project.budget, perResearchMaxUsd: 17 } }).success).toBe(true);
  });

  it('the day restarts in a real time zone', () => {
    fails(ResearchProjectConfigSchema.safeParse({ ...project, budget: { ...project.budget, timezone: 'Mars/Olympus' } }), 'tz');
  });

  it('the project id is a lowercase slug, the version grows from 1', () => {
    for (const projectId of ['Food', 'food samira', '-food', 'f', 'a'.repeat(64)]) {
      fails(ResearchProjectConfigSchema.safeParse({ ...project, projectId }), projectId);
    }
    fails(ResearchProjectConfigSchema.safeParse({ ...project, version: 0 }), 'version 0');
  });

  it('unknown fields are refused (strict internal boundary)', () => {
    fails(ResearchProjectConfigSchema.safeParse({ ...project, extra: true }), 'extra');
  });

  it('tool calls per research are bounded', () => {
    fails(ResearchProjectConfigSchema.safeParse({ ...project, research: { ...project.research, maxToolCalls: 0 } }), '0');
    fails(ResearchProjectConfigSchema.safeParse({ ...project, research: { ...project.research, maxToolCalls: 101 } }), '101');
  });
});

describe('cap-ricerca research and result (v1.28.0)', () => {
  it('a research asks a bounded question of a project, optionally following an earlier one', () => {
    expect(ResearchRequestSchema.safeParse({ projectId: 'food-samira', question: 'Come si stabilizza una hollandaise?' }).success).toBe(true);
    expect(ResearchRequestSchema.safeParse({ projectId: 'food-samira', question: 'Perché impazzisce?', parentResearchId: 'r-1', maxUsd: 0.5 }).success).toBe(true);
    fails(ResearchRequestSchema.safeParse({ projectId: 'food-samira', question: '' }), 'empty');
    fails(ResearchRequestSchema.safeParse({ projectId: 'food-samira', question: 'x'.repeat(2001) }), 'long');
    fails(ResearchRequestSchema.safeParse({ projectId: 'food-samira', question: 'q', maxUsd: 0 }), 'maxUsd 0');
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

  it('a result carries findings, the next questions and the true cost', () => {
    const result = {
      researchId: 'r-2', projectId: 'food-samira', state: 'completed', question: 'q', parentResearchId: 'r-1',
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

describe('cap-ricerca spend and tools (v1.28.0)', () => {
  it('a day of spend is dated in the project day and never negative', () => {
    const day = { projectId: 'food-samira', day: '2026-10-05', spentUsd: 12.4, reservedUsd: 1.5, capUsd: 17, calls: 30, webCalls: 110 };
    expect(ProjectSpendDaySchema.safeParse(day).success).toBe(true);
    fails(ProjectSpendDaySchema.safeParse({ ...day, day: '05/10/2026' }), 'date');
    fails(ProjectSpendDaySchema.safeParse({ ...day, spentUsd: -1 }), 'negative');
    fails(ProjectSpendDaySchema.safeParse({ ...day, capUsd: 0 }), 'cap 0');
  });

  it('tool names are exported, so callers build the path from the contract', () => {
    expect(RICERCA_TOOLS).toEqual({ start: 'research_start', status: 'research_status', result: 'research_result' });
    expect(capToolCallPath(RICERCA_TOOLS.start)).toBe('/call/research_start');
  });
});
