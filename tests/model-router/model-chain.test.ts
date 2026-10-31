import { describe, expect, it } from 'vitest';
import {
  LAB_DIGEST_RELAY_CHAIN_ID,
  MODEL_CHAIN_ADAPTER_IDS,
  ModelChainSchema,
  modelChainAcceptsAdapter,
} from '../../src/model-router/index.js';

const anthropic = (modelId: string) => ({ provider: 'anthropic', modelId, protocol: 'messages', adapterId: 'lab-anthropic-messages' });
const openai = (modelId: string) => ({ provider: 'openai', modelId, protocol: 'responses', adapterId: 'lab-openai-responses' });
const step = (role: string, descriptor: object) => ({ role, descriptor, effort: 'medium' });
const chain = (steps: object[], chainId: string = LAB_DIGEST_RELAY_CHAIN_ID) => ({ chainId, steps });
const valid = () => [step('draft', anthropic('synthetic-a')), step('critique', openai('synthetic-b')), step('close', anthropic('synthetic-a'))];

describe('ModelChainSchema', () => {
  it('accepts draft, critique by another model, close', () => {
    expect(ModelChainSchema.safeParse(chain(valid())).success).toBe(true);
  });

  it('rejects steps out of order', () => {
    const [draft, critique, close] = valid();
    expect(ModelChainSchema.safeParse(chain([critique!, draft!, close!])).success).toBe(false);
  });

  it('rejects two steps', () => {
    expect(ModelChainSchema.safeParse(chain(valid().slice(0, 2))).success).toBe(false);
  });

  it('rejects a critique equal to the draft', () => {
    const [draft, , close] = valid();
    expect(ModelChainSchema.safeParse(chain([draft!, step('critique', anthropic('synthetic-a')), close!])).success).toBe(false);
  });

  it('rejects an adapter not allowed for the chain, accepts it for an unlisted chain', () => {
    const other = { ...openai('synthetic-b'), adapterId: 'other-adapter' };
    const steps = [valid()[0]!, step('critique', other), valid()[2]!];
    expect(ModelChainSchema.safeParse(chain(steps)).success).toBe(false);
    expect(ModelChainSchema.safeParse(chain(steps, 'unlisted_chain')).success).toBe(true);
    expect(modelChainAcceptsAdapter(LAB_DIGEST_RELAY_CHAIN_ID, 'other-adapter')).toBe(false);
  });

  it('freezes the adapter table', () => {
    expect(Object.isFrozen(MODEL_CHAIN_ADAPTER_IDS)).toBe(true);
    expect(Object.isFrozen(MODEL_CHAIN_ADAPTER_IDS[LAB_DIGEST_RELAY_CHAIN_ID])).toBe(true);
  });
});
