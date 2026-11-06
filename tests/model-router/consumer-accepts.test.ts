import { describe, expect, it } from 'vitest';
import { consumerAccepts, linkedChoiceConflicts } from '../../src/model-router/index.js';

const descriptor = { provider: 'openai', modelId: 'gpt-4.1-mini', protocol: 'chat-completions', adapterId: 'openai-chat' };
const other = { ...descriptor, modelId: 'synthetic-other' };
const single = { capability: 'memory', function: 'memory-extraction', mode: 'single', descriptor };
// Automatic Master selection captured on 2026-10-13, also used by model-choice.test.ts.
const standard = { provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation' };
const advanced = { ...standard, modelId: 'gpt-5.6-terra' };
const automatic = {
  capability: 'agent-core', function: 'reasoning', mode: 'automatic',
  tiers: { standard, advanced, reasoning: advanced }, fallback: standard,
};
const failover = { capability: 'stt', function: 'transcription', mode: 'failover', primary: descriptor, fallback: other };
const rag = { ...single, capability: 'rag', function: 'reasoning' };
const lab = { ...single, capability: 'lab', function: 'reasoning' };

describe('consumerAccepts', () => {
  it('accepts the automatic Master agent_chat choice', () => {
    expect(consumerAccepts('agent_chat', automatic)).toEqual([]);
  });
  it('accepts single memory_extraction and failover stt_file choices', () => {
    expect(consumerAccepts('memory_extraction', single)).toEqual([]);
    expect(consumerAccepts('stt_file', failover)).toEqual([]);
  });
  it('accepts a consistent pin for tiered routing', () => {
    expect(consumerAccepts('agent_chat', {
      ...automatic, mode: 'pin', pin: standard,
      tiers: { standard, advanced: standard, reasoning: standard },
    })).toEqual([]);
  });
  it.each(['inventato', null, {}, '__proto__', 'agent_chat '])('rejects unknown slot %j before checking its choice', slotId => {
    expect(consumerAccepts(slotId, {})).toEqual(['unknown-slot']);
  });
  it.each([{}, null, { ...single, extra: true }])('rejects invalid choice %j without further issues', choice => {
    expect(consumerAccepts('memory_extraction', choice)).toEqual(['invalid-choice']);
  });
  it('reports capability mismatch', () => {
    expect(consumerAccepts('memory_extraction', { ...single, capability: 'rag' })).toEqual(['capability-mismatch']);
  });
  it('reports function mismatch', () => {
    expect(consumerAccepts('memory_extraction', { ...single, function: 'reasoning' })).toEqual(['function-mismatch']);
  });
  it('defends an embedding slot against a reasoning choice without dimensions', () => {
    expect(consumerAccepts('memory_embedding', { ...single, function: 'reasoning' }))
      .toEqual(['function-mismatch', 'embedding-dimensions-missing']);
    expect(consumerAccepts('memory_embedding', { ...single, function: 'embedding', embeddingDimensions: 1536 })).toEqual([]);
    expect(consumerAccepts('memory_embedding', { ...single, function: 'embedding' })).toEqual(['invalid-choice']);
  });
  it('rejects single routing for agent_chat', () => {
    expect(consumerAccepts('agent_chat', { ...single, capability: 'agent-core', function: 'reasoning' })).toEqual(['routing-mismatch']);
  });
  it('rejects tiered routing for a single consumer and single routing for a failover consumer', () => {
    expect(consumerAccepts('memory_extraction', { ...automatic, capability: 'memory', function: 'memory-extraction' }))
      .toEqual(['routing-mismatch']);
    expect(consumerAccepts('stt_file', { ...single, capability: 'stt', function: 'transcription' })).toEqual(['routing-mismatch']);
  });
  it('enforces the registered Lab adapter', () => {
    expect(consumerAccepts('lab_digest', lab)).toEqual(['adapter-not-allowed']);
    expect(consumerAccepts('lab_digest', { ...lab, descriptor: { ...descriptor, adapterId: 'lab-openai-responses' } })).toEqual([]);
  });
  it('checks every tier and fallback descriptor without duplicate adapter issues', () => {
    const allowed = { ...descriptor, adapterId: 'lab-openai-responses' };
    for (const position of ['standard', 'advanced', 'reasoning', 'fallback']) {
      expect(consumerAccepts('lab_digest', {
        ...automatic, capability: 'lab',
        tiers: { standard: allowed, advanced: allowed, reasoning: allowed, ...(position === 'fallback' ? {} : { [position]: descriptor }) },
        fallback: position === 'fallback' ? descriptor : allowed,
      })).toEqual(['routing-mismatch', 'adapter-not-allowed']);
    }
    expect(consumerAccepts('lab_digest', { ...automatic, capability: 'lab' }))
      .toEqual(['routing-mismatch', 'adapter-not-allowed']);
  });
  it('checks both failover descriptors and keeps issue order stable', () => {
    const allowed = { ...descriptor, adapterId: 'lab-openai-responses' };
    for (const descriptors of [{ primary: descriptor, fallback: allowed }, { primary: allowed, fallback: descriptor }]) {
      expect(consumerAccepts('lab_digest', { ...failover, ...descriptors }))
        .toEqual(['capability-mismatch', 'function-mismatch', 'routing-mismatch', 'adapter-not-allowed']);
    }
  });
});

describe('linkedChoiceConflicts', () => {
  it('returns sorted slot IDs for different linked choices', () => {
    expect(linkedChoiceConflicts({ rag_claim_validation: { ...rag, descriptor: other }, rag_claim_extraction: rag }))
      .toEqual(['rag_claim_extraction', 'rag_claim_validation']);
  });
  it('accepts equal descriptors regardless of object identity or key order', () => {
    expect(linkedChoiceConflicts({ rag_claim_extraction: rag, rag_claim_validation: {
      ...rag, descriptor: { adapterId: descriptor.adapterId, protocol: descriptor.protocol, modelId: descriptor.modelId, provider: descriptor.provider },
    } })).toEqual([]);
  });
  it.each([
    { modelId: 'different' }, { adapterId: 'different' }, { provider: 'different' }, { protocol: 'responses' },
  ])('compares the complete descriptor %j', patch => {
    expect(linkedChoiceConflicts({ rag_claim_extraction: rag, rag_claim_validation: { ...rag, descriptor: { ...descriptor, ...patch } } }))
      .toEqual(['rag_claim_extraction', 'rag_claim_validation']);
  });
  it('includes every member of a conflicting group once', () => {
    expect(linkedChoiceConflicts({ rag_topic_synthesis: rag, rag_claim_validation: { ...rag, descriptor: other }, rag_claim_extraction: rag }))
      .toEqual(['rag_claim_extraction', 'rag_claim_validation', 'rag_topic_synthesis']);
  });
  it('ignores absent, unknown, unlinked and malformed entries', () => {
    expect(linkedChoiceConflicts({})).toEqual([]);
    expect(linkedChoiceConflicts({ rag_claim_extraction: rag, inventato: { ...rag, descriptor: other }, memory_extraction: single, rag_claim_validation: {} })).toEqual([]);
  });
  it('does not mutate choices', () => {
    const choices = { rag_claim_extraction: structuredClone(rag), rag_claim_validation: { ...rag, descriptor: other } };
    const before = structuredClone(choices);
    linkedChoiceConflicts(choices);
    consumerAccepts('rag_claim_extraction', choices.rag_claim_extraction);
    expect(choices).toEqual(before);
  });
});
