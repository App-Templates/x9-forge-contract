import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { labBriefGapsListContract, ricercaResearchListContract } from '../../src/http/index.js';

const root = new URL('../../', import.meta.url);
const document = readFileSync(new URL('.planning/phases/w23b-01-osservazione-brief/RISCONTRO.md', root), 'utf8');

describe('R&D observation contract documentation', () => {
  it('validates the documented example, its brief link and the missing run contract', () => {
    const block = /```json\s*\n([\s\S]*?)```/.exec(document);
    expect(block, 'The document must contain a JSON example').not.toBeNull();
    if (!block) throw new Error('Missing JSON example');
    const example = JSON.parse(block[1]) as {
      lab: { params: unknown; query: unknown; response: unknown };
      ricerca: { params: unknown; query: unknown; response: unknown };
    };

    for (const [contract, read] of [
      [labBriefGapsListContract, example.lab],
      [ricercaResearchListContract, example.ricerca],
    ] as const) {
      expect(contract.paramsSchema.safeParse(read.params).success).toBe(true);
      expect(contract.querySchema.safeParse(read.query).success).toBe(true);
      expect(contract.responseSchema.safeParse(read.response).success).toBe(true);
    }

    const lab = labBriefGapsListContract.responseSchema.parse(example.lab.response);
    const ricerca = ricercaResearchListContract.responseSchema.parse(example.ricerca.response);
    expect(lab.analyses).toHaveLength(1);
    expect(ricerca.researches).toHaveLength(1);
    const analysis = lab.analyses[0];
    const research = ricerca.researches[0];
    expect(research.labGapsRef).toBe(analysis.gapsRef);

    expect(document).toContain('internal-rd-observations.ts:30');
    expect(document).toContain('internal-rd-observations.ts:59');
    expect(document).toContain('## Blocco (contratto mancante)');

    expect(labBriefGapsListContract.responseSchema.safeParse({
      analyses: [{ ...analysis, runId: 'run-1' }],
    }).success).toBe(false);
    expect(ricercaResearchListContract.responseSchema.safeParse({
      researches: [{ ...research, runId: 'run-1' }],
    }).success).toBe(false);
    expect(ricercaResearchListContract.responseSchema.safeParse({
      researches: [{ ...research, requestedAt: '2026-10-24T10:01:00.000Z' }],
    }).success).toBe(false);
  });
});
