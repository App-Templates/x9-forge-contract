import type { ReconciledMandate } from '../../organization/business-unit-mandate.js';
import { DEV_SESSION_ACCEPTANCE_MAX_CRITERIA, type DevSessionAttestor, type DevSessionCriterion } from './session-acceptance.js';
import { devSessionDeliverableKeyProblem, mandateDeliverableKeys, type DevSessionAssignment } from './session-assignment.js';

type MandateCriterion = {
  text: string;
  attestor: Extract<DevSessionAttestor, 'revisore' | 'referente'>;
  units: string[];
  /** Present only when the plan declared a structured requirement for this position. */
  proof?: string;
};

/** Extract only this piece's criteria, preserving blank entries and their plan positions. */
export function devSessionMandateCriteria(mandate: ReconciledMandate, deliverableKey: string): MandateCriterion[] | null {
  if (!mandateDeliverableKeys(mandate).includes(deliverableKey)) return null;
  const { businessUnit, workBreakdown, deliveryShape } = mandate.planSection;
  let deliveryCriteria: string[];
  let units: string[] = [];
  let requirements: { attestor: DevSessionAttestor; proof: string }[] | undefined;
  if (deliveryShape === 'product' && workBreakdown !== undefined) {
    const item = workBreakdown.find((entry) => entry.id === deliverableKey);
    if (item === undefined) return null;
    deliveryCriteria = item.deliveryCriteria;
    units = item.owners.filter((owner) => owner.buSlug !== businessUnit.buSlug).map((owner) => owner.buSlug);
    requirements = item.requirements;
  } else {
    const section = businessUnit.sections?.find((entry) => entry.id === deliverableKey);
    if (section === undefined) return null;
    deliveryCriteria = section.deliveryCriteria;
    requirements = section.requirements;
  }
  const fallback = businessUnit.reviewer !== undefined ? 'revisore' : 'referente';
  return deliveryCriteria.map((text, index) => {
    // The plan schema keeps requirements one-to-one with deliveryCriteria, so the position is the link; text and id stay those of the criterion.
    const declared = requirements?.[index];
    if (declared === undefined) return { text: text.trim(), attestor: fallback, units: [...units] };
    // A declared reviewer is honoured only when the unit has one, as today; a declared referent is kept as written.
    const attestor = declared.attestor === 'revisore' && businessUnit.reviewer !== undefined ? 'revisore' : 'referente';
    return { text: text.trim(), attestor, units: [...units], proof: declared.proof };
  });
}

export const DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS = [
  'deliverable_key_problem',
  'mandate_criterion_blank',
  'mandate_criterion_missing',
  'mandate_criterion_unknown',
  'mandate_attestor_not_available',
  'mandate_unit_not_owner',
] as const;

type MandateAcceptanceProblem = { code: (typeof DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS)[number]; details: string[] };

/** Return the first refusal, in contract order, with every affected text, position or criterion id. */
export function devSessionMandateAcceptanceProblem(assignment: DevSessionAssignment, mandate: ReconciledMandate): MandateAcceptanceProblem | null {
  if (assignment.acceptance === undefined) return null;
  const keyProblem = devSessionDeliverableKeyProblem(assignment, mandate);
  if (keyProblem !== null) return { code: 'deliverable_key_problem', details: [keyProblem] };
  // The key check guarantees that the piece exists within this mandate and belongs to this unit.
  const mandateCriteria = devSessionMandateCriteria(mandate, assignment.deliverableKey ?? '') ?? [];
  const criteria = mandateCriteria.map((criterion) => criterion.text);
  const blank = criteria.flatMap((text, index) => text.trim() === '' ? [String(index + 1)] : []);
  if (blank.length > 0) return { code: 'mandate_criterion_blank', details: blank };
  const fromMandate = assignment.acceptance.criteria.filter((criterion) => criterion.origin === 'mandato');
  const listed = new Set(fromMandate.map((criterion) => criterion.text.trim()));
  const missing = criteria.filter((text) => !listed.has(text.trim()));
  if (missing.length > 0) return { code: 'mandate_criterion_missing', details: missing };
  const expected = new Set(criteria);
  const unknown = fromMandate.filter((criterion) => !expected.has(criterion.text.trim())).map((criterion) => criterion.id);
  if (unknown.length > 0) return { code: 'mandate_criterion_unknown', details: unknown };
  const unavailable = fromMandate.filter((criterion) => criterion.attestor === 'revisore' && mandate.planSection.businessUnit.reviewer === undefined).map((criterion) => criterion.id);
  if (unavailable.length > 0) return { code: 'mandate_attestor_not_available', details: unavailable };
  const units = mandateCriteria[0]?.units ?? [];
  const nonOwners = fromMandate.filter((criterion) => criterion.unit !== undefined && !units.includes(criterion.unit)).map((criterion) => criterion.id);
  if (nonOwners.length > 0) return { code: 'mandate_unit_not_owner', details: nonOwners };
  return null;
}

