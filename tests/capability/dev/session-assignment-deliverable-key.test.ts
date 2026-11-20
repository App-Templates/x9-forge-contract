import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  DEV_SESSION_DELIVERABLE_KEY_PROBLEMS,
  DevSessionAssignmentSchema,
  devSessionAssignmentCanonicalJson,
  devSessionDeliverableKeyProblem,
  mandateDeliverableKeys,
  parseDevSessionBlock,
  renderDevSessionBlock,
} from '../../../src/capability/dev/session-assignment.js';
import { ActionPlanWorkItemSchema } from '../../../src/organization/action-plan.js';
import { AssetKeySchema, AssetVersionRefSchema, type AssetRef } from '../../../src/organization/asset.js';
import type { ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');

// sha256(devSessionAssignmentCanonicalJson(assignment)) of the assignment in session-assignment.test.ts, computed on 1.157.0.
const DIGEST_WITHOUT_KEY = 'ef2cee93f58924724cca6a0825213e34266596cc93dc97e6b72b7169261b47e7';

const asset: AssetRef = {
  assetId: 'asset-design-1',
  sha256: 'a'.repeat(64),
  name: 'home.png',
  mediaType: 'image/png',
  sizeBytes: 2048,
  origin: { kind: 'email', messageId: 'msg-1', attachmentName: 'home.png' },
  tenantId: 'tenant-1',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  createdAt: '2026-10-27T10:00:00+01:00',
};

const assignment = {
  version: 1 as const,
  tenantId: 'tenant-1',
  ownerId: '7',
  organizationId: 'good-choice',
  companyId: 'good-choice',
  projectId: 'good-choice-app',
  businessUnit: { slug: 'sviluppo' },
  requestedBy: { managementAgentId: 'capo-sviluppo', runtimeAgentId: 'capo-sviluppo', vaultAgentId: 62 },
  productKind: 'code' as const,
  title: 'Modulo A: scansione prodotto',
  task: 'Costruisci il Modulo A come PWA con test.',
  miniPlan: '1. Struttura. 2. Scansione. 3. Test.',
  materials: [
    { kind: 'asset' as const, asset },
    { kind: 'github_link' as const, url: 'https://github.com/App-Templates/gz-mockups/tree/main/home', note: 'prototipi' },
  ],
  destination: { repo: 'App-Templates/goodchoice-backtest' },
  createdAt: '2026-10-27T15:00:00+01:00',
};

const item = (id: string, buSlug: string) => ({
  id, title: id, expectedGoal: 'Goal', deliveryCriteria: ['Works'], milestone: 1,
  owners: [{ buSlug, does: 'Does' }],
});
const section = (id: string) => ({ id, title: id, expectedGoal: 'Goal', deliveryCriteria: ['Works'], milestone: 1 });

function mandate(overrides: Partial<ReconciledMandate['planSection']> = {}): ReconciledMandate {
  return {
    tenantId: 'tenant-1',
    organizationId: 'good-choice',
    clientId: 'good-choice',
    projectId: 'good-choice-app',
    planSection: {
      planId: 'plan_001',
      planVersion: 2,
      planDigest: 'a'.repeat(64),
      businessUnit: {
        buSlug: 'design',
        typeId: 'marketing',
        mandate: 'Design the product.',
        competencies: ['design'],
        lead: { role: 'capo-bu' },
        executor: 'agent',
        referent: { personRef: 'stefano', entryVersion: 3 },
        firstActivities: ['Start'],
        start: { kind: 'now' },
      },
      ...overrides,
    },
    decision: { requestId: 'decision_001', planVersion: 2 },
    referent: { personRef: 'stefano', entryVersion: 3 },
    notebookPages: [],
    reconciliation: { outcome: 'agrees' },
    reconciledAt: '2026-10-22T10:00:00+02:00',
  };
}

const productMandate = () => mandate({
  deliveryShape: 'product',
  workBreakdown: [item('design-calendario', 'design'), item('web-home', 'web'), item('design-menu', 'design')],
});
const studyMandate = () => {
  const base = mandate({ deliveryShape: 'study' });
  return { ...base, planSection: { ...base.planSection, businessUnit: { ...base.planSection.businessUnit, sections: [section('analisi-mercato'), section('piano-costi')] } } };
};
const forDesign = { ...assignment, businessUnit: { slug: 'design' }, deliverableKey: 'design-calendario' };

describe('s6304 chiave-dal-mandato: a session assignment carries the deliverable key of its mandate', () => {
  it('accepts deliverableKey, writes it in the canonical json and changes the digest', () => {
    const keyed = { ...assignment, deliverableKey: 'design-calendario' };
    expect(DevSessionAssignmentSchema.parse(keyed).deliverableKey).toBe('design-calendario');
    expect(devSessionAssignmentCanonicalJson(keyed)).toContain('"deliverableKey":"design-calendario"');
    expect(sha(devSessionAssignmentCanonicalJson(keyed))).not.toBe(DIGEST_WITHOUT_KEY);
  });

  it('refuses an invalid deliverableKey', () => {
    expect(DevSessionAssignmentSchema.safeParse({ ...assignment, deliverableKey: 'Design' }).success).toBe(false);
  });
});

describe('dry run on production shapes (R-37): assignments written before 1.159.0', () => {
  it('keeps the literal digest of the assignment without a key', () => {
    expect(sha(devSessionAssignmentCanonicalJson(assignment))).toBe(DIGEST_WITHOUT_KEY);
    expect(devSessionAssignmentCanonicalJson(assignment)).not.toContain('deliverableKey');
  });

  it('rereads a block written in today\'s form', () => {
    const block = renderDevSessionBlock(assignment, DIGEST_WITHOUT_KEY);
    const parsed = parseDevSessionBlock(`Corpo\n\n${block}\n`);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.assignment.deliverableKey).toBeUndefined();
      expect(sha(devSessionAssignmentCanonicalJson(parsed.assignment))).toBe(parsed.digest);
    }
  });

  it('rereads a block that carries the key', () => {
    const keyed = { ...assignment, deliverableKey: 'design-calendario' };
    const parsed = parseDevSessionBlock(renderDevSessionBlock(keyed, sha(devSessionAssignmentCanonicalJson(keyed))));
    expect(parsed.ok && parsed.assignment.deliverableKey).toBe('design-calendario');
  });
});

