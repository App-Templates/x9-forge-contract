import { describe, expect, it } from 'vitest';
import {
  VERTICAL_PLAN_ATTACHMENT_ROLES,
  VerticalPlanSchema,
  verticalPlanCanonicalJson,
  verticalPlanDecisionSubject,
} from '../../src/organization/vertical-plan.js';
import {
  DecisionSubjectSchema,
  decisionOutcomeMatchesSubject,
} from '../../src/organization/decision-request.js';

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

describe('vertical plan decision binding', () => {
  it('sorts keys recursively and excludes digest from canonical content', () => {
    const original = VerticalPlanSchema.parse(plan());
    const { planId, ...rest } = original;
    const reordered = {
      ...rest,
      actionPlan: { version: original.actionPlan.version, planId: original.actionPlan.planId },
      milestones: original.milestones.map(({ number, expectedGoal, dueDate, blockedBy }) => ({
        blockedBy, dueDate, expectedGoal, number,
      })),
      planId,
    };
    const canonical = verticalPlanCanonicalJson(original);
    expect(verticalPlanCanonicalJson(reordered)).toBe(canonical);
    expect(verticalPlanCanonicalJson({ ...original, digest: 'c'.repeat(64) })).toBe(canonical);
    expect(JSON.parse(canonical)).not.toHaveProperty('digest');
    expect(canonical).not.toContain(original.digest);
    expect(canonical.startsWith('{"actionPlan":{"planId":"action-0001","version":2}')).toBe(true);
    expect(canonical).toContain('"milestones":[{"blockedBy":[],"dueDate":"2026-11-01","expectedGoal":"Primi dieci contatti","number":1}');
  });

  it('includes the plan version and content in canonical text and preserves array order', () => {
    const original = VerticalPlanSchema.parse(plan());
    const canonical = verticalPlanCanonicalJson(original);
    expect(verticalPlanCanonicalJson({ ...original, version: 2 })).not.toBe(canonical);
    expect(verticalPlanCanonicalJson({ ...original, analysis: 'Updated analysis.' })).not.toBe(canonical);
    expect(verticalPlanCanonicalJson({ ...original, milestones: [...original.milestones].reverse() })).not.toBe(canonical);
  });

  it('creates a valid vertical_plan subject with the exact plan identity, version and digest', () => {
    const original = VerticalPlanSchema.parse(plan());
    const subject = verticalPlanDecisionSubject(original);
    expect(subject).toEqual({
      kind: 'vertical_plan', planId: original.planId, planVersion: 1, digest: original.digest,
    });
    expect(DecisionSubjectSchema.parse(subject)).toEqual(subject);
  });

  it('matches an outcome only to the same vertical plan version and digest', () => {
    const original = VerticalPlanSchema.parse(plan());
    const subject = verticalPlanDecisionSubject(original);
    const outcome = { subject };
    expect(decisionOutcomeMatchesSubject({ subject }, outcome)).toBe(true);
    const nextVersion = verticalPlanDecisionSubject({ ...original, version: 2 });
    expect(nextVersion.planVersion).toBe(2);
    expect(decisionOutcomeMatchesSubject({ subject: nextVersion }, outcome)).toBe(false);
    const nextDigest = verticalPlanDecisionSubject({ ...original, digest: 'c'.repeat(64) });
    expect(nextDigest.digest).toBe('c'.repeat(64));
    expect(decisionOutcomeMatchesSubject({ subject: nextDigest }, outcome)).toBe(false);
    const otherPlan = verticalPlanDecisionSubject({ ...original, planId: 'plan-0002' });
    expect(otherPlan.planId).toBe('plan-0002');
    expect(decisionOutcomeMatchesSubject({ subject: otherPlan }, outcome)).toBe(false);
  });

  it('rejects an action_plan subject for a vertical_plan outcome', () => {
    const subject = verticalPlanDecisionSubject(VerticalPlanSchema.parse(plan()));
    expect(decisionOutcomeMatchesSubject(
      { subject: { ...subject, kind: 'action_plan' } },
      { subject },
    )).toBe(false);
  });
});
