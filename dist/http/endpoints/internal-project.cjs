"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.labProjectGrowthContract = exports.ProjectGrowthResponseSchema = exports.ricercaProjectSpendContract = exports.ProjectSpendResponseSchema = exports.ProjectSpendQuerySchema = exports.labProjectConfigGetContract = exports.labProjectConfigPutContract = exports.ricercaProjectConfigGetContract = exports.ricercaProjectConfigPutContract = exports.ProjectNotFoundSchema = exports.ProjectConfigStaleSchema = exports.ProjectConfigSavedSchema = exports.ProjectParamsSchema = void 0;
exports.projectConfigPath = projectConfigPath;
exports.projectSpendPath = projectSpendPath;
exports.projectGrowthPath = projectGrowthPath;
const zod_1 = require("zod");
const project_js_1 = require("../../capability/ricerca/project.cjs");
const spend_js_1 = require("../../capability/ricerca/spend.cjs");
const project_js_2 = require("../../capability/lab/project.cjs");
const competence_js_1 = require("../../capability/lab/competence.cjs");
/**
 * Projects — the control panel's routes on the capabilities that serve a project (v1.28.0, Phase 54).
 * Direction: Forge (control panel) or an ops script -> the capability (cap-ricerca, cap-lab, …).
 * Auth: platform secret (`INTERNAL_SECRET_HEADER`), as `POST /call/:tool`.
 *
 * Every capability keeps ITS part of a project's configuration, keyed by `projectId`; the capability identity is
 * conveyed by the caller's `baseUrl`, not by a path prefix. A part only moves forward: a `PUT` whose `version` is not
 * above the stored one is refused with 409 {@link ProjectConfigStaleSchema}, never applied silently.
 *
 * Consumers (planned): agent-x9 services/cap-ricerca, services/cap-lab (servers); forge-v2 Progetti (client).
 */
exports.ProjectParamsSchema = zod_1.z.object({ projectId: project_js_1.ProjectIdSchema });
/** Build the concrete config path for a project id (validated). */
function projectConfigPath(projectId) {
    return `/internal/projects/${exports.ProjectParamsSchema.parse({ projectId }).projectId}/config`;
}
function projectSpendPath(projectId) {
    return `/internal/projects/${exports.ProjectParamsSchema.parse({ projectId }).projectId}/spend`;
}
function projectGrowthPath(projectId) {
    return `/internal/projects/${exports.ProjectParamsSchema.parse({ projectId }).projectId}/growth`;
}
exports.ProjectConfigSavedSchema = zod_1.z.object({ ok: zod_1.z.literal(true), version: project_js_1.ProjectConfigVersionSchema }).strict();
exports.ProjectConfigStaleSchema = zod_1.z.object({
    ok: zod_1.z.literal(false),
    error: zod_1.z.literal('stale_version'),
    currentVersion: project_js_1.ProjectConfigVersionSchema,
}).strict();
exports.ProjectNotFoundSchema = zod_1.z.object({ ok: zod_1.z.literal(false), error: zod_1.z.literal('unknown_project') }).strict();
/** cap-ricerca's part: budget, models, research parameters, source rule, agents. */
exports.ricercaProjectConfigPutContract = {
    method: 'PUT',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    bodySchema: project_js_1.ResearchProjectConfigSchema,
    responseSchema: exports.ProjectConfigSavedSchema,
};
exports.ricercaProjectConfigGetContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    responseSchema: project_js_1.ResearchProjectConfigSchema,
};
/** cap-lab's part: the wiki's domain, conventions, kinds of pages and links. */
exports.labProjectConfigPutContract = {
    method: 'PUT',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    bodySchema: project_js_2.LabProjectConfigSchema,
    responseSchema: exports.ProjectConfigSavedSchema,
};
exports.labProjectConfigGetContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    responseSchema: project_js_2.LabProjectConfigSchema,
};
/** GET /internal/projects/:projectId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — cap-ricerca, days in the project's zone. */
exports.ProjectSpendQuerySchema = zod_1.z.object({ from: spend_js_1.ProjectDaySchema, to: spend_js_1.ProjectDaySchema }).strict()
    .refine(q => q.from <= q.to, { message: 'from after to' });
exports.ProjectSpendResponseSchema = zod_1.z.object({ days: zod_1.z.array(spend_js_1.ProjectSpendDaySchema).max(400) }).strict();
exports.ricercaProjectSpendContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/spend',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    querySchema: exports.ProjectSpendQuerySchema,
    responseSchema: exports.ProjectSpendResponseSchema,
};
/** GET /internal/projects/:projectId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
exports.ProjectGrowthResponseSchema = zod_1.z.object({
    projectId: project_js_1.ProjectIdSchema,
    nodes: zod_1.z.array(competence_js_1.CompetenceNodeViewSchema).max(5000),
    gaps: zod_1.z.array(competence_js_1.CompetenceGapSchema).max(200),
    wiki: zod_1.z.object({
        pages: zod_1.z.number().int().nonnegative(),
        claims: zod_1.z.number().int().nonnegative(),
        /** Claims resting on at least two sources (reliability). */
        claimsMultiSource: zod_1.z.number().int().nonnegative(),
        contradictions: zod_1.z.number().int().nonnegative(),
        sources: zod_1.z.number().int().nonnegative(),
    }).strict(),
}).strict();
exports.labProjectGrowthContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/growth',
    authType: 'secret',
    paramsSchema: exports.ProjectParamsSchema,
    responseSchema: exports.ProjectGrowthResponseSchema,
};
//# sourceMappingURL=internal-project.js.map