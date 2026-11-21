"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS = exports.DEV_SESSION_REQUIREMENT_PROBLEMS = exports.DEV_SESSION_REQUIREMENT_ORIGINS = exports.DEV_SESSION_TEMPLATES = exports.DEV_SESSION_TEMPLATE_MATERIALS = exports.DevSessionTemplateIdSchema = exports.DEV_SESSION_TEMPLATE_IDS = void 0;
exports.devSessionTemplateSupportsEngine = devSessionTemplateSupportsEngine;
exports.devSessionRequirements = devSessionRequirements;
exports.devSessionHasChiefStepCriterion = devSessionHasChiefStepCriterion;
exports.devSessionAcceptanceTemplateProblem = devSessionAcceptanceTemplateProblem;
const zod_1 = require("zod");
const session_acceptance_js_1 = require("./session-acceptance.cjs");
const session_acceptance_catalog_js_1 = require("./session-acceptance-catalog.cjs");
exports.DEV_SESSION_TEMPLATE_IDS = ['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco'];
exports.DevSessionTemplateIdSchema = zod_1.z.enum(exports.DEV_SESSION_TEMPLATE_IDS);
exports.DEV_SESSION_TEMPLATE_MATERIALS = ['visual_images', 'retouch_file'];
// Supported, not forbidden: Stefano, 19 Nov 2026, supports only Claude for now,
// although Codex already integrates the same constraints. Only Claude writes the
// Skill tool log line used as proof; reopen when Codex leaves the same proof.
const DESIGN_ENGINES = ['claude'];
exports.DEV_SESSION_TEMPLATES = {
    // Contract: S-11 joins the form criteria while the template stays at version 1. The capo writes
    // the version and devSessionRequirements demands equality, so bumping to 2 would reject saved
    // contracts (R56) and every capo that still writes 1. Form criteria are not stored in the
    // contract: each consumer expands them from its own copy of this package.
    'sviluppo-pezzo-app': {
        version: 1, productKind: 'code', supportedEngines: ['codex', 'claude'],
        requiredInput: ['userPath', 'data', 'proofScripts', 'visualSource'], materials: ['visual_images'],
        formCriteria: ['S-01', 'S-02', 'S-05', 'S-07', 'S-08', 'S-10', 'S-11'],
        optionalCriteria: ['S-03', 'S-04', 'S-06', 'S-09'],
    },
    // Design tools (8210): D-12..D-14 join the design form criteria at version 1, same reasoning as
    // S-11. A retouch has no final Impeccable check (table 4.11), so design-ritocco gets D-13/D-14 only.
    'design-sito': {
        version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
        requiredInput: ['screens', 'formats', 'visualSource'], materials: ['visual_images'],
        formCriteria: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'], optionalCriteria: [],
    },
    'design-schermata-app': {
        version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
        requiredInput: ['screens', 'states', 'formats', 'visualSource'], materials: ['visual_images'],
        formCriteria: ['D-01', 'D-03', 'D-04', 'D-05', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14'], optionalCriteria: [],
    },
    'design-ritocco': {
        version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
        requiredInput: ['retouch', 'formats', 'visualSource'], materials: ['retouch_file', 'visual_images'],
        formCriteria: ['D-01', 'D-03', 'D-08', 'D-11', 'D-13', 'D-14'], optionalCriteria: [],
    },
};
function templateById(id) {
    return Object.hasOwn(exports.DEV_SESSION_TEMPLATES, id) ? exports.DEV_SESSION_TEMPLATES[id] : undefined;
}
function devSessionTemplateSupportsEngine(id, engine) {
    return templateById(id)?.supportedEngines.includes(engine) ?? false;
}
exports.DEV_SESSION_REQUIREMENT_ORIGINS = ['modello', ...session_acceptance_js_1.DEV_SESSION_CRITERION_ORIGINS];
exports.DEV_SESSION_REQUIREMENT_PROBLEMS = ['template_unknown', 'template_version_unknown', 'template_optional_not_offered', 'criterion_id_clashes_catalog'];
/** Expand versioned form checks without consuming the variable criteria quota. */
function devSessionRequirements(acceptance) {
    const template = templateById(acceptance.template.id);
    if (template === undefined)
        return { ok: false, code: 'template_unknown' };
    if (acceptance.template.version !== template.version)
        return { ok: false, code: 'template_version_unknown' };
    const optionalIds = acceptance.template.optionalIds ?? [];
    if (optionalIds.some((id) => !template.optionalCriteria.some((offered) => offered === id)))
        return { ok: false, code: 'template_optional_not_offered' };
    if (acceptance.criteria.some(({ id }) => Object.hasOwn(session_acceptance_catalog_js_1.DEV_SESSION_ACCEPTANCE_CATALOG, id)))
        return { ok: false, code: 'criterion_id_clashes_catalog' };
    const catalogRequirements = [...template.formCriteria, ...optionalIds].map((id) => ({
        id, ...session_acceptance_catalog_js_1.DEV_SESSION_ACCEPTANCE_CATALOG[id], origin: 'modello',
    }));
    return { ok: true, requirements: [...catalogRequirements, ...acceptance.criteria.map((criterion) => ({ ...criterion, needs: [] }))] };
}
exports.DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS = [...exports.DEV_SESSION_REQUIREMENT_PROBLEMS, 'template_kind_mismatch', 'input_missing', 'visual_images_missing', 'visual_reference_not_material', 'retouch_file_missing'];
/**
 * Stefano 21/11, decision 7: when no existing script covers the new step, the chief's own
 * criterion (origin capo, attestor sessione) is enough and the session writes the proof.
 * Single place for this rule so every consumer admits the same forms.
 */
function devSessionHasChiefStepCriterion(criteria) {
    return criteria.some((criterion) => criterion.origin === 'capo' && criterion.attestor === 'sessione');
}
/** Pure refusal check. Consumers decide when to enable it for each product kind. */
function devSessionAcceptanceTemplateProblem(assignment) {
    const acceptance = assignment.acceptance;
    if (acceptance === undefined)
        return null;
    const requirements = devSessionRequirements(acceptance);
    if (!requirements.ok)
        return { code: requirements.code };
    // Requirements have already established that the template exists at this version.
    const template = exports.DEV_SESSION_TEMPLATES[acceptance.template.id];
    if (assignment.productKind !== template.productKind)
        return { code: 'template_kind_mismatch' };
    const missingInput = template.requiredInput.find(
    // proofScripts is not demanded when the chief wrote a session criterion for the new step.
    (key) => acceptance.input[key] === undefined && !(key === 'proofScripts' && devSessionHasChiefStepCriterion(acceptance.criteria)));
    if (missingInput !== undefined)
        return { code: 'input_missing', detail: missingInput };
    const visualSource = acceptance.input.visualSource;
    const images = assignment.materials.filter((material) => material.kind === 'asset' && material.asset.mediaType.startsWith('image/'));
    if (template.materials.includes('visual_images') && visualSource !== undefined && visualSource.kind !== 'nessuna' && images.length === 0)
        return { code: 'visual_images_missing' };
    // A Figma image is not tied to a node yet; an approved board must match its image asset.
    if (visualSource?.kind === 'tavola_approvata' && !images.some((material) => material.kind === 'asset' && material.asset.assetId === visualSource.reference))
        return { code: 'visual_reference_not_material' };
    if (template.materials.includes('retouch_file') && assignment.materials.length === 0)
        return { code: 'retouch_file_missing' };
    return null;
}
//# sourceMappingURL=session-acceptance-templates.js.map