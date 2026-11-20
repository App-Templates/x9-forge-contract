import { describe, expect, it } from 'vitest';
import {
  RESEARCH_NOT_OPENED_REASONS,
  ResearchAdmissionSchema,
  ResearchNotOpenedReasonSchema,
  ResearchResultSchema,
  renderResearchAdmission,
  type ResearchAdmission,
} from '../../../src/capability/ricerca/index.js';
import { LabIngestInputSchema } from '../../../src/capability/lab/index.js';
import { InternalRicercaResultResponseSchema } from '../../../src/http/endpoints/internal-ricerca-result.js';

// Counts observed for research 7d644279 on 2026-11-11; other required fields retain the saved result shape.
const admission: ResearchAdmission = {
  rule: 'opened_only', cited: 10, opened: 0, admitted: 0, droppedFindings: 36,
  notOpenedReason: 'web_exhausted',
};
const savedResult = {
  researchId: '7d644279',
  agentId: 'ricerca-orto-facile',
  state: 'completed',
  question: 'Which agronomic requirements apply to Orto Facile?',
  findings: [],
  newQuestions: [],
  sources: [],
  cost: { usd: 1.29, inputTokens: 0, outputTokens: 0, webCalls: 7, uncertain: false },
};

describe('research admission (1.181.0)', () => {
  it('s6353 conto-ammissione: renders the observed empty research deterministically', () => {
    expect(ResearchAdmissionSchema.parse(admission)).toEqual(admission);
    const expected = 'Fonti ammesse: 0. Pagine aperte: 0 su 10 citate. Risultati scartati: 36. Le pagine non sono state aperte: chiamate web finite.';
    expect(renderResearchAdmission(admission)).toBe(expected);
    expect(renderResearchAdmission(admission)).toBe(expected);
  });

  it('s6353 conto-ammissione: carries admission through result, internal response and lab_ingest', () => {
    const result = { ...savedResult, admission };
    expect(ResearchResultSchema.parse(result)).toEqual(result);
    expect(InternalRicercaResultResponseSchema.parse(result)).toEqual(result);
    expect(LabIngestInputSchema.parse({ result })).toEqual({ result });
  });

  it('preserves the saved completed empty result without adding an admission key', () => {
    for (const schema of [ResearchResultSchema, InternalRicercaResultResponseSchema]) {
      const parsed = schema.parse(savedResult);
      expect(parsed).toEqual(savedResult);
      expect(Object.hasOwn(parsed, 'admission')).toBe(false);
    }
    const parsed = LabIngestInputSchema.parse({ result: savedResult });
    expect(parsed).toEqual({ result: savedResult });
    expect('result' in parsed && Object.hasOwn(parsed.result, 'admission')).toBe(false);
  });

  it.each([
    ['more admitted than opened', { ...admission, opened: 1, admitted: 3 }],
    ['no reason for dropped findings without opened pages', { ...admission, droppedFindings: 5, notOpenedReason: undefined }],
    ['a reason without dropped findings', { ...admission, droppedFindings: 0 }],
    ['an invented reason', { ...admission, notOpenedReason: 'provider_unavailable' }],
    ['an extra key', { ...admission, extra: true }],
    ['an unknown rule', { ...admission, rule: 'all_sources' }],
  ])('rejects %s', (_label, value) => {
    expect(ResearchAdmissionSchema.safeParse(value).success).toBe(false);
    expect(ResearchResultSchema.safeParse({ ...savedResult, admission: value }).success).toBe(false);
  });

  it.each(['cited', 'opened', 'admitted', 'droppedFindings'] as const)('requires a nonnegative integer for %s', key => {
    for (const value of [-1, 0.5]) {
      expect(ResearchAdmissionSchema.safeParse({ ...admission, [key]: value }).success).toBe(false);
    }
  });

  it('allows search results to be admitted without opening their pages under opened_or_search_result', () => {
    const value: ResearchAdmission = {
      rule: 'opened_or_search_result', cited: 10, opened: 0, admitted: 3, droppedFindings: 5,
    };
    expect(ResearchAdmissionSchema.parse(value)).toEqual(value);
    expect(ResearchAdmissionSchema.parse({ ...value, droppedFindings: 0 }).droppedFindings).toBe(0);
    expect(ResearchAdmissionSchema.safeParse({ ...value, droppedFindings: 0, notOpenedReason: 'web_exhausted' }).success).toBe(false);
  });

  it('allows dropped findings without a reason when some pages were opened', () => {
    const value = { ...admission, opened: 1, admitted: 1, notOpenedReason: undefined };
    expect(ResearchAdmissionSchema.parse(value)).toEqual(value);
  });

  it('renders the counts alone when no reason is present', () => {
    expect(renderResearchAdmission({ rule: 'opened_only', cited: 2, opened: 2, admitted: 2, droppedFindings: 0 }))
      .toBe('Fonti ammesse: 2. Pagine aperte: 2 su 2 citate. Risultati scartati: 0.');
  });

  it.each([
    ['web_exhausted', 'chiamate web finite.'],
    ['research_budget_exhausted', 'tetto di spesa della ricerca raggiunto.'],
    ['day_budget_exhausted', 'tetto di spesa del giorno raggiunto.'],
    ['nothing_to_open', 'il resoconto non citava pagine da aprire.'],
  ] as const)('renders the fixed sentence for %s', (notOpenedReason, sentence) => {
    const value = { ...admission, notOpenedReason };
    expect(renderResearchAdmission(value)).toBe(
      `Fonti ammesse: 0. Pagine aperte: 0 su 10 citate. Risultati scartati: 36. Le pagine non sono state aperte: ${sentence}`,
    );
    expect(renderResearchAdmission(value)).not.toContain('\n');
  });

  it('exports exactly the supported not-opened reasons', () => {
    expect(RESEARCH_NOT_OPENED_REASONS).toEqual([
      'web_exhausted', 'research_budget_exhausted', 'day_budget_exhausted', 'nothing_to_open',
    ]);
    expect(ResearchNotOpenedReasonSchema.options).toEqual(RESEARCH_NOT_OPENED_REASONS);
  });

  it('validates admission before rendering it', () => {
    expect(() => renderResearchAdmission({ ...admission, opened: 1, admitted: 3 })).toThrow();
  });
});
