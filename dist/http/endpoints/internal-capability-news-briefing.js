import { z } from 'zod';
import { CapabilityAgentParamsSchema } from "./internal-capability-agent.js";
import { CapabilityAgentScopeSchema, sameCapabilityScope } from "../../capability/capability-call-context.js";
import { NewsBriefingCommandSchema, NewsBriefingFamilySchema, NewsBriefingStateSchema } from "../../capability/configuration/news-briefing.js";
import { AgentManagementRequestIdSchema } from "../../agent/agent-model-management-values.js";
export const NewsBriefingQuerySchema = CapabilityAgentScopeSchema.omit({ agentId: true }).extend({ family: NewsBriefingFamilySchema }).strict();
export const NewsBriefingCommandResultSchema = z.object({
    requestId: AgentManagementRequestIdSchema,
    replayed: z.boolean(),
    state: NewsBriefingStateSchema,
}).strict();
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