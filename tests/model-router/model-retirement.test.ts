import { describe, expect, it } from 'vitest';
import { INTERNAL_TOKEN_HEADER } from '../../src/auth/index.js';
import * as barrel from '../../src/model-router/index.js';
import {
  MODEL_UPGRADE_TARGETS,
  ModelRetirementNoticeSchema,
  ModelUpgradeTargetSchema,
  RetiredModelObservationSchema,
  RetiredObservedAckSchema,
  retirementNoticeKey,
  vaultModelsRetiredObservedContract,
  vaultModelsRetiredObservedPath,
} from '../../src/model-router/model-retirement.js';

const observation = () => ({
  scope: { agentId: 'x9', ownerId: '1', tenantId: '1' },
  slotId: 'agent_chat',
  model: { provider: 'openai', modelId: 'gpt-5.6-luna', protocol: 'responses', adapterId: 'openai-live-delegation' },
  source: 'provider-inventory',
});

const common = () => ({
  target: 'preset',
  targetId: 3,
  slotId: 'agent_chat',
  previousVersion: 4,
  fromModel: 'gpt-5.6-luna',
  reason: 'provider-error',
  at: '2026-11-06T10:00:00Z',
});
const upgraded = () => ({ kind: 'upgraded', ...common(), toModel: 'gpt-5.6-terra', whilePinned: false });
const noSuccessor = () => ({ kind: 'no-successor', ...common(), cause: 'end-of-line' });

describe('RetiredModelObservationSchema', () => {
  it('accepts a valid catalog observation', () => {
    expect(RetiredModelObservationSchema.safeParse(observation()).success).toBe(true);
  });

  it('rejects a provider error and extra fields such as the raw error text', () => {
    expect(RetiredModelObservationSchema.safeParse({ ...observation(), providerError: 'model_not_found' }).success).toBe(false);
    expect(RetiredModelObservationSchema.safeParse({ ...observation(), rawError: 'The model does not exist' }).success).toBe(false);
    expect(RetiredModelObservationSchema.safeParse({ ...observation(), apiKey: 'x' }).success).toBe(false);
  });
});

describe('RetiredObservedAckSchema', () => {
  it('accepts the three outcomes', () => {
    for (const outcome of ['scheduled', 'not-in-table', 'duplicate']) {
      expect(RetiredObservedAckSchema.safeParse({ ok: true, outcome }).success).toBe(true);
    }
  });

  it('rejects an upgrade outcome, ok:false and extra fields', () => {
    expect(RetiredObservedAckSchema.safeParse({ ok: true, outcome: 'upgraded' }).success).toBe(false);
    expect(RetiredObservedAckSchema.safeParse({ ok: false, outcome: 'scheduled' }).success).toBe(false);
    expect(RetiredObservedAckSchema.safeParse({ ok: true, outcome: 'scheduled', extra: 1 }).success).toBe(false);
  });
});

describe('retired-observed contracts', () => {
  it('uses the shared auth headers, never literals', () => {
    expect(vaultModelsRetiredObservedContract.authHeader).toBe(INTERNAL_TOKEN_HEADER);
    expect(vaultModelsRetiredObservedContract.authType).toBe('token');
  });

  it('declares POST with the observation body and the ack response', () => {
    const contract = vaultModelsRetiredObservedContract;
    expect(contract.method).toBe('POST');
    expect(contract.bodySchema).toBe(RetiredModelObservationSchema);
    expect(contract.responseSchema).toBe(RetiredObservedAckSchema);
  });

  it('builds the vault path from a positive id and refuses an invalid one', () => {
    expect(vaultModelsRetiredObservedPath(7)).toBe('/internal/models/retired-observed/7');
    expect(() => vaultModelsRetiredObservedPath(0)).toThrow();
    expect(() => vaultModelsRetiredObservedPath(-1)).toThrow();
    expect(vaultModelsRetiredObservedContract.paramsSchema.safeParse({ vaultAgentId: '7' }).success).toBe(true);
    expect(vaultModelsRetiredObservedContract.paramsSchema.safeParse({ vaultAgentId: '0' }).success).toBe(false);
  });
});

