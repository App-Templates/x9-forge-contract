import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import * as capability from '../../src/capability/index.js';
import { ActionPlanSchema, actionPlanCanonicalJson } from '../../src/organization/action-plan.js';
import { buildLabDossierSnapshot } from '../../src/capability/lab/dossier.js';
import { capToolCallPath } from '../../src/http/endpoints/cap-tool-call.js';
import { INTERNAL_SECRET_HEADER } from '../../src/auth/index.js';

const hex = (char: string) => char.repeat(64);
const plan = () => {
  const value = ActionPlanSchema.parse({
    planId: 'plan_001', version: 1, digest: hex('a'),
    tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
    objective: { request: 'Find clients', expectedResult: 'One contract', measure: 'Contracts' },
    analysis: {
      startingPoint: 'New service', marketAndAlternatives: { text: 'Outreach', sources: ['https://example.org/research'] },
      recommendedMethod: { method: 'Interviews', why: 'Validate demand' },
    },
    strategy: { approach: 'Start small', choices: ['Direct sales'], discardedAlternatives: [] },
    objectiveTree: { project: { expectedResult: 'One client', deliveryCriteria: ['Agreement'] }, businessUnits: [] },
    milestones: [{ number: 1, delivery: 'Report', buSlug: 'sales', closeCriterion: 'Accepted', blockedBy: [] }],
    criticalPath: [1], businessUnits: [{
      buSlug: 'sales', typeId: 'marketing', mandate: 'Find clients', competencies: ['outreach'],
      lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'jane', entryVersion: 1 },
      firstActivities: ['Interview buyers'], start: { kind: 'now' },
    }], exchanges: [], budget: { currency: 'EUR', total: 0, perBu: [] },
    risks: [], assumptions: [], missingMaterials: [], questions: [],
    ifApproved: { startNow: ['sales'], startLater: [], verticalPlanDueBy: [], updates: { how: 'Report', every: 'Week' } },
  });
  return { ...value, digest: createHash('sha256').update(actionPlanCanonicalJson(value)).digest('hex') };
};
const snapshot = () => buildLabDossierSnapshot({
  tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
  snapshotId: 'snap-1', cutoff: '2026-11-23T10:00:00.000Z',
  scope: { kind: 'project', clientId: 'client-1', projectId: 'project-1' },
  pages: [{ notebookAgentId: 'agent-lab', slug: 'analysis', version: 1, role: 'current', title: 'Analysis', body: 'Complete body', digest: hex('a') }],
  sources: [], planCitations: [],
});
const context = () => ({
  planId: plan().planId, planVersion: 1, planDigest: plan().digest,
  dossierSnapshotId: snapshot().snapshotId, dossierDigest: snapshot().manifestDigest,
});
const planInput = () => ({ kind: 'action_plan', plan: plan(), language: 'en', deliveryContext: context() });
const dossierInput = () => ({ kind: 'lab_dossier', snapshot: snapshot(), language: 'en', deliveryContext: context() });
const data = () => ({
  title: 'Report', language: 'en', source: { kind: 'document', id: 'report' },
  blocks: [{ kind: 'paragraph', content: [{ text: 'Complete final paragraph' }] }],
});
const genericInput = () => ({ kind: 'document', document: data(), language: 'en' });
const receipt = () => ({
  schemaVersion: 1, role: 'document', tenantId: 'tenant-1', organizationId: 'org-1', clientId: 'client-1', projectId: 'project-1',
  source: { kind: 'document', sha256: hex('d') }, documentDigest: hex('d'),
  asset: {
    assetId: 'asset_pdf_01', sha256: hex('c'), name: 'report.pdf', mediaType: 'application/pdf', sizeBytes: 2048,
    origin: { kind: 'generated', agentId: 'agent-qa' }, tenantId: 'tenant-1', companyId: 'client-1', projectId: 'project-1',
    createdAt: '2026-11-23T10:00:00.000Z',
  },
  renderer: { name: 'pdfmake', version: '0.2.18' }, fontSet: { name: 'local', version: '1.0.0' },
  pageCount: 1, createdAt: '2026-11-23T10:00:01.000Z', producedBy: { agentId: 'agent-qa' },
});

