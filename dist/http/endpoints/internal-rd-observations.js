import { z } from 'zod';
import { INTERNAL_SECRET_HEADER } from "../../auth/index.js";
import { LabBriefGapsInputSchema, LabBriefGapsOutputSchema } from "../../capability/lab/tools.js";
import { LabGapsRefSchema, ResearchIdSchema, ResearchStateSchema } from "../../capability/ricerca/research.js";
import { AssetRefSchema } from "../../organization/asset.js";
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { LabHttpErrorSchema, labScopeQuerySchema } from "./internal-capability-lab.js";
export const LabBriefGapsListQuerySchema = z.strictObject({
    tenantId: labScopeQuerySchema.shape.tenantId,
    ownerId: labScopeQuerySchema.shape.ownerId,
    clientId: LabBriefGapsInputSchema.shape.clientId,
    projectId: AssetRefSchema.shape.projectId,
    limit: z.coerce.number().int().min(1).max(50).optional(),
});
export const LabBriefGapsListResponseSchema = z.strictObject({
    analyses: z.array(z.strictObject({
        gapsRef: LabGapsRefSchema,
        topics: LabBriefGapsInputSchema.shape.topics,
        covered: LabBriefGapsOutputSchema.shape.covered,
        gaps: LabBriefGapsOutputSchema.shape.gaps,
        analyzedAt: z.iso.datetime(),
    })).max(50),
});
/** Read an agent's brief analyses for a client project. */
export const labBriefGapsListContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/brief-gaps',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: CapabilityAgentParamsSchema,
    querySchema: LabBriefGapsListQuerySchema,
    responseSchema: LabBriefGapsListResponseSchema,
    errorResponseSchema: LabHttpErrorSchema,
};
export const RicercaResearchListQuerySchema = z.strictObject({
    tenantId: labScopeQuerySchema.shape.tenantId,
    ownerId: labScopeQuerySchema.shape.ownerId,
    projectId: AssetRefSchema.shape.projectId,
    limit: z.coerce.number().int().min(1).max(50).optional(),
});
export const RicercaResearchListResponseSchema = z.strictObject({
    researches: z.array(z.strictObject({
        researchId: ResearchIdSchema,
        state: ResearchStateSchema,
        labGapsRef: LabGapsRefSchema.optional(),
    })).max(50),
});
/** Read project research and its optional link to a lab brief analysis. */
export const ricercaResearchListContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/ricerca/researches',
    authType: 'secret',
    authHeader: INTERNAL_SECRET_HEADER,
    paramsSchema: CapabilityAgentParamsSchema,
    querySchema: RicercaResearchListQuerySchema,
    responseSchema: RicercaResearchListResponseSchema,
    errorResponseSchema: LabHttpErrorSchema,
};
//# sourceMappingURL=internal-rd-observations.js.map