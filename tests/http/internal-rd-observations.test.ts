import { describe, expect, it } from 'vitest';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';
import {
  CapabilityAgentParamsSchema, LabHttpErrorSchema,
  LabBriefGapsListQuerySchema, LabBriefGapsListResponseSchema,
  RicercaResearchListQuerySchema, RicercaResearchListResponseSchema,
  labBriefGapsListContract, ricercaResearchListContract,
  type LabBriefGapsListQuery, type LabBriefGapsListResponse,
  type RicercaResearchListQuery, type RicercaResearchListResponse,
} from '../../src/http/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', projectId: 'launch-2026' };
const labQuery: LabBriefGapsListQuery = { ...scope, clientId: 'client-acme' };
const researchQuery: RicercaResearchListQuery = scope;
const analysis: LabBriefGapsListResponse['analyses'][number] = {
  gapsRef: 'brief_123', topics: ['Market', 'Competitors'],
  covered: [{ slug: 'acme-market', version: 2 }],
  gaps: [{ topic: 'Competitors' }], analyzedAt: '2026-10-24T10:00:00.000Z',
};
const research: RicercaResearchListResponse['researches'][number] = {
  researchId: 'research-1', state: 'queued', labGapsRef: analysis.gapsRef,
};
const reads = [
  [labBriefGapsListContract, labQuery],
  [ricercaResearchListContract, researchQuery],
] as const;

describe('R&D observation HTTP contracts', () => {
  it('exports exact GET paths, shared secret auth and schemas through the HTTP entry point', () => {
    expect(reads.map(([contract]) => [contract.method, contract.path])).toEqual([
      ['GET', '/internal/capability/agents/:agentId/lab/brief-gaps'],
      ['GET', '/internal/capability/agents/:agentId/ricerca/researches'],
    ]);
    for (const [contract] of reads) {
      expect(contract.authType).toBe('secret');
      expect(contract.authHeader).toBe(INTERNAL_SECRET_HEADER);
      expect(contract.paramsSchema).toBe(CapabilityAgentParamsSchema);
      expect(contract.errorResponseSchema).toBe(LabHttpErrorSchema);
      expect(contract.paramsSchema.safeParse({ agentId: 'agent-1' }).success).toBe(true);
      expect(contract.paramsSchema.safeParse({}).success).toBe(false);
    }
    expect(labBriefGapsListContract.querySchema).toBe(LabBriefGapsListQuerySchema);
    expect(labBriefGapsListContract.responseSchema).toBe(LabBriefGapsListResponseSchema);
    expect(ricercaResearchListContract.querySchema).toBe(RicercaResearchListQuerySchema);
    expect(ricercaResearchListContract.responseSchema).toBe(RicercaResearchListResponseSchema);
  });

  it('requires tenant, owner and project and bounds optional coerced limits', () => {
    for (const [contract, query] of reads) {
      expect(contract.querySchema.parse(query)).toEqual(query);
      for (const key of ['tenantId', 'ownerId', 'projectId'] as const) {
        for (const value of [undefined, '']) {
          expect(contract.querySchema.safeParse({ ...query, [key]: value }).success).toBe(false);
        }
      }
      for (const key of ['tenantId', 'ownerId'] as const) {
        expect(contract.querySchema.safeParse({ ...query, [key]: '   ' }).success).toBe(false);
      }
      expect(contract.querySchema.safeParse({ ...query, projectId: 'p'.repeat(65) }).success).toBe(false);
      for (const limit of ['1', '50']) {
        expect(contract.querySchema.parse({ ...query, limit }).limit).toBe(Number(limit));
      }
      for (const limit of [0, 51, -1, 1.5, 'invalid']) {
        expect(contract.querySchema.safeParse({ ...query, limit }).success).toBe(false);
      }
    }
  });

  it('rejects extra fields in both queries and responses', () => {
    for (const [contract, query] of reads) {
      expect(contract.querySchema.safeParse({ ...query, extra: true }).success).toBe(false);
      expect(contract.querySchema.safeParse({ ...query, agentId: 'agent-1' }).success).toBe(false);
    }
    expect(LabBriefGapsListResponseSchema.safeParse({ analyses: [analysis], extra: true }).success).toBe(false);
    expect(LabBriefGapsListResponseSchema.safeParse({ analyses: [{ ...analysis, extra: true }] }).success).toBe(false);
    expect(RicercaResearchListResponseSchema.safeParse({ researches: [research], extra: true }).success).toBe(false);
    expect(RicercaResearchListResponseSchema.safeParse({ researches: [{ ...research, extra: true }] }).success).toBe(false);
  });

  it('rejects malformed client identifiers and gap references', () => {
    for (const clientId of [undefined, '', 'c'.repeat(65), 42]) {
      expect(LabBriefGapsListQuerySchema.safeParse({ ...labQuery, clientId }).success).toBe(false);
    }
    for (const gapsRef of ['', 'short', 'bad/ref', 'a'.repeat(65)]) {
      expect(LabBriefGapsListResponseSchema.safeParse({ analyses: [{ ...analysis, gapsRef }] }).success).toBe(false);
      expect(RicercaResearchListResponseSchema.safeParse({ researches: [{ ...research, labGapsRef: gapsRef }] }).success).toBe(false);
    }
  });

  it('accepts empty and bounded lists with the shared analysis link', () => {
    expect(LabBriefGapsListResponseSchema.parse({ analyses: [] })).toEqual({ analyses: [] });
    expect(RicercaResearchListResponseSchema.parse({ researches: [] })).toEqual({ researches: [] });
    const labResult = LabBriefGapsListResponseSchema.parse({ analyses: [analysis] });
    const researchResult = RicercaResearchListResponseSchema.parse({ researches: [research] });
    expect(researchResult.researches[0].labGapsRef).toBe(labResult.analyses[0].gapsRef);
    expect(RicercaResearchListResponseSchema.safeParse({ researches: [{ researchId: 'research-2', state: 'completed' }] }).success).toBe(true);
    for (const count of [50, 51]) {
      expect(LabBriefGapsListResponseSchema.safeParse({ analyses: Array.from({ length: count }, () => analysis) }).success).toBe(count === 50);
      expect(RicercaResearchListResponseSchema.safeParse({ researches: Array.from({ length: count }, () => research) }).success).toBe(count === 50);
    }
  });

  it('validates reused topics, coverage, timestamps, research ids and states', () => {
    for (const invalid of [
      { topics: [] }, { topics: ['Market', 'Market'] }, { covered: [{ slug: '../page', version: 2 }] },
      { covered: [{ slug: 'acme-market', version: 0 }] }, { gaps: [{ topic: '' }] },
      { analyzedAt: 'yesterday' }, { analyzedAt: undefined },
    ]) {
      expect(LabBriefGapsListResponseSchema.safeParse({ analyses: [{ ...analysis, ...invalid }] }).success).toBe(false);
    }
    for (const state of ['queued', 'running', 'completed', 'failed', 'budget_exhausted']) {
      expect(RicercaResearchListResponseSchema.safeParse({ researches: [{ ...research, state }] }).success).toBe(true);
    }
    for (const invalid of [{ state: 'unknown' }, { researchId: '' }, { researchId: 'r'.repeat(101) }]) {
      expect(RicercaResearchListResponseSchema.safeParse({ researches: [{ ...research, ...invalid }] }).success).toBe(false);
    }
  });
});
