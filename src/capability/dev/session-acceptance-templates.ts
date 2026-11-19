import { z } from 'zod';
import type { DevelopmentSessionEngine } from '../connect/development-session.js';
import type { DevSessionAssignment, DevSessionKind } from './session-assignment.js';
import {
  DEV_SESSION_CRITERION_ORIGINS,
  type DevSessionAcceptance, type DevSessionAcceptanceInput, type DevSessionCriterion,
} from './session-acceptance.js';
import { DEV_SESSION_ACCEPTANCE_CATALOG } from './session-acceptance-catalog.js';
import type { DEV_SESSION_ACCEPTANCE_NEEDS } from './session-acceptance-catalog.js';

export const DEV_SESSION_TEMPLATE_IDS = ['sviluppo-pezzo-app', 'design-sito', 'design-schermata-app', 'design-ritocco'] as const;
export const DevSessionTemplateIdSchema = z.enum(DEV_SESSION_TEMPLATE_IDS);
export const DEV_SESSION_TEMPLATE_MATERIALS = ['visual_images', 'retouch_file'] as const;

// Supported, not forbidden: Stefano, 19 Nov 2026, supports only Claude for now,
// although Codex already integrates the same constraints. Only Claude writes the
// Skill tool log line used as proof; reopen when Codex leaves the same proof.
const DESIGN_ENGINES = ['claude'] as const;

type CatalogId = keyof typeof DEV_SESSION_ACCEPTANCE_CATALOG;
type Template = {
  version: number;
  productKind: DevSessionKind;
  supportedEngines: readonly DevelopmentSessionEngine[];
  requiredInput: readonly (keyof DevSessionAcceptanceInput)[];
  materials: readonly (typeof DEV_SESSION_TEMPLATE_MATERIALS)[number][];
  formCriteria: readonly CatalogId[];
  optionalCriteria: readonly CatalogId[];
};

export const DEV_SESSION_TEMPLATES = {
  'sviluppo-pezzo-app': {
    version: 1, productKind: 'code', supportedEngines: ['codex', 'claude'],
    requiredInput: ['userPath', 'data', 'proofScripts', 'visualSource'], materials: ['visual_images'],
    formCriteria: ['S-01', 'S-02', 'S-05', 'S-07', 'S-08', 'S-10'],
    optionalCriteria: ['S-03', 'S-04', 'S-06', 'S-09'],
  },
  'design-sito': {
    version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
    requiredInput: ['screens', 'formats', 'visualSource'], materials: ['visual_images'],
    formCriteria: ['D-01', 'D-02', 'D-03', 'D-04', 'D-05', 'D-08', 'D-09', 'D-11'], optionalCriteria: [],
  },
  'design-schermata-app': {
    version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
    requiredInput: ['screens', 'states', 'formats', 'visualSource'], materials: ['visual_images'],
    formCriteria: ['D-01', 'D-03', 'D-04', 'D-05', 'D-07', 'D-08', 'D-09', 'D-11'], optionalCriteria: [],
  },
  'design-ritocco': {
    version: 1, productKind: 'design', supportedEngines: DESIGN_ENGINES,
    requiredInput: ['retouch', 'formats', 'visualSource'], materials: ['retouch_file', 'visual_images'],
    formCriteria: ['D-01', 'D-03', 'D-08', 'D-11'], optionalCriteria: [],
  },
} as const satisfies Record<(typeof DEV_SESSION_TEMPLATE_IDS)[number], Template>;

function templateById(id: string): Template | undefined {
  return Object.hasOwn(DEV_SESSION_TEMPLATES, id) ? DEV_SESSION_TEMPLATES[id as keyof typeof DEV_SESSION_TEMPLATES] : undefined;
}

export function devSessionTemplateSupportsEngine(id: string, engine: DevelopmentSessionEngine): boolean {
  return templateById(id)?.supportedEngines.includes(engine) ?? false;
}

