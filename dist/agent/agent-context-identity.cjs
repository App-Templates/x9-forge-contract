"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentContextWithIdentityWriteSchema = exports.AgentContextWithIdentitySchema = exports.AgentContextIdentitySchema = void 0;
exports.createAgentContextIdentity = createAgentContextIdentity;
const zod_1 = require("zod");
const agent_identity_js_1 = require("./agent-identity.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_channel_configuration_js_1 = require("./agent-channel-configuration.cjs");
const NonblankAgentId = agent_identity_js_1.AgentIdSchema.refine(value => value.trim().length > 0, 'Agent identity must not be blank');
const ContextRuntimeIdentity = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.extend({
    managementAgentId: NonblankAgentId,
    runtimeAgentId: NonblankAgentId,
    vaultAgentId: zod_1.z.number().int().positive(),
}).strict();
const CommonIdentityFields = zod_1.z.object({
    agentId: NonblankAgentId,
    ownerId: agent_identity_js_1.OwnerIdSchema.refine(value => value.trim().length > 0, 'Owner identity must not be blank'),
    tenantId: zod_1.z.string().min(1).refine(value => value.trim().length > 0, 'Tenant identity must not be blank'),
    identity: ContextRuntimeIdentity,
});
const MasterIdentity = CommonIdentityFields.extend({ role: zod_1.z.literal('master'), masterAgentId: zod_1.z.never().optional() }).strict();
const HeirIdentity = CommonIdentityFields.extend({ role: zod_1.z.literal('erede'), masterAgentId: NonblankAgentId }).strict();
/** Validate declared authority only; the consumer must resolve the Master's matching owner/tenant. */
function checkContextIdentity(value, ctx) {
    if (value.agentId !== value.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['identity', 'runtimeAgentId'], message: 'Runtime identity must match the context agent' });
    }
    if (value.role === 'erede' && value.masterAgentId === value.identity.runtimeAgentId) {
        ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'An heir cannot be its own runtime Master' });
    }
    if (value.role === 'erede' && value.masterAgentId === value.identity.managementAgentId) {
        ctx.addIssue({ code: 'custom', path: ['masterAgentId'], message: 'An heir cannot name its own management alias as Master' });
    }
}
/** Forge-declared, complete context authority. masterAgentId is a runtime ID, never a Vault number. */
exports.AgentContextIdentitySchema = zod_1.z.discriminatedUnion('role', [MasterIdentity, HeirIdentity]).superRefine(checkContextIdentity);
/** Mandatory typed writer boundary; parsing returns detached values and never supplies defaults. */
function createAgentContextIdentity(input) {
    return exports.AgentContextIdentitySchema.parse(input);
}
/** Modern reader: existing channel guards and runtime extras plus complete declared authority. */
exports.AgentContextWithIdentitySchema = zod_1.z.discriminatedUnion('role', [
    agent_channel_configuration_js_1.AgentContextWithChannelsSchema.safeExtend(MasterIdentity.shape).superRefine(checkContextIdentity),
    agent_channel_configuration_js_1.AgentContextWithChannelsSchema.safeExtend(HeirIdentity.shape).superRefine(checkContextIdentity),
]);
/** Modern writer: the same authority boundary and the existing prohibition on platform credentials. */
exports.AgentContextWithIdentityWriteSchema = zod_1.z.discriminatedUnion('role', [
    agent_channel_configuration_js_1.AgentContextWithChannelsWriteSchema.safeExtend(MasterIdentity.shape).superRefine(checkContextIdentity),
    agent_channel_configuration_js_1.AgentContextWithChannelsWriteSchema.safeExtend(HeirIdentity.shape).superRefine(checkContextIdentity),
]);
//# sourceMappingURL=agent-context-identity.js.map