import { describe, expect, it } from 'vitest';
import * as barrel from '../../src/model-router/index.js';
import {
  EmbeddingSpaceSchema,
  ModelRebuildTargetSchema,
  ModelRebuildStateSchema,
  REBUILD_DECISIONS,
  rebuildDecision,
  embeddingRebuildCost,
  isRebuildJobCurrent,
  type EmbeddingSpace,
  type ModelRebuildTarget,
  type ModelRebuildState,
  type RebuildDecision,
} from '../../src/model-router/model-rebuild.js';

const space = (spaceId: string): EmbeddingSpace => ({
  spaceId,
  descriptor: { provider: 'openai', modelId: 'example-embedding', protocol: 'embeddings', adapterId: 'example-embeddings' },
  dimensions: 1536,
});
const target = (overrides: Partial<ModelRebuildTarget> = {}): ModelRebuildTarget => ({
  requestId: 'request-a',
  slotId: 'memory_embedding',
  space: space('space-a'),
  generation: { presetId: 1, agentGeneration: 2, presetGeneration: 3 },
  etag: 'example-etag-a',
  requestedAt: '2026-11-06T12:00:00+01:00',
  ...overrides,
});
const idle = (): ModelRebuildState => ({ active: space('active'), building: null, progress: null });
const building = (destination = target()): ModelRebuildState => ({
  active: space('active'), building: destination, progress: { completed: 2, total: 10 },
});
const newer = (overrides: Partial<ModelRebuildTarget> = {}): ModelRebuildTarget => target({
  requestId: 'request-b',
  space: space('space-b'),
  generation: { presetId: 1, agentGeneration: 3, presetGeneration: 3 },
  ...overrides,
});

describe('EmbeddingSpaceSchema', () => {
  it('preserves the consumer fingerprint without deriving it from the descriptor', () => {
    expect(EmbeddingSpaceSchema.parse(space('consumer-scope-fingerprint'))).toEqual(space('consumer-scope-fingerprint'));
  });

  it.each([
    ['empty spaceId', { ...space('a'), spaceId: '' }],
    ['long spaceId', space('a'.repeat(129))],
    ['zero dimensions', { ...space('a'), dimensions: 0 }],
    ['fractional dimensions', { ...space('a'), dimensions: 1.5 }],
    ['invalid descriptor', { ...space('a'), descriptor: {} }],
    ['extra field', { ...space('a'), extra: true }],
  ])('rejects %s', (_name, value) => {
    expect(EmbeddingSpaceSchema.safeParse(value).success).toBe(false);
  });
});

describe('ModelRebuildTargetSchema', () => {
  it.each(['memory_embedding', 'rag_embedding'])('accepts registered rebuild consumer %s', slotId => {
    const destination = target({ slotId });
    expect(ModelRebuildTargetSchema.parse(destination)).toEqual(destination);
  });

  it.each(['agent_chat', 'unregistered_embedding'])('rejects consumer %s without a registered rebuild boundary', slotId => {
    expect(ModelRebuildTargetSchema.safeParse(target({ slotId })).success).toBe(false);
  });

  it.each([
    ['empty requestId', target({ requestId: '' })],
    ['long requestId', target({ requestId: 'a'.repeat(129) })],
    ['empty etag', target({ etag: '' })],
    ['long etag', target({ etag: 'a'.repeat(257) })],
    ['invalid requestedAt', target({ requestedAt: 'yesterday' })],
    ['requestedAt without offset', target({ requestedAt: '2026-11-06T12:00:00' })],
    ['invalid generation', target({ generation: { presetId: 1, agentGeneration: -1, presetGeneration: 3 } })],
    ['extra field', { ...target(), extra: true }],
  ])('rejects %s', (_name, value) => {
    expect(ModelRebuildTargetSchema.safeParse(value).success).toBe(false);
  });
});

describe('ModelRebuildStateSchema', () => {
  it('accepts idle and building states while preserving the active space', () => {
    expect(ModelRebuildStateSchema.parse(idle())).toEqual(idle());
    expect(ModelRebuildStateSchema.parse(building())).toEqual(building());
    expect(ModelRebuildStateSchema.safeParse({ ...building(), progress: { completed: 0, total: 10 } }).success).toBe(true);
    expect(ModelRebuildStateSchema.safeParse({ ...building(), progress: { completed: 10, total: 10 } }).success).toBe(true);
  });

  it.each([
    ['building without progress', { ...building(), progress: null }],
    ['progress without building', { ...idle(), progress: { completed: 0, total: 10 } }],
    ['completed exceeds total', { ...building(), progress: { completed: 11, total: 10 } }],
    ['negative completed', { ...building(), progress: { completed: -1, total: 10 } }],
    ['fractional completed', { ...building(), progress: { completed: 0.5, total: 10 } }],
    ['zero total', { ...building(), progress: { completed: 0, total: 0 } }],
    ['fractional total', { ...building(), progress: { completed: 0, total: 1.5 } }],
    ['extra progress field', { ...building(), progress: { completed: 0, total: 10, extra: true } }],
    ['building the active space', building(target({ space: space('active') }))],
    ['extra state field', { ...idle(), extra: true }],
  ])('rejects %s', (_name, value) => {
    expect(ModelRebuildStateSchema.safeParse(value).success).toBe(false);
  });
});