export const DEV_SESSION_REQUIREMENT_ORIGINS = ['modello', ...DEV_SESSION_CRITERION_ORIGINS] as const;
export const DEV_SESSION_REQUIREMENT_PROBLEMS = ['template_unknown', 'template_version_unknown', 'template_optional_not_offered', 'criterion_id_clashes_catalog'] as const;

type Requirement = Omit<DevSessionCriterion, 'origin'> & {
  origin: (typeof DEV_SESSION_REQUIREMENT_ORIGINS)[number];
  needs: readonly (typeof DEV_SESSION_ACCEPTANCE_NEEDS)[number][];
};
type RequirementsResult = { ok: true; requirements: Requirement[] } | { ok: false; code: (typeof DEV_SESSION_REQUIREMENT_PROBLEMS)[number] };

/** Expand versioned form checks without consuming the variable criteria quota. */
export function devSessionRequirements(acceptance: DevSessionAcceptance): RequirementsResult {
  const template = templateById(acceptance.template.id);
  if (template === undefined) return { ok: false, code: 'template_unknown' };
  if (acceptance.template.version !== template.version) return { ok: false, code: 'template_version_unknown' };
  const optionalIds = acceptance.template.optionalIds ?? [];
  if (optionalIds.some((id) => !template.optionalCriteria.some((offered) => offered === id))) return { ok: false, code: 'template_optional_not_offered' };
  if (acceptance.criteria.some(({ id }) => Object.hasOwn(DEV_SESSION_ACCEPTANCE_CATALOG, id))) return { ok: false, code: 'criterion_id_clashes_catalog' };
  const catalogRequirements = [...template.formCriteria, ...optionalIds as CatalogId[]].map((id): Requirement => ({
    id, ...DEV_SESSION_ACCEPTANCE_CATALOG[id], origin: 'modello',
  }));
  return { ok: true, requirements: [...catalogRequirements, ...acceptance.criteria.map((criterion): Requirement => ({ ...criterion, needs: [] }))] };
}

export const DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS = [...DEV_SESSION_REQUIREMENT_PROBLEMS, 'template_kind_mismatch', 'input_missing', 'visual_images_missing', 'visual_reference_not_material', 'retouch_file_missing'] as const;
type TemplateProblem = { code: (typeof DEV_SESSION_ACCEPTANCE_TEMPLATE_PROBLEMS)[number]; detail?: string };

/** Pure refusal check. Consumers decide when to enable it for each product kind. */
export function devSessionAcceptanceTemplateProblem(assignment: DevSessionAssignment): TemplateProblem | null {
  const acceptance = assignment.acceptance;
  if (acceptance === undefined) return null;
  const requirements = devSessionRequirements(acceptance);
  if (!requirements.ok) return { code: requirements.code };
  // Requirements have already established that the template exists at this version.
  const template = DEV_SESSION_TEMPLATES[acceptance.template.id as keyof typeof DEV_SESSION_TEMPLATES] as Template;
  if (assignment.productKind !== template.productKind) return { code: 'template_kind_mismatch' };
  const missingInput = template.requiredInput.find((key) => acceptance.input[key] === undefined);
  if (missingInput !== undefined) return { code: 'input_missing', detail: missingInput };
  const visualSource = acceptance.input.visualSource;
  const images = assignment.materials.filter((material) => material.kind === 'asset' && material.asset.mediaType.startsWith('image/'));
  if (template.materials.includes('visual_images') && visualSource !== undefined && visualSource.kind !== 'nessuna' && images.length === 0) return { code: 'visual_images_missing' };
  // A Figma image is not tied to a node yet; an approved board must match its image asset.
  if (visualSource?.kind === 'tavola_approvata' && !images.some((material) => material.kind === 'asset' && material.asset.assetId === visualSource.reference)) return { code: 'visual_reference_not_material' };
  if (template.materials.includes('retouch_file') && assignment.materials.length === 0) return { code: 'retouch_file_missing' };
  return null;
}