/** Stable name of a mandate criterion: the piece key plus its 1-based position in the saved plan, so nothing stored changes. */
export function mandateCriterionId(deliverableKey: string, index: number): string {
  return `${deliverableKey}.${index + 1}`;
}

/** Written proof for criteria carried over from the mandate; it only says that the referent judges them. */
export const DEV_SESSION_MANDATE_CRITERION_PROOF = 'Giudizio del referente sulla consegna, con l\'anteprima da guardare';

export const DEV_SESSION_COMPLETE_MANDATE_PROBLEMS = [
  'deliverable_key_problem',
  'mandate_criterion_blank',
  'criterion_id_too_long',
  'criterion_id_taken',
  'too_many_criteria',
] as const;

// Same limit as the criterion id schema in session-acceptance.ts (not exported there).
const CRITERION_ID_MAX = 40;

type CompleteMandateResult =
  | { ok: true; criteria: DevSessionCriterion[] }
  | { ok: false; code: (typeof DEV_SESSION_COMPLETE_MANDATE_PROBLEMS)[number]; details: string[] };

/**
 * Append the mandate criteria the lead did not write, named by position. Criteria already in `own`
 * (same trimmed text, origin `mandato`) are left untouched, so hand-written input comes back identical.
 */
export function devSessionCompleteMandateCriteria(mandate: ReconciledMandate, deliverableKey: string, own: DevSessionCriterion[]): CompleteMandateResult {
  const fromMandate = devSessionMandateCriteria(mandate, deliverableKey);
  if (fromMandate === null) return { ok: false, code: 'deliverable_key_problem', details: [deliverableKey] };
  const blank = fromMandate.flatMap((criterion, index) => criterion.text === '' ? [String(index + 1)] : []);
  if (blank.length > 0) return { ok: false, code: 'mandate_criterion_blank', details: blank };
  const present = new Set(own.filter((criterion) => criterion.origin === 'mandato').map((criterion) => criterion.text.trim()));
  const added: DevSessionCriterion[] = [];
  fromMandate.forEach((criterion, index) => {
    if (present.has(criterion.text)) return;
    present.add(criterion.text);
    added.push({ id: mandateCriterionId(deliverableKey, index), text: criterion.text, attestor: criterion.attestor, proof: criterion.proof ?? DEV_SESSION_MANDATE_CRITERION_PROOF, origin: 'mandato' });
  });
  if (added.length === 0) return { ok: true, criteria: own };
  // Too long is refused, never cut: a cut id could collide with another piece's.
  const tooLong = added.filter((criterion) => criterion.id.length > CRITERION_ID_MAX).map((criterion) => criterion.id);
  if (tooLong.length > 0) return { ok: false, code: 'criterion_id_too_long', details: tooLong };
  const taken = added.filter((criterion) => own.some((entry) => entry.id === criterion.id)).map((criterion) => criterion.id);
  if (taken.length > 0) return { ok: false, code: 'criterion_id_taken', details: taken };
  const total = own.length + added.length;
  if (total > DEV_SESSION_ACCEPTANCE_MAX_CRITERIA) return { ok: false, code: 'too_many_criteria', details: [String(total)] };
  return { ok: true, criteria: [...own, ...added] };
}