describe('s8307 document PDF contract', () => {
  it('s8307 rejects success without a persisted PDF receipt', () => {
    // Before the dedicated contract exists, dispatch only validates the generic output.
    const exported: unknown = Reflect.get(capability, 'DocumentPdfOutputSchema');
    const schema = exported instanceof z.ZodType ? exported : capability.ToolCallSuccessResponseSchema.shape.output;
    const result = schema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map(issue => issue.path)).toContainEqual(['receipt']);
  });

  it('exports the effective tool contracts and uses the common dispatch path and header', () => {
    expect(capability.DOCUMENT_PDF_TOOL).toBe('document_pdf');
    expect(capToolCallPath(capability.DOCUMENT_PDF_TOOL)).toBe('/call/document_pdf');
    expect(INTERNAL_SECRET_HEADER).toBeTruthy();
    expect(capability.DocumentPdfInputSchema).toBeInstanceOf(z.ZodType);
    expect(capability.DocumentPdfOutputSchema).toBeInstanceOf(z.ZodType);
  });

  it('accepts all three variants without any LLM credential and preserves full sources', () => {
    for (const input of [planInput(), dossierInput(), genericInput()]) {
      expect(capability.DocumentPdfInputSchema.parse(input)).toEqual(input);
    }
    const markdown = { kind: 'document', markdown: '# Report\n\n- One\n- Two\n\n[Source](https://example.org)', language: 'en' };
    expect(capability.DocumentPdfInputSchema.parse(markdown)).toEqual(markdown);
  });

  it('requires exactly one generic content source and consistent language', () => {
    for (const input of [
      { kind: 'document', language: 'en' },
      { ...genericInput(), markdown: 'Alternative' },
      { ...genericInput(), language: 'it' },
    ]) expect(capability.DocumentPdfInputSchema.safeParse(input).success).toBe(false);
  });

  it('requires delivery context linked to the exact plan and dossier', () => {
    for (const input of [planInput(), dossierInput()]) {
      const { deliveryContext: _context, ...missing } = input;
      expect(capability.DocumentPdfInputSchema.safeParse(missing).success).toBe(false);
    }
    for (const edit of [{ planId: 'plan_002' }, { planVersion: 2 }, { planDigest: hex('e') }]) {
      expect(capability.DocumentPdfInputSchema.safeParse({ ...planInput(), deliveryContext: { ...context(), ...edit } }).success).toBe(false);
    }
    for (const edit of [{ dossierSnapshotId: 'snap-2' }, { dossierDigest: hex('e') }]) {
      expect(capability.DocumentPdfInputSchema.safeParse({ ...dossierInput(), deliveryContext: { ...context(), ...edit } }).success).toBe(false);
    }
  });

  it('rejects mutated source content even when the claimed digest and delivery context agree', () => {
    expect(capability.DocumentPdfInputSchema.safeParse({ ...planInput(), plan: { ...plan(), risks: ['Changed risk'] } }).success).toBe(false);
    const frozen = snapshot();
    expect(capability.DocumentPdfInputSchema.safeParse({ ...dossierInput(), snapshot: {
      ...frozen, pages: frozen.pages.map(page => ({ ...page, body: 'Replaced content' })),
    } }).success).toBe(false);
  });

  it('accepts only presentation names for existing versioned plan referents', () => {
    const referent = { personRef: 'jane', entryVersion: 1, name: 'Jane' };
    expect(capability.DocumentPdfInputSchema.safeParse({ ...planInput(), referents: [referent] }).success).toBe(true);
    for (const referents of [[{ ...referent, entryVersion: 2 }], [{ ...referent, personRef: 'other' }], [referent, referent]]) {
      expect(capability.DocumentPdfInputSchema.safeParse({ ...planInput(), referents }).success).toBe(false);
    }
  });

  it('forbids replacement content, receipts, bytes, filenames, MIME and remote font options', () => {
    const forbidden = [
      { receipt: receipt() }, { bytes: 'JVBERg==' }, { filename: 'pretend.pdf' }, { mediaType: 'application/pdf' },
      { mimeType: 'application/pdf' }, { fonts: { default: 'https://example.org/font.ttf' } },
      { sourceDigest: hex('a') }, { credentials: { llm: 'fake' } },
    ];
    for (const input of [planInput(), dossierInput(), genericInput()]) {
      for (const extra of forbidden) expect(capability.DocumentPdfInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
    }
    for (const input of [planInput(), dossierInput()]) {
      for (const extra of [{ blocks: data().blocks }, { markdown: 'Replacement' }, { document: data() }]) {
        expect(capability.DocumentPdfInputSchema.safeParse({ ...input, ...extra }).success).toBe(false);
      }
    }
    expect(capability.DocumentPdfInputSchema.safeParse({ ...genericInput(), document: {
      ...data(), source: { ...data().source, sha256: hex('a') },
    } }).success).toBe(false);
  });

  it('rejects active Markdown, images, font URLs and uncontrolled references', () => {
    for (const markdown of ['<script>alert(1)</script>', '![Image](https://example.org/a.png)', '@font-face { src: url(https://example.org/font.ttf) }',
      '[Run](javascript:alert(1))', '[Local](file:///tmp/a)', '[ref]: https://example.org', '{{ template }}', 'bad\u0000text']) {
      expect(capability.DocumentPdfInputSchema.safeParse({ kind: 'document', markdown, language: 'en' }).success).toBe(false);
    }
  });

  it('enforces cumulative UTF-8 limits without truncation or partial success', () => {
    const oversized = { ...genericInput(), document: { ...data(), blocks: Array.from({ length: 20 }, () => ({
      kind: 'paragraph', content: [{ text: 'é'.repeat(30000) }],
    })) } };
    expect(capability.DocumentPdfInputSchema.safeParse(oversized).success).toBe(false);
    expect(capability.DocumentPdfInputSchema.safeParse({ kind: 'document', markdown: 'é'.repeat(600000), language: 'en' }).success).toBe(false);
    const frozen = snapshot();
    const large = buildLabDossierSnapshot({
      tenantId: frozen.tenantId, organizationId: frozen.organizationId, clientId: frozen.clientId, projectId: frozen.projectId,
      snapshotId: frozen.snapshotId, cutoff: frozen.cutoff, scope: frozen.scope,
      pages: Array.from({ length: 20 }, (_, index) => ({
      ...frozen.pages[0], slug: `page-${index}`, body: 'é'.repeat(30000),
    })), planCitations: [], sources: [] });
    expect(capability.DocumentPdfInputSchema.safeParse({ ...dossierInput(), snapshot: large,
      deliveryContext: { ...context(), dossierDigest: large.manifestDigest },
    }).success).toBe(false);
    expect(capability.DocumentPdfOutputSchema.safeParse({ receipt: receipt(), partial: true }).success).toBe(false);
  });

  it('accepts only a complete PDF receipt and rejects fabricated or empty assets', () => {
    expect(capability.DocumentPdfOutputSchema.parse({ receipt: receipt() })).toEqual({ receipt: receipt() });
    expect(capability.DocumentPdfOutputSchema.safeParse({ receipt: {} }).success).toBe(false);
    for (const extra of [{ sizeBytes: 0 }, { mediaType: 'text/markdown' }, { origin: { kind: 'link', url: 'https://example.org/a.pdf' } }]) {
      const value = receipt();
      expect(capability.DocumentPdfOutputSchema.safeParse({ receipt: { ...value, asset: { ...value.asset, ...extra } } }).success).toBe(false);
    }
    expect(capability.DocumentPdfOutputSchema.safeParse({ receipt: receipt(), bytes: 'JVBERg==' }).success).toBe(false);
  });
});
