"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.internalRicercaResultContract = exports.InternalRicercaResultErrorSchema = exports.InternalRicercaResultResponseSchema = exports.InternalRicercaResultRequestSchema = exports.INTERNAL_RICERCA_RESULT_PATH = void 0;
const zod_1 = require("zod");
const capability_call_identity_js_1 = require("../../capability/capability-call-identity.cjs");
const research_js_1 = require("../../capability/ricerca/research.cjs");
const tools_js_1 = require("../../capability/ricerca/tools.cjs");
const participant_binding_js_1 = require("../../organization/participant-binding.cjs");
exports.INTERNAL_RICERCA_RESULT_PATH = '/internal/capability/ricerca/result';
/**
 * cap-lab reads the complete research result for `lab_ingest {researchId}`. cap-ricerca only returns research
 * from the same tenant and owner (`scope_foreign` otherwise), and only when `completed` (`not_ready` otherwise).
 * cap-lab checks that the author is the Ricerca of the calling Lab's organization (`caller`), using the existing
 * author rule for `lab_ingest {result}`.
 */
exports.InternalRicercaResultRequestSchema = zod_1.z.strictObject({
    tenantId: capability_call_identity_js_1.CapabilityAgentScopeSchema.shape.tenantId,
    ownerId: capability_call_identity_js_1.CapabilityAgentScopeSchema.shape.ownerId,
    organizationId: zod_1.z.string().min(1).max(64),
    caller: participant_binding_js_1.ParticipantAgentIdentitySchema,
    researchId: research_js_1.ResearchIdSchema,
});
exports.InternalRicercaResultResponseSchema = research_js_1.ResearchResultSchema.refine(r => r.state === 'completed', {
    message: 'only a completed research can be ingested',
    path: ['state'],
});
exports.InternalRicercaResultErrorSchema = zod_1.z.strictObject({
    ok: zod_1.z.literal(false),
    error: zod_1.z.enum([
        ...tools_js_1.RicercaToolErrorSchema.extract(['invalid_request', 'unknown_research', 'not_ready']).options,
        'scope_foreign',
    ]),
});
exports.internalRicercaResultContract = {
    method: 'POST',
    path: exports.INTERNAL_RICERCA_RESULT_PATH,
    authType: 'secret',
    bodySchema: exports.InternalRicercaResultRequestSchema,
    responseSchema: exports.InternalRicercaResultResponseSchema,
    errorResponseSchema: exports.InternalRicercaResultErrorSchema,
};
//# sourceMappingURL=internal-ricerca-result.js.map