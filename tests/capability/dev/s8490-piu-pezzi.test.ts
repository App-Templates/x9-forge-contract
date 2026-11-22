import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as mandateModule from '../../../src/capability/dev/session-acceptance-mandate.js';
import * as paperclipModule from '../../../src/capability/dev/session-acceptance-paperclip.js';
import * as assignmentModule from '../../../src/capability/dev/session-assignment.js';
import { ReconciledMandateSchema, type ReconciledMandate } from '../../../src/organization/business-unit-mandate.js';

const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const fixture = readFileSync(new URL('./session-assignment-s8490-r58.md', import.meta.url), 'utf8');

const criteriaOf = (key: string) => [`${key}: si vede nel browser.`, `${key}: il referente lo approva.`];

// Design unit with two pieces in the mandate; the saved block of R58 carries only the first.
const mandate: ReconciledMandate = ReconciledMandateSchema.parse({
  tenantId: 'tenant-1', organizationId: 'dispensa-pronta', clientId: 'dispensa-pronta', projectId: 'dispensa-pronta-app',
  planSection: {
    planId: 'plan_001', planVersion: 2, planDigest: 'a'.repeat(64), deliveryShape: 'product',
    businessUnit: {
      buSlug: 'design', typeId: 'marketing', mandate: 'Design the app.', competencies: ['design'],
      lead: { role: 'capo-bu' }, executor: 'agent', referent: { personRef: 'stefano', entryVersion: 3 },
      firstActivities: ['Start'], start: { kind: 'now' },
    },
    workBreakdown: ['stati-di-sistema', 'catalogo', 'altro-reparto'].map((id) => ({
      id, title: id, expectedGoal: 'Goal', deliveryCriteria: criteriaOf(id), milestone: 1,
      owners: [{ buSlug: id === 'altro-reparto' ? 'web' : 'design', does: 'Does' }],
    })),
  },
  decision: { requestId: 'decision_001', planVersion: 2 },
  referent: { personRef: 'stefano', entryVersion: 3 }, notebookPages: [],
  reconciliation: { outcome: 'agrees' }, reconciledAt: '2026-11-21T10:00:00+01:00',
});

function saved() {
  const parsed = assignmentModule.parseDevSessionBlock(fixture);
  if (!parsed.ok) throw new Error(parsed.reason);
  return parsed;
}
const withKeys = (keys: string[], extra: Record<string, unknown> = {}) =>
  ({ ...saved().assignment, deliverableKey: keys[0], deliverableKeys: keys, ...extra });
const acceptance = (criteria: unknown[]) => ({ version: 1, template: { id: 'sviluppo-pezzo-app', version: 1 }, input: {}, criteria });
const own = (key: string, index: number) => ({
  id: `own-${key}-${index}`, text: criteriaOf(key)[index]!, attestor: 'referente', proof: 'Giudizio del referente.', origin: 'mandato',
});

