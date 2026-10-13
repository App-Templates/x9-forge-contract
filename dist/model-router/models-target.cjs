"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelsApplyJobSchema = exports.ModelsApplyStateSchema = exports.ModelsTargetSchema = void 0;
const zod_1 = require("zod");
const agent_identity_js_1 = require("../agent/agent-identity.cjs");
const agent_management_js_1 = require("../agent/agent-management.cjs");
const agent_model_configuration_js_1 = require("./agent-model-configuration.cjs");
/** The platform defaults target the stack; execution identity remains in the configuration. */
exports.ModelsTargetSchema = zod_1.z.discriminatedUnion('scope', [
    zod_1.z.object({ scope: zod_1.z.literal('stack') }).strict(),
    zod_1.z.object({ scope: zod_1.z.literal('agent'), agentId: agent_identity_js_1.AgentIdSchema }).strict(),
]);
exports.ModelsApplyStateSchema = zod_1.z.enum(['queued', 'applying', 'applied', 'failed', 'unchanged']);
/** Public job progress includes child outcomes, never a reassignment of the stack's execution identity. */
exports.ModelsApplyJobSchema = agent_model_configuration_js_1.AgentModelsPendingWorkSchema.safeExtend({
    target: exports.ModelsTargetSchema,
    state: exports.ModelsApplyStateSchema.optional(),
    result: agent_management_js_1.AgentManagementCommandResultSchema.nullable().optional(),
    runtime: agent_model_configuration_js_1.AgentModelRuntimeAttestationSchema.nullable().optional(),
    children: zod_1.z.array(zod_1.z.object({ agentId: agent_identity_js_1.AgentIdSchema, state: exports.ModelsApplyStateSchema,
        reason: agent_management_js_1.AgentManagementReasonSchema.optional(),
        result: agent_management_js_1.AgentManagementCommandResultSchema.nullable().optional(),
        runtime: agent_model_configuration_js_1.AgentModelRuntimeAttestationSchema.nullable().optional(),
    }).strict()).max(2048),
}).superRefine((job, ctx) => {
    if (new Set(job.children.map(child => child.agentId)).size !== job.children.length)
        ctx.addIssue({ code: 'custom', path: ['children'], message: 'A child agent occurs once per job' });
});
//# sourceMappingURL=models-target.js.map