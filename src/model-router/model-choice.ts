import { z } from 'zod';
import { CapabilityAgentParametersSchema } from '../capability/parameters.js';
import { ModelTierSchema } from './model-tier.js';
import { ModelDescriptorSchema, ModelFunctionSchema } from './model-catalog.js';
import type { ModelFeaturesSchema } from './model-catalog.js';
import { CapabilityModelSettingsSchema, refineFailoverFunction, refinePinnedTiers, refineSingleEmbedding } from './capability-model-settings.js';
import type { CapabilityModelSettings } from './capability-model-settings.js';

/** Same fields as CapabilityModelSettings, without the catalog version and the consumer requirements. */
const choiceBase = {
  capability: CapabilityAgentParametersSchema.shape.capability,
  function: ModelFunctionSchema,
  tiers: z.record(ModelTierSchema, ModelDescriptorSchema),
  fallback: ModelDescriptorSchema,
};
const AutomaticChoiceSchema = z.object({ ...choiceBase, mode: z.literal('automatic') }).strict();
const PinnedChoiceSchema = z.object({ ...choiceBase, mode: z.literal('pin'), pin: ModelDescriptorSchema }).strict().superRefine(refinePinnedTiers);
const SingleChoiceSchema = z.object({
  ...choiceBase, tiers: z.never().optional(), fallback: z.never().optional(),
  mode: z.literal('single'), descriptor: ModelDescriptorSchema,
  embeddingDimensions: z.number().int().positive().optional(),
}).strict().superRefine(refineSingleEmbedding);
const FailoverChoiceSchema = z.object({
  ...choiceBase, tiers: z.never().optional(),
  mode: z.literal('failover'), primary: ModelDescriptorSchema,
}).strict().superRefine(refineFailoverFunction);

/** A model choice that is valid for a preset row and for an agent, not tied to a catalog version. */
export const ModelChoiceSchema = z.union([AutomaticChoiceSchema, PinnedChoiceSchema, SingleChoiceSchema, FailoverChoiceSchema]);
export type ModelChoice = z.infer<typeof ModelChoiceSchema>;

/** Detached copy of the settings without `catalogVersion` and `requirements`. */
export function toModelChoice(settings: CapabilityModelSettings): ModelChoice {
  const { catalogVersion: _catalogVersion, requirements: _requirements, ...choice } = structuredClone(settings);
  return ModelChoiceSchema.parse(choice);
}

/** Adds the catalog version and requirements back and re-validates with the full settings schema. */
export function toCapabilityModelSettings(choice: ModelChoice, extra: { catalogVersion: string; requirements: z.infer<typeof ModelFeaturesSchema> }): CapabilityModelSettings {
  return CapabilityModelSettingsSchema.parse({ ...structuredClone(choice), catalogVersion: extra.catalogVersion, requirements: structuredClone(extra.requirements) });
}
