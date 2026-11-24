import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as capability from '../../src/capability/index.js';
import * as tools from '../../src/capability/document-tools.js';
import * as dossier from '../../src/capability/lab/dossier.js';
import * as endpoint from '../../src/http/endpoints/internal-capability-lab-dossier.js';

const hex = (char: string) => char.repeat(64);

const references = (tenant = 'tenant-a', organization = 'org-1', project = 'project-1') => ({
  tenantId: tenant,
  organizationId: organization,
  clientId: 'client-1',
  projectId: project,
  snapshotId: 'snap-1',
  scope: { kind: 'project' as const, clientId: 'client-1', projectId: project },
  planId: 'plan_001',
  planVersion: 3,
  planDigest: hex('a'),
});
const pdfReferenceInput = (refs: unknown = references()) => ({ kind: 'lab_dossier', language: 'en', references: refs });
const labReferenceInput = (refs: unknown = references()) => ({
  references: refs,
  planCitations: [{ slug: 'analysis', version: 1 }, { slug: 'shared', version: 2, notebookAgentId: 'agent-lab-a' }],
});
const runContext = (organizationId = 'org-1', agent = 'agent-x9') => ({
  schemaVersion: 1,
  runId: 'run-1',
  organizationId,
  ownerId: 'owner-1',
  identity: { managementAgentId: agent, runtimeAgentId: agent, vaultAgentId: 7 },
  issuer: 'x9',
  issuedAt: '2026-11-23T10:00:00.000Z',
  expiresAt: '2026-11-23T11:00:00.000Z',
});

// A historical complete body, built with the real builder, to prove the old inputs keep their parse.
const page = (slug: string) => ({
  notebookAgentId: 'agent-lab-a', slug, version: 1, role: 'current' as const,
  title: `Title ${slug}`, body: `Body of ${slug}`, digest: hex('d'),
});
const historicalInput = () => ({
  tenantId: 'tenant-a', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
  snapshotId: 'snap-9', cutoff: '2026-11-23T10:00:00.000Z',
  scope: { kind: 'client' as const, clientId: 'client-1' },
  pages: [page('b'), page('a')],
  planCitations: [{ slug: 'a', version: 1 }],
  sources: [],
});
const historicalSnapshot = () => dossier.buildLabDossierSnapshot(historicalInput());
const historicalDelivery = () => {
  const snapshot = historicalSnapshot();
  return {
    planId: 'plan_001', planVersion: 1, planDigest: hex('a'),
    dossierSnapshotId: snapshot.snapshotId, dossierDigest: snapshot.manifestDigest,
  };
};
const genericDocument = () => ({
  kind: 'document',
  document: {
    title: 'Report', language: 'en', source: { kind: 'document', id: 'report' },
    blocks: [{ kind: 'paragraph', content: [{ text: 'Complete final paragraph' }] }],
  },
  language: 'en',
});

const labBody = () => ({ context: runContext(), input: labReferenceInput() });

