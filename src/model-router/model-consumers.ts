import { z } from 'zod';
import { CapabilityAgentParametersSchema } from '../capability/parameters.js';
import { AGENT_CHAT_MODEL_SLOT_ID, ModelSlotIdSchema } from './agent-model-configuration.js';
import { ModelFeaturesSchema, ModelFunctionSchema } from './model-catalog.js';

/** Server consumer requirements, not model support, credential access or installed-agent evidence. */
export const ModelConsumerSchema = z.object({
  slotId: ModelSlotIdSchema,
  capability: CapabilityAgentParametersSchema.shape.capability,
  function: ModelFunctionSchema,
  requirements: ModelFeaturesSchema,
}).strict();
export type ModelConsumer = z.infer<typeof ModelConsumerSchema>;
export const ModelConsumerRegistrySchema = z.array(ModelConsumerSchema).min(1).max(64)
  .refine(consumers => new Set(consumers.map(consumer => consumer.slotId)).size === consumers.length,
    { message: 'One server consumer for each model slot' });
export type ModelConsumerRegistry = z.infer<typeof ModelConsumerRegistrySchema>;

export const AGENT_CORE_MODEL_CAPABILITY_ID = 'agent-core';
/** Existing complete fallback serves stream ingress; token streaming is not claimed by this metadata. */
export const AGENT_CORE_MODEL_CONSUMER = Object.freeze({
  slotId: AGENT_CHAT_MODEL_SLOT_ID, capability: AGENT_CORE_MODEL_CAPABILITY_ID, function: 'reasoning',
  requirements: Object.freeze({ tools: true, stream: false, structuredOutput: false }),
} satisfies ModelConsumer);
const consumers = ModelConsumerRegistrySchema.parse([AGENT_CORE_MODEL_CONSUMER]);

/** Detached reads prevent one caller from changing another caller's binding or requirements. */
export function registeredModelConsumers(): ModelConsumerRegistry { return structuredClone(consumers); }
/** Exact server registration only. Unknown or malformed input never selects a default consumer. */
export function findModelConsumer(slotId: unknown): ModelConsumer | undefined {
  const found = consumers.find(consumer => consumer.slotId === slotId);
  return found === undefined ? undefined : structuredClone(found);
}
