import { CapabilityTurnLeadRequestSchema, CapabilityTurnLeadResponseSchema } from "../../capability/capability-turn-lead.js";
/** POST /turn — authenticated runtime -> capability declared in the agent's registry. */
export const capTurnLeadContract = {
    method: 'POST',
    path: '/turn',
    authType: 'secret',
    bodySchema: CapabilityTurnLeadRequestSchema,
    responseSchema: CapabilityTurnLeadResponseSchema,
};
//# sourceMappingURL=cap-turn-lead.js.map