import { z } from 'zod';
import { OwnerIdSchema } from "../../agent/agent-identity.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-management.js";
import { ModelCatalogSchema } from "../../model-router/model-catalog.js";
import { AgentModelsOverviewSchema, AgentModelsBatchIntentSchema, AgentModelsBatchPreviewRequestSchema, AgentModelsBatchPreviewSchema, AgentModelsBatchRequestSchema, AgentModelsBatchResultSchema } from "../../model-router/models-batch.js";
import { sameModelAgentIdentity } from "../../model-router/agent-model-configuration.js";
import { AgentManagementParamsSchema } from "./internal-agents-management.js";
/** Derived ONLY from the authenticated Forge session; never accepted from request bodies/headers as authorization. */
export const ForgeModelsAccessSchema = z.discriminatedUnion('role', [
    z.object({ role: z.literal('sa') }).strict(),
    z.object({ role: z.literal('owner'), ownerId: OwnerIdSchema }).strict(),
]);
export function isAgentModelsOverviewWithinAccess(input, trustedAccess) {
    const overview = AgentModelsOverviewSchema.safeParse(input);
    const access = ForgeModelsAccessSchema.safeParse(trustedAccess);
    if (!overview.success || !access.success)
        return false;
    return access.data.role === 'sa' || [...overview.data.rows, ...(overview.data.coverage ?? [])].every(row => access.data.role === 'owner' && row.ownerId === access.data.ownerId);
}
export function isAgentModelsBatchWithinAccess(input, serverOverview, trustedAccess) {
    const request = AgentModelsBatchIntentSchema.safeParse(input);
    const overview = AgentModelsOverviewSchema.safeParse(serverOverview);
    const access = ForgeModelsAccessSchema.safeParse(trustedAccess);
    if (!request.success || !overview.success || !access.success)
        return false;
    return request.data.agents.every(agent => agent.changes.every(change => {
        const row = overview.data.rows.find(entry => entry.identity.managementAgentId === agent.identity.managementAgentId && entry.slotId === change.slotId);
        return row !== undefined && sameModelAgentIdentity(row.identity, agent.identity) && (access.data.role === 'sa' || row.ownerId === access.data.ownerId);
    }));
}
export const ForgeModelsProgressSchema = z.object({ requestId: AgentManagementRequestIdSchema, batch: AgentModelsBatchResultSchema.nullable(), overview: AgentModelsOverviewSchema }).strict().superRefine((progress, ctx) => {
    if (progress.batch !== null && progress.batch.requestId !== progress.requestId)
        ctx.addIssue({ code: 'custom', path: ['batch', 'requestId'], message: 'Progress belongs to the requested batch' });
});
/** Browser -> Forge session facade. These are NOT S2S EndpointContract objects and carry no service header.
 * Producers reuse requireAuth/requireAgentOwnership/isSuperadmin and existing slot writers. Catalog and progress
 * reads must check the addressed agent/stored batch ownership too. M5 must install handlers before UI activation.
 */
const browserAuthentication = { authentication: 'forge-session', authorization: 'sa-or-agent-owner' };
export const forgeModelsOverviewContract = { ...browserAuthentication, method: 'GET', path: '/api/models/overview', responseSchema: AgentModelsOverviewSchema };
export const forgeModelsCatalogContract = { ...browserAuthentication, method: 'GET', path: '/api/models/agents/:agentId/catalog', paramsSchema: AgentManagementParamsSchema, responseSchema: ModelCatalogSchema };
export const forgeModelsPreviewContract = { ...browserAuthentication, method: 'POST', path: '/api/models/preview', bodySchema: AgentModelsBatchPreviewRequestSchema, responseSchema: AgentModelsBatchPreviewSchema };
export const forgeModelsBatchContract = { ...browserAuthentication, method: 'POST', path: '/api/models/batch', bodySchema: AgentModelsBatchRequestSchema, responseSchema: AgentModelsBatchResultSchema };
export const forgeModelsProgressContract = { ...browserAuthentication, method: 'GET', path: '/api/models/progress/:requestId', paramsSchema: z.object({ requestId: AgentManagementRequestIdSchema }).strict(), responseSchema: ForgeModelsProgressSchema };
//# sourceMappingURL=forge-models.js.map