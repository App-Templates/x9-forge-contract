import { INTERNAL_TOKEN_HEADER } from "../../auth/index.js";
import { AgentContextIdentitySchema } from "../../agent/agent-context-identity.js";
import { AgentModelSourceObservationSchema } from "../../model-router/agent-model-configuration.js";
/** X9 -> Factory. Forge attests its DB Master role against X9's current local source.
 * Metadata only; neither desired configuration nor caller-supplied role grants authority.
 */
export const forgeMasterModelAuthorityContract = {
    method: 'POST',
    path: '/api/internal/factory/models/master-authority',
    authType: 'token',
    authHeader: INTERNAL_TOKEN_HEADER,
    bodySchema: AgentModelSourceObservationSchema,
    responseSchema: AgentContextIdentitySchema,
};
//# sourceMappingURL=forge-master-model-authority.js.map