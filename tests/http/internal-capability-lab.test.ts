import { describe, expect, it } from 'vitest';
import {
  LabHttpErrorSchema, labScopeQuerySchema, labPagesContract, labPageDetailContract,
  labGrowthHistoryContract, labCompetenceContract, labGapsContract, labExportContract,
  labAgentConfigGetContract, labAgentSpendContract, labAgentGrowthContract,
} from '../../src/http/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1' };
const reads = [labPagesContract, labPageDetailContract, labGrowthHistoryContract, labCompetenceContract, labGapsContract];
const contracts = [...reads, labExportContract];

describe('lab notebook HTTP contracts', () => {
  it('exposes six exact paths distinct from legacy routes with secret auth', () => {
    expect(contracts.map(contract => [contract.method, contract.path])).toEqual([
      ['GET', '/internal/capability/agents/:agentId/lab/pages'],
      ['GET', '/internal/capability/agents/:agentId/lab/pages/:slug'],
      ['GET', '/internal/capability/agents/:agentId/lab/growth/history'],
      ['GET', '/internal/capability/agents/:agentId/lab/competence'],
      ['GET', '/internal/capability/agents/:agentId/lab/gaps'],
      ['POST', '/internal/capability/agents/:agentId/lab/export'],
    ]);
    const legacyPaths = [labAgentConfigGetContract.path, labAgentSpendContract.path, labAgentGrowthContract.path];
    for (const contract of contracts) {
      expect(legacyPaths).not.toContain(contract.path);
      expect(contract.authType).toBe('secret');
      expect(contract.errorResponseSchema).toBe(LabHttpErrorSchema);
      const params = { agentId: 'agent-1', ...(contract === labPageDetailContract ? { slug: 'pasta' } : {}) };
      expect(contract.paramsSchema.safeParse(params).success).toBe(true);
      expect(contract.paramsSchema.safeParse({ ...params, agentId: undefined }).success).toBe(false);
    }
  });

  it('requires tenant and owner on every read and rejects duplicated agent identity', () => {
    expect(labScopeQuerySchema.parse(scope)).toEqual(scope);
    for (const contract of reads) {
      expect(contract.querySchema.safeParse(scope).success).toBe(true);
      for (const key of ['tenantId', 'ownerId'] as const) {
        for (const value of [undefined, '', '   ']) {
          expect(contract.querySchema.safeParse({ ...scope, [key]: value }).success).toBe(false);
        }
      }
      expect(contract.querySchema.safeParse({ ...scope, agentId: 'agent-1' }).success).toBe(false);
    }
  });

  it('coerces bounded limits and rejects invalid cursors and page versions', () => {
    for (const [contract, maximum] of [
      [labPagesContract, 200], [labGrowthHistoryContract, 500], [labGapsContract, 50],
    ] as const) {
      for (const limit of ['1', String(maximum)]) {
        expect(contract.querySchema.parse({ ...scope, limit }).limit).toBe(Number(limit));
      }
      for (const limit of ['0', '-1', String(maximum + 1), '1.5', 'invalid']) {
        expect(contract.querySchema.safeParse({ ...scope, limit }).success).toBe(false);
      }
    }
    for (const contract of [labPagesContract, labGrowthHistoryContract]) {
      expect(contract.querySchema.parse({ ...scope, cursor: 'next-page' }).cursor).toBe('next-page');
      expect(contract.querySchema.safeParse({ ...scope, cursor: '' }).success).toBe(false);
    }
    expect(labPageDetailContract.querySchema.parse({ ...scope, version: '2' }).version).toBe(2);
    for (const version of ['0', '-1', '1.5', 'invalid']) {
      expect(labPageDetailContract.querySchema.safeParse({ ...scope, version }).success).toBe(false);
    }
    for (const slug of ['../page', 'page/child', '..', '']) {
      expect(labPageDetailContract.paramsSchema.safeParse({ agentId: 'agent-1', slug }).success).toBe(false);
    }
  });

  it('rejects extra export fields and any body agent identity', () => {
    const body = { scope, format: 'json' };
    expect(labExportContract.bodySchema.parse(body)).toEqual(body);
    expect(labExportContract.bodySchema.safeParse({ ...body, format: 'markdown' }).success).toBe(true);
    for (const extra of [{ agentId: 'agent-1' }, { path: '../export' }]) {
      expect(labExportContract.bodySchema.safeParse({ ...body, ...extra }).success).toBe(false);
      expect(labExportContract.bodySchema.safeParse({ ...body, scope: { ...scope, ...extra } }).success).toBe(false);
    }
    for (const key of ['tenantId', 'ownerId'] as const) {
      expect(labExportContract.bodySchema.safeParse({ ...body, scope: { ...scope, [key]: undefined } }).success).toBe(false);
    }
    expect(labExportContract.bodySchema.safeParse({ ...body, format: 'html' }).success).toBe(false);
    const result = { filename: 'notebook.json', content: '{}', bytes: 2, partial: false, generatedFrom: 1 };
    expect(labExportContract.responseSchema.safeParse(result).success).toBe(true);
    expect(labExportContract.responseSchema.safeParse({ ...result, bytes: 3 }).success).toBe(false);
  });

  it('requires snapshot versions in all read responses and competence method metadata', () => {
    const page = {
      agentId: 'agent-1', slug: 'pasta', kind: 'topic', title: 'Pasta', body: 'Notes',
      version: 1, updatedAt: '2026-10-14T10:00:00.000Z',
    };
    const responses = [
      [labPagesContract, { snapshotVersion: 0, pages: [], nextCursor: null }],
      [labPageDetailContract, { snapshotVersion: 0, page, claims: [], links: [], sources: [], truncated: { claims: false, links: false, sources: false } }],
      [labGrowthHistoryContract, { snapshotVersion: 0, scope: { ...scope, agentId: 'agent-1' }, points: [], nextCursor: null, state: 'empty' }],
      [labCompetenceContract, { snapshotVersion: 0, nodes: [], method: 'coverage', methodVersion: '1' }],
      [labGapsContract, { snapshotVersion: 0, gaps: [] }],
    ] as const;
    for (const [contract, response] of responses) {
      expect(contract.responseSchema.safeParse(response).success).toBe(true);
      for (const snapshotVersion of [undefined, -1, 1.5, '1']) {
        expect(contract.responseSchema.safeParse({ ...response, snapshotVersion }).success).toBe(false);
      }
    }
    for (const key of ['method', 'methodVersion'] as const) {
      for (const value of [undefined, '', '   ']) {
        expect(labCompetenceContract.responseSchema.safeParse({
          snapshotVersion: 1, nodes: [], method: 'coverage', methodVersion: '1', [key]: value,
        }).success).toBe(false);
      }
    }
  });

  it('accepts only the named strict HTTP errors', () => {
    for (const error of ['invalid_request', 'not_configured', 'not_found', 'not_ready', 'scope_foreign', 'unavailable', 'timeout']) {
      expect(LabHttpErrorSchema.parse({ ok: false, error })).toEqual({ ok: false, error });
    }
    for (const error of [undefined, 'unknown', '']) {
      expect(LabHttpErrorSchema.safeParse({ ok: false, error }).success).toBe(false);
    }
    expect(LabHttpErrorSchema.safeParse({ ok: true, error: 'timeout' }).success).toBe(false);
    expect(LabHttpErrorSchema.safeParse({ ok: false, error: 'timeout', extra: true }).success).toBe(false);
  });
});
