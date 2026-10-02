"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capTurnLeadContract = void 0;
const capability_turn_lead_js_1 = require("../../capability/capability-turn-lead.cjs");
/** POST /turn — authenticated runtime -> capability declared in the agent's registry. */
exports.capTurnLeadContract = {
    method: 'POST',
    path: '/turn',
    authType: 'secret',
    bodySchema: capability_turn_lead_js_1.CapabilityTurnLeadRequestSchema,
    responseSchema: capability_turn_lead_js_1.CapabilityTurnLeadResponseSchema,
};
//# sourceMappingURL=cap-turn-lead.js.map