import { describe, expect, it } from 'vitest';
import * as http from '../src/http/endpoints/index.js';
import {
  INTERNAL_MEMORY_MANDATE_RECONCILE_PATH,
  MandateReconcileRequestSchema,
  MandateReconcileResponseSchema,
  internalMemoryMandateReconcileContract,
} from '../src/http/endpoints/internal-memory-mandate-reconcile.js';

const body = {
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'good-choice',
  projectId: 'sito',
  buSlug: 'marketing',
  decision: { requestId: 'req-123456', planVersion: 2 },
  referent: { personRef: 'stefano', entryVersion: 1 },
  notebookPages: [
    { slug: 'prezzi', version: 3 },
    { slug: 'rimborsi', version: 1, contradicts: ['prezzi', { target: 'map_entry', kind: 'referent', key: 'stefano', version: 1 }] },
  ],
};

describe('mandate reconciliation contract (F3X-03)', () => {
  it('exposes exact method, path and auth type, exported from the http subpath', () => {
    expect(INTERNAL_MEMORY_MANDATE_RECONCILE_PATH).toBe('/internal/memory/company-map/reconcile');
    expect(internalMemoryMandateReconcileContract).toMatchObject({ method: 'POST', path: INTERNAL_MEMORY_MANDATE_RECONCILE_PATH, authType: 'secret' });
    expect(http.internalMemoryMandateReconcileContract).toBe(internalMemoryMandateReconcileContract);
  });
  it('accepts the sources of a mandate, and a body with only pages', () => {
    expect(MandateReconcileRequestSchema.safeParse(body).success).toBe(true);
    const { decision: _d, referent: _r, buSlug: _b, ...bare } = body;
    expect(MandateReconcileRequestSchema.safeParse({ ...bare, notebookPages: [] }).success).toBe(true);
  });
  it('rejects duplicate page slugs, a missing projectId, an extra key and a decision without planVersion', () => {
    expect(MandateReconcileRequestSchema.safeParse({ ...body, notebookPages: [{ slug: 'a', version: 1 }, { slug: 'a', version: 2 }] }).success).toBe(false);
    const { projectId: _p, ...noProject } = body;
    expect(MandateReconcileRequestSchema.safeParse(noProject).success).toBe(false);
    expect(MandateReconcileRequestSchema.safeParse({ ...body, model: 'x' }).success).toBe(false);
    expect(MandateReconcileRequestSchema.safeParse({ ...body, decision: { requestId: 'req-123456' } }).success).toBe(false);
  });
  it('answers agrees, conflict with the list, or missing', () => {
    const checkedAt = '2026-10-23T08:00:00+02:00';
    expect(MandateReconcileResponseSchema.safeParse({ reconciliation: { outcome: 'agrees' }, checkedAt }).success).toBe(true);
    expect(MandateReconcileResponseSchema.safeParse({
      reconciliation: { outcome: 'conflict', conflicts: [{ source: 'notebook_page', ref: 'rimborsi@1', reason: 'contraddice la voce referente stefano v1' }] },
      checkedAt,
    }).success).toBe(true);
    expect(MandateReconcileResponseSchema.safeParse({ reconciliation: { outcome: 'missing', missing: [{ source: 'decision' }] }, checkedAt }).success).toBe(true);
    expect(MandateReconcileResponseSchema.safeParse({ reconciliation: { outcome: 'conflict', conflicts: [] }, checkedAt }).success).toBe(false);
  });
});
