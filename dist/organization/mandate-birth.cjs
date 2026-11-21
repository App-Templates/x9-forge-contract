"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.actionPlanContractProblems = actionPlanContractProblems;
exports.mandateContractProblems = mandateContractProblems;
// One engine for plan and mandate, so the two callers cannot drift apart.
function piecesProblems(pieces) {
    const problems = [];
    for (const { piece, path } of pieces) {
        if (piece.requirements === undefined)
            problems.push(`${path}.requirements`);
        if (piece.specifications === undefined)
            problems.push(`${path}.specifications`);
        if (piece.outputForm === undefined)
            problems.push(`${path}.outputForm`);
    }
    return problems;
}
// Items that only gather children have no owner and are not asked for metadata: the leaves carry it.
function ownedItems(items, keep) {
    return items.flatMap((item, index) => item.owners.length > 0 && keep(item) ? [{ piece: item, path: `workBreakdown.${index}` }] : []);
}
function shapeOf(declared, hasBreakdown) {
    return declared ?? (hasBreakdown ? 'product' : 'study');
}
/** Paths of the metadata a new plan still lacks. An empty list means the plan may enter. */
function actionPlanContractProblems(plan) {
    if (shapeOf(plan.deliveryShape, plan.workBreakdown !== undefined) === 'product') {
        const pieces = ownedItems(plan.workBreakdown ?? [], () => true);
        // No named pieces is never a success: report the container.
        return pieces.length === 0 ? ['workBreakdown'] : piecesProblems(pieces);
    }
    const containers = [];
    const pieces = plan.businessUnits.flatMap((unit, unitIndex) => {
        if (unit.sections === undefined || unit.sections.length === 0) {
            if (unit.start.kind === 'now')
                containers.push(`businessUnits.${unitIndex}.sections`);
            return [];
        }
        return unit.sections.map((piece, index) => ({ piece, path: `businessUnits.${unitIndex}.sections.${index}` }));
    });
    if (pieces.length === 0 && containers.length === 0)
        return ['businessUnits'];
    return [...containers, ...piecesProblems(pieces)];
}
/** Same check for one unit's mandate; only the pieces of that unit are asked, never those of other units. */
function mandateContractProblems(planSection) {
    const { businessUnit } = planSection;
    if (shapeOf(planSection.deliveryShape, planSection.workBreakdown !== undefined) === 'product') {
        const pieces = ownedItems(planSection.workBreakdown ?? [], (item) => item.owners.some((owner) => owner.buSlug === businessUnit.buSlug));
        return pieces.length === 0 ? ['workBreakdown'] : piecesProblems(pieces);
    }
    const sections = businessUnit.sections ?? [];
    if (sections.length === 0)
        return ['businessUnit.sections'];
    return piecesProblems(sections.map((piece, index) => ({ piece, path: `businessUnit.sections.${index}` })));
}
//# sourceMappingURL=mandate-birth.js.map