describe('s8316 reference-only dossier inputs', () => {
  it('s8316 exports the reference schemas from the existing subpaths', () => {
    expect(dossier.LabDossierReferencesSchema).toBeInstanceOf(z.ZodType);
    expect(dossier.LabDossierReferenceRequestSchema).toBeInstanceOf(z.ZodType);
    expect(tools.DocumentPdfReferencesInputSchema).toBeInstanceOf(z.ZodType);
    expect(tools.DocumentPdfRequestSchema).toBeInstanceOf(z.ZodType);
    expect(capability.DocumentPdfRequestSchema).toBe(tools.DocumentPdfRequestSchema);
    expect(endpoint.InternalLabDossierSnapshotRequestSchema).toBeInstanceOf(z.ZodType);
  });

  it('s8316 accepts reference-only PDF inputs for two tenants without a caller snapshot', () => {
    for (const refs of [references('tenant-a', 'org-1', 'project-1'), references('tenant-b', 'org-2', 'project-9')]) {
      const input = pdfReferenceInput(refs);
      expect(tools.DocumentPdfReferencesInputSchema.parse(input)).toEqual(input);
      expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(input);
      expect(Object.keys(tools.DocumentPdfRequestSchema.parse(input)).sort()).toEqual(['kind', 'language', 'references']);
      expect(Object.keys(refs).sort()).not.toContain('pages');
    }
  });

  it('s8316 accepts reference-only Lab HTTP bodies for two tenants without a caller snapshot', () => {
    for (const [organization, tenant, agent] of [['org-1', 'tenant-a', 'agent-x9'], ['org-2', 'tenant-b', 'agent-forge']] as const) {
      const body = { context: runContext(organization, agent), input: labReferenceInput(references(tenant, organization)) };
      const parsed = endpoint.internalLabDossierSnapshotContract.bodySchema.parse(body);
      expect(parsed).toEqual(body);
      expect(parsed.input).not.toHaveProperty('pages');
      expect(parsed.input).not.toHaveProperty('cutoff');
      expect(parsed.input).not.toHaveProperty('sources');
    }
  });

  it('s8316 keeps the renderer input complete: a reference input is not a renderer source', () => {
    expect(tools.DocumentPdfInputSchema.safeParse(pdfReferenceInput()).success).toBe(false);
    expect(endpoint.InternalLabDossierSnapshotResponseSchema.safeParse({ ok: true, snapshot: references() }).success).toBe(false);
    expect(dossier.LabDossierSnapshotSchema.safeParse(references()).success).toBe(false);
    expect(dossier.LabDossierSnapshotInputSchema.safeParse(labReferenceInput().references).success).toBe(false);
  });

  it('s8316 keeps historical inputs and stored values identical', () => {
    const snapshot = historicalSnapshot();
    const dossierInput = { kind: 'lab_dossier', snapshot, language: 'en', deliveryContext: historicalDelivery() };
    for (const input of [dossierInput, genericDocument()]) {
      expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(tools.DocumentPdfInputSchema.parse(input));
      expect(tools.DocumentPdfRequestSchema.parse(input)).toEqual(input);
    }
    const body = { context: runContext(), input: historicalInput() };
    const parsed = endpoint.internalLabDossierSnapshotContract.bodySchema.parse(body);
    expect(parsed).toEqual(body);
    expect(parsed.input).toEqual(dossier.LabDossierSnapshotInputSchema.parse(historicalInput()));
    expect(dossier.LabDossierSnapshotSchema.parse(snapshot)).toEqual(snapshot);
    expect(endpoint.InternalLabDossierSnapshotResponseSchema.parse({ ok: true, snapshot })).toEqual({ ok: true, snapshot });
    // The historical client scope stays valid in the historical shapes.
    expect(snapshot.scope.kind).toBe('client');
  });

  it('s8316 rejects missing fields only in the new shape', () => {
    for (const key of Object.keys(references())) {
      const { [key]: _removed, ...rest } = references() as Record<string, unknown>;
      expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(rest)).success, `pdf ${key}`).toBe(false);
      expect(endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({ context: runContext(), input: labReferenceInput(rest) }).success, `lab ${key}`).toBe(false);
    }
    expect(endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({ context: runContext(), input: { references: references() } }).success).toBe(false);
  });

  it('s8316 rejects an invalid plan triple', () => {
    for (const edit of [{ planVersion: 0 }, { planVersion: 1.5 }, { planVersion: -1 }, { planDigest: 'xyz' }, { planDigest: hex('A') }, { planId: 'x' }]) {
      const refs = { ...references(), ...edit };
      expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(refs)).success, JSON.stringify(edit)).toBe(false);
      expect(dossier.LabDossierReferencesSchema.safeParse(refs).success, JSON.stringify(edit)).toBe(false);
    }
  });

  it('s8316 rejects incompatible tenant, project and scope', () => {
    const refs = references();
    for (const edit of [
      { scope: { kind: 'client', clientId: 'client-1' } },
      { scope: { kind: 'project', clientId: 'client-2', projectId: 'project-1' } },
      { scope: { kind: 'project', clientId: 'client-1', projectId: 'project-2' } },
      { scope: { kind: 'project', clientId: 'client-1' } },
      { tenantId: '' },
      { projectId: '' },
    ]) {
      expect(dossier.LabDossierReferencesSchema.safeParse({ ...refs, ...edit }).success, JSON.stringify(edit)).toBe(false);
      expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput({ ...refs, ...edit })).success, JSON.stringify(edit)).toBe(false);
    }
  });

  it('s8316 rejects unknown fields and hybrid new-and-old payloads', () => {
    const snapshot = historicalSnapshot();
    const unknown = { ...references(), extra: 1 };
    expect(dossier.LabDossierReferencesSchema.safeParse(unknown).success).toBe(false);
    expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), extra: true }).success).toBe(false);
    expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), snapshot }).success).toBe(false);
    expect(tools.DocumentPdfRequestSchema.safeParse({ ...pdfReferenceInput(), deliveryContext: historicalDelivery() }).success).toBe(false);
    expect(tools.DocumentPdfRequestSchema.safeParse({
      kind: 'lab_dossier', language: 'en', snapshot, deliveryContext: historicalDelivery(), references: references(),
    }).success).toBe(false);
    const body = (input: unknown) => ({ context: runContext(), input });
    const contract = endpoint.internalLabDossierSnapshotContract.bodySchema;
    expect(contract.safeParse(body({ ...labReferenceInput(), pages: historicalInput().pages })).success).toBe(false);
    expect(contract.safeParse(body({ ...labReferenceInput(), cutoff: '2026-11-23T10:00:00.000Z' })).success).toBe(false);
    expect(contract.safeParse(body({ ...historicalInput(), references: references() })).success).toBe(false);
  });

  it('s8316 rejects a partial photograph passed off as a response', () => {
    const snapshot = historicalSnapshot();
    const response = endpoint.InternalLabDossierSnapshotResponseSchema;
    expect(response.safeParse({ ok: true, snapshot: { ...snapshot, pages: [] } }).success).toBe(false);
    expect(response.safeParse({ ok: true, snapshot: { ...snapshot, pages: snapshot.pages.slice(0, 1) } }).success).toBe(false);
    expect(response.safeParse({ ok: true, snapshot: { ...snapshot, totalPages: 5 } }).success).toBe(false);
    expect(response.safeParse({ ok: true, snapshot: { ...snapshot, complete: false } }).success).toBe(false);
    expect(response.safeParse({ ok: true, snapshot: { ...snapshot, manifestDigest: hex('e') } }).success).toBe(false);
    const { complete: _complete, ...withoutComplete } = snapshot;
    expect(response.safeParse({ ok: true, snapshot: withoutComplete }).success).toBe(false);
    expect(response.safeParse({ ok: true, snapshot: references() }).success).toBe(false);
  });

  it('s8316 applies the cumulative UTF-8 limit to the new PDF input', () => {
    const big = { ...references(), tenantId: 'é'.repeat(tools.DOCUMENT_PDF_MAX_BYTES) };
    expect(tools.DocumentPdfReferencesInputSchema.safeParse(pdfReferenceInput(big)).success).toBe(false);
    expect(tools.DocumentPdfRequestSchema.safeParse(pdfReferenceInput(big)).success).toBe(false);
  });

  it('s8316 rejects a foreign reference organization', () => {
    // Internally coherent references, but their organization differs from the signed run context.
    const body = { context: runContext('org-1'), input: labReferenceInput(references('tenant-a', 'org-2')) };
    expect(dossier.LabDossierReferencesSchema.safeParse(references('tenant-a', 'org-2')).success).toBe(true);
    const result = endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse(body);
    expect(result.success).toBe(false);
  });

  it('s8316 rejects a foreign reference project', () => {
    // Same body, other valid shape: only scope.projectId differs from projectId.
    const foreign = { ...references(), scope: { kind: 'project' as const, clientId: 'client-1', projectId: 'project-2' } };
    const result = endpoint.internalLabDossierSnapshotContract.bodySchema.safeParse({
      context: runContext(), input: labReferenceInput(foreign),
    });
    expect(result.success).toBe(false);
  });
});
