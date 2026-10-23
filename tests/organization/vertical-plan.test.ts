import { describe, expect, it } from 'vitest';
import {
  VERTICAL_PLAN_ATTACHMENT_ROLES,
  VerticalPlanSchema,
} from '../../src/organization/vertical-plan.js';

const asset = (assetId: string, extra: Record<string, unknown> = {}) => ({
  assetId,
  sha256: 'a'.repeat(64),
  name: `${assetId}.pdf`,
  mediaType: 'application/pdf',
  sizeBytes: 10,
  origin: { kind: 'session', sessionId: 'session-1' },
  tenantId: 'tenant-1',
  companyId: 'company-1',
  projectId: 'project-1',
  createdAt: '2026-10-20T21:00:00+02:00',
  ...extra,
});

const plan = () => ({
  planId: 'plan-0001',
  version: 1,
  digest: 'b'.repeat(64),
  tenantId: 'tenant-1',
  organizationId: 'org-1',
  clientId: 'company-1',
  projectId: 'project-1',
  buSlug: 'vendite',
  actionPlan: { planId: 'action-0001', version: 2 },
  analysis: 'Partiamo dai clienti già raggiunti.',
  milestones: [
    { number: 1, expectedGoal: 'Primi dieci contatti', dueDate: '2026-11-01', blockedBy: [] },
    { number: 2, expectedGoal: 'Primo cliente', dueDate: '2026-11-15', blockedBy: [1] },
  ],
  blockers: [{ what: 'Elenco contatti', unlocksMilestone: 1 }],
  questions: [{ question: 'Quale budget?', unlocks: 'Milestone 2' }],
  attachments: [
    { role: 'rd_dossier', asset: asset('asset-rd', { origin: { kind: 'generated', agentId: 'agent-1' } }) },
    { role: 'executor', asset: asset('asset-ex') },
    { role: 'reviewer', asset: asset('asset-rv', { buSlug: 'vendite' }) },
    { role: 'budget', asset: asset('asset-bd') },
    { role: 'criteria', asset: asset('asset-cr') },
  ],
});

const parse = (mutate: (p: ReturnType<typeof plan>) => unknown) => {
  const p = plan();
  return VerticalPlanSchema.safeParse(mutate(p) ?? p).success;
};

describe('VerticalPlanSchema', () => {
  it('exports the five roles', () => {
    expect(VERTICAL_PLAN_ATTACHMENT_ROLES).toHaveLength(5);
  });

  it('accepts a valid plan with five attachments', () => {
    expect(VerticalPlanSchema.safeParse(plan()).success).toBe(true);
  });

  it('rejects a missing budget', () => {
    expect(parse((p) => { p.attachments = p.attachments.filter((a) => a.role !== 'budget'); })).toBe(false);
  });

  it('rejects two reviewers', () => {
    expect(parse((p) => { p.attachments.push({ role: 'reviewer', asset: asset('asset-rv2') }); })).toBe(false);
  });

  it('rejects a repeated milestone number', () => {
    expect(parse((p) => { p.milestones[1]!.number = 1; p.milestones[1]!.blockedBy = []; })).toBe(false);
  });

  it('rejects an unlocksMilestone that does not exist', () => {
    expect(parse((p) => { p.blockers[0]!.unlocksMilestone = 9; })).toBe(false);
  });

  it('rejects a blockedBy that does not exist', () => {
    expect(parse((p) => { p.milestones[1]!.blockedBy = [7]; })).toBe(false);
  });

  it('rejects an asset of another project', () => {
    expect(parse((p) => { p.attachments[1]!.asset.projectId = 'project-2'; })).toBe(false);
  });

  it('rejects an asset of another business unit', () => {
    expect(parse((p) => { p.attachments[1]!.asset = asset('asset-ex', { buSlug: 'supporto' }); })).toBe(false);
  });

  it('rejects an empty analysis', () => {
    expect(parse((p) => { p.analysis = ''; })).toBe(false);
  });

  it('rejects an extra key', () => {
    expect(parse((p) => ({ ...p, extra: true }))).toBe(false);
  });
});
