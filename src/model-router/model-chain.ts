// Catena di modelli a passaggi fissi: bozza, critica di un altro modello, chiusura. Nessun id di modello qui.
import { z } from 'zod';
import { ModelDescriptorSchema, sameModelDescriptor } from './model-catalog.js';

export const MODEL_CHAIN_STEP_ROLES = ['draft', 'critique', 'close'] as const;
export const ModelChainStepRoleSchema = z.enum(MODEL_CHAIN_STEP_ROLES);
export type ModelChainStepRole = z.infer<typeof ModelChainStepRoleSchema>;

export const MODEL_CHAIN_EFFORTS = ['low', 'medium', 'high'] as const;
export const ModelChainEffortSchema = z.enum(MODEL_CHAIN_EFFORTS);
export type ModelChainEffort = z.infer<typeof ModelChainEffortSchema>;

export const ModelChainIdSchema = z.string().regex(/^[a-z][a-z0-9._-]{0,63}$/);

export const ModelChainStepSchema = z.object({
  role: ModelChainStepRoleSchema,
  descriptor: ModelDescriptorSchema,
  effort: ModelChainEffortSchema,
}).strict();
export type ModelChainStep = z.infer<typeof ModelChainStepSchema>;

export const LAB_DIGEST_RELAY_CHAIN_ID = 'lab_digest_relay';
export const LAB_ANTHROPIC_MESSAGES_ADAPTER_ID = 'lab-anthropic-messages';

/** The only adapters a chain accepts, when it is not "any supported adapter". */
export const MODEL_CHAIN_ADAPTER_IDS: Readonly<Record<string, readonly string[]>> = Object.freeze({
  [LAB_DIGEST_RELAY_CHAIN_ID]: Object.freeze(['lab-openai-responses', LAB_ANTHROPIC_MESSAGES_ADAPTER_ID]),
});
/** true when the chain has no adapter restriction, or the adapter is one of its allowed ones. */
export function modelChainAcceptsAdapter(chainId: unknown, adapterId: unknown): boolean {
  if (typeof chainId !== 'string' || !Object.hasOwn(MODEL_CHAIN_ADAPTER_IDS, chainId)) return true;
  return typeof adapterId === 'string' && MODEL_CHAIN_ADAPTER_IDS[chainId]!.includes(adapterId);
}

export const ModelChainSchema = z.object({
  chainId: ModelChainIdSchema,
  steps: z.array(ModelChainStepSchema).length(3),
}).strict().superRefine((chain, ctx) => {
  const [draft, critique, close] = chain.steps;
  if (!MODEL_CHAIN_STEP_ROLES.every((role, index) => chain.steps[index]?.role === role)) {
    ctx.addIssue({ code: 'custom', path: ['steps'], message: 'Steps must be draft, critique, close in this order' });
    return;
  }
  if (sameModelDescriptor(critique!.descriptor, draft!.descriptor) || sameModelDescriptor(critique!.descriptor, close!.descriptor)) {
    ctx.addIssue({ code: 'custom', path: ['steps', 1, 'descriptor'], message: 'The critique must come from a different model than the draft and the close' });
  }
  chain.steps.forEach((step, index) => {
    if (!modelChainAcceptsAdapter(chain.chainId, step.descriptor.adapterId)) {
      ctx.addIssue({ code: 'custom', path: ['steps', index, 'descriptor', 'adapterId'], message: 'Adapter not allowed for this chain' });
    }
  });
});
export type ModelChain = z.infer<typeof ModelChainSchema>;
