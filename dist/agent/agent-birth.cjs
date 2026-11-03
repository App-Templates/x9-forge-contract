"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentBirthModelsReceiptSchema = exports.AgentBirthSignalSchema = exports.AgentBirthDeployJobIdSchema = void 0;
const zod_1 = require("zod");
const agent_config_js_1 = require("../capability/ricerca/agent-config.cjs");
const agent_management_request_id_js_1 = require("./agent-management-request-id.cjs");
/**
 * Birth signal of an agent that is born WITH its models (R&D heirs: Lab, Ricerca, BU of the `ricerca-lab` profile).
 *
 * The owner of the birth is Forge: the deploy job that is at its `reload-agent-core` step says "this is the first
 * publication of the models of configuration version N" and agent-core publishes them with closed admission. A restored
 * context, a restart or a retry after the confirmation carries no signal, so it can never be mistaken for a birth.
 */
exports.AgentBirthDeployJobIdSchema = zod_1.z.string().min(1).max(100).regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/);
exports.AgentBirthSignalSchema = zod_1.z.object({
    /** The Forge deploy job that owns this birth. */
    deployJobId: exports.AgentBirthDeployJobIdSchema,
    /** Must be the `configVersion` of the birth `modelConfiguration` of the context being loaded. */
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
/**
 * What agent-core answers once the birth models are published and confirmed: the request that published them and the
 * configuration version it published. A reload of a birth without this receipt is not a concluded birth.
 */
exports.AgentBirthModelsReceiptSchema = zod_1.z.object({
    requestId: agent_management_request_id_js_1.AgentManagementRequestIdSchema,
    configVersion: agent_config_js_1.AgentConfigVersionSchema,
}).strict();
//# sourceMappingURL=agent-birth.js.map