describe('mandateDeliverableKeys', () => {
  it('gives only the breakdown items of the mandate unit, in plan order', () => {
    expect(mandateDeliverableKeys(productMandate())).toEqual(['design-calendario', 'design-menu']);
  });

  it('gives the section ids of a study mandate', () => {
    expect(mandateDeliverableKeys(studyMandate())).toEqual(['analisi-mercato', 'piano-costi']);
  });

  it('gives nothing for a mandate saved before 1.129.0', () => {
    const old = mandate();
    expect(mandateDeliverableKeys(old)).toEqual([]);
    expect(devSessionDeliverableKeyProblem(forDesign, old)).toBe('mandate_without_deliverables');
  });
});

describe('devSessionDeliverableKeyProblem', () => {
  it('lists the codes', () => {
    expect(DEV_SESSION_DELIVERABLE_KEY_PROBLEMS).toHaveLength(5);
  });

  it('accepts a key of the mandate', () => {
    expect(devSessionDeliverableKeyProblem(forDesign, productMandate())).toBeNull();
    expect(devSessionDeliverableKeyProblem({ ...forDesign, deliverableKey: 'piano-costi' }, studyMandate())).toBeNull();
  });

  it('reports a missing key', () => {
    const { deliverableKey: _omit, ...without } = forDesign;
    expect(devSessionDeliverableKeyProblem(DevSessionAssignmentSchema.parse(without), productMandate())).toBe('deliverable_key_missing');
  });

  it.each([
    ['tenant', { tenantId: 'tenant-2' }],
    ['organization', { organizationId: 'other' }],
    ['project', { projectId: 'other-app' }],
  ])('reports a mandate of another %s as foreign scope', (_name, change) => {
    expect(devSessionDeliverableKeyProblem({ ...forDesign, ...change }, productMandate())).toBe('mandate_foreign_scope');
  });

  it('reports a mandate of another business unit', () => {
    expect(devSessionDeliverableKeyProblem({ ...forDesign, businessUnit: { slug: 'web' } }, productMandate())).toBe('mandate_foreign_business_unit');
  });

  it('reports a key outside the mandate, including an item of another unit', () => {
    expect(devSessionDeliverableKeyProblem({ ...forDesign, deliverableKey: 'web-home' }, productMandate())).toBe('deliverable_key_not_in_mandate');
    expect(devSessionDeliverableKeyProblem({ ...forDesign, deliverableKey: 'inventata' }, productMandate())).toBe('deliverable_key_not_in_mandate');
  });
});

describe('AssetKeySchema and AssetVersionRefSchema', () => {
  it('refuses version 0 and extra fields', () => {
    expect(AssetVersionRefSchema.safeParse({ key: 'design-calendario', version: 1 }).success).toBe(true);
    expect(AssetVersionRefSchema.safeParse({ key: 'design-calendario', version: 0 }).success).toBe(false);
    expect(AssetVersionRefSchema.safeParse({ key: 'design-calendario', version: 1, extra: 1 }).success).toBe(false);
  });

  it.each(['a', 'design-calendario', 'a'.repeat(40), 'a'.repeat(41), 'Design', 'a--b', '-a', ''])(
    'treats %j like a work item id',
    (value) => {
      expect(AssetKeySchema.safeParse(value).success).toBe(ActionPlanWorkItemSchema.shape.id.safeParse(value).success);
    },
  );
});
