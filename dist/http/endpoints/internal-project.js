import { z } from 'zod';
import { ProjectConfigVersionSchema, ProjectIdSchema, ResearchProjectConfigSchema } from "../../capability/ricerca/project.js";
import { ProjectDaySchema, ProjectSpendDaySchema } from "../../capability/ricerca/spend.js";
import { LabProjectConfigSchema } from "../../capability/lab/project.js";
import { CompetenceGapSchema, CompetenceNodeViewSchema } from "../../capability/lab/competence.js";
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
export const ProjectParamsSchema = z.object({ projectId: ProjectIdSchema });
/** Build the concrete config path for a project id (validated). */
export function projectConfigPath(projectId) {
    return `/internal/projects/${ProjectParamsSchema.parse({ projectId }).projectId}/config`;
}
export function projectSpendPath(projectId) {
    return `/internal/projects/${ProjectParamsSchema.parse({ projectId }).projectId}/spend`;
}
export function projectGrowthPath(projectId) {
    return `/internal/projects/${ProjectParamsSchema.parse({ projectId }).projectId}/growth`;
}
export const ProjectConfigSavedSchema = z.object({ ok: z.literal(true), version: ProjectConfigVersionSchema }).strict();
export const ProjectConfigStaleSchema = z.object({
    ok: z.literal(false),
    error: z.literal('stale_version'),
    currentVersion: ProjectConfigVersionSchema,
}).strict();
export const ProjectNotFoundSchema = z.object({ ok: z.literal(false), error: z.literal('unknown_project') }).strict();
/** cap-ricerca's part: budget, models, research parameters, source rule, agents. */
export const ricercaProjectConfigPutContract = {
    method: 'PUT',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    bodySchema: ResearchProjectConfigSchema,
    responseSchema: ProjectConfigSavedSchema,
};
export const ricercaProjectConfigGetContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    responseSchema: ResearchProjectConfigSchema,
};
/** cap-lab's part: the wiki's domain, conventions, kinds of pages and links. */
export const labProjectConfigPutContract = {
    method: 'PUT',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    bodySchema: LabProjectConfigSchema,
    responseSchema: ProjectConfigSavedSchema,
};
export const labProjectConfigGetContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/config',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    responseSchema: LabProjectConfigSchema,
};
/** GET /internal/projects/:projectId/spend?from=YYYY-MM-DD&to=YYYY-MM-DD — cap-ricerca, days in the project's zone. */
export const ProjectSpendQuerySchema = z.object({ from: ProjectDaySchema, to: ProjectDaySchema }).strict()
    .refine(q => q.from <= q.to, { message: 'from after to' });
export const ProjectSpendResponseSchema = z.object({ days: z.array(ProjectSpendDaySchema).max(400) }).strict();
export const ricercaProjectSpendContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/spend',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    querySchema: ProjectSpendQuerySchema,
    responseSchema: ProjectSpendResponseSchema,
};
/** GET /internal/projects/:projectId/growth — cap-lab: the graph, the open gaps and the wiki's size. */
export const ProjectGrowthResponseSchema = z.object({
    projectId: ProjectIdSchema,
    nodes: z.array(CompetenceNodeViewSchema).max(5000),
    gaps: z.array(CompetenceGapSchema).max(200),
    wiki: z.object({
        pages: z.number().int().nonnegative(),
        claims: z.number().int().nonnegative(),
        /** Claims resting on at least two sources (reliability). */
        claimsMultiSource: z.number().int().nonnegative(),
        contradictions: z.number().int().nonnegative(),
        sources: z.number().int().nonnegative(),
    }).strict(),
}).strict();
export const labProjectGrowthContract = {
    method: 'GET',
    path: '/internal/projects/:projectId/growth',
    authType: 'secret',
    paramsSchema: ProjectParamsSchema,
    responseSchema: ProjectGrowthResponseSchema,
};
//# sourceMappingURL=internal-project.js.map