import { z } from 'zod';
import type { DevelopmentSessionEngine } from "../connect/development-session.js";
import type { DevSessionAssignment } from "./session-assignment.js";
import { type DevSessionAcceptance, type DevSessionCriterion } from "./session-acceptance.js";
import type { DEV_SESSION_ACCEPTANCE_NEEDS } from "./session-acceptance-catalog.js";
export declare const DEV_SESSION_TEMPLATE_IDS: readonly ["sviluppo-pezzo-app", "design-sito", "design-schermata-app", "design-ritocco"];
export declare const DevSessionTemplateIdSchema: z.ZodEnum<{
    "sviluppo-pezzo-app": "sviluppo-pezzo-app";
    "design-sito": "design-sito";
    "design-schermata-app": "design-schermata-app";
    "design-ritocco": "design-ritocco";
}>;
export declare const DEV_SESSION_TEMPLATE_MATERIALS: readonly ["visual_images", "retouch_file"];
export declare const DEV_SESSION_TEMPLATES: {
    readonly 'sviluppo-pezzo-app': {
        readonly version: 1;
        readonly productKind: "code";
        readonly supportedEngines: readonly ["codex", "claude"];
        readonly requiredInput: readonly ["userPath", "data", "proofScripts", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["S-01", "S-02", "S-05", "S-07", "S-08", "S-10"];
        readonly optionalCriteria: readonly ["S-03", "S-04", "S-06", "S-09"];
    };
    readonly 'design-sito': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "formats", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["D-01", "D-02", "D-03", "D-04", "D-05", "D-08", "D-09", "D-11"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-schermata-app': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["screens", "states", "formats", "visualSource"];
        readonly materials: readonly ["visual_images"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-04", "D-05", "D-07", "D-08", "D-09", "D-11"];
        readonly optionalCriteria: readonly [];
    };
    readonly 'design-ritocco': {
        readonly version: 1;
        readonly productKind: "design";
        readonly supportedEngines: readonly ["claude"];
        readonly requiredInput: readonly ["retouch", "formats", "visualSource"];
        readonly materials: readonly ["retouch_file", "visual_images"];
        readonly formCriteria: readonly ["D-01", "D-03", "D-08", "D-11"];
        readonly optionalCriteria: readonly [];
    };
};
export declare function devSessionTemplateSupportsEngine(id: string, engine: DevelopmentSessionEngine): boolean;
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
/** Pure refusal check. Consumers decide when to enable it for each product kind. */
export declare function devSessionAcceptanceTemplateProblem(assignment: DevSessionAssignment): TemplateProblem | null;
export {};
//# sourceMappingURL=session-acceptance-templates.d.ts.map