import { z } from 'zod';
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../capability/capability-call-context.js";
import { CapabilityAgentParametersSchema } from "../capability/parameters.js";
import { CapabilityOrdinaryConfigurationSchema, sameOrdinaryData } from "../capability/ordinary-configuration.js";
import { CapabilityOrdinaryBundleReferenceSchema, CapabilityOrdinaryOperationSchema } from "../capability/ordinary-lifecycle.js";
import { AgentRuntimeIdentitySchema } from "./agent-runtime-identity.js";
import { AgentManagementCommandSchema } from "./agent-management.js";
import { AgentManagementRequestIdSchema } from "./agent-model-management-values.js";
import { AgentWorkspaceDescriptorSchema } from "./agent-workspace.js";
import { digestAgentWorkspace } from "./agent-workspace-digest.js";
const name = CapabilityAgentParametersSchema.shape.capability.regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
const scope = CapabilityAgentScopeSchema;
const reference = CapabilityOrdinaryBundleReferenceSchema;
/** A service asks the configured Core authority for one retained transaction, never an arbitrary URL. */
export const AgentOrdinaryAuthorityQuerySchema = z.object({
    view: z.literal('ordinary-authority'), tenantId: scope.shape.tenantId, ownerId: scope.shape.ownerId,
    runtimeAgentId: scope.shape.agentId, capability: name, requestId: AgentManagementRequestIdSchema,
    bundleVersion: z.union([reference.shape.appliedVersion, z.string().regex(/^[1-9][0-9]*$/).transform(Number).pipe(reference.shape.appliedVersion)]),
    bundleSha256: reference.shape.sha256,
}).strict();
/** Metadata/config for exactly one capability. It contains no agent context or credential bag. */
export const AgentOrdinaryAuthoritySchema = z.object({
    scope, identity: AgentRuntimeIdentitySchema.strict(), capability: name, requestId: AgentManagementRequestIdSchema,
    bundle: reference, membership: z.enum(['enabled', 'disabled', 'removed']),
    configuration: CapabilityOrdinaryConfigurationSchema.nullable(),
    operation: CapabilityOrdinaryOperationSchema.optional(),
}).strict().superRefine((authority, ctx) => {
    if (authority.scope.agentId !== authority.identity.runtimeAgentId)
        ctx.addIssue({ code: 'custom', path: ['identity'], message: 'Runtime identity must match authority scope' });
    if (authority.configuration && (!sameCapabilityScope(authority.scope, authority.configuration.scope) || authority.configuration.capability !== authority.capability))
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Configuration must belong to the authority target' });
    if (authority.membership !== 'enabled' && authority.configuration !== null)
        ctx.addIssue({ code: 'custom', path: ['configuration'], message: 'Inactive membership has no active configuration' });
});
/** Core-only projection from a retained, file-verified bundle. Hash validation does not verify files itself. */
export async function projectAgentOrdinaryAuthority(input) {
    const query = AgentOrdinaryAuthorityQuerySchema.parse(input.query);
    const descriptor = AgentWorkspaceDescriptorSchema.parse(input.descriptor);
    const identity = AgentRuntimeIdentitySchema.strict().parse(input.identity);
    const bundle = await digestAgentWorkspace(descriptor);
    if (descriptor.tenantId !== query.tenantId || descriptor.ownerId !== query.ownerId
        || descriptor.agentId !== query.runtimeAgentId || identity.runtimeAgentId !== descriptor.agentId
        || input.retainedRequestId !== query.requestId || bundle.appliedVersion !== query.bundleVersion
        || bundle.sha256 !== query.bundleSha256)
        throw new Error('Lookup does not match the retained verified bundle');
    let operation;
    if (input.command !== undefined || input.execution !== undefined) {
        const command = AgentManagementCommandSchema.parse(input.command);
        const commandBundle = input.commandBundle === undefined ? bundle : CapabilityOrdinaryBundleReferenceSchema.parse(input.commandBundle);
        operation = CapabilityOrdinaryOperationSchema.parse({ action: command.action, execution: input.execution });
        if (command.requestId !== query.requestId || ('targets' in command && command.targets
            && !command.targets.some(target => target.kind === 'runtime' && target.targetId === identity.runtimeAgentId))
            || (command.action === 'apply-config' && command.desiredVersion !== commandBundle.appliedVersion)) {
            throw new Error('Retained management command does not authorize this operation');
        }
    }
    const entry = descriptor.registry.capabilities.find(item => item.name === query.capability);
    const configuration = descriptor.ordinaryConfigurations?.find(item => item.capability === query.capability) ?? null;
    return AgentOrdinaryAuthoritySchema.parse({
        scope: { tenantId: query.tenantId, ownerId: query.ownerId, agentId: query.runtimeAgentId },
        identity, capability: query.capability, requestId: query.requestId, bundle,
        membership: entry ? entry.enabled ? 'enabled' : 'disabled' : 'removed', configuration, ...(operation ? { operation } : {}),
    });
}
/** Service-side binding of an authenticated reply to the exact lookup and expected Core mapping. */
export function parseAgentOrdinaryAuthorityResponse(response, lookup, expectedIdentity) {
    const authority = AgentOrdinaryAuthoritySchema.parse(response);
    const query = AgentOrdinaryAuthorityQuerySchema.parse(lookup);
    const identity = AgentRuntimeIdentitySchema.strict().parse(expectedIdentity);
    if (!sameCapabilityScope(authority.scope, { tenantId: query.tenantId, ownerId: query.ownerId, agentId: query.runtimeAgentId })
        || authority.capability !== query.capability || authority.requestId !== query.requestId
        || authority.bundle.appliedVersion !== query.bundleVersion || authority.bundle.sha256 !== query.bundleSha256
        || !sameOrdinaryData(authority.identity, identity))
        throw new Error('Authority reply does not match the retained lookup');
    return authority;
}
//# sourceMappingURL=ordinary-authority.js.map