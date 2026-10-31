import { z } from 'zod';
import { AgentConfigVersionSchema } from "../capability/ricerca/agent-config.js";
import { AgentManagementRequestIdSchema } from "./agent-management-request-id.js";
/**
 * Birth signal of an agent that is born WITH its models (R&D heirs: Lab, Ricerca, BU of the `ricerca-lab` profile).
 *
 * The owner of the birth is Forge: the deploy job that is at its `reload-agent-core` step says "this is the first
 * publication of the models of configuration version N" and agent-core publishes them with closed admission. A restored
 * context, a restart or a retry after the confirmation carries no signal, so it can never be mistaken for a birth.
 */
export const AgentBirthDeployJobIdSchema = z.string().min(1).max(100).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
export const AgentBirthSignalSchema = z.object({
    /** The Forge deploy job that owns this birth. */
    deployJobId: AgentBirthDeployJobIdSchema,
    /** Must be the `configVersion` of the birth `modelConfiguration` of the context being loaded. */
    configVersion: AgentConfigVersionSchema,
}).strict();
/**
 * What agent-core answers once the birth models are published and confirmed: the request that published them and the
 * configuration version it published. A reload of a birth without this receipt is not a concluded birth.
 */
export const AgentBirthModelsReceiptSchema = z.object({
    requestId: AgentManagementRequestIdSchema,
    configVersion: AgentConfigVersionSchema,
}).strict();
//# sourceMappingURL=agent-birth.js.map