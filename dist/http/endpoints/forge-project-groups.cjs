"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectGroupContract = exports.listProjectGroupsContract = exports.projectGroupPath = exports.PROJECT_GROUP_PATH_TEMPLATE = exports.PROJECT_GROUPS_PATH = exports.ProjectGroupDetailResponseSchema = exports.ProjectGroupAgentSchema = exports.ProjectGroupParamsSchema = exports.ListProjectGroupsResponseSchema = exports.ProjectGroupSummarySchema = exports.PROJECT_GROUP_TYPE = exports.GroupTypeSchema = exports.GROUP_TYPES = void 0;
const zod_1 = require("zod");
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
exports.GROUP_TYPES = ['Azienda', 'BU', 'Progetto', 'Cliente', 'Altro'];
exports.GroupTypeSchema = zod_1.z.enum(exports.GROUP_TYPES);
/** The only type this contract exposes. */
exports.PROJECT_GROUP_TYPE = 'Progetto';
exports.ProjectGroupSummarySchema = zod_1.z.object({
    id: zod_1.z.number().int().positive(),
    name: zod_1.z.string().min(1),
    objective: zod_1.z.string().nullable(),
    /** Members that are not archived. */
    agentCount: zod_1.z.number().int().nonnegative(),
}).strict();
exports.ListProjectGroupsResponseSchema = zod_1.z.object({
    groups: zod_1.z.array(exports.ProjectGroupSummarySchema),
}).strict();
exports.ProjectGroupParamsSchema = zod_1.z.object({
    groupId: zod_1.z.coerce.number().int().positive(),
}).strict();
exports.ProjectGroupAgentSchema = zod_1.z.object({
    /** Forge slug == X9 agentId. */
    agentId: zod_1.z.string().min(1),
    displayName: zod_1.z.string(),
    /** Names of the capabilities enabled in the agent registry (no parameters, no keys). */
    capabilities: zod_1.z.array(zod_1.z.string().min(1)),
}).strict();
exports.ProjectGroupDetailResponseSchema = zod_1.z.object({
    group: exports.ProjectGroupSummarySchema.omit({ agentCount: true }),
    agents: zod_1.z.array(exports.ProjectGroupAgentSchema),
}).strict();
exports.PROJECT_GROUPS_PATH = '/api/internal/project-groups';
exports.PROJECT_GROUP_PATH_TEMPLATE = '/api/internal/project-groups/:groupId';
const projectGroupPath = (groupId) => exports.PROJECT_GROUP_PATH_TEMPLATE.replace(':groupId', String(exports.ProjectGroupParamsSchema.parse({ groupId }).groupId));
exports.projectGroupPath = projectGroupPath;
exports.listProjectGroupsContract = {
    method: 'GET',
    path: exports.PROJECT_GROUPS_PATH,
    authType: 'token',
    responseSchema: exports.ListProjectGroupsResponseSchema,
};
exports.getProjectGroupContract = {
    method: 'GET',
    path: exports.PROJECT_GROUP_PATH_TEMPLATE,
    authType: 'token',
    paramsSchema: exports.ProjectGroupParamsSchema,
    responseSchema: exports.ProjectGroupDetailResponseSchema,
};
//# sourceMappingURL=forge-project-groups.js.map