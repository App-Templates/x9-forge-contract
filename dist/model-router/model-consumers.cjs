"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AGENT_CORE_MODEL_CONSUMER = exports.AGENT_CORE_MODEL_CAPABILITY_ID = exports.ModelConsumerRegistrySchema = exports.ModelConsumerSchema = void 0;
exports.registeredModelConsumers = registeredModelConsumers;
exports.findModelConsumer = findModelConsumer;
const zod_1 = require("zod");
const parameters_js_1 = require("../capability/parameters.cjs");
const agent_model_configuration_js_1 = require("./agent-model-configuration.cjs");
const model_catalog_js_1 = require("./model-catalog.cjs");
/** Server consumer requirements, not model support, credential access or installed-agent evidence. */
exports.ModelConsumerSchema = zod_1.z.object({
    slotId: agent_model_configuration_js_1.ModelSlotIdSchema,
    capability: parameters_js_1.CapabilityAgentParametersSchema.shape.capability,
    function: model_catalog_js_1.ModelFunctionSchema,
    requirements: model_catalog_js_1.ModelFeaturesSchema,
}).strict();
exports.ModelConsumerRegistrySchema = zod_1.z.array(exports.ModelConsumerSchema).min(1).max(64)
    .refine(consumers => new Set(consumers.map(consumer => consumer.slotId)).size === consumers.length, { message: 'One server consumer for each model slot' });
exports.AGENT_CORE_MODEL_CAPABILITY_ID = 'agent-core';
/** Existing complete fallback serves stream ingress; token streaming is not claimed by this metadata. */
exports.AGENT_CORE_MODEL_CONSUMER = Object.freeze({
    slotId: agent_model_configuration_js_1.AGENT_CHAT_MODEL_SLOT_ID, capability: exports.AGENT_CORE_MODEL_CAPABILITY_ID, function: 'reasoning',
    requirements: Object.freeze({ tools: true, stream: false, structuredOutput: false }),
});
const consumers = exports.ModelConsumerRegistrySchema.parse([exports.AGENT_CORE_MODEL_CONSUMER]);
/** Detached reads prevent one caller from changing another caller's binding or requirements. */
function registeredModelConsumers() { return structuredClone(consumers); }
/** Exact server registration only. Unknown or malformed input never selects a default consumer. */
function findModelConsumer(slotId) {
    const found = consumers.find(consumer => consumer.slotId === slotId);
    return found === undefined ? undefined : structuredClone(found);
}
//# sourceMappingURL=model-consumers.js.map