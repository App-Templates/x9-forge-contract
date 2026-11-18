import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_ASSETS_LIST_MAX,
  DEV_SESSION_ASSETS_LIST_REFUSALS,
  DevSessionAssetsListRefusalSchema,
  DevSessionAssetsListRequestSchema,
  DevSessionAssetsListResponseSchema,
  listDevSessionAssetsContract,
} from '../../src/http/endpoints/internal-dev-session-assets-list.js';
import {
  listDevSessionAssetsContract as exportedContract,
  DevSessionAssetsListResponseSchema as exportedResponse,
} from '../../src/http/index.js';

const scope = { tenantId: 'tenant-1', ownerId: 'owner-1', agentId: 'agent-1' };
const COMMIT = 'a'.repeat(40);
const REPO = 'acme/consegne';

function asset(i: number, over: { sessionId?: string; commit?: string; path?: string; assetId?: string } = {}) {
  return {
    assetId: over.assetId ?? `asset-${String(i).padStart(4, '0')}`,
    sha256: 'b'.repeat(64),
    name: `file-${i}.txt`,
    mediaType: 'text/plain',
    sizeBytes: 10 + i,
    origin: {
      kind: 'session' as const,
      sessionId: over.sessionId ?? 'session-123',
      repo: REPO,
      commit: over.commit ?? COMMIT,
      path: over.path ?? `src/file-${i}.txt`,
    },
    tenantId: 'tenant-1',
    companyId: 'company-1',
    projectId: 'project-1',
    createdAt: '2026-11-18T10:00:00+01:00',
  };
}
const many = (n: number) => ({ assets: Array.from({ length: n }, (_, i) => asset(i)) });

describe('internal dev session assets list', () => {
  it('s7424_percorso_e_metodo', () => {
    expect(listDevSessionAssetsContract.method).toBe('POST');
    expect(listDevSessionAssetsContract.authType).toBe('secret');
    expect(listDevSessionAssetsContract.path)
      .toBe('/internal/capability/agents/:agentId/dev/sessions/:sessionId/assets/list');
    expect(listDevSessionAssetsContract.paramsSchema.parse({ agentId: 'agent-1', sessionId: 'session-123' }))
      .toEqual({ agentId: 'agent-1', sessionId: 'session-123' });
    expect(listDevSessionAssetsContract.paramsSchema.safeParse({ agentId: 'agent-1', sessionId: '' }).success).toBe(false);
    expect(listDevSessionAssetsContract.paramsSchema.safeParse({ agentId: 'agent-1', sessionId: 's', extra: 1 }).success).toBe(false);
  });

  it('s7424_richiesta_stretta', () => {
    expect(DevSessionAssetsListRequestSchema.parse({ scope })).toEqual({ scope });
    expect(DevSessionAssetsListRequestSchema.safeParse({ scope, extra: 1 }).success).toBe(false);
    expect(DevSessionAssetsListRequestSchema.safeParse({ scope: { tenantId: 'tenant-1', agentId: 'agent-1' } }).success).toBe(false);
    expect(DevSessionAssetsListRequestSchema.safeParse({}).success).toBe(false);
  });

  it('s7424_risposta_valida', () => {
    const response = {
      assets: [
        asset(1),
        asset(2),
        { ...asset(3, { path: '.consegna/7/browser/home.png' }), name: 'home.png', mediaType: 'image/png' },
      ],
    };
    expect(DevSessionAssetsListResponseSchema.parse(response)).toEqual(response);
  });

  it('s7424_limiti', () => {
    expect(DEV_SESSION_ASSETS_LIST_MAX).toBe(60);
    expect(DevSessionAssetsListResponseSchema.safeParse({ assets: [] }).success).toBe(false);
    expect(DevSessionAssetsListResponseSchema.safeParse(many(60)).success).toBe(true);
    expect(DevSessionAssetsListResponseSchema.safeParse(many(61)).success).toBe(false);
  });

  it('s7424_origine_incompleta', () => {
    const base = asset(1);
    const link = { ...base, origin: { kind: 'link', url: 'https://example.com/a' } };
    const { commit: _c, ...noCommit } = base.origin;
    const { repo: _r, ...noRepo } = base.origin;
    const { path: _p, ...noPath } = base.origin;
    const origins = [link.origin, noCommit, noRepo, noPath];
    for (const origin of origins) {
      expect(DevSessionAssetsListResponseSchema.safeParse({ assets: [{ ...base, origin }] }).success).toBe(false);
    }
    const onlySession = { ...base, origin: { kind: 'session', sessionId: 'session-123' } };
    expect(DevSessionAssetsListResponseSchema.safeParse({ assets: [onlySession] }).success).toBe(false);
  });

  it('s7424_una_sola_sessione_un_solo_commit', () => {
    expect(DevSessionAssetsListResponseSchema.safeParse({
      assets: [asset(1), asset(2, { sessionId: 'session-999' })],
    }).success).toBe(false);
    expect(DevSessionAssetsListResponseSchema.safeParse({
      assets: [asset(1), asset(2, { commit: 'c'.repeat(40) })],
    }).success).toBe(false);
  });

  it('s7424_senza_doppioni', () => {
    expect(DevSessionAssetsListResponseSchema.safeParse({
      assets: [asset(1), asset(2, { assetId: asset(1).assetId })],
    }).success).toBe(false);
    expect(DevSessionAssetsListResponseSchema.safeParse({
      assets: [asset(1), asset(2, { path: asset(1).origin.path })],
    }).success).toBe(false);
  });

  it('s7424_rifiuti_e_indice', () => {
    expect([...DEV_SESSION_ASSETS_LIST_REFUSALS]).toEqual([
      'session_not_found', 'session_foreign', 'session_not_closed', 'delivery_not_verified', 'identity_source_unavailable',
    ]);
    for (const error of DEV_SESSION_ASSETS_LIST_REFUSALS) {
      expect(DevSessionAssetsListRefusalSchema.safeParse({ error }).success).toBe(true);
    }
    expect(DevSessionAssetsListRefusalSchema.safeParse({ error: 'altro' }).success).toBe(false);
    expect(DevSessionAssetsListRefusalSchema.safeParse({ error: 'session_not_found', extra: 1 }).success).toBe(false);
    expect(exportedContract).toBe(listDevSessionAssetsContract);
    expect(exportedResponse).toBe(DevSessionAssetsListResponseSchema);
  });
});
