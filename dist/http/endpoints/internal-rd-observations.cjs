"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ricercaResearchListContract = exports.RicercaResearchListResponseSchema = exports.RicercaResearchListQuerySchema = exports.labBriefGapsListContract = exports.LabBriefGapsListResponseSchema = exports.LabBriefGapsListQuerySchema = void 0;
const zod_1 = require("zod");
const index_js_1 = require("../../auth/index.cjs");
const tools_js_1 = require("../../capability/lab/tools.cjs");
const research_js_1 = require("../../capability/ricerca/research.cjs");
const asset_js_1 = require("../../organization/asset.cjs");
const internal_capability_agent_js_1 = require("./internal-capability-agent.cjs");
const internal_capability_lab_js_1 = require("./internal-capability-lab.cjs");
exports.LabBriefGapsListQuerySchema = zod_1.z.strictObject({
    tenantId: internal_capability_lab_js_1.labScopeQuerySchema.shape.tenantId,
    ownerId: internal_capability_lab_js_1.labScopeQuerySchema.shape.ownerId,
    clientId: tools_js_1.LabBriefGapsInputSchema.shape.clientId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
exports.LabBriefGapsListResponseSchema = zod_1.z.strictObject({
    analyses: zod_1.z.array(zod_1.z.strictObject({
        gapsRef: research_js_1.LabGapsRefSchema,
        topics: tools_js_1.LabBriefGapsInputSchema.shape.topics,
        covered: tools_js_1.LabBriefGapsOutputSchema.shape.covered,
        gaps: tools_js_1.LabBriefGapsOutputSchema.shape.gaps,
        analyzedAt: zod_1.z.iso.datetime(),
    })).max(50),
});
/** Read an agent's brief analyses for a client project. */
exports.labBriefGapsListContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/lab/brief-gaps',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.LabBriefGapsListQuerySchema,
    responseSchema: exports.LabBriefGapsListResponseSchema,
    errorResponseSchema: internal_capability_lab_js_1.LabHttpErrorSchema,
};
exports.RicercaResearchListQuerySchema = zod_1.z.strictObject({
    tenantId: internal_capability_lab_js_1.labScopeQuerySchema.shape.tenantId,
    ownerId: internal_capability_lab_js_1.labScopeQuerySchema.shape.ownerId,
    projectId: asset_js_1.AssetRefSchema.shape.projectId,
    limit: zod_1.z.coerce.number().int().min(1).max(50).optional(),
});
exports.RicercaResearchListResponseSchema = zod_1.z.strictObject({
    researches: zod_1.z.array(zod_1.z.strictObject({
        researchId: research_js_1.ResearchIdSchema,
        state: research_js_1.ResearchStateSchema,
        labGapsRef: research_js_1.LabGapsRefSchema.optional(),
    })).max(50),
});
/** Read project research and its optional link to a lab brief analysis. */
exports.ricercaResearchListContract = {
    method: 'GET',
    path: '/internal/capability/agents/:agentId/ricerca/researches',
    authType: 'secret',
    authHeader: index_js_1.INTERNAL_SECRET_HEADER,
    paramsSchema: internal_capability_agent_js_1.CapabilityAgentParamsSchema,
    querySchema: exports.RicercaResearchListQuerySchema,
    responseSchema: exports.RicercaResearchListResponseSchema,
    errorResponseSchema: internal_capability_lab_js_1.LabHttpErrorSchema,
};
//# sourceMappingURL=internal-rd-observations.js.map