"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentOrdinaryAuthoritySchema = exports.AgentOrdinaryAuthorityQuerySchema = void 0;
exports.projectAgentOrdinaryAuthority = projectAgentOrdinaryAuthority;
exports.parseAgentOrdinaryAuthorityResponse = parseAgentOrdinaryAuthorityResponse;
const zod_1 = require("zod");
const capability_call_context_js_1 = require("../capability/capability-call-context.cjs");
const parameters_js_1 = require("../capability/parameters.cjs");
const ordinary_configuration_js_1 = require("../capability/ordinary-configuration.cjs");
const ordinary_lifecycle_js_1 = require("../capability/ordinary-lifecycle.cjs");
const agent_runtime_identity_js_1 = require("./agent-runtime-identity.cjs");
const agent_model_management_values_js_1 = require("./agent-model-management-values.cjs");
const agent_workspace_js_1 = require("./agent-workspace.cjs");
const agent_workspace_digest_js_1 = require("./agent-workspace-digest.cjs");
const name = parameters_js_1.CapabilityAgentParametersSchema.shape.capability.regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
const scope = capability_call_context_js_1.CapabilityAgentScopeSchema;
const reference = ordinary_lifecycle_js_1.CapabilityOrdinaryBundleReferenceSchema;
/** A service asks the configured Core authority for one retained transaction, never an arbitrary URL. */
exports.AgentOrdinaryAuthorityQuerySchema = zod_1.z.object({
    view: zod_1.z.literal('ordinary-authority'), tenantId: scope.shape.tenantId, ownerId: scope.shape.ownerId,
    runtimeAgentId: scope.shape.agentId, capability: name, requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    bundleVersion: zod_1.z.union([reference.shape.appliedVersion, zod_1.z.string().regex(/^[1-9][0-9]*$/).transform(Number).pipe(reference.shape.appliedVersion)]),
    bundleSha256: reference.shape.sha256,
}).strict();
/** Metadata/config for exactly one capability. It contains no agent context or credential bag. */
exports.AgentOrdinaryAuthoritySchema = zod_1.z.object({
    scope, identity: agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict(), capability: name, requestId: agent_model_management_values_js_1.AgentManagementRequestIdSchema,
    bundle: reference, membership: zod_1.z.enum(['enabled', 'disabled', 'removed']),
    configuration: ordinary_configuration_js_1.CapabilityOrdinaryConfigurationSchema.nullable(),
}).strict().superRefine((authority, ctx) => {
    if (authority.scope.agentId !== authority.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Runtime identity must match authority scope' });
    if (authority.configuration && (!(0, capability_call_context_js_1.sameCapabilityScope)(authority.scope, authority.configuration.scope) || authority.configuration.capability !== authority.capability))
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Configuration must belong to the authority target' });
    if (authority.membership !== 'enabled' && authority.configuration !== null)
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Inactive membership has no active configuration' });
});
/** Core-only projection from a retained, file-verified bundle. Hash validation does not verify files itself. */
async function projectAgentOrdinaryAuthority(input) {
    const query = exports.AgentOrdinaryAuthorityQuerySchema.parse(input.query);
    const descriptor = agent_workspace_js_1.AgentWorkspaceDescriptorSchema.parse(input.descriptor);
    const identity = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict().parse(input.identity);
    const bundle = await (0, agent_workspace_digest_js_1.digestAgentWorkspace)(descriptor);
    if (descriptor.tenantId !== query.tenantId || descriptor.ownerId !== query.ownerId
        || descriptor.agentId !== query.runtimeAgentId || identity.runtimeAgentId !== descriptor.agentId
        || input.retainedRequestId !== query.requestId || bundle.appliedVersion !== query.bundleVersion
        || bundle.sha256 !== query.bundleSha256)
        throw new Error('Lookup does not match the retained verified bundle');
    const entry = descriptor.registry.capabilities.find(item => item.name === query.capability);
    const configuration = descriptor.ordinaryConfigurations?.find(item => item.capability === query.capability) ?? null;
    return exports.AgentOrdinaryAuthoritySchema.parse({
        scope: { tenantId: query.tenantId, ownerId: query.ownerId, agentId: query.runtimeAgentId },
        identity, capability: query.capability, requestId: query.requestId, bundle,
        membership: entry ? entry.enabled ? 'enabled' : 'disabled' : 'removed', configuration,
    });
}
/** Service-side binding of an authenticated reply to the exact lookup and expected Core mapping. */
function parseAgentOrdinaryAuthorityResponse(response, lookup, expectedIdentity) {
    const authority = exports.AgentOrdinaryAuthoritySchema.parse(response);
    const query = exports.AgentOrdinaryAuthorityQuerySchema.parse(lookup);
    const identity = agent_runtime_identity_js_1.AgentRuntimeIdentitySchema.strict().parse(expectedIdentity);
    if (!(0, capability_call_context_js_1.sameCapabilityScope)(authority.scope, { tenantId: query.tenantId, ownerId: query.ownerId, agentId: query.runtimeAgentId })
        || authority.capability !== query.capability || authority.requestId !== query.requestId
        || authority.bundle.appliedVersion !== query.bundleVersion || authority.bundle.sha256 !== query.bundleSha256
        || !(0, ordinary_configuration_js_1.sameOrdinaryData)(authority.identity, identity))
        throw new Error('Authority reply does not match the retained lookup');
    return authority;
}
//# sourceMappingURL=ordinary-authority.js.map