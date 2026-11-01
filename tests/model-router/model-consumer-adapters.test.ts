import { describe, expect, it } from 'vitest';
import { MODEL_CONSUMER_ADAPTER_IDS, modelConsumerAcceptsAdapter } from '../../src/model-router/index.js';

describe('adapters a model consumer installs through (v1.75.0)', () => {
  it('the Lab digest accepts only its dedicated Responses adapter', () => {
    expect(modelConsumerAcceptsAdapter('lab_digest', 'lab-openai-responses')).toBe(true);
    expect(modelConsumerAcceptsAdapter('lab_digest', 'openai-responses')).toBe(false);
    expect(modelConsumerAcceptsAdapter('lab_digest', undefined)).toBe(false);
  });

  it('a slot without a restriction accepts any adapter, and a prototype key is not a slot', () => {
    expect(modelConsumerAcceptsAdapter('research_search', 'anything')).toBe(true);
    expect(modelConsumerAcceptsAdapter('agent_chat', 'openai-chat')).toBe(true);
    expect(modelConsumerAcceptsAdapter('toString', 'anything')).toBe(true);
    expect(modelConsumerAcceptsAdapter(undefined, undefined)).toBe(true);
  });

  it('the declaration cannot be changed by a consumer', () => {
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS)).toBe(true);
    expect(Object.isFrozen(MODEL_CONSUMER_ADAPTER_IDS.lab_digest)).toBe(true);
  });
});