describe('ModelRetirementNoticeSchema', () => {
  it('has the same targets as the model_upgrade_events check', () => {
    expect([...MODEL_UPGRADE_TARGETS]).toEqual(['preset', 'agent']);
    expect(ModelUpgradeTargetSchema.safeParse('tenant').success).toBe(false);
  });

  it('accepts a valid upgraded notice, pinned or not', () => {
    expect(ModelRetirementNoticeSchema.safeParse(upgraded()).success).toBe(true);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), target: 'agent', whilePinned: true }).success).toBe(true);
  });

  it('rejects an upgrade whose successor is the retired model', () => {
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), toModel: 'gpt-5.6-luna' }).success).toBe(false);
  });

  it('accepts a no-successor notice for every cause and rejects toModel on it', () => {
    for (const cause of ['not-in-table', 'end-of-line', 'none-usable']) {
      expect(ModelRetirementNoticeSchema.safeParse({ ...noSuccessor(), cause }).success).toBe(true);
    }
    expect(ModelRetirementNoticeSchema.safeParse({ ...noSuccessor(), toModel: 'gpt-5.6-terra' }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...noSuccessor(), cause: 'unknown' }).success).toBe(false);
  });

  it('rejects an upgraded notice without toModel or whilePinned, and a no-successor one without cause', () => {
    const { toModel: _toModel, ...withoutTo } = upgraded();
    const { whilePinned: _whilePinned, ...withoutPinned } = upgraded();
    const { cause: _cause, ...withoutCause } = noSuccessor();
    expect(ModelRetirementNoticeSchema.safeParse(withoutTo).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse(withoutPinned).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse(withoutCause).success).toBe(false);
  });

  it('rejects a wrong target, a bad kind, bad ids, a bad reason and a time without offset', () => {
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), target: 'tenant' }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), kind: 'removed' }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), targetId: 0 }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), previousVersion: 0 }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), reason: 'guess' }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), at: '2026-11-06T10:00:00' }).success).toBe(false);
    expect(ModelRetirementNoticeSchema.safeParse({ ...upgraded(), extra: 1 }).success).toBe(false);
  });
});

describe('retirementNoticeKey', () => {
  it('gives the same key to two notices of the same row and version', () => {
    const first = ModelRetirementNoticeSchema.parse(upgraded());
    const second = ModelRetirementNoticeSchema.parse({ ...noSuccessor(), at: '2026-11-07T10:00:00Z' });
    expect(retirementNoticeKey(first)).toBe('preset:3:agent_chat:4');
    expect(retirementNoticeKey(second)).toBe(retirementNoticeKey(first));
  });

  it('changes with the version, the row, the slot and the target', () => {
    const base = ModelRetirementNoticeSchema.parse(upgraded());
    const key = retirementNoticeKey(base);
    expect(retirementNoticeKey({ ...base, previousVersion: 5 })).not.toBe(key);
    expect(retirementNoticeKey({ ...base, targetId: 4 })).not.toBe(key);
    expect(retirementNoticeKey({ ...base, slotId: 'memory_extraction' })).not.toBe(key);
    expect(retirementNoticeKey({ ...base, target: 'agent' })).not.toBe(key);
  });
});

describe('barrel', () => {
  it('exports the retirement contracts', () => {
    for (const name of [
      'RetiredModelObservationSchema', 'RetiredObservedAckSchema',
      'vaultModelsRetiredObservedContract', 'vaultModelsRetiredObservedPath', 'MODEL_UPGRADE_TARGETS',
      'ModelUpgradeTargetSchema', 'ModelRetirementNoticeSchema', 'retirementNoticeKey',
    ]) {
      expect((barrel as Record<string, unknown>)[name], name).toBeDefined();
    }
  });
});
