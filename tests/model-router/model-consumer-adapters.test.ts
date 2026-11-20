import { describe, expect, it } from 'vitest';
import { MODEL_CONSUMER_ADAPTER_IDS, consumerAccepts, modelConsumerAcceptsAdapter, modelConsumerAdapterReservedElsewhere } from '../../src/model-router/index.js';

describe('adapters a model consumer installs through (v1.75.0)', () => {
  it('the Lab digest accepts only its dedicated Responses adapter', () => {
    expect(modelConsumerAcceptsAdapter('lab_digest', 'lab-openai-responses')).toBe(true);
    expect(modelConsumerAcceptsAdapter('lab_digest', 'openai-responses')).toBe(false);
    expect(modelConsumerAcceptsAdapter('lab_digest', undefined)).toBe(false);
  });

  it('a slot without a restriction accepts any adapter, and a prototype key is not a slot', () => {
    expect(modelConsumerAcceptsAdapter('qa_text', 'anything')).toBe(true);
    expect(modelConsumerAcceptsAdapter('agent_chat', 'openai-chat')).toBe(true);
    expect(modelConsumerAcceptsAdapter('toString', 'anything')).toBe(true);
    expect(modelConsumerAcceptsAdapter(undefined, undefined)).toBe(true);
  });

  it('the declaration cannot be changed by a consumer', () => {
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS)).toBe(true);
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS.lab_digest)).toBe(true);
  });
});

describe('s6949 adattatore-ricerca', () => {
  const choice = (adapterId: string) => ({
    capability: 'ricerca', function: 'reasoning', mode: 'single',
    descriptor: { provider: 'openai', modelId: 'gpt-6.1-sol', protocol: 'responses', adapterId },
  });
  it.each(['research_search', 'research_structure'])('%s accepts only the dedicated research adapter', slot => {
    expect(modelConsumerAcceptsAdapter(slot, 'ricerca-openai-responses')).toBe(true);
    expect(modelConsumerAcceptsAdapter(slot, 'openai-responses')).toBe(false);
    expect(modelConsumerAcceptsAdapter(slot, 'lab-openai-responses')).toBe(false);
    expect(modelConsumerAcceptsAdapter(slot, undefined)).toBe(false);
  });
  it('consumerAccepts refuses another adapter for the research slots', () => {
    for (const slot of ['research_search', 'research_structure']) {
      expect(consumerAccepts(slot, choice('openai-responses'))).toContain('adapter-not-allowed');
      expect(consumerAccepts(slot, choice('ricerca-openai-responses'))).not.toContain('adapter-not-allowed');
    }
  });
  it('says when an adapter is reserved to another slot', () => {
    expect(modelConsumerAdapterReservedElsewhere('research_structure', 'lab-openai-responses')).toBe(true);
    expect(modelConsumerAdapterReservedElsewhere('lab_digest', 'ricerca-openai-responses')).toBe(true);
    expect(modelConsumerAdapterReservedElsewhere('research_structure', 'ricerca-openai-responses')).toBe(false);
    expect(modelConsumerAdapterReservedElsewhere('research_search', 'ricerca-openai-responses')).toBe(false);
    expect(modelConsumerAdapterReservedElsewhere('agent_chat', 'openai-responses')).toBe(false);
    expect(modelConsumerAdapterReservedElsewhere('toString', 'lab-openai-responses')).toBe(true);
    expect(modelConsumerAdapterReservedElsewhere(undefined, 'lab-openai-responses')).toBe(false);
    expect(modelConsumerAdapterReservedElsewhere('research_structure', undefined)).toBe(false);
    expect(modelConsumerAdapterReservedElsewhere(1, {})).toBe(false);
  });
  it('the research rows are frozen', () => {
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS.research_search)).toBe(true);
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS.research_structure)).toBe(true);
  });
});
