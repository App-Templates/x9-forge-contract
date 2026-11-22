"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VISUAL_IMAGES_MISSING_MOVE = exports.DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS = exports.DEV_SESSION_REQUIREMENT_PROBLEMS = exports.DEV_SESSION_REQUIREMENT_ORIGINS = exports.DEV_SESSION_TEMPLATES_V2 = exports.DEV_SESSION_TEMPLATES = exports.DEV_SESSION_MATERIAL_ASSET_TYPES = exports.DEV_SESSION_TEMPLATE_MATERIALS = exports.DevSessionTemplateIdSchema = exports.DEV_SESSION_TEMPLATE_IDS = void 0;
exports.devSessionMaterialsByRole = devSessionMaterialsByRole;
exports.devSessionTemplateSupportsEngine = devSessionTemplateSupportsEngine;
exports.devSessionScoreThresholds = devSessionScoreThresholds;
exports.devSessionTasteThresholds = devSessionTasteThresholds;
exports.devSessionRequirements = devSessionRequirements;
exports.devSessionHasChiefStepCriterion = devSessionHasChiefStepCriterion;
exports.devSessionAcceptanceTemplateProblem = devSessionAcceptanceTemplateProblem;
const zod_1 = require("zod");
const session_acceptance_js_1 = require("./session-acceptance.cjs");
const session_acceptance_catalog_js_1 = require("./session-acceptance-catalog.cjs");
exports.DEV_SESSION_TEMPLATE_IDS = ['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco'];
exports.DevSessionTemplateIdSchema = zod_1.z.enum(exports.DEV_SESSION_TEMPLATE_IDS);
exports.DEV_SESSION_TEMPLATE_MATERIALS = ['visual_images', 'retouch_file', 'approved_images', 'brand_assets', 'excellence_examples'];
// Memory owns asset roles: names, notes and media types must never guess a client's brand.
exports.DEV_SESSION_MATERIAL_ASSET_TYPES = {
    approved_images: 'design-approvato', brand_assets: 'asset-marchio', excellence_examples: 'esempio-eccellenza',
};
function devSessionMaterialsByRole(materials, role) {
    return materials.filter((material) => material.kind === 'asset' && material.asset.assetType === exports.DEV_SESSION_MATERIAL_ASSET_TYPES[role]);
}
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
// Keep the recommended thresholds as model data, never duplicated in criterion text or checks.
const DESIGN_SCORE_THRESHOLDS = {
    dimensionMin: 3, auditTotalMin: 16, critiqueMin: 30, critiqueOutOf: 40, critiqueMinScored: 8, gapMax: 1,
};
// Taste grid thresholds, app models only: a site goes through the Taste gate (D-02), not this grid.
const DESIGN_TASTE_THRESHOLDS = { itemMin: 3, totalMin: 21, itemMaxWithFail: 2 };
// Version 1 is deliberately untouched: consumers must explicitly opt into the new proofs.
exports.DEV_SESSION_TEMPLATES_V2 = {
    'design-sito': {
        ...exports.DEV_SESSION_TEMPLATES['design-sito'], version: 2,
        materials: ['visual_images', 'approved_images', 'brand_assets', 'excellence_examples'],
        formCriteria: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-06', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21'],
        scoreThresholds: DESIGN_SCORE_THRESHOLDS,
    },
    'design-schermata-app': {
        ...exports.DEV_SESSION_TEMPLATES['design-schermata-app'], version: 2,
        materials: ['visual_images', 'approved_images', 'brand_assets', 'excellence_examples'],
        formCriteria: ['D-01', 'D-03', 'D-04', 'D-05', 'D-06', 'D-07', 'D-08', 'D-09', 'D-11', 'D-12', 'D-13', 'D-14', 'D-15', 'D-16', 'D-17', 'D-18', 'D-19', 'D-20', 'D-21', 'D-22', 'D-23'],
        scoreThresholds: DESIGN_SCORE_THRESHOLDS, tasteThresholds: DESIGN_TASTE_THRESHOLDS,
    },
    'design-ritocco': {
        ...exports.DEV_SESSION_TEMPLATES['design-ritocco'], version: 2,
        materials: ['retouch_file', 'visual_images', 'approved_images', 'brand_assets', 'excellence_examples'],
        formCriteria: ['D-01', 'D-03', 'D-06', 'D-08', 'D-11', 'D-13', 'D-14', 'D-15', 'D-19', 'D-20', 'D-21', 'D-23'],
        scoreThresholds: DESIGN_SCORE_THRESHOLDS, tasteThresholds: DESIGN_TASTE_THRESHOLDS,
    },
};
const TEMPLATE_VERSIONS = {
    'sviluppo-pezzo-app': [exports.DEV_SESSION_TEMPLATES['sviluppo-pezzo-app']],
    'design-sito': [exports.DEV_SESSION_TEMPLATES['design-sito'], exports.DEV_SESSION_TEMPLATES_V2['design-sito']],
    'design-schermata-app': [exports.DEV_SESSION_TEMPLATES['design-schermata-app'], exports.DEV_SESSION_TEMPLATES_V2['design-schermata-app']],
    'design-ritocco': [exports.DEV_SESSION_TEMPLATES['design-ritocco'], exports.DEV_SESSION_TEMPLATES_V2['design-ritocco']],
};
function templateById(id, version) {
    if (!Object.hasOwn(TEMPLATE_VERSIONS, id))
        return { ok: false, code: 'template_unknown' };
    const versions = TEMPLATE_VERSIONS[id];
    const template = versions.find((template) => template.version === version);
    return template === undefined ? { ok: false, code: 'template_version_unknown' } : { ok: true, template };
}
function devSessionTemplateSupportsEngine(id, engine) {
    const resolved = templateById(id, 1);
    return resolved.ok && resolved.template.supportedEngines.includes(engine);
}
/** Read the selected model only; saved contracts and unknown versions get no implicit scores. */
function devSessionScoreThresholds(acceptance) {
    const resolved = templateById(acceptance.template.id, acceptance.template.version);
    return resolved.ok ? resolved.template.scoreThresholds : undefined;
}
/** Taste grid thresholds of the selected model only; sites, version 1 and saved contracts get none. */
function devSessionTasteThresholds(acceptance) {
    const resolved = templateById(acceptance.template.id, acceptance.template.version);
    return resolved.ok ? resolved.template.tasteThresholds : undefined;
}
exports.DEV_SESSION_REQUIREMENT_ORIGINS = ['modello', ...session_acceptance_js_1.DEV_SESSION_CRITERION_ORIGINS];
exports.DEV_SESSION_REQUIREMENT_PROBLEMS = ['template_unknown', 'template_version_unknown', 'template_optional_not_offered', 'criterion_id_clashes_catalog'];
/** Expand versioned form checks without consuming the variable criteria quota. */
function devSessionRequirements(acceptance) {
    const resolved = templateById(acceptance.template.id, acceptance.template.version);
    if (!resolved.ok)
        return resolved;
    const { template } = resolved;
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
exports.VISUAL_IMAGES_MISSING_MOVE = 'Un pdf non vale come immagine della tavola: allega immagini png o jpeg ai materiali, oppure scrivi visualSource con kind nessuna se non esiste una tavola di riferimento.';
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
    const resolved = templateById(acceptance.template.id, acceptance.template.version);
    if (!resolved.ok)
        return { code: resolved.code };
    const { template } = resolved;
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
        return { code: 'visual_images_missing', detail: exports.VISUAL_IMAGES_MISSING_MOVE };
    // A Figma image is not tied to a node yet; an approved board must match its image asset.
    if (visualSource?.kind === 'tavola_approvata' && !images.some((material) => material.kind === 'asset' && material.asset.assetId === visualSource.reference))
        return { code: 'visual_reference_not_material' };
    if (template.materials.includes('retouch_file') && assignment.materials.length === 0)
        return { code: 'retouch_file_missing' };
    return null;
}
//# sourceMappingURL=session-acceptance-templates.js.map