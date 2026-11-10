import { describe, it, expect } from 'vitest';
import { ResearchAgentConfigSchema } from '../../../src/capability/ricerca/index';
import { ricercaAgentConfigPutContract } from '../../../src/http/endpoints/internal-capability-agent';

// Shape saved in production for a Lab agent: no maxPerDossier.
const saved = {
  agentId: 'lab-good-choice',
  version: 1,
  objective: 'Rispondere alle lacune del capo BU.',
  budget: { dailyUsd: 30, perResearchMaxUsd: 10, timezone: 'Europe/Rome' },
  models: { research: 'gpt-6.1-sol' },
  research: { maxToolCalls: 30, searchContextSize: 'high', reasoningEffort: 'high' },
  sourceRule: 'opened_only',
} as const;

describe('cap-ricerca research.maxPerDossier (v1.133.0)', () => {
  it('s6112 tetto-dossier-solo-da-env: ResearchAgentConfigSchema keeps research.maxPerDossier (integer 1-100) and still accepts a saved config without it', () => {
    const withCap = ResearchAgentConfigSchema.parse({ ...saved, research: { ...saved.research, maxPerDossier: 12 } });
    expect(withCap.research.maxPerDossier).toBe(12);
    const without = ResearchAgentConfigSchema.parse(saved);
    expect(without.research).toEqual(saved.research);
    expect('maxPerDossier' in without.research).toBe(false);
  });

  it('s6112 maxPerDossier refuses 0, 101 and 2.5', () => {
    for (const maxPerDossier of [0, 101, 2.5]) {
      const r = ResearchAgentConfigSchema.safeParse({ ...saved, research: { ...saved.research, maxPerDossier } });
      expect(r.success, String(maxPerDossier)).toBe(false);
    }
  });

  it('s6112 ricercaAgentConfigPutContract body keeps maxPerDossier', () => {
    const body = { ...saved, research: { ...saved.research, maxPerDossier: 9 } };
    const parsed = ricercaAgentConfigPutContract.bodySchema.safeParse(body);
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(JSON.stringify(parsed.data)).toContain('"maxPerDossier":9');
  });
});