describe('s8490 piu-pezzi', () => {
  it('s8490 regressione-r67-rifacimento-con-piu-pezzi', () => {
    // The saved block of R58 still reads with the same digest and counts as one piece.
    const { assignment: old, digest } = saved();
    expect(sha(assignmentModule.devSessionAssignmentCanonicalJson(old))).toBe(digest);
    expect(assignmentModule.devSessionDeliverableKeys(old)).toEqual(['stati-di-sistema']);
    expect(assignmentModule.devSessionDeliverableKeyProblem(old, mandate)).toBeNull();

    const two = assignmentModule.DevSessionAssignmentSchema.parse(withKeys(['stati-di-sistema', 'catalogo']));
    expect(assignmentModule.devSessionDeliverableKeys(two)).toEqual(['stati-di-sistema', 'catalogo']);
    expect(assignmentModule.devSessionAssignmentCanonicalJson(two)).toContain('"deliverableKeys":["stati-di-sistema","catalogo"]');
    expect(assignmentModule.devSessionDeliverableKeyProblem(two, mandate)).toBeNull();
    const stranger = assignmentModule.DevSessionAssignmentSchema.parse(withKeys(['stati-di-sistema', 'altro-reparto']));
    expect(assignmentModule.devSessionDeliverableKeyProblem(stranger, mandate)).toBe('deliverable_key_not_in_mandate');
    const unknown = assignmentModule.DevSessionAssignmentSchema.parse(withKeys(['stati-di-sistema', 'inesistente']));
    expect(assignmentModule.devSessionDeliverableKeyProblem(unknown, mandate)).toBe('deliverable_key_not_in_mandate');

    // The criteria of every piece are added, named <piece>.<n>.
    const completed = mandateModule.devSessionCompleteMandateCriteria(mandate, ['stati-di-sistema', 'catalogo'], []);
    expect(completed.ok && completed.criteria.map((criterion) => criterion.id)).toEqual([
      'stati-di-sistema.1', 'stati-di-sistema.2', 'catalogo.1', 'catalogo.2',
    ]);
    const foreign = mandateModule.devSessionCompleteMandateCriteria(mandate, ['stati-di-sistema', 'altro-reparto'], []);
    expect(foreign).toEqual({ ok: false, code: 'deliverable_key_problem', details: ['altro-reparto'] });
    // A string keeps today's behaviour.
    const single = mandateModule.devSessionCompleteMandateCriteria(mandate, 'catalogo', []);
    expect(single.ok && single.criteria.map((criterion) => criterion.id)).toEqual(['catalogo.1', 'catalogo.2']);

    // A contract without the criteria of the second piece is refused.
    const firstOnly = assignmentModule.DevSessionAssignmentSchema.parse(
      withKeys(['stati-di-sistema', 'catalogo'], { acceptance: acceptance([own('stati-di-sistema', 0), own('stati-di-sistema', 1)]) }),
    );
    expect(mandateModule.devSessionMandateAcceptanceProblem(firstOnly, mandate)).toEqual({
      code: 'mandate_criterion_missing', details: criteriaOf('catalogo'),
    });
    const both = assignmentModule.DevSessionAssignmentSchema.parse(withKeys(['stati-di-sistema', 'catalogo'], {
      acceptance: acceptance(['stati-di-sistema', 'catalogo'].flatMap((key) => [own(key, 0), own(key, 1)])),
    }));
    expect(mandateModule.devSessionMandateAcceptanceProblem(both, mandate)).toBeNull();
  });

  it('refuses a list with a repeated piece, a first piece that differs, or more than the cap', () => {
    const refused = (value: Record<string, unknown>) => {
      const result = assignmentModule.DevSessionAssignmentSchema.safeParse(value);
      return result.success ? [] : result.error.issues.map((issue) => issue.message);
    };
    expect(refused(withKeys(['stati-di-sistema', 'stati-di-sistema']))).toContain('deliverable_keys_duplicate');
    expect(refused(withKeys(['catalogo', 'stati-di-sistema'], { deliverableKey: 'stati-di-sistema' }))).toContain('deliverable_key_not_first');
    expect(refused(withKeys([]))).not.toEqual([]);
    const many = Array.from({ length: assignmentModule.DEV_SESSION_MAX_DELIVERABLE_KEYS + 1 }, (_, index) => `pezzo-${index}`);
    expect(refused(withKeys(many))).not.toEqual([]);
    expect(assignmentModule.DEV_SESSION_MAX_DELIVERABLE_KEYS).toBe(20);
  });

  it('writes "Pezzi: a, b" in the contract document only with more than one piece', () => {
    const { assignment } = saved();
    const accepted = assignmentModule.DevSessionAssignmentSchema.parse(
      withKeys(['stati-di-sistema', 'catalogo'], { acceptance: acceptance([own('stati-di-sistema', 0)]) }),
    ).acceptance!;
    const base = { acceptance: accepted, issueNumber: 58, digest: 'b'.repeat(64) };
    const many = paperclipModule.devSessionContractDocumentBody({ ...base, deliverableKey: 'stati-di-sistema', deliverableKeys: ['stati-di-sistema', 'catalogo'] }).body;
    expect(many).toContain('Pezzi: stati-di-sistema, catalogo');
    expect(many).not.toContain('Pezzo:');
    const one = paperclipModule.devSessionContractDocumentBody({ ...base, deliverableKey: assignment.deliverableKey, deliverableKeys: ['stati-di-sistema'] }).body;
    expect(one).toContain('Pezzo: stati-di-sistema');
    expect(one).not.toContain('Pezzi:');
  });
});