describe('rebuildDecision', () => {
  it('start: begins a different space when idle', () => {
    expect(rebuildDecision(target(), idle())).toBe('start');
  });

  it('noop: keeps the active space when idle', () => {
    expect(rebuildDecision(target({ space: space('active') }), idle())).toBe('noop');
  });

  it('keep: deduplicates the same request before comparing generations', () => {
    const replay = target({ generation: { presetId: 1, agentGeneration: 0, presetGeneration: 0 } });
    expect(rebuildDecision(replay, building())).toBe('keep');
  });

  it('supersede: replaces request A with newer B and stops the old worker', () => {
    const a = target();
    const b = newer();
    const state = building(a);
    const before = structuredClone(state);
    expect(rebuildDecision(b, state)).toBe('supersede');
    expect(state).toEqual(before);
    const persistedB = building(b);
    expect(isRebuildJobCurrent(a.requestId, persistedB)).toBe(false);
    expect(isRebuildJobCurrent(b.requestId, persistedB)).toBe(true);
  });

  it('discard: ignores A reread after newer B was persisted', () => {
    expect(rebuildDecision(target(), building(newer()))).toBe('discard');
  });

  it('cancel: stops a build when a newer request returns to the active space', () => {
    const state = building();
    expect(rebuildDecision(newer({ space: state.active }), state)).toBe('cancel');
    expect(isRebuildJobCurrent('request-a', idle())).toBe(false);
  });

  it('re-read: refuses different requests with the same generation', () => {
    expect(rebuildDecision(target({ requestId: 'request-b' }), building())).toBe('re-read');
  });

  it('re-reads a preset change without a higher agent counter', () => {
    const changedPreset = newer({ generation: { presetId: 2, agentGeneration: 2, presetGeneration: 99 } });
    expect(rebuildDecision(changedPreset, building())).toBe('re-read');
  });

  it('re-reads conflicting agent and preset counters', () => {
    expect(rebuildDecision(newer({ generation: { presetId: 1, agentGeneration: 3, presetGeneration: 2 } }), building()))
      .toBe('re-read');
  });

  it('keeps a newer request for the same building space without restarting', () => {
    const state = building();
    expect(rebuildDecision(newer({ space: space('space-a') }), state)).toBe('keep');
  });

  it('orders requests before considering their space', () => {
    const state = building(newer());
    expect(rebuildDecision(target({ space: state.active }), state)).toBe('discard');
    expect(rebuildDecision(target({ space: space('space-b') }), state)).toBe('discard');
    expect(rebuildDecision(newer({ requestId: 'request-c', space: state.active }), state)).toBe('re-read');
  });
});

describe('isRebuildJobCurrent', () => {
  it('is true only for the persisted building request', () => {
    expect(isRebuildJobCurrent('request-a', building())).toBe(true);
    expect(isRebuildJobCurrent('request-b', building())).toBe(false);
    expect(isRebuildJobCurrent('request-a', idle())).toBe(false);
  });
});

describe('model rebuild barrel exports', () => {
  it('exports schemas, decisions and helpers', () => {
    expect(barrel.EmbeddingSpaceSchema).toBe(EmbeddingSpaceSchema);
    expect(barrel.ModelRebuildTargetSchema).toBe(ModelRebuildTargetSchema);
    expect(barrel.ModelRebuildStateSchema).toBe(ModelRebuildStateSchema);
    expect(barrel.REBUILD_DECISIONS).toBe(REBUILD_DECISIONS);
    expect(barrel.rebuildDecision).toBe(rebuildDecision);
    expect(barrel.isRebuildJobCurrent).toBe(isRebuildJobCurrent);
    const decisions: readonly RebuildDecision[] = ['start', 'keep', 'supersede', 'cancel', 'discard', 're-read', 'noop'];
    expect(REBUILD_DECISIONS).toEqual(decisions);
  });
});

describe('embeddingRebuildCost', () => {
  const known = (rates: { unit: 'million-input-tokens' | 'character'; amount: number }[]) => ({
    state: 'known' as const, currency: 'USD', rates, source: 'price list', observedAt: '2026-11-07T10:00:00Z',
  });
  const perMillion = known([{ unit: 'million-input-tokens', amount: 0.02 }]);

  it('rounds up to the cent', () => {
    expect(embeddingRebuildCost(2_048_000, perMillion)).toEqual({ amount: 0.05, currency: 'USD', reason: null });
    expect(embeddingRebuildCost(2_000_001, perMillion).amount).toBe(0.05);
  });

  it('does not add a cent for decimal noise', () => {
    expect(embeddingRebuildCost(3_500_000, perMillion).amount).toBe(0.07);
  });

  it('costs nothing for no tokens', () => {
    expect(embeddingRebuildCost(0, perMillion)).toEqual({ amount: 0, currency: 'USD', reason: null });
  });

  it('gives a reason, never a figure, without a per-token rate', () => {
    expect(embeddingRebuildCost(1_000_000, known([{ unit: 'character', amount: 1 }])))
      .toEqual({ amount: null, currency: null, reason: 'tariffa per token non nota' });
  });

  it('keeps the reason of an unknown cost, with a fallback when it is empty', () => {
    expect(embeddingRebuildCost(1, { state: 'unknown', reason: 'no price list' }).reason).toBe('no price list');
    expect(embeddingRebuildCost(1, { state: 'unknown', reason: '' })).toEqual({ amount: null, currency: null, reason: 'tariffa per token non nota' });
  });
});
