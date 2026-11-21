import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  canonicalJson,
  type ActionPlanBuSection,
  type ActionPlanDocumentFormat,
  type ActionPlanDocumentSources,
} from '../../src/organization/action-plan.js';
import {
  ActionPlanDocumentPieceSchema,
  ReconciledMandateSchema,
  mandateDocumentPieces,
  type ActionPlanDocumentPiece,
  type ReconciledMandate,
} from '../../src/organization/index.js';

const documentFormat: ActionPlanDocumentFormat = {
  mediaType: 'application/pdf',
  parts: ['Ipotesi', 'Costi'],
  length: { unit: 'pages', min: 2, max: 8 },
};
const documentSources: ActionPlanDocumentSources = {
  pages: [{ slug: 'dossier-progetto', version: 2 }],
  materials: [{
    assetId: 'asset_email_01', sha256: 'b'.repeat(64), name: 'listino.pdf',
    mediaType: 'application/pdf', sizeBytes: 2048,
    origin: { kind: 'email', messageId: '<msg-1@example.org>', attachmentName: 'listino.pdf' },
    tenantId: 'tenant-1', companyId: 'client-1', projectId: 'project-1',
    createdAt: '2026-11-04T10:00:00+01:00',
  }],
};

// Code fixture shaped like the study plan; no production document is loaded.
const costi: ActionPlanBuSection = {
  id: 'costi', title: 'Costi', expectedGoal: 'Read the project costs and their assumptions.',
  deliveryCriteria: ['Voci di costo con fonte', 'Ipotesi esplicite', 'Totali verificabili'],
  milestone: 2, needsFrom: [{ buSlug: 'ricerca', what: 'Listini aggiornati' }],
};
const scenari: ActionPlanBuSection = {
  id: 'scenari', title: 'Scenari', expectedGoal: 'Compare alternative financial scenarios.',
  deliveryCriteria: ['Tre scenari confrontabili', 'Rischi espliciti'], milestone: 3,
};

function mandate(sections?: ActionPlanBuSection[], buSlug = 'dati'): ReconciledMandate {
  return ReconciledMandateSchema.parse({
    tenantId: 'tenant-1', organizationId: 'organization-1', clientId: 'client-1', projectId: 'project-1',
    planSection: {
      planId: 'plan_001', planVersion: 1, planDigest: 'a'.repeat(64), deliveryShape: 'study',
      businessUnit: {
        buSlug, typeId: 'marketing', mandate: 'Deliver the financial analysis.', competencies: ['finance'],
        lead: { role: 'capo-bu' }, executor: 'agent',
        referent: { personRef: 'stefano', entryVersion: 3 }, firstActivities: ['Read the dossier'],
        start: { kind: 'now' }, ...(sections === undefined ? {} : { sections }),
      },
    },
    decision: { requestId: 'decision_001', planVersion: 1 },
    referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
    reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-04T10:00:00+01:00',
  });
}

describe('s8393 document pieces', () => {
  it('s8393 pezzo-del-mandato', () => {
    const input = mandate([{ ...costi, documentFormat, documentSources }, scenari]);
    const expected: ActionPlanDocumentPiece = {
      id: costi.id, title: costi.title, expectedGoal: costi.expectedGoal,
      deliveryCriteria: costi.deliveryCriteria, documentFormat, documentSources,
    };
    const pieces = mandateDocumentPieces(input);
    expect(pieces).toStrictEqual([expected]);
    expect(Object.keys(pieces[0]).sort()).toEqual([
      'deliveryCriteria', 'documentFormat', 'documentSources', 'expectedGoal', 'id', 'title',
    ]);
    expect(pieces[0].deliveryCriteria).toStrictEqual(costi.deliveryCriteria);
    expect(pieces[0].deliveryCriteria).toHaveLength(3);
    expect(ActionPlanDocumentPieceSchema.parse(expected)).toStrictEqual(expected);
    expect(ActionPlanDocumentPieceSchema.safeParse({ ...expected, milestone: 2 }).success).toBe(false);
    expect(ActionPlanDocumentPieceSchema.safeParse({ ...expected, needsFrom: [] }).success).toBe(false);
  });

  it('s8393 solo-forma', () => {
    const pieces = mandateDocumentPieces(mandate([{ ...costi, documentFormat }]));
    expect(pieces).toStrictEqual([{
      id: costi.id, title: costi.title, expectedGoal: costi.expectedGoal,
      deliveryCriteria: costi.deliveryCriteria, documentFormat,
    }]);
    expect(pieces[0]).not.toHaveProperty('documentSources');
  });

  it('s8393 solo-fonti', () => {
    const pieces = mandateDocumentPieces(mandate([{ ...costi, documentSources }]));
    expect(pieces).toStrictEqual([{
      id: costi.id, title: costi.title, expectedGoal: costi.expectedGoal,
      deliveryCriteria: costi.deliveryCriteria, documentSources,
    }]);
    expect(pieces[0]).not.toHaveProperty('documentFormat');
  });

  it('s8393 due-documenti', () => {
    const pieces = mandateDocumentPieces(mandate([
      { ...scenari, documentSources }, { ...costi, documentFormat },
    ]));
    expect(pieces).toStrictEqual([
      { id: scenari.id, title: scenari.title, expectedGoal: scenari.expectedGoal,
        deliveryCriteria: scenari.deliveryCriteria, documentSources },
      { id: costi.id, title: costi.title, expectedGoal: costi.expectedGoal,
        deliveryCriteria: costi.deliveryCriteria, documentFormat },
    ]);
  });

  it('s8393 nessun-documento', () => {
    const oldStudy = mandate([costi, scenari]);
    expect(ReconciledMandateSchema.parse(oldStudy)).toStrictEqual(oldStudy);
    expect(mandateDocumentPieces(oldStudy)).toStrictEqual([]);
  });

  it('s8393 sezioni-assenti', () => {
    const oldStudy = mandate();
    expect(oldStudy.planSection.businessUnit).not.toHaveProperty('sections');
    expect(mandateDocumentPieces(oldStudy)).toStrictEqual([]);
  });

  it('s8393 niente-inferenze', () => {
    const explicit = mandate([{ ...costi, documentFormat }], 'vendite');
    explicit.planSection.deliveryShape = 'product';
    explicit.planSection.businessUnit.executor = 'night';
    expect(ReconciledMandateSchema.parse(explicit)).toStrictEqual(explicit);
    expect(mandateDocumentPieces(explicit)).toStrictEqual([{
      id: costi.id, title: costi.title, expectedGoal: costi.expectedGoal,
      deliveryCriteria: costi.deliveryCriteria, documentFormat,
    }]);
    expect(mandateDocumentPieces(mandate([costi, scenari], 'dati'))).toStrictEqual([]);
  });

  it('s8393 input-immutato', () => {
    const input = mandate([{ ...costi, documentFormat, documentSources }, scenari]);
    const before = structuredClone(input);
    const canonical = canonicalJson(input);
    const fingerprint = createHash('sha256').update(canonical).digest('hex');
    mandateDocumentPieces(input);
    expect(input).toStrictEqual(before);
    expect(canonicalJson(input)).toBe(canonical);
    expect(createHash('sha256').update(canonicalJson(input)).digest('hex')).toBe(fingerprint);
  });
});
