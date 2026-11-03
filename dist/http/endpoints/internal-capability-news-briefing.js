import { z } from 'zod';
import { AgentRuntimeIdentitySchema } from "../../agent/agent-runtime-identity.js";
import { AgentConfigVersionSchema } from "../../capability/ricerca/agent-config.js";
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { NewsBriefingCommandSchema, NewsBriefingFamilySchema, NewsBriefingStateSchema } from "../../capability/configuration/news-briefing.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-model-management-values.js";
export const NewsBriefingQuerySchema = CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ family: NewsBriefingFamilySchema }).strict();
/** Derived from canonical producer journals; failures remain visible on an idempotent Save retry. */
export const NewsBriefingPropagationSchema = z.object({
    sourceVersion: AgentConfigVersionSchema,
    status: z.enum(['complete', 'pending', 'superseded', 'not-applicable']),
    targets: z.array(z.object({
        scope: CapabilityAgentScopeSchema, identity: AgentRuntimeIdentitySchema,
        outcome: z.enum(['updated', 'pending', 'failed', 'superseded']),
        version: AgentConfigVersionSchema.optional(),
    }).strict().refine(value => value.identity.runtimeAgentId === value.scope.agentId, 'Follower identity mismatch')).max(1000),
}).strict().superRefine((value, ctx) => {
    if (new Set(value.targets.map(target => JSON.stringify(target.scope))).size !== value.targets.length)
        ctx.addIssue({ code: 'custom', path: ['targets'], message: 'Duplicate follower' });
    if (value.status === 'complete' && value.targets.some(target => target.outcome !== 'updated'))
        ctx.addIssue({ code: 'custom', path: ['status'], message: 'Incomplete propagation cannot be complete' });
    if (value.status === 'not-applicable' && value.targets.length)
        ctx.addIssue({ code: 'custom', path: ['targets'], message: 'Unexpected propagation targets' });
});
export const NewsBriefingCommandResultSchema = z.object({
    requestId: AgentManagementRequestIdSchema,
    replayed: z.boolean(),
    state: NewsBriefingStateSchema,
    propagation: NewsBriefingPropagationSchema.optional(),
}).strict().superRefine((value, ctx) => {
    if (value.propagation && (value.propagation.sourceVersion !== value.state.version || value.propagation.targets.some(target => target.scope.tenantId !== value.state.scope.tenantId || target.scope.ownerId !== value.state.scope.ownerId || target.scope.agentId === value.state.scope.agentId)))
        ctx.addIssue({ code: 'custom', path: ['propagation'], message: 'Propagation source or follower mismatch' });
});
export const NewsBriefingPropagationRequestSchema = z.object({
    scope: CapabilityAgentScopeSchema, family: NewsBriefingFamilySchema,
    requestId: AgentManagementRequestIdSchema, version: AgentConfigVersionSchema,
}).strict();
export const capNewsBriefingPropagationPath = (agentId) => `${capNewsBriefingSettingsPath(agentId)}/propagation`;
export const newsBriefingPropagationContract = {
    method: 'POST', path: '/internal/capability/agents/:agentId/settings/propagation',
    authType: 'secret', paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: NewsBriefingPropagationRequestSchema, responseSchema: NewsBriefingPropagationSchema,
};
export const capNewsBriefingSettingsPath = (agentId) => `/internal/capability/agents/${CapabilityAgentParamsSchema.parse({ agentId }).agentId}/settings`;
export const newsBriefingSettingsGetContract = {
    method: 'GET', path: '/internal/capability/agents/:agentId/settings',
    authType: 'secret', paramsSchema: CapabilityAgentParamsSchema,
    querySchema: NewsBriefingQuerySchema, responseSchema: NewsBriefingStateSchema,
};
export const newsBriefingSettingsPostContract = {
    method: 'POST', path: newsBriefingSettingsGetContract.path,
    authType: 'secret', paramsSchema: CapabilityAgentParamsSchema,
    bodySchema: NewsBriefingCommandSchema, responseSchema: NewsBriefingCommandResultSchema,
};
/** Resolve identity and scope on the server; check durable request replay before calling this CAS validator. */
export function parseNewsBriefingCommand(input, authority) {
    const command = NewsBriefingCommandSchema.parse(input);
    CapabilityAgentScopeSchema.parse(authority.scope);
    if (!sameCapabilityScope(command.scope, authority.scope) || command.family !== authority.family) {
        throw new Error('News/Briefing command target mismatch');
    }
    if (command.expectedVersion !== authority.currentVersion)
        throw new Error('News/Briefing CAS conflict');
    return command;
}
//# sourceMappingURL=internal-capability-news-briefing.js.map