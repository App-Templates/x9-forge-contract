import { devSessionDeliverableKeyProblem, mandateDeliverableKeys } from "./session-assignment.js";
/** Extract only this piece's criteria, preserving blank entries and their plan positions. */
export function devSessionMandateCriteria(mandate, deliverableKey) {
    if (!mandateDeliverableKeys(mandate).includes(deliverableKey))
        return null;
    const { businessUnit, workBreakdown, deliveryShape } = mandate.planSection;
    let deliveryCriteria;
    let units = [];
    if (deliveryShape === 'product' && workBreakdown !== undefined) {
        const item = workBreakdown.find((entry) => entry.id === deliverableKey);
        if (item === undefined)
            return null;
        deliveryCriteria = item.deliveryCriteria;
        units = item.owners.filter((owner) => owner.buSlug !== businessUnit.buSlug).map((owner) => owner.buSlug);
    }
    else {
        const section = businessUnit.sections?.find((entry) => entry.id === deliverableKey);
        if (section === undefined)
            return null;
        deliveryCriteria = section.deliveryCriteria;
    }
    const attestor = businessUnit.reviewer !== undefined ? 'revisore' : 'referente';
    return deliveryCriteria.map((text) => ({ text: text.trim(), attestor, units: [...units] }));
}
export const DEV_SESSION_MANDATE_ACCEPTANCE_PROBLEMS = [
    'deliverable_key_problem',
    'mandate_criterion_blank',
    'mandate_criterion_missing',
    'mandate_criterion_unknown',
    'mandate_attestor_not_available',
    'mandate_unit_not_owner',
];
/** Return the first refusal, in contract order, with every affected text, position or criterion id. */
export function devSessionMandateAcceptanceProblem(assignment, mandate) {
    if (assignment.acceptance === undefined)
        return null;
    const keyProblem = devSessionDeliverableKeyProblem(assignment, mandate);
    if (keyProblem !== null)
        return { code: 'deliverable_key_problem', details: [keyProblem] };
    // The key check guarantees that the piece exists within this mandate and belongs to this unit.
    const mandateCriteria = devSessionMandateCriteria(mandate, assignment.deliverableKey ?? '') ?? [];
    const criteria = mandateCriteria.map((criterion) => criterion.text);
    const blank = criteria.flatMap((text, index) => text.trim() === '' ? [String(index + 1)] : []);
    if (blank.length > 0)
        return { code: 'mandate_criterion_blank', details: blank };
    const fromMandate = assignment.acceptance.criteria.filter((criterion) => criterion.origin === 'mandato');
    const listed = new Set(fromMandate.map((criterion) => criterion.text.trim()));
    const missing = criteria.filter((text) => !listed.has(text.trim()));
    if (missing.length > 0)
        return { code: 'mandate_criterion_missing', details: missing };
    const expected = new Set(criteria);
    const unknown = fromMandate.filter((criterion) => !expected.has(criterion.text.trim())).map((criterion) => criterion.id);
    if (unknown.length > 0)
        return { code: 'mandate_criterion_unknown', details: unknown };
    const unavailable = fromMandate.filter((criterion) => criterion.attestor === 'revisore' && mandate.planSection.businessUnit.reviewer === undefined).map((criterion) => criterion.id);
    if (unavailable.length > 0)
        return { code: 'mandate_attestor_not_available', details: unavailable };
    const units = mandateCriteria[0]?.units ?? [];
    const nonOwners = fromMandate.filter((criterion) => criterion.unit !== undefined && !units.includes(criterion.unit)).map((criterion) => criterion.id);
    if (nonOwners.length > 0)
        return { code: 'mandate_unit_not_owner', details: nonOwners };
    return null;
}
//# sourceMappingURL=session-acceptance-mandate.js.map