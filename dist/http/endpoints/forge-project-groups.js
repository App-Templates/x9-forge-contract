import { z } from 'zod';
/**
 * B8 — read-only access to Forge «Progetto» groups for the external project view.
 * Direction: project view app -> Forge factory-svc
 * Auth: X-Internal-Token carrying a DEDICATED read-only service secret
 *       (never Forge's INTERNAL_SERVICE_TOKEN, never Forge user keys).
 * Writes stay in Forge (superadmin UI); this contract has no write route.
 *
 * Design: forge-v2 docs/design/VISTA-PROGETTO.md §0 (agents of a project view come
 * from the Forge group of type «Progetto»), HANDOFF-COSTRUZIONE §2 and PIANO-SVILUPPI B8.
 * Version: reserved 1.31.0 in ~/.claude/agent-coordination/BRIDGE-VERSIONI.md.
 */
/** Group types, one level only (HANDOFF §2). Moved here from forge-v2 @forge/types (30-01). */
export const GROUP_TYPES = ['Azienda', 'BU', 'Progetto', 'Cliente', 'Altro'];
export const GroupTypeSchema = z.enum(GROUP_TYPES);
/** The only type this contract exposes. */
export const PROJECT_GROUP_TYPE = 'Progetto';
export const ProjectGroupSummarySchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
    objective: z.string().nullable(),
    /** Members that are not archived. */
    agentCount: z.number().int().nonnegative(),
}).strict();
export const ListProjectGroupsResponseSchema = z.object({
    groups: z.array(ProjectGroupSummarySchema),
}).strict();
export const ProjectGroupParamsSchema = z.object({
    groupId: z.coerce.number().int().positive(),
}).strict();
export const ProjectGroupAgentSchema = z.object({
    /** Forge slug == X9 agentId. */
    agentId: z.string().min(1),
    displayName: z.string(),
    /** Names of the capabilities enabled in the agent registry (no parameters, no keys). */
    capabilities: z.array(z.string().min(1)),
}).strict();
export const ProjectGroupDetailResponseSchema = z.object({
    group: ProjectGroupSummarySchema.omit({ agentCount: true }),
    agents: z.array(ProjectGroupAgentSchema),
}).strict();
export const PROJECT_GROUPS_PATH = '/api/internal/project-groups';
export const PROJECT_GROUP_PATH_TEMPLATE = '/api/internal/project-groups/:groupId';
export const projectGroupPath = (groupId) => PROJECT_GROUP_PATH_TEMPLATE.replace(':groupId', String(ProjectGroupParamsSchema.parse({ groupId }).groupId));
export const listProjectGroupsContract = {
    method: 'GET',
    path: PROJECT_GROUPS_PATH,
    authType: 'token',
    responseSchema: ListProjectGroupsResponseSchema,
};
export const getProjectGroupContract = {
    method: 'GET',
    path: PROJECT_GROUP_PATH_TEMPLATE,
    authType: 'token',
    paramsSchema: ProjectGroupParamsSchema,
    responseSchema: ProjectGroupDetailResponseSchema,
};
//# sourceMappingURL=forge-project-groups.js.map