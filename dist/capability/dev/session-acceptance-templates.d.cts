import { z } from 'zod';
import type { DevelopmentSessionEngine } from "../connect/development-session.cjs";
import type { DesignScoreThresholds } from "../design-score.cjs";
import type { DevSessionAssignment, DevSessionMaterial } from "./session-assignment.cjs";
import { type DevSessionAcceptance, type DevSessionCriterion } from "./session-acceptance.cjs";
import type { DEV_SESSION_ACCEPTANCE_NEEDS } from "./session-acceptance-catalog.cjs";
export declare const DEV_SESSION_TEMPLATE_IDS: readonly ["sviluppo-pezzo-app", "design-sito", "design-schermata-app", "design-ritocco"];
export declare const DevSessionTemplateIdSchema: z.ZodEnum<{
    "sviluppo-pezzo-app": "sviluppo-pezzo-app";
    "design-sito": "design-sito";
    "design-schermata-app": "design-schermata-app";
    "design-ritocco": "design-ritocco";
}>;
export declare const DEV_SESSION_TEMPLATE_MATERIALS: readonly ["visual_images", "retouch_file", "approved_images", "brand_assets", "excellence_examples"];
export declare const DEV_SESSION_MATERIAL_ASSET_TYPES: {
    readonly approved_images: "design-approvato";
    readonly brand_assets: "asset-marchio";
    readonly excellence_examples: "esempio-eccellenza";
};
export declare function devSessionMaterialsByRole(materials: readonly DevSessionMaterial[], role: keyof typeof DEV_SESSION_MATERIAL_ASSET_TYPES): Extract<DevSessionMaterial, {
    kind: 'asset';
}>[];
export declare const DEV_SESSION_TEMPLATES: {
    readonly 'sviluppo-pezzo-app': {
        readonly version: 1;
        readonly productKind: "code";
        readonly supportedEngines: readonly ["codex", "claude"];
        readonly requiredInput: readonly ["userPath", "data", "proofScripts", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["S-01", "S-02", "S-05", "S-07", "S-08", "S-10", "S-11"];
        readonly optionalCriteria: readonly ["S-03", "S-04", "S-06", "S-09"];
    };
    readonly 'design-sito': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "formats", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["D-01", "D-02", "D-03", "D-04", "D-05", "D-08", "D-09", "D-11", "D-12", "D-13", "D-14"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-schermata-app': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "states", "formats", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-04", "D-05", "D-07", "D-08", "D-09", "D-11", "D-12", "D-13", "D-14"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-ritocco': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["retouch", "formats", "visualSource"];
        readonly materials: readonly ["retouch_file", "visual_images"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-08", "D-11", "D-13", "D-14"];
        readonly optionalCriteria: readonly [];
    };
};
export declare const DEV_SESSION_TEMPLATES_V2: {
    readonly 'design-sito': {
        readonly version: 2;
        readonly materials: readonly ["visual_images", "approved_images", "brand_assets", "excellence_examples"];
        readonly formCriteria: readonly ["D-01", "D-02", "D-03", "D-04", "D-05", "D-06", "D-08", "D-09", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16", "D-17", "D-18", "D-19", "D-20", "D-21"];
        readonly scoreThresholds: {
            readonly dimensionMin: 3;
            readonly auditTotalMin: 16;
            readonly critiqueMin: 30;
            readonly critiqueOutOf: 40;
            readonly critiqueMinScored: 8;
            readonly gapMax: 1;
        };
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "formats", "visualSource"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-schermata-app': {
        readonly version: 2;
        readonly materials: readonly ["visual_images", "approved_images", "brand_assets", "excellence_examples"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-04", "D-05", "D-06", "D-07", "D-08", "D-09", "D-11", "D-12", "D-13", "D-14", "D-15", "D-16", "D-17", "D-18", "D-19", "D-20", "D-21"];
        readonly scoreThresholds: {
            readonly dimensionMin: 3;
            readonly auditTotalMin: 16;
            readonly critiqueMin: 30;
            readonly critiqueOutOf: 40;
            readonly critiqueMinScored: 8;
            readonly gapMax: 1;
        };
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "states", "formats", "visualSource"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-ritocco': {
        readonly version: 2;
        readonly materials: readonly ["retouch_file", "visual_images", "approved_images", "brand_assets", "excellence_examples"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-06", "D-08", "D-11", "D-13", "D-14", "D-15", "D-19", "D-20", "D-21"];
        readonly scoreThresholds: {
            readonly dimensionMin: 3;
            readonly auditTotalMin: 16;
            readonly critiqueMin: 30;
            readonly critiqueOutOf: 40;
            readonly critiqueMinScored: 8;
            readonly gapMax: 1;
        };
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["retouch", "formats", "visualSource"];
        readonly optionalCriteria: readonly [];
    };
};
export declare function devSessionTemplateSupportsEngine(id: string, engine: DevelopmentSessionEngine): boolean;
/** Read the selected model only; saved contracts and unknown versions get no implicit scores. */
export declare function devSessionScoreThresholds(acceptance: DevSessionAcceptance): DesignScoreThresholds | undefined;
export declare const DEV_SESSION_REQUIREMENT_ORIGINS: readonly ["modello", "mandato", "capo", "ritorno"];
export declare const DEV_SESSION_REQUIREMENT_PROBLEMS: readonly ["template_unknown", "template_version_unknown", "template_optional_not_offered", "criterion_id_clashes_catalog"];
type Requirement = Omit<DevSessionCriterion, 'origin'> & {
    origin: (typeof DEV_SESSION_REQUIREMENT_ORIGINS)[number];
    needs: readonly (typeof DEV_SESSION_ACCEPTANCE_NEEDS)[number][];
};
type RequirementsResult = {
    ok: true;
    requirements: Requirement[];
} | {
    ok: false;
    code: (typeof DEV_SESSION_REQUIREMENT_PROBLEMS)[number];
};
/** Expand versioned form checks without consuming the variable criteria quota. */
export declare function devSessionRequirements(acceptance: DevSessionAcceptance): RequirementsResult;
export declare const DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS: readonly ["template_unknown", "template_version_unknown", "template_optional_not_offered", "criterion_id_clashes_catalog", "template_kind_mismatch", "input_missing", "visual_images_missing", "visual_reference_not_material", "retouch_file_missing"];
type TemplateProblem = {
    code: (typeof DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS)[number];
    detail?: string;
};
export declare const VISUAL_IMAGES_MISSING_MOVE = "Un pdf non vale come immagine della tavola: allega immagini png o jpeg ai materiali, oppure scrivi visualSource con kind nessuna se non esiste una tavola di riferimento.";
/**
 * Stefano 21/11, decision 7: when no existing script covers the new step, the chief's own
 * criterion (origin capo, attestor sessione) is enough and the session writes the proof.
 * Single place for this rule so every consumer admits the same forms.
 */
export declare function devSessionHasChiefStepCriterion(criteria: readonly Pick<DevSessionCriterion, 'origin' | 'attestor'>[]): boolean;
/** Pure refusal check. Consumers decide when to enable it for each product kind. */
export declare function devSessionAcceptanceTemplateProblem(assignment: DevSessionAssignment): TemplateProblem | null;
export {};
//# sourceMappingURL=session-acceptance-templates.d.ts.map